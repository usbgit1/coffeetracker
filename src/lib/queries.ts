import { supabase } from "@/lib/supabase";
import type { Coffee } from "@/types/coffee";

export async function getCoffees(): Promise<Coffee[]> {
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los cafés: ${error.message}`);
  }

  return data ?? [];
}
