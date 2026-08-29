# Culinary Revolutionary — website

A dependency-free static site. No build step, no framework: open `index.html` and it runs.

- `index.html` — home (hero, services, service area, menu teasers, about, inquiry form)
- `menus.html` — all seven sample menus, 240 dishes, generated from the chef's Word doc
- `thank-you.html` — post-submission confirmation
- `styles.css`, `script.js` — the site
- `robots.txt`, `sitemap.xml` — crawl control
- `public/assets/` — locally copied imagery (`ASSET-SOURCES.json` records provenance)
- `DESIGN.md` — extracted design system

`ASSET-SOURCES.json`, `DESIGN.md` and `README.md` are **build notes, not site content**, and
the deploy workflow deliberately excludes them from the published artifact.

## Preview locally

```bash
python3 -m http.server 8096 --bind 127.0.0.1
```

## Inquiry form

The form POSTs to **Web3Forms**, which relays the submission to the destination inbox.
There is no server and no data is stored by the site.

**The access key is the only thing to configure**, and it lives in exactly one place —
the hidden input at the top of the form in `index.html`:

```html
<input type="hidden" name="access_key" value="PASTE_WEB3FORMS_ACCESS_KEY_HERE" />
```

Until a real key is pasted there, `script.js` detects the placeholder and falls back to
opening a pre-filled email draft, so the button is never dead.

How it behaves once the key is set:

1. `script.js` intercepts submit and POSTs JSON to `api.web3forms.com`.
2. On success the visitor lands on `thank-you.html`.
3. On failure the form shows the phone number and email rather than losing the inquiry.
4. If JavaScript never loads, the plain HTML `POST` still works — the hidden
   `access_key`, `subject` and `redirect` inputs carry it.

**To change the destination inbox** (e.g. from the Gmail to a business address): request a
new key at <https://web3forms.com> against the new address and replace that one value.
Nothing else changes — no DNS, no SPF/DKIM, because Web3Forms sends *to* the address, not
*as* the domain. Note that the new address must already be able to *receive* mail (i.e. the
domain needs working MX records) before a key can be issued against it.

### At the custom-domain cutover

The hidden `redirect` input currently points at the `github.io` origin, because Web3Forms'
free plan requires the redirect to be on the same origin that served the form. When the
custom domain goes live, change it to
`https://www.culinary-revolutionary.com/thank-you.html`. This only affects visitors with
JavaScript disabled — the normal path redirects itself — but it will silently stop working
if it is missed.

## Regenerating the menus

`menus.html` and the homepage teaser cards are generated from `menus.json` rather than
hand-edited, so the chef's 240 dishes stay consistent between the two.

```bash
python3 build-menus.py menus.json
```

Edit `menus.json` and re-run, rather than editing `menus.html` directly — a hand edit is
lost the next time the generator runs. `build-menus.py` and `menus.json` are excluded from
the deployed artifact.

## Deployment

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy-pages.yml`. The
workflow stages only the shipping files into `_site/` — it does not upload the repo root.

Because publishing uses **GitHub Actions** (not branch-based publishing), the custom domain
is set in **Settings → Pages**, and any `CNAME` file in the repo is ignored. Do not rely on
a `CNAME` file to set the domain.

## Before launch — items needing the client's confirmation

These are unverified or assumed. None of them are safe to publish on a commercial site
without a yes from the chef.

**Claims presented as fact** (currently live in the About section and Career Highlights):
- Two James Beard nominations — category and year. James Beard records are public and
  searchable, so a wrong claim is trivially disproved.
- Experience at The French Laundry, Bensi, Mexican Radio, Amore Italiano, Big Sky.
- Formal training at Johnson & Wales University.
- 30+ years in professional kitchens; 30+ cooking competitions.

**Assumed, not stated** (inferred from the 239 area code — change in one place each):
- Service area: Naples, Fort Myers, Bonita Springs, Estero, Marco Island, Cape Coral.
  Appears in the `#service-area` section, the About fact list, the title/meta description,
  and the JSON-LD `areaServed`.
- `priceRange: "$$$"` in the JSON-LD.
- `addressLocality: "Naples"` in the JSON-LD.

**Missing, and worth adding** (both unblock higher-value bookings):
- Food-safety certification (ServSafe or Florida food handler) — not currently claimed.
- Liability insurance and whether a certificate can be issued to a venue. Corporate and
  wedding clients frequently cannot book without one.
- Any pricing floor at all ("dinners from $X per guest"). There is currently none.

**Menu questions raised by the source document** — see the chef-questions list handed over
with this build (duplicate "French toast" in Brunch, whether Bagels/Lox/Cream cheese are
one item or three, the Paella Valenciana 4–8 guest limit, and the per-course selection
rules for Brunch and Spanish Tapas).
