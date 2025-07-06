import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-background-tertiary text-text-primary',
        primary: 'bg-accent-primary/20 text-accent-primary',
        secondary: 'bg-accent-secondary/20 text-accent-secondary',
        danger: 'bg-accent-danger/20 text-accent-danger',
        warning: 'bg-accent-warning/20 text-accent-warning',
        purple: 'bg-accent-purple/20 text-accent-purple',
        outline: 'border border-border-default',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
