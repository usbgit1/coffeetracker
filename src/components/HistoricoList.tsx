"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Coffee } from "@/types/coffee";
import { deleteCoffee } from "@/lib/actions";
import { StarDisplay } from "@/components/StarRating";
import EditCoffeeForm from "@/components/EditCoffeeForm";

type SortOption =
  | "fecha-desc"
  | "fecha-asc"
  | "nombre-asc"
  | "nombre-desc"
  | "tostador-asc"
  | "tostador-desc"
  | "pais-asc"
  | "pais-desc"
  | "puntuacion-desc"
  | "puntuacion-asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "fecha-desc", label: "Fecha (más reciente primero)" },
  { value: "fecha-asc", label: "Fecha (más antiguo primero)" },
  { value: "nombre-asc", label: "Nombre (A-Z)" },
  { value: "nombre-desc", label: "Nombre (Z-A)" },
  { value: "tostador-asc", label: "Tostador (A-Z)" },
  { value: "tostador-desc", label: "Tostador (Z-A)" },
  { value: "pais-asc", label: "País (A-Z)" },
  { value: "pais-desc", label: "País (Z-A)" },
  { value: "puntuacion-desc", label: "Puntuación (mayor a menor)" },
  { value: "puntuacion-asc", label: "Puntuación (menor a mayor)" },
];

function sortCoffees(coffees: Coffee[], sort: SortOption): Coffee[] {
  const sorted = [...coffees];

  function byPuntuacion(a: Coffee, b: Coffee, ascending: boolean) {
    if (a.puntuacion === null) return 1;
    if (b.puntuacion === null) return -1;
    return ascending ? a.puntuacion - b.puntuacion : b.puntuacion - a.puntuacion;
  }

  switch (sort) {
    case "fecha-desc":
      sorted.sort((a, b) => b.fecha.localeCompare(a.fecha));
      break;
    case "fecha-asc":
      sorted.sort((a, b) => a.fecha.localeCompare(b.fecha));
      break;
    case "nombre-asc":
      sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      break;
    case "nombre-desc":
      sorted.sort((a, b) => b.nombre.localeCompare(a.nombre, "es"));
      break;
    case "tostador-asc":
      sorted.sort((a, b) => a.tostador.localeCompare(b.tostador, "es"));
      break;
    case "tostador-desc":
      sorted.sort((a, b) => b.tostador.localeCompare(a.tostador, "es"));
      break;
    case "pais-asc":
      sorted.sort((a, b) => a.pais.localeCompare(b.pais, "es"));
      break;
    case "pais-desc":
      sorted.sort((a, b) => b.pais.localeCompare(a.pais, "es"));
      break;
    case "puntuacion-desc":
      sorted.sort((a, b) => byPuntuacion(a, b, false));
      break;
    case "puntuacion-asc":
      sorted.sort((a, b) => byPuntuacion(a, b, true));
      break;
  }

  return sorted;
}

export default function HistoricoList({ coffees }: { coffees: Coffee[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("fecha-desc");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coffees;
    return coffees.filter((c) =>
      [c.nombre, c.tostador, c.pais, c.region, c.varietal, c.proceso]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [coffees, query]);

  const sorted = useMemo(() => sortCoffees(filtered, sort), [filtered, sort]);

  function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Borrar "${nombre}" del histórico?`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteCoffee(id);
      setDeletingId(null);
      router.refresh();
    });
  }

  if (coffees.length === 0) {
    return (
      <EmptyState message="Todavía no has registrado ningún café. ¡Anota el primero desde 'Registrar'!" />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1
          className="text-2xl text-coffee-dark"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Histórico de cafés
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, tostador, país…"
            className="input max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm text-coffee-dark">
            Ordenar por
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="input py-1.5 text-sm w-auto"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="Ningún café coincide con tu búsqueda." />
      ) : (
        <ul className="space-y-3">
          {sorted.map((c) =>
            editingId === c.id ? (
              <EditCoffeeForm
                key={c.id}
                coffee={c}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <li
                key={c.id}
                className="bg-white/60 border border-latte/50 rounded-xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 shadow-sm"
              >
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold text-coffee-dark">{c.nombre}</p>
                  <p className="text-sm text-coffee/70">
                    {c.tostador} · {c.pais}
                    {c.region ? ` (${c.region})` : ""}
                    {c.varietal ? ` · ${c.varietal}` : ""}
                    {c.proceso ? ` · ${c.proceso}` : ""}
                  </p>
                </div>
                <div className="text-sm text-coffee/70 w-28">
                  {formatDate(c.fecha)}
                </div>
                <StarDisplay value={c.puntuacion} />
                <button
                  onClick={() => setEditingId(c.id)}
                  className="text-sm text-caramel hover:text-coffee-dark transition-colors"
                  aria-label={`Editar ${c.nombre}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.nombre)}
                  disabled={isPending && deletingId === c.id}
                  className="text-sm text-red-700/70 hover:text-red-700 disabled:opacity-40 transition-colors"
                  aria-label={`Borrar ${c.nombre}`}
                >
                  {isPending && deletingId === c.id ? "Borrando…" : "Borrar"}
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-coffee/60 bg-white/40 border border-dashed border-latte rounded-2xl">
      {message}
    </div>
  );
}
