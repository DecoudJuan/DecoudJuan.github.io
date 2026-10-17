# Architecture

The whole site is one file, `index.html`, with three blocks: a `<style>` in the head, the markup in the body and a single `<script>` at the end. There is no build step.

## Style block

- Design tokens are CSS custom properties on `:root` (colors, radii, sidebar width, gap).
- The dark theme is defined twice: under `:root[data-theme="dark"]` for the manual choice, and inside `@media (prefers-color-scheme: dark)` guarded with `:root:not([data-theme="light"])` for the system default. A change to a dark color has to be made in both places.
- Cards use a glass look (translucent background, inset edge, blur) over a gradient mesh background.

## Markup

A fixed sidebar (name, role, bio, language and theme buttons, navigation, social links) and a main column with seven sections, each with the `id` used by the navigation:

| `id` | Section |
| --- | --- |
| `about` | Hero: headline, summary, stats, calls to action (projects, CV, contact) |
| `skills` | Stack, grouped by area |
| `projects` | Selected projects, with links to repositories and live sites |
| `experience` | Work experience |
| `freelance` | Landing pages and web apps offer |
| `education` | Degree, capstone and other studies |
| `contact` | Contact links |

## Script

One IIFE with four jobs:

1. **i18n.** Every translatable element carries `data-t="<key>"`. The markup holds the English text and the `ES` object holds the Spanish one; the language button swaps the text of each element, and the choice is saved in `localStorage`.
2. **Theme.** The toggle sets `data-theme` on the root element and saves it; without a saved choice the CSS follows the system.
3. **Effects.** Scroll-reveal for sections (`.reveal`) and a cursor-following highlight on cards.
4. **Active navigation.** On scroll, the link of the section currently at the top gets the `active` class.

`localStorage` reads and writes are wrapped in `try/catch`, so the page works with storage blocked.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The site |
| `favicon.ico` | Tab icon |
| `Juan_Decoud_Resume_EN.pdf` | CV, linked from the hero button (it has to be added to the repo root for the link to work) |
