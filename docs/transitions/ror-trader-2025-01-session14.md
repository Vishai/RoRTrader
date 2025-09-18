# 📋 RoR Trader Transition Summary - Session 14

## Active Issues
- `/demo/strategy` is hitting `POST /api/analysis/batch` without candle data and the backend now fetches candles automatically, but the call returns 500. Investigate the server log (likely missing Alpaca creds or hitting narrowed schema). Use mock mode (`NEXT_PUBLIC_USE_MARKET_MOCKS=true`) as a quick workaround.
- Next.js warns about an outdated version (14.2.x). No action yet, but plan to upgrade soon.
- ESLint warnings remain (unused vars in auth/webhooks modules). Track and clean as you touch those files.

## Verified State
- TradingView chart component dynamically imports `lightweight-charts`. Frontend env uses `NEXT_PUBLIC_API_URL=http://localhost:4000`.
- Backend `/api/market` endpoints fall back to mock if Alpaca creds are missing. `/api/analysis` now accepts timeframe/exchange and auto-fetches candles when absent.
- Optional: `NEXT_PUBLIC_USE_MARKET_MOCKS=true` to force synthetic data for demos.

## How To Resume
1. Install dependencies: `npm install`
2. Start services:
   - `npm run dev -w @ror-trader/api` (listens on port 4000)
   - `npm run dev -w @ror-trader/web`
3. Visit `http://localhost:3000/demo/strategy`
4. If the analysis batch call returns 500, toggle mock mode in `apps/web/.env.local` or inspect the API logs for validation errors.

## Suggested Next Tasks
- Debug `/api/analysis/batch`: confirm server log output, ensure indicator names align, and add tests for the new validation path.
- Implement graceful fallback on frontend (show “Using mock data” message when API errors).
- Resume incremental type refactor in modules you touch (re-enable strict ESLint rules as they’re cleaned up).
