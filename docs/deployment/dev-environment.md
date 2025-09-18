# Running the RoR Trader Development Environment

## Quick Start - Web Only

To run just the web application (for UI development):

```bash
# Make the script executable (first time only)
chmod +x scripts/dev-web.sh

# Run the web app
./scripts/dev-web.sh
```

Or directly:
```bash
cd apps/web
npm run dev
```

The web app will be available at http://localhost:3000

## Full Stack Development

To run both web and API:

```bash
# First, clear any stuck ports
chmod +x scripts/kill-ports.sh
./scripts/kill-ports.sh

# Then run the full stack
npm run dev
```

Services will be available at:
- Web App: http://localhost:3000
- API: http://localhost:3001
- API Health: http://localhost:3001/health

### Real Market Data (Alpaca)

The API will automatically fall back to synthetic demo data unless Alpaca credentials are present. To enable real candles/tickers/order books:

```bash
# apps/api/.env (or root .env)
ALPACA_API_KEY_ID=your_key
ALPACA_API_SECRET_KEY=your_secret
# Optional: use paper trading keys (recommended for dev)
# APCA_API_KEY_ID=your_paper_key
# APCA_API_SECRET_KEY=your_paper_secret
# Optional: override base data URL (defaults to https://data.alpaca.markets)
# ALPACA_DATA_URL=https://data.alpaca.markets
# apps/web/.env.local
# Uncomment to force mock market data on the frontend (useful with demo mode)
# NEXT_PUBLIC_USE_MARKET_MOCKS=true
```

Credentials can be generated from the Alpaca dashboard (paper or live trading). The free plan provides sufficient data for MVP charts.

> ⚠️ Without credentials the API still serves mock data, so the frontend remains functional.

## Troubleshooting

### Port Already in Use
If you get "address already in use" errors:
```bash
./scripts/kill-ports.sh
```

### API Not Starting
The API requires TypeScript compilation. If you see module not found errors:
```bash
cd apps/api
npm run build
```

### Current Development Status
- ✅ Web UI is fully functional with mock data
- ✅ Dashboard is demo-ready
- ⏳ API is minimal (health check only)
- ⏳ Database not yet configured

For UI-first development, use the web-only mode.
