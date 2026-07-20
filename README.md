# Culinary Revolutionary — website

A dependency-free, responsive static site built from the business's publicly served logo, photography, and published content. No build step, no framework: open `index.html` and it runs.

## Preview locally

```bash
python3 -m http.server 8096 --bind 127.0.0.1
```

Open `http://127.0.0.1:8096/`.

## Files
- `index.html`, `styles.css`, `script.js` — the site
- `thank-you.html` — retained static confirmation/fallback page
- `public/assets/` — locally copied public website assets
- `ASSET-SOURCES.json` — exact source URLs and file sizes
- `DESIGN.md` — extracted design system and implementation rules
- `preview/` — desktop/mobile QA captures (not committed)

## Inquiry form

This repository is a static site with no server-side runtime. The inquiry form therefore
builds a pre-filled `mailto:` message addressed to `chef.jbmartin67@gmail.com` instead of
posting visitor data to a third-party form relay.

- The visitor completes the fields and selects **Open email draft**.
- `script.js` formats the service, date, guest count, contact details, and notes into a
  readable subject and email body.
- The visitor's configured email application opens the draft; the visitor reviews it and
  explicitly presses Send.
- No form data is stored by the website or passed through an external form provider.

To change the destination address, update both the form `action` in `index.html` and the
`mailto:` address in `script.js`. A true one-click web submission would require an approved
serverless/backend form service and its account credentials.

## Before launch
Confirm the business owner's permission for imagery, logo, copy, and the credentials
listed in the Career Highlights panel.
