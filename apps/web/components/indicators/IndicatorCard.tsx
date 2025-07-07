import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export interface IndicatorCardProps {
  name: string;
  value?: number | string;
  signal?: 'buy' | 'sell' | 'neutral' | 'strong-buy' | 'strong-sell';
  change?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const signalColors = {
  'buy': 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/50',
  'strong-buy': 'bg-accent-secondary/30 text-accent-secondary border-accent-secondary',
  'sell': 'bg-accent-danger/20 text-accent-danger border-accent-danger/50',
  'strong-sell': 'bg-accent-danger/30 text-accent-danger border-accent-danger',
  'neutral': 'bg-text-tertiary/20 text-text-secondary border-text-tertiary/50',
};

const signalLabels = {
  'buy': 'Buy',
  'strong-buy': 'Strong Buy',
  'sell': 'Sell',
  'strong-sell': 'Strong Sell',
  'neutral': 'Neutral',
};

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
  name,
  value,
  signal,
  change,
  settings,
  isActive = true,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        'hover:border-border-hover hover:shadow-lg',
        isActive ? 'opacity-100' : 'opacity-60',
        onClick && 'hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold text-text-primary">{name}</h4>
            {settings && (
              <div className="mt-1 text-sm text-text-tertiary">
                {Object.entries(settings).map(([key, val]) => (
                  <span key={key} className="mr-3">
                    {key}: <span className="text-text-secondary">{val}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {signal && (
            <Badge className={cn('px-2 py-1', signalColors[signal])}>
              {signalLabels[signal]}
            </Badge>
          )}
        </div>

        {/* Value Display */}
        {value !== undefined && (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
            {change !== undefined && (
              <span
                className={cn(
                  'text-sm font-medium',
                  change > 0 ? 'text-accent-secondary' : 'text-accent-danger'
                )}
              >
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            )}
          </div>
        )}

        {/* Active Indicator */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-primary/50 backdrop-blur-sm rounded-lg">
            <span className="text-text-tertiary font-medium">Inactive</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default IndicatorCard;
