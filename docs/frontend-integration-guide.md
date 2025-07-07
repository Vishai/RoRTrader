# Frontend Integration Guide - Technical Analysis API

This guide explains how to connect the strategy builder UI components from Session 10 to the new Technical Analysis API.

## Quick Start

### 1. Update TradingViewChart Component

Update `/apps/web/components/charts/TradingViewChart.tsx` to fetch real indicator data:

```typescript
import { useQuery } from '@tanstack/react-query';

// Add to the component
const fetchIndicatorData = async (symbol: string, indicator: string, params: any) => {
  // First, get candle data (you might already have this)
  const candles = await fetch(`/api/analysis/candles?symbol=${symbol}&limit=100`).then(r => r.json());
  
  // Calculate indicator
  const response = await fetch('/api/analysis/indicator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol,
      indicator,
      params,
      candles: candles.data
    })
  });
  
  return response.json();
};

// In your addIndicator function
const addIndicator = async (indicatorType: string, settings: any) => {
  const result = await fetchIndicatorData(symbol, indicatorType, settings);
  
  // Add the calculated values to the chart
  const series = chart.addLineSeries({
    color: settings.color || '#2962FF',
    lineWidth: 2,
    title: indicatorType
  });
  
  // Map values to chart format
  const chartData = result.data.values.map((value: number, index: number) => ({
    time: candles[index + (candles.length - result.data.values.length)].time,
    value
  }));
  
  series.setData(chartData);
};
```

### 2. Update IndicatorStatusCards

Connect to the batch endpoint for multiple indicators:

```typescript
// In IndicatorStatusCards.tsx
const { data: indicatorResults } = useQuery({
  queryKey: ['indicators', 'batch', symbol],
  queryFn: async () => {
    const response = await fetch('/api/analysis/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        indicators: [
          { name: 'RSI', params: { period: 14 } },
          { name: 'MACD' },
          { name: 'BOLLINGER', params: { period: 20, stdDev: 2 } }
        ],
        candles: currentCandles // You need to provide candle data
      })
    });
    return response.json();
  },
  refetchInterval: 30000 // Refresh every 30 seconds
});

// Use the results
{indicatorResults?.data.indicators.map((result) => (
  <IndicatorCard
    key={result.indicator}
    name={result.indicator}
    signal={result.signal}
    strength={result.strength}
    value={result.values[result.values.length - 1]} // Latest value
  />
))}
```

### 3. Real-time Updates with WebSocket

For live indicator updates:

```typescript
// Create a hook for real-time data
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useRealtimeIndicators(symbol: string, indicators: string[]) {
  const [data, setData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const socket = io('http://localhost:3001');
    
    // Subscribe to indicator updates
    socket.emit('subscribe', {
      symbol,
      indicators
    });
    
    socket.on('indicator-update', (update) => {
      setData(prev => ({
        ...prev,
        [update.indicator]: update
      }));
    });
    
    return () => {
      socket.emit('unsubscribe', { symbol });
      socket.disconnect();
    };
  }, [symbol, indicators]);
  
  return data;
}
```

### 4. Strategy Execution Integration

When a strategy is created in the StrategyBuilderCanvas, save it with indicator requirements:

```typescript
const saveStrategy = async (strategy: Strategy) => {
  // Extract required indicators from strategy nodes
  const requiredIndicators = strategy.nodes
    .filter(node => node.type === 'indicator')
    .map(node => ({
      name: node.data.indicator,
      params: node.data.params
    }));
  
  // Save strategy with bot
  const response = await fetch('/api/bots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: strategy.name,
      strategy: {
        conditions: strategy.conditions,
        indicators: requiredIndicators
      }
    })
  });
  
  return response.json();
};
```

## API Service Layer

Create a service layer for cleaner code:

```typescript
// /apps/web/services/analysis.service.ts
export class AnalysisService {
  private baseUrl = '/api/analysis';
  
  async calculateIndicator(symbol: string, indicator: string, params: any, candles: any[]) {
    const response = await fetch(`${this.baseUrl}/indicator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, indicator, params, candles })
    });
    
    if (!response.ok) throw new Error('Failed to calculate indicator');
    return response.json();
  }
  
  async batchCalculate(symbol: string, indicators: any[], candles: any[]) {
    const response = await fetch(`${this.baseUrl}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, indicators, candles })
    });
    
    if (!response.ok) throw new Error('Failed to calculate indicators');
    return response.json();
  }
  
  async getSupportedIndicators() {
    const response = await fetch(`${this.baseUrl}/indicators`);
    if (!response.ok) throw new Error('Failed to fetch indicators');
    return response.json();
  }
}

export const analysisService = new AnalysisService();
```

## Error Handling

Always handle API errors gracefully:

```typescript
try {
  const result = await analysisService.calculateIndicator(
    'BTC-USD',
    'RSI',
    { period: 14 },
    candles
  );
  
  // Use result
} catch (error) {
  console.error('Failed to calculate indicator:', error);
  
  // Show user-friendly error
  toast.error('Unable to calculate indicator. Please try again.');
  
  // Fallback to cached or default values
  return getCachedIndicatorValue(symbol, 'RSI');
}
```

## Performance Tips

1. **Cache Results**: Use React Query for automatic caching
2. **Batch Requests**: Calculate multiple indicators in one request
3. **Debounce Updates**: Don't recalculate on every parameter change
4. **Use WebSocket**: For real-time updates instead of polling

## Next Steps

1. Add loading states to all indicator components
2. Implement error boundaries for chart crashes
3. Add indicator parameter validation on frontend
4. Create indicator preset templates
5. Add performance monitoring

This integration will make the strategy builder fully functional with real technical analysis calculations!
