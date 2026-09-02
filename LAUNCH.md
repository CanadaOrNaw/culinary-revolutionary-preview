# Launch state — culinary-revolutionary.com

Working notes for the Wix → GitHub Pages cutover and the business-email setup.
Everything here was verified live on 2026-09-02 unless marked otherwise.

---

## 1. Where things are

| | |
|---|---|
| Repo | `CanadaOrNaw/culinary-revolutionary-preview` |
| Deployment branch | `main` (PR #1 merged 2026-09-02) |
| GitHub Pages site | https://canadaornaw.github.io/culinary-revolutionary-preview/ — serving `main` |
| Live client site | https://www.culinary-revolutionary.com — still the old Wix site |
| Registrar | Wix.com Ltd (IANA 3817) |
| Nameservers | `ns4.wixdns.net`, `ns5.wixdns.net` |

The `github-pages` environment is restricted to deployments from `main`.

---

## 2. Done

- `menus.html` — all 7 menus, 240 dishes, generated from `menus.json` by
  `build-menus.py`. Never hand-edit `menus.html`.
- Inquiry form POSTs to Web3Forms; works without JS; falls back to phone on
  failure; honeypot; menu preselect via `?menu=<id>`.
- Service-area + dietary sections, LocalBusiness JSON-LD, `robots.txt`,
  `sitemap.xml`, canonical + absolute `og:image`.
- Accessibility: gold-on-cream contrast was 2.1:1 → added `--gold-ink` (4.7:1);
  focus ring likewise; closed mobile nav no longer keyboard-reachable; skip link
  no longer painted under the sticky header; `scroll-padding-top` for anchors.
- Deploy workflow stages only shipping files into `_site/`. Previously
  `path: .` published `README.md`, `DESIGN.md` and `ASSET-SOURCES.json` — which
  document how the client's own imagery was captured — to the live domain.
  Artifact went 2.5 MB → 688 KB.
- PR #1 is merged and the resulting `main` deployment completed successfully on
  2026-09-02.
- Geo claims grounded: the invented Naples/Fort Myers/Bonita/Estero/Marco
  Island/Cape Coral list is gone, replaced with "South Florida's Gulf Coast",
  which the chef's public Airbnb listing supports.

## 3. Not done

- **Web3Forms access key.** `index.html` still has
  `value="PASTE_WEB3FORMS_ACCESS_KEY_HERE"`. Until it is set, the form falls
  back to an explicitly labelled mailto draft.
- **Business mailbox.** Not created. See §6 for what was ruled out.
- **Domain transfer.** The registrar and authoritative nameservers are still Wix;
  no completed transfer is visible publicly.
- **Custom-domain cutover.** DNS still serves the old Wix site.

---

## 4. DNS

Current values, verified against `ns4.wixdns.net`. **This is the rollback set —
save it before changing anything.**

```
@    A      185.230.63.107
@    A      185.230.63.171
@    A      185.230.63.186
www  CNAME  cdn3.wixdns.net
```

Target, for GitHub Pages:

```
@    A      185.199.108.153
@    A      185.199.109.153
@    A      185.199.110.153
@    A      185.199.111.153
www  CNAME  canadaornaw.github.io
```

Optional AAAA: `2606:50c0:8000::153` … `:8003::153`.

The zone has **no MX, no TXT, no CAA records**, and DNSSEC is off. So the
"changed DNS and killed their email" failure mode does not exist here, nothing
blocks certificate issuance, and there is no re-signing hazard.

Delete **all three** old A records. One survivor means ~1 in 5 apex visitors
lands on the old Wix site at random.

If a CAA record is ever added later it must include `letsencrypt.org`, or
GitHub's cert renewal silently fails and the site goes HTTPS-dead ~90 days on.

---

## 5. Cutover order

The order is load-bearing.

1. Lower TTLs to 300, wait an hour *(optional; turns an hour-long rollback into
   five minutes)*
2. Paste the Web3Forms key
3. Confirm the latest `main` Pages workflow is green
4. Settings → Pages → custom domain `www.culinary-revolutionary.com`.
   **A red DNS error here is expected — leave it.**
5. Repoint the `www` CNAME, delete the three Wix A records, add GitHub's four
6. `dig @ns4.wixdns.net culinary-revolutionary.com A +short` — expect only the
   GitHub set. Re-check after 10 min to confirm Wix did not revert.
7. Reload Settings → Pages; error should clear. If not: remove the domain, save,
   wait 60s, re-enter it. That re-triggers the check and the cert request.
8. Wait for the certificate, then tick **Enforce HTTPS**
9. Update the form's no-JS `redirect` input to the real domain
10. Send a real test inquiry from a phone; confirm it arrived
11. Leave the Wix site published 24–48h as rollback

**GitHub documents "up to 24 hours" before Enforce HTTPS becomes available.**
Usually 15–60 min, but Wix serves a valid cert today, so a slow issuance means a
browser security warning on a live business domain. Do not promise same-day
HTTPS.

Do **not** disconnect or unpublish the Wix site during this — that is what makes
Wix reset the records.

`ops/verify-domain.sh` runs the read-only checks. It changes nothing.

---

## 6. Dead ends — do not re-litigate

| Path | Why it failed |
|---|---|
| **Cloudflare Email Routing + Gmail "Send as"** | Google is removing Send-as for third-party addresses. Q3–Q4 2026 is a restriction window; full removal Jan 2027. Forwarding survives; *sending as* `chef@` does not — which is the entire point. |
| **Wix → Cloudflare Registrar** | Cloudflare requires its own nameservers *before* a transfer starts, and Wix does not allow NS changes on domains it registers (their help centre files it as an open feature request). Documented route is Wix → intermediate registrar → 60-day ICANN lock → Cloudflare. |
| **Cloudflare Pages hosting** | Same root cause — needs the apex on Cloudflare nameservers. Unavailable until after a transfer. |
| **Zoho Mail** | Signup rejected: *"This domain is not allowed to add in Zoho."* Likely their new-domain/abuse heuristic — the domain is 71 days old and hyphenated. Support ticket only. |
| **Namecheap API** | Not eligible: requires $50+ balance, 20+ domains, **or** $50+ purchases in 2 years. So transfer and DNS stay manual unless the balance is funded. |
| **Google Workspace** | Works fine, rejected on cost (~$84/yr). |
| **Namecheap Private Email "Expand"** | $41.88/yr for 3 mailboxes — wrong tier, only 1 is needed. |

### Still viable for email

**Namecheap Private Email "Launch"** — $14.88/yr, 1 mailbox, 5 GB, first month
free. Same vendor as the intended registrar, so it auto-wires MX once the domain
is in-account.

Records (both MX are priority 10, so Wix's missing priority field is a non-issue):

```
MX   @   mx1.privateemail.com
MX   @   mx2.privateemail.com
TXT  @   v=spf1 include:spf.privateemail.com ~all
```

IMAP `mail.privateemail.com:993` SSL · SMTP `:465` SSL.
DKIM is generated in the Private Email dashboard afterwards. Watch the key
length — Wix's TXT field caps at 255 chars and truncates a 2048-bit value
without erroring, which makes DKIM silently never verify.

**Sequencing note:** keying the form against `chef@` puts the mailbox on the
critical path. Keying it against a temporary inbox lets the site go live now and
makes the later swap a two-minute edit of one value. Cutting DNS over with *no*
key is the one thing to avoid — the Wix form that is live today works, so that
would move the client backwards on lead capture.

---

## 7. Client confirmation that would strengthen the site

The biography claims are **not a launch blocker**. They appear on the client's live
Wix `/about-me` page and were re-verified there on 2026-09-02: Johnson & Wales,
The French Laundry, Bensi, Mexican Radio, Amore Italiano, Big Sky, 30+ years,
30+ competitions, and two James Beard nominations. The redesign is carrying
forward client-published claims rather than inventing them.

They have not been independently credential-checked. Category and year for the
James Beard nominations, dates/roles for the named kitchens, and the Johnson &
Wales program would make the copy more credible when the chef supplies them.

**Also outstanding:** destination inbox, a pricing floor, food-safety
certification, liability insurance, and the 17 menu ambiguities in
`CLIENT-QUESTIONS.md`.

---

## 8. Decisions still open

1. Go live today via one manual Wix DNS edit, or wait ~5 days for the transfer
   and do the cutover once at the new registrar?
2. Web3Forms key against a temporary inbox now, or hold for `chef@`?
