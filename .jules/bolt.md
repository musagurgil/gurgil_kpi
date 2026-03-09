## 2026-02-26 - [Prisma + SQLite createMany bottleneck]
**Learning:** Prisma's `createMany` does not return the created records (especially with SQLite/MySQL), forcing a subsequent `findMany` query to retrieve IDs for further processing (like emitting real-time events). This `findMany` often relies on fuzzy matching (e.g., time window) which is flaky and adds a round-trip.
**Action:** For batch inserts where IDs are needed immediately (e.g., for notifications), generate IDs client-side (using `crypto.randomUUID()` or `cuid`) and pass them in the `data` array. This allows using the in-memory objects directly, eliminating the need for a fetch-back query.

## 2026-02-26 - [React Render Bottleneck: O(N) Derived State]
**Learning:** `src/components/dashboard/DepartmentPerformance.tsx` had a classic React anti-pattern: running an O(N) array reduction (`kpiStats.forEach` into a Map, then `Array.from().map().sort()`) directly in the render body. Because `kpiStats` can be large and the component relies on global dashboard state, any unrelated dashboard state change caused this expensive recalculation.
**Action:** Always wrap derived state calculations that involve loops, mapping, or sorting over unbounded arrays (like KPIs or Tickets) in a `useMemo` hook, especially in dashboard-level components that re-render frequently.

## 2026-03-05 - [React Render Bottleneck: O(N) Derived State in KPI Tracking]
**Learning:** `src/pages/KPITracking.tsx` suffered from unmemoized O(N) array filtering and calculations for `filteredKPIs` and KPI summary statistics (`completedKPIs`, `atRiskKPIs`, `onTrackKPIs`). Because these derived state operations were calculated directly in the component body, any unrelated re-render or state update would trigger unnecessary recalculations over the full KPI array.
**Action:** Always utilize `useMemo` to memoize derived state calculations such as filtering and reducing large dataset arrays (like KPI stats) to prevent costly, repetitive O(N) operations across multiple re-renders.

## 2024-03-06 - Frontend Performance Anti-Pattern: O(N*M) Derived State
**Learning:** Found a critical anti-pattern in `src/pages/MeetingRooms.tsx` where `.filter()` was being called inside a `.map()` during derived state calculation (`getRoomReservations` inside `filteredRooms.map`), resulting in O(N*R) complexity (Rooms * Reservations) which causes significant main-thread blocking as data scales.
**Action:** Always pre-compute lookup maps using a single-pass `reduce` inside a `useMemo` (changing complexity from O(N*M) to O(N+M)). I replaced the inline `reservations.filter` with a `reservationsByRoomId` lookup map, creating an O(1) access pattern for child component rendering loops.
## 2024-03-07 - Frontend Performance Anti-Pattern: O(N) Derived State with Multiple array passes
**Learning:** Found a performance bottleneck in `src/components/tickets/TicketManagement.tsx` where `.filter().length` was called multiple times in a row inside the main render loop to calculate aggregate stats (e.g., total tickets, open tickets, closed tickets). This resulted in O(4N) array passes on every component re-render. Additionally, the filtered arrays themselves were not memoized, causing unnecessary recalculations even when completely unrelated state properties (like modal visibilities or current tab) changed.
**Action:** Always pre-compute aggregate statistics with a single-pass `.reduce()` to reduce loop complexity from O(M*N) to O(N). Additionally, always memoize these derived complex objects and filtered arrays using `useMemo` hooks (e.g., `const stats = useMemo(...)` and `const filteredTickets = useMemo(...)`) to shield them from triggering redundant recalculations when unrelated components invoke a render cycle.
## 2024-05-19 - O(N) to O(1) Dictionary Lookup inside Maps
 **Learning:** When rendering large lists (e.g. userReservations) where each item requires a lookup in another array (rooms), using `.find()` inside a `.map()` results in an O(N*M) operation.
 **Action:** Converting the target array (rooms) into a dictionary/hash map using `useMemo` changes the lookup to O(1), significantly improving performance (from ~70ms to ~3ms for 1000 rooms and 10000 reservations).

## 2026-03-09 - [React Rules of Hooks vs Performance Optimization]
**Learning:** When adding `useMemo` hooks to optimize large array `.filter()` operations (like those for KPI tracking stats), it is easy to accidentally violate React's Rules of Hooks if the new hooks are placed after early returns (e.g., `if (isLoading) return <LoadingSpinner />`). This results in a critical crash: "Rendered fewer hooks than expected".
**Action:** Always verify the placement of newly introduced hooks. Ensure they are declared at the top level of the component hierarchy, before any conditional logic or early `return` statements.
