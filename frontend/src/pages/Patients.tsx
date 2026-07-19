import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { patientService } from '../services/healthcare'
import type { EntityStatus, Patient, PatientInput } from '../types'

const emptyForm: PatientInput = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  mrn: '',
  status: 'Active',
}

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<PatientInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setPatients(await patientService.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return patients
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        p.mrn.toLowerCase().includes(term),
    )
  }, [patients, search])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      if (editingId) {
        await patientService.update(editingId, form)
      } else {
        await patientService.create(form)
      }
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient')
    }
  }

  async function handleDelete(patient: Patient) {
    if (!window.confirm(`Delete patient ${patient.firstName} ${patient.lastName}?`)) return
    await patientService.remove(patient.id)
    await load()
  }

  function startEdit(patient: Patient) {
    setEditingId(patient.id)
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      mrn: patient.mrn,
      status: patient.status,
    })
  }

  return (
    <div className="space-y-6" data-testid="patients-page">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Patients</h2>
        <p className="mt-1 text-sm text-ink-500">Register and maintain patient charts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card title={editingId ? 'Update Patient' : 'Create Patient'} testId="patient-form-card">
          <form className="space-y-3" onSubmit={handleSubmit} data-testid="patient-form">
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              data-testid="patient-firstname-input"
              required
            />
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              data-testid="patient-lastname-input"
              required
            />
            <input
              type="date"
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              value={form.dateOfBirth}
              onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              data-testid="patient-dob-input"
              required
            />
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              placeholder="MRN"
              value={form.mrn}
              onChange={(e) => setForm((f) => ({ ...f, mrn: e.target.value }))}
              data-testid="patient-mrn-input"
              required
            />
            <select
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EntityStatus }))}
              data-testid="patient-status-input"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" data-testid="patient-form-submit">
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <input
            className="mb-4 w-full max-w-md rounded-md border border-ink-200 px-3 py-2 text-sm"
            placeholder="Search patients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="patient-search-input"
          />
          {error ? (
            <p className="mb-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="patients-table">
              <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">DOB</th>
                  <th className="px-3 py-2 font-medium">MRN</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((patient) => (
                  <tr key={patient.id} className="border-b border-ink-100" data-testid={`patient-row-${patient.id}`}>
                    <td className="px-3 py-3">{patient.id}</td>
                    <td className="px-3 py-3" data-testid="patient-name">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-3 py-3">{patient.dateOfBirth}</td>
                    <td className="px-3 py-3 font-mono text-xs">{patient.mrn}</td>
                    <td className="px-3 py-3">{patient.status}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => startEdit(patient)}
                          data-testid={`edit-patient-${patient.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => void handleDelete(patient)}
                          data-testid={`delete-patient-${patient.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-ink-400"
                      data-testid="patients-empty"
                    >
                      No patients found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
