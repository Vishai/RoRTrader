'use client'

import { CoachSession } from '@/lib/api/coach'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn, formatDateTime } from '@/lib/utils'

const stateBadge: Record<string, string> = {
  READY: 'bg-accent-secondary/20 text-accent-secondary',
  SETUP_FORMING: 'bg-accent-warning/20 text-accent-warning',
  SCANNING: 'bg-text-tertiary/10 text-text-tertiary',
  MANAGE: 'bg-accent-purple/20 text-accent-purple',
}

type CoachSessionListProps = {
  sessions?: CoachSession[]
  selectedSessionId?: string
  onSelect?: (sessionId: string) => void
}

export function CoachSessionList({ sessions = [], selectedSessionId, onSelect }: CoachSessionListProps) {

  return (
    <Card className="border-border-hover bg-background-secondary/70 backdrop-blur-xs">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-text-primary">Active Sessions</CardTitle>
        <CardDescription>Select a session to review guidance and metrics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => {
          const isSelected = session.id === selectedSessionId
          return (
            <button
              key={session.id}
              onClick={() => onSelect?.(session.id)}
              className={cn(
                'w-full rounded-xl border border-border-default bg-background-primary/40 p-4 text-left transition-all duration-200 hover:border-accent-primary/60 hover:shadow-lg',
                isSelected && 'border-accent-primary/60 shadow-glow'
              )}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{session.symbol}</div>
                  <div className="text-xs text-text-tertiary">
                    Updated {formatDateTime(session.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-border-hover text-text-secondary">
                    {session.timeframeMinutes}m
                  </Badge>
                  <Badge className={cn('uppercase tracking-wide', stateBadge[session.state] ?? 'text-text-tertiary')}>
                    {session.state}
                  </Badge>
                </div>
              </div>
            </button>
          )
        })}
        {sessions.length === 0 && (
          <div className="rounded-xl border border-dashed border-border-default bg-background-primary/40 p-6 text-center text-text-tertiary">
            No sessions yet. Launch a session to see it appear here.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CoachSessionList
