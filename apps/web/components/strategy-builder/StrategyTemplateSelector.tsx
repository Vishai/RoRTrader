import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Target,
  Gauge,
  BookOpen,
  Loader2,
  AlertCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { StrategyTemplate } from '@/services/strategy.service';

// Map categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  momentum: <Gauge className="w-5 h-5" />,
  trend: <TrendingUp className="w-5 h-5" />,
  volatility: <Activity className="w-5 h-5" />,
  mean_reversion: <BarChart3 className="w-5 h-5" />,
  composite: <Shield className="w-5 h-5" />,
  custom: <BookOpen className="w-5 h-5" />,
};

interface StrategyTemplateSelectorProps {
  templates?: StrategyTemplate[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectTemplate?: (template: StrategyTemplate | { id: 'custom' }) => void;
  selectedCategory?: string;
  className?: string;
}

export const StrategyTemplateSelector: React.FC<StrategyTemplateSelectorProps> = ({
  templates = [],
  isLoading = false,
  error = null,
  onSelectTemplate,
  selectedCategory = 'all',
  className,
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  
  // Extract unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(['all']);
    templates.forEach(template => {
      if (template.category) {
        categorySet.add(template.category);
      }
    });
    return Array.from(categorySet);
  }, [templates]);
  
  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return templates;
    }
    return templates.filter(t => t.category === activeCategory);
  }, [templates, activeCategory]);

  // Format category name
  const formatCategoryName = (category: string): string => {
    if (category === 'all') return 'All';
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || <Target className="w-5 h-5" />;
  };

  const difficultyColors = {
    beginner: 'bg-accent-secondary/20 text-accent-secondary',
    intermediate: 'bg-accent-warning/20 text-accent-warning',
    advanced: 'bg-accent-danger/20 text-accent-danger',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary mx-auto mb-2" />
          <p className="text-text-secondary">Loading strategy templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('p-8', className)}>
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-8 h-8 text-accent-danger mb-2" />
          <p className="text-text-primary font-medium mb-1">Failed to load templates</p>
          <p className="text-text-tertiary text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeCategory === category
                ? 'bg-accent-primary text-background-primary'
                : 'bg-background-elevated text-text-secondary hover:text-text-primary'
            )}
          >
            {formatCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all duration-200',
              'hover:border-accent-primary/50 hover:shadow-lg',
              'hover:scale-[1.02]'
            )}
            onClick={() => onSelectTemplate?.(template)}
          >
            <div className="p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background-elevated text-accent-primary">
                    {getCategoryIcon(template.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      {template.name}
                    </h4>
                    <Badge 
                      className={cn(
                        'text-xs mt-1',
                        difficultyColors[template.difficulty]
                      )}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                </div>
                {template.performance && (
                  <div className="text-right">
                    <p className="text-sm text-text-tertiary">Win Rate</p>
                    <p className="text-lg font-bold text-accent-secondary">
                      {Math.round(template.performance.successRate)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary line-clamp-2">
                {template.description}
              </p>

              {/* Indicators */}
              <div className="flex flex-wrap gap-1.5">
                {template.indicators.slice(0, 4).map((indicator, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-background-elevated rounded text-xs text-text-secondary"
                  >
                    {indicator.indicator}
                  </span>
                ))}
                {template.indicators.length > 4 && (
                  <span className="px-2 py-1 bg-background-elevated rounded text-xs text-text-tertiary">
                    +{template.indicators.length - 4} more
                  </span>
                )}
              </div>

              {/* Performance Metrics */}
              {template.performance && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-tertiary">Avg Return:</span>
                    <span className="ml-1 text-text-primary font-medium">
                      {(template.performance.avgReturn * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Sharpe:</span>
                    <span className="ml-1 text-text-primary font-medium">
                      {template.performance.avgSharpe.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Suitable For */}
              {template.markets && template.markets.length > 0 && (
                <div className="pt-2 border-t border-border-default">
                  <p className="text-xs text-text-tertiary mb-1">Best for:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.markets.map((market, i) => (
                      <span key={i} className="text-xs text-text-secondary">
                        {market}{i < template.markets.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* Create Custom Template Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200',
            'hover:border-accent-primary/50 hover:shadow-lg',
            'hover:scale-[1.02]',
            'border-dashed'
          )}
          onClick={() => onSelectTemplate?.({ id: 'custom' })}
        >
          <div className="p-5 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
            <div className="p-3 rounded-lg bg-background-elevated text-text-tertiary mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-text-primary mb-2">
              Create Custom Strategy
            </h4>
            <p className="text-sm text-text-tertiary">
              Start from scratch with your own indicators and rules
            </p>
          </div>
        </Card>
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && activeCategory !== 'all' && (
        <div className="text-center py-8">
          <p className="text-text-tertiary">
            No templates available for {formatCategoryName(activeCategory)} strategies
          </p>
        </div>
      )}
    </div>
  );
};

export default StrategyTemplateSelector;