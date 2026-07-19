interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  testId?: string
}

export function StatCard({ label, value, hint, testId }: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="rounded-xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/70 p-4 shadow-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-brand-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  )
}
