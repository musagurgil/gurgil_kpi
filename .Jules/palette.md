## 2024-05-24 - Accessibility pattern: Icon buttons
**Learning:** React/Radix components missing `aria-label`s on icon-only buttons create an unannounced element for screen readers, breaking standard accessibility guidelines.
**Action:** When adding or auditing icon-only components (e.g. `size="icon"`), always include an `aria-label` describing the icon's action in the application's primary language (Turkish).
