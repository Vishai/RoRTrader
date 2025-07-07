'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import { useChartData } from '@/hooks/useMarketData';
import { useChartIndicators } from '@/hooks/useIndicators';
import { Candle } from '@/services/market-data.service';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  exchange: 'coinbase' | 'alpaca' | 'binance';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
  height?: number;
  width?: number;
  enableLive?: boolean;
  indicators?: Array<{
    id: string;
    name: string;
    parameters: Record<string, any>;
    color?: string;
    visible?: boolean;
  }>;
  onCandleHover?: (candle: CandlestickData | null) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  exchange,
  timeframe,
  height = 400,
  width,
  enableLive = true,
  indicators = [],
  onCandleHover,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Fetch market data with real-time updates
  const { candles, isLoading, error, isLive } = useChartData(
    symbol,
    exchange,
    timeframe,
    true
  );

  // Fetch indicator calculations
  const { indicators: indicatorData } = useChartIndicators(
    symbol,
    timeframe,
    indicators.filter(ind => ind.visible !== false),
    candles.length > 0
  );

  // Convert candles to chart format
  const chartData: CandlestickData[] = candles.map(candle => ({
    time: candle.time as any, // lightweight-charts expects time in seconds
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));

  const volumeData = candles.map(candle => ({
    time: candle.time as any,
    value: candle.volume,
    color: candle.close >= candle.open ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 102, 0.5)',
  }));

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: width || chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#1C1C1F' },
        textColor: '#B8B8BD',
      },
      grid: {
        vertLines: { color: '#2A2A30' },
        horzLines: { color: '#2A2A30' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#00D4FF',
          labelBackgroundColor: '#00D4FF',
        },
        horzLine: {
          color: '#00D4FF',
          labelBackgroundColor: '#00D4FF',
        },
      },
      rightPriceScale: {
        borderColor: '#2A2A30',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: '#2A2A30',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const mainSeries = chart.addCandlestickSeries({
      upColor: '#00FF88',
      downColor: '#FF3366',
      borderVisible: false,
      wickUpColor: '#00FF88',
      wickDownColor: '#FF3366',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    mainSeries.setData(chartData);
    volumeSeries.setData(volumeData);

    // Handle crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (onCandleHover) {
        if (param.time && param.seriesPrices.has(mainSeries)) {
          const data = param.seriesPrices.get(mainSeries) as CandlestickData;
          onCandleHover(data);
        } else {
          onCandleHover(null);
        }
      }
    });

    // Fit content
    chart.timeScale().fitContent();

    // Store references
    chartRef.current = chart;
    mainSeriesRef.current = mainSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData.length, height, width]);

  // Update chart data
  useEffect(() => {
    if (mainSeriesRef.current && chartData.length > 0) {
      mainSeriesRef.current.setData(chartData);
    }
    if (volumeSeriesRef.current && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData);
    }
  }, [chartData, volumeData]);

  // Update indicators
  useEffect(() => {
    if (!chartRef.current) return;

    // Clear existing indicator series
    indicatorSeriesRefs.current.forEach((series, id) => {
      chartRef.current!.removeSeries(series);
    });
    indicatorSeriesRefs.current.clear();

    // Add new indicator series
    indicatorData.forEach((indicator) => {
      if (!indicator.data) return;

      const series = chartRef.current!.addLineSeries({
        color: indicator.color || '#00D4FF',
        lineWidth: 2,
        title: indicator.id,
      });

      const lineData: LineData[] = indicator.data.values.map(point => ({
        time: new Date(point.timestamp).getTime() / 1000 as any,
        value: typeof point.value === 'number' ? point.value : 0,
      }));

      series.setData(lineData);
      indicatorSeriesRefs.current.set(indicator.id, series);
    });
  }, [indicatorData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-[#1C1C1F] rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF] mx-auto mb-2" />
          <p className="text-[#B8B8BD]">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-[#1C1C1F] rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-[#FF3366] mx-auto mb-2" />
          <p className="text-[#B8B8BD]">Failed to load chart data</p>
          <p className="text-[#6B6B73] text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // Chart status indicator
  const getStatusIcon = () => {
    if (!candles.length) return null;
    const lastCandle = candles[candles.length - 1];
    const priceChange = lastCandle.close - lastCandle.open;
    
    if (priceChange > 0) {
      return <TrendingUp className="w-4 h-4 text-[#00FF88]" />;
    } else if (priceChange < 0) {
      return <TrendingDown className="w-4 h-4 text-[#FF3366]" />;
    }
    return <Activity className="w-4 h-4 text-[#B8B8BD]" />;
  };

  return (
    <div className="relative">
      {/* Chart header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[#1C1C1F]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#2A2A30]">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {symbol} · {exchange.toUpperCase()} · {timeframe}
          </span>
        </div>
        
        {isLive && (
          <div className="flex items-center gap-1.5 bg-[#00FF88]/10 px-2.5 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
            <span className="text-xs text-[#00FF88]">LIVE</span>
          </div>
        )}
      </div>

      {/* Chart container */}
      <div ref={chartContainerRef} className="relative bg-[#1C1C1F] rounded-lg" />
    </div>
  );
};

export default TradingViewChart;