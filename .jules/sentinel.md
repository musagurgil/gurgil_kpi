## 2024-05-24 - [Add Auth Rate Limiting and Security Headers]
**Vulnerability:** Missing rate limiting on authentication endpoints (`/api/auth/login`, `/api/auth/signup`) allowed brute-force and credential stuffing attacks. Additionally, missing basic HTTP security headers left the app vulnerable to common web attacks.
**Learning:** The application lacked basic defense-in-depth mechanisms for its Express server, exposing it to automated attacks.
**Prevention:** Implement `express-rate-limit` on all sensitive authentication routes and use `helmet` for foundational HTTP security headers.
