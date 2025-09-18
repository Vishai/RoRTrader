'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CoachEvaluation } from '@/lib/api/coach'
import { cn, formatDateTime } from '@/lib/utils'

type CoachPanelProps = {
  sessionId?: string
  symbol?: string
  timeframeMinutes?: number
  state?: string
  evaluations?: CoachEvaluation[]
  heartbeatLag?: boolean
  onClose?: () => void
}

const statusColor: Record<string, string> = {
  GREEN: 'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/30',
  YELLOW: 'bg-accent-warning/10 text-accent-warning border border-accent-warning/30',
  RED: 'bg-accent-danger/10 text-accent-danger border border-accent-danger/30',
}

export function CoachPanel({
  sessionId,
  symbol,
  timeframeMinutes,
  state,
  evaluations = [],
  heartbeatLag = false,
}: CoachPanelProps) {
  const latestAdvice = evaluations[0]?.advice?.headline ?? 'Awaiting conditions'

  const history = useMemo(() => evaluations.slice(0, 6), [evaluations])

  return (
    <Card className="h-full border-border-hover bg-background-secondary/80 backdrop-blur-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-text-primary">Coach Panel</CardTitle>
            <CardDescription>Live guidance for your current training session.</CardDescription>
          </div>
          <Badge
            className={cn(
              'flex items-center gap-2 border border-border-hover bg-background-primary/60',
              heartbeatLag ? 'text-accent-warning border-accent-warning/40' : 'text-accent-secondary border-accent-secondary/40'
            )}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-current" />
            {heartbeatLag ? 'Heartbeat Delayed' : 'Live'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border-default bg-background-primary/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-text-tertiary">Session</div>
              <div className="text-lg font-semibold text-text-primary">{sessionId ?? 'Not started'}</div>
            </div>
            <div>
              <div className="text-sm text-text-tertiary">Symbol</div>
              <div className="text-lg font-semibold text-text-primary">{symbol ?? '—'}</div>
            </div>
            <div>
              <div className="text-sm text-text-tertiary">Timeframe</div>
              <div className="text-lg font-semibold text-text-primary">
                {timeframeMinutes ? `${timeframeMinutes}m` : '—'}
              </div>
            </div>
            <Badge variant="outline" className="border-accent-primary/40 text-accent-primary">
              {state ?? 'SCANNING'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Latest Guidance</h3>
          <p className="text-lg font-semibold text-text-primary">{latestAdvice}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Recent Evaluations</h4>
          <div className="space-y-3">
            {history.map((evaluation) => (
              <div
                key={evaluation.id}
                className={cn(
                  'rounded-xl border border-border-default bg-background-primary/50 p-3 transition-colors',
                  statusColor[evaluation.status]
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge className={cn('text-xs uppercase', statusColor[evaluation.status])}>
                      {evaluation.status}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {evaluation.tag?.name ?? 'Condition'}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {evaluation.advice?.headline ?? 'Monitoring conditions'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {formatDateTime(evaluation.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="rounded-xl border border-dashed border-border-default bg-background-primary/40 p-6 text-center text-text-tertiary">
                No evaluations yet. Start a session to receive live coaching.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CoachPanel
