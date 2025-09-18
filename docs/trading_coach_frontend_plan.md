# Trading Coach Frontend Checklist

## 1. Routes & Navigation
- [x] Create `/coach` (or `/training`) route for the live training hub.
- [ ] Update `/strategies/[slug]` to include `CoachRibbon` and toggleable `CoachPanel`.
- [ ] Extend `/me/journal` with a coach history section.

## 2. Component Implementation
- [x] `CoachRibbon` – show traffic lights, top tags, projected R:R/EV.
- [x] `CoachPanel` – guidance feed, session state, heartbeat indicator.
- [x] `SessionLauncher` – start/stop, timeframe picker, status banner.
- [x] `RuleSetEditor` – CRUD for rule sets/tag definitions (JSON inputs + form fields).
- [x] `CoachSessionList` – list active/archived sessions in the hub.

## 3. State & API Hooks
- [x] Implement `apps/web/lib/api/coach.ts` functions (`fetchCoachSessions`, `fetchCoachEvaluations`, CRUD helpers`) with mock fallback.
- [ ] Build SWR/React Query hooks for polling evaluations (3–5 s) and listing sessions.
- [ ] Add shared client state (context or hook) for selected session, heartbeat lag, and cached metrics.

## 4. Feature Flags & Access Control
- [ ] Add `featureCoachCreator` flag to gate editor/launcher for creators.
- [ ] Add `featureCoachRibbon` flag to progressively enable ribbons on strategies.
- [ ] Guard journal view behind `featureCoachJournal` if needed.

## 5. Visual Integration
- [ ] Use existing UI primitives (`Card`, `Button`, `Badge`, `Stat`) and theme tokens (`bg-background-*`, `text-text-*`).
- [ ] Match spacing/typography to current strategy detail layout.
- [ ] Ensure responsive behavior (desktop-first, graceful collapse on mobile).

## 6. Testing & QA
- [ ] Wire demo flow: run `npm run coach:demo` + `npm run coach:worker` while hitting new pages.
- [ ] Add component/unit tests where useful (e.g., hook polling intervals, store behavior).
- [ ] Verify 5s polling stops when session not selected.

## 7. Documentation
- [ ] Update README / frontend guide with steps to run coach UI locally.
- [ ] Capture screenshots or Storybook stories once UI is implemented.
