-- Añade la columna "región" a una base de datos que ya tenía la tabla coffees creada.
-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase (una sola vez).

alter table coffees add column if not exists region text;
