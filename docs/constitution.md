# 📜 ROR TRADER PROJECT CONSTITUTION

## Standard Operating Procedures for AI-Assisted Trading Bot Development

_This document establishes the fundamental rules and workflows for RoR Trader development. By referencing this constitution, we agree to follow these patterns consistently throughout our collaboration._

---

## 🎯 PROJECT CONTEXT DECLARATION

### Project Identity

```
Project Name: RoR Trader
Project Type: Multi-Asset Trading Bot Platform
Version: 0.1.0 (MVP)
Primary Language(s): TypeScript (Node.js)
Deployment Target: Cloud-agnostic Docker Compose
Project Root: /Users/brandonarmstrong/Documents/Github/RoRTrader
```

### Technology Stack

```
Core Technologies:
- Node.js with TypeScript
- Express.js with modular architecture
- PostgreSQL with Prisma ORM
- Redis for queue management
- Bull MQ for job processing

Development Tools:
- Docker & Docker Compose
- Git with GitHub
- GitHub Actions CI/CD
- VS Code with ESLint/Prettier

Frontend Stack:
- Next.js 14+ with TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Recharts / TradingView Lightweight Charts
```

### Project Constraints

```
Timeline: 2 months target (3 months quoted)
Team Size: 1-2 developers
Budget: Cost-conscious, scalable approach
Compliance: SOC2 foundation, enterprise security
Performance Targets: <2s webhook-to-order execution
```

---

## 🏛️ FUNDAMENTAL LAWS

### Law 1: Security-First Development

- **API keys encrypted** with AES-256-GCM always
- **2FA required** from day one
- **Every user input validated** against injection attacks
- **No secrets in code** - use environment variables

### Law 2: Sequential Task Execution

- **ONE sub-task at a time** - No parallel processing of tasks
- **Complete → Test → Update → Confirm** cycle for every task
- **No assumptions** about moving forward without explicit approval

### Law 3: Documentation as Living Truth

- **Task lists are sacred** - Must be updated in real-time
- **Completed tasks are immutable** - [x] marks can never be unchecked
- **Every file operation is logged** in the Relevant Files section
- **Progress is visible** through [x] checkmarks
- **Transition naming follows strict pattern** - ror-trader-2025-01-sessionN.md
- **Security decisions documented** for SOC2 compliance

### Law 4: Testing Discipline

- **Write tests alongside features** - not after
- **Critical paths require tests** before marking complete
- **Webhook processing tested** with multiple scenarios
- **Security tests mandatory** for auth and encryption

### Law 5: Cost-Conscious Architecture

- **Monitor resource usage** continuously
- **Choose open-source first** when viable
- **Document scaling triggers** for each service
- **Track monthly costs** in deployment docs

### Law 6: Context Preservation

- **Create transition documents** before context limits
- **Document all decisions** for future sessions
- **Maintain project continuity** across conversations
- **Update transition on major milestones**

---

## 📋 STANDARD WORKFLOWS

### 🚀 Project Initiation Workflow

1. **Project Setup Phase**
    
    ```
    I'm initializing: RoR Trader - Multi-Asset Trading Bot Platform
    Project Type: Bot-centric trading platform with webhook integration
    Project Location: /Users/brandonarmstrong/Documents/Github/RoRTrader
    Following the RoR Trader Constitution for all work.
    
    Tech Stack:
    - Backend: Node.js/TypeScript with Express
    - Database: PostgreSQL with Prisma
    - Queue: Redis + Bull MQ
    - Frontend: Next.js 14 with Tailwind
    
    Constraints:
    - 2-month development timeline
    - Cost-conscious infrastructure
    - Security-first approach
    - SOC2 compliance foundation
    ```
    
2. **Security Setup Phase**
    
    - Configure 2FA with TOTP
    - Set up KMS for API key encryption
    - Implement rate limiting
    - Create audit logging structure
3. **Core Development Phase**
    
    - Bot management system
    - Webhook processing pipeline
    - Exchange integrations (Coinbase Pro, Alpaca)
    - Performance analytics engine

