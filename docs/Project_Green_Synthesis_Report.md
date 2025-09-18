# Project Green — Integrated Product Synthesis & Roadmap (v0.1)

**Purpose.** This document blends the two meeting recordings with the legacy Bubble app inventory (*Project_Green_Reference.md*) to define **what we’re building, why, and how**—so we can ship the strongest non‑Bubble MVP and grow it into a durable product.

**Primary sources**
- *Meeting Recording — Jul 30, 2025* (bots‑first MVP; TradingView → webhook ingestion; exchange constraints; DavidTech comparisons). fileciteturn0file0
- *Meeting Recording — Jun 25, 2025* (three product pillars; manual strategy journal; “follow traders”; verified data; pricing logic; Figma flows). fileciteturn0file1

**Companion spec**
- *Project_Green_Reference.md* — routes, data model, wallet & trials, affiliate, filters, acceptance criteria (used throughout this report).

---

## 1) Executive Summary

**Thesis.** Project Green is a **strategy & trader marketplace** that (a) ingests **verified** trading signals from creators’ bots, (b) supports a **manual strategy journal** with factor‑based guidance, and (c) lets users **follow traders**—all monetized via trials, unlocks, and affiliate revenue. fileciteturn0file1

**MVP recommendation.** Ship **Bots‑First (alerts‑only)**: creators connect TradingView strategies via **webhook**; we record **live** signals, compute performance, rank bots, and enable trials/unlocks. Auto‑execution to exchanges is a later phase. Rationale: fastest path to verified performance and marketplace liquidity, lowest data cost (TradingView does the heavy charting), and avoids exchange/legal edge cases at launch. fileciteturn0file0

**Differentiators.**
- Cross‑asset (stocks, crypto, FX) and **exchange‑aware** performance (normalize Bybit/Blofin variance). fileciteturn0file0
- **Verified** live results (webhook‑sourced) with explicit **backtest vs. live** separation. fileciteturn0file1
- **Pricing tied to data age/depth and performance** so early buyers pay less; value grows predictably. fileciteturn0file1

---

## 2) Problem & Opportunity

- Crypto‑only tools are narrow and suffer **exchange availability & behavior variance** (e.g., Bybit vs. Blofin; U.S. access pain). We broaden asset coverage and decouple exchange quirks. fileciteturn0file0  
- New users face **opaque claims** and **non‑standardized verification**; we establish a trusted, comparable marketplace with live, recorded signals and clear provenance. fileciteturn0file1  
- Even without selling, a **live leaderboard** is valuable internally and externally; monetization is upside once trust is established. fileciteturn0file0

---

## 3) Product Pillars (from meetings → mapped to Reference)

| Pillar | Meetings intent | What we build now | Where it maps in *Reference.md* |
|---|---|---|---|
| **P1 — Bots Marketplace** | TradingView strategies (Pine Script) send alerts to our webhook; start **alerts‑only**, add **auto‑execution** later. fileciteturn0file0 | Bot onboarding; verified signal ingestion; performance & leaderboard; trials/unlock; wallet & affiliate | §4.2 Marketplace, §8.1 Trials, §9 Billing, §6 Data model |
| **P2 — Manual Strategy Journal** | Factor‑based inputs (Entry/Exit/StopLoss), fast **button/toggle** UX; **Personal Exact / Ticker Match / Omit Backtests** guidance. fileciteturn0file1 | Strategy editor with factor groups; journal form; guidance panel; saved presets | §4.3 Edit Strategy, §7 Filters, §6 Data model |
| **P3 — Follow Traders** | Subscribe to verified traders’ signals/bots; public profiles; affiliate hooks. fileciteturn0file1 | Trader profiles; follow/subscribe actions; verified badge; affiliate links | §4.7 Traders, §6 Tables, §8.3 Affiliate |

---

## 4) MVP Scope & Phasing

**Phase 1 — Bots‑First (Alerts MVP)**  
- **Creator:** register bot → generate **TradingView Alert Template** → paste webhook into TradingView → send test → publish listing. fileciteturn0file0  
- **User:** browse leaderboard; **trial** a bot; receive alerts (email/Telegram); no auto‑execution. fileciteturn0file0  
- **Platform:** compute live metrics; trials flow (**pending → cleared**); wallet KPIs; affiliate tracking. (*Reference* tables cover this.)

**Phase 2 — Manual Journal**  
- Factor groups (Entry/Exit/StopLoss) with **toggle** inputs; compute **Personal Exact** & **Ticker Match** guidance; filters including **Omit Backtests**. fileciteturn0file1

