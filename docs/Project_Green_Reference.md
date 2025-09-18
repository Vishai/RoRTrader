# Project Green → New App Reference (v0.1)

> **Purpose:** This file documents what exists in the legacy Bubble app (“Project Green”) and shapes it into a clean, framework‑agnostic spec so we can merge only the parts we want into the new, non‑Bubble app. Use it as a checklist during implementation and QA.

---

## 0) How to use this file
- Treat each section’s **✅ Keep / ✏️ Modify / 🗑️ Drop** checkboxes as decisions you can mark in Git.
- The **Data Model** and **Flows** are implementation‑ready; rename fields if needed to match your stack.
- The **Old → New Route Map** helps preserve sharable deep links while we re‑platform.

---

## 1) What the product is (observed & intended)
A **strategy & trader marketplace** where creators publish trading strategies, users trial/unlock/own them, and revenue flows to creators via **strategy sales**, **data sales**, and **affiliate commissions**. No live brokerage execution is required for v1; this is about publishing, evaluation, trials, and payouts.

**Primary objects**
- **Strategy** with **versions**, descriptive copy, factors, and performance snapshots.
- **Trader profile** (Creator) with wallet/payouts and affiliate links.
- **User state** per strategy: trial → unlocked/owned.
- **Wallet** with pending sales (in trial), cleared balances (disbursement), transactions, and affiliate earnings.

**Top-level nav (legacy)**
`STRATEGIES | TRADERS | EDUCATION` + “My Profile & Strategies” + “Log In”.

---

## 2) Old → New route map

| Legacy (Bubble URL `?tab=`)               | New Route (suggested)                               | Notes |
|-------------------------------------------|-----------------------------------------------------|------|
| `sMarket` (Strategies Marketplace)        | `/strategies?view=available|unlocked|owned`        | Discovery & cards |
| `editStrategy`                            | `/me/strategies/[id]/edit`                          | Versioning + factors |
| `myStrategies`                            | `/me/strategies`                                    | Search/sort + ownership filter |
| `myWalletDashboard`                       | `/me/wallet?tab=dashboard`                          | KPIs & charts |
| `myWalletTransactions`                    | `/me/wallet?tab=transactions`                       | List & filters |
| `myWalletDisbursements` (implied)         | `/me/wallet?tab=disbursements`                      | Request payouts |
| `topTraders`                              | `/traders?tab=top`                                  | Trader discovery |
| `profileAndSettings`                      | `/me/profile`                                       | Profile + password/email |
| `affiliate` (menu item)                   | `/me/affiliate`                                     | Links & reporting |
| `education`                               | `/education`                                        | Videos, articles, forum |

> Keep query parameters for filters/sorts (see §7).

---

## 3) Shared UI components (reuse in new app)

- **Header/Nav:** `STRATEGIES | TRADERS | EDUCATION` + auth buttons.
- **Left Sidebar (inner pages):**
  - Video/thumbnail
  - **Unlock Strategy**, **Edit Strategy**
  - Global **Filter Panel** (see §7)
- **Strategy Card** (used across marketplace, wallet, traders pages):
  - **Title**: `[STRATEGY NAME]`
  - **KPI strip**: `Profit/Loss % | Trades #`
  - **Dates**: `Subscribed On | Last Used`
  - **Graph area** (performance placeholder)
  - **Balances**: `Starting Paper | Current Paper`
  - **Risk**: `Live Max Drawdown`
  - **Detail Action**: “INPUT ROI/WIN/TRADES TABLE”
  - **CTAs**: **Cancel Trial** | **Open**
  - **Meta**: `Created By [Author]`

> **Decision:**  
> - ✅ Keep: card layout & CTAs  
> - ✏️ Modify: copy and data bindings  
> - 🗑️ Drop: any Bubble‑specific interactions

---

## 4) Pages & features

### 4.1 Landing / Marketing
- Four tiles with benefits/how‑it‑works and CTAs: **Create/Refine**, **Profit from Community Data**, **Follow Greatness**, **Supplement Your Income**.
- Trials referenced (“14‑day trial for $1”).

**Decision:**  
- ✅ Keep tiles & CTA concept  
- ✏️ Modify pricing copy & links to new Stripe flows

---

