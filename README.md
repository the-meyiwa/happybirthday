# Happy birthday, Dorcas

A responsive Sakura-inspired birthday page with both supplied photographs and both video clips. Built with static HTML, CSS, JavaScript, and locally hosted GSAP. No application server or build step is needed.

## Run locally

From this directory:

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. For hosting elsewhere, upload the contents of `dist` to any static host (Netlify, Cloudflare Pages, Vercel, or GitHub Pages). All assets use relative paths.

## Motion and media

- Scroll-driven portrait compositions, typography reveals, and custom canvas Sakura petals.
- The pause button stops decorative motion and background video loops, revealing all page content.
- The device’s reduced motion setting is respected automatically.
- Videos load as they enter the viewport. Clicking a video opens its full clip with sound and native playback controls; Escape closes it.
- Fonts, images, videos, and scripts are hosted locally. The page makes no third-party requests.

## Design references

- Cherry blossom pink `#FFB7C5`: https://en.wikipedia.org/wiki/Shades_of_pink#Cherry_blossom_pink
- Sakura petal motion reference: https://github.com/jhammann/sakura (custom original renderer; no source copied).
- Typography: Cormorant Garamond and DM Sans, available under the SIL Open Font License through Google Fonts.
- GSAP 3.13: https://gsap.com/standard-license/ — local browser distribution included.

The supplied personal media is used only for this birthday site. Text and layout are in `dist/index.html`; palette and responsive layout are in `dist/styles.css`; animations and video interaction are in `dist/app.js`.
