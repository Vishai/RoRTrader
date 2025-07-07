import React from 'react';
import { cn } from '../../lib/utils';
import { IndicatorCard } from '../indicators/IndicatorCard';

interface IndicatorStatus {
  id: string;
  name: string;
  value: number | string;
  signal?: 'buy' | 'sell' | 'neutral' | 'strong-buy' | 'strong-sell';
  change?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
}

interface IndicatorStatusCardsProps {
  indicators: IndicatorStatus[];
  onIndicatorClick?: (indicator: IndicatorStatus) => void;
  className?: string;
}

export const IndicatorStatusCards: React.FC<IndicatorStatusCardsProps> = ({
  indicators,
  onIndicatorClick,
  className,
}) => {
  // Group indicators by signal strength for summary
  const signalSummary = indicators.reduce((acc, ind) => {
    if (ind.signal && ind.isActive !== false) {
      acc[ind.signal] = (acc[ind.signal] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate overall signal
  const buySignals = (signalSummary['buy'] || 0) + (signalSummary['strong-buy'] || 0) * 2;
  const sellSignals = (signalSummary['sell'] || 0) + (signalSummary['strong-sell'] || 0) * 2;
  const totalSignals = buySignals + sellSignals;
  
  let overallSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (totalSignals > 0) {
    const bullishPercent = (buySignals / totalSignals) * 100;
    if (bullishPercent > 60) overallSignal = 'bullish';
    else if (bullishPercent < 40) overallSignal = 'bearish';
  }

  const overallColors = {
    bullish: 'bg-accent-secondary/10 border-accent-secondary/30 text-accent-secondary',
    bearish: 'bg-accent-danger/10 border-accent-danger/30 text-accent-danger',
    neutral: 'bg-text-tertiary/10 border-text-tertiary/30 text-text-secondary',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Market Signal */}
      <div className={cn(
        'p-4 rounded-lg border-2',
        overallColors[overallSignal]
      )}>
        <h3 className="text-lg font-semibold mb-2">Overall Market Signal</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold capitalize">{overallSignal}</span>
          <div className="flex gap-4 text-sm">
            {Object.entries(signalSummary).map(([signal, count]) => (
              <span key={signal} className="flex items-center gap-1">
                <span className="capitalize">{signal.replace('-', ' ')}:</span>
                <span className="font-semibold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Indicator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            name={indicator.name}
            value={indicator.value}
            signal={indicator.signal}
            change={indicator.change}
            settings={indicator.settings}
            isActive={indicator.isActive}
            onClick={() => onIndicatorClick?.(indicator)}
          />
        ))}
      </div>
    </div>
  );
};

export default IndicatorStatusCards;