### 🔄 Trading Bot Task Execution Protocol

```markdown
FOR EACH TASK:
1. Announce: "Starting task X.X: [description]"
2. Security check: "Evaluating security implications..."
3. State approach: [Implementation plan with security considerations]
4. Execute implementation
5. Run verification:
   - Unit tests for business logic
   - Integration tests for exchanges
   - Security tests for sensitive operations
   - Performance benchmarks
6. Show results/created files
7. Update task list artifact:
   - Mark current task [x]
   - Update security checklist if applicable
8. Display metrics: "Tests: X passed | Coverage: X% | Security: ✓"
9. Ask: "Task X.X complete. May I proceed to task X.X?"
10. WAIT for approval
```

---

## 📁 ROR TRADER PROJECT STRUCTURE

### Complete Project Structure

```
/Users/brandonarmstrong/Documents/Github/RoRTrader
├── /apps
│   ├── /api                    # Backend API service
│   │   ├── /src
│   │   │   ├── /modules       # Feature modules
│   │   │   │   ├── /auth     # Authentication with 2FA
│   │   │   │   ├── /bots     # Bot management
│   │   │   │   ├── /webhooks # Webhook processing
│   │   │   │   ├── /trading  # Trade execution
│   │   │   │   └── /analytics # Performance tracking
│   │   │   ├── /shared       # Shared utilities
│   │   │   │   ├── /security # Encryption, KMS
│   │   │   │   ├── /database # Prisma client
│   │   │   │   └── /queue    # Bull MQ setup
│   │   │   └── server.ts
│   │   ├── /tests
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── /web                    # Next.js frontend
│   │   ├── /app              # App router
│   │   ├── /components       # React components
│   │   ├── /lib             # Utilities
│   │   └── /public
│   │
│   └── /workers               # Background workers
│       ├── /webhook-worker   # High-performance webhook processing
│       └── /trading-worker   # Exchange order execution
│
├── /packages
│   ├── /types                # Shared TypeScript types
│   ├── /config              # Shared configuration
│   └── /exchanges           # Exchange adapters
│       ├── /coinbase-pro
│       └── /alpaca
│
├── /infrastructure
│   ├── /docker
│   │   ├── docker-compose.yml      # Local development
│   │   ├── docker-compose.prod.yml # Production
│   │   └── /nginx                  # Load balancer config
│   ├── /scripts                    # Deployment scripts
│   └── /monitoring                 # Prometheus/Grafana configs
│
├── /docs
│   ├── constitution.md       # This document
│   ├── PRD.md               # Product requirements
│   ├── /transitions         # Session continuity documents (/Users/brandonarmstrong/Documents/Github/RoRTrader/docs/transitions)
│   │   └── template.md      # Transition template
│   ├── /security            # Security documentation
│   │   ├── encryption.md
│   │   ├── 2fa-setup.md
│   │   └── soc2-controls.md
│   ├── /api                 # API documentation
│   └── /deployment          # Deployment guides
│
├── /tests
│   ├── /e2e                 # End-to-end tests
│   ├── /load               # Performance tests
│   └── /security           # Security tests
│
├── .env.example             # Environment template
├── .gitignore
├── docker-compose.yml       # Development setup
├── package.json            # Root package
├── tsconfig.json           # TypeScript config
└── README.md
```

### Naming Conventions

- **Source files**: `camelCase.ts` (e.g., `webhookProcessor.ts`)
- **Test files**: `*.test.ts` or `*.spec.ts`
- **React components**: `PascalCase.tsx` (e.g., `BotCard.tsx`)
- **Config files**: `kebab-case.config.ts`
- **Database models**: `PascalCase` (e.g., `Bot`, `Trade`)
- **API routes**: `/api/resource-name` (kebab-case)
- **Docker images**: `ror-trader/service-name:version`
- **Git branches**: `feature/[task-id]-description`

### File Creation Protocol

