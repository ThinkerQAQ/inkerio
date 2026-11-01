# Repository boundaries / 仓库边界

## Ownership

- `ThinkerQAQ/inkerio` — reusable Astro engine, schemas, content assembly, static builds, Pagefind, RSS and sitemap.
- `ThinkerQAQ/inkerio-content-template` — public fictional content and media fixtures.
- Content repository — owner-specific articles, photos, About text, translations and content copyright policy; may be private.
- `ThinkerQAQ/ThinkerQAQ.github.io` — example production wrapper: personal site config, verification files, GitHub Pages/EdgeOne CI and Workers.
- SyndiRelay (independent private repository) — optional off-site publishing and CI search integration. Inkerio does not import it.

## Inputs and outputs

The engine consumes a **pinned engine version**, a separately managed **content version**, and `site.config.json` (domain, site title, author, multilingual descriptions and optional integrations). The assembly process writes ignored `src/content/`, optional `public/media/` and manifest; a static build writes `dist/` with HTML, RSS, sitemap, assets and Pagefind.

## Deployment / 部署

The migration has completed: the production ThinkerQAQ wrapper pins Inkerio and uses distinct read-only credentials for private content and optional private SyndiRelay search tasks. Website identity and private credentials belong to the wrapper, **not to the engine**. Public engine CI uses only the demonstration template and never checks out private owner content.

升级引擎时，先使用公开模板完成 CI，再以固定的私人内容 SHA 验证路由、canonical/hreflang、RSS、sitemap、摄影与搜索；最后由站点仓库更新引擎提交并部署。不得把个人域名、密钥或文章复制回通用引擎。
