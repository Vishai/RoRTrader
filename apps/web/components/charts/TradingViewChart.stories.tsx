import type { Meta, StoryObj } from '@storybook/react';
import { TradingViewChart } from './TradingViewChart';

const meta = {
  title: 'Charts/TradingViewChart',
  component: TradingViewChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TradingViewChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample candlestick data
const generateCandlestickData = (days: number = 100) => {
  const data = [];
  const now = Date.now();
  let price = 50000;
  
  for (let i = days; i >= 0; i--) {
    const time = new Date(now - i * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * 2000;
    const high = price + Math.random() * 1000 + 200;
    const low = price - Math.random() * 1000 - 200;
    const close = price + change;
    const open = price;
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000 + 500000),
    });
    
    price = close;
  }
  
  return data;
};

// Generate sample line data
const generateLineData = (days: number = 100) => {
  const data = [];
  const now = Date.now();
  let value = 100;
  
  for (let i = days; i >= 0; i--) {
    const time = new Date(now - i * 86400000).toISOString().split('T')[0];
    value += (Math.random() - 0.5) * 10;
    
    data.push({
      time,
      value,
    });
  }
  
  return data;
};

export const Candlestick: Story = {
  args: {
    data: generateCandlestickData(),
    type: 'candlestick',
    height: 400,
  },
};

export const WithIndicators: Story = {
  args: {
    data: generateCandlestickData(),
    type: 'candlestick',
    height: 400,
    indicators: {
      sma: [
        { period: 20, color: '#FFB800' },
        { period: 50, color: '#9945FF' },
      ],
      ema: [
        { period: 12, color: '#00D4FF' },
        { period: 26, color: '#00FF88' },
      ],
    },
  },
};

export const LineChart: Story = {
  args: {
    data: generateLineData(),
    type: 'line',
    height: 400,
    colors: {
      lineColor: '#00D4FF',
    },
  },
};

export const AreaChart: Story = {
  args: {
    data: generateLineData(),
    type: 'area',
    height: 400,
    colors: {
      lineColor: '#00FF88',
      areaTopColor: 'rgba(0, 255, 136, 0.56)',
      areaBottomColor: 'rgba(0, 255, 136, 0.04)',
    },
  },
};

export const BarChart: Story = {
  args: {
    data: generateCandlestickData(),
    type: 'bar',
    height: 400,
  },
};

export const DarkTheme: Story = {
  args: {
    data: generateCandlestickData(50),
    type: 'candlestick',
    height: 400,
    colors: {
      backgroundColor: '#0A0A0B',
      textColor: '#B8B8BD',
    },
  },
};

export const CustomColors: Story = {
  args: {
    data: generateCandlestickData(30),
    type: 'candlestick',
    height: 400,
    colors: {
      backgroundColor: '#1a1a2e',
      textColor: '#eee',
    },
    indicators: {
      sma: [
        { period: 10, color: '#f39c12' },
        { period: 30, color: '#e74c3c' },
      ],
    },
  },
};
