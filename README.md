# Inkerio

[简体中文](README_ZH.md) · [Create a blog](https://github.com/ThinkerQAQ/inkerio-content-template) · [Live website](https://thinkerqaq.com/) · [Real deployment repository](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io) · [MIT License](LICENSE)

**Inkerio** is an open-source bilingual blog engine built on Astro. It supports Markdown articles, notes and interactive mind maps, projects, photography, RSS, sitemaps and full-text search. The engine is independent of your content and your deployment provider.

The goal is simple: **create a GitHub repository and publish your own blog at `username.github.io`, without copying or modifying engine source.** The public [Content Template](https://github.com/ThinkerQAQ/inkerio-content-template) includes the minimal configuration and GitHub Pages workflow.

## Quick Start — from zero to a public website

### 1. Create your own repository

Open [inkerio-content-template](https://github.com/ThinkerQAQ/inkerio-content-template) and choose **Use this template → Create a new repository**. Name it `YOUR_USERNAME.github.io` (lowercase GitHub username) and make it **Public** if you use GitHub Free.

This **one repository** contains your Markdown, media, copyright policy, personal configuration and deployment workflow. You do not need to fork Inkerio or create a separate deployment repository.

### 2. Set your site identity

In the new repository, edit `site.config.json`:

```json
{
  "title": "Alice's Blog",
  "author": "Alice",
  "url": "https://alice.github.io",
  "description": "我的个人博客，记录技术与生活。",
  "descriptionEn": "My personal blog about technology and life."
}
```

Replace `alice` with your GitHub username. The build rejects unedited placeholders. Update the About pages and `src/content/site/copyright.json` before publishing: sample articles and photographs do not automatically belong to you.

### 3. Enable GitHub Pages

In your repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. Commit the configuration to `main` and open **Actions**; if needed, manually run **Deploy my Inkerio blog to GitHub Pages**.

The included workflow checks out a **pinned Inkerio commit**, validates and assembles your content, generates the static site, and deploys it with GitHub's Pages Actions. No custom CI secret or API key is required.

### 4. Verify your site

Visit **https://YOUR_USERNAME.github.io/**. Check the home page, articles, images and `/en/`. The source repository is public on GitHub Free, so do not commit personal secrets or confidential drafts.

For the full command-by-command setup and troubleshooting instructions, see the **README in your newly created repository**; there is no separate documentation site to install.

### 5. Local preview (optional)

Git, Node.js **22.12+** and npm are required. Clone your own content and the engine as siblings:

```bash
mkdir inkerio-workspace && cd inkerio-workspace
git clone https://github.com/ThinkerQAQ/inkerio.git
git clone https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git my-blog
cd inkerio
npm ci
node ../my-blog/scripts/configure-site.mjs --engine .
node scripts/assemble-content.mjs --content-root ../my-blog
npx --no-install astro dev --port 4321
```

Open http://localhost:4321. This uses **your** content; `npm run dev:quick` intentionally loads demonstration content instead. To build a deployable site locally, run `npm run check` and `npm run build` after content assembly.

## Engine CLI and MCP (optional)

The engine is also usable independently of GitHub Pages. After `npm ci`, run `npm run tools:build`, then use `node .inkerio-tools/cli.js status`, `validate --content-root /absolute/path/to/blog`, `build`, or `preview --port 4321` as needed. MCP clients can start the local stdio adapter with `node /absolute/path/to/inkerio/.inkerio-tools/mcp.js`. `INKERIO_CONTENT_ROOT` selects the permitted content checkout; file-writing MCP tools additionally require `INKERIO_MCP_ALLOW_MUTATIONS=1`. These interfaces are local development tools, not third-party publishing services.

## Optional customization and integrations

A custom domain is configured through GitHub Pages settings and the `url` field in your content repository. Analytics and reactions are optional integrations, not requirements for blogging. If you later want to distribute articles to other platforms, [SyndiRelay](https://github.com/ThinkerQAQ/syndirelay) can read the **same** content repository without changing the Inkerio build.

**Live example:** [thinkerqaq.com](https://thinkerqaq.com/) runs on Inkerio. Its [ThinkerQAQ.github.io repository](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io) shows a more advanced production architecture with separate content, a site wrapper, optional Workers, and GitHub Pages/EdgeOne deployment. It is a **reference implementation**, not the starter template. New users should start with the single-repository Content Template.

**License:** Inkerio's original engine source is [MIT](LICENSE). Personal writing, photographs, content-template examples and third-party dependencies have separate rights; see [third-party notices](THIRD_PARTY_NOTICES.md). Production sites should pin a validated engine commit, not track a mutable branch without verification.
