"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Coffee } from "@/types/coffee";
import StatCard from "@/components/dashboard/StatCard";

const CHART_COLORS = ["#6b4226", "#b5763b", "#c99a3c", "#d9bd9a", "#4a2d19"];

function uniqueSorted(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort(
    (a, b) => a.localeCompare(b, "es")
  );
}

interface Filters {
  tostador: string;
  pais: string;
  region: string;
  varietal: string;
  proceso: string;
  puntuacionMin: string;
  desde: string;
  hasta: string;
}

const emptyFilters: Filters = {
  tostador: "",
  pais: "",
  region: "",
  varietal: "",
  proceso: "",
  puntuacionMin: "",
  desde: "",
  hasta: "",
};

export default function DashboardClient({ coffees }: { coffees: Coffee[] }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const options = useMemo(
    () => ({
      tostadores: uniqueSorted(coffees.map((c) => c.tostador)),
      paises: uniqueSorted(coffees.map((c) => c.pais)),
      regiones: uniqueSorted(coffees.map((c) => c.region)),
      varietales: uniqueSorted(coffees.map((c) => c.varietal)),
      procesos: uniqueSorted(coffees.map((c) => c.proceso)),
    }),
    [coffees]
  );

  const filtered = useMemo(() => {
    return coffees.filter((c) => {
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
      if (filters.desde && c.fecha < filters.desde) return false;
      if (filters.hasta && c.fecha > filters.hasta) return false;
      return true;
    });
  }, [coffees, filters]);

  const stats = useMemo(() => {
    if (filtered.length === 0) {
      return { total: 0, tostadorFavorito: "—", paisFavorito: "—" };
    }
    const tostadorFavorito = topEntry(filtered.map((c) => c.tostador));
    const paisFavorito = topEntry(filtered.map((c) => c.pais));
    return {
      total: filtered.length,
      tostadorFavorito,
      paisFavorito,
    };
  }, [filtered]);

  const topTostadores = useMemo(
    () => topN(filtered.map((c) => c.tostador), 5),
    [filtered]
  );

  const topPaises = useMemo(
    () => topN(filtered.map((c) => c.pais), 6),
    [filtered]
  );

  if (coffees.length === 0) {
    return (
      <div className="text-center py-16 text-coffee/60 bg-white/40 border border-dashed border-latte rounded-2xl">
        Todavía no hay datos para mostrar. Registra tu primer café para ver el
        dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1
        className="text-2xl text-coffee-dark"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Dashboard
      </h1>

      <FiltersBar filters={filters} setFilters={setFilters} options={options} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Cafés registrados" value={stats.total} />
        <StatCard label="Tostador favorito" value={stats.tostadorFavorito} />
        <StatCard label="País más frecuente" value={stats.paisFavorito} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-coffee/60 bg-white/40 border border-dashed border-latte rounded-2xl">
          Ningún café coincide con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Top tostadores">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topTostadores} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5d5bd" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#6b4226" }} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={110}
                  tick={{ fontSize: 12, fill: "#6b4226" }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cantidad" fill="#b5763b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Países de origen">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie
                  data={topPaises}
                  dataKey="cantidad"
                  nameKey="nombre"
                  outerRadius={90}
                  label={({ name }) => name}
                >
                  {topPaises.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function FiltersBar({
  filters,
  setFilters,
  options,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  options: {
    tostadores: string[];
    paises: string[];
    regiones: string[];
    varietales: string[];
    procesos: string[];
  };
}) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white/60 border border-latte/50 rounded-xl p-3 flex flex-nowrap gap-2 items-end">
      <Select
        label="Tostador"
        value={filters.tostador}
        onChange={(v) => update("tostador", v)}
        options={options.tostadores}
      />
      <Select
        label="País"
        value={filters.pais}
        onChange={(v) => update("pais", v)}
        options={options.paises}
      />
      <Select
        label="Región"
        value={filters.region}
        onChange={(v) => update("region", v)}
        options={options.regiones}
      />
      <Select
        label="Varietal"
        value={filters.varietal}
        onChange={(v) => update("varietal", v)}
        options={options.varietales}
      />
      <Select
        label="Proceso"
        value={filters.proceso}
        onChange={(v) => update("proceso", v)}
        options={options.procesos}
      />
      <Select
        label="Puntuación mínima"
        value={filters.puntuacionMin}
        onChange={(v) => update("puntuacionMin", v)}
        options={["1", "2", "3", "4", "5"]}
        formatOption={(v) => `${v} ★`}
      />
      <label className="block min-w-0 flex-1">
        <span className="block text-xs font-medium text-coffee-dark mb-1">
          Desde
        </span>
        <input
          type="date"
          value={filters.desde}
          onChange={(e) => update("desde", e.target.value)}
          className="input py-1.5 px-2 text-xs w-full"
        />
      </label>
      <label className="block min-w-0 flex-1">
        <span className="block text-xs font-medium text-coffee-dark mb-1">
          Hasta
        </span>
        <input
          type="date"
          value={filters.hasta}
          onChange={(e) => update("hasta", e.target.value)}
          className="input py-1.5 px-2 text-xs w-full"
        />
      </label>
      {(filters.tostador ||
        filters.pais ||
        filters.region ||
        filters.varietal ||
        filters.proceso ||
        filters.puntuacionMin ||
        filters.desde ||
        filters.hasta) && (
        <button
          onClick={() => setFilters(emptyFilters)}
          className="text-xs text-caramel hover:text-coffee-dark underline whitespace-nowrap pb-2"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function Select({
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
    <label className="block min-w-0 flex-1">
      <span className="block text-xs font-medium text-coffee-dark mb-1 truncate">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input py-1.5 px-2 text-xs w-full"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatOption ? formatOption(opt) : opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 border border-latte/50 rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-coffee-dark mb-2">{title}</h2>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: "#faf3e9",
  border: "1px solid #d9bd9a",
  borderRadius: 8,
  fontSize: 13,
  color: "#3b2314",
};

function topEntry(values: string[]): string {
  if (values.length === 0) return "—";
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
}

function topN(
  values: string[],
  n: number
): { nombre: string; cantidad: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, n);
}
