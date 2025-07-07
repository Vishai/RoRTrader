import React from 'react';
import { cn } from '../../lib/utils';
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  LineChart,
  Waves,
  Target,
  Zap,
  Gauge
} from 'lucide-react';

export interface Indicator {
  id: string;
  name: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'support-resistance';
  icon: React.ReactNode;
  description: string;
  defaultSettings: Record<string, any>;
}

const indicatorIcons = {
  trend: <TrendingUp className="w-5 h-5" />,
  momentum: <Activity className="w-5 h-5" />,
  volatility: <Waves className="w-5 h-5" />,
  volume: <BarChart3 className="w-5 h-5" />,
  'support-resistance': <Target className="w-5 h-5" />,
};

export const indicators: Indicator[] = [
  // Trend Indicators
  {
    id: 'sma',
    name: 'Simple Moving Average',
    category: 'trend',
    icon: <LineChart className="w-5 h-5" />,
    description: 'Average price over a specific period',
    defaultSettings: { period: 20 },
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    category: 'trend',
    icon: <LineChart className="w-5 h-5" />,
    description: 'Weighted average giving more importance to recent prices',
    defaultSettings: { period: 20 },
  },
  {
    id: 'macd',
    name: 'MACD',
    category: 'trend',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Moving Average Convergence Divergence',
    defaultSettings: { fast: 12, slow: 26, signal: 9 },
  },
  
  // Momentum Indicators
  {
    id: 'rsi',
    name: 'Relative Strength Index',
    category: 'momentum',
    icon: <Gauge className="w-5 h-5" />,
    description: 'Measures overbought and oversold conditions',
    defaultSettings: { period: 14, overbought: 70, oversold: 30 },
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    category: 'momentum',
    icon: <Activity className="w-5 h-5" />,
    description: 'Compares closing price to price range',
    defaultSettings: { kPeriod: 14, dPeriod: 3, smooth: 3 },
  },
  
  // Volatility Indicators
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    category: 'volatility',
    icon: <Waves className="w-5 h-5" />,
    description: 'Volatility bands above and below a moving average',
    defaultSettings: { period: 20, stdDev: 2 },
  },
  {
    id: 'atr',
    name: 'Average True Range',
    category: 'volatility',
    icon: <Zap className="w-5 h-5" />,
    description: 'Measures market volatility',
    defaultSettings: { period: 14 },
  },
  
  // Volume Indicators
  {
    id: 'obv',
    name: 'On-Balance Volume',
    category: 'volume',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Uses volume flow to predict price changes',
    defaultSettings: {},
  },
  {
    id: 'vwap',
    name: 'VWAP',
    category: 'volume',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Volume Weighted Average Price',
    defaultSettings: {},
  },
  
  // Support & Resistance
  {
    id: 'pivot',
    name: 'Pivot Points',
    category: 'support-resistance',
    icon: <Target className="w-5 h-5" />,
    description: 'Potential support and resistance levels',
    defaultSettings: { type: 'standard' },
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Retracement',
    category: 'support-resistance',
    icon: <Target className="w-5 h-5" />,
    description: 'Key levels based on Fibonacci ratios',
    defaultSettings: { levels: [0.236, 0.382, 0.5, 0.618, 0.786] },
  },
];

interface IndicatorPaletteProps {
  onSelectIndicator?: (indicator: Indicator) => void;
  selectedCategory?: string;
  className?: string;
}

export const IndicatorPalette: React.FC<IndicatorPaletteProps> = ({
  onSelectIndicator,
  selectedCategory = 'all',
  className,
}) => {
  const categories = ['all', 'trend', 'momentum', 'volatility', 'volume', 'support-resistance'];
  const [activeCategory, setActiveCategory] = React.useState(selectedCategory);
  
  const filteredIndicators = activeCategory === 'all' 
    ? indicators 
    : indicators.filter(ind => ind.category === activeCategory);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeCategory === category
                ? 'bg-accent-primary text-background-primary'
                : 'bg-background-elevated text-text-secondary hover:text-text-primary hover:bg-background-elevated/80'
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Indicator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredIndicators.map((indicator) => (
          <div
            key={indicator.id}
            onClick={() => onSelectIndicator?.(indicator)}
            className={cn(
              'group p-3 rounded-lg border border-border-default',
              'bg-background-secondary hover:bg-background-elevated',
              'hover:border-accent-primary/50 transition-all cursor-pointer',
              'hover:shadow-lg hover:shadow-accent-primary/10'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background-tertiary text-text-secondary group-hover:text-accent-primary transition-colors">
                {indicator.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                  {indicator.name}
                </h4>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {indicator.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorPalette;
