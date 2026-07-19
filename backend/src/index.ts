import cors from 'cors'
import express from 'express'
import { authRouter, requireAuth } from './routes/auth'
import { automationRouter } from './routes/automation'
import { documentsRouter } from './routes/documents'
import { healthcareRouter } from './routes/healthcare'
import { medicalRecordsRouter } from './routes/medicalRecords'
import { patientsRouter } from './routes/patients'
import { providersRouter } from './routes/providers'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Medicube API', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)

app.use('/api', requireAuth, healthcareRouter)
app.use('/api/automation', requireAuth, automationRouter)
app.use('/api/providers', requireAuth, providersRouter)
app.use('/api/patients', requireAuth, patientsRouter)
app.use('/api/documents', requireAuth, documentsRouter)
app.use('/api/medical-records', requireAuth, medicalRecordsRouter)

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`Medicube API listening on http://localhost:${PORT}`)
})
