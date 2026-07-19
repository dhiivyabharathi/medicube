import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Providers } from './pages/Providers'
import { Facilities } from './pages/Facilities'
import { ProviderAssignments } from './pages/ProviderAssignments'
import { Documents } from './pages/Documents'
import { Patients } from './pages/Patients'
import { MedicalRecords } from './pages/MedicalRecords'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/provider-assignments" element={<ProviderAssignments />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