### 4.2 Strategies → Marketplace
- Tabs: **Available | Unlocked | Owned**
- Repeated **Sort/Search** rails above each column.
- Cards as defined in §3.

**Decision:**  
- ✅ Keep three tabs, card grid, sort/search  
- ✏️ Modify: consolidate the three “sort rails” into one global rail

---

### 4.3 Strategies → Edit Strategy
- **Strategy Parameters**: name, author, intro/instructions videos, assets links, spoiler‑free blurb, marketplace listing (dropdown), **Update Current Version**.
- **Written Description** (markdown/long text).
- **Factor Tables**: three columns labeled “Stop Loss Factors” (likely intended as Entry / Exit / Stop Loss), each with rows: `Description` + `Inputs (comma‑separated)`.

**Decision:**  
- ✅ Keep versioning with **Update Current Version** and **Create New Version** behaviors  
- ✏️ Modify factor groups to **Entry / Exit / Stop Loss** and store inputs as arrays  
- 🗑️ Drop: repeated “Stop Loss” label bug

---

### 4.4 My Strategies
- Search by strategy name.
- Sort: **Most Recent Added | Most Recent Used | Most Profitable | Most Used**.
- Creator filter: **Me | Other | All**.

**Decision:**  
- ✅ Keep search/sort filters  
- ✏️ Modify: add pagination & favorites

---

### 4.5 Profile & Settings
- Tabs: **Profile | Payment Method | Change Email | Change Password**.
- Profile fields: name, username, location, description, website, email, picture, video, profile type (public/private), link visibility.
- “Profile Visibility Settings” block (requires password).

**Decision:**  
- ✅ Keep fields & visibility toggle  
- ✏️ Modify to our auth provider (Clerk/Auth.js) & Stripe customer portal

---

### 4.6 My Wallet
- Tabs: **Dashboard | Transactions | Disbursements**.
- **Dashboard**: Pending Sales (trial phase), Disbursement Balance, Strategy Sales, Data Sales, Affiliate Commission; Day/Week/Month charts.
- **Transactions**: filter/search rails + strategy cards; **Cancel Trial/Open**.
- **Disbursements**: (screen not shown) request payout.

**Decision:**  
- ✅ Keep three wallet tabs + KPIs  
- ✏️ Modify: implement trial clearing via webhook/job; real charts  
- ✏️ Modify: Disbursement flow = Stripe Connect Express/Custom

---

### 4.7 Traders
- Tabs shown in header area: **Your Link | Assets | Support**.
- Card grid similar to marketplace (discovery for top traders).

**Decision:**  
- ✅ Keep discovery + “Your Link” page for affiliates  
- ✏️ Modify/Clarify: “Assets” (media kit?) and “Support” (creator support center)

---

### 4.8 Education
- Not pictured; footer hints **Videos / Articles / Forum / Contact**.

**Decision:**  
- ✅ Keep videos/articles as CMS content  
- ✏️ Modify: forum can be deferred or link to external community

---

## 5) Roles & permissions (minimum)

- **Viewer**: browse, start trials.  
- **Creator/Trader**: create strategies, publish versions, view wallet, affiliate links.  
- **Affiliate**: (may overlap Creator) manage referral links and earnings.  
- **Admin**: approve listings, manage payouts, moderation.

---

## 6) Data model (implementation‑ready skeleton)

> Use Postgres + Prisma/Drizzle; types shown are indicative.

