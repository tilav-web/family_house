import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Hozircha ma'lumot yo'q",
  description = "Yangi yozuv qo'shish uchun yuqoridagi tugmani bosing",
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-muted-foreground">
      <Icon className="mx-auto mb-3 h-12 w-12 opacity-40" />
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  )
}