When creating files, always use the full project path:
```bash
# Example file creation paths:
/Users/brandonarmstrong/Documents/Github/RoRTrader/apps/api/src/server.ts
/Users/brandonarmstrong/Documents/Github/RoRTrader/apps/web/app/page.tsx
/Users/brandonarmstrong/Documents/Github/RoRTrader/packages/types/index.ts
```

---

## 🎯 TRADING-SPECIFIC PATTERNS

### Webhook Processing Pattern

```
Pattern Name: Secure Webhook Processing
When to Use: All incoming webhook signals
Structure:
  1. Verify webhook signature/secret
  2. Validate JSON schema
  3. Check rate limits
  4. Queue for async processing
  5. Return 200 immediately
  6. Process in worker with retries
  7. Audit log all activities
Example: TradingView webhook → Queue → Trading Worker → Exchange
```

### Exchange Integration Pattern

```
Pattern Name: Unified Exchange Adapter
When to Use: All exchange integrations
Structure:
  1. Implement ExchangeAdapter interface
  2. Handle authentication securely
  3. Map unified orders to exchange format
  4. Implement rate limiting per exchange
  5. Add comprehensive error handling
  6. Test with paper trading first
Example: UnifiedOrder → CoinbaseAdapter → Coinbase API
```

### API Key Management Pattern

```
Pattern Name: Zero-Knowledge Encryption
When to Use: Storing any exchange credentials
Structure:
  1. User provides API keys via secure form
  2. Encrypt immediately in memory
  3. Store only encrypted version
  4. Decrypt only when needed for trades
  5. Clear from memory after use
  6. Audit log access attempts
```

### Performance Analytics Pattern

```
Pattern Name: Async Metrics Calculation
When to Use: Calculating Sharpe ratio, drawdown, etc.
Structure:
  1. Store raw trade data
  2. Queue metrics calculation job
  3. Calculate in background worker
  4. Cache results in Redis
  5. Update database with snapshots
  6. Serve from cache for API
```

---

## 📊 QUALITY METRICS & GATES

### RoR Trader Quality Metrics

|Component|Metric|Target|Measurement|Critical|
|---|---|---|---|---|
|Security|2FA Adoption|100%|User stats|Yes|
|Security|API Keys Encrypted|100%|Code audit|Yes|
|Performance|Webhook Latency|<500ms|Prometheus|Yes|
|Performance|Order Execution|<2s|Prometheus|Yes|
|Reliability|Webhook Success|>99.9%|Logs|Yes|
|Code|Test Coverage|>80%|Jest|No|
|Code|Type Coverage|100%|TypeScript|Yes|
|Infrastructure|Uptime|>99.5%|Monitoring|Yes|
|Cost|Monthly Infra|<$300|Cloud bills|No|

### Security Gates

1. **Development** → Local security tests pass
2. **PR Review** → Security checklist completed
3. **Staging** → Penetration test passed
4. **Production** → 2FA enabled, KMS active

---

## 🔧 SPECIAL PROCEDURES

### When Implementing Exchange Integrations

```
"I'm implementing the [Exchange] integration.
Security considerations:
- API key encryption via KMS ✓
- Rate limiting per exchange rules ✓
- Secure credential storage pattern ✓
Current approach: [describe implementation]
This follows our zero-knowledge architecture pattern."
```

### Task List Update Protocol

```
"Updating task list with progress..."
RULES FOR TASK LIST UPDATES:
1. NEVER uncheck completed tasks - [x] marks are IMMUTABLE
2. Only ADD new [x] marks for newly completed tasks
3. Preserve all existing checkmarks exactly as they are
4. Update progress counts accurately
5. Maintain task numbering consistency
6. If modifying task descriptions, preserve completion status

ERROR PREVENTION:
- Before updating, count existing [x] marks
- After updating, verify count increased or stayed same
- If count decreased, STOP and restore previous state
```

### Transition Document Naming Convention