```sql
-- Users & Auth
User(id, email, username, name, location, bio, website,
     profile_picture_url, profile_video_url,
     profile_type ENUM('public','private'),
     email_verified_at TIMESTAMP, created_at, updated_at)

-- Strategies & Versions
Strategy(id, owner_user_id, slug, current_version_id, status ENUM('draft','listed','suspended'),
         created_at, updated_at)

StrategyVersion(id, strategy_id, version INT, title, author_name,
                video_intro_url, video_instructions_url,
                assets_links TEXT, spoiler_free_blurb TEXT,
                written_description TEXT,
                marketplace_listing ENUM('unlisted','available','requires_approval'),
                created_at, updated_at, published_at)

FactorGroup(id, strategy_version_id, name) -- 'Entry','Exit','StopLoss'
Factor(id, factor_group_id, description, inputs_json) -- e.g., ["RSI>70","EMA:200"]

-- Performance & ROI/WIN/TRADES
StrategyMetricDaily(id, strategy_version_id, date, trades INT,
                    pnl_abs NUMERIC, pnl_pct NUMERIC,
                    starting_paper_balance NUMERIC, current_paper_balance NUMERIC,
                    live_max_drawdown_pct NUMERIC)

StrategyRoiWinTrades(id, strategy_version_id, timeframe TEXT, roi_pct NUMERIC,
                     win_rate_pct NUMERIC, trades INT)

-- User state for trials/ownership
UserStrategyState(id, user_id, strategy_id,
                  status ENUM('trial','unlocked','owned','canceled'),
                  trial_started_at TIMESTAMP, trial_ends_at TIMESTAMP,
                  unlocked_at TIMESTAMP, last_used_at TIMESTAMP)

-- Marketplace metadata
StrategyListing(id, strategy_id, visibility ENUM('hidden','available','featured'),
                tags TEXT[], sort_boost INT, approved_at TIMESTAMP)

-- Wallet & payouts
WalletAccount(id, user_id, disbursement_balance_cents INT, pending_sales_cents INT, created_at)
WalletTransaction(id, user_id, type ENUM('strategy_sale','data_sale','affiliate'),
                  strategy_id UUID NULL, amount_cents INT, currency TEXT,
                  status ENUM('pending','cleared','refunded'),
                  trial_end_at TIMESTAMP NULL, created_at TIMESTAMP)

Disbursement(id, user_id, amount_cents INT,
             status ENUM('requested','processing','paid','failed'),
             requested_at TIMESTAMP, paid_at TIMESTAMP, destination_details_json JSONB)

-- Affiliate
AffiliateLink(id, owner_user_id, slug, target ENUM('strategy','trader','landing'),
              target_id UUID NULL, clicks INT, signups INT, conversions INT, created_at)

AffiliateCommission(id, owner_user_id, wallet_transaction_id, amount_cents INT, status TEXT)

-- Saved filter presets (left sidebar)
UserFilterPreset(id, user_id, name, date_start DATE, date_end DATE,
                 start_hour_est INT, end_hour_est INT,
                 top_performers_pct INT, tp_user_count INT, total_user_count INT, current_rank INT,
                 asset_match BOOL, ticker_match BOOL, position_type_match BOOL,
                 omit_live_test_orders BOOL, omit_back_test_orders BOOL,
                 omit_manual_closes BOOL, omit_unverified BOOL)
```

---

## 7) Filters, search & sorting (left sidebar)

**Inputs present in legacy UI:**
- Date range (Start/End), Start Hour (EST), End Hour (EST)
- Top Performers %
- TP User Count, Total User Count, Current Rank
- Toggles: **Asset Match, Ticker Match, Position Type Match, Omit Live Test Orders, Omit Back Test Orders, Omit Manual Closes, Omit Unverified**

**New behavior:**
- Persist current filter as query string: `?dateStart=…&dateEnd=…&topPct=25&omitBacktests=true…`
- Save as **UserFilterPreset** for quick recall.
- Server‑side search index for `strategy.title, author, tags` and metrics (ROI, drawdown, trades).

---

## 8) Core flows (non‑Bubble implementations)

### 8.1 Trial → Unlock → Own
1) **Start Trial**: create `WalletTransaction(status='pending', trial_end_at=…)` and `UserStrategyState(status='trial')`.
2) **Cancel Trial**: set state `'canceled'`, mark transaction `refunded/voided`.
3) **Trial Ends (job/webhook)**: mark transaction `'cleared'`; move amount to `WalletAccount.disbursement_balance_cents`; set `UserStrategyState` `'unlocked'` (or `'owned'` for one‑time).

**✅ Keep**: Pending Sales (trial phase), Disbursement Balance KPIs.

### 8.2 Strategy versioning
- **Update Current Version** edits metadata only.
- Changing factor descriptions/inputs ⇒ **Create New Version**; do not overwrite current version’s metrics.
- `Strategy.current_version_id` points to the published version shown on marketplace.

