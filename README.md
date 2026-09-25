# Coffee Tracker

App personal para registrar los cafés que compras: nombre, tostador, país, región, varietal, proceso, fecha y puntuación (1-5 estrellas). Incluye un histórico y un dashboard con filtros y gráficos.

**Stack:** Next.js (App Router) + Tailwind CSS + Supabase (Postgres) + Vercel. Sin login: cualquiera con el enlace puede ver y añadir cafés, así que no compartas la URL públicamente si quieres mantenerlo privado.

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita (puedes registrarte con tu email o con GitHub).
2. Pulsa **New project**, elige una organización, ponle un nombre (p. ej. `cafe-tracker`), define una contraseña de base de datos (guárdala, no la necesitarás para esta app pero Supabase la pide) y elige una región cercana.
3. Espera 1-2 minutos a que se aprovisione el proyecto.
4. En el menú lateral, abre **SQL Editor** → **New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) de este repo, y pulsa **Run**. Esto crea la tabla `coffees` con sus políticas de acceso.
5. Consigue tu URL y clave de dos formas posibles (Supabase cambió la interfaz, usa la que veas disponible):
   - **Más fácil:** pulsa el botón **Connect** (arriba del proyecto) → te muestra la **Project URL** y la **publishable key** listas para copiar.
   - **Alternativa:** icono de engranaje → **Project Settings** → **API Keys** (ya no se llama solo "API"). Ahí está la **Project URL** y, más abajo, la clave **publishable** (`sb_publishable_...`) o, si tu proyecto es más antiguo, la **anon public** (`eyJ...`).
   - Copia esos dos valores:
     - **Project URL** → es tu `NEXT_PUBLIC_SUPABASE_URL`
     - **publishable key** (o **anon public key**) → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configurar el proyecto en local

1. Instala las dependencias (ya están instaladas si has seguido el desarrollo, pero por si acaso):
   ```bash
   npm install
   ```
2. Copia `.env.local.example` a `.env.local` y rellena los dos valores con los que copiaste de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica
   ```
3. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) y prueba a registrar un café. Debería aparecer en **Histórico** y **Dashboard**.

## 3. Publicar en Vercel

1. Crea una cuenta gratuita en [vercel.com](https://vercel.com) (puedes usar tu cuenta de GitHub para entrar más rápido).
2. Sube este proyecto a un repositorio de GitHub (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Mi Diario de Café"
   git branch -M main
   git remote add origin <url-de-tu-repo-en-github>
   git push -u origin main
   ```
3. En Vercel, pulsa **Add New → Project**, importa el repositorio de GitHub.
4. Vercel detectará que es un proyecto Next.js automáticamente. Antes de darle a "Deploy", añade las variables de entorno (sección **Environment Variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (los mismos valores que usaste en `.env.local`)
5. Pulsa **Deploy**. En 1-2 minutos tendrás tu app publicada en una URL tipo `https://cafe-tracker-tu-usuario.vercel.app`.

Cada vez que hagas `git push` a `main`, Vercel volverá a desplegar la app automáticamente.

## Estructura del proyecto

- `src/app/page.tsx` — pantalla de registro de un nuevo café (página de inicio).
- `src/app/historico/page.tsx` — listado histórico de cafés registrados, con buscador y borrado.
- `src/app/dashboard/page.tsx` — dashboard con filtros (tostador, país, varietal, proceso, puntuación, fechas) y gráficos.
- `src/lib/actions.ts` — Server Actions para insertar y borrar cafés en Supabase.
- `src/lib/queries.ts` — consulta de lectura de cafés desde Supabase.
- `supabase/schema.sql` — esquema SQL de la tabla `coffees` y sus políticas de acceso.

## Notas

- Al no haber login, cualquiera con la URL desplegada puede añadir o borrar cafés. Si más adelante quieres protegerlo, se puede añadir Supabase Auth.
- Los campos `varietal` y `proceso` son opcionales y tienen sugerencias automáticas (datalist) con valores comunes, pero aceptan texto libre.
