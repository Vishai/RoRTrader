'use client';

import React, { useState } from 'react';
import { TradingViewChart } from '@/components/charts';
import { IndicatorPalette, IndicatorCard } from '@/components/indicators';
import { StrategyPerformanceWidget, IndicatorStatusCards } from '@/components/strategy';
import { 
  StrategyBuilderCanvas, 
  StrategyTemplateSelector,
  BacktestingPreviewPanel 
} from '@/components/strategy-builder';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Generate mock chart data
const generateMockChartData = () => {
  const now = Date.now();
  const data = [];
  let price = 50000;
  
  for (let i = 100; i >= 0; i--) {
    const time = new Date(now - i * 3600000).toISOString();
    const change = (Math.random() - 0.5) * 1000;
    const high = price + Math.random() * 500;
    const low = price - Math.random() * 500;
    const close = price + change;
    const open = price;
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000),
    });
    
    price = close;
  }
  
  return data;
};

// Mock indicator status data
const mockIndicatorStatus = [
  {
    id: '1',
    name: 'RSI',
    value: 65.4,
    signal: 'buy' as const,
    change: 5.2,
    settings: { period: 14 },
    isActive: true,
  },
  {
    id: '2',
    name: 'MACD',
    value: 'Bullish Cross',
    signal: 'strong-buy' as const,
    settings: { fast: 12, slow: 26, signal: 9 },
    isActive: true,
  },
  {
    id: '3',
    name: 'Bollinger Bands',
    value: 'Upper Band',
    signal: 'sell' as const,
    settings: { period: 20, stdDev: 2 },
    isActive: true,
  },
  {
    id: '4',
    name: 'EMA Cross',
    value: 'Above',
    signal: 'buy' as const,
    change: 2.1,
    settings: { fast: 20, slow: 50 },
    isActive: true,
  },
  {
    id: '5',
    name: 'Stochastic',
    value: 78.3,
    signal: 'neutral' as const,
    settings: { k: 14, d: 3 },
    isActive: false,
  },
  {
    id: '6',
    name: 'ATR',
    value: 823.5,
    signal: 'neutral' as const,
    change: -1.2,
    settings: { period: 14 },
    isActive: true,
  },
];

// Mock backtest result
const mockBacktestResult = {
  totalReturn: 25430,
  totalReturnPercent: 25.43,
  winRate: 58.3,
  totalTrades: 156,
  winningTrades: 91,
  losingTrades: 65,
  averageWin: 543,
  averageLoss: -287,
  profitFactor: 1.89,
  sharpeRatio: 1.45,
  maxDrawdown: 12.8,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
};

export default function StrategyDemoPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'builder' | 'templates' | 'backtest'>('overview');
  const [chartData] = useState(generateMockChartData());
  const [showBacktestResult, setShowBacktestResult] = useState(false);
  const [strategyNodes, setStrategyNodes] = useState<any[]>([]);

  const tabs = [
    { id: 'overview', label: 'Strategy Overview' },
    { id: 'builder', label: 'Visual Builder' },
    { id: 'templates', label: 'Templates' },
    { id: 'backtest', label: 'Backtesting' },
  ];

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Advanced Trading Strategy Demo
          </h1>
          <p className="text-text-secondary">
            Explore the power of visual strategy building and technical analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-background-secondary rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-background-elevated text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Trading Chart with Indicators */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Live Chart with Technical Indicators
              </h2>
              <TradingViewChart
                data={chartData}
                type="candlestick"
                height={500}
                indicators={{
                  sma: [
                    { period: 20, color: '#FFB800' },
                    { period: 50, color: '#9945FF' },
                  ],
                  ema: [
                    { period: 12, color: '#00D4FF' },
                    { period: 26, color: '#00FF88' },
                  ],
                }}
              />
            </Card>

            {/* Indicator Status Cards */}
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Active Indicators Status
              </h2>
              <IndicatorStatusCards
                indicators={mockIndicatorStatus}
                onIndicatorClick={(indicator) => console.log('Clicked:', indicator)}
              />
            </div>

            {/* Strategy Performance Widgets */}
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Strategy Performance Comparison
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StrategyPerformanceWidget
                  name="Golden Cross Strategy"
                  winRate={65.4}
                  totalTrades={234}
                  profitFactor={2.1}
                  sharpeRatio={1.8}
                  maxDrawdown={8.5}
                  status="active"
                  lastUpdated={new Date()}
                />
                <StrategyPerformanceWidget
                  name="RSI Oversold Bounce"
                  winRate={58.2}
                  totalTrades={156}
                  profitFactor={1.5}
                  sharpeRatio={1.2}
                  maxDrawdown={15.3}
                  status="active"
                  lastUpdated={new Date()}
                />
                <StrategyPerformanceWidget
                  name="MACD Divergence Pro"
                  winRate={72.1}
                  totalTrades={89}
                  profitFactor={2.8}
                  sharpeRatio={2.3}
                  maxDrawdown={5.7}
                  status="paused"
                  lastUpdated={new Date()}
                />
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'builder' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Indicator Palette */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Indicators
                  </h3>
                  <IndicatorPalette
                    onSelectIndicator={(indicator) => {
                      const newNode = {
                        id: `node-${Date.now()}`,
                        type: 'indicator' as const,
                        name: indicator.name,
                        position: { x: 50, y: 50 + strategyNodes.length * 100 },
                        settings: indicator.defaultSettings,
                      };
                      setStrategyNodes([...strategyNodes, newNode]);
                    }}
                  />
                </Card>
              </div>

              {/* Strategy Canvas */}
              <div className="lg:col-span-3">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Strategy Builder Canvas
                  </h3>
                  <StrategyBuilderCanvas
                    nodes={strategyNodes}
                    onNodeAdd={(node) => setStrategyNodes([...strategyNodes, node])}
                    onNodeRemove={(nodeId) => 
                      setStrategyNodes(strategyNodes.filter(n => n.id !== nodeId))
                    }
                    onNodeConnect={(from, to) => {
                      console.log('Connect:', from, 'to', to);
                    }}
                  />
                  <div className="mt-4 flex gap-4">
                    <Button variant="primary">Save Strategy</Button>
                    <Button variant="secondary">Clear Canvas</Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'templates' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Pre-Built Strategy Templates
            </h2>
            <StrategyTemplateSelector
              onSelectTemplate={(template) => console.log('Selected:', template)}
            />
          </div>
        )}

        {selectedTab === 'backtest' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Backtest Your Strategy
              </h2>
              <BacktestingPreviewPanel
                result={showBacktestResult ? mockBacktestResult : undefined}
                onRunBacktest={() => {
                  setTimeout(() => setShowBacktestResult(true), 2000);
                }}
                timeframe="1Y"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Equity Curve
              </h2>
              <Card className="p-6 h-[400px] flex items-center justify-center">
                <p className="text-text-tertiary">
                  Equity curve visualization will appear here after backtest
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
