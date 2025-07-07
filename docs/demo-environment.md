# RoR Trader Demo Environment

The demo environment provides a complete simulation of the RoR Trader platform with realistic data and automated activity. Perfect for presentations, testing, and learning.

## Features

### 🎯 Mock Data Generator
- Creates 5 pre-configured trading bots with different strategies
- Generates realistic trade history with varying performance
- Populates webhook logs and performance metrics
- Supports crypto (Coinbase Pro) and stocks (Alpaca) demonstrations

### 🔄 Live Webhook Simulation
- Automated webhook generation every 30 seconds
- Realistic trading patterns (scalping, swing, momentum)
- Market event simulation (breakouts, support/resistance)
- Visual webhook processing in real-time

### 📊 Performance Scenarios
Generate different performance patterns on demand:
- **Winning**: High win rate (65%), positive returns
- **Volatile**: Mixed results with big swings
- **Steady**: Consistent growth with lower volatility

### 🎭 Presentation Mode
- Full-screen presentation deck at `/demo`
- 6 slides covering problem, solution, performance, and market opportunity
- Auto-play mode with 8-second intervals
- Impressive stats and live data integration

## Getting Started

### 1. Enable Demo Mode

Demo mode can be enabled through environment variables:

```bash
# In your .env file
DEMO_MODE=true
```

Or toggle it from the UI at `/demo/settings`

### 2. Generate Demo Data

```bash
# API endpoint to initialize demo data
POST /api/demo/initialize

# Or use the UI at /demo/settings
```

This creates:
- 5 trading bots with different strategies
- 50-100 trades per bot over 30 days
- Performance metrics and analytics
- Recent webhook activity

### 3. View Demo

- **Dashboard**: See all demo bots and performance at `/dashboard`
- **Presentation**: View investor deck at `/demo`
- **Settings**: Manage demo mode at `/demo/settings`

## API Endpoints

### Status
```bash
GET /api/demo/status
# Returns demo configuration and status
```

### Initialize Demo
```bash
POST /api/demo/initialize
# Creates complete demo dataset for authenticated user
```

### Generate Scenario
```bash
POST /api/demo/scenario
Body: { "scenario": "winning" | "volatile" | "steady" }
# Generates specific performance pattern
```

### Cleanup
```bash
DELETE /api/demo/cleanup
# Removes all demo data for user
```

### Presentation Data
```bash
GET /api/demo/presentation
# Returns aggregated stats for presentation
```

## Demo Bot Configurations

### 1. BTC Momentum Scanner
- **Type**: Crypto (Coinbase Pro)
- **Strategy**: High-frequency momentum trading
- **Performance**: Winning profile
- **Trade Frequency**: High (50-100 trades)

### 2. ETH Grid Trading Bot
- **Type**: Crypto (Coinbase Pro)
- **Strategy**: Grid trading in range
- **Performance**: Mixed results
- **Trade Frequency**: Medium (20-40 trades)

### 3. AAPL Swing Trader
- **Type**: Stocks (Alpaca)
- **Strategy**: Multi-day swing trades
- **Performance**: Winning profile
- **Trade Frequency**: Low (5-15 trades)

### 4. Tech Stock Scalper
- **Type**: Stocks (Alpaca)
- **Strategy**: Quick scalping trades
- **Performance**: Mixed results
- **Trade Frequency**: High (50-100 trades)

### 5. Crypto DCA Strategy
- **Type**: Crypto (Coinbase Pro)
- **Strategy**: Dollar cost averaging
- **Performance**: Steady growth
- **Trade Frequency**: Low (5-15 trades)

## Security Considerations

- Demo mode is clearly indicated with watermarks
- All demo data is marked with `isDemo: true` metadata
- Demo bots only support paper trading mode
- No real API keys or funds are used
- Demo data is isolated from production data

## Customization

### Webhook Interval
Default: 30 seconds
```javascript
// Update via API
PUT /api/demo/config
Body: { "config": { "webhookInterval": 60000 } }
```

### Disable Watermark
```javascript
PUT /api/demo/config
Body: { "config": { "showDemoWatermark": false } }
```

### Custom Scenarios
The performance simulator supports custom patterns. Contact the development team to add new scenarios.

## Best Practices

1. **For Presentations**:
   - Generate fresh demo data before each presentation
   - Use "winning" scenario for investor demos
   - Enable auto-play in presentation mode
   - Test webhook simulation beforehand

2. **For Testing**:
   - Use "volatile" scenario to test error handling
   - Generate failed webhooks to test retry logic
   - Monitor performance with different data volumes

3. **For Development**:
   - Clean up demo data regularly
   - Use demo mode for UI development
   - Test with all three performance scenarios

## Troubleshooting

### Demo data not appearing
1. Check if demo mode is enabled
2. Verify authentication token
3. Check for existing demo data (cleanup may be needed)

### Webhooks not simulating
1. Verify demo configuration has `simulateWebhooks: true`
2. Check webhook interval setting
3. Ensure at least one bot is active

### Performance metrics missing
1. Wait for background calculation (may take a few seconds)
2. Check if trades exist for the bot
3. Verify date ranges in queries

## Future Enhancements

- [ ] Custom bot templates
- [ ] Adjustable time ranges for historical data
- [ ] Export demo data as JSON
- [ ] Replay specific market scenarios
- [ ] Multi-user demo sessions
- [ ] Recording and playback of demos

---

For questions or issues with the demo environment, please contact the development team.
