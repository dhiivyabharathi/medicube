import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/facilities': 'Facilities',
  '/providers': 'Providers',
  '/provider-assignments': 'Provider Mapping',
  '/documents': 'Documents',
  '/patients': 'Patients',
  '/medical-records': 'Medical Records',
}

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Medicube'

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#e8f4f1_0%,_#f3f7f6_40%,_#eef1f4_100%)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} />
        <main className="flex-1 overflow-auto p-6" data-testid="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
