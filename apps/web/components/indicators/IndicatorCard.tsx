import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export interface IndicatorCardProps {
  name: string;
  value?: number | string | Record<string, number>;
  signal?: 'buy' | 'sell' | 'neutral' | 'strong-buy' | 'strong-sell';
  strength?: number;
  message?: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
  isLive?: boolean;
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

const trendIcons = {
  'up': TrendingUp,
  'down': TrendingDown,
  'neutral': Minus,
};

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
  name,
  value,
  signal,
  strength,
  message,
  trend,
  change,
  settings,
  isActive = true,
  isLive = false,
  onClick,
  className,
}) => {
  // Format value display
  const formatValue = (val: typeof value): string => {
    if (val === undefined || val === null) return 'N/A';
    
    if (typeof val === 'number') {
      return val.toFixed(2);
    } else if (typeof val === 'string') {
      return val;
    } else if (typeof val === 'object') {
      // Handle multi-value indicators like Bollinger Bands
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${v.toFixed(2)}`)
        .join(' | ');
    }
    return String(val);
  };

  // Get signal label with strength
  const getSignalLabel = () => {
    if (!signal) return null;
    const label = signalLabels[signal];
    if (strength !== undefined) {
      return `${label} (${Math.round(strength * 100)}%)`;
    }
    return label;
  };

  const TrendIcon = trend ? trendIcons[trend] : Activity;

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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-text-primary">{name}</h4>
              {isLive && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full animate-pulse" />
                  <span className="text-xs text-accent-secondary">LIVE</span>
                </div>
              )}
            </div>
            {settings && Object.keys(settings).length > 0 && (
              <div className="mt-1 text-xs text-text-tertiary">
                {Object.entries(settings).map(([key, val]) => (
                  <span key={key} className="mr-3">
                    {key}: <span className="text-text-secondary">{val}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {signal && (
            <Badge className={cn('px-2 py-1 text-xs', signalColors[signal])}>
              {getSignalLabel()}
            </Badge>
          )}
        </div>

        {/* Value Display */}
        {value !== undefined && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {formatValue(value)}
              </span>
              {trend && (
                <TrendIcon 
                  className={cn(
                    'w-5 h-5',
                    trend === 'up' && 'text-accent-secondary',
                    trend === 'down' && 'text-accent-danger',
                    trend === 'neutral' && 'text-text-tertiary'
                  )}
                />
              )}
            </div>
            
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    change > 0 ? 'text-accent-secondary' : 'text-accent-danger'
                  )}
                >
                  {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            )}
            
            {message && (
              <p className="text-xs text-text-secondary line-clamp-2">
                {message}
              </p>
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