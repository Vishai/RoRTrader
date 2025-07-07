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
