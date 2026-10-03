"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Coffee } from "@/types/coffee";
import { deleteCoffee } from "@/lib/actions";
import { StarDisplay } from "@/components/StarRating";
import EditCoffeeForm from "@/components/EditCoffeeForm";

type SortKey =
  | "nombre"
  | "tostador"
  | "pais"
  | "region"
  | "varietal"
  | "proceso"
  | "fecha"
  | "puntuacion";
type SortDir = "asc" | "desc";

type FilterKey =
  | "tostador"
  | "pais"
  | "region"
  | "varietal"
  | "proceso"
  | "puntuacionMin";
type Filters = Record<FilterKey, string>;

const emptyFilters: Filters = {
  tostador: "",
  pais: "",
  region: "",
  varietal: "",
  proceso: "",
  puntuacionMin: "",
};

const COLUMNS: { key: SortKey; label: string; filter?: FilterKey }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "tostador", label: "Tostador", filter: "tostador" },
  { key: "pais", label: "País", filter: "pais" },
  { key: "region", label: "Región", filter: "region" },
  { key: "varietal", label: "Varietal", filter: "varietal" },
  { key: "proceso", label: "Proceso", filter: "proceso" },
  { key: "fecha", label: "Fecha" },
  { key: "puntuacion", label: "Puntuación", filter: "puntuacionMin" },
];

function uniqueSorted(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort(
    (a, b) => a.localeCompare(b, "es")
  );
}

function compareCoffees(a: Coffee, b: Coffee, key: SortKey, dir: SortDir) {
  const av = a[key];
  const bv = b[key];
  const aEmpty = av === null || av === "";
  const bEmpty = bv === null || bv === "";

  // Los valores vacíos van siempre al final, sea cual sea el sentido.
  if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;

  if (!aEmpty) {
    const result =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "es");
    if (result !== 0) return dir === "asc" ? result : -result;
  }

  return b.fecha.localeCompare(a.fecha) || b.created_at.localeCompare(a.created_at);
}

export default function HistoricoList({ coffees }: { coffees: Coffee[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const options = useMemo(
    (): Record<Exclude<FilterKey, "puntuacionMin">, string[]> => ({
      tostador: uniqueSorted(coffees.map((c) => c.tostador)),
      pais: uniqueSorted(coffees.map((c) => c.pais)),
      region: uniqueSorted(coffees.map((c) => c.region)),
      varietal: uniqueSorted(coffees.map((c) => c.varietal)),
      proceso: uniqueSorted(coffees.map((c) => c.proceso)),
    }),
    [coffees]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coffees
      .filter((c) => {
        if (filters.tostador && c.tostador !== filters.tostador) return false;
        if (filters.pais && c.pais !== filters.pais) return false;
        if (filters.region && c.region !== filters.region) return false;
        if (filters.varietal && c.varietal !== filters.varietal) return false;
        if (filters.proceso && c.proceso !== filters.proceso) return false;
        if (
          filters.puntuacionMin &&
          (c.puntuacion === null || c.puntuacion < Number(filters.puntuacionMin))
        )
          return false;
        if (!q) return true;
        return [c.nombre, c.tostador, c.pais, c.region, c.varietal, c.proceso]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q));
      })
      .sort((a, b) => compareCoffees(a, b, sortKey, sortDir));
  }, [coffees, query, filters, sortKey, sortDir]);

  const hasActiveFilters = Object.values(filters).some(Boolean) || query !== "";

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "fecha" || key === "puntuacion" ? "desc" : "asc");
    }
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setQuery("");
  }

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
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <h1
          className="text-2xl text-coffee-dark"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Histórico de cafés
        </h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, tostador, país…"
          className="input max-w-xs"
        />
      </div>

      <div className="flex items-center gap-3 mb-4 text-sm text-coffee/70 min-h-6">
        <span>
          {visible.length} de {coffees.length} cafés
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-caramel hover:text-coffee-dark underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="bg-white/60 border border-latte/50 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-cream-dark/60 text-coffee-dark">
            <tr>
              {COLUMNS.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="px-3 pt-3 pb-1 text-left font-semibold whitespace-nowrap"
                  >
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-caramel transition-colors"
                    >
                      {col.label}
                      <span
                        className={active ? "text-caramel" : "text-coffee/30"}
                        aria-hidden="true"
                      >
                        {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="px-3 pt-3 pb-1" />
            </tr>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-3 pb-3 pt-0 font-normal">
                  {col.filter === "puntuacionMin" ? (
                    <FilterSelect
                      label="Puntuación mínima"
                      value={filters.puntuacionMin}
                      onChange={(v) =>
                        setFilters((f) => ({ ...f, puntuacionMin: v }))
                      }
                      options={["1", "2", "3", "4", "5"]}
                      formatOption={(v) => `≥ ${v} ★`}
                    />
                  ) : col.filter ? (
                    <FilterSelect
                      label={`Filtrar por ${col.label.toLowerCase()}`}
                      value={filters[col.filter]}
                      onChange={(v) =>
                        setFilters((f) => ({ ...f, [col.filter!]: v }))
                      }
                      options={options[col.filter]}
                    />
                  ) : null}
                </th>
              ))}
              <th className="px-3 pb-3 pt-0" />
            </tr>
          </thead>
          <tbody className="divide-y divide-latte/40">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="text-center py-12 text-coffee/60"
                >
                  Ningún café coincide con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              visible.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id}>
                    <td colSpan={COLUMNS.length + 1} className="p-0">
                      <EditCoffeeForm
                        coffee={c}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          router.refresh();
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={c.id}
                    className="hover:bg-cream-dark/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-semibold text-coffee-dark">
                      {c.nombre}
                    </td>
                    <td className="px-3 py-2">{c.tostador}</td>
                    <td className="px-3 py-2">{c.pais}</td>
                    <Optional value={c.region} />
                    <Optional value={c.varietal} />
                    <Optional value={c.proceso} />
                    <td className="px-3 py-2 whitespace-nowrap text-coffee/70">
                      {formatDate(c.fecha)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StarDisplay value={c.puntuacion} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right space-x-3">
                      <button
                        onClick={() => setEditingId(c.id)}
                        className="text-caramel hover:text-coffee-dark transition-colors"
                        aria-label={`Editar ${c.nombre}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.nombre)}
                        disabled={isPending && deletingId === c.id}
                        className="text-red-700/70 hover:text-red-700 disabled:opacity-40 transition-colors"
                        aria-label={`Borrar ${c.nombre}`}
                      >
                        {isPending && deletingId === c.id
                          ? "Borrando…"
                          : "Borrar"}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  formatOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  formatOption?: (v: string) => string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input py-1 px-2 text-xs w-full min-w-[5.5rem] max-w-[10rem]"
    >
      <option value="">Todos</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {formatOption ? formatOption(opt) : opt}
        </option>
      ))}
    </select>
  );
}

function Optional({ value }: { value: string | null }) {
  return (
    <td className="px-3 py-2">
      {value ? value : <span className="text-coffee/30">—</span>}
    </td>
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
