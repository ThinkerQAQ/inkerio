# Inkerio

[简体中文](README_ZH.md) · [Content template](https://github.com/ThinkerQAQ/inkerio-content-template) · [Repository boundaries](docs/architecture/repository-boundaries.md) · [Source Releases](https://github.com/ThinkerQAQ/inkerio/releases) · [MIT License](LICENSE)

**Inkerio** is a bilingual static blog engine built with Astro. It renders articles, notes and mind maps, projects, series, photography, RSS, sitemaps, incremental sitemap inventory and full-text search from a separately owned content repository.

**Status:** The standalone engine powers the production [ThinkerQAQ website](https://thinkerqaq.com/).

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
| [**SyndiRelay**](https://github.com/ThinkerQAQ/syndirelay) (public source, independent) | Optional article syndication, CLI, MCP, Bridge and browser extension; not required by Inkerio |
| **Deployment wrapper** | Domain, branding, `site.config.json`, verification files, CI secrets and Pages/EdgeOne deployment |

See [site behavior options](docs/reference/site-features.md) for homepage categories, note taxonomy, RSS, and legacy redirects.

The checked-in [site.config.json](site.config.json) holds **generic demonstration settings** including `descriptionEn` for English SEO. Site owners replace it at build time rather than editing reusable engine source. Comments and analytics are optional.

## Source releases

Download versioned **engine source** from [Inkerio Releases](https://github.com/ThinkerQAQ/inkerio/releases).
The refreshed standalone source-release line starts at `inkerio-v2.1.0`.
The GitHub ZIP/TAR contains reusable source, not an installer or a deployed personal website.
Install Node.js/npm and assemble the [public content template](https://github.com/ThinkerQAQ/inkerio-content-template)
or your own repository. [SyndiRelay](https://github.com/ThinkerQAQ/syndirelay)
is an optional, separately maintained public-source distribution project;
it is neither bundled with Inkerio nor required for rendering.

Production deployments should pin a validated **commit SHA**, not follow a
moving release or branch reference. Real writing, photographs and live
Workers remain in their respective repositories.

## Development

Run `npm run test:engine`, `npm run check` and `npm run build:template`. Rendering diagrams can require Java, Graphviz, fonts and Chromium depending on content. See [documentation](docs/index.md) and [migration plan](docs/architecture/repository-boundaries.md).

Original engine code is [MIT](LICENSE). Third-party code and sample/real content have their own license terms; see [third-party notices](THIRD_PARTY_NOTICES.md).

## CLI and MCP (no browser extension)

Inkerio includes a local Node.js CLI and an MCP **stdio** adapter. Both reuse existing engine scripts; they do not publish to third-party content platforms and do not require BlogCTL, Go, a browser extension or browser cookies.

```bash
npm ci
npm run tools:build
node .inkerio-tools/cli.js status
node .inkerio-tools/cli.js validate --content-root /absolute/path/to/content
node .inkerio-tools/cli.js build
node .inkerio-tools/cli.js preview --port 4321
```

Configure an MCP client to execute `node /absolute/path/to/inkerio/.inkerio-tools/mcp.js` after `npm run tools:build`. Set `INKERIO_CONTENT_ROOT` to an **absolute path** for `validate_content` and `assemble_content`. Read-only tools are `site_status`, `validate_content`, `inspect_routes` and preview status. To opt into file-writing actions (`assemble_content`, `build_site`, `render_diagrams`, preview start), set `INKERIO_MCP_ALLOW_MUTATIONS=1` in your **local MCP server environment**. This is not a remote deployment API; CI publishing and secrets stay separate. The MCP will not execute arbitrary shell commands or touch content outside the configured checkout.

The MCP uses Node.js + TypeScript and the official MCP SDK. It runs on Windows, macOS and Linux wherever the engine's Node dependencies are supported. Standalone Go binaries and a browser extension are neither required nor bundled.
