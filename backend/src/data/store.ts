import type {
  ActivityItem,
  AutomationRunHistoryItem,
  AutomationRunSummary,
  DocumentRecord,
  Facility,
  MedicalRecord,
  Patient,
  Provider,
  ProviderAssignment,
  TestResultItem,
} from '../types'

export const db = {
  providers: [
    {
      id: 'PR1001',
      name: 'Dr Sarah Lee',
      specialty: 'Cardiology',
      mpi: '1234567890',
      status: 'Active',
    },
    {
      id: 'PR1002',
      name: 'Dr James Patel',
      specialty: 'Family Medicine',
      mpi: '2345678901',
      status: 'Active',
    },
    {
      id: 'PR1003',
      name: 'Dr Maya Chen',
      specialty: 'Neurology',
      mpi: '3456789012',
      status: 'Pending',
    },
  ] as Provider[],

  facilities: [
    {
      id: 'FAC001',
      name: 'Medicube Memorial Hospital',
      type: 'Hospital',
      city: 'Austin',
      state: 'TX',
      status: 'Active',
    },
    {
      id: 'FAC002',
      name: 'Riverside Ambulatory Clinic',
      type: 'Clinic',
      city: 'Round Rock',
      state: 'TX',
      status: 'Active',
    },
    {
      id: 'FAC003',
      name: 'Northside Imaging Center',
      type: 'Imaging',
      city: 'Cedar Park',
      state: 'TX',
      status: 'Active',
    },
  ] as Facility[],

  patients: [
    {
      id: 'PT2001',
      firstName: 'Elena',
      lastName: 'Martinez',
      dateOfBirth: '1988-04-12',
      mrn: 'MRN-880412',
      status: 'Active',
    },
    {
      id: 'PT2002',
      firstName: 'Robert',
      lastName: 'Nguyen',
      dateOfBirth: '1975-11-03',
      mrn: 'MRN-751103',
      status: 'Active',
    },
  ] as Patient[],

  documents: [
    {
      id: 'DOC301',
      name: 'Credentialing Packet - Lee',
      category: 'Credentialing',
      uploadedBy: 'admin',
      uploadedAt: '2026-07-10',
      status: 'Approved',
      fileName: 'credentialing-lee.pdf',
      content: 'Medicube credentialing packet for Dr Sarah Lee',
    },
    {
      id: 'DOC302',
      name: 'Patient Consent - Martinez',
      category: 'Consent',
      uploadedBy: 'admin',
      uploadedAt: '2026-07-15',
      status: 'Pending',
      fileName: 'consent-martinez.pdf',
      content: 'Informed consent form for Elena Martinez',
    },
    {
      id: 'DOC303',
      name: 'Lab Results Upload',
      category: 'Clinical',
      uploadedBy: 'admin',
      uploadedAt: '2026-07-17',
      status: 'Pending',
      fileName: 'lab-results.txt',
      content: 'CBC within normal limits',
    },
  ] as DocumentRecord[],

  medicalRecords: [
    {
      id: 'MR4001',
      patientId: 'PT2001',
      patientName: 'Elena Martinez',
      diagnosis: 'Hypertension',
      providerName: 'Dr Sarah Lee',
      recordedAt: '2026-07-12',
      status: 'Active',
    },
    {
      id: 'MR4002',
      patientId: 'PT2002',
      patientName: 'Robert Nguyen',
      diagnosis: 'Type 2 Diabetes',
      providerName: 'Dr James Patel',
      recordedAt: '2026-07-14',
      status: 'Active',
    },
  ] as MedicalRecord[],

  assignments: [
    {
      id: 'PA5001',
      providerId: 'PR1001',
      providerName: 'Dr Sarah Lee',
      facilityId: 'FAC001',
      facilityName: 'Medicube Memorial Hospital',
      role: 'Attending Cardiologist',
      status: 'Active',
    },
    {
      id: 'PA5002',
      providerId: 'PR1002',
      providerName: 'Dr James Patel',
      facilityId: 'FAC002',
      facilityName: 'Riverside Ambulatory Clinic',
      role: 'Primary Care Physician',
      status: 'Active',
    },
  ] as ProviderAssignment[],

  activity: [
    {
      id: 'ACT1',
      message: 'Dr Sarah Lee credentialing packet approved',
      timestamp: '2h ago',
      type: 'provider',
    },
    {
      id: 'ACT2',
      message: 'New patient chart created for Elena Martinez',
      timestamp: '5h ago',
      type: 'patient',
    },
    {
      id: 'ACT3',
      message: '2 documents awaiting review',
      timestamp: '1d ago',
      type: 'document',
    },
  ] as ActivityItem[],

  automationSummary: {
    total: 4,
    passed: 3,
    failed: 1,
    skipped: 0,
    durationMs: 12450,
    latestRunAt: '2026-07-19 10:30 UTC',
    suiteName: 'Medicube Smoke Suite',
  } as AutomationRunSummary,

  automationResults: [
    {
      id: 'TR1',
      title: 'Admin login should work',
      suite: 'auth',
      status: 'passed',
      durationMs: 2100,
    },
    {
      id: 'TR2',
      title: 'Provider CRUD workflow',
      suite: 'providers',
      status: 'passed',
      durationMs: 5400,
    },
    {
      id: 'TR3',
      title: 'Patient search returns matches',
      suite: 'patients',
      status: 'passed',
      durationMs: 2800,
    },
    {
      id: 'TR4',
      title: 'Document status validation',
      suite: 'documents',
      status: 'failed',
      durationMs: 2150,
      errorMessage: 'Expected status Approved, received Pending',
    },
  ] as TestResultItem[],

  automationHistory: [
    {
      id: 'RUN-SEED',
      total: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
      durationMs: 12450,
      latestRunAt: '2026-07-19 10:30 UTC',
      suiteName: 'Medicube Smoke Suite',
    },
  ] as AutomationRunHistoryItem[],

  nextProviderSeq: 1004,
  nextPatientSeq: 2003,
  nextDocumentSeq: 304,
  nextMedicalRecordSeq: 4003,
}

export function createProviderId(): string {
  const id = `PR${db.nextProviderSeq}`
  db.nextProviderSeq += 1
  return id
}

export function createPatientId(): string {
  const id = `PT${db.nextPatientSeq}`
  db.nextPatientSeq += 1
  return id
}

export function createDocumentId(): string {
  const id = `DOC${db.nextDocumentSeq}`
  db.nextDocumentSeq += 1
  return id
}

export function createMedicalRecordId(): string {
  const id = `MR${db.nextMedicalRecordSeq}`
  db.nextMedicalRecordSeq += 1
  return id
}

export function toPublicDocument(doc: DocumentRecord) {
  return {
    id: doc.id,
    name: doc.name,
    category: doc.category,
    uploadedBy: doc.uploadedBy,
    uploadedAt: doc.uploadedAt,
    status: doc.status,
    fileName: doc.fileName,
  }
}
