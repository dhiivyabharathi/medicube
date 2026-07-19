export type EntityStatus = 'Active' | 'Inactive' | 'Pending'

export interface Provider {
  id: string
  name: string
  specialty: string
  mpi: string
  status: EntityStatus
}

export interface Facility {
  id: string
  name: string
  type: string
  city: string
  state: string
  status: EntityStatus
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  mrn: string
  status: EntityStatus
}

export interface DocumentRecord {
  id: string
  name: string
  category: string
  uploadedBy: string
  uploadedAt: string
  status: 'Pending' | 'Approved' | 'Rejected'
  fileName: string
  content: string
}

export interface DocumentPublic {
  id: string
  name: string
  category: string
  uploadedBy: string
  uploadedAt: string
  status: 'Pending' | 'Approved' | 'Rejected'
  fileName: string
}

export interface MedicalRecordInput {
  patientId: string
  diagnosis: string
  providerName: string
  status?: EntityStatus
}

export interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  diagnosis: string
  providerName: string
  recordedAt: string
  status: EntityStatus
}

export interface ProviderAssignment {
  id: string
  providerId: string
  providerName: string
  facilityId: string
  facilityName: string
  role: string
  status: EntityStatus
}

export interface ActivityItem {
  id: string
  message: string
  timestamp: string
  type: 'provider' | 'patient' | 'document' | 'system'
}

export interface TestResultItem {
  id: string
  title: string
  suite: string
  status: 'passed' | 'failed' | 'skipped'
  durationMs: number
  errorMessage?: string
}

export interface AutomationRunSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  durationMs: number
  latestRunAt: string
  suiteName: string
}

export interface AutomationRunHistoryItem extends AutomationRunSummary {
  id: string
}
