import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { documentService } from '../services/healthcare'
import type { DocumentRecord } from '../types'

const categories = ['Credentialing', 'Consent', 'Clinical', 'Insurance', 'Other']

function triggerBrowserDownload(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function Documents() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    try {
      setDocuments(await documentService.list())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!name.trim() || !fileName.trim() || !fileContent) {
      setError('Document name and file are required.')
      return
    }

    setUploading(true)
    try {
      await documentService.upload({
        name: name.trim(),
        category,
        fileName,
        content: fileContent,
      })
      setName('')
      setCategory(categories[0])
      setFileName('')
      setFileContent('')
      const fileInput = window.document.querySelector<HTMLInputElement>(
        '[data-testid="document-file-input"]',
      )
      if (fileInput) fileInput.value = ''
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  async function handleApprove(doc: DocumentRecord) {
    try {
      await documentService.updateStatus(doc.id, 'Approved')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  async function handleDownload(doc: DocumentRecord) {
    try {
      const file = await documentService.download(doc.id)
      triggerBrowserDownload(file.fileName, file.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document')
    }
  }

  return (
    <div className="space-y-6" data-testid="documents-page">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Documents</h2>
        <p className="mt-1 text-sm text-ink-500">
          Upload, review status, and download credentialing and clinical files.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card title="Upload Document" testId="document-upload-card">
          <form className="space-y-3" onSubmit={handleUpload} data-testid="document-upload-form">
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              placeholder="Document name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="document-name-input"
              required
            />
            <select
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="document-category-input"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx,.csv"
              className="w-full text-sm text-ink-600"
              data-testid="document-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setFileName(file.name)
                const reader = new FileReader()
                reader.onload = () => {
                  setFileContent(String(reader.result ?? ''))
                }
                reader.readAsText(file)
              }}
            />
            {fileName ? (
              <p className="text-xs text-ink-500" data-testid="document-selected-file">
                Selected: {fileName}
              </p>
            ) : null}
            <Button type="submit" disabled={uploading} data-testid="document-upload-submit">
              {uploading ? 'Uploading…' : 'Upload Document'}
            </Button>
          </form>
        </Card>

        <Card>
          {error ? (
            <p className="mb-3 text-sm text-red-700" role="alert" data-testid="documents-error">
              {error}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="documents-table">
              <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">File</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-ink-100"
                    data-testid={`document-row-${doc.id}`}
                  >
                    <td className="px-3 py-3">{doc.id}</td>
                    <td className="px-3 py-3" data-testid="document-name">
                      {doc.name}
                    </td>
                    <td className="px-3 py-3">{doc.category}</td>
                    <td className="px-3 py-3 font-mono text-xs">{doc.fileName}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          doc.status === 'Approved'
                            ? 'bg-brand-100 text-brand-800'
                            : doc.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                        data-testid={`document-status-${doc.id}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {doc.status === 'Pending' ? (
                          <Button
                            variant="secondary"
                            className="!px-2 !py-1 text-xs"
                            onClick={() => void handleApprove(doc)}
                            data-testid={`approve-document-${doc.id}`}
                          >
                            Approve
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => void handleDownload(doc)}
                          data-testid={`download-document-${doc.id}`}
                        >
                          Download
                        </Button>
                      </div>
                    </td>
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
