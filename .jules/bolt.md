## 2026-02-21 - Sequential Queries in Dashboard Stats
**Learning:** The dashboard stats endpoint was performing 8+ sequential database queries to fetch counts for KPIs and Tickets, significantly increasing latency.
**Action:** Use `Promise.all` combined with `prisma.groupBy` to aggregate stats concurrently. This pattern reduced round-trips from ~9 to 3. Future stats endpoints should use `groupBy` aggregation by default.
