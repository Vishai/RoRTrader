# 📋 RoR Trader Transition - Bot-Indicator Integration Gap

## 🚨 Critical Missing Features

### Current Bot Model Limitations

The bot model is missing essential fields:
1. **No symbol/instrument specification** - Bots can't specify what to trade (BTC-USD, AAPL, etc.)
2. **No indicator inputs** - Bots have no way to use the advanced indicators we built
3. **No strategy connection** - The strategy system exists separately from bots
4. **No market data configuration** - Can't specify timeframes or data sources

### What We Built vs What Bots Need

**✅ What We Built (Sessions 10-12):**
- Advanced indicator calculation engine
- Strategy builder with drag-and-drop
- Real-time market data service
- Beautiful trading UI components

**❌ What's Missing in Bot Model:**
```typescript
// Current Bot model has:
interface Bot {
  id: string;
  name: string;
  exchange: string;
  tradingMode: 'paper' | 'live';
  webhookSecret: string;
  // Missing: symbol, indicators, strategy, timeframe!
}

// What it SHOULD have:
interface Bot {
  id: string;
  name: string;
  
  // MISSING - Trading Configuration
  symbol: string;              // e.g., "BTC-USD", "AAPL"
  exchange: string;            // e.g., "coinbase", "alpaca"
  assetType: 'crypto' | 'stock' | 'forex';
  timeframe: string;           // e.g., "5m", "1h", "1d"
  
  // MISSING - Strategy & Indicators
  strategyId?: string;         // Link to strategy
  indicators: BotIndicator[];  // Indicator configurations
  signalMode: 'any' | 'all' | 'majority' | 'custom';
  
  // MISSING - Risk Management
  positionSize: PositionSizing;
  stopLoss?: number;
  takeProfit?: number;
  maxDrawdown?: number;
  
  // Existing fields
  tradingMode: 'paper' | 'live';
  webhookSecret: string;
  status: 'active' | 'paused' | 'stopped';
}
```

---

## 🔧 Required Database Changes

### 1. Update Bot Schema

```prisma
model Bot {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  
  // Basic Info
  name           String
  description    String?
  
  // Trading Configuration
  symbol         String   // NEW: What to trade
  exchange       String   
  assetType      String   // NEW: crypto/stock/forex
  timeframe      String   // NEW: 5m/15m/1h/4h/1d
  
  // Strategy & Indicators
  strategyId     String?  // NEW: Link to strategy
  strategy       Strategy? @relation(fields: [strategyId], references: [id])
  signalMode     String   @default("all") // NEW: How to combine signals
  
  // Risk Management
  positionSizing Json     // NEW: Fixed/percentage/kelly
  stopLoss       Float?   // NEW: Stop loss percentage
  takeProfit     Float?   // NEW: Take profit percentage
  maxDrawdown    Float?   // NEW: Maximum allowed drawdown
  
  // Existing fields
  tradingMode    String   @default("paper")
  webhookSecret  String   @unique
  status         String   @default("stopped")
  
  // Relationships
  indicators     BotIndicator[] // NEW: Indicator configurations
  trades         Trade[]
  webhooks       WebhookLog[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([userId])
  @@index([symbol, exchange])
}

// NEW: Bot-specific indicator configuration
model BotIndicator {
  id         String   @id @default(uuid())
  botId      String
  bot        Bot      @relation(fields: [botId], references: [id])
  
  indicator  String   // e.g., "rsi", "macd", "ema"
  parameters Json     // e.g., { period: 14, overbought: 70 }
  weight     Float    @default(1.0) // Importance in decision
  enabled    Boolean  @default(true)
  
  // Signal thresholds
  buySignal  Json?    // e.g., { operator: "lt", value: 30 }
  sellSignal Json?    // e.g., { operator: "gt", value: 70 }
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([botId])
}
```

### 2. Migration SQL

```sql
-- Add new columns to bots table
ALTER TABLE bots ADD COLUMN symbol VARCHAR(50);
ALTER TABLE bots ADD COLUMN asset_type VARCHAR(20) DEFAULT 'crypto';
ALTER TABLE bots ADD COLUMN timeframe VARCHAR(10) DEFAULT '1h';
ALTER TABLE bots ADD COLUMN strategy_id UUID;
ALTER TABLE bots ADD COLUMN signal_mode VARCHAR(20) DEFAULT 'all';
ALTER TABLE bots ADD COLUMN position_sizing JSONB DEFAULT '{"type":"fixed","value":100}';
ALTER TABLE bots ADD COLUMN stop_loss DECIMAL(5,2);
ALTER TABLE bots ADD COLUMN take_profit DECIMAL(5,2);
ALTER TABLE bots ADD COLUMN max_drawdown DECIMAL(5,2);

-- Create bot_indicators table
CREATE TABLE bot_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  indicator VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  enabled BOOLEAN DEFAULT true,
  buy_signal JSONB,
  sell_signal JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bot_indicators_bot_id ON bot_indicators(bot_id);
```

---

## 🎯 Implementation Tasks

### Phase 1: Update Bot Model (Critical)

1. **Update Prisma Schema**
   ```bash
   cd apps/api
   # Update schema.prisma with new fields
   npx prisma migrate dev --name add-bot-trading-fields
   npx prisma generate
   ```

