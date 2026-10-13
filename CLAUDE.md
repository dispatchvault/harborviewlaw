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
- `public/wf/` — self-hosted assets (compiled Webflow CSS, images incl.
  srcset variants, fonts, site scripts).
- **Interactions are native since Phase 5 (Oct 13, 2026): jQuery and the
  webflow.js chunks are gone** (2.4MB → ~39KB authored JS). The original IX2
  interaction config was extracted from the Webflow bundle into
  `scripts/ix2-config.cjs`; `scripts/build-native.mjs` compiles it (filtered
  to the data-w-id values actually present in src/raw + src/templates) and
  prepends it to `src/native/runtime.js`, producing the committed
  `public/wf/native.js`. Re-run `node scripts/build-native.mjs` after editing
  runtime.js or adding/removing `data-w-id` markup. The runtime plays scroll
  reveals (IntersectionObserver), hovers, and the hamburger morph with the
  original timings; it also implements the navbar collapse and the
  testimonial sliders natively. Lottie graphics use self-hosted
  `/wf/js/lottie_light.min.js` (lottie-web 5.12.2), lazy-injected only on
  pages with Lottie elements. The captured inline `opacity:0`/transform
  styles on `[data-w-id]` elements are still the animation initial states —
  don't strip them.
- A strict Content-Security-Policy ships in vercel.json (script-src 'self' +
  one hashed inline snippet + googletagmanager; frame-src only the Google
  Maps embed; font-src allows data: for the icon font in the compiled CSS).
  If you add an inline script or a third-party resource, update the CSP.
- Slugs renamed with permanent redirects (Oct 13, 2026): `/about-v1` →
  `/about`, `/free-consultaion` → `/free-consultation`.
- The mirror script lives in the session scratchpad (`mirror2.py`); it
  captured the ORIGINAL Webflow site. Re-running it now would capture this
  build; it's effectively retired.

## Hosting

- **LIVE on Vercel at https://www.harborviewlaw.com since Oct 12, 2026.**
  Project `harborviewlaw` (prj_wUjxU3HYvfYEbtOezwJIYRLkJ0Hr), team
  `jzaslaw-zincsolutions-projects`; www is the primary domain, apex 308s to
  www. GoDaddy DNS: `@` A → 216.150.1.1 (Vercel per-project IP), `www`
  CNAME → cname.vercel-dns.com. MX/TXT untouched (client email).
- Forms: /api/contact (Vercel function) + /wf/forms-bridge.js → Resend
  (from forms@dispatchvault.com) → jim@harborviewlaw.com. Env vars
  RESEND_API_KEY + CONTACT_TO on the Vercel project.
- Dispatch (dispatchvault.com) monitors this site: GitHub + Vercel webhooks,
  weekly crawl. After cutover, set Dispatch "Production URL" to
  https://www.harborviewlaw.com.
- Webflow is out of the serving path but the subscription stays active until
  its form/CMS data is exported — then cancel.
- The old Netlify project (`harborviewlaw` in the Harborview-dedicated Netlify
  account) still auto-builds pushes until deleted there — superseded, ignore.

## Publishing a blog post (Phase 4 workflow)

Add one markdown file to `src/content/news/` and push. Frontmatter:
`title`, `description`, `date` (YYYY-MM-DD), `category` (one of the five
slugs in src/content.config.ts), `readTime` ("4 min"), `image` (/wf/... path),
optional `summary` (card text), `seoTitle`, `ogImage`. The build generates:
the article page (through src/templates/article-shell.html, markup identical
to the captured Webflow pages), cards on the home rail, news index, its
category page, practice-page rails and article related-rails, plus
sitemap.xml and llms.txt entries. Footer year is stamped at build time.
Templates live in src/templates/ ({{TOKEN}} substitution; cards extracted
from the original Webflow dynamic lists). sitemap.xml and llms.txt are
build-time endpoints (src/pages/*.ts), no longer static files.

## Known carried-over breakage (intentional — fix phase later)

See git history (`MIGRATION-AUDIT.md` in the v1 tree) for the full list from
August. Nearly everything has since been fixed in the Phase 0-5 passes
(forms off Webflow's API, self-hosted consent, slug typos, doubled SEO
titles, dead card/share links, heading outline, button contrast: CTAs
render #d93e00 via site-overrides.css so white text passes AA while navy
sections keep brand #ff4900). Lighthouse: accessibility 100, SEO 100.
Still open: lorem-ipsum team bios (copy), and the homepage headshot PNG is
a 400px source upscaled to ~500px (flagged by best-practices; needs a
higher-res asset from the client).

## House facts

- Brand: "Harborview Law" (no "u"); legal entity "Harbor View Law, P.C.".
- Correct phone: 949-791-7764.
- Client repos live in the `dispatchvault` GitHub account; Zincsolutions is a
  Write collaborator.
- Domain cutover last: Webflow stays live until the new build is approved.
