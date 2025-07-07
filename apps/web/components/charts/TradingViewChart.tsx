'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface TradingViewChartProps {
  data: {
    time: string | number;
    value?: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  }[];
  type?: 'line' | 'candlestick' | 'area' | 'bar';
  height?: number;
  width?: number;
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
  indicators?: {
    sma?: { period: number; color: string }[];
    ema?: { period: number; color: string }[];
    bollinger?: { period: number; stdDev: number };
    rsi?: { period: number; overbought: number; oversold: number };
  };
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  type = 'candlestick',
  height = 400,
  width,
  colors = {
    backgroundColor: '#1C1C1F',
    lineColor: '#00D4FF',
    textColor: '#B8B8BD',
    areaTopColor: 'rgba(0, 212, 255, 0.56)',
    areaBottomColor: 'rgba(0, 212, 255, 0.04)',
  },
  indicators,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor },
        textColor: colors.textColor,
      },
      width: width || chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: {
          color: '#2A2A30',
          style: 1,
          visible: true,
        },
        horzLines: {
          color: '#2A2A30',
          style: 1,
          visible: true,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6B6B73',
          width: 1,
          style: 1,
          labelBackgroundColor: '#242428',
        },
        horzLine: {
          color: '#6B6B73',
          width: 1,
          style: 1,
          labelBackgroundColor: '#242428',
        },
      },
      rightPriceScale: {
        borderColor: '#2A2A30',
      },
      timeScale: {
        borderColor: '#2A2A30',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create main series based on type
    let series;
    switch (type) {
      case 'line':
        series = chart.addLineSeries({
          color: colors.lineColor,
          lineWidth: 2,
        });
        break;
      case 'area':
        series = chart.addAreaSeries({
          lineColor: colors.lineColor,
          topColor: colors.areaTopColor,
          bottomColor: colors.areaBottomColor,
          lineWidth: 2,
        });
        break;
      case 'bar':
        series = chart.addBarSeries({
          upColor: '#00FF88',
          downColor: '#FF3366',
        });
        break;
      case 'candlestick':
      default:
        series = chart.addCandlestickSeries({
          upColor: '#00FF88',
          downColor: '#FF3366',
          borderDownColor: '#FF3366',
          borderUpColor: '#00FF88',
          wickDownColor: '#FF3366',
          wickUpColor: '#00FF88',
        });
        break;
    }

    seriesRef.current = series;

    // Set data
    if (data && data.length > 0) {
      series.setData(data as any);
      setIsLoading(false);
    }

    // Add indicators if requested
    if (indicators) {
      // Simple Moving Average
      if (indicators.sma) {
        indicators.sma.forEach((smaConfig) => {
          const smaData = calculateSMA(data, smaConfig.period);
          const smaSeries = chart.addLineSeries({
            color: smaConfig.color,
            lineWidth: 1,
            title: `SMA ${smaConfig.period}`,
          });
          smaSeries.setData(smaData);
        });
      }

      // Exponential Moving Average
      if (indicators.ema) {
        indicators.ema.forEach((emaConfig) => {
          const emaData = calculateEMA(data, emaConfig.period);
          const emaSeries = chart.addLineSeries({
            color: emaConfig.color,
            lineWidth: 1,
            title: `EMA ${emaConfig.period}`,
          });
          emaSeries.setData(emaData);
        });
      }
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: width || chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, type, height, width, colors, indicators]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-secondary/50 backdrop-blur-sm">
          <div className="text-text-secondary">Loading chart...</div>
        </div>
      )}
      <div ref={chartContainerRef} className="trading-chart" />
    </div>
  );
};

// Helper functions for indicators
function calculateSMA(data: any[], period: number) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close || data[i - j].value || 0;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return result;
}

function calculateEMA(data: any[], period: number) {
  const result = [];
  const k = 2 / (period + 1);
  
  // Start with SMA for the first value
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i].close || data[i].value || 0;
  }
  
  if (data.length >= period) {
    let ema = sum / period;
    result.push({
      time: data[period - 1].time,
      value: ema,
    });
    
    // Calculate EMA for rest of the data
    for (let i = period; i < data.length; i++) {
      const price = data[i].close || data[i].value || 0;
      ema = (price - ema) * k + ema;
      result.push({
        time: data[i].time,
        value: ema,
      });
    }
  }
  
  return result;
}

export default TradingViewChart;
