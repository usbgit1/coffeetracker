export interface Coffee {
  id: string;
  nombre: string;
  tostador: string;
  pais: string;
  region: string | null;
  varietal: string | null;
  proceso: string | null;
  fecha: string; // ISO date (YYYY-MM-DD)
  puntuacion: number | null; // 1-5, o null si no se ha puntuado
  created_at: string;
}

export type NewCoffee = Omit<Coffee, "id" | "created_at">;

export const PROCESOS_COMUNES = [
  "Lavado",
  "Natural",
  "Honey",
  "Anaeróbico",
  "Semi-lavado",
  "Fermentación carbónica",
] as const;

export const VARIETALES_COMUNES = [
  "Bourbon",
  "Typica",
  "Caturra",
  "Catuaí",
  "Geisha",
  "Pacamara",
  "SL28",
  "SL34",
  "Java",
] as const;
