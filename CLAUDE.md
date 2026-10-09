# Harborview Law — pixel-perfect Webflow mirror on Astro (v2 migration)

This repo (`dispatchvault/harborviewlaw`) holds the **October 2026 v2 migration**:
a byte-faithful mirror of the live Webflow site (www.harborviewlaw.com), served
through Astro and hosted on **Vercel**. It replaces the August v1 clean rebuild
(preserved in git history before the v2 commit) per the user's decision: match
the existing site exactly first — animations, quirks, and known broken elements
included — then fix things in follow-up passes.

## Architecture

- `src/raw/**.html` — 82 captured pages, complete documents. Asset URLs are
  rewritten from `cdn.prod.website-files.com` / cloudfront / googleapis to
  self-hosted `/wf/...` paths. `integrity`/`crossorigin` attrs were stripped
  from rewritten asset tags (the SRI hashes no longer match rewritten bytes).
  `__404__.html` is the captured Webflow 404 page.
- `src/raw/_pages.json` — the page manifest driving the routes.
- `src/pages/[...slug].astro` — emits each raw page verbatim via `set:html`
  (captured doctype stripped; Astro re-adds it). Build output is byte-identical
  to the capture. NOTE: `getStaticPaths` is compiled into an isolated scope —
  it cannot see frontmatter variables; keep it self-contained.
- `src/pages/404.astro` — serves the captured 404 page.
- `public/wf/` — 455 self-hosted assets (compiled Webflow CSS, webflow.js
  chunks, jQuery, images incl. srcset variants, fonts, injected scripts).
- Webflow IX2 animations work because markup (`data-w-id`, `data-wf-page`,
  `data-wf-site`) and webflow.js are carried verbatim.
- The mirror script lives in the session scratchpad (`mirror2.py`); re-running
  it re-captures the live site (remember the SRI-strip step afterwards).

## Hosting

- **Vercel** (current target). Static output, zero-config; trailing-slash
  directory format matches Webflow's extensionless URLs.
- The old Netlify project (`harborviewlaw` in the Harborview-dedicated Netlify
  account, harborviewlaw.netlify.app) is still linked to this repo and will
  keep auto-building pushes until unlinked/deleted — superseded, ignore it.

## Known carried-over breakage (intentional — fix phase later)

See git history (`MIGRATION-AUDIT.md` in the v1 tree) for the full list from
August. Highlights still live on the site and therefore in this mirror:
template-polluted/doubled SEO titles, lorem-ipsum team bios + careers pages,
space-prefixed footer practice-area links (Webflow serves them; mirrored as
pages so they resolve here too), one dead Webflow plugin placeholder SVG (403s
on the live site as well), phone typo 971 vs 791 on the contact page.
- **Forms still POST to Webflow's API** (`webflow.com/api/.../form/...`) —
  they work while the client's Webflow subscription is active and must be
  replaced before Webflow is cancelled.
- Cookiebot is domain-keyed; the consent banner may behave differently off
  the production domain.

## House facts

- Brand: "Harborview Law" (no "u"); legal entity "Harbor View Law, P.C.".
- Correct phone: 949-791-7764.
- Client repos live in the `dispatchvault` GitHub account; Zincsolutions is a
  Write collaborator.
- Domain cutover last: Webflow stays live until the new build is approved.
