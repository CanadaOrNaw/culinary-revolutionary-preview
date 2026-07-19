# DESIGN.md: Culinary Revolutionary Prototype

## Source
- URL: https://www.culinary-revolutionary.com/
- Capture date: 2026-07-19
- Evidence: Firecrawl branding/images/markdown, live desktop/mobile review, public Wix image assets, local browser captures
- Asset provenance: `ASSET-SOURCES.json`

## Reference Screenshot
- Original full-page capture: `public/assets/source-home-full.png`
- Redesigned captures: `preview/desktop-full-cdp.png`, `preview/mobile-full-cdp.png`

## Design Summary
An editorial private-chef presentation using deep navy, cream, restrained gold, large culinary photography, serif display headings, practical body copy, and clear inquiry actions. The redesign keeps the existing identity while correcting mobile overflow, weak hierarchy, inaccessible labels, and missing sample-menu flow.

## Design Tokens
### Colors
- Navy: `#0A1F44`
- Slate: `#4A5B78`
- Cream: `#F6F1E8`
- Gold: `#C7A35A`
- White: `#FFFFFF`

### Typography
- Existing observed fonts: Crave Fine headings, Minion Pro paragraphs.
- Prototype fallbacks: Cormorant Garamond/Georgia for display; Inter/system sans for body.
- Body text remains at readable mobile sizes; headings use fluid `clamp()` values.

### Spacing and Layout
- Container: 1100px maximum with 1rem mobile gutters.
- Section rhythm: 3–5rem vertical padding.
- Desktop: two-column service/menu grids and split About/Inquiry sections.
- Mobile: all content becomes one column with no horizontal overflow.
- Rounded cards, restrained shadows, visible focus rings.

## Components
- Sticky header and accessible mobile navigation.
- Image-led hero with two primary actions.
- Service cards with local source imagery.
- Customizable sample-menu cards with inquiry links.
- Career/proof section that does not fabricate testimonials or awards.
- Non-submitting concept inquiry form with explicit local-demo status.
- Tappable phone, email, and social links.

## Content Style
Personal, concrete, calm, and premium without repetitive luxury language. Claims are limited to statements already present on the source site; proof placeholders are labelled honestly.

## Agent Build Instructions
Keep the site dependency-free and static. Use only locally downloaded assets listed in `ASSET-SOURCES.json`. Do not activate form submission, analytics, hosting, or third-party services without owner approval. Confirm image/copy rights with the business owner before public launch.
