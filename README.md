# Culinary Revolutionary — website

A dependency-free, responsive static site built from the business's publicly served logo, photography, and published content. No build step, no framework: open `index.html` and it runs.

## Preview locally

```bash
python3 -m http.server 8096 --bind 127.0.0.1
```

Open `http://127.0.0.1:8096/`.

## Files
- `index.html`, `styles.css`, `script.js` — the site
- `thank-you.html` — inquiry confirmation page
- `public/assets/` — locally copied public website assets
- `ASSET-SOURCES.json` — exact source URLs and file sizes
- `DESIGN.md` — extracted design system and implementation rules
- `preview/` — desktop/mobile QA captures (not committed)

## Inquiry form

The form posts to [FormSubmit](https://formsubmit.co) — a hosted relay that turns a static
form into an email. No account, no backend, no keys in the repo.

- Submissions are emailed to `chef.jbmartin67@gmail.com` as a formatted table.
- The visitor receives an automatic acknowledgement (`_autoresponse` in `index.html`).
- FormSubmit's default reCAPTCHA and a hidden honeypot field (`_honey`) reduce spam.
- The browser uses a normal HTML form POST and redirects to `thank-you.html` after success,
  so delivery does not depend on JavaScript. `script.js` only adds a sending state.

**One-time activation:** the *first* submission causes FormSubmit to email a confirmation
link to `chef.jbmartin67@gmail.com`. Until someone with access to that inbox clicks it,
no inquiries are delivered. Send one test submission, click the link, then send a second
to confirm delivery end to end.

To change the destination address, edit the form `action` in `index.html`. If the public
site URL changes, update the hidden `_next` redirect URL as well.

## Before launch
Confirm the business owner's permission for imagery, logo, copy, and the credentials
listed in the Career Highlights panel.
