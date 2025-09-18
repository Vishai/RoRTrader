# Trading Tool — Concept → MVP Plan

## 0) One‑paragraph summary
A desktop + cloud tool that tags trades in real time by watching your TradingView chart context (1/5/10‑min candles), applying your custom strategy rules, and lighting up traffic‑light checks (green/yellow/red). It captures timed snapshots or consumes TradingView alert webhooks, evaluates conditions (e.g., "9 EMA crossed 20 EMA within last 5 candles"), and acts like a coach—suggesting patience or action as conditions approach. It outputs anticipated R:R, expected win rate, and other metrics from your historical tag performance, cutting manual journaling to near‑zero.

---

## 1) Architecture (high level)
```
[Trader Browser/TV] ────────► [Capture Layer]
     │   └ TV Alerts(JSON)      ├─ A) Browser Extension (MV3) for snapshots + DOM signals
     │                           └ B) Desktop Capturer (Electron) for multi‑monitor capture
     │
     └───────────────► [Webhook Ingest]
                              └ TradingView Pine alerts → HTTPS webhook → Queue

[Ingest Queue] → [Evaluator Service]
    ├─ Rule Engine (tags DSL)  
    ├─ Indicators (talib/ta, numpy)  
    ├─ Vision/OCR (backup for chart snapshots: EMA labels, price, candle timing)
    └─ Coach Engine (state machine)

[Data Store]
    ├─ Sessions (per symbol/timeframe)
    ├─ Snapshots (image + features)
    ├─ TagDefinitions & Evaluations
    ├─ Trades (entries/exits/notes)
    └─ Metrics (Bayesian win‑rate per tag set)

[UI]
    ├─ Live Panel (traffic lights, next steps)
    ├─ Journal (auto‑filled fields)
    └─ Backtest/Insights (tag → outcome curves)
```

**Latency targets**: 1s–5s loop for capture → evaluate → coach. Alerts/webhooks can be sub‑second if Pine triggers.

---

## 2) Data model (core)
```yaml
Session:
  id, symbol, timeframe{1,5,10}, started_at, active_ruleset_id
Snapshot:
  id, session_id, ts, img_url, features{price, ema9, ema20, rsi, volume, ...}, source{extension|desktop|webhook}
StrategyDoc:
  id, title, version, uri, checksum # PDF/Markdown parsed → rules
TagDefinition:
  id, name, category, description, severity{info|setup|entry|exit},
  rule: DSL # see §3
Evaluation:
  id, tag_id, snapshot_id, status{green|yellow|red}, score[0..1], context
Trade:
  id, session_id, direction{long|short}, entry, stop, target, rr, r, size,
  tags_applied[id...], created_from{manual|auto}, notes
Metrics:
  id, tag_set_hash, n, wins, losses, ev, wr_post, rr_mean
```

---

## 3) Rules DSL (human‑readable, JSON‑serializable)
**Intent**: Be expressive but simple, composable with AND/OR, and timeframe‑aware.

### Examples
**A. EMA cross within last N candles**
```yaml
name: ema9_cross_ema20_last5
when:
  any_of:
    - cross:
        a: EMA(9)
        b: EMA(20)
        direction: any     # up|down|any
        lookback_candles: 5
score:
  base: 1.0
  decay_per_candle_since_cross: 0.15  # for yellow thresholding
outcome:
  tag: ema_cross_recent
```

**B. Price pullback to 9 EMA with RSI>50**
```yaml
name: pullback_to_ema9
when:
  all_of:
    - touch:
        series: PRICE
        band: EMA(9)
        tolerance_pct: 0.15
    - compare:
        left: RSI(14)
        op: ">"
        right: 50
outcome:
  tag: pullback_ema9_good_momentum
```

**C. Timewindow guard (news/open) & multi‑TF confirm**
```yaml
name: session_guard
when:
  all_of:
    - market_open_within_min: 45
    - higher_tf_confirms:
        timeframe: 10
        condition:
          slope: EMA(20) > 0
outcome:
  tag: session_ok
```

**Traffic‑light thresholds**
```yaml
yellow_if_score_between: [0.6, 0.85]
green_if_score_gte: 0.85
red_else: true
```

---

## 4) Indicator computation sources
1) **Preferred**: Use market data feed (broker API like Alpaca/Polygon/IBKR) to compute EMAs/RSI/Volume precisely per timeframe.
2) **Also**: Use TradingView Pine alerts embedding computed values → webhook to avoid vision.
3) **Fallback**: Vision/OCR to parse overlay text (EMA values, RSI pane labels) from snapshots. CV used only when (1) or (2) unavailable.

---

## 5) Real‑time loop (1s/5s cadence)
```python
while session.active:
    snap = capture_or_wait_alert()
    features = ensure_features(snap)  # prefer data feed; else derived from Pine; else CV
    evals = rule_engine.evaluate(features, window=last_k_candles)
    lights = traffic_lightify(evals)  # green/yellow/red per tag
    advice = coach.next(evals, session_state)
    persist(snap, features, evals, advice)
    ui.push(lights, advice)
```

