import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { medicalRecordService, patientService, providerService } from '../services/healthcare'
import type { MedicalRecord, Patient, Provider } from '../types'

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [patientId, setPatientId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [providerName, setProviderName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const [recordsData, patientsData, providersData] = await Promise.all([
        medicalRecordService.list(),
        patientService.list(),
        providerService.list(),
      ])
      setRecords(recordsData)
      setPatients(patientsData)
      setProviders(providersData)
      setPatientId((current) => current || patientsData[0]?.id || '')
      setProviderName((current) => current || providersData[0]?.name || '')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medical records')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!patientId || !diagnosis.trim() || !providerName.trim()) {
      setError('Patient, diagnosis, and provider are required.')
      return
    }

    setSaving(true)
    try {
      await medicalRecordService.create({
        patientId,
        diagnosis: diagnosis.trim(),
        providerName: providerName.trim(),
        status: 'Active',
      })
      setDiagnosis('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create medical record')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6" data-testid="medical-records-page">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Medical Records</h2>
        <p className="mt-1 text-sm text-ink-500">Create and verify clinical diagnoses linked to charts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card title="Create Record" testId="medical-record-form-card">
          <form className="space-y-3" onSubmit={handleCreate} data-testid="medical-record-form">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-700">Patient</span>
              <select
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                data-testid="record-patient-input"
                required
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} ({patient.mrn})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-700">Diagnosis</span>
              <input
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
                placeholder="e.g. Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                data-testid="record-diagnosis-input"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-700">Provider</span>
              <select
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                data-testid="record-provider-input"
                required
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.name}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" disabled={saving} data-testid="record-form-submit">
              {saving ? 'Saving…' : 'Create Record'}
            </Button>
          </form>
        </Card>

        <Card>
          {error ? (
            <p className="mb-3 text-sm text-red-700" role="alert" data-testid="medical-records-error">
              {error}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="medical-records-table">
              <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Patient</th>
                  <th className="px-3 py-2 font-medium">Diagnosis</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Recorded</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-ink-100"
                    data-testid={`record-row-${record.id}`}
                  >
                    <td className="px-3 py-3">{record.id}</td>
                    <td className="px-3 py-3" data-testid="record-patient">
                      {record.patientName}
                    </td>
                    <td className="px-3 py-3" data-testid="record-diagnosis">
                      {record.diagnosis}
                    </td>
                    <td className="px-3 py-3">{record.providerName}</td>
                    <td className="px-3 py-3">{record.recordedAt}</td>
                    <td className="px-3 py-3">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
