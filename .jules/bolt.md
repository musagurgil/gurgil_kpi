## 2026-02-26 - [Prisma + SQLite createMany bottleneck]
**Learning:** Prisma's `createMany` does not return the created records (especially with SQLite/MySQL), forcing a subsequent `findMany` query to retrieve IDs for further processing (like emitting real-time events). This `findMany` often relies on fuzzy matching (e.g., time window) which is flaky and adds a round-trip.
**Action:** For batch inserts where IDs are needed immediately (e.g., for notifications), generate IDs client-side (using `crypto.randomUUID()` or `cuid`) and pass them in the `data` array. This allows using the in-memory objects directly, eliminating the need for a fetch-back query.

## 2026-02-26 - [React Render Bottleneck: O(N) Derived State]
**Learning:** `src/components/dashboard/DepartmentPerformance.tsx` had a classic React anti-pattern: running an O(N) array reduction (`kpiStats.forEach` into a Map, then `Array.from().map().sort()`) directly in the render body. Because `kpiStats` can be large and the component relies on global dashboard state, any unrelated dashboard state change caused this expensive recalculation.
**Action:** Always wrap derived state calculations that involve loops, mapping, or sorting over unbounded arrays (like KPIs or Tickets) in a `useMemo` hook, especially in dashboard-level components that re-render frequently.

## 2026-03-05 - [React Render Bottleneck: O(N) Derived State in KPI Tracking]
**Learning:** `src/pages/KPITracking.tsx` suffered from unmemoized O(N) array filtering and calculations for `filteredKPIs` and KPI summary statistics (`completedKPIs`, `atRiskKPIs`, `onTrackKPIs`). Because these derived state operations were calculated directly in the component body, any unrelated re-render or state update would trigger unnecessary recalculations over the full KPI array.
**Action:** Always utilize `useMemo` to memoize derived state calculations such as filtering and reducing large dataset arrays (like KPI stats) to prevent costly, repetitive O(N) operations across multiple re-renders.
