# @magic-spells/tab-group

Accessible tab group web component. Four custom elements: `<tab-group>`, `<tab-list>`, `<tab-button>`, `<tab-panel>`.

## Project Structure

- `src/tab-group.js` — Component source (single file, all four custom elements)
- `src/tab-group.css` — Structural CSS only (19 lines, no cosmetic styles)
- `rollup.config.mjs` — Builds ESM, CJS, UMD, and minified UMD to `dist/`
- `demo/` — Static demo page for GitHub Pages (uses built files copied from dist)
- `tab-group.d.ts` — TypeScript definitions (root-level, published alongside dist)

## Build

- `npm run build` — Clean + production build
- `npm run dev` — Watch mode with dev server on port 3000 (copies JS/CSS to demo/)
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Key Decisions

- No Shadow DOM — elements are styled directly by consumers
- Structural CSS only — zero cosmetic opinions
- `:scope >` selectors for nested tab-group support
- `sideEffects: true` — component self-registers custom elements on import
- Module-level `instanceCount` for unique ARIA IDs across instances
- `files: ["dist/"]` in package.json — only dist is published
- Observed `active` attribute on `<tab-group>` (0-based index), reflected on every
  activation — the attribute is the source of truth for readers; matching `active` property
- Programmatic activation (`active` attribute/property, authored `active` at connect) never
  calls `focus()`; only click / keyboard activation does (`setActiveTab` focuses)
- `disabled` on `<tab-button>`: not clickable, skipped by roving, `aria-disabled="true"`
- Click + keydown are delegated on the `<tab-group>` itself (not the `<tab-list>`), so a
  replaced or late-added tab-list keeps working
- A MutationObserver (childList + subtree, `disabled` attribute filter) re-collects and
  re-wires tabs/panels after adds, removes, and reorders
- `ensureConsistentTabsAndPanels` runs ONCE at first connect only — later count mismatches
  generate nothing and never throw
- `tabchange` is `bubbles: true, composed: true` so a wrapper can listen at its root
- CSS animation support via `animate-out-class`, `animate-in-class`, `animate-timeout` attributes
- Animation lifecycle: ARIA updates immediately, then animate-out → swap hidden → animate-in
- AbortController-based cancellation handles rapid clicks cleanly
- No animation attributes = original instant behavior (fully backwards-compatible)

## Publishing

- `npm publish` triggers `prepublishOnly` which runs a clean build
- Published to npm as `@magic-spells/tab-group` (public, scoped)
- Demo hosted via GitHub Pages from the `demo/` directory
