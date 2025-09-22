import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';

// Chart type options we expose in the UI
export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'baseline';

// Market data from our API
export interface MarketCandle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Chart configuration
export interface ChartConfig {
  type?: ChartType;
  theme?: 'dark' | 'light';
  height?: number;
  width?: number;
  autoSize?: boolean;
  layout?: {
    background?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
  grid?: {
    vertLines?: {
      visible?: boolean;
      color?: string;
      style?: number;
    };
    horzLines?: {
      visible?: boolean;
      color?: string;
      style?: number;
    };
  };
  crosshair?: {
    mode?: number;
    vertLine?: {
      visible?: boolean;
      color?: string;
      width?: number;
      style?: number;
      labelVisible?: boolean;
    };
    horzLine?: {
      visible?: boolean;
      color?: string;
      width?: number;
      style?: number;
      labelVisible?: boolean;
    };
  };
  priceScale?: {
    position?: 'left' | 'right' | 'none';
    autoScale?: boolean;
    borderVisible?: boolean;
    borderColor?: string;
    scaleMargins?: {
      top?: number;
      bottom?: number;
    };
  };
  timeScale?: {
    borderVisible?: boolean;
    borderColor?: string;
    timeVisible?: boolean;
    secondsVisible?: boolean;
    rightOffset?: number;
    barSpacing?: number;
    minBarSpacing?: number;
    fixLeftEdge?: boolean;
    lockVisibleTimeRangeOnResize?: boolean;
    rightBarStaysOnScroll?: boolean;
    visible?: boolean;
  };
}

// Indicator types
export interface Indicator {
  id: string;
  name: string;
  type: 'overlay' | 'panel';
  enabled: boolean;
  parameters: Record<string, any>;
  color?: string;
  lineWidth?: number;
  style?: number;
}

export interface MovingAverageIndicator extends Indicator {
  type: 'overlay';
  parameters: {
    period: number;
    type: 'sma' | 'ema' | 'wma';
    source?: 'close' | 'open' | 'high' | 'low' | 'hl2' | 'hlc3' | 'ohlc4';
  };
}

export interface RSIIndicator extends Indicator {
  type: 'panel';
  parameters: {
    period: number;
    overbought?: number;
    oversold?: number;
  };
}

export interface MACDIndicator extends Indicator {
  type: 'panel';
  parameters: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
}

export interface BollingerBandsIndicator extends Indicator {
  type: 'overlay';
  parameters: {
    period: number;
    stdDev: number;
  };
}

// Events
export interface ChartEventHandlers {
  onCrosshairMove?: (params: any) => void;
  onClick?: (params: any) => void;
  onVisibleTimeRangeChange?: (timeRange: any) => void;
  onVisibleLogicalRangeChange?: (logicalRange: any) => void;
  onSizeChange?: (width: number, height: number) => void;
}

// Drawing tools
export interface DrawingTool {
  id: string;
  type: 'trendline' | 'horizontalLine' | 'verticalLine' | 'rectangle' | 'fibonacci' | 'text';
  points: Array<{ time: number; price: number }>;
  style?: {
    color?: string;
    lineWidth?: number;
    lineStyle?: number;
    fillColor?: string;
    text?: string;
  };
}

// Chart instance with methods
export interface ChartInstance {
  chart: IChartApi;
  mainSeries: ISeriesApi<SeriesType>;
  volumeSeries?: ISeriesApi<SeriesType>;
  indicatorSeries: Map<string, ISeriesApi<SeriesType>>;
  destroy: () => void;
  updateData: (data: MarketCandle[]) => void;
  addIndicator: (indicator: Indicator, marketData?: MarketCandle[]) => void;
  removeIndicator: (indicatorId: string) => void;
  setChartType: (type: ChartType, marketData?: MarketCandle[]) => void;
  takeScreenshot: () => string | null;
  exportData: () => MarketCandle[];
}

// Theme configurations
export const CHART_THEMES = {
  dark: {
    layout: {
      background: '#1C1C1F',
      textColor: '#B8B8BD',
    },
    grid: {
      vertLines: { color: '#2A2A30' },
      horzLines: { color: '#2A2A30' },
    },
    crosshair: {
      vertLine: { color: '#00D4FF' },
      horzLine: { color: '#00D4FF' },
    },
    priceScale: {
      borderColor: '#2A2A30',
    },
    timeScale: {
      borderColor: '#2A2A30',
    },
    candlestick: {
      upColor: '#00FF88',
      downColor: '#FF3366',
      wickUpColor: '#00FF88',
      wickDownColor: '#FF3366',
      borderVisible: false,
    },
  },
  light: {
    layout: {
      background: '#FFFFFF',
      textColor: '#191919',
    },
    grid: {
      vertLines: { color: '#E1E3E6' },
      horzLines: { color: '#E1E3E6' },
    },
    crosshair: {
      vertLine: { color: '#2962FF' },
      horzLine: { color: '#2962FF' },
    },
    priceScale: {
      borderColor: '#E1E3E6',
    },
    timeScale: {
      borderColor: '#E1E3E6',
    },
    candlestick: {
      upColor: '#26A69A',
      downColor: '#EF5350',
      wickUpColor: '#26A69A',
      wickDownColor: '#EF5350',
      borderVisible: false,
    },
  },
};

// Timeframe configurations
export const TIMEFRAMES = {
  '1m': { label: '1 min', seconds: 60 },
  '3m': { label: '3 min', seconds: 180 },
  '5m': { label: '5 min', seconds: 300 },
  '15m': { label: '15 min', seconds: 900 },
  '30m': { label: '30 min', seconds: 1800 },
  '1h': { label: '1 hour', seconds: 3600 },
  '2h': { label: '2 hours', seconds: 7200 },
  '4h': { label: '4 hours', seconds: 14400 },
  '1d': { label: '1 day', seconds: 86400 },
  '1w': { label: '1 week', seconds: 604800 },
  '1M': { label: '1 month', seconds: 2592000 },
};
