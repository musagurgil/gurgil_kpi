## 2025-02-18 - Missing Indexes Discrepancy
**Learning:** The project memory stated that indexes existed on `status` and other fields, but the actual `prisma/schema.prisma` file had none. This discrepancy led to suboptimal query performance.
**Action:** Always verify "known" optimizations against the actual codebase (source of truth) before assuming they are in place.
