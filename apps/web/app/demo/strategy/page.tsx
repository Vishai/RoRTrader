'use client';

import React, { useState, useMemo } from 'react';
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
import { useIndicators } from '@/hooks/useIndicators';
import { useStrategyTemplates } from '@/hooks/useStrategy';
import { Loader2 } from 'lucide-react';

export default function StrategyDemoPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'builder' | 'templates' | 'backtest'>('overview');
  const [showBacktestResult, setShowBacktestResult] = useState(false);
  const [strategyNodes, setStrategyNodes] = useState<any[]>([]);
  const [selectedBot] = useState('demo-bot-1');

  // Fetch real data from API
  const { data: availableIndicators, isLoading: indicatorsLoading } = useIndicators();
  const { data: strategyTemplates, isLoading: templatesLoading } = useStrategyTemplates();

  // Configure active indicators for the demo
  const activeIndicators = useMemo(() => [
    { id: 'rsi', name: 'RSI', parameters: { period: 14 }, isActive: true },
    { id: 'macd', name: 'MACD', parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, isActive: true },
    { id: 'bollinger', name: 'Bollinger Bands', parameters: { period: 20, standardDeviations: 2 }, isActive: true },
    { id: 'ema', name: 'EMA Cross', parameters: { shortPeriod: 20, longPeriod: 50 }, isActive: true },
    { id: 'stochastic', name: 'Stochastic', parameters: { kPeriod: 14, dPeriod: 3, smooth: 3 }, isActive: false },
    { id: 'atr', name: 'ATR', parameters: { period: 14 }, isActive: true },
  ], []);

  const tabs = [
    { id: 'overview', label: 'Strategy Overview' },
    { id: 'builder', label: 'Visual Builder' },
    { id: 'templates', label: 'Templates' },
    { id: 'backtest', label: 'Backtesting' },
  ];

  // Mock backtest result (until API is ready)
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

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Advanced Trading Strategy Demo
          </h1>
          <p className="text-text-secondary">
            Real-time technical analysis and strategy building with live API integration
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
            {/* Trading Chart with Real Data */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Live Chart with Technical Indicators
              </h2>
              <TradingViewChart
                symbol="BTC-USD"
                exchange="coinbase"
                timeframe="1h"
                height={500}
                enableLive={true}
                indicators={[
                  { id: 'sma', name: 'SMA', parameters: { period: 20 }, color: '#FFB800' },
                  { id: 'sma', name: 'SMA', parameters: { period: 50 }, color: '#9945FF' },
                  { id: 'ema', name: 'EMA', parameters: { period: 12 }, color: '#00D4FF' },
                  { id: 'ema', name: 'EMA', parameters: { period: 26 }, color: '#00FF88' },
                ]}
              />
            </Card>

            {/* Live Indicator Status Cards */}
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Real-Time Indicator Analysis
              </h2>
              <IndicatorStatusCards
                symbol="BTC-USD"
                timeframe="1h"
                indicators={activeIndicators}
                refreshInterval={5000}
                onIndicatorClick={(indicator) => console.log('Clicked:', indicator)}
              />
            </div>

            {/* Strategy Performance Widgets */}
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Active Strategy Performance
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
              {/* Indicator Palette with Real Data */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Available Indicators
                  </h3>
                  {indicatorsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                    </div>
                  ) : (
                    <IndicatorPalette
                      indicators={availableIndicators}
                      onSelectIndicator={(indicator) => {
                        const newNode = {
                          id: `node-${Date.now()}`,
                          type: 'indicator' as const,
                          indicatorId: indicator.id,
                          name: indicator.name,
                          position: { x: 50, y: 50 + strategyNodes.length * 100 },
                          settings: indicator.defaultSettings || {},
                        };
                        setStrategyNodes([...strategyNodes, newNode]);
                      }}
                    />
                  )}
                </Card>
              </div>

              {/* Strategy Canvas with API Integration */}
              <div className="lg:col-span-3">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Strategy Builder Canvas
                  </h3>
                  <StrategyBuilderCanvas
                    botId={selectedBot}
                    onSave={(strategyId) => {
                      console.log('Strategy saved:', strategyId);
                    }}
                  />
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
            {templatesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
              </div>
            ) : (
              <StrategyTemplateSelector
                templates={strategyTemplates}
                onSelectTemplate={(template) => {
                  console.log('Selected template:', template);
                  // Switch to builder tab with template loaded
                  setSelectedTab('builder');
                }}
              />
            )}
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
                {showBacktestResult ? (
                  <TradingViewChart
                    symbol="EQUITY"
                    exchange="coinbase"
                    timeframe="1d"
                    height={350}
                    enableLive={false}
                  />
                ) : (
                  <p className="text-text-tertiary">
                    Equity curve visualization will appear here after backtest
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="fixed bottom-4 right-4 bg-background-elevated px-4 py-2 rounded-lg shadow-lg border border-border-default">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse" />
              <span className="text-text-secondary">API Connected</span>
            </div>
            <div className="text-text-tertiary">
              Real-time data streaming
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}