'use client';

import React, { useState, useRef, useEffect } from 'react';
import TradingViewChart from './Chart';
import { TickerSearch } from '@/components/ui/TickerSearch';
import { Button } from '@/components/ui/Button';
import {
  LineChart,
  CandlestickChart,
  BarChart3,
  Activity,
  TrendingUp,
  Download,
  Maximize2,
  Plus,
} from 'lucide-react';
import type { ChartInstance, ChartType, MarketCandle, Indicator } from './ChartTypes';
import { TIMEFRAMES } from './ChartTypes';
import { useChartData } from '@/hooks/useMarketData';

interface ChartContainerProps {
  initialSymbol?: string;
  initialTimeframe?: string;
  initialType?: ChartType;
  exchange?: 'coinbase' | 'alpaca' | 'binance';
  height?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  onSymbolChange?: (symbol: string) => void;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  initialSymbol = 'AAPL',
  initialTimeframe = '1d',
  initialType = 'candlestick',
  exchange = 'alpaca',
  height = 500,
  showControls = true,
  showIndicators = true,
  onSymbolChange,
  className = '',
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [chartType, setChartType] = useState<ChartType>(initialType);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);

  const chartRef = useRef<ChartInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch market data
  const { candles, isLoading, error, metadata } = useChartData(
    symbol,
    exchange,
    timeframe,
    true
  );

  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    if (onSymbolChange) {
      onSymbolChange(newSymbol);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    if (chartRef.current) {
      chartRef.current.setChartType(type);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
  };

  // Toggle indicator
  const toggleIndicator = (indicatorType: string) => {
    setIndicators(prev => {
      const existing = prev.find(ind => ind.name === indicatorType);
      if (existing) {
        return prev.filter(ind => ind.name !== indicatorType);
      } else {
        const newIndicator: Indicator = {
          id: `${indicatorType}-${Date.now()}`,
          name: indicatorType,
          type: indicatorType === 'RSI' || indicatorType === 'MACD' ? 'panel' : 'overlay',
          enabled: true,
          parameters: getDefaultIndicatorParams(indicatorType),
          color: getIndicatorColor(indicatorType),
        };
        return [...prev, newIndicator];
      }
    });
  };

  // Get default indicator parameters
  const getDefaultIndicatorParams = (type: string): Record<string, any> => {
    switch (type) {
      case 'SMA':
        return { period: 20, type: 'sma' };
      case 'EMA':
        return { period: 12, type: 'ema' };
      case 'RSI':
        return { period: 14, overbought: 70, oversold: 30 };
      case 'MACD':
        return { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
      case 'Bollinger':
        return { period: 20, stdDev: 2 };
      default:
        return {};
    }
  };

  // Get indicator color
  const getIndicatorColor = (type: string): string => {
    const colors = {
      SMA: '#FFB800',
      EMA: '#00D4FF',
      RSI: '#9945FF',
      MACD: '#FF6B6B',
      Bollinger: '#4ECDC4',
    };
    return colors[type as keyof typeof colors] || '#FFB800';
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle screenshot
  const takeScreenshot = () => {
    if (chartRef.current) {
      const dataUrl = chartRef.current.takeScreenshot();
      if (!dataUrl) {
        return;
      }
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${symbol}_${timeframe}_${new Date().getTime()}.png`;
      link.click();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const resolvedHeight = isFullscreen && typeof window !== 'undefined'
    ? Math.max(300, window.innerHeight - 100)
    : height;

  return (
    <div
      ref={containerRef}
      className={`bg-background-secondary rounded-lg border border-border-default ${className}`}
    >
      {showControls && (
        <div className="border-b border-border-default p-4">
          {/* Top Controls Row */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              {/* Symbol Search */}
              <div className="w-64">
                <TickerSearch
                  value={symbol}
                  onChange={handleSymbolChange}
                  placeholder="Search ticker..."
                />
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1">
                {Object.entries(TIMEFRAMES).slice(0, 9).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => handleTimeframeChange(key)}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      timeframe === key
                        ? 'bg-accent-primary text-white'
                        : 'bg-background-elevated text-text-secondary hover:bg-background-tertiary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-1 bg-background-elevated rounded p-1">
                <button
                  onClick={() => handleChartTypeChange('candlestick')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'candlestick'
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Candlestick"
                >
                  <CandlestickChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleChartTypeChange('line')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'line'
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Line"
                >
                  <LineChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleChartTypeChange('bar')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'bar'
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Bar"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleChartTypeChange('area')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'area'
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Area"
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={takeScreenshot}
                title="Take Screenshot"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Indicators Row */}
          {showIndicators && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Indicators:</span>
              <div className="flex items-center gap-1">
                {['SMA', 'EMA', 'RSI', 'MACD', 'Bollinger'].map(ind => {
                  const isActive = indicators.some(i => i.name === ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => toggleIndicator(ind)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        isActive
                          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary'
                          : 'bg-background-elevated text-text-secondary hover:bg-background-tertiary'
                      }`}
                    >
                      {ind}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
                  className="p-1 text-text-secondary hover:text-text-primary"
                  title="More Indicators"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart Area */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-primary/80 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-2"></div>
              <p className="text-text-secondary">Loading chart data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-primary/80 z-10">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-accent-danger mx-auto mb-2" />
              <p className="text-text-primary mb-1">Failed to load chart data</p>
              <p className="text-text-tertiary text-sm">{error.message}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && candles.length > 0 && (
          <TradingViewChart
            ref={chartRef}
            data={candles as MarketCandle[]}
            config={{
              type: chartType,
              theme: 'dark',
              height: resolvedHeight,
              autoSize: true,
              timeScale: {
                barSpacing: 15,
                minBarSpacing: 5,
                rightOffset: 12,
                lockVisibleTimeRangeOnResize: false,
                fixLeftEdge: false,
                rightBarStaysOnScroll: true,
              },
              priceScale: {
                position: 'right',
                autoScale: true,
                scaleMargins: {
                  top: 0.1,
                  bottom: 0.25,
                },
              },
            }}
            indicators={indicators}
            showVolume={true}
            events={{
              onCrosshairMove: (_params) => {
                // Handle crosshair move
              },
            }}
          />
        )}

        {/* Market Status */}
        {metadata && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {metadata.dataSource && (
              <div className="px-2 py-1 bg-background-primary/80 rounded text-xs text-text-tertiary">
                {metadata.dataSource === 'demo' ? 'Demo Data' : metadata.dataSource.toUpperCase()}
              </div>
            )}
            {metadata.cached && (
              <div className="px-2 py-1 bg-accent-primary/20 rounded text-xs text-accent-primary">
                Cached
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
