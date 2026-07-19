import { Router, type Request, type Response } from 'express'
import { createProviderId, db } from '../data/store'
import type { EntityStatus, Provider } from '../types'

export const providersRouter = Router()

providersRouter.get('/', (_req: Request, res: Response) => {
  res.json(db.providers)
})

providersRouter.post('/', (req: Request, res: Response) => {
  const { name, specialty, mpi, status } = req.body as Partial<Provider>

  if (!name?.trim() || !specialty?.trim() || !mpi?.trim()) {
    res.status(400).json({ message: 'name, specialty, and mpi are required' })
    return
  }

  if (!/^\d{10}$/.test(mpi)) {
    res.status(400).json({ message: 'MPI must be a 10-digit identifier' })
    return
  }

  if (db.providers.some((p) => p.mpi === mpi)) {
    res.status(409).json({ message: 'A provider with this MPI already exists' })
    return
  }

  const provider: Provider = {
    id: createProviderId(),
    name: name.trim(),
    specialty: specialty.trim(),
    mpi,
    status: (status as EntityStatus) ?? 'Active',
  }

  db.providers.unshift(provider)
  db.activity.unshift({
    id: `ACT-${Date.now()}`,
    message: `Provider ${provider.name} created`,
    timestamp: 'just now',
    type: 'provider',
  })

  res.status(201).json(provider)
})

providersRouter.put('/:id', (req: Request, res: Response) => {
  const index = db.providers.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ message: 'Provider not found' })
    return
  }

  const { name, specialty, mpi, status } = req.body as Partial<Provider>
  const existing = db.providers[index]

  if (mpi && db.providers.some((p) => p.mpi === mpi && p.id !== existing.id)) {
    res.status(409).json({ message: 'A provider with this MPI already exists' })
    return
  }

  const updated: Provider = {
    ...existing,
    name: name?.trim() ?? existing.name,
    specialty: specialty?.trim() ?? existing.specialty,
    mpi: mpi ?? existing.mpi,
    status: (status as EntityStatus) ?? existing.status,
  }

  db.providers[index] = updated
  res.json(updated)
})

providersRouter.delete('/:id', (req: Request, res: Response) => {
  const index = db.providers.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ message: 'Provider not found' })
    return
  }

  const [removed] = db.providers.splice(index, 1)
  db.activity.unshift({
    id: `ACT-${Date.now()}`,
    message: `Provider ${removed.name} deleted`,
    timestamp: 'just now',
    type: 'provider',
  })

  res.status(204).send()
})