**Near‑miss logic (for yellow)**
- Distance to condition (e.g., EMA9−EMA20 normalized by ATR).
- Time‑since‑event (decay curve).
- RSI proximity to threshold, volume percent‑of‑avg.

---

## 6) Coach Engine (state machine)
States: `SCANNING → SETUP_FORMING → READY → TRIGGERED → IN_TRADE → MANAGE → EXITED`.

Examples:
- **SETUP_FORMING (yellow)**: "9>20 slope improving, volume 0.9× avg—consider waiting 1–2 candles for confirmation."
- **READY (green)**: "Cross occurred 3 candles ago; pullback to EMA9 within 0.1%—plan entry on break with stop under last swing (ATR 1.2)."
- **MANAGE**: "Price +0.8R; consider scale 25% at 1R; trail stop to EMA20." (configurable playbook)

---

## 7) Outputs & metrics
**Per‑setup projections**
- **Anticipated R:R**: `(target - entry) / (entry - stop)` (or short variant)
- **Expected Value (EV)**: `EV = p(win) * R - (1 - p(win)) * 1`
- **p(win)** estimation: Bayesian update with Beta prior per tag set.

**Bayesian model**
```yaml
prior: Beta(α=8, β=12)  # prior win rate ~40% (editable)
update: α' = α + wins; β' = β + losses
wr_post = α' / (α' + β')
```

**Tag set bucketing**
- Hash deterministic set of active tags (e.g., `{ema_cross_recent, rsi>50, pullback_ema9}`) → accumulate outcomes → learn per‑context win rate & R distribution.

---

## 8) UI / UX
- **Live Ribbon** at top of chart (overlay from extension): colored pills per tag with tooltips.
- **Coach Panel**: plain‑English guidance, next step checklist.
- **Record Button**: 1s or 5s cadence; toggles per‑session. Shows buffer size, dropped frames.
- **Journal View**: Auto‑filled entry/exit, tags, screenshots; manual notes append.
- **Strategy Loader**: Drop a PDF/MD; extracts rules via LLM; shows mapped rules before enabling.

---

## 9) Integration options
- **Browser Extension (Chrome MV3)**: hotkey snapshot, DOM scrape (symbol/timeframe), lightweight overlay.
- **Desktop App (Electron)**: multi‑monitor capture, global hotkeys, lower latency.
- **TradingView Pine**: strategies/indicators emit `{{json}}` in alert messages to webhook (symbol, tf, computed EMAs, RSI, etc.).
- **Data Feeds**: Alpaca/Polygon/IBKR websockets → canonical OHLCV; compute indicators server‑side.

---

## 10) MVP scope (2–3 weeks of focused build)
1. **Capture**: Chrome extension with 1s/5s snapshots + symbol/timeframe scrape.
2. **Webhook Ingest**: Minimal API to accept Pine JSON alerts.
3. **Rule Engine v1**: Implement cross/touch/compare/time guards; thresholds → traffic lights.
4. **Coach v1**: SCANNING/SETUP_FORMING/READY text suggestions.
5. **Metrics v1**: Persist trades; simple Bayesian WR by tag‑set; EV, R:R display.
6. **UI**: Live ribbon + side panel; journal auto‑fill with snapshots.

**Deliberate exclusions (post‑MVP):** CV/OCR fallback, advanced position management, portfolio exposure rules, broker integration.

---

## 11) Security & privacy
- Local redaction option for account/order IDs on screenshots.
- Encrypt at rest (server), signed webhook secrets, short‑lived S3/R2 URLs.
- Opt‑in telemetry; offline mode (local only) possible with reduced features.

---

## 12) Stretch goals
- **LLM rule authoring** from natural language + PDF strategy mining.
- **Anomaly detector** for regime shifts (volatility clusters, spread/latency spikes).
- **Voice coach** (earbud hints) and haptic cues.
- **Backtest replayer**: load historical OHLCV, auto‑apply rules, generate synthetic snapshots.

---

## 13) Example config (all in one JSON)
```json
{
  "session": {"symbol": "AAPL", "timeframes": [1,5,10]},
  "record": {"intervalSec": 5},
  "rules": [
    {"id":"ema_cross","when":{"any_of":[{"cross":{"a":"EMA(9)","b":"EMA(20)","direction":"up","lookback_candles":5}}]},"score":{"base":1,"decay_per_candle_since_cross":0.15},"tag":"ema_cross_recent"},
    {"id":"pullback","when":{"all_of":[{"touch":{"series":"PRICE","band":"EMA(9)","tolerance_pct":0.15}},{"compare":{"left":"RSI(14)","op":">","right":50}}]},"score":{"base":0.9},"tag":"pullback_ema9_good_momentum"}
  ],
  "traffic": {"yellow_range":[0.6,0.85], "green_gte":0.85},
  "coach": {"playbook":"basic"},
  "risk": {"prior_alpha":8, "prior_beta":12}
}
```

---

## 14) Next steps
- Confirm your first 5 tags & thresholds (I can stub them).
- Choose capture path for MVP: **Pine alerts first** (lowest complexity) + **1s snapshots**.
- I’ll scaffold the extension manifest, webhook API schema, and rule engine skeleton.
