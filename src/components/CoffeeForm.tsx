"use client";

import { useActionState, useState } from "react";
import { addCoffee, type ActionState } from "@/lib/actions";
import { PROCESOS_COMUNES, VARIETALES_COMUNES } from "@/types/coffee";
import { StarInput } from "@/components/StarRating";

const initialState: ActionState = { success: false, message: "" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CoffeeForm() {
  const [state, formAction, pending] = useActionState(addCoffee, initialState);
  const [formKey, setFormKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.success) {
      setFormKey((k) => k + 1);
    }
  }

  // Si el guardado falla, reusamos lo que el usuario ya había escrito
  // (el propio server action nos lo devuelve) para no perder el trabajo.
  const values = state.values;

  return (
    <div className="bg-white/60 border border-latte/50 rounded-2xl p-6 sm:p-8 shadow-sm max-w-xl">
      <h1
        className="text-2xl text-coffee-dark mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Registrar un nuevo café
      </h1>
      <p className="text-sm text-coffee/70 mb-6">
        Anota los datos del café que acabas de comprar.
      </p>

      <form key={formKey} action={formAction} className="space-y-4">
        <Field label="Nombre del café" required>
          <input
            name="nombre"
            required
            defaultValue={values?.nombre}
            placeholder="Ej. Finca El Paraíso"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tostador" required>
            <input
              name="tostador"
              required
              defaultValue={values?.tostador}
              placeholder="Ej. Hola Coffee"
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="País de origen" required>
              <input
                name="pais"
                required
                defaultValue={values?.pais}
                placeholder="Ej. Colombia"
                className="input"
              />
            </Field>
            <Field label="Región">
              <input
                name="region"
                defaultValue={values?.region}
                placeholder="Ej. Huila"
                className="input"
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Varietal">
            <input
              name="varietal"
              list="varietales"
              defaultValue={values?.varietal}
              placeholder="Ej. Caturra"
              className="input"
            />
            <datalist id="varietales">
              {VARIETALES_COMUNES.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </Field>
          <Field label="Proceso">
            <input
              name="proceso"
              list="procesos"
              defaultValue={values?.proceso}
              placeholder="Ej. Lavado"
              className="input"
            />
            <datalist id="procesos">
              {PROCESOS_COMUNES.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Field label="Fecha de compra" required>
            <input
              type="date"
              name="fecha"
              required
              defaultValue={values?.fecha || todayISO()}
              className="input"
            />
          </Field>
          <Field label="Puntuación">
            <StarInput name="puntuacion" defaultValue={values?.puntuacion} />
          </Field>
        </div>

        {state.message && (
          <p
            className={`text-sm rounded-md px-3 py-2 ${
              state.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto bg-coffee-dark hover:bg-espresso disabled:opacity-60 text-cream font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {pending ? "Guardando…" : "Guardar café"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-coffee-dark mb-1">
        {label}
        {required && <span className="text-caramel"> *</span>}
      </span>
      {children}
    </label>
  );
}
