# RoR Trader Product Requirements Document (PRD)

## Executive Summary

RoR Trader is a multi-asset trading bot platform that enables users to create, deploy, and manage automated trading strategies through webhook integrations. The platform focuses on security, performance, and accessibility for both novice and experienced traders.

**Vision**: Democratize algorithmic trading by providing a secure, user-friendly platform that connects trading signals to real market execution across multiple asset classes.

**MVP Scope**: Bot-centric platform supporting crypto (Coinbase Pro) and stocks (Alpaca) with TradingView webhook integration, paper/live trading modes, and enterprise-grade security.

**Timeline**: 2 months development (3 months with buffer)  
**Budget**: <$300/month infrastructure costs
**Project Location**: /Users/brandonarmstrong/Documents/Github/RoRTrader

---

## 1. Product Overview

### 1.1 Problem Statement

Current algorithmic trading solutions suffer from:

- **Complexity**: Require programming knowledge
- **Security Risks**: Poor API key management
- **Limited Integration**: Single exchange/broker focus
- **High Costs**: Enterprise solutions unaffordable for individuals
- **Poor Analytics**: Basic performance tracking

### 1.2 Solution

RoR Trader provides:

- **Simple Bot Creation**: No coding required
- **Bank-Grade Security**: Encrypted API keys, mandatory 2FA
- **Multi-Platform Support**: Trade crypto and stocks from one platform
- **Webhook Integration**: Connect any signal source via webhooks
- **Advanced Analytics**: Professional metrics (Sharpe ratio, drawdown)
- **Flexible Pricing**: From free tier to enterprise

### 1.3 Target Users

1. **Primary**: TradingView strategy developers wanting automated execution
2. **Secondary**: Crypto traders seeking multi-exchange automation
3. **Tertiary**: Stock traders transitioning to algorithmic trading

### 1.4 Success Metrics

- **User Acquisition**: 1,000 users in first 6 months
- **Bot Activity**: 100+ active bots by month 3
- **Webhook Volume**: 10,000 webhooks/day by month 6
- **Revenue**: $10K MRR by month 6
- **Uptime**: >99.5% availability

---

## 2. User Personas

### 2.1 "Signal Steve" - TradingView Power User

- **Background**: Experienced trader with profitable TradingView strategies
- **Pain Points**: Manual trade execution, missed opportunities
- **Needs**: Reliable webhook execution, multiple exchange support
- **Value Prop**: Automate existing strategies without coding

### 2.2 "Crypto Catherine" - Multi-Exchange Trader

- **Background**: Trades on multiple crypto exchanges
- **Pain Points**: Managing multiple platforms, security concerns
- **Needs**: Unified dashboard, secure API management
- **Value Prop**: Trade everywhere from one secure platform

### 2.3 "Startup Sam" - Algo Trading Beginner

- **Background**: Stock investor exploring automation
- **Pain Points**: High barrier to entry, complex platforms
- **Needs**: Simple interface, paper trading, education
- **Value Prop**: Learn algorithmic trading safely

---

## 3. User Stories & Requirements

### 3.1 Authentication & Security

#### User Story

"As a trader, I want military-grade security so my funds and strategies are protected."

#### Requirements

- **REQ-AUTH-001**: Email/password registration with strong password requirements
- **REQ-AUTH-002**: Mandatory 2FA using TOTP (Google Authenticator compatible)
- **REQ-AUTH-003**: 2FA required for:
    - Login (after password)
    - Adding/modifying exchange credentials
    - Changing security settings
    - High-risk operations
- **REQ-AUTH-004**: Session management:
    - 24-hour max duration
    - 30-minute idle timeout
    - Maximum 3 concurrent sessions
- **REQ-AUTH-005**: Account lockout after 5 failed attempts (15 min)

### 3.2 Bot Management

#### User Story

"As a trader, I want to create and manage multiple trading bots so I can run different strategies simultaneously."

#### Requirements

- **REQ-BOT-001**: Create bots with configuration:
    
    ```typescript
    interface BotConfig {
      name: string;
      description?: string;
      assetType: 'crypto' | 'stocks';
      exchange: 'coinbase_pro' | 'alpaca';
      tradingMode: 'paper' | 'live';
      webhookSecret: string; // auto-generated
      positionSizing: {
        type: 'fixed' | 'percentage';
        value: number;
      };
      riskManagement: {
        stopLoss?: number;
        takeProfit?: number;
        maxDailyLoss?: number;
      };
    }
    ```
    
- **REQ-BOT-002**: List all user's bots with status
    
- **REQ-BOT-003**: Edit bot configuration
    
- **REQ-BOT-004**: Start/pause/stop bot operations
    
- **REQ-BOT-005**: Delete bots (with confirmation)
    
- **REQ-BOT-006**: Clone existing bot configuration
    
- **REQ-BOT-007**: Bot limits by subscription tier
    

### 3.3 Webhook Integration

#### User Story

"As a TradingView user, I want to send trading signals via webhooks so my strategies execute automatically."

#### Requirements

- **REQ-WEBHOOK-001**: Unique webhook URL per bot: `/webhook/{botId}/{secret}`
    
- **REQ-WEBHOOK-002**: Accept JSON payloads:
    
    ```json
    {
      "action": "buy" | "sell" | "close",
      "symbol": "BTC-USD" | "AAPL",
      "quantity": 0.001 | 100,
      "price": 50000 | 150.50,
      "stopLoss": 49000,
      "takeProfit": 52000,
      "orderId": "unique-id"
    }
    ```
    
- **REQ-WEBHOOK-003**: Process webhooks in <500ms
    
- **REQ-WEBHOOK-004**: Rate limiting: 10 webhooks/minute per bot
    
- **REQ-WEBHOOK-005**: Webhook signature verification
    
- **REQ-WEBHOOK-006**: Return 200 immediately, process async
    
- **REQ-WEBHOOK-007**: Retry failed webhooks (3x with exponential backoff)
    
- **REQ-WEBHOOK-008**: Dead letter queue for persistent failures
    

### 3.4 Exchange Integration

#### User Story

"As a trader, I want to connect my exchange accounts securely so I can execute real trades."

#### Requirements

##### Coinbase Pro (Crypto)

- **REQ-COIN-001**: OAuth2 or API key authentication
- **REQ-COIN-002**: Support spot trading for major pairs
- **REQ-COIN-003**: Market, limit, and stop orders
- **REQ-COIN-004**: Real-time balance updates
- **REQ-COIN-005**: Position tracking

##### Alpaca (Stocks)

- **REQ-ALPACA-001**: API key authentication
- **REQ-ALPACA-002**: Support US equities (NYSE, NASDAQ)
- **REQ-ALPACA-003**: Market, limit, stop, stop-limit orders
- **REQ-ALPACA-004**: Paper trading environment
- **REQ-ALPACA-005**: Extended hours trading support

##### Security Requirements

- **REQ-EXCH-SEC-001**: API keys encrypted with AES-256-GCM
- **REQ-EXCH-SEC-002**: Keys stored in KMS (never in plaintext)
- **REQ-EXCH-SEC-003**: Decrypt only in memory during trades
- **REQ-EXCH-SEC-004**: Audit log all API key access
- **REQ-EXCH-SEC-005**: Allow read-only vs trade permissions

### 3.5 Trading Execution

#### User Story

"As a trader, I want my orders executed quickly and reliably so I don't miss opportunities."

#### Requirements

- **REQ-TRADE-001**: Execute orders within 2 seconds of webhook
- **REQ-TRADE-002**: Support order types:
    - Market orders
    - Limit orders
    - Stop-loss orders
    - Take-profit orders
- **REQ-TRADE-003**: Position sizing:
    - Fixed dollar amount
    - Percentage of portfolio
    - Fixed units/shares
- **REQ-TRADE-004**: Risk management:
    - Max position size
    - Max daily loss
    - Max open positions
- **REQ-TRADE-005**: Order status tracking:
    - Pending
    - Filled
    - Partially filled
    - Cancelled
    - Failed
- **REQ-TRADE-006**: Paper trading simulation
- **REQ-TRADE-007**: Audit trail for all trades

### 3.6 Performance Analytics

#### User Story

"As a trader, I want detailed performance metrics so I can optimize my strategies."

#### Requirements

- **REQ-ANALYTICS-001**: Real-time metrics:
    - Total return ($ and %)
    - Win rate
    - Current positions
    - Today's P&L
- **REQ-ANALYTICS-002**: Historical metrics:
    - Sharpe ratio
    - Sortino ratio
    - Maximum drawdown
    - Profit factor
    - Average win/loss
- **REQ-ANALYTICS-003**: Trade analysis:
    - All trades history
    - Best/worst trades
    - Average hold time
    - Win/loss streaks
- **REQ-ANALYTICS-004**: Performance charts:
    - Equity curve
    - Daily returns
    - Drawdown chart
    - Trade distribution
- **REQ-ANALYTICS-005**: Export capabilities:
    - CSV trade history
    - PDF performance reports
    - Tax reports

### 3.7 Dashboard & UI

#### User Story

"As a user, I want an intuitive dashboard so I can monitor all my bots at a glance."

#### Requirements

- **REQ-UI-001**: Responsive design (mobile + desktop)
- **REQ-UI-002**: Dark theme by default
- **REQ-UI-003**: Main dashboard showing:
    - Active bots summary
    - Total portfolio value
    - Today's P&L
    - Recent trades
    - System status
- **REQ-UI-004**: Bot detail pages with:
    - Configuration
    - Performance metrics
    - Trade history
    - Webhook logs
- **REQ-UI-005**: Real-time updates via WebSocket
- **REQ-UI-006**: Loading states and error handling

### 3.8 Subscription & Billing

#### User Story

"As a platform owner, I want tiered subscriptions so I can monetize based on usage."

#### Requirements

- **REQ-SUB-001**: Subscription tiers:
    
    ```typescript
    interface SubscriptionTiers {
      free: {
        maxBots: 1,
        paperTradingOnly: true,
        webhooksPerDay: 100,
        basicAnalytics: true,
        price: "$0/month"
      },
      basic: {
        maxBots: 5,
        liveTrading: true,
        webhooksPerDay: 1000,
        advancedAnalytics: true,
        price: "$49/month"
      },
      pro: {
        maxBots: 20,
        liveTrading: true,
        webhooksPerDay: 10000,
        priorityExecution: true,
        apiAccess: true,
        price: "$149/month"
      },
      elite: {
        maxBots: 50,
        liveTrading: true,
        webhooksPerDay: 50000,
        dedicatedSupport: true,
        customIntegrations: true,
        price: "$499/month"
      }
    }
    ```
    
- **REQ-SUB-002**: Stripe integration for payments
    
- **REQ-SUB-003**: Usage tracking and limits
    
- **REQ-SUB-004**: Upgrade/downgrade workflows
    
- **REQ-SUB-005**: Grace period for expired subscriptions
    

---

## 4. Technical Architecture

### 4.1 System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  TradingView    │────▶│  Load Balancer  │────▶│   API Gateway   │
│                 │     │    (Nginx)      │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                              ┌───────────────────────────┴───────────────┐
                              │                                           │
                        ┌─────▼────────┐                          ┌──────▼──────┐
                        │              │                          │             │
                        │  Webhook     │                          │   Main API  │
                        │  Service     │                          │   Service   │
                        │              │                          │             │
                        └─────┬────────┘                          └──────┬──────┘
                              │                                           │
                        ┌─────▼────────┐     ┌──────────────┐    ┌──────▼──────┐
                        │              │     │              │    │             │
                        │    Redis     │◀────│  PostgreSQL  │───▶│     KMS     │
                        │    Queue     │     │              │    │             │
                        │              │     │              │    │             │
                        └─────┬────────┘     └──────────────┘    └─────────────┘
                              │
                  ┌───────────┴────────────┬─────────────────┐
                  │                        │                 │
            ┌─────▼────────┐        ┌─────▼────────┐  ┌─────▼────────┐
            │              │        │              │  │              │
            │   Webhook    │        │   Trading    │  │  Analytics   │
            │   Worker     │        │   Worker     │  │   Worker     │
            │              │        │              │  │              │
            └──────────────┘        └──────┬───────┘  └──────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                        ┌─────▼────────┐          ┌────▼─────────┐
                        │              │          │              │
                        │  Coinbase    │          │   Alpaca     │
                        │     Pro      │          │              │
                        │              │          │              │
                        └──────────────┘          └──────────────┘
```

### 4.2 Database Schema

```sql
-- Core user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    totp_secret VARCHAR(255), -- Encrypted
    totp_enabled BOOLEAN DEFAULT false,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trading bots
CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type ENUM('crypto', 'stocks') NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    trading_mode ENUM('paper', 'live') DEFAULT 'paper',
    webhook_secret VARCHAR(255) NOT NULL,
    position_sizing JSONB NOT NULL,
    risk_management JSONB,
    status ENUM('active', 'paused', 'stopped') DEFAULT 'stopped',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_bots (user_id),
    INDEX idx_webhook (webhook_secret)
);

-- Exchange credentials (encrypted)
CREATE TABLE exchange_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    encrypted_api_secret TEXT NOT NULL,
    key_permissions JSONB,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exchange)
);

-- Webhook logs
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status ENUM('received', 'processing', 'completed', 'failed') DEFAULT 'received',
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bot_webhooks (bot_id, created_at)
);

-- Trade executions
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    webhook_log_id UUID REFERENCES webhook_logs(id),
    exchange VARCHAR(50) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8),
    executed_price DECIMAL(20, 8),
    status VARCHAR(20) NOT NULL,
    exchange_order_id VARCHAR(255),
    fees DECIMAL(20, 8),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP,
    INDEX idx_bot_trades (bot_id, created_at)
);

-- Performance metrics
CREATE TABLE bot_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    total_return DECIMAL(10, 4),
    sharpe_ratio DECIMAL(8, 4),
    sortino_ratio DECIMAL(8, 4),
    max_drawdown DECIMAL(8, 4),
    profit_factor DECIMAL(8, 4),
    metrics_snapshot JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bot_id, date)
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_audit (user_id, created_at),
    INDEX idx_action_audit (action, created_at)
);
```

### 4.3 API Specification

#### Authentication Endpoints

```typescript
// Register new user
POST /api/auth/register
Body: {
  email: string;
  password: string;
  confirmPassword: string;
}
Response: {
  user: User;
  token: string;
}

// Login
POST /api/auth/login
Body: {
  email: string;
  password: string;
  totpCode?: string; // Required if 2FA enabled
}
Response: {
  user: User;
  token: string;
}

// Enable 2FA
POST /api/auth/2fa/enable
Headers: { Authorization: "Bearer {token}" }
Response: {
  secret: string;
  qrCode: string; // Base64 QR code image
}

// Confirm 2FA
POST /api/auth/2fa/confirm
Headers: { Authorization: "Bearer {token}" }
Body: {
  totpCode: string;
}
Response: {
  backupCodes: string[];
}
```

#### Bot Management Endpoints

```typescript
// List user's bots
GET /api/bots
Headers: { Authorization: "Bearer {token}" }
Response: {
  bots: Bot[];
  total: number;
}

// Create new bot
POST /api/bots
Headers: { Authorization: "Bearer {token}" }
Body: {
  name: string;
  description?: string;
  assetType: 'crypto' | 'stocks';
  exchange: string;
  tradingMode: 'paper' | 'live';
  positionSizing: PositionSizing;
  riskManagement?: RiskManagement;
}
Response: {
  bot: Bot;
  webhookUrl: string;
}

// Update bot
PUT /api/bots/{botId}
Headers: { Authorization: "Bearer {token}" }
Body: Partial<BotConfig>
Response: { bot: Bot }

// Start/Stop bot
POST /api/bots/{botId}/status
Headers: { Authorization: "Bearer {token}" }
Body: { status: 'active' | 'paused' | 'stopped' }
Response: { bot: Bot }

// Delete bot
DELETE /api/bots/{botId}
Headers: { Authorization: "Bearer {token}" }
Response: { success: boolean }
```

#### Webhook Endpoint

```typescript
// Receive webhook from TradingView
POST /webhook/{botId}/{secret}
Body: {
  action: 'buy' | 'sell' | 'close';
  symbol: string;
  quantity?: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  orderId?: string;
}
Response: { received: true } // Always 200 OK
```

#### Analytics Endpoints

```typescript
// Get bot performance
GET /api/bots/{botId}/performance
Headers: { Authorization: "Bearer {token}" }
Query: {
  period?: 'day' | 'week' | 'month' | 'all';
  startDate?: string;
  endDate?: string;
}
Response: {
  metrics: PerformanceMetrics;
  trades: Trade[];
  equityCurve: DataPoint[];
}

// Get trade history
GET /api/bots/{botId}/trades
Headers: { Authorization: "Bearer {token}" }
Query: {
  page?: number;
  limit?: number;
  status?: string;
}
Response: {
  trades: Trade[];
  total: number;
  page: number;
}

// Export trades
GET /api/bots/{botId}/trades/export
Headers: { Authorization: "Bearer {token}" }
Query: { format: 'csv' | 'json' }
Response: File download
```

### 4.4 Security Implementation

#### API Key Encryption Flow

```typescript
// Encryption service
class EncryptionService {
  private kmsClient: KMSClient;
  
  async encryptApiKey(apiKey: string, userId: string): Promise<string> {
    // 1. Generate unique data key for user
    const dataKey = await this.kmsClient.generateDataKey({
      KeyId: process.env.KMS_MASTER_KEY_ID,
      KeySpec: 'AES_256'
    });
    
    // 2. Encrypt API key with data key
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      dataKey.Plaintext,
      iv
    );
    
    const encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 3. Return encrypted key + encrypted data key
    return JSON.stringify({
      encryptedKey: encrypted,
      encryptedDataKey: dataKey.CiphertextBlob.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64')
    });
  }
  
  async decryptApiKey(encryptedData: string): Promise<string> {
    // Decrypt only in memory, clear after use
    const data = JSON.parse(encryptedData);
    
    // 1. Decrypt data key using KMS
    const dataKey = await this.kmsClient.decrypt({
      CiphertextBlob: Buffer.from(data.encryptedDataKey, 'base64')
    });
    
    // 2. Decrypt API key
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      dataKey.Plaintext,
      Buffer.from(data.iv, 'base64')
    );
    
    decipher.setAuthTag(Buffer.from(data.tag, 'base64'));
    
    let decrypted = decipher.update(data.encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // 3. Clear sensitive data from memory
    dataKey.Plaintext.fill(0);
    
    return decrypted;
  }
}
```

#### 2FA Implementation

```typescript
// 2FA service
class TwoFactorService {
  generateSecret(email: string): TwoFactorSecret {
    const secret = speakeasy.generateSecret({
      name: `RoR Trader (${email})`,
      issuer: 'RoR Trader',
      length: 32
    });
    
    return {
      secret: secret.base32,
      qrCode: qrcode.toDataURL(secret.otpauth_url)
    };
  }
  
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 1 step before/after
    });
  }
  
  generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  }
}
```

### 4.5 Infrastructure Configuration

#### Docker Compose Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - webhook-service
    restart: always

  api:
    image: ror-trader/api:${VERSION:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - KMS_KEY_ID=${KMS_KEY_ID}
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      replicas: 2
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  webhook-service:
    image: ror-trader/webhook:${VERSION:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 2
    restart: always

  webhook-worker:
    image: ror-trader/webhook-worker:${VERSION:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 3
    restart: always

  trading-worker:
    image: ror-trader/trading-worker:${VERSION:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - KMS_KEY_ID=${KMS_KEY_ID}
    deploy:
      replicas: 2
    restart: always

  analytics-worker:
    image: ror-trader/analytics-worker:${VERSION:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    ports:
      - "3001:3000"
    restart: always

volumes:
  prometheus_data:
  grafana_data:
```

#### Monitoring Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'ror-trader-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

  - job_name: 'ror-trader-webhooks'
    static_configs:
      - targets: ['webhook-service:3000']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/alerts/*.yml'
```

---

## 5. UI/UX Design

### 5.1 Design Principles

1. **Security-First**: Visual indicators for security status
2. **Data-Dense**: Show relevant info without clutter
3. **Real-Time**: Live updates for critical data
4. **Mobile-Responsive**: Full functionality on all devices
5. **Dark Mode Default**: Professional trading aesthetic

### 5.2 Key Screens

#### Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ RoR Trader                           🔔 👤 Jane Doe      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Portfolio Overview                    Today's P&L       │
│ ┌─────────────────┐                  ┌───────────────┐ │
│ │ $125,432.50     │                  │ +$1,234.56    │ │
│ │ Total Value     │                  │ +0.98%        │ │
│ └─────────────────┘                  └───────────────┘ │
│                                                         │
│ Active Bots (5/5)                    [+ Create Bot]    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ BTC Scalper        Coinbase Pro    ● Active         │ │
│ │ +$523.12 (2.1%)    15 trades       Paper Mode       │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ AAPL Swing         Alpaca          ● Active         │ │
│ │ +$234.56 (1.5%)    3 trades        Live Mode        │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ETH DCA Bot        Coinbase Pro    ⏸ Paused        │ │
│ │ +$1,234.00 (5.2%)  27 trades       Live Mode        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Recent Activity                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 10:32 AM  BTC Scalper   BUY 0.01 BTC @ $50,123     │ │
│ │ 10:15 AM  AAPL Swing    SELL 100 AAPL @ $151.23    │ │
│ │ 09:45 AM  ETH DCA Bot   BUY 0.5 ETH @ $3,234       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Bot Creation

```
┌─────────────────────────────────────────────────────────┐
│ Create New Bot                                      [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Bot Configuration                                       │
│                                                         │
│ Name *                                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ My Trading Bot                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Asset Type *                                            │
│ [●] Crypto    [ ] Stocks                               │
│                                                         │
│ Exchange *                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ▼ Coinbase Pro                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Trading Mode *                                          │
│ [●] Paper Trading (Recommended)                         │
│ [ ] Live Trading ⚠️                                     │
│                                                         │
│ Position Sizing                                         │
│ Type: [▼ Fixed Amount     ]                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ $1000                                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Risk Management (Optional)                              │
│ ☑ Stop Loss: [5]%   ☑ Take Profit: [10]%             │
│ ☑ Max Daily Loss: [$500]                              │
│                                                         │
│ Webhook URL (Generated)                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://api.ror-trader.com/webhook/abc123/secret   │ │
│ │                                          [📋 Copy]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│          [Cancel]                    [Create Bot]       │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Component Library

```typescript
// Core UI components needed for MVP

interface ComponentLibrary {
  // Layout
  Layout: FC<{ children: ReactNode }>;
  Sidebar: FC<{ items: MenuItem[] }>;
  Header: FC<{ user: User }>;
  
  // Data Display
  Card: FC<{ title?: string; children: ReactNode }>;
  Table: FC<{ columns: Column[]; data: any[] }>;
  Chart: FC<{ type: 'line' | 'bar'; data: ChartData }>;
  Stat: FC<{ label: string; value: string; change?: string }>;
  
  // Forms
  Input: FC<InputProps>;
  Select: FC<SelectProps>;
  Checkbox: FC<CheckboxProps>;
  Radio: FC<RadioProps>;
  
  // Feedback
  Button: FC<ButtonProps>;
  Alert: FC<{ type: 'info' | 'success' | 'warning' | 'error' }>;
  Modal: FC<{ isOpen: boolean; onClose: () => void }>;
  Toast: FC<{ message: string; type: string }>;
  
  // Trading Specific
  BotCard: FC<{ bot: Bot; onAction: (action: string) => void }>;
  TradeRow: FC<{ trade: Trade }>;
  PerformanceChart: FC<{ data: PerformanceData }>;
  WebhookStatus: FC<{ status: WebhookStatus }>;
}
```

### 5.4 UI-First Development Approach

#### Benefits for Kevin (Your Boss)

1. **Tangible Progress**: Visual demonstrations weekly
2. **Early Feedback**: UI can be validated before heavy backend work
3. **Investor Ready**: Always have something to show
4. **User Testing**: Can test UX assumptions early

#### Recommended Development Flow

```
Week 1-2: Foundation + Basic UI
- Setup project structure
- Create component library
- Build static dashboard
- Implement dark theme
- Create bot management screens
- Mock data for demonstrations

Week 3-4: Interactive UI + Core Backend
- Connect UI to backend APIs
- Real-time dashboard updates
- Webhook integration UI
- Performance charts
- Start backend implementation

Week 5-6: Full Integration
- Exchange connections
- Live trading features
- Analytics implementation
- Error handling & edge cases

Week 7-8: Polish & Production
- Performance optimization
- Mobile responsiveness
- User onboarding flow
- Production deployment
```

---

## 6. Go-to-Market Strategy

### 6.1 Launch Phases

#### Phase 1: Private Beta (Month 1)

- 50 hand-picked TradingView users
- Free access to all features
- Daily feedback sessions
- Rapid iteration on bugs/features

#### Phase 2: Public Beta (Month 2-3)

- 500 users limit
- Free tier + discounted paid tiers
- Community Discord server
- Weekly feature updates

#### Phase 3: Full Launch (Month 4)

- Remove user limits
- Full pricing in effect
- Marketing campaign launch
- Affiliate program

### 6.2 Marketing Channels

1. **TradingView Community**
    
    - Pine Script forums
    - Strategy sharing
    - Tutorial videos
2. **Content Marketing**
    
    - "How to automate TradingView" guides
    - YouTube tutorials
    - Trading strategy blog posts
3. **Partnerships**
    
    - TradingView indicator developers
    - Trading education platforms
    - Crypto/stock influencers
4. **Paid Acquisition**
    
    - Google Ads for "tradingview automation"
    - Facebook/Instagram trading communities
    - Reddit sponsorships

---

## 7. Success Metrics & KPIs

### 7.1 Product Metrics

|Metric|Target (Month 3)|Target (Month 6)|
|---|---|---|
|Total Users|500|2,000|
|Active Bots|100|500|
|Paid Subscribers|50|200|
|MRR|$2,500|$10,000|
|Webhooks/Day|5,000|50,000|
|Avg Trades/Bot/Day|10|20|

### 7.2 Technical Metrics

|Metric|Target|Alert Threshold|
|---|---|---|
|API Uptime|>99.5%|<99%|
|Webhook Latency|<500ms|>1s|
|Order Execution|<2s|>5s|
|Error Rate|<0.1%|>1%|
|Page Load Time|<3s|>5s|

### 7.3 Business Metrics

|Metric|Target|Measurement|
|---|---|---|
|CAC|<$50|Marketing spend / new customers|
|LTV|>$500|Average revenue per user|
|Churn Rate|<5%/month|Cancelled / total subscribers|
|NPS|>50|Survey responses|

---

## 8. Risk Analysis & Mitigation

### 8.1 Technical Risks

|Risk|Impact|Probability|Mitigation|
|---|---|---|---|
|Exchange API Changes|High|Medium|Adapter pattern, version monitoring|
|Security Breach|Critical|Low|2FA, encryption, audits|
|Webhook Overload|High|Medium|Rate limiting, queue system|
|Database Failure|High|Low|Automated backups, failover|

### 8.2 Business Risks

|Risk|Impact|Probability|Mitigation|
|---|---|---|---|
|Low Adoption|High|Medium|Free tier, marketing push|
|Competitor Entry|Medium|High|Fast iteration, moat building|
|Regulatory Changes|High|Low|Compliance monitoring|
|Exchange Shutdown|Medium|Low|Multi-exchange support|

### 8.3 Security Risks

|Risk|Impact|Probability|Mitigation|
|---|---|---|---|
|API Key Theft|Critical|Low|Encryption, KMS, audit logs|
|DDoS Attack|High|Medium|CloudFlare, rate limiting|
|Insider Threat|High|Low|Access controls, monitoring|
|Phishing|Medium|Medium|User education, 2FA|

---

## 9. Future Roadmap

### 9.1 Post-MVP Features (Months 3-6)

1. **Additional Exchanges**
    
    - Binance
    - Kraken
    - TD Ameritrade
    - Interactive Brokers
2. **Advanced Features**
    
    - Backtesting engine
    - Strategy optimizer
    - Copy trading
    - Mobile app
3. **Social Features**
    
    - Strategy marketplace
    - Performance leaderboards
    - Community forums
    - Social copy trading

### 9.2 Long-term Vision (Year 1-2)

1. **Platform Expansion**
    
    - Options trading
    - Futures support
    - Forex integration
    - International markets
2. **Enterprise Features**
    
    - White-label solution
    - API for developers
    - Custom integrations
    - Dedicated infrastructure
3. **AI/ML Integration**
    
    - Strategy recommendations
    - Anomaly detection
    - Performance prediction
    - Risk optimization

---

## 10. Appendices

### A. Glossary

- **Bot**: Automated trading strategy instance
- **Webhook**: HTTP callback for external signals
- **Paper Trading**: Simulated trading without real money
- **2FA/TOTP**: Two-factor authentication using time-based codes
- **KMS**: Key Management Service for encryption
- **DLQ**: Dead Letter Queue for failed messages

### B. Competitive Analysis

|Feature|RoR Trader|Competitor A|Competitor B|
|---|---|---|---|
|TradingView Integration|✅ Native|❌|⚠️ Limited|
|Multi-Asset|✅ Crypto + Stocks|❌ Crypto only|✅|
|Security|✅ 2FA + Encryption|⚠️ Basic|✅|
|Pricing|$0-499/mo|$99-999/mo|$49-299/mo|
|Paper Trading|✅|❌|✅|
|Analytics|✅ Advanced|⚠️ Basic|✅|

### C. Technical Dependencies

```json
{
  "backend": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "express": "^4.18.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "bull": "^4.0.0",
    "redis": "^4.0.0",
    "jsonwebtoken": "^9.0.0",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.0",
    "joi": "^17.0.0",
    "winston": "^3.0.0",
    "prom-client": "^14.0.0"
  },
  "frontend": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "recharts": "^2.0.0",
    "axios": "^1.0.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

---

_RoR Trader PRD Version: 2.0_  
_Last Updated: January 2025_  
_Project Location: /Users/brandonarmstrong/Documents/Github/RoRTrader_  
_Status: Ready for Development_

_Next Steps: Begin UI-first development following the Constitution guidelines_