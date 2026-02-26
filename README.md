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
- `.github/workflows/deploy.yml` deploys the site to GitHub Pages.

## GitHub Pages deployment

1. Push changes to `main`.
2. In GitHub, open repository settings.
3. Go to `Pages`.
4. Set the source to `GitHub Actions`.
5. The included workflow will publish the current static site.

## Customization

- Update copy in `index.html`.
- Adjust colors and layout tokens in `styles.css`.
- Replace the demo signal rotation in `script.js` with real product behavior when needed.

## License

MIT
