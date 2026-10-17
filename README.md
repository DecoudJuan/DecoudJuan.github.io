# DecoudJuan.github.io

Personal portfolio of Juan Manuel Decoud: Computer Engineering student at Universidad Austral and Support & Integrations Engineer at Darwin AI. It is for recruiters, teams and clients who want to see what he builds: automations, integrations and web projects, with contact details and a freelance offer.

Live site: https://decoudjuan.github.io/

## What the site has

- A sidebar with name, role, short bio, navigation and links to GitHub and LinkedIn.
- Seven sections: About, Stack (`#skills`), Projects, Experience, Freelance, Education and Contact.
- English and Spanish: a button in the page switches every text at runtime, and the choice is remembered.
- Light and dark theme: follows the system setting by default, with a toggle that is remembered too.
- A "Download CV" button that links to `Juan_Decoud_Resume_EN.pdf` at the root of the site.
- Glass-style cards over a soft gradient background, with scroll-reveal animations and a highlight that follows the cursor.

## Stack

- Plain HTML, CSS and vanilla JavaScript in a single `index.html`. No framework, no bundler, no dependencies to install.
- Fonts from Google Fonts: Inter and DM Serif Display.
- Hosting: GitHub Pages, served directly from the `main` branch (user site, so the repository name is `DecoudJuan.github.io`).

## Local setup

There is nothing to install. Clone the repository and open `index.html` in a browser, or serve the folder with any static server:

```bash
git clone https://github.com/DecoudJuan/DecoudJuan.github.io.git
cd DecoudJuan.github.io
python -m http.server 8000   # http://localhost:8000
```

To edit content, change the markup of the section in `index.html`. Texts shown in Spanish live in the `ES` object of the script at the bottom of the file and are matched to the markup through the `data-t` attributes, so a text changed in one language has to be changed in the other too. See [docs/architecture.md](docs/architecture.md).

## Deploy

GitHub Pages publishes the repository root at https://decoudjuan.github.io/ on every push to `main`. There is no build step, no workflow and no secrets. Files in the root are served as they are: `index.html`, `favicon.ico` and the CV PDF.

## Docs

- [docs/architecture.md](docs/architecture.md): how `index.html` is organized and how to change it.
- [CLAUDE.md](CLAUDE.md): guidance for working on the site with Claude Code.

## License

MIT, see [LICENSE](LICENSE).
