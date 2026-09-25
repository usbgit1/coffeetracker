"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Coffee } from "@/types/coffee";
import { deleteCoffee } from "@/lib/actions";
import { StarDisplay } from "@/components/StarRating";
import EditCoffeeForm from "@/components/EditCoffeeForm";

export default function HistoricoList({ coffees }: { coffees: Coffee[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
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
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, tostador, país…"
          className="input max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Ningún café coincide con tu búsqueda." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) =>
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
