import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Stat } from './Stat';

const meta = {
  title: 'UI/Stat',
  component: Stat,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    trend: {
      control: 'select',
      options: ['up', 'down', undefined],
    },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Total Revenue',
    value: '$45,231.89',
  },
};

export const WithUpTrend: Story = {
  args: {
    label: 'Portfolio Value',
    value: '$125,432.50',
    change: '+12.5%',
    trend: 'up',
  },
};

export const WithDownTrend: Story = {
  args: {
    label: 'Daily Loss',
    value: '-$1,234.56',
    change: '-3.2%',
    trend: 'down',
  },
};

export const NoChange: Story = {
  args: {
    label: 'Active Bots',
    value: '5',
    subtext: 'of 5 total',
  },
};

export const DashboardStats: Story = {
  name: 'Dashboard Example',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl">
      <Stat
        label="Portfolio Value"
        value="$125,432.50"
        change="+15.3%"
        trend="up"
      />
      <Stat
        label="Today's P&L"
        value="+$2,345.67"
        change="+1.87%"
        trend="up"
      />
      <Stat
        label="Active Bots"
        value="5"
        subtext="2 paused"
      />
      <Stat
        label="Win Rate"
        value="73%"
        change="+5%"
        trend="up"
      />
    </div>
  ),
};

export const TradingMetrics: Story = {
  name: 'Trading Metrics',
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-96">
      <Stat
        label="Total Trades"
        value="1,234"
        subtext="This month"
      />
      <Stat
        label="Avg. Trade Size"
        value="$5,432"
        change="+8.2%"
        trend="up"
      />
      <Stat
        label="Sharpe Ratio"
        value="2.34"
        change="+0.12"
        trend="up"
      />
      <Stat
        label="Max Drawdown"
        value="-8.5%"
        change="-2.1%"
        trend="down"
      />
    </div>
  ),
};

export const CryptoStats: Story = {
  name: 'Crypto Trading Stats',
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Stat
          label="BTC Holdings"
          value="0.5423 BTC"
          subtext="≈ $27,115"
        />
        <Stat
          label="ETH Holdings"
          value="3.2145 ETH"
          subtext="≈ $5,786"
        />
        <Stat
          label="Total Crypto"
          value="$45,231"
          change="+23.4%"
          trend="up"
        />
      </div>
    </div>
  ),
};

export const PerformanceStats: Story = {
  name: 'Performance Metrics',
  render: () => (
    <div className="bg-[#141416] p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-white">Performance Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Monthly Return"
          value="+18.7%"
          change="+5.2%"
          trend="up"
        />
        <Stat
          label="YTD Return"
          value="+142.3%"
          change="+18.7%"
          trend="up"
        />
        <Stat
          label="Best Trade"
          value="+$8,234"
          subtext="BTC Long"
        />
        <Stat
          label="Worst Trade"
          value="-$1,456"
          subtext="ETH Short"
        />
      </div>
    </div>
  ),
};
