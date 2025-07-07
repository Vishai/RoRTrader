import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { 
  PlayCircle, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

interface BacktestResult {
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  startDate: Date;
  endDate: Date;
}

interface BacktestingPreviewPanelProps {
  isRunning?: boolean;
  result?: BacktestResult;
  onRunBacktest?: () => void;
  onStopBacktest?: () => void;
  timeframe?: string;
  className?: string;
}

export const BacktestingPreviewPanel: React.FC<BacktestingPreviewPanelProps> = ({
  isRunning = false,
  result,
  onRunBacktest,
  onStopBacktest,
  timeframe = '1Y',
  className,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Backtest Results</h3>
          <p className="text-sm text-text-tertiary mt-1">
            Test your strategy on historical data
          </p>
        </div>
        <Button
          onClick={isRunning ? onStopBacktest : onRunBacktest}
          variant={isRunning ? 'secondary' : 'primary'}
          className="flex items-center gap-2"
        >
          <PlayCircle className="w-4 h-4" />
          {isRunning ? 'Stop' : 'Run Backtest'}
        </Button>
      </div>

      {/* Loading State */}
      {isRunning && !result && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-accent-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-text-secondary">Running backtest...</p>
        </div>
      )}

      {/* Results */}
      {result && !isRunning && (
        <div className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              'p-4 rounded-lg',
              result.totalReturn > 0 
                ? 'bg-accent-secondary/10 border border-accent-secondary/30' 
                : 'bg-accent-danger/10 border border-accent-danger/30'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {result.totalReturn > 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent-secondary" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-accent-danger" />
                )}
                <span className="text-sm text-text-secondary">Total Return</span>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                result.totalReturn > 0 ? 'text-accent-secondary' : 'text-accent-danger'
              )}>
                {formatCurrency(result.totalReturn)}
              </p>
              <p className={cn(
                'text-sm mt-1',
                result.totalReturn > 0 ? 'text-accent-secondary' : 'text-accent-danger'
              )}>
                {formatPercent(result.totalReturnPercent)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background-elevated">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-text-secondary" />
                <span className="text-sm text-text-secondary">Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {result.winRate.toFixed(1)}%
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {result.winningTrades}W / {result.losingTrades}L
              </p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-sm text-text-tertiary">Total Trades</p>
              <p className="text-lg font-semibold text-text-primary">
                {result.totalTrades}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary">Profit Factor</p>
              <p className="text-lg font-semibold text-text-primary">
                {result.profitFactor.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary">Sharpe Ratio</p>
              <p className="text-lg font-semibold text-text-primary">
                {result.sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary">Avg Win</p>
              <p className="text-lg font-semibold text-accent-secondary">
                {formatCurrency(result.averageWin)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary">Avg Loss</p>
              <p className="text-lg font-semibold text-accent-danger">
                {formatCurrency(result.averageLoss)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary">Max Drawdown</p>
              <p className="text-lg font-semibold text-accent-danger">
                -{result.maxDrawdown.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center justify-between pt-4 border-t border-border-default">
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
              <Calendar className="w-4 h-4" />
              <span>
                {result.startDate.toLocaleDateString()} - {result.endDate.toLocaleDateString()}
              </span>
            </div>
            <Button variant="ghost" size="sm">
              View Full Report
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isRunning && (
        <div className="text-center py-12 space-y-3">
          <BarChart3 className="w-12 h-12 text-text-tertiary mx-auto" />
          <p className="text-text-secondary">
            Run a backtest to see how your strategy would have performed
          </p>
          <p className="text-sm text-text-tertiary">
            Test on {timeframe} of historical data
          </p>
        </div>
      )}
    </Card>
  );
};

export default BacktestingPreviewPanel;
