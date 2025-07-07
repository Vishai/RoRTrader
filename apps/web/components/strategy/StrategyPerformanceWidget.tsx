import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  Trophy,
  AlertTriangle
} from 'lucide-react';

interface StrategyPerformanceWidgetProps {
  name: string;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  status: 'active' | 'paused' | 'stopped';
  lastUpdated?: Date;
  className?: string;
  onClick?: () => void;
}

export const StrategyPerformanceWidget: React.FC<StrategyPerformanceWidgetProps> = ({
  name,
  winRate,
  totalTrades,
  profitFactor,
  sharpeRatio,
  maxDrawdown,
  status,
  lastUpdated,
  className,
  onClick,
}) => {
  const statusColors = {
    active: 'bg-accent-secondary/20 text-accent-secondary',
    paused: 'bg-accent-warning/20 text-accent-warning',
    stopped: 'bg-text-tertiary/20 text-text-tertiary',
  };

  const getPerformanceColor = (value: number, metric: string) => {
    switch (metric) {
      case 'winRate':
        return value >= 60 ? 'text-accent-secondary' : value >= 40 ? 'text-accent-warning' : 'text-accent-danger';
      case 'profitFactor':
        return value >= 1.5 ? 'text-accent-secondary' : value >= 1 ? 'text-accent-warning' : 'text-accent-danger';
      case 'sharpe':
        return value >= 2 ? 'text-accent-secondary' : value >= 1 ? 'text-accent-warning' : 'text-accent-danger';
      case 'drawdown':
        return value <= 10 ? 'text-accent-secondary' : value <= 20 ? 'text-accent-warning' : 'text-accent-danger';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:border-accent-primary/50 hover:shadow-lg',
        onClick && 'hover:scale-[1.01]',
        className
      )}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
              statusColors[status]
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <Trophy className="w-5 h-5 text-accent-warning" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Win Rate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-tertiary">Win Rate</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              getPerformanceColor(winRate, 'winRate')
            )}>
              {winRate.toFixed(1)}%
            </p>
          </div>

          {/* Profit Factor */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-tertiary">Profit Factor</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              getPerformanceColor(profitFactor, 'profitFactor')
            )}>
              {profitFactor.toFixed(2)}
            </p>
          </div>

          {/* Sharpe Ratio */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-tertiary">Sharpe Ratio</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              getPerformanceColor(sharpeRatio, 'sharpe')
            )}>
              {sharpeRatio.toFixed(2)}
            </p>
          </div>

          {/* Max Drawdown */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-tertiary">Max Drawdown</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              getPerformanceColor(maxDrawdown, 'drawdown')
            )}>
              -{maxDrawdown.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border-default">
          <div className="flex items-center justify-between text-sm text-text-tertiary">
            <span>{totalTrades} trades</span>
            {lastUpdated && (
              <span>Updated {new Date(lastUpdated).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StrategyPerformanceWidget;
