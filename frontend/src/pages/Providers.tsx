import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ProviderForm } from '../components/providers/ProviderForm'
import { providerService } from '../services/healthcare'
import type { Provider, ProviderInput } from '../types'

export function Providers() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Provider | null>(null)

  const loadProviders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await providerService.list()
      setProviders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return providers
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.specialty.toLowerCase().includes(term) ||
        p.mpi.includes(term) ||
        p.id.toLowerCase().includes(term),
    )
  }, [providers, search])

  async function handleCreate(input: ProviderInput) {
    await providerService.create(input)
    await loadProviders()
  }

  async function handleUpdate(input: ProviderInput) {
    if (!editing) return
    await providerService.update(editing.id, input)
    await loadProviders()
  }

  async function handleDelete(provider: Provider) {
    const confirmed = window.confirm(`Delete provider ${provider.name}?`)
    if (!confirmed) return
    try {
      await providerService.remove(provider.id)
      await loadProviders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider')
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(provider: Provider) {
    setEditing(provider)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6" data-testid="providers-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">Providers</h2>
          <p className="mt-1 text-sm text-ink-500">Manage clinician credentials and MPI records.</p>
        </div>
        <Button onClick={openCreate} data-testid="add-provider-button">
          Add Provider
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <label className="block max-w-md">
            <span className="mb-1 block text-sm font-medium text-ink-700">Search providers</span>
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialty, MPI, or ID"
              data-testid="provider-search-input"
            />
          </label>
        </div>

        {error ? (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="py-8 text-center text-sm text-ink-400">Loading providers…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="providers-table">
              <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Specialty</th>
                  <th className="px-3 py-2 font-medium">MPI</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((provider) => (
                  <tr
                    key={provider.id}
                    className="border-b border-ink-100"
                    data-testid={`provider-row-${provider.id}`}
                  >
                    <td className="px-3 py-3 font-medium text-ink-800">{provider.id}</td>
                    <td className="px-3 py-3" data-testid="provider-name">
                      {provider.name}
                    </td>
                    <td className="px-3 py-3">{provider.specialty}</td>
                    <td className="px-3 py-3 font-mono text-xs">{provider.mpi}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          provider.status === 'Active'
                            ? 'bg-brand-100 text-brand-800'
                            : provider.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => openEdit(provider)}
                          data-testid={`edit-provider-${provider.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => void handleDelete(provider)}
                          data-testid={`delete-provider-${provider.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-ink-400" data-testid="providers-empty">
                      No providers found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {formOpen ? (
        <ProviderForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      ) : null}
    </div>
  )
}
