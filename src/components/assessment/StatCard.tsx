export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-box bg-base-100 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-base-content/50">{label}</p>
      <p className="money mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
