# Nadja Angermann

Custom scripts for [nadja-angermann.com](https://nadja-angermann.com) (Webflow).

## Stack

- **GSAP** + **ScrollTrigger** — scroll-driven animations
- **Lenis** — smooth scrolling
- **esbuild** — bundler

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

In Webflow, add a single script tag (pin a specific commit hash for cache-busting):

```html
<script src="https://cdn.jsdelivr.net/gh/nslt-studio/nadja-angermann@<COMMIT_HASH>/dist/main.js"></script>
```

Or use `@main` for the latest:

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

## Animations overview

| Section | Behaviour |
|---|---|
| **Loader** | Chaotic counter (0 → archive count), fade-in counters, scaleY reveal |
| **Hero** | Word-by-word opacity on scroll (split text) |
| **Main wrapper** | Hero fades out as main content scrolls in |
| **Progress bar** | Horizontal scale 0→1 tracking global scroll |
| **Selected** | Image scale (first 0.7→1, last 1→0.7), stacked items fade out on scroll. First/last items = 2× viewport height, middle items = 1× viewport |
| **Archive** | Logo scale, batch fade-in of archive items, dynamic filenames (`NA_Archive_XX.jpg`), `#archiveIndex` displays "XX Archives" count |
| **Slider** | Full-screen image slider (click archive item to open, next/prev/ESC) |
| **About** | Background color transition to salmon, image + logo sequential scale, UI color switch (white text + blend mode) |
| **Footer** | Accordion on hover |
| **Header nav** | Smooth scroll to sections, `section=about` scrolls to top |
| **Images** | Fade in on load |

## Mobile handling

- `getVh()` uses `visualViewport.height` for accurate viewport on iOS/Android (address bar)
- `ScrollTrigger.config({ ignoreMobileResize: true })` prevents layout recalculations on address bar show/hide
- Trigger positions use pixel values based on `getVh()` instead of GSAP's `"bottom"` keyword
- Selected-item heights recalculate on `ScrollTrigger.refreshInit`
