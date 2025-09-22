import type { Meta, StoryObj } from '@storybook/react';
import TradingViewChart from './Chart';
import type { Indicator, MarketCandle } from './ChartTypes';

const meta = {
  title: 'Charts/TradingView/Chart',
  component: TradingViewChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 880, height: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TradingViewChart>;

export default meta;

type Story = StoryObj<typeof meta>;

const generateCandles = (bars: number = 150): MarketCandle[] => {
  const now = Math.floor(Date.now() / 1000);
  let price = 50000;

  return Array.from({ length: bars }).map((_, index) => {
    const time = now - (bars - index) * 3600;
    const change = (Math.random() - 0.5) * 1200;
    const open = price;
    const close = Math.max(1000, open + change);
    const high = Math.max(open, close) + Math.random() * 600;
    const low = Math.min(open, close) - Math.random() * 600;
    const volume = Math.floor(Math.random() * 1_500_000 + 250_000);

    price = close;

    return {
      time,
      open,
      high,
      low: Math.max(0, low),
      close,
      volume,
    } satisfies MarketCandle;
  });
};

const sampleIndicators: Indicator[] = [
  {
    id: 'sma-20',
    name: 'SMA',
    type: 'overlay',
    enabled: true,
    parameters: { period: 20 },
    color: '#FFB800',
  },
  {
    id: 'ema-50',
    name: 'EMA',
    type: 'overlay',
    enabled: true,
    parameters: { period: 50 },
    color: '#00D4FF',
  },
  {
    id: 'rsi-14',
    name: 'RSI',
    type: 'panel',
    enabled: true,
    parameters: { period: 14 },
    color: '#9945FF',
  },
];

export const Candlestick: Story = {
  args: {
    data: generateCandles(),
    config: {
      type: 'candlestick',
      theme: 'dark',
      height: 420,
    },
    showVolume: true,
  },
};

export const Line: Story = {
  args: {
    data: generateCandles().map(({ time, close }) => ({
      time,
      open: close,
      high: close,
      low: close,
      close,
      volume: 0,
    })),
    config: {
      type: 'line',
      theme: 'light',
      height: 420,
    },
    showVolume: false,
  },
};

export const WithIndicators: Story = {
  args: {
    data: generateCandles(),
    config: {
      type: 'candlestick',
      theme: 'dark',
      height: 420,
    },
    indicators: sampleIndicators,
    showVolume: true,
  },
};
