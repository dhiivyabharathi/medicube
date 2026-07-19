import { Link } from 'react-router-dom'

const actions = [
  { to: '/providers', label: 'Add Provider', description: 'Credential a new clinician' },
  { to: '/patients', label: 'Register Patient', description: 'Create a patient chart' },
  { to: '/documents', label: 'Review Documents', description: 'Approve pending uploads' },
  { to: '/medical-records', label: 'Open Charts', description: 'View clinical records' },
]

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" data-testid="quick-actions">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50"
        >
          <p className="text-sm font-semibold text-brand-900">{action.label}</p>
          <p className="mt-0.5 text-xs text-brand-600">{action.description}</p>
        </Link>
      ))}
    </div>
  )
}
