# CLAUDE.md

Guidance for working on this repo with Claude Code.

## What this is

Juan Manuel Decoud's personal portfolio, published at https://decoudjuan.github.io/ with GitHub Pages. One static page, bilingual (English and Spanish), light and dark.

## Stack

Plain HTML, CSS and vanilla JavaScript in a single `index.html`. Google Fonts (Inter, DM Serif Display). No framework, no bundler, no dependencies.

## Commands

There is no install, build, test or lint step.

- Run it: open `index.html` in a browser, or `python -m http.server 8000` in the repo root.
- Publish it: push to `main`; GitHub Pages serves the files as they are.

## Structure

```
index.html   style block, markup (sidebar + 7 sections), script (i18n, theme, effects, nav)
favicon.ico
docs/architecture.md   how index.html is organized
```

## Conventions

- Every translatable element has `data-t="<key>"`; the English text is in the markup and the Spanish one in the `ES` object of the script. Change both together and keep the keys in sync.
- The dark theme is defined in two places (`:root[data-theme="dark"]` and the `prefers-color-scheme` media query). Edit both.
- Colors, radii and spacing come from the CSS variables on `:root`, not from loose values.
- Section `id`s (`about`, `skills`, `projects`, `experience`, `freelance`, `education`, `contact`) are used by the navigation script (`ids` array); a new section has to be added there too.
- Project links should point to repositories or sites that exist and are public.
- The hero "Download CV" button links to `Juan_Decoud_Resume_EN.pdf`, which is not in the repo yet.
- Keep it a single dependency-free file unless there is a clear reason to split it.

## Commits y PRs

Commits y PRs sin atribución a Claude: nada de `Co-Authored-By: Claude` ni "Generated with Claude Code". Sin emojis de color.
