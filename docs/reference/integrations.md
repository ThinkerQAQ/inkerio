# Website integrations reference

Use this table to find the configuration and code for each website integration.

| Capability | Authoritative sources | Configuration / lifecycle |
| --- | --- | --- |
| Site routes and SEO | [`src/pages/`](../../src/pages/), [structured data](../../src/lib/structured-data.ts), [Astro config](../../astro.config.mjs) | Engine build, canonical metadata, RSS/sitemap |
| Pagefind full-text search | [index builder](../../scripts/build-pagefind.mjs), [search page](../../src/pages/search.astro) | Generated after Astro static build |
| Search engine submission | SyndiRelay, [deployment workflow](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/.github/workflows/deploy.yml) | IndexNow, Google Search Console, configured providers |
| AI Search | [Worker README](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/workers/blog-ai/README.md), SyndiRelay | `CLOUDFLARE_AI_SEARCH_*` variables and Worker release |
| Ask Blog (opt-in) | [AskBlogSession](../../src/components/AskBlogSession.astro), [BaseLayout](../../src/layouts/BaseLayout.astro) | `PUBLIC_ASK_BLOG_ENABLED=true` **and** `PUBLIC_ASK_BLOG_WORKER_URL` **and** `PUBLIC_ASK_BLOG_TURNSTILE_SITE_KEY`, plus server-side `ASK_BLOG_ENABLED=true` after Turnstile setup. Off by default; search indexing never implies public chat. |
| Umami | [BaseLayout](../../src/layouts/BaseLayout.astro), [content analytics](../../src/components/ContentAnalyticsRuntime.astro) | `PUBLIC_UMAMI_WEBSITE_ID`, `PUBLIC_UMAMI_PROXY_ORIGIN` |
| Comments | [ContentComments](../../src/components/ContentComments.astro) | utterances integration |
| Reactions | [ContentReaction](../../src/components/ContentReaction.astro), [Worker README](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/workers/blog-reactions/README.md) | `PUBLIC_REACTION_WORKER_URL`, D1/Worker setup |
| EdgeOne static delivery | [Deployment workflow](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/.github/workflows/deploy.yml) | Makers deploys static output |
| External article publishing | SyndiRelay | Local Bridge, configured per-platform adapters |


## Pluggable analytics and reactions

Both integrations are **optional, disabled without configuration** and owned by each site, not by Inkerio's default deployment. Define public, build-time settings in the site wrapper's `site.config.json`, under `integrations`. Never place secrets, Cloudflare bindings, cookie values or credentials in this public JSON.

```json
{
  "integrations": {
    "analytics": {
      "provider": "umami",
      "scriptSrc": "/u.js",
      "websiteId": "YOUR_PUBLIC_UMAMI_WEBSITE_ID",
      "collectorOrigin": "https://your-collector.example.com"
    },
    "reactions": {
      "provider": "http",
      "endpoint": "https://your-reactions.example.com",
      "apiPath": "/v1/reactions"
    }
  }
}
```

| Provider | Contract | Dependencies |
| --- | --- | --- |
| Analytics `none` | Disable tracker regardless of environment variables | None |
| Analytics `umami` | Load `scriptSrc` (by default `/u.js`) with Umami `data-website-id`, `data-domains`, `data-host-url`; tracker sends `POST /api/send` to collector origin | Umami instance and compatible browser script, own ID and collector |
| Analytics `script` | Inject only explicitly configured public script URL and optional `data-*` string attributes | Any owner-authorized analytics script, e.g. `{ "provider":"script", "scriptSrc":"https://stats.example.com/script.js", "attributes":{"data-site":"sample"} }` |
| Reactions `none` | Do not render reaction buttons or make API calls | None |
| Reactions `http` | Same JSON API for any compatible HTTPS backend | Owner-controlled API; Cloudflare D1 is optional |

