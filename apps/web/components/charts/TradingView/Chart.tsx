'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  LineStyle,
  PriceScaleMode,
  SeriesType,
  createChart,
} from 'lightweight-charts';
import type {
  ChartConfig,
  ChartEventHandlers,
  ChartInstance,
  ChartType,
  Indicator,
  MarketCandle,
} from './ChartTypes';
import { CHART_THEMES } from './ChartTypes';
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  formatCandlestickData,
  formatLineData,
  formatVolumeData,
} from './ChartUtils';

interface TradingViewChartProps {
  data: MarketCandle[];
  config?: ChartConfig;
  onReady?: (chart: ChartInstance) => void;
  events?: ChartEventHandlers;
  indicators?: Indicator[];
  showVolume?: boolean;
  className?: string;
}

const INDICATOR_COLORS: Record<string, string> = {
  sma: '#FFB800',
  ema: '#00D4FF',
  rsi: '#9945FF',
  macd: '#FF6B6B',
  bollinger: '#4ECDC4',
};

const clampLineWidth = (value?: number): 1 | 2 | 3 | 4 => {
  const normalized = Math.min(4, Math.max(1, Math.round(value ?? 2)));
  return normalized as 1 | 2 | 3 | 4;
};

type AnySeries = ISeriesApi<SeriesType>;

type IndicatorSeriesEntry = {
  series: AnySeries;
  extraSeries?: AnySeries[];
  paneIndex?: number;
  type: Indicator['type'];
};

