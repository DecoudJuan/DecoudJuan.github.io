# CLAUDE.md

Guidance for working on this repo with Claude Code.

## What this is

Juan Manuel Decoud's personal portfolio, published at https://decoudjuan.github.io/ with GitHub Pages. It is **DecoudJuan OS**: a desktop operating system (windows, dock, apps) on a wooden desk, with Juan's penguin as its character. Bilingual (Spanish and English), light and dark.

## Stack

Astro 7 with one React 19 island (`src/components/os/Desktop.tsx`), plain CSS in `src/styles/global.css`, Phosphor icons. No backend.

## Commands

- `npm install`, then `npm run dev` (http://localhost:4321).
- `npm run build` builds the static site in `dist/`; `npx tsc --noEmit -p .` type-checks.
- Publish: push to `main`; `.github/workflows/deploy.yml` builds and deploys to Pages. Pages is set to **GitHub Actions** as its source.

## Structure

See [docs/architecture.md](docs/architecture.md). In short:

- Content: `src/data/content.ts` (site content), `src/data/i18n.ts` (interface strings), `src/data/notes.ts`.
- The terminal filesystem is built from those files in `src/data/fs.ts`.
- Desktop and windows: `src/components/os/`. Apps: `src/components/os/apps/`.

## Conventions

- **Text:**
  - Every user-facing string lives in `content.ts` or `i18n.ts`, in **both** Spanish and English. Never hard-code text in a component.
  - Spanish copy is rioplatense (voseo).
- **Colours:**
  - Colours come from CSS variables on `:root`.
  - The dark theme is defined twice (the `prefers-color-scheme` media query and `:root[data-theme="dark"]`). Edit both.
- **Projects:**
  - Links point to public repositories or sites.
  - Do not present someone else's project as Juan's. `manos` is not his.
- **Demo videos** go on an external host (R2 or unlisted YouTube), never in the repo. The player loads them only on play.
- **Motion:** respects `prefers-reduced-motion`. Pointer-only effects check `pointerType === 'mouse'`.
- **Binary files** are marked in `.gitattributes`.

## Commits y PRs

Commits y PRs sin atribución a Claude: nada de `Co-Authored-By: Claude` ni "Generated with Claude Code". Sin emojis de color.
