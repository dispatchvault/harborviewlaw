# Harborview Law — migration audit (Phase 2)

What was found on the live Webflow site (www.harborviewlaw.com, template
"Sterling and Elysium") and how the rebuild handles it. Extracted Aug 26, 2026
via the public CDN (site not in the Zinc Webflow workspace).

## Broken/junk that was NOT carried forward

- **Template pollution in SEO titles**: every news article's `<title>` ended with
  "-Sterling and Elysium - Webflow HTML website template". Practice-area pages had
  *doubled* titles (two title strings concatenated). Rebuilt titles keep the
  intended keyword-bearing segment verbatim and drop the junk.
- **Fake team**: 7 of 8 attorney bios (`/our-team/*`) were template demo people with
  lorem-ipsum bios (Benjamin Hayes, Ethan Carter, Grace Morgan, Matthew Collins,
  Olivia Mitchell, Rebecca Foster, Sophie Anderson). Only **Jim Grass** is real —
  now at `/profile`. Old bio URLs 301 → `/profile`.
- **Lorem-ipsum careers pages** (`/careers/*`, "London • Full-time") — dropped, 301 → `/about`.
- **Hidden fake review block** on the homepage ("John Doe, Corporate Client,
  5/5 Stars", dated in the future) — an SEO schema hack. Dropped entirely.
- **Template cruft live + indexed**: `/old-home`, `/home/home-v1`, `/home/home-v3`,
  three About variants, `/components/*`, `/utility-pages/*` (style guide, licenses,
  changelog, instructions), `/starter-page`, login/signup/account pages. All 301'd.
- **Broken footer links**: six practice-area links had a leading space in the URL
  (`/practice-area/ corporate-law`) — every one 404'd on the live site. Fixed.
- **Typo slug** `/free-consultaion` → now `/free-consultation` with 301.
- **Phone inconsistency**: contact page showed +1 (949) **971**-7764; footer, FAQ,
  and Jim's profile show +1 (949) **791**-7764. Rebuild uses 791 everywhere —
  ⚠ confirm with client.
- **Missing meta**: articles had no meta descriptions or og:image. Descriptions now
  come from CMS summaries (or the first paragraph); og:image per article.
- Testimonial had "Property Managment" typo on the about page — fixed. Jim Zaslaw
  appears as "CEO" on most pages and "President" on one — standardized to CEO.
- jQuery, webflow.js, Cookiebot, webfont.js — none carried; the build output greps
  clean for webflow|website-files|jquery.

## Carried forward (slugs preserved verbatim for SEO)

- `/`, `/concierge-legal-solutions`, `/practice-areas`, `/practice-area/<6 slugs>`,
  `/news-and-insight`, `/news/<14 slugs>` (incl. one article missing from the
  sitemap), `/news-category/<5 slugs>`, `/contact-us`, `/policy/<3 slugs>`.
- Page `<title>` kept verbatim wherever it was clean (home, contact, free
  consultation, concierge, practice areas index, news index, policies).
- `/about-v1` → `/about` (301); the old about title was pure template junk.
- The empty `/news-category/legal-consultation` 301s to the news index.

## Open items for the client

1. Confirm phone number (791 vs 971).
2. Confirm form destination inbox (`CONTACT_TO`) + set `RESEND_API_KEY` in Netlify.
3. The live site loaded Cookiebot; rebuild ships no tracking, so no consent banner
   is included. If analytics get added, revisit.
4. Newsletter signup on the news index was not carried (no backing service found) —
   add if wanted.
5. Domain: production domain and cutover timing (staging: harborviewlaw.netlify.app).
