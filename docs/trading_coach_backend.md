# Trading Coach Backend Additions

## Evaluation Pipeline
- Queue: `coach:evaluator` (Bull). Jobs dispatched whenever alerts land or via 5s heartbeat.
- Worker entry point: `npm run coach:worker` (uses `tsx src/modules/coach/coach.worker.ts`). Configure concurrency with `COACH_EVALUATOR_CONCURRENCY` env; heartbeat cadence via `COACH_HEARTBEAT_MS`.
- Evaluator loads the latest snapshot, interprets the rules DSL stored in `CoachTagDefinition.rule`, and assigns traffic-light status per the thresholds stored in `CoachRuleSet.thresholds` or defaults (green ≥0.85, yellow 0.6–0.85).
- Advice records are generated for each evaluation so the UI can surface human-readable guidance aligned with session state transitions (SCANNING → SETUP_FORMING → READY).

## Data Expectations
- Snapshots may include:
  - `features.series[<name>]` arrays for EMA/price history (used for cross detection).
  - `features.<key>` or `payload.<key>` numeric properties referenced by compare/touch conditions (`rule.when`).
  - Optional `features.meta.candlesSinceCross` to decay scores when specified.
- Rule DSL currently supports: `all_of`, `any_of`, `compare`, `touch`, `cross`, `market_open_within_min`, and `higher_tf_confirms` (recursively evaluated against `features.higherTimeframes[timeframe]`).

## Session Evolution
- Every evaluation persists `CoachEvaluation`, `CoachAdvice`, and updates `CoachSession.state`:
  - Any GREEN tag with severity `ENTRY` or `SETUP` ⇒ `READY`.
  - Any YELLOW tag ⇒ `SETUP_FORMING`.
  - Otherwise ⇒ `SCANNING`.
- Heartbeat jobs requeue themselves to maintain the 5s cadence when no new alerts arrive.

## Local Verification
- Start the worker: `npm run coach:worker` (requires Redis & Postgres from Docker compose).
- Run the demo harness to seed a rule set, session, and alert snapshot: `npm run coach:demo`.
- Check worker logs for the evaluation, then inspect `/api/coach/sessions/:id/evaluations` (or the console output from the script) to confirm traffic-light status and advice records.

## Automated Testing
- Unit coverage lives at `apps/api/src/modules/coach/__tests__/coach.evaluator.test.ts`; it exercises `CoachEvaluatorService.handleJob` using mocked Prisma transactions to verify status/advice transitions.
- Execute `npm test -- coach` from `apps/api` (or `npx jest coach --runInBand --verbose`) to run only the coach-specific suite.
