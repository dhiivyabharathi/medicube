import { Router, type Request, type Response } from 'express'
import { db } from '../data/store'

export const healthcareRouter = Router()

healthcareRouter.get('/facilities', (_req: Request, res: Response) => {
  res.json(db.facilities)
})

healthcareRouter.get('/provider-assignments', (_req: Request, res: Response) => {
  res.json(db.assignments)
})

healthcareRouter.get('/dashboard/metrics', (_req: Request, res: Response) => {
  res.json({
    providers: db.providers.length,
    patients: db.patients.length,
    facilities: db.facilities.length,
    pendingDocuments: db.documents.filter((d) => d.status === 'Pending').length,
  })
})

healthcareRouter.get('/dashboard/activity', (_req: Request, res: Response) => {
  res.json(db.activity.slice(0, 10))
})
