# Harborview Law

Marketing site for [Harborview Law](https://harborviewlaw.com) — outside general
counsel in Newport Beach, CA. Astro static build deployed on Netlify.

- **Staging**: https://harborview-law.netlify.app
- **Stack**: Astro (static output) · Netlify · Netlify Forms · self-hosted fonts
- **Content**: markdown collections in `src/content/` (news, practice areas, policies)
- Built by [ZINC](https://www.wearezinc.com); hosted under Dispatch Vault.

## Develop

```bash
npm install
npm run dev
```

## Add a blog post

Drop a markdown file in `src/content/news/` with frontmatter
(`title`, `description`, `date`, `category`, `image`) — see existing posts for
the pattern. Category pages, the news index, related-article rails, and the
sitemap all regenerate on build.

See `CLAUDE.md` for project conventions and `MIGRATION-AUDIT.md` for the
Webflow migration record.