const TradingViewChart = forwardRef<ChartInstance, TradingViewChartProps>((props, ref) => {
  const {
    data,
    config = {},
    onReady,
    events = {},
    indicators = [],
    showVolume = true,
    className = '',
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<AnySeries | null>(null);
  const volumeSeriesRef = useRef<AnySeries | null>(null);
  const indicatorSeriesRef = useRef<Map<string, IndicatorSeriesEntry>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const subscriptionsRef = useRef<Array<() => void>>([]);
  const paneIndexRef = useRef<Map<string, number>>(new Map());
  const nextPaneIndexRef = useRef(1);
  const latestDataRef = useRef<MarketCandle[]>(data);
  const currentChartTypeRef = useRef<ChartType>(config.type ?? 'candlestick');

  const [isInitialized, setIsInitialized] = useState(false);

  const theme = config.theme ?? 'dark';
  const themeConfig = CHART_THEMES[theme];

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  const ensurePaneIndex = useCallback((indicatorId: string) => {
    const existing = paneIndexRef.current.get(indicatorId);
    if (existing !== undefined) {
      return existing;
    }
    const index = nextPaneIndexRef.current++;
    paneIndexRef.current.set(indicatorId, index);
    return index;
  }, []);

  const removeIndicatorSeries = useCallback((indicatorId: string) => {
    const entry = indicatorSeriesRef.current.get(indicatorId);
    if (!entry || !chartRef.current) return;

    chartRef.current.removeSeries(entry.series);
    entry.extraSeries?.forEach(series => {
      chartRef.current?.removeSeries(series);
    });

    indicatorSeriesRef.current.delete(indicatorId);
    paneIndexRef.current.delete(indicatorId);
  }, []);

  const createMainSeries = useCallback((chart: IChartApi, type: ChartType) => {
    if (mainSeriesRef.current) {
      chart.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }

    let series: AnySeries;

    switch (type) {
      case 'line':
        series = chart.addSeries(LineSeries, {
          color: '#00D4FF',
          lineWidth: clampLineWidth(2),
          priceLineVisible: true,
          lastValueVisible: true,
        });
        break;
      case 'area':
        series = chart.addSeries(AreaSeries, {
          lineColor: '#00D4FF',
          topColor: 'rgba(0, 212, 255, 0.4)',
          bottomColor: 'rgba(0, 212, 255, 0)',
          lineWidth: clampLineWidth(2),
          priceLineVisible: true,
          lastValueVisible: true,
        });
        break;
      case 'bar':
        series = chart.addSeries(BarSeries, {
          upColor: themeConfig.candlestick.upColor,
          downColor: themeConfig.candlestick.downColor,
          openVisible: true,
          thinBars: false,
        });
        break;
      case 'baseline':
        series = chart.addSeries(BaselineSeries, {
          baseValue: { type: 'price', price: 0 },
          topFillColor1: 'rgba(0, 255, 136, 0.4)',
          topFillColor2: 'rgba(0, 255, 136, 0)',
          topLineColor: themeConfig.candlestick.upColor,
          bottomFillColor1: 'rgba(255, 51, 102, 0)',
          bottomFillColor2: 'rgba(255, 51, 102, 0.4)',
          bottomLineColor: themeConfig.candlestick.downColor,
          lineWidth: clampLineWidth(2),
        });
        break;
      case 'candlestick':
      default:
        series = chart.addSeries(CandlestickSeries, {
          upColor: themeConfig.candlestick.upColor,
          downColor: themeConfig.candlestick.downColor,
          wickUpColor: themeConfig.candlestick.wickUpColor,
          wickDownColor: themeConfig.candlestick.wickDownColor,
          borderUpColor: themeConfig.candlestick.wickUpColor,
          borderDownColor: themeConfig.candlestick.wickDownColor,
          borderVisible: themeConfig.candlestick.borderVisible,
          priceLineVisible: true,
          lastValueVisible: true,
        });
        break;
    }

    mainSeriesRef.current = series;
    currentChartTypeRef.current = type;
    return series;
  }, [themeConfig]);

  const updateIndicators = useCallback(
    (marketData: MarketCandle[], overrideIndicators?: Indicator[]) => {
      const activeIndicators = (overrideIndicators ?? indicators).filter(ind => ind.enabled !== false);
      const activeIds = new Set(activeIndicators.map(ind => ind.id));

      indicatorSeriesRef.current.forEach((_entry, id) => {
        if (!activeIds.has(id)) {
          removeIndicatorSeries(id);
        }
      });

      if (!chartRef.current || marketData.length === 0) {
        return;
      }

      const ensureOverlaySeries = (
        indicatorId: string,
        color: string,
        lineWidth?: number
      ): AnySeries => {
        let entry = indicatorSeriesRef.current.get(indicatorId);
        if (!entry) {
          const series = chartRef.current!.addSeries(LineSeries, {
            color,
            lineWidth: clampLineWidth(lineWidth),
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          entry = { series, type: 'overlay' };
          indicatorSeriesRef.current.set(indicatorId, entry);
        }
        return entry.series;
      };

      activeIndicators.forEach(indicator => {
        const key = indicator.id;
        const lowerName = indicator.name.toLowerCase();

        switch (lowerName) {
          case 'sma': {
            const period = Number(indicator.parameters.period ?? 20);
            const points = calculateSMA(marketData, period);
            if (!points.length) {
              removeIndicatorSeries(key);
              return;
            }
            const series = ensureOverlaySeries(
              key,
              indicator.color ?? INDICATOR_COLORS.sma,
              indicator.lineWidth,
            );
            series.setData(points);
            break;
          }
          case 'ema': {
            const period = Number(indicator.parameters.period ?? 20);
            const points = calculateEMA(marketData, period);
            if (!points.length) {
              removeIndicatorSeries(key);
              return;
            }
            const series = ensureOverlaySeries(
              key,
              indicator.color ?? INDICATOR_COLORS.ema,
              indicator.lineWidth,
            );
            series.setData(points);
            break;
          }
          case 'bollinger': {
            const period = Number(indicator.parameters.period ?? 20);
            const stdDev = Number(indicator.parameters.stdDev ?? 2);
            const bands = calculateBollingerBands(marketData, period, stdDev);
            if (!bands.middle.length) {
              removeIndicatorSeries(key);
              return;
            }
            let entry = indicatorSeriesRef.current.get(key);
            if (!entry) {
              const middleSeries = chartRef.current!.addSeries(LineSeries, {
                color: indicator.color ?? INDICATOR_COLORS.bollinger,
                lineWidth: clampLineWidth(indicator.lineWidth),
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
              });
              const upperSeries = chartRef.current!.addSeries(LineSeries, {
                color: 'rgba(78, 205, 196, 0.5)',
                lineWidth: clampLineWidth(1),
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
              });
              const lowerSeries = chartRef.current!.addSeries(LineSeries, {
                color: 'rgba(78, 205, 196, 0.5)',
                lineWidth: clampLineWidth(1),
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
              });
              entry = {
                series: middleSeries,
                extraSeries: [upperSeries, lowerSeries],
                type: 'overlay',
              };
              indicatorSeriesRef.current.set(key, entry);
            }
            entry.series.setData(bands.middle);
            entry.extraSeries?.[0]?.setData(bands.upper);
            entry.extraSeries?.[1]?.setData(bands.lower);
            break;
          }
          case 'rsi': {
            const period = Number(indicator.parameters.period ?? 14);
            const rsiPoints = calculateRSI(marketData, period);
            if (!rsiPoints.length) {
              removeIndicatorSeries(key);
              return;
            }
            const paneIndex = ensurePaneIndex(key);
            let entry = indicatorSeriesRef.current.get(key);
            if (!entry) {
              const series = chartRef.current!.addSeries(LineSeries, {
                color: indicator.color ?? INDICATOR_COLORS.rsi,
                lineWidth: clampLineWidth(indicator.lineWidth),
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
                priceScaleId: key,
              }, paneIndex);
              series.priceScale().applyOptions({
                autoScale: true,
                scaleMargins: { top: 0.1, bottom: 0.1 },
              });
              entry = { series, paneIndex, type: 'panel' };
              indicatorSeriesRef.current.set(key, entry);
            }
            entry.series.setData(rsiPoints);
            break;
          }
          case 'macd': {
            const fast = Number(indicator.parameters.fastPeriod ?? 12);
            const slow = Number(indicator.parameters.slowPeriod ?? 26);
            const signalPeriod = Number(indicator.parameters.signalPeriod ?? 9);
            const { macd, signal, histogram } = calculateMACD(marketData, fast, slow, signalPeriod);
            if (!macd.length || !signal.length) {
              removeIndicatorSeries(key);
              return;
            }
            const paneIndex = ensurePaneIndex(key);
            let entry = indicatorSeriesRef.current.get(key);
            if (!entry) {
              const macdSeries = chartRef.current!.addSeries(LineSeries, {
                color: indicator.color ?? INDICATOR_COLORS.macd,
                lineWidth: clampLineWidth(indicator.lineWidth),
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
                priceScaleId: key,
              }, paneIndex);
              const signalSeries = chartRef.current!.addSeries(LineSeries, {
                color: '#4ECDC4',
                lineWidth: clampLineWidth(2),
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
                priceScaleId: key,
              }, paneIndex);
              const histogramSeries = chartRef.current!.addSeries(HistogramSeries, {
                priceScaleId: key,
                priceLineVisible: false,
                lastValueVisible: false,
              }, paneIndex);
              histogramSeries.priceScale().applyOptions({
                autoScale: true,
                scaleMargins: { top: 0.1, bottom: 0.1 },
              });
              entry = {
                series: macdSeries,
                extraSeries: [signalSeries, histogramSeries],
                paneIndex,
                type: 'panel',
              };
              indicatorSeriesRef.current.set(key, entry);
            }
            entry.series.setData(macd);
            entry.extraSeries?.[0]?.setData(signal);
            entry.extraSeries?.[1]?.setData(histogram);
            break;
          }
          default:
            removeIndicatorSeries(key);
            break;
        }
      });
    },
    [indicators, removeIndicatorSeries, ensurePaneIndex]
  );

  const updateData = useCallback(
    (marketData: MarketCandle[]) => {
      if (!chartRef.current || !mainSeriesRef.current) return;

      latestDataRef.current = marketData;

      const chartType = currentChartTypeRef.current;
      if (chartType === 'line' || chartType === 'area' || chartType === 'baseline') {
        mainSeriesRef.current.setData(formatLineData(marketData));
      } else {
        mainSeriesRef.current.setData(formatCandlestickData(marketData));
      }

      if (showVolume && volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(formatVolumeData(marketData));
      }

      // Don't auto-fit content on every update to preserve user's zoom level
      // Only fit content on initial load
      if (marketData.length > 0 && !latestDataRef.current.length) {
        chartRef.current.timeScale().fitContent();
      }

      updateIndicators(marketData);
    },
    [showVolume, updateIndicators]
  );

  const teardownChart = useCallback(() => {
    subscriptionsRef.current.forEach(fn => fn());
    subscriptionsRef.current = [];

    if (chartRef.current) {
      indicatorSeriesRef.current.forEach(entry => {
        chartRef.current?.removeSeries(entry.series);
        entry.extraSeries?.forEach(series => chartRef.current?.removeSeries(series));
      });
      indicatorSeriesRef.current.clear();

      if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
      }

      chartRef.current.remove();
    }

    volumeSeriesRef.current = null;
    mainSeriesRef.current = null;
    chartRef.current = null;

    if (resizeObserverRef.current && containerRef.current) {
      resizeObserverRef.current.unobserve(containerRef.current);
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    paneIndexRef.current.clear();
    nextPaneIndexRef.current = 1;
    setIsInitialized(false);
  }, []);

  const initializeChart = useCallback(() => {
    if (!containerRef.current || chartRef.current) {
      return;
    }

    const initialWidth = config.width ?? containerRef.current.clientWidth ?? 600;
    const initialHeight = config.height ?? 400;

    const chart = createChart(containerRef.current, {
      width: initialWidth,
      height: initialHeight,
      autoSize: config.autoSize !== false,
      layout: {
        background: {
          type: ColorType.Solid,
          color: config.layout?.background ?? themeConfig.layout.background,
        },
        textColor: config.layout?.textColor ?? themeConfig.layout.textColor,
        fontSize: config.layout?.fontSize ?? 12,
        fontFamily: config.layout?.fontFamily ?? 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: {
          visible: config.grid?.vertLines?.visible ?? true,
          color: config.grid?.vertLines?.color ?? themeConfig.grid.vertLines.color,
          style: config.grid?.vertLines?.style ?? LineStyle.Solid,
        },
        horzLines: {
          visible: config.grid?.horzLines?.visible ?? true,
          color: config.grid?.horzLines?.color ?? themeConfig.grid.horzLines.color,
          style: config.grid?.horzLines?.style ?? LineStyle.Solid,
        },
      },
      crosshair: {
        mode: config.crosshair?.mode ?? CrosshairMode.Normal,
        vertLine: {
          visible: config.crosshair?.vertLine?.visible ?? true,
          color: config.crosshair?.vertLine?.color ?? themeConfig.crosshair.vertLine.color,
          width: clampLineWidth(config.crosshair?.vertLine?.width ?? 1),
          style: config.crosshair?.vertLine?.style ?? LineStyle.Solid,
          labelVisible: config.crosshair?.vertLine?.labelVisible ?? true,
        },
        horzLine: {
          visible: config.crosshair?.horzLine?.visible ?? true,
          color: config.crosshair?.horzLine?.color ?? themeConfig.crosshair.horzLine.color,
          width: clampLineWidth(config.crosshair?.horzLine?.width ?? 1),
          style: config.crosshair?.horzLine?.style ?? LineStyle.Solid,
          labelVisible: config.crosshair?.horzLine?.labelVisible ?? true,
        },
      },
      rightPriceScale: {
        visible: config.priceScale?.position !== 'none',
        borderVisible: config.priceScale?.borderVisible ?? true,
        borderColor: config.priceScale?.borderColor ?? themeConfig.priceScale.borderColor,
        scaleMargins: {
          top: config.priceScale?.scaleMargins?.top ?? 0.15,
          bottom: config.priceScale?.scaleMargins?.bottom ?? (showVolume ? 0.25 : 0.15),
        },
        mode: PriceScaleMode.Normal,
        autoScale: true,
      },
      leftPriceScale: {
        visible: config.priceScale?.position === 'left',
        borderVisible: config.priceScale?.borderVisible ?? true,
        borderColor: config.priceScale?.borderColor ?? themeConfig.priceScale.borderColor,
      },
      timeScale: {
        visible: config.timeScale?.visible ?? true,
        borderVisible: config.timeScale?.borderVisible ?? true,
        borderColor: config.timeScale?.borderColor ?? themeConfig.timeScale.borderColor,
        timeVisible: config.timeScale?.timeVisible ?? true,
        secondsVisible: config.timeScale?.secondsVisible ?? false,
        rightOffset: config.timeScale?.rightOffset ?? 10,
        barSpacing: config.timeScale?.barSpacing ?? 12,
        minBarSpacing: config.timeScale?.minBarSpacing ?? 4,
        fixLeftEdge: config.timeScale?.fixLeftEdge ?? false,
        lockVisibleTimeRangeOnResize: config.timeScale?.lockVisibleTimeRangeOnResize ?? false,
        rightBarStaysOnScroll: config.timeScale?.rightBarStaysOnScroll ?? true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        axisDoubleClickReset: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;
    paneIndexRef.current.clear();
    nextPaneIndexRef.current = 1;

    createMainSeries(chart, config.type ?? 'candlestick');

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: 'volume',
        priceLineVisible: false,
        lastValueVisible: false,
      });
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0.02 },
        borderVisible: false,
        autoScale: true,
      });
      volumeSeriesRef.current = volumeSeries;
    } else {
      volumeSeriesRef.current = null;
    }

    const cleanupSubscriptions: Array<() => void> = [];

    if (events.onCrosshairMove) {
      chart.subscribeCrosshairMove(events.onCrosshairMove);
      cleanupSubscriptions.push(() => chart.unsubscribeCrosshairMove(events.onCrosshairMove!));
    }
    if (events.onClick) {
      chart.subscribeClick(events.onClick);
      cleanupSubscriptions.push(() => chart.unsubscribeClick(events.onClick!));
    }
    if (events.onVisibleTimeRangeChange) {
      chart.timeScale().subscribeVisibleTimeRangeChange(events.onVisibleTimeRangeChange);
      cleanupSubscriptions.push(() => chart.timeScale().unsubscribeVisibleTimeRangeChange(events.onVisibleTimeRangeChange!));
    }
    if (events.onVisibleLogicalRangeChange) {
      chart.timeScale().subscribeVisibleLogicalRangeChange(events.onVisibleLogicalRangeChange);
      cleanupSubscriptions.push(() => chart.timeScale().unsubscribeVisibleLogicalRangeChange(events.onVisibleLogicalRangeChange!));
    }

    subscriptionsRef.current = cleanupSubscriptions;

    if (config.autoSize !== false) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry || !chartRef.current) return;
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(config.height ?? entry.contentRect.height ?? 400);
        chartRef.current.resize(width, height);
        events.onSizeChange?.(width, height);
      });
      observer.observe(containerRef.current);
      resizeObserverRef.current = observer;
    }

    if (data.length > 0) {
      updateData(data);
      // Set initial zoom level to show reasonable number of candles
      setTimeout(() => {
        if (chartRef.current && data.length > 50) {
          const visibleRange = {
            from: data.length - 50,
            to: data.length + 5
          };
          chartRef.current.timeScale().setVisibleLogicalRange(visibleRange);
        }
      }, 100);
    }

    setIsInitialized(true);
  }, [config, createMainSeries, data, events, showVolume, themeConfig, updateData]);

  useEffect(() => {
    initializeChart();
    return () => {
      teardownChart();
    };
  }, [initializeChart, teardownChart]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: {
          type: ColorType.Solid,
          color: config.layout?.background ?? themeConfig.layout.background,
        },
        textColor: config.layout?.textColor ?? themeConfig.layout.textColor,
        fontSize: config.layout?.fontSize ?? 12,
        fontFamily: config.layout?.fontFamily ?? 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: {
          visible: config.grid?.vertLines?.visible ?? true,
          color: config.grid?.vertLines?.color ?? themeConfig.grid.vertLines.color,
          style: config.grid?.vertLines?.style ?? LineStyle.Solid,
        },
        horzLines: {
          visible: config.grid?.horzLines?.visible ?? true,
          color: config.grid?.horzLines?.color ?? themeConfig.grid.horzLines.color,
          style: config.grid?.horzLines?.style ?? LineStyle.Solid,
        },
      },
      crosshair: {
        mode: config.crosshair?.mode ?? CrosshairMode.Normal,
      },
      rightPriceScale: {
        visible: config.priceScale?.position !== 'none',
        borderVisible: config.priceScale?.borderVisible ?? true,
        borderColor: config.priceScale?.borderColor ?? themeConfig.priceScale.borderColor,
        scaleMargins: {
          top: config.priceScale?.scaleMargins?.top ?? 0.15,
          bottom: config.priceScale?.scaleMargins?.bottom ?? (showVolume ? 0.25 : 0.15),
        },
      },
      leftPriceScale: {
        visible: config.priceScale?.position === 'left',
        borderVisible: config.priceScale?.borderVisible ?? true,
        borderColor: config.priceScale?.borderColor ?? themeConfig.priceScale.borderColor,
      },
      timeScale: {
        visible: config.timeScale?.visible ?? true,
        borderVisible: config.timeScale?.borderVisible ?? true,
        borderColor: config.timeScale?.borderColor ?? themeConfig.timeScale.borderColor,
      },
    });

    if (config.width || config.height) {
      const width = config.width ?? containerRef.current?.clientWidth;
      const height = config.height ?? containerRef.current?.clientHeight;
      if (width && height) {
        chartRef.current.resize(Math.floor(width), Math.floor(height));
      }
    }

    if (showVolume && !volumeSeriesRef.current && chartRef.current) {
      const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
        priceScaleId: 'volume',
        priceLineVisible: false,
        lastValueVisible: false,
      });
      chartRef.current.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0.02 },
        borderVisible: false,
        autoScale: true,
      });
      volumeSeriesRef.current = volumeSeries;
      if (latestDataRef.current.length > 0) {
        volumeSeries.setData(formatVolumeData(latestDataRef.current));
      }
    }

    if (!showVolume && volumeSeriesRef.current && chartRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }
  }, [config, showVolume, themeConfig]);

  useEffect(() => {
    if (!isInitialized) return;
    updateData(data);
  }, [data, isInitialized, updateData]);

  useEffect(() => {
    if (!isInitialized) return;
    updateIndicators(latestDataRef.current);
  }, [indicators, isInitialized, updateIndicators]);

  const buildChartInstance = useCallback((): ChartInstance => ({
    get chart() {
      if (!chartRef.current) {
        throw new Error('TradingView chart is not ready yet');
      }
      return chartRef.current;
    },
    get mainSeries() {
      if (!mainSeriesRef.current) {
        throw new Error('TradingView chart is not ready yet');
      }
      return mainSeriesRef.current;
    },
    get volumeSeries() {
      return volumeSeriesRef.current ?? undefined;
    },
    get indicatorSeries() {
      const collection = new Map<string, AnySeries>();
      indicatorSeriesRef.current.forEach((entry, id) => {
        collection.set(id, entry.series);
      });
      return collection;
    },
    destroy: () => {
      teardownChart();
    },
    updateData: (marketData: MarketCandle[]) => {
      updateData(marketData);
    },
    addIndicator: (indicator: Indicator, marketData?: MarketCandle[]) => {
      const merged = [
        ...indicators.filter(item => item.id !== indicator.id),
        indicator,
      ];
      updateIndicators(marketData ?? latestDataRef.current, merged);
    },
    removeIndicator: (indicatorId: string) => {
      removeIndicatorSeries(indicatorId);
    },
    setChartType: (type: ChartType, marketData?: MarketCandle[]) => {
      if (!chartRef.current) return;
      createMainSeries(chartRef.current, type);
      updateData(marketData ?? latestDataRef.current);
    },
    takeScreenshot: () => {
      if (!chartRef.current) return null;
      const canvas = chartRef.current.takeScreenshot();
      return canvas?.toDataURL() ?? null;
    },
    exportData: () => latestDataRef.current,
  }), [createMainSeries, indicators, removeIndicatorSeries, teardownChart, updateData, updateIndicators]);

  useImperativeHandle(ref, () => buildChartInstance(), [buildChartInstance]);

  useEffect(() => {
    if (!isInitialized || !onReady) return;
    onReady(buildChartInstance());
  }, [buildChartInstance, isInitialized, onReady]);

  return (
    <div
      ref={containerRef}
      className={`tradingview-chart ${className}`}
      style={{ position: 'relative', width: '100%', height: config.height ?? 400 }}
    />
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default TradingViewChart;
