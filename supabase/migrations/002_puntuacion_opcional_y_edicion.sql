-- 1. Permite guardar un café sin puntuación.
-- 2. Añade el permiso de UPDATE necesario para poder editar cafés ya registrados.
-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase (una sola vez).

alter table coffees alter column puntuacion drop not null;

drop policy if exists "Acceso público de actualización" on coffees;
create policy "Acceso público de actualización" on coffees
  for update using (true) with check (true);
