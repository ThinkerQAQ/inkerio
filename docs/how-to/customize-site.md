# Customize a site without forking the engine

Inkerio ships with **fictional demo configuration** in [site.config.json](../../site.config.json). Your deployment repository should own its real identity, domain, integrations and static verification files. Keep upstream Inkerio source generic.

## Identity and canonical URLs

Prepare a site-specific `site.config.json` and copy it to the Inkerio engine root **at build time**. Fields include:

| Field | Purpose |
| --- | --- |
| `title`, `homeTitle`, `homeTitleEn` | Site title and localized homepage titles |
| `description`, `author`, `authorProfilePath` | SEO description and author identity |
| `url` | HTTPS canonical origin, used by Astro and structured data |
| `github`, `profiles`, `repository` | Public identity links and repository |
| `contactEmail` | Optional contact address |
| `icpRecord`, `publicSecurityRecord` | Optional local registration records (empty by default) |
| `commentsRepository` | Optional utterances GitHub repository (empty disables comments) |

Both [Astro configuration](../../astro.config.mjs) and [site identity module](../../src/config/site.ts) read this JSON. There is no need to edit original engine files for routine site identity changes.

Some generic labels in [localization configuration](../../src/config/i18n.ts) are still source-owned; use a fork or propose upstream localization improvements when changing structural UI copy.

## Content and images

- Keep your About pages, articles, notes, projects, photos and copyright policy in the separate content repository.
- Assemble using `node scripts/assemble-content.mjs --content-root ../your-content`.
- The authoritative bilingual content policy is `src/content/site/copyright.json` inside your content source.
- Inject your own icons, site verification files and image assets from the deployment wrapper. Inkerio defaults are generic demonstration graphics.

## Optional features

- Comments: set `commentsRepository`; Inkerio skips utterances markup when it is empty.
- Analytics: supply `PUBLIC_UMAMI_WEBSITE_ID` and, if needed, `PUBLIC_UMAMI_PROXY_ORIGIN`. The site's integration may require its own `public/u.js`, which is **not** included in the reusable engine.
- Reactions: `PUBLIC_REACTION_WORKER_URL` requires your own service.
- AI assistant: optional external Worker; the reusable engine does not deploy or distribute one.

Publishing articles to other platforms belongs to [BlogCTL](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/tools/blogctl), not to the engine. Its URL/canonical settings are separate from this site's `site.config.json`.

## Verify

Assemble your own content, run `npm run check` and `npm run build`, then inspect `dist/` for canonical domains, language links, RSS, sitemap, About, footer, verification files and optional integrations. Do not commit content or credentials back into Inkerio. See [deployment](deploy.md).
