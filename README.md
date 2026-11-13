# Are we cooked?

A silly live "AI danger rating" page. A roadside-style danger gauge, live readings (Skynet readiness, radicalised toasters, unread pull requests), the doom equation and an incident board, all ticking over in your browser.

**Live site:** https://ashley-pettit.github.io/lgtm-flash/

Every number is made up and simulated in the browser. Nothing here is a real prediction.

## How it works

- `index.html` is the whole site: one file, no build step, no tracking.
- This lives on the `gh-pages` branch of lgtm-flash, so the mod's installer (which downloads `prod`) never picks it up.
- Pushing to `gh-pages` republishes the site. GitHub Pages stamps the short commit id into the footer ("Build abc1234").
- `og.png` is the link preview image. Edit `tools/og.html`, then run `python3 tools/render.py` to re-render it and the home screen icon.

## Credits

- Featured video: [LGTM (Looks Good to Me)](https://www.youtube.com/watch?v=3TNpOD6bov8), a Claude music video by Degenerative Pixels.
- Fonts: Overpass, Doto and STIX Two Text, under the SIL Open Font License (see `fonts/`).
