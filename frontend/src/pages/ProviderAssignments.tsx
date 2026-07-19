import { useEffect, useState } from 'react'
import { Card } from '../components/common/Card'
import { assignmentService } from '../services/healthcare'
import type { ProviderAssignment } from '../types'

export function ProviderAssignments() {
  const [assignments, setAssignments] = useState<ProviderAssignment[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void assignmentService
      .list()
      .then(setAssignments)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load assignments'),
      )
  }, [])

  return (
    <div className="space-y-6" data-testid="provider-assignments-page">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Provider Mapping</h2>
        <p className="mt-1 text-sm text-ink-500">Map clinicians to facilities and care roles.</p>
      </div>

      <Card>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="assignments-table">
              <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Facility</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item.id} className="border-b border-ink-100">
                    <td className="px-3 py-3">{item.id}</td>
                    <td className="px-3 py-3">{item.providerName}</td>
                    <td className="px-3 py-3">{item.facilityName}</td>
                    <td className="px-3 py-3">{item.role}</td>
                    <td className="px-3 py-3">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
