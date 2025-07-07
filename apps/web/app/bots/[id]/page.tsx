'use client';

import { useState } from 'react';
import { Card, Button, Badge, Stat } from '@/components/ui';
import { 
  getBotById, 
  getActivitiesByBot, 
  formatCurrency, 
  formatPercentage, 
  formatTimeAgo,
  formatSymbol 
} from '@/lib/mock/data';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  AlertCircle,
  Clock,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BotDetailPage() {
  const params = useParams();
  const [copied, setCopied] = useState(false);
  const bot = getBotById(params.id as string);
  const activities = bot ? getActivitiesByBot(bot.name) : [];

  if (!bot) {
    return (
      <div className="min-h-screen bg-background-primary p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-text-secondary">Bot not found</p>
          <Link href="/bots">
            <Button variant="secondary" className="mt-4">Back to Bots</Button>
          </Link>
        </div>
      </div>
    );
  }

  const copyWebhookUrl = () => {
    if (bot.webhookUrl) {
      navigator.clipboard.writeText(bot.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-5 h-5" />;
      case 'paused':
        return <Pause className="w-5 h-5" />;
      case 'stopped':
        return <Square className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/20';
      case 'paused':
        return 'bg-accent-warning/20 text-accent-warning border-accent-warning/20';
      case 'stopped':
        return 'bg-text-tertiary/20 text-text-tertiary border-text-tertiary/20';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/bots" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bots
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">{bot.name}</h1>
            <p className="text-text-secondary">{bot.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={`${getStatusColor(bot.status)} flex items-center gap-1`}>
                {getStatusIcon(bot.status)}
                <span className="capitalize">{bot.status}</span>
              </Badge>
              <Badge className="bg-background-tertiary text-text-secondary">
                {bot.exchange.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={bot.tradingMode === 'live' ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-primary/20 text-accent-primary'}>
                {bot.tradingMode === 'live' ? 'Live Trading' : 'Paper Trading'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            {bot.status === 'active' ? (
              <Button className="flex items-center bg-accent-warning">
                <Pause className="w-4 h-4 mr-2" />
                Pause Bot
              </Button>
            ) : (
              <Button className="flex items-center bg-gradient-to-r from-accent-primary to-accent-secondary">
                <Play className="w-4 h-4 mr-2" />
                Start Bot
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Performance & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats */}
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
                Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Stat
                  label="Total Return"
                  value={formatCurrency(bot.performance.totalReturn)}
                  change={formatPercentage(bot.performance.returnPercentage)}
                  trend={bot.performance.totalReturn >= 0 ? 'up' : 'down'}
                />
                <Stat
                  label="Win Rate"
                  value={`${bot.performance.winRate}%`}
                  trend={bot.performance.winRate >= 50 ? 'up' : 'down'}
                />
                <Stat
                  label="Total Trades"
                  value={bot.performance.tradesCount.toString()}
                />
                {bot.performance.sharpeRatio && (
                  <Stat
                    label="Sharpe Ratio"
                    value={bot.performance.sharpeRatio.toFixed(2)}
                    trend={bot.performance.sharpeRatio >= 1 ? 'up' : 'down'}
                  />
                )}
              </div>

              {bot.performance.maxDrawdown && (
                <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Maximum Drawdown</span>
                    <span className="font-semibold text-accent-danger">-{bot.performance.maxDrawdown}%</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-primary" />
                Webhook Configuration
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">Webhook URL</label>
                <div className="relative">
                  <div className="p-4 bg-background-secondary rounded-lg font-mono text-sm text-text-primary break-all pr-12">
                    {bot.webhookUrl}
                  </div>
                  <button
                    onClick={copyWebhookUrl}
                    className="absolute top-2 right-2 p-2 bg-background-tertiary hover:bg-background-elevated rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-accent-secondary" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-secondary" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                <p className="text-sm text-text-primary">
                  <strong>Security Note:</strong> Keep your webhook URL private. Anyone with this URL can send trading signals to your bot.
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-primary" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-border">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-background-secondary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          activity.action === 'buy' ? 'bg-accent-secondary/20' : 
                          activity.action === 'sell' ? 'bg-accent-danger/20' : 
                          'bg-accent-primary/20'
                        }`}>
                          {activity.action === 'buy' ? (
                            <TrendingUp className="w-4 h-4 text-accent-secondary" />
                          ) : activity.action === 'sell' ? (
                            <TrendingDown className="w-4 h-4 text-accent-danger" />
                          ) : (
                            <Activity className="w-4 h-4 text-accent-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {activity.action.toUpperCase()} {activity.quantity} {formatSymbol(activity.symbol)}
                          </div>
                          <div className="text-sm text-text-secondary">
                            @ {formatCurrency(activity.price)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-secondary">{formatTimeAgo(activity.timestamp)}</div>
                        <Badge className={
                          activity.status === 'completed' ? 'bg-accent-secondary/20 text-accent-secondary' :
                          activity.status === 'pending' ? 'bg-accent-warning/20 text-accent-warning' :
                          'bg-accent-danger/20 text-accent-danger'
                        }>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-text-secondary">
                  No recent activity
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Configuration Details */}
        <div className="space-y-6">
          {/* Position Sizing */}
          <Card>
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent-primary" />
                Position Sizing
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Type</p>
                <p className="font-medium text-text-primary capitalize">{bot.positionSizing.type}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Value</p>
                <p className="font-medium text-text-primary">
                  {bot.positionSizing.type === 'fixed' 
                    ? formatCurrency(bot.positionSizing.value)
                    : `${bot.positionSizing.value}%`
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Risk Management */}
          <Card>
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent-primary" />
                Risk Management
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {bot.riskManagement.stopLoss && (
                <div>
                  <p className="text-sm text-text-secondary mb-1">Stop Loss</p>
                  <p className="font-medium text-text-primary">{bot.riskManagement.stopLoss}%</p>
                </div>
              )}
              {bot.riskManagement.takeProfit && (
                <div>
                  <p className="text-sm text-text-secondary mb-1">Take Profit</p>
                  <p className="font-medium text-text-primary">{bot.riskManagement.takeProfit}%</p>
                </div>
              )}
              {bot.riskManagement.maxDailyLoss && (
                <div>
                  <p className="text-sm text-text-secondary mb-1">Max Daily Loss</p>
                  <p className="font-medium text-text-primary">{formatCurrency(bot.riskManagement.maxDailyLoss)}</p>
                </div>
              )}
              {bot.riskManagement.maxPositions && (
                <div>
                  <p className="text-sm text-text-secondary mb-1">Max Positions</p>
                  <p className="font-medium text-text-primary">{bot.riskManagement.maxPositions}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Bot Info */}
          <Card>
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-primary" />
                Bot Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Asset Type</p>
                <p className="font-medium text-text-primary capitalize">{bot.assetType}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Created</p>
                <p className="font-medium text-text-primary">
                  {new Date(bot.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Last Active</p>
                <p className="font-medium text-text-primary">{formatTimeAgo(bot.lastActivity)}</p>
              </div>
            </div>
          </Card>

          {/* Warning for Live Trading */}
          {bot.tradingMode === 'live' && (
            <div className="p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-accent-danger mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-text-primary">
                  <strong>Live Trading Active</strong>
                  <p className="mt-1">This bot is trading with real money. Monitor carefully and ensure proper risk management.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