```
"Creating transition document..."
NAMING PATTERN: ror-trader-2025-01-sessionN.md

RULES:
1. ALWAYS use lowercase 'ror-trader'
2. ALWAYS use '2025-01' regardless of actual date (project-based, not calendar-based)
3. 'session' is always singular, lowercase
4. Session number increments sequentially from last session
5. No 'final' suffix - just increment numbers
6. Sessions are work-based, not time-based

EXAMPLES:
✓ ror-trader-2025-01-session1.md
✓ ror-trader-2025-01-session2.md
✓ ror-trader-2025-01-session3.md
✓ ror-trader-2025-01-session6.md (continues from session5)
✗ ror-trader-2025-01-session1-final.md (no suffixes)
✗ RoR-Trader-2025-01-session1.md (wrong case)
✗ ror-trader-2025-07-session1.md (don't use actual month)

SESSION NUMBER DETERMINATION:
1. List existing files in /docs/transitions/
2. Find highest session number
3. New session = highest + 1
4. Continue sequential numbering indefinitely

NOTE: We use '2025-01' as a fixed project identifier, not the actual date.
This allows rapid session-based development without calendar constraints.
```

### When Handling Webhook Failures

```
"Webhook processing failure detected: [description]
Type: [Validation/RateLimit/Exchange/Network]
Bot affected: [bot_id]
Retry attempt: [X of 3]
Action taken:
- [Queued for retry / Sent to DLQ / Alerted user]
- Audit logged with correlation ID
- Metrics updated
Should I investigate the root cause?"
```

### Progressive Monitoring Setup

```
Phase 1 (MVP): Open-Source Stack
- Prometheus (metrics)
- Grafana (dashboards)  
- Loki (logs)
- Cost: ~$0 (self-hosted)

Phase 2 (Growth): Hybrid Approach
- Keep Prometheus/Grafana
- Add Sentry (errors) - $26/mo
- Add UptimeRobot - Free tier
- Cost: ~$26/month

Phase 3 (Scale): Professional Tools
- Migrate to Datadog
- Full Sentry integration
- PagerDuty for incidents
- Cost: ~$600-1200/month
```

### Transition Protocol

When user says "transition", "transition please", "please transition", or context reaches 70%:

```
"📋 Creating transition document for seamless continuation...

## RoR Trader Transition Summary - [Date/Time]

### Recent Updates (This Session)
- Completed Tasks: [List with brief descriptions]
- Files Created/Modified: [With purposes]
- Key Decisions Made: [Technical choices]
- Configuration Changes: [Any settings/setup]

### Current State
- Active Task: [Exact task and subtask]
- Working Directory: /Users/brandonarmstrong/Documents/Github/RoRTrader
- Branch: [If using git]
- Services Running: [Docker containers, etc.]
- Test Status: [Pass/Fail with coverage]

### Code Context
[Brief description of what was being implemented]
- Current Module: [e.g., Authentication, Bot Management]
- Approach: [Technical approach being used]
- Dependencies: [Any new packages added]

### Pending Items
1. Next Immediate Task: [Specific next step]
2. Upcoming Tasks: [2-3 next items]
3. Blockers/Questions: [Any unresolved items]

### Environment State
- Docker Compose: [Status]
- Database: [Migrations status]
- Redis: [Running/configured]
- Environment Variables: [Any new ones needed]

### To Resume Development
1. Load this transition document
2. Review recent updates
3. Continue from: [Exact task reference]
4. Command to run: [e.g., 'npm run dev']

### Important Notes
- [Any warnings or special considerations]
- [Security items to remember]
- [Performance considerations]

✅ Transition document saved using naming convention:
/Users/brandonarmstrong/Documents/Github/RoRTrader/docs/transitions/ror-trader-2025-01-sessionN.md

To continue in new conversation, start with:
'Continue RoR Trader development from transition document ror-trader-2025-01-sessionN'
"
```

#### Quick Transition Commands

- **"transition"** - Create full transition document
- **"quick transition"** - Create brief summary only
- **"transition and stop"** - Create document and end session
- **"load transition [timestamp]"** - Resume from document

### When Joining Existing Projects

