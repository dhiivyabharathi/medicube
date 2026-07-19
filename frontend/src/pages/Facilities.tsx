import { useEffect, useState } from 'react'
import { Card } from '../components/common/Card'
import { facilityService } from '../services/healthcare'
import type { Facility } from '../types'

export function Facilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void facilityService
      .list()
      .then(setFacilities)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load facilities'),
      )
  }, [])

  return (
    <div className="space-y-6" data-testid="facilities-page">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Facilities</h2>
        <p className="mt-1 text-sm text-ink-500">Network hospitals, clinics, and ambulatory centers.</p>
      </div>

      <Card>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="facilities-table">
              <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr key={facility.id} className="border-b border-ink-100">
                    <td className="px-3 py-3 font-medium">{facility.id}</td>
                    <td className="px-3 py-3">{facility.name}</td>
                    <td className="px-3 py-3">{facility.type}</td>
                    <td className="px-3 py-3">
                      {facility.city}, {facility.state}
                    </td>
                    <td className="px-3 py-3">{facility.status}</td>
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
