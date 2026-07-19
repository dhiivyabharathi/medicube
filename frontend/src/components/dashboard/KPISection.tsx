import type { DashboardMetrics } from '../../types'
import { StatCard } from '../common/StatCard'

interface KPISectionProps {
  metrics: DashboardMetrics | null
}

export function KPISection({ metrics }: KPISectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="kpi-section">
      <StatCard
        label="Providers"
        value={metrics?.providers ?? '—'}
        hint="Credentialed clinicians"
        testId="kpi-providers"
      />
      <StatCard
        label="Patients"
        value={metrics?.patients ?? '—'}
        hint="Active charts"
        testId="kpi-patients"
      />
      <StatCard
        label="Facilities"
        value={metrics?.facilities ?? '—'}
        hint="Network locations"
        testId="kpi-facilities"
      />
      <StatCard
        label="Pending Docs"
        value={metrics?.pendingDocuments ?? '—'}
        hint="Awaiting review"
        testId="kpi-documents"
      />
    </div>
  )
}
