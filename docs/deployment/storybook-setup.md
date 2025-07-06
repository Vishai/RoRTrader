# Installing Dependencies for RoR Trader

The Storybook command failed because the project dependencies haven't been installed yet. This is expected for a fresh setup. RoR Trader uses a monorepo structure with npm workspaces.

## Quick Fix (Recommended)

Run this command from the project root:

```bash
chmod +x scripts/install-web-deps.sh && ./scripts/install-web-deps.sh
```

## Alternative Manual Installation

If you prefer to install manually, from the project root:

```bash
cd /Users/brandonarmstrong/Documents/Github/RoRTrader
npm install
```

This will install dependencies for all workspaces (web app, API, packages).

## After Installation

Once dependencies are installed, you can:

1. **Run Storybook** (Component Showcase):
   ```bash
   cd apps/web
   npm run storybook
   ```
   Then visit http://localhost:6006

2. **Run the Web App**:
   ```bash
   cd apps/web
   npm run dev
   ```
   Then visit http://localhost:3000

## What's in Storybook

- **Welcome Page**: Overview of the component library
- **Component Showcase**: Interactive examples of all components
- **Button**: 6 variants (primary, secondary, outline, ghost, danger, glass)
- **Card**: Multiple layouts including bot cards
- **Input**: Form controls with error states
- **Badge**: Status indicators in 6 colors
- **Stat**: Performance metrics with trends

Each component has:
- Interactive controls to test props
- Multiple examples and use cases
- Auto-generated documentation
- Dark theme by default