### 8.3 Affiliate attribution
- Use `AffiliateLink.slug`. On visit → set cookie/session `ref=...`.
- On trial start/purchase: create `WalletTransaction(type='affiliate')` with calculated commission; mark `'pending'` until trial clears.

### 8.4 Marketplace sorting
- By **Most Profitable, Most Used, Most Recent Used/Added** using `StrategyMetricDaily` aggregates and `UserStrategyState` counts.

---

## 9) Pricing & billing (reference)
- Trials (e.g., “14‑day trial for $1”) → Stripe Checkout Session with trial or intro price.
- On webhook `checkout.session.completed` create pending transaction; set `trial_end_at`.
- On `invoice.paid`/trial end → clear pending to disbursement.
- Payouts via Stripe Connect **Express**; Disbursement records mirror Connect transfers.

---

## 10) Decisions matrix (fill in during merge)

- Landing tiles: [ ] Keep  [ ] Modify  [ ] Drop  
- Marketplace tabs & cards: [ ] Keep  [ ] Modify  [ ] Drop  
- Strategy editor (videos, factors, versions): [ ] Keep  [ ] Modify  [ ] Drop  
- My Strategies filters: [ ] Keep  [ ] Modify  [ ] Drop  
- Profile & Settings: [ ] Keep  [ ] Modify  [ ] Drop  
- Wallet Dashboard/Transactions/Disbursements: [ ] Keep  [ ] Modify  [ ] Drop  
- Traders (Top, Your Link, Assets, Support): [ ] Keep  [ ] Modify  [ ] Drop  
- Education (Videos/Articles/Forum): [ ] Keep  [ ] Modify  [ ] Drop  
- Affiliate program: [ ] Keep  [ ] Modify  [ ] Drop  

---

## 11) API outline (thin REST; adjust to tRPC/GraphQL if preferred)

```
POST   /api/trials                 -- start trial
DELETE /api/trials/:id             -- cancel trial
GET    /api/strategies             -- list (filters/sort/search)
POST   /api/strategies             -- create (creator)
GET    /api/strategies/:id         -- detail (current version)
PATCH  /api/strategies/:id         -- update base fields
POST   /api/strategies/:id/versions -- create new version
PATCH  /api/strategy-versions/:id  -- update current version (safe fields)
GET    /api/wallet/transactions    -- list user txns
POST   /api/wallet/disbursements   -- request payout
GET    /api/affiliate/links        -- list/create
POST   /api/affiliate/links
```

---

## 12) Content, legal & trust
- Prominent **disclaimers** (education only, not financial advice; performance not indicative).
- **Verification** flags for strategies (“Verified/Unverified”) to map the checkbox seen in filters.
- **Audit trail** for version changes (who, when, what).

---

## 13) Open questions (to close before build)
1) Factor groups: confirm **Entry/Exit/StopLoss** and expected inputs format.  
2) Pricing model(s): one‑time unlock vs. recurring subscription? per strategy vs. plan tiers?  
3) “Data Sales” definition: what product exactly? read‑only analytics, export, API?  
4) “Assets” & “Support” tabs under Traders: define scope.  
5) Education: in‑house CMS or external links?  
6) KYC for payouts: Stripe Connect Express vs. manual?

---

## 14) Migration notes (from Bubble)
- Export Bubble data (CSV or Data API) for **Strategies, Versions, Users, any metrics**.
- Map to new IDs; keep **slug** and **author** readable for SEO.
- Preserve **URL semantics** using the **Old → New route map** (301s or param parsing).

---

## 15) Non‑goals for v1 (defer)
- Live brokerage execution, order routing.
- Complex backtesting engine (beyond uploading daily metrics).
- Real‑time market data streaming.
- Social inbox/DMs (“My Connections”) if it slows core delivery.

---

## 16) Acceptance criteria (smoke level)

- **Marketplace:** user can browse Available/Unlocked/Owned; sort & search; open a card; start/cancel trial.  
- **Strategy Editor:** creator can edit current version text/video; add factor groups & inputs; publish new version.  
- **Wallet:** pending increases on trial; clears to disbursement after trial end; transactions visible; payout request creates a record.  
- **Affiliate:** link creation; attribution on trial start; commission visible as pending → cleared.  
- **Profile:** user edits fields and visibility; auth flows for email/password updates.
