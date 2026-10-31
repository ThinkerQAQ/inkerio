# Deploy Inkerio from a site-specific repository

**Inkerio is the engine, not the deployment repository.** Its own CI builds only the public content template. The previous ThinkerQAQ production workflow remains in the [legacy site repository](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/.github/workflows/) until a separate validated cutover.

## Deployment inputs

A deployment wrapper such as `YOUR_USER.github.io` should select:

1. A fixed Inkerio release/tag or commit.
2. A fixed commit in your content repository (`src/content/`, optional media and manifest).
3. Your `site.config.json` and site-owned public assets.
4. Repository-scoped credentials for Pages, EdgeOne or other destinations.

The content repository can be private. Use a dedicated read-only deploy key or other least-privilege access; **do not grant that key to a public engine build**.

## Build sequence

1. Checkout Inkerio into `engine/` and the content repository into `content/`.
2. Copy your website configuration to `engine/site.config.json` and overlay site-specific public assets.
3. In `engine/`, run `npm ci`.
4. Run `node scripts/assemble-content.mjs --content-root ../content`.
5. Run `npm run check` and `npm run build`.
6. Publish only `engine/dist/` using GitHub Pages or another static host.

For Pages, configure **Settings → Pages → Source → GitHub Actions** and use the standard `actions/upload-pages-artifact` / `actions/deploy-pages` workflow with appropriate `pages: write` and `id-token: write` permissions. The engine's validation workflow intentionally does not deploy.

## Production migration

Do **not** switch an existing production site just because the public template builds. In an authorized private CI job, pin the same content SHA and build both old and new engines. Compare URLs, canonical/hreflang, sitemap, RSS, structured data, photos, search and representative content. Keep the old deployment commit as rollback until the new site passes end-to-end checks.

See [architecture and cutover stages](../architecture/repository-boundaries.md) and [site configuration](customize-site.md).
