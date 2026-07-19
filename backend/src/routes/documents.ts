import { Router, type Request, type Response } from 'express'
import { createDocumentId, db, toPublicDocument } from '../data/store'
import type { DocumentRecord } from '../types'

export const documentsRouter = Router()

documentsRouter.get('/', (_req: Request, res: Response) => {
  res.json(db.documents.map(toPublicDocument))
})

documentsRouter.post('/upload', (req: Request, res: Response) => {
  const { name, category, fileName, content } = req.body as {
    name?: string
    category?: string
    fileName?: string
    content?: string
  }

  if (!name?.trim() || !category?.trim() || !fileName?.trim()) {
    res.status(400).json({ message: 'name, category, and fileName are required' })
    return
  }

  const document: DocumentRecord = {
    id: createDocumentId(),
    name: name.trim(),
    category: category.trim(),
    uploadedBy: 'admin',
    uploadedAt: new Date().toISOString().slice(0, 10),
    status: 'Pending',
    fileName: fileName.trim(),
    content: content ?? `Medicube document: ${name.trim()}`,
  }

  db.documents.unshift(document)
  db.activity.unshift({
    id: `ACT-${Date.now()}`,
    message: `Document uploaded: ${document.name}`,
    timestamp: 'just now',
    type: 'document',
  })

  res.status(201).json(toPublicDocument(document))
})

documentsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const document = db.documents.find((d) => d.id === req.params.id)
  if (!document) {
    res.status(404).json({ message: 'Document not found' })
    return
  }

  const { status } = req.body as { status?: DocumentRecord['status'] }
  if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
    res.status(400).json({ message: 'status must be Pending, Approved, or Rejected' })
    return
  }

  document.status = status
  res.json(toPublicDocument(document))
})

documentsRouter.get('/:id/download', (req: Request, res: Response) => {
  const document = db.documents.find((d) => d.id === req.params.id)
  if (!document) {
    res.status(404).json({ message: 'Document not found' })
    return
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`)
  res.send(document.content)
})