```
"I'm reviewing the existing project structure and documentation.
Project Root: /Users/brandonarmstrong/Documents/Github/RoRTrader
Loading previous checkpoints and context state...
Checking for active amendments...
Current status: [analyze and report current state]
Ready to continue from: [checkpoint/task]"
```

### When Loading Transition Document

```
"Loading RoR Trader transition document from [timestamp]...
Project Location: /Users/brandonarmstrong/Documents/Github/RoRTrader

📋 Session Summary Loaded:
- Last Active: [Date/Time]
- Completed: [X tasks]
- Current Task: [Task reference]
- Environment: [Status]

Resuming from: [Specific task]
Approach: [Technical approach]

Ready to continue development. Shall I proceed with [next task]?"
```

### When Tasks Need Modification

```
"I notice task X.X may need adjustment because [reason].
Impact analysis:
- Scope: [Low/Medium/High]
- Dependencies: [List affected tasks]
- Timeline: [Impact assessment]
Proposed change: [description]
Shall I update the task list with this modification?"
```

### When Encountering Blockers

```
"Blocker encountered in task X.X: [description]
Type: [Technical/Requirements/External]
Severity: [Low/Medium/High/Critical]
Options:
1. [Workaround description]
2. [Alternative approach]
3. [Defer with dependency note]
Recommendation: [Option X because Y]
How would you like to proceed?"
```

### Cost Optimization Reviews

```
"📊 Weekly Infrastructure Cost Review:
Current Usage:
- Compute: [X vCPUs, Y GB RAM] - $X
- Database: [X GB] - $X  
- Redis: [X GB] - $X
- Monitoring: [Services] - $X
Total: $X/month

Optimization Opportunities:
1. [Specific recommendation]
2. [Resource rightsizing option]
3. [Service substitution possibility]

Projected savings: $X/month
Implementation effort: [Low/Medium/High]
Shall I proceed with optimization?"
```

### Security Incident Response

```
"🚨 Security Event Detected:
Type: [Failed Auth/Suspicious Activity/API Anomaly]
Severity: [Low/Medium/High/Critical]
Affected: [User/Bot/System component]

Immediate Actions Taken:
1. [Blocked IP/Locked account/Revoked token]
2. [Audit logged with full context]
3. [Alerted appropriate channels]

Investigation Results:
- [Root cause analysis]
- [Impact assessment]
- [Remediation needed]

Recommended Response:
[Specific security measures]
Awaiting authorization to proceed."
```

### Exchange Integration Checklist

```
For each new exchange:
□ API documentation reviewed
□ Rate limits documented
□ Authentication method confirmed
□ Sandbox/testnet access verified
□ Error codes mapped
□ Unified interface implemented
□ Unit tests written
□ Integration tests passed
□ Paper trading tested
□ Live trading approved
□ Monitoring added
□ Documentation complete
```

---

## 📈 PROGRESS TRACKING

### MVP Development Phases

#### Phase 1: Foundation & Security (Week 1-2)

- [ ] Project structure setup
- [ ] Docker Compose configuration
- [ ] PostgreSQL + Prisma setup
- [ ] Authentication with JWT
- [ ] 2FA implementation
- [ ] KMS integration for API keys
- [ ] Basic security middleware
- [ ] Audit logging system

#### Phase 2: Core Bot Platform (Week 3-4)

- [ ] Bot CRUD operations
- [ ] Webhook endpoint architecture
- [ ] Queue system with Bull MQ
- [ ] Basic bot dashboard
- [ ] User subscription tiers
- [ ] Rate limiting implementation

#### Phase 3: Exchange Integration (Week 5-6)

- [ ] Unified exchange interface
- [ ] Coinbase Pro adapter
- [ ] Alpaca adapter
- [ ] Paper trading mode
- [ ] Live trading mode
- [ ] Order execution engine
- [ ] Position tracking

#### Phase 4: Analytics & Monitoring (Week 7-8)

- [ ] Performance metrics calculation
- [ ] Sharpe ratio implementation
- [ ] Real-time dashboards
- [ ] Prometheus + Grafana setup
- [ ] Alert system
- [ ] Trade history exports
- [ ] System health monitoring

