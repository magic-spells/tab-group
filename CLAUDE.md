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
- CSS animation support via `animate-out-class`, `animate-in-class`, `animate-timeout` attributes
- Animation lifecycle: ARIA updates immediately, then animate-out → swap hidden → animate-in
- AbortController-based cancellation handles rapid clicks cleanly
- No animation attributes = original instant behavior (fully backwards-compatible)

## Publishing

- `npm publish` triggers `prepublishOnly` which runs a clean build
- Published to npm as `@magic-spells/tab-group` (public, scoped)
- Demo hosted via GitHub Pages from the `demo/` directory
