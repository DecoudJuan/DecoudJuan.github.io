# DecoudJuan.github.io

Personal portfolio of Juan Manuel Decoud: Computer Engineering student at Universidad Austral, Support & Integrations Engineer at Darwin AI and freelancer building websites, custom systems and AI automations for small businesses. It is for clients, recruiters and teams who want to see what he builds.

Live site: https://decoudjuan.github.io/

The site is **DecoudJuan OS**: a desktop operating system made of wood, with a network of connected nodes in the background and Juan's penguin (from [Claude-pet](https://github.com/DecoudJuan/Claude-pet)) as its character.

## What the site has

- **Windows like a real OS:** move, resize from any edge or corner, minimize to the dock with a genie effect, maximize (button or double-click on the title bar) and close.
- **Dock and desktop:**
  - The dock magnifies the icon under the pointer without overlapping its neighbours.
  - Desktop icons can be selected with a click or a drag box, opened with a double-click and dragged around.
  - Icon positions are remembered.
- **Apps:**
  - **About me:** the penguin and the headline quote.
  - **Records:** projects as vinyl records.
  - **Player:** for long demo videos, with a list of every demo, chapters, playback speed and resume position.
  - **Notes:** short write-ups on things learned.
  - **Music:** Spotify playlists.
  - **Terminal:** a virtual filesystem (`ls`, `cd`, `cat`, `open`, `tree`, `neofetch`, `pingusay` and more).
  - **Games:** Pingu, Snake and Minesweeper in pixel art.
  - **CV:** with the PDF to download.
  - **Work with me:** links to the freelance services site, https://juandecoud.pages.dev/.
  - **Trash:** old university projects.
- **Search:** Spotlight-style, with Ctrl/Cmd + K.
- **Settings:**
  - Spanish and English, switched from the menu bar.
  - Light and dark theme; the theme switch is animated.
  - Four wallpapers.
- **Phones:** a home screen with an app grid; each app opens full screen.

## Stack

- [Astro](https://astro.build/) 7 with one React 19 island (the desktop). Astro prerenders the HTML, so all the text is in the page for search engines.
- Plain CSS with design tokens in `src/styles/global.css`.
- [Phosphor](https://phosphoricons.com/) icons; fonts from Google Fonts (Onest, JetBrains Mono, Silkscreen).
- No backend.

## Local setup

```bash
git clone https://github.com/DecoudJuan/DecoudJuan.github.io.git
cd DecoudJuan.github.io
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

Requires Node 22 or newer.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site with `withastro/action` and publishes it with `actions/deploy-pages`. In the repository settings, Pages uses **GitHub Actions** as its source.

Demo videos are not stored in the repository: they go to an external host (Cloudflare R2 or unlisted YouTube) and are referenced from `src/data/content.ts`.

## Docs

- [docs/architecture.md](docs/architecture.md): how the code is organized and how to add content.
- [CLAUDE.md](CLAUDE.md): guidance for working on the site with Claude Code.

## License

MIT, see [LICENSE](LICENSE).
