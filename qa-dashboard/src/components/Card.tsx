import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  testId?: string
}

export function Card({ title, children, testId }: CardProps) {
  return (
    <section
      data-testid={testId}
      className="rounded-xl border border-ink-200/80 bg-white/95 p-5 shadow-sm"
    >
      {title ? <h2 className="mb-4 text-lg font-semibold text-ink-900">{title}</h2> : null}
      {children}
    </section>
  )
}
