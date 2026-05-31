import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@repo/ui/components/card'

interface Props {
  icon: LucideIcon
  label: string
  value: number | string
}

export function StatsCard({ icon: Icon, label, value }: Props) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardContent className="space-y-2 pt-6">
        <Icon className="size-5 text-primary" />
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}