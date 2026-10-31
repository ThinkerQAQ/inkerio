# Repository boundaries / 仓库边界

## Ownership

- `ThinkerQAQ/inkerio` — Astro engine, content schema, assembly, static build, local search, RSS, Sitemap.
- `ThinkerQAQ/inkerio-content-template` — public fictional content fixtures and media.
- `ThinkerQAQ/blog-content` — real content and photography, private.
- `ThinkerQAQ/ThinkerQAQ.github.io` — production site configuration, domain verification, CI/CD and credentials.
- BlogCTL — independent cross-platform publishing product, temporarily remains in the original monorepo.

## Build inputs and outputs

The build accepts **engine version**, **content version** (`src/content/`, optional `public/media/` and `src/data/content-manifest.json`) and **site.config.json** (domain, author, optional integrations). It generates `dist/`: static HTML, RSS, Sitemap, assets and Pagefind search. Generated content is untracked and copied from a read-only content source.

## Migration stages

1. **Extract without cutover.** Independently build Inkerio using public template content; do not fetch private data in public CI.
2. **Move identity to deployment config.** Own website assets, domains, registration, analytics and cloud configuration in `ThinkerQAQ.github.io`. Pin an engine version.
3. **Compare output using a fixed private content SHA.** In an authorized private workflow compare old vs new route inventory, canonical/hreflang, feeds, media paths and representative article rendering. Fail on unexplained differences.
4. **Switch production with rollback.** The wrapper checks out Inkerio and private content, overlays site settings, builds and deploys. Retain the previous commit/workflow until smoke tests pass.
5. **Extract BlogCTL separately.** Relocate its CLI, MCP, extensions and publishing compiler; eliminate hardcoded Astro/Node renderer paths. Do not combine this with production cutover.

The current extraction is not the active production deployment. Future changes to content schema must be tested against the content template and documented with compatibility requirements.

## 中文结论

先独立构建公开演示站点，再对照私人文章的构建结果，最后切换生产部署。旧站点暂时不动；BlogCTL 与 Inkerio 解耦后再单独迁移仓库，避免三套工作同时修改。
