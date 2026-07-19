import { Router, type Request, type Response } from 'express'
import { createMedicalRecordId, db } from '../data/store'
import type { EntityStatus, MedicalRecord, MedicalRecordInput } from '../types'

export const medicalRecordsRouter = Router()

medicalRecordsRouter.get('/', (_req: Request, res: Response) => {
  res.json(db.medicalRecords)
})

medicalRecordsRouter.post('/', (req: Request, res: Response) => {
  const { patientId, diagnosis, providerName, status } = req.body as MedicalRecordInput

  if (!patientId?.trim() || !diagnosis?.trim() || !providerName?.trim()) {
    res.status(400).json({ message: 'patientId, diagnosis, and providerName are required' })
    return
  }

  const patient = db.patients.find((p) => p.id === patientId)
  if (!patient) {
    res.status(404).json({ message: 'Patient not found' })
    return
  }

  const record: MedicalRecord = {
    id: createMedicalRecordId(),
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    diagnosis: diagnosis.trim(),
    providerName: providerName.trim(),
    recordedAt: new Date().toISOString().slice(0, 10),
    status: (status as EntityStatus) ?? 'Active',
  }

  db.medicalRecords.unshift(record)
  db.activity.unshift({
    id: `ACT-${Date.now()}`,
    message: `Medical record created for ${record.patientName}`,
    timestamp: 'just now',
    type: 'patient',
  })

  res.status(201).json(record)
})
