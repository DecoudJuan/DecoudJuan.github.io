# Architecture

The site is a static Astro build with two pages, `src/pages/index.astro` (Spanish, `/`) and `src/pages/en/index.astro` (English, `/en/`). Each renders one React component, `Desktop`, as a `client:load` island in its language: Astro prerenders its HTML at build time and React hydrates it in the browser.

## Folders

```
src/
  pages/index.astro          Spanish page (/)
  pages/en/index.astro       English page (/en/)
  layouts/Base.astro         <head> per language (title, hreflang, share image), fonts, and the scripts that run before paint
  styles/global.css          design tokens (light and dark) and every component style
  data/
    content.ts               all site content in Spanish and English: person, quote, projects, CV, trash, playlists
    i18n.ts                  interface strings (labels, buttons, messages) in both languages
    notes.ts                 the Notes app entries
    fs.ts                    the terminal's virtual filesystem, built from content.ts and notes.ts
  components/os/
    Desktop.tsx              window state, layout, menu bar, desktop icons, widgets, dock, search, wallpaper
    Window.tsx               one window: title bar, the three buttons, drag, 8 resize handles, animations
    Dock.tsx                 the dock and its magnification
    Spotlight.tsx            Ctrl/Cmd + K search
    NetBackground.tsx        the animated network of nodes on the canvas behind everything
    Penguin.tsx              the penguin (ported from Claude-pet): follows the cursor, blinks, reacts
    icons.tsx                app icons (Phosphor glyphs on coloured tiles)
    lang.tsx                 language context and useLang()
    theme.ts                 theme toggle with the View Transitions circle
    motion.ts                whether motion is off (system setting or the pause button) and useMotionOff()
    types.ts                 AppId, WinState, Rect
    apps/                    one file per app: About, Records, Player, Notes, Music, Terminal, Games, Cv, Hire, Trash
public/
  cv/                        the CV PDF
  previews/                  screenshot of the freelance site shown in "Work with me"
```

## How the desktop works

- `Desktop` keeps one `WinState` per app: rectangle, status (`open`, `min`, `closed`), maximized flag, z-index and a pending animation.
- `Window` runs the animation (genie, open, close) and reports back when it ends.
- Windows the user hasn't moved follow a responsive layout (`layout()` in `Desktop.tsx`) that scales with the desk size.
- On phones (up to 760 px wide) the CSS turns every window into a full-screen sheet, and the home screen grid replaces the desktop icons.

## Content and languages

- Every user-facing string comes from `content.ts` or `i18n.ts`, in Spanish and English. Components read them with `useLang()`, so a change goes in those files and never in a component.
- Each language has its own URL. The language button switches in place and moves the URL, the title and the description with `history.replaceState` (`storeLang` in `lang.tsx`).
- The choice and the theme are stored in `localStorage`. A visitor who picked English and comes back to `/` is sent to `/en/`; the browser language is not used to guess (search engines would then index the wrong language).
- `public/sitemap.xml` repeats the two URLs and their hreflang by hand: a new language goes there too.
- The page title, description and share image of each language live in `meta` in `i18n.ts`. The share images are `public/og.png` and `public/og-en.png`.

## Adding things

- **A project:** add an entry to `PROJECTS` in `content.ts`. It shows up in Records, the Player, the terminal and the search.
  - For its demo, set `video` (an external URL), `poster` and optionally `chapters`.
- **A note:** add an entry to `NOTES` in `notes.ts`.
- **An app:**
  1. Add its id to `AppId` (`types.ts`).
  2. Add its labels to `i18n.ts` and its icon to `icons.tsx`.
  3. Add its size to `META` and `layout()` in `Desktop.tsx`, and its component to `content` there.

## Keyboard and motion

- Opening a window moves focus to it; closing or minimizing it gives focus back to what opened it (or its dock icon).
- Alt + arrows move the focused window, Alt + Shift + arrows resize it, and Alt + arrows move a focused desktop icon one cell.
- The search is a modal: everything behind it is `inert` while it is open.
- Animations stop with `prefers-reduced-motion` or with the pause button in the menu bar. Code that animates checks `motionOff()`, or `useMotionOff()` when it runs its own loop.

## Theme

- Colours are CSS variables on `:root`.
- The dark theme is defined twice: in the `prefers-color-scheme` media query for the system default, and under `:root[data-theme="dark"]` for the toggle. Edit both.
- Wallpapers override a few variables through `.desk[data-wall=…]`.
