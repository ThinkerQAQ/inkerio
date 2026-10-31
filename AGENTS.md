# Inkerio repository instructions

- This is the reusable Astro **engine**; no personal content, credentials, cookies, cloud keys or site-specific registration data belong here.
- Use public `inkerio-content-template` in CI, never private `blog-content`.
- Never add a dependency on the BlogCTL Go module or on the old personal website deployment workflow.
- Treat `site.config.json` as generic demo defaults; deployments override it without committing private site configuration.
- Before merging: `npm run test:engine`, `npm run check`, `npm run build:template`.
- Use PRs, squash merge and delete merged branches; keep bilingual documentation and license notices accurate.
