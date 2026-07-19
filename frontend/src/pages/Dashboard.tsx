import { useEffect, useState } from 'react'
import { ActivityList } from '../components/dashboard/ActivityList'
import { KPISection } from '../components/dashboard/KPISection'
import { QuickActions } from '../components/dashboard/QuickActions'
import { Card } from '../components/common/Card'
import { dashboardService } from '../services/healthcare'
import type { ActivityItem, DashboardMetrics } from '../types'

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [metricsData, activityData] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getActivity(),
        ])
        if (!active) return
        setMetrics(metricsData)
        setActivity(activityData)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900" data-testid="dashboard-heading">
          Operations Overview
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Monitor credentialing, patient intake, and document workflows.
        </p>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <KPISection metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Quick Actions">
          <QuickActions />
        </Card>
        <Card title="Recent Activity">
          <ActivityList items={activity} />
        </Card>
      </div>
    </div>
  )
}
