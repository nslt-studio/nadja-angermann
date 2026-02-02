# Nadja Angermann

Custom scripts for [nadja-angermann.com](https://nadja-angermann.com) (Webflow).

## Setup

```bash
npm install
```

## Development

```bash
./start-dev.sh
```

This will:
- Watch `src/index.js` and rebuild on save (esbuild)
- Start a local server on port 8000
- Create a public tunnel via serveo.net

Edit `src/index.js`, save, reload the Webflow page.

## Build

```bash
npm run build
```

Outputs `dist/main.js` (bundled + minified).

## Production

In Webflow, add a single script tag:

```html
<script src="https://cdn.jsdelivr.net/gh/nslt-studio/nadja-angermann@main/dist/main.js"></script>
```

## Structure

```
src/index.js       Source (GSAP + Lenis + animations)
dist/main.js       Built bundle (committed, served via CDN)
dev-server.py      Local dev server
start-dev.sh       Dev environment launcher
```
