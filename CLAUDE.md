@AGENTS.md

# Coffee Tracker

App personal (una sola persona, sin login) para registrar los cafés que compra el usuario. Next.js 16 (App Router) + Tailwind v4 + Supabase + Vercel. Interfaz y conversación en **español**.

## Cómo trabajar con el usuario
- **Pedir confirmación antes de cada `git push`** (la confirmación de un push no vale para el siguiente). Commit local sí se puede hacer sin preguntar.
- Cuando el usuario diga "pregúntame antes de hacer cambios", preguntar con opciones antes de tocar el diseño.
- Tras cambios de UI, comprobarlos en el navegador (`preview_start` con la config `cafe-tracker-dev`) y parar el servidor al terminar.

## Dónde está todo
- Producción: https://coffeetracker-three.vercel.app/ (Vercel, despliega solo con cada push a `main`).
- Repo: https://github.com/usbgit1/coffeetracker (rama `main`).
- Supabase: proyecto `mehigieuswrnbzjilzvw` (URL `https://mehigieuswrnbzjilzvw.supabase.co`). Las claves reales están en `.env.local` (ignorado por git) y en Vercel → Environment Variables.
- Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (esta contiene la clave `sb_publishable_...`). En Vercel hay que crearlas con tipo **Config** (si no, el aviso de prefijo `NEXT_PUBLIC_` bloquea el guardado) y para todos los entornos.

## Base de datos (Supabase)
- Tabla `coffees`; esquema en `supabase/schema.sql`. Sin autenticación a propósito: políticas RLS públicas de select/insert/update/delete para la clave anon.
- Migraciones **ya aplicadas** por el usuario: `001_add_region.sql`, `002_puntuacion_opcional_y_edicion.sql`.
- Yo no puedo ejecutar SQL en Supabase: cualquier cambio de esquema = nuevo archivo en `supabase/migrations/` (numerado) + pedir al usuario que lo ejecute en el SQL Editor, y actualizar `schema.sql`.
- `puntuacion` es opcional (null = "Sin puntuar"; el formulario envía 0 cuando no se elige).

## Decisiones no obvias del código
- `src/lib/supabase.ts` crea el cliente de forma perezosa (Proxy): así `next build` no falla si faltan las variables de entorno; el error solo aparece al consultar.
- `addCoffee` devuelve los valores enviados cuando falla y `CoffeeForm` los usa como `defaultValue`: sin eso el formulario se vaciaba tras cualquier error.
- `updateCoffee` hace `.select()` y trata 0 filas como error: sin política UPDATE, Supabase devuelve "éxito" sin cambiar nada.
- Histórico (`HistoricoList.tsx`): tabla con orden por clic en encabezado y filtros desplegables bajo el encabezado, todo en cliente. Editar abre `EditCoffeeForm` dentro de la tabla.
- Dashboard: se quitaron a petición del usuario la tarjeta de puntuación media y los gráficos "por mes" y "distribución de puntuaciones". No volver a añadirlos.
- Navegación en este orden: Dashboard (`/dashboard`), Registrar (`/registrar`), Histórico (`/historico`). La raíz `/` redirige a `/dashboard`. Sin footer. Los filtros del Dashboard van en una sola línea (`flex-nowrap`).

## Diseño
- Paleta café en `src/app/globals.css` (`cream`, `latte`, `caramel`, `coffee`, `coffee-dark`, `espresso`, `gold`); fuentes Inter + Fraunces (títulos).
- Botón principal: `bg-caramel hover:bg-coffee` (el usuario pidió un tono suave, no marrón oscuro). Títulos de página fuera de la caja, igual en las tres pantallas.
- Icono de marca: grano de café SVG (`components/icons/CoffeeBeanIcon.tsx`). Título de la web: "Coffee Tracker".

## Entorno Windows
- Node.js se instaló con winget; las terminales abiertas antes de eso no ven `npm` (abrir una nueva).
- Git: autor local `usbgit1@users.noreply.github.com` (GitHub rechaza el email real por privacidad, error GH007).
- La config de preview está en `C:\Users\urko\claude nirea\.claude\launch.json` (carpeta padre) y lanza `node.exe` con el binario de Next directamente, porque `npm` no está en el PATH de esa app. Si el puerto 3000 está ocupado por un `node.exe` huérfano, matarlo antes de arrancar.
- Con el viewport emulado, los clics por `ref` caen desplazados: usar JavaScript o resetear con `resize_window` preset `desktop`.
