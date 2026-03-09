# Palette Journal

## 2024-05-24 - Initial setup
**Learning:** Setting up the journal for Palette agent.
**Action:** Starting to record critical UX/a11y learnings here.
## 2025-02-12 - Missing Accessible Name on Global Search Input
**Learning:** Found that the global search `<Input>` in `DashboardHeader.tsx` lacked an accessible name, making it invisible to screen readers since it didn't use a `<Label>` or `aria-label`.
**Action:** Always ensure custom `<Input>` components have an `aria-label` localized in Turkish (e.g., `aria-label="Arama yap"`) when an explicit `<Label>` element is visually omitted (such as when using an inline search bar with an icon).
