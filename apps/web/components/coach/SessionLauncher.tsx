'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type SessionLauncherProps = {
  defaultSymbol?: string
  defaultTimeframe?: number
  isRunning?: boolean
  onStart?: (payload: { symbol: string; timeframeMinutes: number }) => void
  onStop?: () => void
}

const timeframes = [1, 3, 5, 15, 30, 60]

export function SessionLauncher({
  defaultSymbol = 'AAPL',
  defaultTimeframe = 5,
  isRunning = false,
  onStart,
  onStop,
}: SessionLauncherProps) {
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [timeframe, setTimeframe] = useState(defaultTimeframe)
  const [pending, setPending] = useState(false)

  const handleStart = async () => {
    if (!symbol) return
    try {
      setPending(true)
      onStart?.({ symbol: symbol.toUpperCase(), timeframeMinutes: timeframe })
    } finally {
      setPending(false)
    }
  }

  const handleStop = async () => {
    try {
      setPending(true)
      onStop?.()
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="border-border-hover bg-background-secondary/70 backdrop-blur-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-text-primary">Session Launcher</CardTitle>
            <CardDescription>Configure symbol and timeframe for live coaching.</CardDescription>
          </div>
          <Badge className={cn('border border-border-hover bg-background-primary/40', isRunning ? 'text-accent-secondary' : 'text-text-tertiary')}>
            {isRunning ? 'Active' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary" htmlFor="coach-symbol">
              Symbol
            </label>
            <Input
              id="coach-symbol"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              maxLength={12}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary" htmlFor="coach-timeframe">
              Timeframe (minutes)
            </label>
            <div className="flex flex-wrap gap-2">
              {timeframes.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeframe(value)}
                  className={cn(
                    'rounded-xl border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors',
                    timeframe === value && 'border-accent-primary text-accent-primary'
                  )}
                >
                  {value}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleStart}
            disabled={pending || !symbol || isRunning}
            className="flex-1"
          >
            Start Session
          </Button>
          <Button
            variant="outline"
            onClick={handleStop}
            disabled={pending || !isRunning}
            className="flex-1"
          >
            Stop Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionLauncher
