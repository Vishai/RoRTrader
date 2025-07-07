# RoR Trader - Multi-Asset Trading Bot Platform

<div align="center">
  <h3>🚀 Automate Your Trading Strategies with Enterprise-Grade Security</h3>
  <p>Connect TradingView signals to real market execution across crypto and stocks</p>
</div>

## 🌟 Features

- **🤖 Bot Management**: Create and manage multiple trading bots with different strategies
- **🔗 Webhook Integration**: Connect any signal source via secure webhooks
- **💱 Multi-Asset Support**: Trade crypto (Coinbase Pro) and stocks (Alpaca) from one platform
- **🔒 Bank-Grade Security**: Encrypted API keys, mandatory 2FA, SOC2 compliance ready
- **📊 Advanced Analytics**: Professional metrics including Sharpe ratio, drawdown analysis
- **⚡ High Performance**: <500ms webhook processing, <2s order execution
- **📱 Responsive UI**: Beautiful dark-themed interface that works on all devices
- **🧪 Paper Trading**: Test strategies safely before going live

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TradingView    │────▶│  Load Balancer  │────▶│   API Gateway   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                              ┌───────────────────────────┴───────────────┐
                              │                                           │
                        ┌─────▼────────┐                          ┌──────▼──────┐
                        │  Webhook     │                          │   Main API  │
                        │  Service     │                          │   Service   │
                        └─────┬────────┘                          └──────┬──────┘
                              │                                           │
                        ┌─────▼────────┐     ┌──────────────┐    ┌──────▼──────┐
                        │    Redis     │◀────│  PostgreSQL  │───▶│     KMS     │
                        │    Queue     │     │              │    │             │
                        └─────┬────────┘     └──────────────┘    └─────────────┘
```

## 🚀 Quick Start

### UI Demo (Fastest Way to See RoR Trader)

Want to see the trading dashboard immediately? Run just the UI:

```bash
# Clone and enter the project
git clone https://github.com/yourusername/RoRTrader.git
cd RoRTrader

# Install dependencies
npm install

# Run the web UI only
cd apps/web
npm run dev
```

Visit http://localhost:3000 and click "View Demo Dashboard" to see the trading interface with mock data.

### Full Stack Development

#### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

#### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RoRTrader.git
   cd RoRTrader
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - Database Admin: http://localhost:8080
   - Redis Commander: http://localhost:8081
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090

## 📁 Project Structure

```
/RoRTrader
├── /apps
│   ├── /web                # Next.js frontend
│   ├── /api               # Express.js backend
│   └── /workers           # Background job processors
├── /packages
│   ├── /types            # Shared TypeScript types
│   ├── /config           # Shared configuration
│   └── /exchanges        # Exchange adapters
├── /infrastructure
│   ├── /docker           # Docker configurations
│   ├── /scripts          # Deployment scripts
│   └── /monitoring       # Prometheus/Grafana configs
├── /docs                 # Documentation
└── /tests               # E2E and integration tests
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Hook Form
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL, Redis
- **Queue**: Bull MQ
- **Security**: JWT, 2FA (TOTP), AES-256-GCM encryption
- **Monitoring**: Prometheus, Grafana
- **Infrastructure**: Docker, Docker Compose

## 🔒 Security

- All API keys are encrypted using AES-256-GCM
- Mandatory 2FA for all users
- Webhook signature verification
- Rate limiting on all endpoints
- Comprehensive audit logging
- SOC2 compliance foundation

## 📊 Performance Targets

- Webhook Processing: <500ms
- Order Execution: <2s
- API Response Time: <200ms
- Uptime: >99.5%

## 🧪 Testing

```bash
# Run all tests
npm test

# Run security tests
npm run test:security

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

See [deployment guide](./docs/deployment/README.md) for detailed instructions.

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- Documentation: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/RoRTrader/issues)
- Discord: [Join our community](https://discord.gg/rortrader)

---

<div align="center">
  <p>Built with ❤️ for traders by traders</p>
</div>
