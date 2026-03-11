## 2024-05-24 - [Add Auth Rate Limiting and Security Headers]
**Vulnerability:** Missing rate limiting on authentication endpoints (`/api/auth/login`, `/api/auth/signup`) allowed brute-force and credential stuffing attacks. Additionally, missing basic HTTP security headers left the app vulnerable to common web attacks.
**Learning:** The application lacked basic defense-in-depth mechanisms for its Express server, exposing it to automated attacks.
**Prevention:** Implement `express-rate-limit` on all sensitive authentication routes and use `helmet` for foundational HTTP security headers.
## 2025-03-03 - [Ticket Internal Comments Leakage (IDOR)]
**Vulnerability:** Internal comments (`isInternal: true`) on tickets were returned to any user who had access to the ticket, rather than being restricted to administrators or target department members.
**Learning:** Returning full object graphs via Prisma's `include` (e.g., `include: { comments: true }`) or simple unfiltered `findMany` queries on child relationships bypasses authorization checks that should apply only to specific rows (like internal comments).
**Prevention:** Explicitly filter nested relationships or fetch operations using `where` clauses based on user roles and attributes (e.g., filtering `isInternal` out for non-admin/non-target-dept users).
## 2026-03-11 - [Dashboard Stats IDOR]
**Vulnerability:** The `/api/dashboard/stats` endpoint aggregated all KPIs and Tickets in the system, returning global statistics regardless of the user's role or department. This is an IDOR vulnerability, exposing business metrics.
**Learning:** Aggregation endpoints using Prisma's `groupBy` or `count` must explicitly implement the same authorization rules (via `where` clauses) as the list endpoints they summarize.
**Prevention:** Consistently apply role and department-based `where` clauses to all Prisma queries, including grouping and counting operations.
