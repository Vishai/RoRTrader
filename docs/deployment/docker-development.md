# Development Environment Quick Reference

## 🚀 Quick Start

### 1. First Time Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your values (important!)
# At minimum, change these from defaults:
# - JWT_SECRET
# - ENCRYPTION_KEY
# - SESSION_SECRET

# Make setup script executable
chmod +x scripts/docker-setup.sh

# Run the setup script
./scripts/docker-setup.sh
```

### 2. Regular Development
```bash
# Start all services
docker compose up -d

# Start only specific services
docker compose up -d postgres redis

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v
```

## 📌 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **PostgreSQL** | `localhost:5432` | `rortrader/password` |
| **Redis** | `localhost:6379` | No auth |
| **Adminer** (DB UI) | http://localhost:8080 | Use PostgreSQL creds |
| **Redis Commander** | http://localhost:8081 | No auth |
| **Grafana** | http://localhost:3001 | `admin/admin` |
| **Prometheus** | http://localhost:9090 | No auth |
| **Mailpit** (Email) | http://localhost:8026 | No auth |

## 🔧 Common Tasks

### View Database
1. Open http://localhost:8080 (Adminer)
2. System: `PostgreSQL`
3. Server: `postgres`
4. Username: `rortrader`
5. Password: `password`
6. Database: `rortrader`

### View Redis Data
1. Open http://localhost:8081 (Redis Commander)
2. No authentication needed

### Check Email (Development)
1. Open http://localhost:8026 (Mailpit)
2. All emails sent in dev appear here
3. SMTP server is on port 1026 (changed from 1025)

### Monitor Performance
1. Open http://localhost:3001 (Grafana)
2. Login: `admin/admin`
3. Prometheus is pre-configured as data source

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using a port (e.g., 5432)
lsof -i :5432

# Kill the process
kill -9 <PID>
```

### Docker Not Running
```bash
# Start Docker Desktop manually
open -a Docker
```

### Reset Everything
```bash
# Stop all containers and remove volumes
docker compose down -v

# Remove all Docker data (nuclear option)
docker system prune -a --volumes
```

### Service Won't Start
```bash
# Check service logs
docker compose logs postgres
docker compose logs redis

# Restart specific service
docker compose restart postgres
```

## 📊 Resource Usage

Our Docker setup uses approximately:
- **CPU**: ~10-20% idle, up to 50% under load
- **Memory**: ~1-2GB total
- **Disk**: ~500MB for images, ~100MB for data

## 🔒 Security Notes

⚠️ **Development Only Configuration**
- Default passwords are for development only
- Never use these credentials in production
- The `.env.example` passwords are public - always change them

## 🎯 Next Steps

After Docker is running:
1. Install Node dependencies: `npm install`
2. Set up the database: `npm run db:migrate`
3. Start development: `npm run dev`

---

_For production deployment, see `/docs/deployment/README.md`_
