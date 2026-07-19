export interface AuthUser {
  username: string
  displayName: string
  role: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

export type EntityStatus = 'Active' | 'Inactive' | 'Pending'

export interface Provider {
  id: string
  name: string
  specialty: string
  mpi: string
  status: EntityStatus
}

export interface ProviderInput {
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

export interface PatientInput {
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
}

export interface DocumentUploadInput {
  name: string
  category: string
  fileName: string
  content: string
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

export interface MedicalRecordInput {
  patientId: string
  diagnosis: string
  providerName: string
  status?: EntityStatus
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

export interface DashboardMetrics {
  providers: number
  patients: number
  facilities: number
  pendingDocuments: number
}

export interface ActivityItem {
  id: string
  message: string
  timestamp: string
  type: 'provider' | 'patient' | 'document' | 'system'
}
