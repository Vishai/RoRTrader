'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { mockBots, formatCurrency, formatPercentage } from '@/lib/mock/data';
import { Plus, Search, Filter, Play, Pause, Square, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function BotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExchange, setFilterExchange] = useState<string>('all');

  const filteredBots = mockBots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bot.status === filterStatus;
    const matchesExchange = filterExchange === 'all' || bot.exchange === filterExchange;
    
    return matchesSearch && matchesStatus && matchesExchange;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'stopped':
        return <Square className="w-4 h-4" />;
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Trading Bots</h1>
            <p className="text-text-secondary">Manage and monitor your automated trading strategies</p>
          </div>
          <Link href="/bots/new">
            <Button className="flex items-center bg-gradient-to-r from-accent-primary to-accent-secondary">
              <Plus className="w-5 h-5 mr-2" />
              Create Bot
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-background-secondary border border-border rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="stopped">Stopped</option>
            </select>

            <select
              value={filterExchange}
              onChange={(e) => setFilterExchange(e.target.value)}
              className="px-4 py-3 bg-background-secondary border border-border rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">All Exchanges</option>
              <option value="coinbase_pro">Coinbase Pro</option>
              <option value="alpaca">Alpaca</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <Link key={bot.id} href={`/bots/${bot.id}`}>
              <Card className="p-6 hover:border-accent-primary/50 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{bot.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">{bot.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle menu click
                    }}
                    className="p-1 hover:bg-background-tertiary rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-text-tertiary" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className={`${getStatusColor(bot.status)} flex items-center gap-1`}>
                    {getStatusIcon(bot.status)}
                    <span className="capitalize">{bot.status}</span>
                  </Badge>
                  <Badge className="bg-background-tertiary text-text-secondary">
                    {bot.exchange.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={bot.tradingMode === 'live' ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-primary/20 text-accent-primary'}>
                    {bot.tradingMode === 'live' ? 'Live' : 'Paper'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Total Return</span>
                    <div className="flex items-center gap-1">
                      {bot.performance.totalReturn >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-accent-secondary" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-accent-danger" />
                      )}
                      <span className={`font-semibold ${bot.performance.totalReturn >= 0 ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                        {formatCurrency(bot.performance.totalReturn)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Win Rate</span>
                    <span className="font-semibold text-text-primary">{bot.performance.winRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Total Trades</span>
                    <span className="font-semibold text-text-primary">{bot.performance.tradesCount}</span>
                  </div>

                  {bot.performance.sharpeRatio && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Sharpe Ratio</span>
                      <span className="font-semibold text-text-primary">{bot.performance.sharpeRatio.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-tertiary">
                      {bot.positionSizing.type === 'fixed' 
                        ? `${formatCurrency(bot.positionSizing.value)} per trade`
                        : `${bot.positionSizing.value}% per trade`
                      }
                    </span>
                    <span className="text-text-tertiary capitalize">{bot.assetType}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredBots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">No bots found matching your criteria</p>
            <Link href="/bots/new">
              <Button className="bg-gradient-to-r from-accent-primary to-accent-secondary">
                Create Your First Bot
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
