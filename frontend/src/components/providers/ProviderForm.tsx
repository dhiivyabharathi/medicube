import { useEffect, useState, type FormEvent } from 'react'
import type { EntityStatus, Provider, ProviderInput } from '../../types'
import { Button } from '../common/Button'

interface ProviderFormProps {
  initial?: Provider | null
  onSubmit: (input: ProviderInput) => Promise<void>
  onClose: () => void
}

const specialties = [
  'Cardiology',
  'Family Medicine',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Radiology',
]

const statuses: EntityStatus[] = ['Active', 'Inactive', 'Pending']

export function ProviderForm({ initial, onSubmit, onClose }: ProviderFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [specialty, setSpecialty] = useState(initial?.specialty ?? specialties[0])
  const [mpi, setMpi] = useState(initial?.mpi ?? '')
  const [status, setStatus] = useState<EntityStatus>(initial?.status ?? 'Active')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(initial?.name ?? '')
    setSpecialty(initial?.specialty ?? specialties[0])
    setMpi(initial?.mpi ?? '')
    setStatus(initial?.status ?? 'Active')
    setError('')
  }, [initial])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!name.trim() || !mpi.trim()) {
      setError('Name and MPI are required.')
      return
    }

    if (!/^\d{10}$/.test(mpi.trim())) {
      setError('MPI must be a 10-digit identifier.')
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        specialty,
        mpi: mpi.trim(),
        status,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save provider.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4"
      data-testid="provider-form-modal"
    >
      <div className="w-full max-w-lg rounded-xl border border-ink-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink-900" data-testid="provider-form-title">
            {initial ? 'Edit Provider' : 'Add Provider'}
          </h2>
          <Button variant="ghost" onClick={onClose} data-testid="provider-form-close">
            Close
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} data-testid="provider-form">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Full name</span>
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="provider-name-input"
              placeholder="Dr. Sarah Lee"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Specialty</span>
            <select
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              data-testid="provider-specialty-input"
            >
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">MPI</span>
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={mpi}
              onChange={(e) => setMpi(e.target.value)}
              data-testid="provider-mpi-input"
              placeholder="1234567890"
              maxLength={10}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Status</span>
            <select
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={status}
              onChange={(e) => setStatus(e.target.value as EntityStatus)}
              data-testid="provider-status-input"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="text-sm text-red-700" data-testid="provider-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} data-testid="provider-form-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} data-testid="provider-form-submit">
              {saving ? 'Saving…' : initial ? 'Update Provider' : 'Create Provider'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
