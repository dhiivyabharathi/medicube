import type {
  ActivityItem,
  DashboardMetrics,
  DocumentRecord,
  DocumentUploadInput,
  Facility,
  LoginCredentials,
  LoginResponse,
  MedicalRecord,
  MedicalRecordInput,
  Patient,
  PatientInput,
  Provider,
  ProviderAssignment,
  ProviderInput,
} from '../types'
import { getStoredAuth } from '../utils/authStorage'

const API_BASE = '/api'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getStoredAuth()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (auth?.token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${auth.token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    return request<DashboardMetrics>('/dashboard/metrics')
  },
  async getActivity(): Promise<ActivityItem[]> {
    return request<ActivityItem[]>('/dashboard/activity')
  },
}

export const providerService = {
  async list(): Promise<Provider[]> {
    return request<Provider[]>('/providers')
  },
  async create(input: ProviderInput): Promise<Provider> {
    return request<Provider>('/providers', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  async update(id: string, input: ProviderInput): Promise<Provider> {
    return request<Provider>(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },
  async remove(id: string): Promise<void> {
    return request<void>(`/providers/${id}`, { method: 'DELETE' })
  },
}

export const facilityService = {
  async list(): Promise<Facility[]> {
    return request<Facility[]>('/facilities')
  },
}

export const patientService = {
  async list(): Promise<Patient[]> {
    return request<Patient[]>('/patients')
  },
  async create(input: PatientInput): Promise<Patient> {
    return request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  async update(id: string, input: PatientInput): Promise<Patient> {
    return request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },
  async remove(id: string): Promise<void> {
    return request<void>(`/patients/${id}`, { method: 'DELETE' })
  },
}

export const documentService = {
  async list(): Promise<DocumentRecord[]> {
    return request<DocumentRecord[]>('/documents')
  },
  async upload(input: DocumentUploadInput): Promise<DocumentRecord> {
    return request<DocumentRecord>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  async updateStatus(
    id: string,
    status: DocumentRecord['status'],
  ): Promise<DocumentRecord> {
    return request<DocumentRecord>(`/documents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
  async download(id: string): Promise<{ fileName: string; content: string }> {
    const auth = getStoredAuth()
    const response = await fetch(`${API_BASE}/documents/${id}/download`, {
      headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })
    if (!response.ok) {
      throw new ApiError('Failed to download document', response.status)
    }
    const disposition = response.headers.get('Content-Disposition') ?? ''
    const match = /filename="([^"]+)"/.exec(disposition)
    const fileName = match?.[1] ?? `document-${id}.txt`
    const content = await response.text()
    return { fileName, content }
  },
}

export const medicalRecordService = {
  async list(): Promise<MedicalRecord[]> {
    return request<MedicalRecord[]>('/medical-records')
  },
  async create(input: MedicalRecordInput): Promise<MedicalRecord> {
    return request<MedicalRecord>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
}

export const assignmentService = {
  async list(): Promise<ProviderAssignment[]> {
    return request<ProviderAssignment[]>('/provider-assignments')
  },
}
