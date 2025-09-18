import React, { useState } from 'react';
import { Plus, Trash2, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface IndicatorConfig {
  id: string;
  indicator: string;
  parameters: Record<string, any>;
  weight: number;
  enabled: boolean;
  buySignal?: {
    operator: string;
    value: number;
    value2?: number;
  };
  sellSignal?: {
    operator: string;
    value: number;
    value2?: number;
  };
}

interface IndicatorDefinition {
  name: string;
  displayName: string;
  description: string;
  category: string;
  parameters: {
    name: string;
    displayName: string;
    type: 'number' | 'select';
    default: any;
    min?: number;
    max?: number;
    options?: { value: string; label: string }[];
  }[];
  signals: {
    buy: { operator: string; defaultValue: number; description: string };
    sell: { operator: string; defaultValue: number; description: string };
  };
}

// Available indicators with their configurations
const AVAILABLE_INDICATORS: IndicatorDefinition[] = [
  {
    name: 'rsi',
    displayName: 'RSI (Relative Strength Index)',
    description: 'Measures momentum and identifies overbought/oversold conditions',
    category: 'Momentum',
    parameters: [
      { name: 'period', displayName: 'Period', type: 'number', default: 14, min: 2, max: 200 },
    ],
    signals: {
      buy: { operator: 'lt', defaultValue: 30, description: 'Buy when RSI < 30 (oversold)' },
      sell: { operator: 'gt', defaultValue: 70, description: 'Sell when RSI > 70 (overbought)' },
    },
  },
  {
    name: 'macd',
    displayName: 'MACD (Moving Average Convergence Divergence)',
    description: 'Trend following momentum indicator',
    category: 'Trend',
    parameters: [
      { name: 'fastPeriod', displayName: 'Fast Period', type: 'number', default: 12, min: 2, max: 200 },
      { name: 'slowPeriod', displayName: 'Slow Period', type: 'number', default: 26, min: 2, max: 200 },
      { name: 'signalPeriod', displayName: 'Signal Period', type: 'number', default: 9, min: 2, max: 200 },
    ],
    signals: {
      buy: { operator: 'crosses_above', defaultValue: 0, description: 'Buy when MACD crosses above signal' },
      sell: { operator: 'crosses_below', defaultValue: 0, description: 'Sell when MACD crosses below signal' },
    },
  },
  {
    name: 'ema_cross',
    displayName: 'EMA Crossover',
    description: 'Trade based on exponential moving average crossovers',
    category: 'Trend',
    parameters: [
      { name: 'fastPeriod', displayName: 'Fast EMA', type: 'number', default: 12, min: 2, max: 200 },
      { name: 'slowPeriod', displayName: 'Slow EMA', type: 'number', default: 26, min: 2, max: 200 },
    ],
    signals: {
      buy: { operator: 'crosses_above', defaultValue: 0, description: 'Buy when fast EMA crosses above slow' },
      sell: { operator: 'crosses_below', defaultValue: 0, description: 'Sell when fast EMA crosses below slow' },
    },
  },
  {
    name: 'bollinger',
    displayName: 'Bollinger Bands',
    description: 'Volatility indicator for identifying price extremes',
    category: 'Volatility',
    parameters: [
      { name: 'period', displayName: 'Period', type: 'number', default: 20, min: 2, max: 200 },
      { name: 'stdDev', displayName: 'Std Deviations', type: 'number', default: 2, min: 0.5, max: 5 },
    ],
    signals: {
      buy: { operator: 'lt', defaultValue: -2, description: 'Buy at lower band' },
      sell: { operator: 'gt', defaultValue: 2, description: 'Sell at upper band' },
    },
  },
  {
    name: 'stochastic',
    displayName: 'Stochastic Oscillator',
    description: 'Momentum indicator comparing closing price to price range',
    category: 'Momentum',
    parameters: [
      { name: 'kPeriod', displayName: '%K Period', type: 'number', default: 14, min: 2, max: 200 },
      { name: 'dPeriod', displayName: '%D Period', type: 'number', default: 3, min: 1, max: 50 },
      { name: 'smooth', displayName: 'Smoothing', type: 'number', default: 3, min: 1, max: 50 },
    ],
    signals: {
      buy: { operator: 'lt', defaultValue: 20, description: 'Buy when oversold' },
      sell: { operator: 'gt', defaultValue: 80, description: 'Sell when overbought' },
    },
  },
];

interface IndicatorSelectorProps {
  indicators: IndicatorConfig[];
  onChange: (indicators: IndicatorConfig[]) => void;
  maxIndicators?: number;
}

export function IndicatorSelector({
  indicators,
  onChange,
  maxIndicators = 5
}: IndicatorSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<IndicatorConfig | null>(null);
  const [selectedIndicatorType, setSelectedIndicatorType] = useState<string>('');

  const handleAddIndicator = () => {
    if (!selectedIndicatorType) return;

    const indicatorDef = AVAILABLE_INDICATORS.find(i => i.name === selectedIndicatorType);
    if (!indicatorDef) return;

    const newIndicator: IndicatorConfig = {
      id: Date.now().toString(),
      indicator: indicatorDef.name,
      parameters: indicatorDef.parameters.reduce((acc, param) => {
        acc[param.name] = param.default;
        return acc;
      }, {} as Record<string, any>),
      weight: 1.0,
      enabled: true,
      buySignal: {
        operator: indicatorDef.signals.buy.operator,
        value: indicatorDef.signals.buy.defaultValue,
      },
      sellSignal: {
        operator: indicatorDef.signals.sell.operator,
        value: indicatorDef.signals.sell.defaultValue,
      },
    };

    onChange([...indicators, newIndicator]);
    setIsAddDialogOpen(false);
    setSelectedIndicatorType('');
  };

  const handleUpdateIndicator = (id: string, updates: Partial<IndicatorConfig>) => {
    onChange(indicators.map(ind => 
      ind.id === id ? { ...ind, ...updates } : ind
    ));
  };

  const handleRemoveIndicator = (id: string) => {
    onChange(indicators.filter(ind => ind.id !== id));
  };

  const getIndicatorDefinition = (indicatorName: string) => {
    return AVAILABLE_INDICATORS.find(i => i.name === indicatorName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trading Indicators</h3>
          <p className="text-sm text-muted-foreground">
            Configure technical indicators for buy/sell signals
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={indicators.length >= maxIndicators}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Indicator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Indicator</DialogTitle>
              <DialogDescription>
                Select a technical indicator to add to your bot strategy
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="indicator-type">Indicator Type</Label>
                <Select value={selectedIndicatorType} onValueChange={setSelectedIndicatorType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_INDICATORS.map((indicator) => (
                      <SelectItem key={indicator.name} value={indicator.name}>
                        <div>
                          <div className="font-medium">{indicator.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {indicator.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIndicator} disabled={!selectedIndicatorType}>
                Add Indicator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {indicators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center mb-4">
              No indicators configured. Add indicators to generate trading signals.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Indicator
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {indicators.map((indicator) => {
            const definition = getIndicatorDefinition(indicator.indicator);
            if (!definition) return null;

            return (
              <Card key={indicator.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {definition.displayName}
                        <Badge variant="outline" className="ml-2">
                          {definition.category}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {definition.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={indicator.enabled}
                        onCheckedChange={(checked) =>
                          handleUpdateIndicator(indicator.id, { enabled: checked })
                        }
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingIndicator(indicator)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure parameters</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIndicator(indicator.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Buy Signal:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {definition.signals.buy.description}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sell Signal:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {definition.signals.sell.description}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Weight:</Label>
                      <Input
                        type="number"
                        value={indicator.weight}
                        onChange={(e) =>
                          handleUpdateIndicator(indicator.id, {
                            weight: parseFloat(e.target.value) || 1,
                          })
                        }
                        className="w-20 h-8"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Indicator Dialog */}
      {editingIndicator && (
        <Dialog open={!!editingIndicator} onOpenChange={() => setEditingIndicator(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configure Indicator</DialogTitle>
              <DialogDescription>
                Adjust parameters and signal thresholds
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Parameters would be configured here */}
              <p className="text-sm text-muted-foreground">
                Parameter configuration coming soon...
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingIndicator(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