2. **Update Bot DTOs**
   - Add symbol, timeframe, assetType to CreateBotDto
   - Add indicator configuration array
   - Add risk management fields

3. **Update Bot Service**
   - Modify createBot to handle indicators
   - Add methods to update bot indicators
   - Add indicator validation

### Phase 2: Update UI Components

1. **Bot Creation Wizard Updates**
   - Add instrument/symbol selector
   - Add timeframe selector
   - Add indicator configuration step
   - Connect to strategy builder

2. **Bot Detail Page**
   - Show current symbol and indicators
   - Display live indicator values
   - Show signal status

3. **Dashboard Updates**
   - Show symbol in bot cards
   - Display indicator summary
   - Add quick symbol filter

### Phase 3: Connect the Systems

1. **Webhook Processing**
   ```typescript
   // Current: Webhook just triggers trade
   // New: Webhook triggers indicator check first
   
   async processWebhook(botId: string, signal: WebhookSignal) {
     const bot = await this.getBot(botId);
     
     // NEW: Check indicators before trading
     const indicatorSignals = await this.checkIndicators(
       bot.symbol,
       bot.timeframe,
       bot.indicators
     );
     
     // NEW: Combine signals based on signalMode
     const shouldTrade = this.evaluateSignals(
       indicatorSignals,
       bot.signalMode
     );
     
     if (shouldTrade) {
       await this.executeTrade(bot, signal);
     }
   }
   ```

2. **Real-time Bot Monitoring**
   - Subscribe bots to their symbol's market data
   - Calculate indicators in real-time
   - Update bot status based on signals

---

## 📁 Files to Update

### Backend
- `/apps/api/prisma/schema.prisma` - Add new fields
- `/apps/api/src/modules/bots/dto/create-bot.dto.ts` - Add validation
- `/apps/api/src/modules/bots/bots.service.ts` - Handle indicators
- `/apps/api/src/modules/bots/bots.controller.ts` - New endpoints
- `/apps/api/src/modules/webhooks/webhook.processor.ts` - Check indicators

### Frontend
- `/apps/web/components/bots/BotCreationWizard.tsx` - Add steps
- `/apps/web/components/bots/SymbolSelector.tsx` - NEW component
- `/apps/web/components/bots/IndicatorSelector.tsx` - NEW component
- `/apps/web/components/bots/BotCard.tsx` - Show symbol
- `/apps/web/services/bot.service.ts` - NEW service

---

## 🚀 Quick Start for Next Session

### Option 1: Database First
```bash
# Update schema and migrate
cd apps/api
# Edit prisma/schema.prisma
npx prisma migrate dev --name add-bot-trading-fields
npx prisma generate

# Update DTOs and services
# Then update UI components
```

### Option 2: UI First (Mock)
```bash
# Create UI components with mock data
# Symbol selector
# Indicator configuration
# Then implement backend
```

### Option 3: Minimal MVP
```bash
# Just add symbol field
# Skip advanced indicators for now
# Get basic trading working first
```

---

## ⚡ Priority Order

1. **Add symbol to bots** (Critical - can't trade without knowing what)
2. **Add timeframe** (Important - indicators need this)
3. **Connect to strategy** (Nice to have - can add later)
4. **Add risk management** (Important but can start with defaults)
5. **Real-time indicators** (Advanced - can use webhooks first)

---

## 📊 Example Bot Configuration

```typescript
// What a complete bot should look like
const exampleBot = {
  id: "bot-123",
  name: "BTC Scalper",
  symbol: "BTC-USD",
  exchange: "coinbase",
  assetType: "crypto",
  timeframe: "5m",
  
  indicators: [
    {
      indicator: "rsi",
      parameters: { period: 14 },
      weight: 1.0,
      buySignal: { operator: "lt", value: 30 },
      sellSignal: { operator: "gt", value: 70 }
    },
    {
      indicator: "ema_cross",
      parameters: { fast: 12, slow: 26 },
      weight: 0.8,
      buySignal: { operator: "crosses_above" },
      sellSignal: { operator: "crosses_below" }
    }
  ],
  
  signalMode: "all", // Both indicators must agree
  
  positionSizing: {
    type: "percentage",
    value: 2 // 2% of portfolio per trade
  },
  
  stopLoss: 2,     // 2% stop loss
  takeProfit: 5,   // 5% take profit
  maxDrawdown: 10, // 10% max drawdown
  
  tradingMode: "paper",
  status: "active"
};
```

---

## 🎭 Demo Impact

Without these changes:
- Can't show "Trading BTC-USD" in demos
- Can't show indicators affecting bot decisions
- Advanced UI feels disconnected from bots

With these changes:
- "Look, the bot is trading BTC with RSI and MACD signals"
- "It only enters when both indicators agree"
- "Each bot can trade different symbols with different strategies"

---

## 💡 Summary

**The Problem**: We built advanced trading features but bots can't use them
**The Solution**: Update bot model to include symbol, indicators, and strategy
**The Priority**: Add symbol field first (minimum viable trading)
**The Timeline**: 1-2 days for full implementation

This is the critical bridge between our beautiful advanced UI and actual trading functionality!

---

✅ Transition document saved: `/docs/transitions/ror-trader-bot-indicator-gap.md`

Next session should start with: "Continue RoR Trader - implementing bot symbol and indicators"