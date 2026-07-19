import type { ActivityItem } from '../../types'

interface ActivityListProps {
  items: ActivityItem[]
}

export function ActivityList({ items }: ActivityListProps) {
  return (
    <ul className="divide-y divide-ink-100" data-testid="activity-list">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 py-3">
          <div>
            <p className="text-sm text-ink-800">{item.message}</p>
            <p className="mt-0.5 text-xs capitalize text-ink-400">{item.type}</p>
          </div>
          <time className="shrink-0 text-xs text-ink-400">{item.timestamp}</time>
        </li>
      ))}
      {items.length === 0 ? (
        <li className="py-6 text-center text-sm text-ink-400">No recent activity</li>
      ) : null}
    </ul>
  )
}
