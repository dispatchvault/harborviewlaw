# Harborview Law — Webflow → Astro/Netlify migration

Client site rebuild following the house playbook in `webflow-to-astro-migration.md`.
Reference implementation: Mercury Partners at `/Users/jimini/Projects/mercury-partners`
(repo `dispatchvault/mercurypartners`). This repo: `Zincsolutions/harborviewlaw`.

**Brand spelling**: the firm renders as "Harborview Law" (one word, no "u") on the
live site; the legal entity in the footer is "Harbor View Law, P.C.". Follow the
site's usage. Old site: www.harborviewlaw.com (Webflow, stays live until cutover).

## Current state

Full rebuild complete from the live Webflow site (extracted via public CDN Aug 2026 —
the site is in the client's Webflow account, not Zinc's workspace). See
`MIGRATION-AUDIT.md` for what was broken on the old site and what was dropped/fixed.

- 34 static pages: home, about, profile (Jim Grass), concierge-legal-solutions,
  practice-areas + 6 detail pages, news index + 14 articles + 5 category pages,
  contact-us, free-consultation, 3 policy pages, 404.
- Content collections (`src/content/`): `news` (markdown, the scaling target),
  `practice-areas` (structured frontmatter), `policies`.
- Old-site slugs preserved; legacy/broken URLs 301 in `public/_redirects`.
- Fonts: Geologica + Open Sans via @fontsource-variable (self-hosted).
- Tokens in `src/styles/global.css` `:root` — navy #011640, orange #ff4900,
  royal #2e34d2, linkwater #eef3fc. Orange filled uppercase buttons.
- Contact endpoint (`src/pages/api/contact.ts`) wired for Resend; needs
  `RESEND_API_KEY` + `CONTACT_TO` env vars in Netlify. Both forms (contact +
  free-consultation with area select) post to it.

## Adding blog posts (the point of this migration)

Drop a markdown file in `src/content/news/` with frontmatter:
`title, description, date, category, image` (category = one of the slugs in
`NEWS_CATEGORIES` in `src/data/site.ts`; image under `public/images/`).
Category pages, the index, related-article rails, and the sitemap update on build.

## House rules

- Astro static output + Netlify adapter; React islands only where needed (forms).
- Every color/space/type value resolves through the `:root` token block. No exceptions.
- Self-host all fonts and images — never hotlink `website-files.com`.
- Per-page meta title/description; live-site titles kept verbatim where clean.
- Pin the framework in Netlify config from the first commit.

## Confirmed decisions (Aug 26, 2026)

- Phone is **949-791-7764** site-wide (971 on the old contact page was the typo).
- Brand is "Harborview Law" — no "u" — confirmed by the user.
- Repo destination: `dispatchvault/harborviewlaw` (transfer from Zincsolutions
  pending user acceptance; Zincsolutions stays a Write collaborator per playbook).
- Form sender: `forms@dispatchvault.com` (verified domain in the Zinc Resend
  account) → delivers to `CONTACT_TO`.

## Open items

- User: accept GitHub repo transfer to dispatchvault; install Netlify GitHub App
  on dispatchvault; import the repo as a Netlify project; enable branch deploys.
- User: create Resend API key (sending_access, domain dispatchvault.com) and set
  Netlify env vars `RESEND_API_KEY` + `CONTACT_TO=info@harborviewlaw.com`.
- Domain cutover last: update `PUBLIC_SITE_URL` + robots.txt sitemap URL then.
