// Mock data for RoR Trader UI demonstrations

export interface Bot {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'stopped';
  exchange: 'coinbase_pro' | 'alpaca';
  assetType: 'crypto' | 'stocks';
  tradingMode: 'paper' | 'live';
  webhookUrl?: string;
  webhookSecret?: string;
  positionSizing: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number;
    maxDailyLoss?: number;
    maxPositions?: number;
  };
  performance: {
    totalReturn: number;
    returnPercentage: number;
    tradesCount: number;
    winRate: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
  };
  createdAt: Date;
  lastActivity: Date;
}

export interface Activity {
  id: string;
  timestamp: Date;
  botName: string;
  action: 'buy' | 'sell' | 'close';
  symbol: string;
  quantity: number;
  price: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface PortfolioStats {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  activeBots: number;
  totalBots: number;
  totalTrades: number;
  winRate: number;
}

// Generate mock portfolio stats
export const mockPortfolioStats: PortfolioStats = {
  totalValue: 125432.50,
  dailyChange: 1234.56,
  dailyChangePercent: 0.98,
  activeBots: 5,
  totalBots: 8,
  totalTrades: 156,
  winRate: 62.5,
};

// Generate mock bots
export const mockBots: Bot[] = [
  {
    id: '1',
    name: 'BTC Scalper',
    description: 'High-frequency scalping strategy for Bitcoin with tight stop losses',
    status: 'active',
    exchange: 'coinbase_pro',
    assetType: 'crypto',
    tradingMode: 'paper',
    webhookUrl: 'https://api.ror-trader.com/webhook/bot-1/wh_sec_k9Hj3nD8sK2l9Qw7',
    webhookSecret: 'wh_sec_k9Hj3nD8sK2l9Qw7',
    positionSizing: {
      type: 'fixed',
      value: 1000,
    },
    riskManagement: {
      stopLoss: 2,
      takeProfit: 5,
      maxDailyLoss: 500,
      maxPositions: 3,
    },
    performance: {
      totalReturn: 523.12,
      returnPercentage: 2.1,
      tradesCount: 15,
      winRate: 73.3,
      sharpeRatio: 1.85,
      maxDrawdown: 3.2,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: '2',
    name: 'AAPL Swing',
    description: 'Swing trading strategy for Apple stock based on technical indicators',
    status: 'active',
    exchange: 'alpaca',
    assetType: 'stocks',
    tradingMode: 'live',
    webhookUrl: 'https://api.ror-trader.com/webhook/bot-2/wh_sec_m2Kp4aL9xN3r7Yt5',
    webhookSecret: 'wh_sec_m2Kp4aL9xN3r7Yt5',
    positionSizing: {
      type: 'percentage',
      value: 20,
    },
    riskManagement: {
      stopLoss: 3,
      takeProfit: 8,
      maxDailyLoss: 1000,
      maxPositions: 2,
    },
    performance: {
      totalReturn: 234.56,
      returnPercentage: 1.5,
      tradesCount: 3,
      winRate: 66.7,
      sharpeRatio: 1.42,
      maxDrawdown: 2.1,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '3',
    name: 'ETH DCA Bot',
    status: 'paused',
    exchange: 'coinbase_pro',
    assetType: 'crypto',
    tradingMode: 'live',
    performance: {
      totalReturn: 1234.00,
      returnPercentage: 5.2,
      tradesCount: 27,
      winRate: 85.2,
    },
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '4',
    name: 'SPY Options',
    status: 'active',
    exchange: 'alpaca',
    assetType: 'stocks',
    tradingMode: 'paper',
    performance: {
      totalReturn: -156.78,
      returnPercentage: -0.8,
      tradesCount: 8,
      winRate: 37.5,
    },
    lastActivity: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: '5',
    name: 'Momentum Trader',
    status: 'stopped',
    exchange: 'coinbase_pro',
    assetType: 'crypto',
    tradingMode: 'paper',
    performance: {
      totalReturn: 892.45,
      returnPercentage: 3.7,
      tradesCount: 42,
      winRate: 59.5,
    },
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

// Generate mock activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    botName: 'BTC Scalper',
    action: 'buy',
    symbol: 'BTC-USD',
    quantity: 0.01,
    price: 50123,
    status: 'completed',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 17), // 17 minutes ago
    botName: 'AAPL Swing',
    action: 'sell',
    symbol: 'AAPL',
    quantity: 100,
    price: 151.23,
    status: 'completed',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    botName: 'ETH DCA Bot',
    action: 'buy',
    symbol: 'ETH-USD',
    quantity: 0.5,
    price: 3234,
    status: 'completed',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    botName: 'SPY Options',
    action: 'close',
    symbol: 'SPY',
    quantity: 10,
    price: 445.67,
    status: 'pending',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    botName: 'BTC Scalper',
    action: 'sell',
    symbol: 'BTC-USD',
    quantity: 0.008,
    price: 50456,
    status: 'completed',
  },
];

// Chart data for portfolio value over time
export const mockChartData = [
  { date: '2024-01-01', value: 120000 },
  { date: '2024-01-02', value: 121500 },
  { date: '2024-01-03', value: 119800 },
  { date: '2024-01-04', value: 122300 },
  { date: '2024-01-05', value: 123700 },
  { date: '2024-01-06', value: 124100 },
  { date: '2024-01-07', value: 125432.50 },
];

// Utility function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Utility function to format percentage
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Utility function to format time ago
export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
