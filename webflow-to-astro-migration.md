# Webflow → Astro/Netlify Migration Playbook

House process for migrating a client website out of Webflow into a hand-coded Astro build on
Netlify. Distilled from the Mercury Partners rebuild (Aug 2026) and the WeAreZinc cleanup.
Share this file with Claude Code at kickoff along with the inputs below.

---

## What to hand Claude at kickoff

- **Webflow site name** (Claude finds the site_id via the Webflow MCP connection — works even
  when the published site and .webflow.io staging are password-protected)
- **Published URL** if live, and whether it stays live during the build
- **Any separate content package** (client docs, reference HTML, copy decks) — say explicitly
  which source wins for *content* and which wins for *look and feel*
- **GitHub repo** — client projects live in the `dispatchvault` GitHub account; create the empty
  repo first and add `Zincsolutions` as a collaborator with Write access (Claude accepts the
  invite via API and pushes)
- **Hosting** — Netlify site connected to the repo, branch deploys enabled (needed for client
  review links)
- **Up-front decisions**: interactive/link color, font licensing carry-over, form destination
  inbox, domain cutover timing

---

## Phase 1 — Extract the design system (before writing any code)

Password-protected Webflow sites are not a blocker. Two extraction routes that always work:

1. **Webflow MCP data tools**: `list_sites` → site_id, then fonts, pages, variables, and full
   element trees per page (`data_element_tool > get_all_elements`, depth -1). Component trees
   (navbar/footer) via `scope_component_id`.
2. **Public CDN**: the compiled stylesheet and all assets are unauthenticated at
   `cdn.prod.website-files.com/<site_id>/`. Pull the CSS and grep out the real values.

Produce a **token inventory** before building: colors (watch for *hijacked variables* — Webflow
builds often override a token to an unrelated value; rebuild the palette with honest names),
type scale per breakpoint, spacing scale, radius, borders, button specs, and which `<em>`/accent
patterns are signature moves. Download **fonts** (self-host; licensing carries over from the
client's existing self-hosted files) and **all imagery** (never hotlink `website-files.com` —
those URLs die with the Webflow subscription). Downscale oversized images (`sips
--resampleWidth 1600`).

Publish the extracted system as a **client style guide** (Claude artifact) before building —
it's the look-and-feel contract for the whole project. The house format lives in the Mercury
repo at `tools/style-guide/` (self-contained HTML with embedded fonts): duplicate it, swap the
tokens/fonts/logos, rewrite the content sections, keep the section structure.

## Phase 2 — Content inventory & audit

Extract every page's text from the element trees (headlines with their `<em>` markup, ledes,
cards, FAQs, form fields). Then write an **audit list** of what should NOT carry forward —
typical finds: placeholder phone numbers, Relume/template placeholder logos and pages, dead
footer links (`linkType: none`), copy typos, missing meta/OG. Fix these in the new build; never
port them.

## Phase 3 — Build (house standard)

- **Astro, static output, Netlify adapter.** React islands only where interactivity demands it
  (usually just the contact form, `client:visible`).
- **One CSS token block** in `src/styles/global.css` — every color/space/type value resolves
  through it. This is non-negotiable: it's what makes client palette variants a 20-line branch
  instead of a rebuild.
- Components carry their own light/dark (`on-navy`) scheme variants from day one.
- Fonts via `@font-face` from `public/fonts/`; images local in `public/images/`.
- Contact form → Astro server endpoint (`prerender = false`) → Resend
  (`RESEND_API_KEY`, `CONTACT_TO` env vars in Netlify; graceful 503 + direct-email fallback
  until configured).
- Per-page meta titles/descriptions, OG image, `@astrojs/sitemap` + `robots.txt`.
- Pin the framework in config from the first commit (a missing framework preset once shipped a
  "successful" deploy that served raw files — every page 404).

## Phase 4 — Webflow-code cleanup audit

Run against **both the source and the built output** (the build can pull things source greps
miss, and vice versa):

```bash
# 1. Webflow signatures in source
grep -rniE "webflow|data-wf|data-w-id|w--current|wf-form|website-files|jquery|ix2|finsweet|fs-attributes" src/ public/

# 2. Build, then same grep on the output
npm run build && grep -rliE "webflow|website-files|data-wf|jquery" dist/

# 3. Every external URL the shipped site references (should be ~none)
grep -rhoE "https?://[a-z0-9.-]+\.[a-z]+" dist/ --include="*.html" --include="*.css" --include="*.js" | sort | uniq -c | sort -rn
```

A from-scratch rebuild (the house standard) will be clean. A site that began as a **Webflow
export** will not be — and its pieces are interdependent. Removal rules, in order:

1. Any `website-files.com` asset URL gets downloaded and self-hosted **first** — it's a ticking
   dependency on the client's Webflow subscription.
2. `webflow.js`/jQuery come out only **after** the interactions they power (nav toggle,
   sliders, accordions, tabs) are rebuilt in plain code.
3. `w-` classes come out only **together with** their CSS — markup and stylesheet in the same
   commit, page by page, with a visual check per page.

Deleting in any other order is how sites break (the WeAreZinc lesson).

## Phase 5 — Verify & deploy

- Local `npm run build` clean; full-page screenshots of every page at desktop + mobile widths
  (headless Chrome) compared against the original site.
- Push to the dispatchvault repo; Netlify builds `main` to the primary URL.
- If bot protection ever blocks `curl` checks of the live site, verify deploys via GitHub
  commit statuses instead: `gh api repos/<org>/<repo>/commits/main/status`.
- **Domain cutover last**: keep Webflow live until the new site is approved; export any Webflow
  CMS/form data; then point DNS at Netlify, confirm SSL, and only then cancel Webflow.

## Client review model

One branch per client-facing variant (`client-palette`, copy experiments, layout options) —
Netlify branch deploys give each a stable URL that updates in place as you iterate. Client
compares live clickable sites, not comps. Merge the winner to `main`; keep the loser's branch
as archive. Note: check deploy protection/password settings before sending links to a client.

---

*Reference implementation: `dispatchvault/mercurypartners` (Astro build on `astro/main`,
palette variant on `astro/client-palette`), local checkout at
`/Users/jimini/Projects/mercury-partners`. At kickoff, tell Claude to copy the scaffold from
there — Astro/Netlify config, token-block CSS architecture, components, contact endpoint — and
to duplicate `tools/style-guide/` for the new client's style guide.*
