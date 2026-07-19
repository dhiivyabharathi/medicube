import { Router, type Request, type Response } from 'express'
import { db } from '../data/store'
import type { AutomationRunSummary, TestResultItem } from '../types'

function isValidSummary(value: unknown): value is AutomationRunSummary {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return (
    typeof s.total === 'number' &&
    typeof s.passed === 'number' &&
    typeof s.failed === 'number' &&
    typeof s.skipped === 'number' &&
    typeof s.durationMs === 'number' &&
    typeof s.latestRunAt === 'string' &&
    typeof s.suiteName === 'string'
  )
}

function isValidResult(value: unknown): value is TestResultItem {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    typeof r.suite === 'string' &&
    typeof r.durationMs === 'number' &&
    (r.status === 'passed' || r.status === 'failed' || r.status === 'skipped')
  )
}

export const automationRouter = Router()

automationRouter.get('/summary', (_req: Request, res: Response) => {
  res.json(db.automationSummary)
})

automationRouter.get('/results', (_req: Request, res: Response) => {
  res.json(db.automationResults)
})

automationRouter.get('/history', (_req: Request, res: Response) => {
  res.json(db.automationHistory)
})

automationRouter.post('/results', (req: Request, res: Response) => {
  const body = req.body as {
    summary?: unknown
    results?: unknown
  }

  if (!isValidSummary(body.summary) || !Array.isArray(body.results)) {
    res.status(400).json({
      message: 'Body must include a valid summary object and results array',
    })
    return
  }

  const results = body.results.filter(isValidResult)
  if (results.length !== body.results.length) {
    res.status(400).json({ message: 'One or more results entries are invalid' })
    return
  }

  db.automationSummary = body.summary
  db.automationResults = results
  db.automationHistory.unshift({
    ...body.summary,
    id: `RUN-${Date.now()}`,
  })
  db.automationHistory = db.automationHistory.slice(0, 10)

  db.activity.unshift({
    id: `ACT-${Date.now()}`,
    message: `Automation run published: ${body.summary.passed}/${body.summary.total} passed`,
    timestamp: 'just now',
    type: 'system',
  })

  res.status(201).json({
    summary: db.automationSummary,
    results: db.automationResults,
    history: db.automationHistory,
  })
})
