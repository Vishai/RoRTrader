# Strategy Database Schema Documentation

## Overview

The strategy database schema enables the RoR Trader platform to persist and manage complex trading strategies created in the visual strategy builder. This implementation supports indicators, conditions, templates, and backtesting results.

## Database Tables

### 1. BotStrategy
Main strategy configuration for each bot.

```sql
- id: UUID (Primary Key)
- botId: UUID (Unique - one strategy per bot)
- name: String
- description: String?
- templateId: UUID? (Reference to template if used)
- isActive: Boolean (default: true)
- version: Int (incremented on updates)
- createdAt: DateTime
- updatedAt: DateTime
```

### 2. StrategyIndicator
Technical indicators used in the strategy.

```sql
- id: UUID (Primary Key)
- strategyId: UUID
- indicatorType: Enum (SMA, EMA, RSI, MACD, etc.)
- params: JSON ({period: 20, stdDev: 2, etc})
- color: String? (For UI display)
- displayOrder: Int
- createdAt: DateTime
```

### 3. StrategyCondition
Entry and exit conditions for the strategy.

```sql
- id: UUID (Primary Key)
- strategyId: UUID
- type: Enum (ENTRY, EXIT)
- indicatorId: UUID?
- operator: Enum (CROSSES_ABOVE, GREATER_THAN, etc.)
- compareToType: Enum (VALUE, INDICATOR, PRICE)
- compareToValue: JSON
- logicalOperator: Enum? (AND, OR)
- orderIndex: Int
- createdAt: DateTime
```

### 4. StrategyBacktest
Historical backtest results.

```sql
- id: UUID (Primary Key)
- strategyId: UUID
- startDate: DateTime
- endDate: DateTime
- initialCapital: Decimal
- finalCapital: Decimal
- totalTrades: Int
- winningTrades: Int
- totalReturn: Decimal
- sharpeRatio: Decimal?
- maxDrawdown: Decimal
- results: JSON (detailed trade data)
- createdAt: DateTime
```

### 5. StrategyTemplate
Pre-built strategy templates.

```sql
- id: UUID (Primary Key)
- name: String (Unique)
- displayName: String
- description: String
- category: Enum (TREND_FOLLOWING, MOMENTUM, etc.)
- difficulty: Enum (BEGINNER to EXPERT)
- timeframe: String
- assetTypes: AssetType[]
- configuration: JSON
- performance: JSON?
- usageCount: Int
- rating: Decimal?
```

## API Endpoints

### Strategy Management

```typescript
// Create new strategy
POST /api/strategies
{
  botId: string,
  name: string,
  indicators: [...],
  entryConditions: [...],
  exitConditions: [...]
}

// Get strategy by bot ID
GET /api/strategies/bot/:botId

// Update strategy
PUT /api/strategies/:id

// Delete strategy
DELETE /api/strategies/:id
```

### Strategy Templates

```typescript
// Get available templates
GET /api/strategies/templates?category=TREND_FOLLOWING&difficulty=BEGINNER

// Get specific template
GET /api/strategies/templates/:id

// Create strategy from template
POST /api/strategies/from-template
{
  botId: string,
  templateId: string
}
```

## Strategy Evaluation

The `StrategyEvaluationService` evaluates strategies in real-time:

1. **Calculate Indicators**: Compute all indicator values
2. **Evaluate Conditions**: Check if entry/exit conditions are met
3. **Combine Results**: Apply logical operators (AND/OR)
4. **Generate Signals**: Return trading decisions with confidence scores

## Example Strategy Configuration

```json
{
  "name": "Golden Cross Strategy",
  "indicators": [
    {
      "type": "SMA",
      "params": { "period": 50 },
      "color": "#FFD700"
    },
    {
      "type": "SMA", 
      "params": { "period": 200 },
      "color": "#C0C0C0"
    }
  ],
  "entryConditions": [
    {
      "indicatorId": "0",
      "operator": "CROSSES_ABOVE",
      "compareToType": "INDICATOR",
      "compareToValue": { "indicatorId": "1" }
    }
  ],
  "exitConditions": [
    {
      "indicatorId": "0",
      "operator": "CROSSES_BELOW",
      "compareToType": "INDICATOR",
      "compareToValue": { "indicatorId": "1" }
    }
  ]
}
```

## Migration Instructions

```bash
# Create and apply migration
cd apps/api
npx prisma migrate dev --name add-strategy-tables

# Seed strategy templates
npm run seed:strategies
# or
npx tsx src/database/seed-strategies.ts
```

## Integration with Webhook Processor

When a webhook is received:

1. Load bot's strategy
2. Fetch recent candles
3. Evaluate strategy conditions
4. Generate trade signals
5. Execute orders based on signals

## Security Considerations

- Strategies are tied to bot ownership
- All API endpoints require authentication
- User can only access their own strategies
- Template configurations are read-only
- Sensitive strategy data never exposed in logs

## Performance Optimizations

- Indicator values cached in Redis (60s TTL)
- Strategy configurations cached on first load
- Batch indicator calculations for efficiency
- Indexes on frequently queried fields

## Next Steps

1. **Connect to UI**: Wire strategy builder to save via API
2. **Webhook Integration**: Update processor to use strategies
3. **Backtesting Engine**: Implement historical testing
4. **Real-time Updates**: WebSocket for live strategy monitoring
5. **Advanced Features**: Multi-timeframe, custom indicators
