"use client";

import { useState, useTransition } from "react";
import { updateCoffee } from "@/lib/actions";
import { PROCESOS_COMUNES, VARIETALES_COMUNES, type Coffee } from "@/types/coffee";
import { StarInput } from "@/components/StarRating";

export default function EditCoffeeForm({
  coffee,
  onCancel,
  onSaved,
}: {
  coffee: Coffee;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateCoffee(coffee.id, formData);
      if (result.success) {
        onSaved();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="bg-white/80 border-l-4 border-caramel px-5 py-4">
      <form action={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre del café">
            <input
              name="nombre"
              required
              defaultValue={coffee.nombre}
              className="input"
            />
          </Field>
          <Field label="Tostador">
            <input
              name="tostador"
              required
              defaultValue={coffee.tostador}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="País">
            <input
              name="pais"
              required
              defaultValue={coffee.pais}
              className="input"
            />
          </Field>
          <Field label="Región">
            <input
              name="region"
              defaultValue={coffee.region ?? ""}
              className="input"
            />
          </Field>
          <Field label="Varietal">
            <input
              name="varietal"
              list="edit-varietales"
              defaultValue={coffee.varietal ?? ""}
              className="input"
            />
            <datalist id="edit-varietales">
              {VARIETALES_COMUNES.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </Field>
          <Field label="Proceso">
            <input
              name="proceso"
              list="edit-procesos"
              defaultValue={coffee.proceso ?? ""}
              className="input"
            />
            <datalist id="edit-procesos">
              {PROCESOS_COMUNES.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <Field label="Fecha de compra">
            <input
              type="date"
              name="fecha"
              required
              defaultValue={coffee.fecha}
              className="input"
            />
          </Field>
          <Field label="Puntuación">
            <StarInput name="puntuacion" defaultValue={coffee.puntuacion} />
          </Field>
        </div>

        {error && (
          <p className="text-sm rounded-md px-3 py-2 bg-red-100 text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-caramel hover:bg-coffee disabled:opacity-60 text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-sm text-coffee/70 hover:text-coffee px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-coffee-dark mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