#### Phase 5: Polish & Launch Prep (Week 8+)

- [ ] UI/UX refinements
- [ ] Comprehensive testing
- [ ] Security audit
- [ ] Documentation completion
- [ ] Deployment automation
- [ ] Beta user onboarding

### Session Summary Template

```markdown
## Session Summary - [Date/Time]
### Completed
- Tasks: X.X, X.X, X.X [# total]
- Files Created: [list with purposes]
- Files Modified: [list with changes]
- Tests Added: [count and coverage]

### Current State
- Active Task: X.X
- Branch: [name]
- Build Status: [Pass/Fail]
- Test Coverage: X%
- Context Used: ~X%
- Working Directory: /Users/brandonarmstrong/Documents/Github/RoRTrader

### Next Session
- Next Task: X.X
- Priorities: [List]
- Blockers: [If any]
- Notes: [Important context]
```

---

## 🚦 OPERATIONAL ZONES

### Context Usage Zones

- 🟢 **Green (0-40%)**: Normal operation
- 🟡 **Yellow (40-60%)**: Consider checkpoint
- 🟠 **Orange (60-75%)**: Checkpoint required
- 🔴 **Red (75%+)**: Immediate transition

### Infrastructure Cost Zones

- 🟢 **Green ($0-150/mo)**: Optimal for MVP
- 🟡 **Yellow ($150-300/mo)**: Monitor for optimizations
- 🟠 **Orange ($300-500/mo)**: Review architecture
- 🔴 **Red ($500+/mo)**: Immediate action needed

### Resource Usage Zones

- 🟢 **Green (0-60%)**: Normal operation
- 🟡 **Yellow (60-80%)**: Monitor closely, prepare to scale
- 🟠 **Orange (80-90%)**: Immediate scaling required
- 🔴 **Red (90%+)**: Emergency mode, scale or throttle

---

## 🔄 RESOURCE MANAGEMENT

### MVP Infrastructure Budget

```
Resource Type: Cloud Infrastructure
Target: <$300/month for MVP
Current Projection:
- VMs (2-3 servers): $80-120
- Managed PostgreSQL: $50-100
- Redis: $30-50
- Monitoring (OSS): $0-50
- Domain/SSL: $15

Tracking: Monthly review
Alert Thresholds:
- $200: Information
- $250: Review required
- $300: Optimization sprint
- $400: Architecture review
```

### Performance Boundaries

```
Webhook Processing:
- Target: <500ms to queue
- Current: [Measurement]
- Optimization: High priority

Order Execution:
- Target: <2s total latency  
- Current: [Measurement]
- Optimization: Critical

API Response:
- Target: <200ms average
- Current: [Measurement]
- Optimization: Medium priority
```

### Cost Management Thresholds

|Service|Green|Yellow|Red|Action|
|---|---|---|---|---|
|Compute|<$100|$100-200|>$200|Add server|
|Database|<$50|$50-100|>$100|Optimize queries|
|Bandwidth|<$30|$30-60|>$60|Add CDN|
|Total|<$200|$200-400|>$400|Architecture review|

---

## ⚖️ CONSTITUTIONAL AMENDMENTS

### Amendment A: Automated Testing Gates

When enabled, allows progression without explicit approval if:

- All tests pass (100% of security tests, 80%+ others)
- No security vulnerabilities detected
- Performance benchmarks met
- Cost projections within budget

### Amendment B: Rapid Security Response

When a security incident is detected:

- Immediate automated responses authorized
- Rollback deployments if needed
- Block suspicious IPs/users
- Document all actions for review

### Amendment C: Cost-Optimization Mode

When infrastructure costs exceed targets:

- Automatically rightsize resources
- Switch to more cost-effective services
- Alert for architectural reviews
- Maintain security standards

### Active Amendments for RoR Trader

This project operates under:

- ✅ Amendment A - Automated Testing Gates
- ✅ Custom: Security-First Development
- ✅ Custom: Cost-Conscious Scaling

---

