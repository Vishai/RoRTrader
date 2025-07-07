# RoR Trader API Backend

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Setup

1. **Start the database services:**
   ```bash
   cd apps/api
   ./scripts/setup-db.sh
   ```
   
   Or manually:
   ```bash
   # From project root
   docker-compose up -d postgres redis
   ```

2. **Install dependencies:**
   ```bash
   cd apps/api
   npm install
   ```

3. **Setup database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Available Services

- **API Server**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **PostgreSQL Admin (Adminer)**: http://localhost:8080
  - Server: `postgres`
  - Username: `rortrader`
  - Password: `password`
  - Database: `rortrader`
- **Redis Commander**: http://localhost:8081

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/2fa/setup` - Get 2FA setup info
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA
- `GET /api/auth/sessions` - Get user sessions
- `DELETE /api/auth/sessions/:id` - Revoke session
- `POST /api/auth/sessions/revoke-all` - Revoke all sessions

### Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ 2FA with TOTP
- ✅ Session management
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Audit logging

### Development

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

Check types:
```bash
npm run type-check
```

### Environment Variables

See `.env.example` for all available environment variables.
