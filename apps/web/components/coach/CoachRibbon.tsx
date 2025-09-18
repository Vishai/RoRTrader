'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CoachEvaluation } from '@/lib/api/coach'
import { cn, formatNumber } from '@/lib/utils'

const statusClasses: Record<string, string> = {
  GREEN: 'bg-accent-secondary/20 text-accent-secondary',
  YELLOW: 'bg-accent-warning/20 text-accent-warning',
  RED: 'bg-accent-danger/20 text-accent-danger',
}

const statusCopy: Record<string, string> = {
  GREEN: 'Ready',
  YELLOW: 'Setup Forming',
  RED: 'Scanning',
}

type CoachRibbonProps = {
  sessionId?: string
  evaluations?: CoachEvaluation[]
  riskReward?: number | null
  expectedValue?: number | null
  updatedAt?: string | Date
  onOpenPanel?: () => void
}

export function CoachRibbon({
  sessionId,
  evaluations = [],
  riskReward = 1.6,
  expectedValue = 0.42,
  updatedAt,
  onOpenPanel,
}: CoachRibbonProps) {
  const latest = evaluations[0]

  const status = latest?.status ?? 'RED'
  const statusLabel = statusCopy[status] ?? status

  const topTags = useMemo(() => {
    return evaluations
      .map((evaluation) => evaluation.tag?.name)
      .filter(Boolean)
      .slice(0, 3) as string[]
  }, [evaluations])

  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : latest?.createdAt
    ? new Date(latest.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <Card className="border-border-hover bg-gradient-card/80 backdrop-blur-xs">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <Badge className={cn('uppercase tracking-wide', statusClasses[status])}>{statusLabel}</Badge>
          <div>
            <div className="text-sm text-text-tertiary">Session</div>
            <div className="text-lg font-semibold text-text-primary">
              {sessionId ? `#${sessionId.slice(0, 6)}` : 'No active session'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-text-tertiary">Projected R:R</span>
            <span className="text-xl font-semibold text-text-primary">
              {riskReward !== null ? `${formatNumber(riskReward, 2)}x` : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-text-tertiary">Expected Value</span>
            <span className="text-xl font-semibold text-accent-secondary">
              {expectedValue !== null ? `+${formatNumber(expectedValue * 100, 1)}%` : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-text-tertiary">Updated</span>
            <span className="text-sm text-text-secondary">{lastUpdatedLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {topTags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-border-hover text-text-secondary">
              {tag}
            </Badge>
          ))}
          <Button variant="secondary" onClick={onOpenPanel} className="ml-2">
            View Coach Panel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CoachRibbon
