-- Esquema para la app de registro de cafés
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.

create table if not exists coffees (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tostador text not null,
  pais text not null,
  region text,
  varietal text,
  proceso text,
  fecha date not null default current_date,
  puntuacion smallint check (puntuacion between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists coffees_fecha_idx on coffees (fecha desc);
create index if not exists coffees_tostador_idx on coffees (tostador);
create index if not exists coffees_pais_idx on coffees (pais);

-- Row Level Security
-- La app no tiene login (uso personal), así que se habilita acceso público
-- de lectura/escritura a través de la clave "anon". No compartas la URL
-- de la app si no quieres que otras personas puedan añadir o borrar cafés.
alter table coffees enable row level security;

create policy "Acceso público de lectura" on coffees
  for select using (true);

create policy "Acceso público de escritura" on coffees
  for insert with check (true);

create policy "Acceso público de actualización" on coffees
  for update using (true) with check (true);

create policy "Acceso público de borrado" on coffees
  for delete using (true);
