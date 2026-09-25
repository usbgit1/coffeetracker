"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface FormValues {
  nombre: string;
  tostador: string;
  pais: string;
  region: string;
  varietal: string;
  proceso: string;
  fecha: string;
  puntuacion: number;
}

export interface ActionState {
  success: boolean;
  message: string;
  values?: FormValues;
}

interface ParsedCoffee {
  nombre: string;
  tostador: string;
  pais: string;
  region: string | null;
  varietal: string | null;
  proceso: string | null;
  fecha: string;
  puntuacion: number | null;
}

function parseCoffeeForm(
  formData: FormData
): { data: ParsedCoffee; raw: FormValues } | { error: string; raw: FormValues } {
  const raw: FormValues = {
    nombre: String(formData.get("nombre") ?? "").trim(),
    tostador: String(formData.get("tostador") ?? "").trim(),
    pais: String(formData.get("pais") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim(),
    varietal: String(formData.get("varietal") ?? "").trim(),
    proceso: String(formData.get("proceso") ?? "").trim(),
    fecha: String(formData.get("fecha") ?? "").trim(),
    puntuacion: Number(formData.get("puntuacion")) || 0,
  };

  if (!raw.nombre || !raw.tostador || !raw.pais || !raw.fecha) {
    return { error: "Nombre, tostador, país y fecha son obligatorios.", raw };
  }

  let puntuacion: number | null = null;
  if (raw.puntuacion > 0) {
    if (!Number.isInteger(raw.puntuacion) || raw.puntuacion > 5) {
      return { error: "La puntuación debe estar entre 1 y 5.", raw };
    }
    puntuacion = raw.puntuacion;
  }

  return {
    data: {
      nombre: raw.nombre,
      tostador: raw.tostador,
      pais: raw.pais,
      region: raw.region || null,
      varietal: raw.varietal || null,
      proceso: raw.proceso || null,
      fecha: raw.fecha,
      puntuacion,
    },
    raw,
  };
}

export async function addCoffee(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseCoffeeForm(formData);
  if ("error" in parsed) {
    return { success: false, message: parsed.error, values: parsed.raw };
  }

  const { error } = await supabase.from("coffees").insert(parsed.data);

  if (error) {
    return {
      success: false,
      message: `Error al guardar: ${error.message}`,
      values: parsed.raw,
    };
  }

  revalidatePath("/historico");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `¡"${parsed.data.nombre}" registrado correctamente!`,
  };
}

export async function updateCoffee(
  id: string,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseCoffeeForm(formData);
  if ("error" in parsed) {
    return { success: false, message: parsed.error, values: parsed.raw };
  }

  const { data, error } = await supabase
    .from("coffees")
    .update(parsed.data)
    .eq("id", id)
    .select();

  if (error) {
    return {
      success: false,
      message: `Error al actualizar: ${error.message}`,
      values: parsed.raw,
    };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      message:
        "No se pudo actualizar: falta la política de UPDATE en la tabla 'coffees' de Supabase. Ejecuta la migración 002.",
      values: parsed.raw,
    };
  }

  revalidatePath("/historico");
  revalidatePath("/dashboard");

  return { success: true, message: "Café actualizado correctamente." };
}

export async function deleteCoffee(id: string): Promise<void> {
  const { error } = await supabase.from("coffees").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo borrar el café: ${error.message}`);
  }

  revalidatePath("/historico");
  revalidatePath("/dashboard");
}
