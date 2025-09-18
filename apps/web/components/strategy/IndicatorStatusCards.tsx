'use client';

import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { IndicatorCard } from '../indicators/IndicatorCard';
import { useLiveIndicators } from '@/hooks/useIndicators';
import { useIndicatorSignal } from '@/hooks/useIndicators';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { BatchIndicatorRequest } from '@/services/analysis.service';

interface IndicatorConfig {
  id: string;
  name: string;
  parameters?: Record<string, any>;
  isActive?: boolean;
}

interface IndicatorStatusCardsProps {
  symbol: string;
  timeframe: string;
  indicators: IndicatorConfig[];
  refreshInterval?: number;
  onIndicatorClick?: (indicator: any) => void;
  className?: string;
}

export const IndicatorStatusCards: React.FC<IndicatorStatusCardsProps> = ({
  symbol,
  timeframe,
  indicators,
  refreshInterval = 5000,
  onIndicatorClick,
  className,
}) => {
  // Prepare batch request
  const batchRequest: BatchIndicatorRequest | null = useMemo(() => {
    const activeIndicators = indicators.filter(ind => ind.isActive !== false);
    if (activeIndicators.length === 0) return null;

    return {
      symbol,
      timeframe,
      indicators: activeIndicators.map(ind => ({
        indicator: ind.id,
        parameters: ind.parameters || {},
      })),
      bars: 100,
    };
  }, [symbol, timeframe, indicators]);

  // Fetch live indicator data
  const {
    data,
    isLoading,
    error,
    isLive,
    toggleLive,
    refetch,
  } = useLiveIndicators(batchRequest, refreshInterval);

  // Process overall signal
  const overallSignal = useIndicatorSignal(data?.overallSignal);

  // Map API response to indicator cards
  const indicatorData = useMemo(() => {
    if (!data?.indicators) return [];

    return data.indicators.map(apiIndicator => {
      const config = indicators.find(ind => ind.id === apiIndicator.indicator);
      return {
        id: apiIndicator.indicator,
        name: config?.name || apiIndicator.indicator,
        value: apiIndicator.currentValue,
        signal: apiIndicator.signal,
        trend: apiIndicator.trend,
        parameters: apiIndicator.parameters,
        isActive: config?.isActive,
      };
    });
  }, [data, indicators]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="h-32 bg-background-tertiary rounded-lg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map(ind => (
            <div key={ind.id} className="h-32 bg-background-tertiary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-lg">
          <div className="flex items-center gap-2 text-accent-danger">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Failed to load indicators</span>
          </div>
          <p className="text-text-tertiary text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-accent-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Market Signal */}
      <div className={cn(
        'p-4 rounded-lg border-2 transition-all duration-300',
        overallSignal?.isBullish && 'bg-accent-secondary/10 border-accent-secondary/30',
        overallSignal?.isBearish && 'bg-accent-danger/10 border-accent-danger/30',
        overallSignal?.isNeutral && 'bg-text-tertiary/10 border-text-tertiary/30'
      )}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Overall Market Signal</h3>
          <div className="flex items-center gap-2">
            {isLive && (
              <div className="flex items-center gap-1.5 bg-accent-secondary/10 px-2 py-1 rounded-md">
                <div className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse" />
                <span className="text-xs text-accent-secondary">LIVE</span>
              </div>
            )}
            <button
              onClick={() => toggleLive()}
              className="p-1.5 rounded-md hover:bg-background-elevated transition-colors"
              title={isLive ? 'Pause updates' : 'Resume updates'}
            >
              <RefreshCw className={cn(
                'w-4 h-4',
                isLive && 'animate-spin text-accent-primary'
              )} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span 
              className="text-2xl font-bold"
              style={{ color: overallSignal?.color }}
            >
              {overallSignal?.message || 'Calculating...'}
            </span>
            <span className="text-lg" style={{ color: overallSignal?.color }}>
              {overallSignal?.strengthPercent}%
            </span>
          </div>
          
          {data?.overallSignal && (
            <div className="flex gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="text-accent-secondary">↑</span>
                Bullish: {data.overallSignal.bullishCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-accent-danger">↓</span>
                Bearish: {data.overallSignal.bearishCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-text-tertiary">→</span>
                Neutral: {data.overallSignal.neutralCount}
              </span>
            </div>
          )}
        </div>
        
        {data?.timestamp && (
          <p className="text-xs text-text-tertiary mt-2">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Indicator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicatorData.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            name={indicator.name}
            value={indicator.value}
            signal={indicator.signal?.type}
            strength={indicator.signal?.strength}
            message={indicator.signal?.message}
            trend={indicator.trend}
            settings={indicator.parameters}
            isActive={indicator.isActive}
            onClick={() => onIndicatorClick?.(indicator)}
            isLive={isLive}
          />
        ))}
      </div>

      {/* Empty state */}
      {indicators.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          <p>No indicators configured</p>
          <p className="text-sm mt-1">Add indicators to see market signals</p>
        </div>
      )}
    </div>
  );
};

export default IndicatorStatusCards;