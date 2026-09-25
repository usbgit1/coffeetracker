export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white/60 border border-latte/50 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-medium text-coffee/70 uppercase tracking-wide">
        {label}
      </p>
      <p
        className="text-xl text-coffee-dark mt-1 truncate"
        style={{ fontFamily: "var(--font-serif)" }}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}
