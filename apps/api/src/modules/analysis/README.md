# Technical Analysis Module

This module provides technical analysis capabilities for the RoR Trader platform, powering the strategy builder and indicator calculations.

## Features

- **Indicator Calculations**: SMA, EMA, RSI, MACD, Bollinger Bands
- **Market Data Service**: Fetch candles from exchanges (Coinbase Pro, Alpaca, Demo)
- **Real-time Updates**: WebSocket support for live indicator updates
- **Caching**: Redis-based caching for performance
- **Signal Detection**: Automatic bullish/bearish/neutral signal generation

## API Endpoints

### Calculate Single Indicator
```
POST /api/analysis/indicator
{
  "symbol": "BTC-USD",
  "indicator": "RSI",
  "params": {
    "period": 14
  },
  "candles": [
    {
      "time": 1641024000000,
      "open": 47000,
      "high": 47500,
      "low": 46500,
      "close": 47200,
      "volume": 1234567
    }
    // ... more candles
  ]
}
```

### Calculate Multiple Indicators
```
POST /api/analysis/batch
{
  "symbol": "ETH-USD",
  "indicators": [
    { "name": "SMA", "params": { "period": 20 } },
    { "name": "RSI", "params": { "period": 14 } },
    { "name": "MACD" }
  ],
  "candles": [...]
}
```

### Get Supported Indicators
```
GET /api/analysis/indicators
```

## Supported Indicators

| Indicator | Type | Default Parameters | Signal Logic |
|-----------|------|-------------------|--------------|
| SMA | Trend | period: 20 | Price vs MA + trend direction |
| EMA | Trend | period: 20 | Price vs MA + trend direction |
| RSI | Momentum | period: 14 | >70 bearish, <30 bullish |
| MACD | Trend | fast: 12, slow: 26, signal: 9 | Histogram crossovers |
| Bollinger Bands | Volatility | period: 20, stdDev: 2 | Price at bands |

## Integration with Frontend

The frontend strategy builder components can use these endpoints to:

1. Calculate indicators when users add them to charts
2. Get real-time signals for strategy conditions
3. Backtest strategies with historical data

## Example Usage

```typescript
// Frontend service
async function addIndicatorToChart(symbol: string, indicator: string) {
  const candles = await fetchCandles(symbol);
  
  const response = await fetch('/api/analysis/indicator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol,
      indicator,
      params: { period: 20 },
      candles
    })
  });
  
  const result = await response.json();
  
  // Add to chart
  chart.addIndicator(result.data.values);
  
  // Show signal
  showSignal(result.data.signal, result.data.strength);
}
```

## Testing

Run tests with:
```bash
npm test -- analysis
```

## Future Enhancements

- [ ] Add more indicators (Stochastic, ATR, Volume indicators)
- [ ] Implement pattern recognition (Head & Shoulders, Triangles)
- [ ] Add custom indicator builder
- [ ] Optimize calculations with WebAssembly
- [ ] Add more exchanges (Binance, Kraken)
- [ ] Implement indicator alerts
