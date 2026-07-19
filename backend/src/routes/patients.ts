import { Router, type Request, type Response } from 'express'
import { createPatientId, db } from '../data/store'
import type { EntityStatus, Patient } from '../types'

export const patientsRouter = Router()

patientsRouter.get('/', (_req: Request, res: Response) => {
  res.json(db.patients)
})

patientsRouter.post('/', (req: Request, res: Response) => {
  const { firstName, lastName, dateOfBirth, mrn, status } = req.body as Partial<Patient>

  if (!firstName?.trim() || !lastName?.trim() || !dateOfBirth || !mrn?.trim()) {
    res.status(400).json({ message: 'firstName, lastName, dateOfBirth, and mrn are required' })
    return
  }

  if (db.patients.some((p) => p.mrn === mrn)) {
    res.status(409).json({ message: 'A patient with this MRN already exists' })
    return
  }

  const patient: Patient = {
    id: createPatientId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    dateOfBirth,
    mrn: mrn.trim(),
    status: (status as EntityStatus) ?? 'Active',
  }

  db.patients.unshift(patient)
  res.status(201).json(patient)
})

patientsRouter.put('/:id', (req: Request, res: Response) => {
  const index = db.patients.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ message: 'Patient not found' })
    return
  }

  const existing = db.patients[index]
  const { firstName, lastName, dateOfBirth, mrn, status } = req.body as Partial<Patient>

  if (mrn && db.patients.some((p) => p.mrn === mrn && p.id !== existing.id)) {
    res.status(409).json({ message: 'A patient with this MRN already exists' })
    return
  }

  const updated: Patient = {
    ...existing,
    firstName: firstName?.trim() ?? existing.firstName,
    lastName: lastName?.trim() ?? existing.lastName,
    dateOfBirth: dateOfBirth ?? existing.dateOfBirth,
    mrn: mrn?.trim() ?? existing.mrn,
    status: (status as EntityStatus) ?? existing.status,
  }

  db.patients[index] = updated
  res.json(updated)
})

patientsRouter.delete('/:id', (req: Request, res: Response) => {
  const index = db.patients.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ message: 'Patient not found' })
    return
  }

  db.patients.splice(index, 1)
  res.status(204).send()
})