When `integrations.analytics` or `integrations.reactions` is **omitted**, Inkerio supports the existing `PUBLIC_UMAMI_WEBSITE_ID`, `PUBLIC_UMAMI_PROXY_ORIGIN` and `PUBLIC_REACTION_WORKER_URL` deployment variables (legacy `auto` mode). Those environment values also override corresponding configured public IDs/origins for backward compatibility. Explicit `provider: "none"` always wins and disables that feature. Missing IDs or endpoints do **not** generate partially functional UI. `scriptSrc` may be a site-local path or HTTPS URL; analytics collector origins and reaction endpoints must be HTTPS. `apiPath` is a site-local pathname, never a remote URL.

### Reaction HTTP protocol (version 1)

The client sends `GET`, `PUT` or `DELETE` to `<endpoint><apiPath>?contentType=article&contentId=...`, with an origin header and `X-Reaction-Visitor` pseudonymous ID. The server responds with JSON `{ "count": 12, "reacted": true }`. `PUT` and `DELETE` **must be idempotent**. The browser blocks write actions until its initial `GET` succeeds; errors roll back optimistic updates. The supported `contentType` values are `article`, `note`, `fitness`, `life` and IDs are stable identifiers, not page titles. A custom HTTP provider must obey this wire contract, CORS and user-privacy rules; it need not use Cloudflare.

### Self-hostable reference backends

- [Cloudflare Umami Cloud collector](../../examples/cloudflare/umami-collector/README.md): a small, stateless `/api/send` and optional `/u.js` proxy, with origin/website allowlists, body limits and no AI/KV tracking logic.
- [Cloudflare D1 reactions](../../examples/cloudflare/reactions/README.md): `GET`/`PUT`/`DELETE /v1/reactions`, schema migrations, strict origin checks, HMAC-hashed visitor identifiers, optional binding-based rate limiting.

These examples use the engine's MIT license but **do not deploy automatically**. `wrangler.example.jsonc` is intentionally a placeholder: users create their own Worker, D1 database and secrets. Do not copy ThinkerQAQ's live Worker configuration or D1 IDs. The deployed ThinkerQAQ website continues using its existing, separately owned Worker implementations and public CI variables; there is **no data migration or endpoint change**. Check the hosting provider's licenses/terms and your site's privacy requirements.

```sh
npm run test:integrations
```

The Umami browser bundle is owned by the **site deployment wrapper**, e.g. `ThinkerQAQ.github.io/public/u.js`, and is copied into the generated Inkerio `public/` directory at deployment time. Generic Inkerio does not vendor a tracking script and **does not enable analytics without `PUBLIC_UMAMI_WEBSITE_ID` and `PUBLIC_UMAMI_PROXY_ORIGIN`**. Source: `https://cloud.umami.is/script.js` (retrieved 2026-10-11, SHA-256: `91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`); see the wrapper’s `public/u.js.LICENSE.txt`. The `PUBLIC_UMAMI_PROXY_ORIGIN` setting is the collector **origin** for `POST /api/send`. Serving `/u.js` locally improves tracker-script availability but does **not** make collection same-origin: with a `workers.dev` collector the browser still posts cross-origin. A real same-origin deployment requires an HTTP reverse proxy for `/api/send`; a static site host alone cannot forward POST requests. Alternatively, use a site-owned custom Worker domain after configuring DNS, TLS, Cloudflare ownership and CORS. Neither option is enabled by default. Run the wrapper’s Worker tests before a service migration; never change the collector to the static site origin without a working POST handler.

Check the actual site build/environment before describing an integration as active. The environment names supplied by CI are documented in [Deployment Reference](deployment.md); secrets must never be committed.

RSS feeds are Chinese `/rss.xml` and English `/en/rss.xml`. **The site owns feed policy** via `site.config.json` → `rss` (`maxItems`, `photoSince`, `workoutSince`, `timezone`, `minTrainingDays`, type switches and localized descriptions). The generic engine has no owner-specific dates; see [site features](site-features.md).
