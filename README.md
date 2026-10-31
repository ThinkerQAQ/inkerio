# Inkerio

[简体中文](README_ZH.md) · [Content template](https://github.com/ThinkerQAQ/inkerio-content-template) · [Repository boundaries](docs/architecture/repository-boundaries.md) · [MIT License](LICENSE)

**Inkerio** is a bilingual static blog engine built with Astro. It renders articles, notes and mind maps, projects, series, photography, RSS, sitemaps and full-text search from a separately owned content repository.

**Status:** Independent engine extraction under validation. The existing [ThinkerQAQ website](https://thinkerqaq.com/) still uses its original production deployment workflow.

## Quick start

Requires Node.js 22.12+, npm and Git. **No Go or BlogCTL installation is required.**

```bash
git clone https://github.com/ThinkerQAQ/inkerio.git
cd inkerio
npm ci
npm run dev:quick
```

Open http://localhost:4321. The demonstration content comes from [inkerio-content-template](https://github.com/ThinkerQAQ/inkerio-content-template), cloned into a sibling directory.

For a complete static build, run `npm run build:template` followed by `npm run preview`. To build using another content repository:

```bash
node scripts/assemble-content.mjs --content-root ../your-content-repo
npm run check
npm run build
```

The content repository must provide `src/content/`; it may include `public/media/` and `src/data/content-manifest.json`. Assembly copies these to ignored generated folders and never modifies source content.

## Repository ownership

| Repository | Responsibilities |
| --- | --- |
| **Inkerio** (here) | Astro pages, schema, Markdown/diagram rendering, content assembly and static-site build |
| **inkerio-content-template** | Fictional/sample articles, photographs and policy |
| **Your content repository** | Real writing, photos, About page and content copyright policy; can be private |
| **[BlogCTL](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/tools/blogctl)** | Companion publishing app: CLI, platform adapters, MCP, Bridge, browser extension; retained in the legacy repo for now |
| **Deployment wrapper** | Domain, branding, `site.config.json`, verification files, CI secrets and Pages/EdgeOne deployment |

The checked-in [site.config.json](site.config.json) holds **generic demonstration settings**. Site owners replace it at build time rather than editing reusable engine source. Comments and analytics are optional.

## Development

Run `npm run test:engine`, `npm run check` and `npm run build:template`. Rendering diagrams can require Java, Graphviz, fonts and Chromium depending on content. See [documentation](docs/index.md) and [migration plan](docs/architecture/repository-boundaries.md).

Original engine code is [MIT](LICENSE). Third-party code and sample/real content have their own license terms; see [third-party notices](THIRD_PARTY_NOTICES.md).