**Phase 3 — Follow Traders**  
- Public trader pages; subscribe to their signals (or bots); shareable snapshots; affiliate hooks. fileciteturn0file1

**Phase 4 — Auto‑Execution (opt‑in)**  
- Add exchange connectors (API trader) for automated orders; keep alerts‑only path for compliance and simplicity. fileciteturn0file0

---

## 5) Functional Requirements (asserted from meetings)

### 5.1 Bots Onboarding & Ingestion
- Per‑bot **Alert Template** (with secret & nonce) provided by us; creator pastes into TradingView alert. Our `/signals/ingest` endpoint parses payload and records a **Verified Signal**. fileciteturn0file0  
- Provenance tag each record: `source=tradingview`, `mode=live|backtest`. UI surfaces **Live vs Backtest** distinctly in listings and filters. fileciteturn0file0turn0file1

### 5.2 Manual Journal (Factors)
- **Entry / Exit / StopLoss** groups; each factor has a short **code label** plus tooltip for fast capture; inputs stored as arrays. **Guidance** block shows ROI/Win/Trades for **Personal Exact** subset; optional **Ticker Match**; option to **Omit Backtests**. fileciteturn0file1

### 5.3 Marketplace & Ranking
- Cross‑asset (stocks, crypto, FX); sortable by **Most Profitable / Most Used / Most Recent**; filters for **Verification** and **Live only**. fileciteturn0file0turn0file1

### 5.4 Verification & Trust
- “Verified” = generated through our webhook (or later: exchange fills). Public pages show only platform‑recorded trades; manual entries flagged as **Unverified**. fileciteturn0file1

### 5.5 Trials & Wallet
- Trial purchases create **pending** transactions and `UserStrategyState='trial'`; on trial end success, mark **cleared** and credit **disbursement balance**; cancel → refund/void. (*Reference* §8.1/§9). fileciteturn0file1

### 5.6 Affiliate
- Unique `AffiliateLink.slug`; attribution on visit; commissions created as **pending** until trial clears; share cards/snapshots for social. fileciteturn0file1

---

## 6) Non‑Functional Requirements

- **Exchange independence** (abstract exchange behavior; normalize metrics). fileciteturn0file0  
- **Compliance‑sensitive launch** (alerts‑only path is U.S. friendly; auto‑execution gated). fileciteturn0file0  
- **Performance & UX speed** (toggle‑based inputs for traders in fast sessions). fileciteturn0file1

---

## 7) Data Model Cross‑Walk (meetings → Reference tables)

| Meetings concept | *Reference.md* table(s) |
|---|---|
| Bot definition & versioning | `Strategy`, `StrategyVersion` |
| Factors & inputs | `FactorGroup`, `Factor` |
| Live/backtest metrics; ROI/Win/Trades | `StrategyMetricDaily`, `StrategyRoiWinTrades` |
| Trial lifecycle | `UserStrategyState`, `WalletTransaction` |
| Leaderboard/listing metadata | `StrategyListing` |
| Payouts & affiliate | `WalletAccount`, `Disbursement`, `AffiliateLink`, `AffiliateCommission` |

---

## 8) Integration Plan — TradingView & Automation

### 8.1 Alerts‑Only (MVP)
1) Creator selects **“TradingView Strategy”** → we render an **Alert Template** (with bot id + HMAC signature instructions).  
2) They paste it into a TradingView alert and set our **webhook URL**; alerts POST to `/signals/ingest`. fileciteturn0file0  
3) We validate signature, store **Signal** and **Trade Intent**, and recompute bot KPIs (ROI, Win rate, Drawdown).  
4) UI shows **Live vs Backtest** bars (e.g., green vs purple concept from the call). fileciteturn0file0

**Draft: webhook payload (JSON)**
```json
{
  "bot_id": "uuid",
  "symbol": "BINANCE:BTCUSDT",
  "timeframe": "15m",
  "side": "long",
  "entry": 67890.12,
  "stop_loss": 67000.00,
  "take_profits": [{"price": 69000.0, "qty_pct": 50}, {"price": 70200.0, "qty_pct": 50}],
  "tv_ts": "2025-07-30T20:41:00Z",
  "mode": "live",
  "nonce": "random-uuid",
  "sig": "HMAC_SHA256(bot_secret, payload)"
}
```

**Verification.** Reject if signature invalid/expired; mark `verified=true` only for signed alerts.

### 8.2 Auto‑Execution (Phase 4)
- Pluggable **connectors** to exchanges/brokers; mirror DavidTech’s “TV → platform → exchange” pipeline but with our policy gates. fileciteturn0file0

