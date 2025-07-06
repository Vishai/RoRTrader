import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const statVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      trend: {
        up: 'text-accent-secondary',
        down: 'text-accent-danger',
        neutral: 'text-text-secondary',
      },
    },
    defaultVariants: {
      trend: 'neutral',
    },
  }
)

export interface StatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statVariants> {
  label: string
  value: string | number
  change?: string | number
  changeLabel?: string
  icon?: React.ReactNode
  loading?: boolean
}

function Stat({
  className,
  label,
  value,
  change,
  changeLabel,
  icon,
  trend,
  loading,
  ...props
}: StatProps) {
  // Auto-detect trend if not provided
  const autoTrend = React.useMemo(() => {
    if (trend) return trend
    if (!change) return 'neutral'
    const numChange = typeof change === 'string' ? parseFloat(change) : change
    if (numChange > 0) return 'up'
    if (numChange < 0) return 'down'
    return 'neutral'
  }, [change, trend])

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[autoTrend]

  if (loading) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        <div className="h-4 w-24 bg-background-tertiary rounded animate-pulse" />
        <div className="h-8 w-32 bg-background-tertiary rounded animate-pulse" />
        <div className="h-3 w-20 bg-background-tertiary rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && <div className="text-text-tertiary">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1', statVariants({ trend: autoTrend }))}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{change}</span>
            {changeLabel && (
              <span className="text-xs text-text-tertiary">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

Stat.displayName = 'Stat'

export { Stat, statVariants }
