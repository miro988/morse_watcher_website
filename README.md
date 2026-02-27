# Morse Watcher Website

Static website for Morse Watcher, designed as a clean landing page with a GitHub Pages deployment workflow.

## Stack

- HTML
- CSS
- Vanilla JavaScript
- GitHub Actions for deployment

## Local development

Open `index.html` directly in a browser, or serve the repository with any simple static file server.

## Project structure

- `index.html` contains the page markup.
- `styles.css` contains the visual system and responsive layout.
- `script.js` drives the live signal preview panel.
- `assets/app-icon.svg` is the current site icon.
- `assets/app-intro-1.png`, `assets/app-intro-2.png`, and `assets/app-intro-3.png` are the app introduction screenshots used on the landing page.
- `.github/workflows/deploy.yml` deploys the site to GitHub Pages.

## GitHub Pages deployment

1. Push changes to `main`.
2. In GitHub, open repository settings.
3. Go to `Pages`.
4. Set the source to `GitHub Actions`.
5. Set the custom domain to `morsewatcher.com`.
6. The included workflow will publish the current static site, including the `CNAME` file for the custom domain.

## Customization

- Update copy in `index.html`.
- Adjust colors and layout tokens in `styles.css`.
- Replace the demo signal rotation in `script.js` with real product behavior when needed.
- Replace the App Store placeholder CTA with the live App Store URL after approval.

## License

MIT
