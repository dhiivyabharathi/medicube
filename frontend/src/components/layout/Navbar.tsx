import { useAuth } from '../../context/AuthContext'
import { Button } from '../common/Button'

interface NavbarProps {
  title: string
}

export function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <header
      className="flex items-center justify-between border-b border-ink-200/70 bg-white/70 px-6 py-4 backdrop-blur"
      data-testid="navbar"
    >
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900" data-testid="page-title">
          {title}
        </h1>
        <p className="text-xs text-ink-500">Medicube Healthcare Platform</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right" data-testid="user-menu">
          <p className="text-sm font-medium text-ink-800">{user?.displayName ?? 'Guest'}</p>
          <p className="text-xs text-ink-500">{user?.role ?? ''}</p>
        </div>
        <Button variant="secondary" onClick={logout} data-testid="logout-button">
          Logout
        </Button>
      </div>
    </header>
  )
}
