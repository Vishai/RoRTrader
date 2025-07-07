import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Target,
  Gauge,
  BookOpen
} from 'lucide-react';

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trend' | 'momentum' | 'scalping' | 'swing' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  indicators: string[];
  winRate?: number;
  icon: React.ReactNode;
}

const templates: StrategyTemplate[] = [
  {
    id: 'golden-cross',
    name: 'Golden Cross',
    description: 'Classic trend-following strategy using MA crossovers',
    category: 'trend',
    difficulty: 'beginner',
    indicators: ['SMA 50', 'SMA 200'],
    winRate: 65,
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'rsi-oversold',
    name: 'RSI Oversold Bounce',
    description: 'Buy when RSI indicates oversold conditions',
    category: 'momentum',
    difficulty: 'beginner',
    indicators: ['RSI 14'],
    winRate: 58,
    icon: <Gauge className="w-5 h-5" />,
  },
  {
    id: 'bb-squeeze',
    name: 'Bollinger Band Squeeze',
    description: 'Trade breakouts from low volatility periods',
    category: 'swing',
    difficulty: 'intermediate',
    indicators: ['Bollinger Bands', 'ATR'],
    winRate: 62,
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: 'macd-divergence',
    name: 'MACD Divergence',
    description: 'Identify trend reversals using MACD divergence',
    category: 'swing',
    difficulty: 'intermediate',
    indicators: ['MACD', 'RSI'],
    winRate: 70,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'scalping-ema',
    name: 'EMA Scalping',
    description: 'Quick trades using fast EMA crossovers',
    category: 'scalping',
    difficulty: 'advanced',
    indicators: ['EMA 5', 'EMA 13', 'VWAP'],
    winRate: 55,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'multi-timeframe',
    name: 'Multi-Timeframe Trend',
    description: 'Confirm trends across multiple timeframes',
    category: 'trend',
    difficulty: 'advanced',
    indicators: ['EMA 20', 'EMA 50', 'RSI', 'MACD'],
    winRate: 75,
    icon: <Shield className="w-5 h-5" />,
  },
];

interface StrategyTemplateSelectorProps {
  onSelectTemplate?: (template: StrategyTemplate) => void;
  selectedCategory?: string;
  className?: string;
}

export const StrategyTemplateSelector: React.FC<StrategyTemplateSelectorProps> = ({
  onSelectTemplate,
  selectedCategory = 'all',
  className,
}) => {
  const categories = ['all', 'trend', 'momentum', 'scalping', 'swing'];
  const [activeCategory, setActiveCategory] = React.useState(selectedCategory);
  
  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const difficultyColors = {
    beginner: 'bg-accent-secondary/20 text-accent-secondary',
    intermediate: 'bg-accent-warning/20 text-accent-warning',
    advanced: 'bg-accent-danger/20 text-accent-danger',
  };

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
            {category.charAt(0).toUpperCase() + category.slice(1)}
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
                    {template.icon}
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
                {template.winRate && (
                  <div className="text-right">
                    <p className="text-sm text-text-tertiary">Win Rate</p>
                    <p className="text-lg font-bold text-accent-secondary">
                      {template.winRate}%
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary">
                {template.description}
              </p>

              {/* Indicators */}
              <div className="flex flex-wrap gap-1.5">
                {template.indicators.map((indicator, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-background-elevated rounded text-xs text-text-secondary"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
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
          onClick={() => onSelectTemplate?.({
            id: 'custom',
            name: 'Custom Strategy',
            description: 'Build your own strategy from scratch',
            category: 'custom',
            difficulty: 'advanced',
            indicators: [],
            icon: <BookOpen className="w-5 h-5" />,
          })}
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
    </div>
  );
};

export default StrategyTemplateSelector;
