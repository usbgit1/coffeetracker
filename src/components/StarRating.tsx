"use client";

import { useState } from "react";

export function StarDisplay({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-coffee/50 text-sm">Sin puntuar</span>;
  }

  return (
    <span className="text-gold tracking-tight" aria-label={`${value} de 5 estrellas`}>
      {"★".repeat(value)}
      <span className="text-latte">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function StarInput({
  name,
  defaultValue = 0,
}: {
  name: string;
  defaultValue?: number | null;
}) {
  const [value, setValue] = useState(defaultValue ?? 0);
  const [hovered, setHovered] = useState(0);

  const shown = hovered || value;

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setValue((v) => (v === star ? 0 : star))}
          aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
          className="text-3xl leading-none transition-transform hover:scale-110"
        >
          <span className={shown >= star ? "text-gold" : "text-latte"}>★</span>
        </button>
      ))}
      {value > 0 && (
        <button
          type="button"
          onClick={() => setValue(0)}
          className="text-xs text-coffee/50 hover:text-coffee ml-1"
        >
          Quitar
        </button>
      )}
    </div>
  );
}
