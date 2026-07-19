import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  testId?: string
}

export function Card({ title, action, children, className = '', testId }: CardProps) {
  return (
    <section
      data-testid={testId}
      className={`rounded-xl border border-ink-200/80 bg-white/90 p-5 shadow-sm backdrop-blur ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
