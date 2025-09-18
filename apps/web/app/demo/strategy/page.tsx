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
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [customSymbol, setCustomSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const [customTimeframe, setCustomTimeframe] = useState('');

  // Popular stock symbols
  const popularSymbols = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
    'META', 'NVDA', 'JPM', 'V', 'WMT',
    'JNJ', 'PG', 'MA', 'HD', 'DIS'
  ];

  // Available timeframes organized by category
  const timeframeCategories = {
    'Minutes': [
      { value: '1m', label: '1 min' },
      { value: '2m', label: '2 min' },
      { value: '3m', label: '3 min' },
      { value: '5m', label: '5 min' },
      { value: '10m', label: '10 min' },
      { value: '15m', label: '15 min' },
      { value: '30m', label: '30 min' },
      { value: '45m', label: '45 min' },
    ],
    'Hours': [
      { value: '1h', label: '1 hour' },
      { value: '2h', label: '2 hours' },
      { value: '3h', label: '3 hours' },
      { value: '4h', label: '4 hours' },
    ],
    'Days+': [
      { value: '1d', label: '1 day' },
      { value: '5d', label: '5 days' },
      { value: '1w', label: '1 week' },
      { value: '1M', label: '1 month' },
      { value: '1y', label: '1 year' },
    ]
  };

  // Fetch real data from API
  const { data: availableIndicators, isLoading: indicatorsLoading } = useIndicators();
  const { data: strategyTemplates, isLoading: templatesLoading } = useStrategyTemplates();

  // Configure active indicators for the demo
  const activeIndicators = useMemo(() => [
    { id: 'RSI', name: 'RSI', parameters: { period: 14 }, isActive: true },
    { id: 'MACD', name: 'MACD', parameters: { fast_period: 12, slow_period: 26, signal_period: 9 }, isActive: true },
    { id: 'EMA', name: 'EMA', parameters: { period: 20 }, isActive: true },
    { id: 'SMA', name: 'SMA', parameters: { period: 20 }, isActive: true }, // Changed from 50 to 20
    { id: 'ATR', name: 'ATR', parameters: { period: 14 }, isActive: true },
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  Live Chart - {selectedSymbol}
                </h2>
                <span className="text-sm text-text-secondary">
                  Alpaca Market Data
                </span>
              </div>
              <TradingViewChart
                symbol={selectedSymbol}
                exchange="alpaca"
                timeframe={selectedTimeframe as any}
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
              <div className="mb-4 space-y-3">
                <h2 className="text-xl font-semibold text-text-primary">
                  Real-Time Indicator Analysis
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Symbol Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-text-secondary">Symbol:</label>
                    <select
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="px-3 py-1.5 bg-background-elevated border border-border-default rounded-md text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    >
                      <optgroup label="Popular Stocks">
                        {popularSymbols.map(symbol => (
                          <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                      </optgroup>
                      {customSymbol && (
                        <optgroup label="Custom">
                          <option value={customSymbol}>{customSymbol}</option>
                        </optgroup>
                      )}
                    </select>
                    <input
                      type="text"
                      placeholder="Custom ticker"
                      value={customSymbol}
                      onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customSymbol) {
                          setSelectedSymbol(customSymbol);
                        }
                      }}
                      className="px-3 py-1.5 bg-background-elevated border border-border-default rounded-md text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary w-24"
                    />
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-text-secondary">Timeframe:</label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="px-3 py-1.5 bg-background-elevated border border-border-default rounded-md text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    >
                      {Object.entries(timeframeCategories).map(([category, timeframes]) => (
                        <optgroup key={category} label={category}>
                          {timeframes.map(tf => (
                            <option key={tf.value} value={tf.value}>{tf.label}</option>
                          ))}
                        </optgroup>
                      ))}
                      {customTimeframe && (
                        <optgroup label="Custom">
                          <option value={customTimeframe}>{customTimeframe}</option>
                        </optgroup>
                      )}
                    </select>
                    <input
                      type="text"
                      placeholder="Custom (e.g. 7m)"
                      value={customTimeframe}
                      onChange={(e) => setCustomTimeframe(e.target.value.toLowerCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customTimeframe) {
                          setSelectedTimeframe(customTimeframe);
                        }
                      }}
                      className="px-3 py-1.5 bg-background-elevated border border-border-default rounded-md text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary w-28"
                    />
                  </div>

                  {/* Quick Timeframe Buttons */}
                  <div className="flex items-center gap-1">
                    {['1m', '5m', '15m', '1h', '1d'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          selectedTimeframe === tf
                            ? 'bg-accent-primary text-white'
                            : 'bg-background-elevated text-text-secondary hover:bg-background-tertiary'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <IndicatorStatusCards
                symbol={selectedSymbol}
                timeframe={selectedTimeframe as any}
                exchange="alpaca"
                indicators={activeIndicators}
                refreshInterval={10000} // Increased to 10 seconds to reduce API load
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