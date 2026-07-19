import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', testId: 'nav-dashboard' },
  { to: '/facilities', label: 'Facilities', testId: 'nav-facilities' },
  { to: '/providers', label: 'Providers', testId: 'nav-providers' },
  { to: '/provider-assignments', label: 'Provider Mapping', testId: 'nav-provider-mapping' },
  { to: '/documents', label: 'Documents', testId: 'nav-documents' },
  { to: '/patients', label: 'Patients', testId: 'nav-patients' },
  { to: '/medical-records', label: 'Medical Records', testId: 'nav-medical-records' },
]

export function Sidebar() {
  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-r border-brand-900/20 bg-brand-950 text-brand-50"
      data-testid="sidebar"
    >
      <div className="border-b border-white/10 px-5 py-6">
        <p className="font-display text-2xl font-semibold tracking-tight" data-testid="brand-name">
          Medicube
        </p>
        <p className="mt-1 text-xs text-brand-300">Healthcare Operations</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            data-testid={item.testId}
            className={({ isActive }) =>
              `rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-700 text-white'
                  : 'text-brand-200 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
