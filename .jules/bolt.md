## 2026-02-07 - Code Splitting
**Learning:** React.lazy expects a default export. When lazy loading a component that is a named export (like `AuthPage`), you must wrap the import promise: `import("./path").then(module => ({ default: module.Component }))`.
**Action:** Verify export types (default vs named) before applying `React.lazy`.