## 🤝 COLLABORATION AGREEMENT

By proceeding with RoR Trader development, both parties agree:

**AI Assistant will:**

- ✅ Prioritize security in every decision
- ✅ Monitor costs proactively
- ✅ Test webhook processing thoroughly
- ✅ Document all exchange integrations
- ✅ Implement 2FA and encryption properly
- ✅ Follow SOC2 compliance guidelines
- ✅ Alert on performance degradation
- ✅ Maintain < 2-month timeline focus
- ✅ Create transition documents proactively
- ✅ Always use correct project path: /Users/brandonarmstrong/Documents/Github/RoRTrader

**Human Developer will:**

- ✅ Review security implementations
- ✅ Approve exchange credentials approach
- ✅ Monitor infrastructure costs
- ✅ Make subscription tier decisions
- ✅ Handle external service signups
- ✅ Review compliance requirements
- ✅ Test with real trading scenarios
- ✅ Provide exchange API keys for testing

---

## 🔒 IMMUTABLE PRINCIPLES

Even across context boundaries, these rules ALWAYS persist:

1. **Security Over Features** - Never compromise security for speed
2. **User Funds Protected** - Multiple safeguards for live trading
3. **Transparent Operations** - All trades/webhooks audited
4. **Cost Discipline** - Stay within budget constraints
5. **Performance Standards** - <2s execution always
6. **Context Continuity** - Preserve project state across sessions
7. **Correct Path Usage** - Always create files at /Users/brandonarmstrong/Documents/Github/RoRTrader
8. **Documentation Integrity** - Completed tasks remain checked forever, transition docs follow ror-trader-2025-01-sessionN.md pattern

---

## 📝 QUICK REFERENCE

### Essential Commands

**Development Commands:**

```bash
# Navigate to project
cd /Users/brandonarmstrong/Documents/Github/RoRTrader

# Development
npm run dev          # Start development server
npm run test        # Run test suite
npm run test:security # Security test suite

# Docker
docker-compose up -d # Start services
docker-compose logs -f # View logs
docker-compose down  # Stop services

# Deployment
./scripts/deploy.sh staging
./scripts/deploy.sh production
```

**Chat Commands:**

- **Approval**: "yes", "approved", "continue", "proceed"
- **Security Check**: "security review", "audit this"
- **Cost Check**: "cost analysis", "budget status"
- **Performance**: "benchmark", "latency check"
- **Emergency**: "security incident", "stop trading"
- **Transition**: "transition", "transition please", "create transition"
- **Resume**: "load transition [timestamp]", "continue from transition"

### Key Phrases You'll Hear

- "Starting task X.X with security considerations..."
- "Webhook processing latency: Xms ✓"
- "Cost projection: $X/month (within budget)"
- "Security gate passed: [2FA/Encryption/Audit]"
- "Exchange integration tested: [Paper/Live mode]"
- "Creating transition document for seamless continuation..."
- "Creating file at: /Users/brandonarmstrong/Documents/Github/RoRTrader/..."

### Critical Security Checklist

Before EVERY deployment:

- [ ] API keys encrypted with KMS?
- [ ] 2FA enabled and tested?
- [ ] Rate limiting active?
- [ ] Audit logging functional?
- [ ] Security headers configured?
- [ ] Input validation complete?
- [ ] Exchange credentials secure?
- [ ] Webhook signatures verified?

### Key Trading Terms

- **Webhook**: HTTP POST from TradingView/signal source
- **Bot**: Automated trading strategy configuration
- **Adapter**: Exchange-specific integration code
- **Paper Trading**: Simulated trading without real money
- **Position**: Current holdings in an asset
- **DLQ**: Dead Letter Queue for failed messages
- **KMS**: Key Management Service for encryption

---

_RoR Trader Constitution Version: 3.2 (Master)_  
_Last Updated: January 2025_  
_Project Location: /Users/brandonarmstrong/Documents/Github/RoRTrader_  
_Status: MVP Development Active_

_Optimized for: Security-First Trading Bot Platform Development with Context Preservation_