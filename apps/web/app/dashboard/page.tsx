'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Badge, Stat } from '@/components/ui';
import { 
  mockPortfolioStats, 
  mockBots, 
  mockActivities, 
  mockChartData,
  formatCurrency,
  formatPercentage,
  formatTimeAgo
} from '@/lib/mock/data';
import { 
  Activity, 
  Bell, 
  LineChart, 
  Plus, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  PauseCircle,
  PlayCircle,
  StopCircle,
  AlertCircle
} from 'lucide-react';
import { CoachRibbon } from '@/components/coach';
import { CoachEvaluation, CoachSession, fetchCoachEvaluations, fetchCoachSessions } from '@/lib/api/coach';

export default function DashboardPage() {
  const [coachSessions, setCoachSessions] = useState<CoachSession[]>([]);
  const [coachEvaluations, setCoachEvaluations] = useState<CoachEvaluation[]>([]);

  useEffect(() => {
    async function loadCoachData() {
      const sessions = await fetchCoachSessions();
      setCoachSessions(sessions);
      if (sessions.length > 0) {
        const evaluations = await fetchCoachEvaluations(sessions[0].id);
        setCoachEvaluations(evaluations);
      }
    }
    void loadCoachData();
  }, []);

  const activeCoachSession = coachSessions[0];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-secondary/80 backdrop-blur-xl border-b border-border-default">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              RoR Trader
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-text-primary hover:text-accent-primary transition-colors">
                Dashboard
              </a>
              <a href="/bots" className="text-text-secondary hover:text-text-primary transition-colors">
                Bots
              </a>
              <a href="/analytics" className="text-text-secondary hover:text-text-primary transition-colors">
                Analytics
              </a>
              <a href="/settings" className="text-text-secondary hover:text-text-primary transition-colors">
                Settings
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-accent-danger rounded-full"></span>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Account
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Page Title and Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h2>
            <p className="text-text-secondary">Monitor your trading bots and portfolio performance</p>
          </div>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>

        {activeCoachSession && (
          <div className="mb-8">
            <CoachRibbon
              sessionId={activeCoachSession.id}
              evaluations={coachEvaluations}
              riskReward={1.6}
              expectedValue={0.42}
              updatedAt={activeCoachSession.updatedAt}
            />
          </div>
        )}

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Stat
            label="Total Portfolio Value"
            value={formatCurrency(mockPortfolioStats.totalValue)}
            trend={mockPortfolioStats.dailyChangePercent}
            icon={<LineChart className="h-5 w-5 text-accent-primary" />}
          />
          <Stat
            label="Today's P&L"
            value={formatCurrency(mockPortfolioStats.dailyChange)}
            subValue={formatPercentage(mockPortfolioStats.dailyChangePercent)}
            trend={mockPortfolioStats.dailyChangePercent}
            icon={mockPortfolioStats.dailyChange >= 0 ? 
              <TrendingUp className="h-5 w-5 text-accent-secondary" /> : 
              <TrendingDown className="h-5 w-5 text-accent-danger" />
            }
          />
          <Stat
            label="Active Bots"
            value={`${mockPortfolioStats.activeBots}/${mockPortfolioStats.totalBots}`}
            subValue={`${mockPortfolioStats.totalTrades} trades`}
            icon={<Activity className="h-5 w-5 text-accent-purple" />}
          />
          <Stat
            label="Win Rate"
            value={`${mockPortfolioStats.winRate}%`}
            trend={mockPortfolioStats.winRate >= 50 ? 5 : -5}
            icon={<AlertCircle className="h-5 w-5 text-accent-warning" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Bots List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary">Active Bots</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                
                <div className="space-y-4">
                  {mockBots.map((bot) => (
                    <div
                      key={bot.id}
                      className="p-4 bg-background-primary rounded-xl border border-border-default hover:border-border-hover transition-all hover:shadow-lg hover:shadow-accent-primary/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background-elevated">
                            {bot.status === 'active' && <PlayCircle className="h-5 w-5 text-accent-secondary" />}
                            {bot.status === 'paused' && <PauseCircle className="h-5 w-5 text-accent-warning" />}
                            {bot.status === 'stopped' && <StopCircle className="h-5 w-5 text-text-tertiary" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-text-primary">{bot.name}</h4>
                            <p className="text-sm text-text-secondary">
                              {bot.exchange === 'coinbase_pro' ? 'Coinbase Pro' : 'Alpaca'} • {bot.tradingMode === 'paper' ? 'Paper' : 'Live'} Mode
                            </p>
                          </div>
                        </div>
                        <Badge variant={bot.status === 'active' ? 'success' : bot.status === 'paused' ? 'warning' : 'default'}>
                          {bot.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-text-tertiary mb-1">Return</p>
                          <p className={`font-semibold ${bot.performance.totalReturn >= 0 ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                            {formatCurrency(bot.performance.totalReturn)}
                          </p>
                          <p className={`text-xs ${bot.performance.returnPercentage >= 0 ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                            {formatPercentage(bot.performance.returnPercentage)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary mb-1">Trades</p>
                          <p className="font-semibold text-text-primary">{bot.performance.tradesCount}</p>
                          <p className="text-xs text-text-secondary">Win: {bot.performance.winRate}%</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary mb-1">Last Active</p>
                          <p className="font-semibold text-text-primary">{formatTimeAgo(bot.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-6">Recent Activity</h3>
                
                <div className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.action === 'buy' ? 'bg-accent-secondary/10' :
                        activity.action === 'sell' ? 'bg-accent-danger/10' :
                        'bg-accent-primary/10'
                      }`}>
                        {activity.action === 'buy' ? (
                          <TrendingUp className="h-4 w-4 text-accent-secondary" />
                        ) : activity.action === 'sell' ? (
                          <TrendingDown className="h-4 w-4 text-accent-danger" />
                        ) : (
                          <Activity className="h-4 w-4 text-accent-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">
                          <span className="font-semibold">{activity.botName}</span>
                          <span className="text-text-secondary"> {activity.action} </span>
                          <span className="font-semibold">{activity.quantity} {activity.symbol}</span>
                        </p>
                        <p className="text-xs text-text-tertiary">
                          @ {formatCurrency(activity.price)} • {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      
                      <Badge 
                        variant={
                          activity.status === 'completed' ? 'success' : 
                          activity.status === 'pending' ? 'warning' : 
                          'danger'
                        }
                        size="sm"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" className="w-full mt-4">
                  View All Activity
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Chart Placeholder */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Portfolio Performance</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">1D</Button>
                <Button variant="ghost" size="sm" className="bg-background-elevated">1W</Button>
                <Button variant="ghost" size="sm">1M</Button>
                <Button variant="ghost" size="sm">3M</Button>
                <Button variant="ghost" size="sm">1Y</Button>
                <Button variant="ghost" size="sm">ALL</Button>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-64 bg-background-primary rounded-lg border border-border-default flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary">Chart visualization will be added here</p>
                <p className="text-sm text-text-tertiary mt-1">Showing portfolio value over time</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
