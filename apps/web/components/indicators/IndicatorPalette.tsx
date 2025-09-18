import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  LineChart,
  Waves,
  Target,
  Zap,
  Gauge,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { IndicatorDefinition } from '@/services/analysis.service';

// Map indicator categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  trend: <TrendingUp className="w-5 h-5" />,
  momentum: <Activity className="w-5 h-5" />,
  volatility: <Waves className="w-5 h-5" />,
  volume: <BarChart3 className="w-5 h-5" />,
  'support-resistance': <Target className="w-5 h-5" />,
  oscillator: <Gauge className="w-5 h-5" />,
  other: <LineChart className="w-5 h-5" />,
};

// Map specific indicators to icons (optional override)
const indicatorIcons: Record<string, React.ReactNode> = {
  sma: <LineChart className="w-5 h-5" />,
  ema: <LineChart className="w-5 h-5" />,
  macd: <TrendingUp className="w-5 h-5" />,
  rsi: <Gauge className="w-5 h-5" />,
  bollinger: <Waves className="w-5 h-5" />,
  atr: <Zap className="w-5 h-5" />,
  obv: <BarChart3 className="w-5 h-5" />,
  vwap: <BarChart3 className="w-5 h-5" />,
  pivot: <Target className="w-5 h-5" />,
};

interface IndicatorPaletteProps {
  indicators?: IndicatorDefinition[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectIndicator?: (indicator: IndicatorDefinition) => void;
  selectedCategory?: string;
  className?: string;
}

export const IndicatorPalette: React.FC<IndicatorPaletteProps> = ({
  indicators = [],
  isLoading = false,
  error = null,
  onSelectIndicator,
  selectedCategory = 'all',
  className,
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  
  // Extract unique categories from indicators
  const categories = useMemo(() => {
    const categorySet = new Set(['all']);
    indicators.forEach(ind => {
      if (ind.category) {
        categorySet.add(ind.category);
      }
    });
    return Array.from(categorySet);
  }, [indicators]);
  
  // Filter indicators by category
  const filteredIndicators = useMemo(() => {
    if (activeCategory === 'all') {
      return indicators;
    }
    return indicators.filter(ind => ind.category === activeCategory);
  }, [indicators, activeCategory]);

  // Get icon for indicator
  const getIndicatorIcon = (indicator: IndicatorDefinition) => {
    // Check specific indicator icons first
    if (indicatorIcons[indicator.id]) {
      return indicatorIcons[indicator.id];
    }
    // Fall back to category icon
    if (indicator.category && categoryIcons[indicator.category]) {
      return categoryIcons[indicator.category];
    }
    // Default icon
    return categoryIcons.other;
  };

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    if (category === 'all') return 'All';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('p-4', className)}>
        <div className="flex items-center gap-2 text-accent-danger mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Failed to load indicators</span>
        </div>
        <p className="text-text-tertiary text-sm">{error.message}</p>
      </div>
    );
  }

  // Empty state
  if (indicators.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-text-tertiary">No indicators available</p>
      </div>
    );
  }

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
            {formatCategoryName(category)}
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
                {getIndicatorIcon(indicator)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                  {indicator.name}
                </h4>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {indicator.description}
                </p>
                {/* Show parameter count */}
                {indicator.parameters && indicator.parameters.length > 0 && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {indicator.parameters.length} parameter{indicator.parameters.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty category state */}
      {filteredIndicators.length === 0 && (
        <div className="text-center py-4 text-text-tertiary">
          <p>No indicators in this category</p>
        </div>
      )}
    </div>
  );
};

export default IndicatorPalette;