---

## 9) UX Direction Unlocked by Meetings

- **Fast capture**: button/toggle factors with tooltips; keyboard shortcuts; desktop‑first. fileciteturn0file1  
- **Trust at a glance**: badges for **Verified**, **Live‑only** filter, clear separation from backtests. fileciteturn0file0turn0file1  
- **Shareable snapshots**: one‑click social image containing symbol, entry/SL/TP, ROI/Win/Trades snippet and a ref link. fileciteturn0file1

---

## 10) Monetization & Pricing (codified)

- **Access types**: per‑strategy **trial → unlock/own** and/or subscription plans.  
- **Dynamic price**: scales with **strategy age, data depth, and performance**, rewarding early adopters and standardizing value. fileciteturn0file1  
- **Affiliate**: revenue share on trials/purchases; pending until trial clears. (*Reference* wallet model).

---

## 11) Risks & Mitigations

- **Exchange/legal variance** → Launch alerts‑only; add connectors later; disclaimers & geo guidance. fileciteturn0file0  
- **Backtest overfitting / screenshot hype** → Elevate **Live‑only** leaderboards; verified webhook ingestion; expose backtest vs live side by side. fileciteturn0file0turn0file1  
- **UX overwhelm** → Phase delivery; bots marketplace first; manual journal once fast‑toggle inputs are ready. fileciteturn0file1

---

## 12) KPIs

- **Activation**: % creators connecting a bot within 24h.  
- **Liquidity**: # bots with ≥N live trades last 30d; % listings with active trials.  
- **Conversion**: trial → unlock rate; time to first trial.  
- **Trust**: % of **Verified** signals; % usage of **Live‑only** filter.  
- **Revenue**: GMV by type (strategy/data/affiliate); pending→cleared velocity.  
- **Creator earnings**: median monthly disbursement.

---

## 13) Roadmap (90–180 days)

**Milestone A (Weeks 0–4): Bots Alerts MVP** — Auth, bot onboarding, `/signals/ingest`, verified metrics, leaderboard, trial→pending, wallet KPIs. fileciteturn0file0  
**Milestone B (Weeks 5–8): Marketplace v1** — Sorting/filters incl. **Live‑only**, strategy pages, affiliate links & share images. fileciteturn0file1  
**Milestone C (Weeks 9–12): Wallet & Disbursements** — Pending→cleared jobs, Stripe Connect payouts, dashboards.  
**Milestone D (Weeks 13–16): Manual Journal v1** — Factors/toggles, guidance (Personal Exact, Ticker Match, Omit Backtests). fileciteturn0file1  
**Milestone E (Weeks 17–24): Follow Traders + Auto‑Execution Beta** — Trader profiles, subscriptions, first connector behind feature flag. fileciteturn0file0

---

## 14) Open Questions to Close

1) Confirm **Bots‑First** as day‑one scope; manual journal Phase 2? fileciteturn0file0turn0file1  
2) Target exchanges/brokers for **Phase 4** auto‑execution. fileciteturn0file0  
3) Finalize **Verified** policy (webhook signed vs. exchange fill confirmation in later phase). fileciteturn0file1  
4) Lock **pricing heuristic** (age/data/performance step‑ups). fileciteturn0file1  
5) Depth of **Education & Support** at launch (videos/docs/community).

---

## 15) How these meetings enrich the Reference spec

- **Scope validation** — Bots‑First alerts and later manual journal precisely align with the *Reference* data model and route map. fileciteturn0file0turn0file1  
- **UX direction** — Toggle‑first factor capture directly informs the Strategy Editor component. fileciteturn0file1  
- **Trust layer** — Emphasis on verified live trades hardens marketplace filters & labels. fileciteturn0file1  
- **Pricing** — Age/data‑based pricing clarifies wallet/trial logic and listing service. fileciteturn0file1  
- **Integration** — TradingView webhook becomes our primary ingestion path; Reference APIs map cleanly. fileciteturn0file0

---

## 16) Immediate Next Steps

1) Lock MVP scope and cut tickets from **Milestone A**. fileciteturn0file0  
2) Finalize the **Alert Template** and `/signals/ingest` **payload schema & HMAC**. fileciteturn0file0  
3) Implement **Trials & Wallet pending→cleared** pipeline and KPIs. fileciteturn0file1  
4) Deliver **Marketplace v1** with **Live‑only** filter, verified badges, and affiliate links. fileciteturn0file1  
5) Draft disclaimers (education, not advice) and Stripe Connect onboarding for creators.

---

*End of report.*
