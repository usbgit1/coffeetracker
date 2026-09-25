import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. En local, revisa tu archivo .env.local; en Vercel, revisa Project Settings → Environment Variables (marcando Production) y vuelve a desplegar."
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

// Proxy con inicialización perezosa: así una build sin las variables de
// entorno todavía compila (solo falla si de verdad se llega a consultar
// Supabase), en vez de tumbar el build entero al importar este módulo.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
