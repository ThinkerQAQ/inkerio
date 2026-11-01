# Inkerio

[简体中文](README_ZH.md)

- [1. Introduction](#1-introduction)
- [2. Quick Start](#2-quick-start)
- [3. Usage](#3-usage)
- [4. Troubleshooting](#4-troubleshooting)
- [5. Development](#5-development)
- [6. License](#6-license)

## 1. Introduction

Inkerio is an Astro-based bilingual blog engine. It renders Markdown articles, notes, mind maps, projects and photography, with full-text search, RSS and sitemaps.

[Content Template](https://github.com/ThinkerQAQ/inkerio-content-template) provides the content structure, site configuration and GitHub Pages workflow. Create your blog from the template; the workflow fetches the engine automatically.

[Live website](https://thinkerqaq.com/) · [Deployment source](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io)

## 2. Quick Start

### 2.1. Create your blog repository

Open [Content Template](https://github.com/ThinkerQAQ/inkerio-content-template) and select **Use this template → Create a new repository**.

Choose your account as owner and name the repository `YOUR_USERNAME.github.io`, using your GitHub username in lowercase. For example, `alice` creates `alice.github.io`. Select **Public** when using GitHub Free.

This repository holds your content, images, configuration and deployment workflow.

### 2.2. Configure your site

Edit `site.config.json` in your new repository:

```json
{
  "title": "Alice's Blog",
  "author": "Alice",
  "url": "https://alice.github.io",
  "description": "我的个人博客，记录技术与生活。",
  "descriptionEn": "My personal blog about technology and life."
}
```

Replace the example identity and address with your own. The build rejects unchanged author and URL placeholders.

### 2.3. Replace the example content

Replace or remove bundled examples and add your own content in the same structure:

| Path in your blog repository | Content |
| --- | --- |
| `src/content/articles/` | Articles |
| `src/content/notes/`, `src/content/note-translations/` | Notes and translations |
| `src/content/series/` | Article series |
| `src/content/projects/` | Projects |
| `src/content/life/` | Photography and life posts |
| `src/content/workout-summaries/` | Workout summaries |
| `src/content/pages/about.md`, `src/content/pages/en/about.md` | About pages |
| `public/media/` | Images and other media |
| `src/content/site/copyright.json` | Bilingual copyright policy |

Use a sample Markdown file as a format reference, preserving required frontmatter when writing your own. Update both About pages and the copyright policy. Replace or remove fictional workout records and sample photos.

The workflow runs `node scripts/check-publication.mjs` before deployment. It blocks bundled demo content and reports the remaining paths. These examples are licensed for local preview; see the template's [copyright notice](https://github.com/ThinkerQAQ/inkerio-content-template/blob/main/COPYRIGHT.md).

### 2.4. Deploy to GitHub Pages

1. In your blog repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
2. Commit your configuration and content changes to `main`.
3. Open **Actions → Deploy my Inkerio blog to GitHub Pages**. If no run appears, select **Run workflow**.
4. Wait for both build and deployment jobs to succeed.

The workflow installs dependencies, checks configuration and content, builds the site and deploys it using GitHub's built-in permissions.

Visit **https://YOUR_USERNAME.github.io/**. Verify the home page, an article, its images and the English home page at `/en/`.

## 3. Usage

### 3.1. Update content

Edit Markdown or images in your blog repository and commit to `main`. The workflow rebuilds and publishes the site.

A public repository also exposes unpublished source files. Keep private drafts and credentials outside it.

### 3.2. Preview locally

Install Git, Node.js **22.12+** and npm. Clone the engine and your blog as sibling directories:

```bash
mkdir inkerio-workspace
cd inkerio-workspace
git clone https://github.com/ThinkerQAQ/inkerio.git
git clone https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git my-blog
cd inkerio
npm ci
node ../my-blog/scripts/configure-site.mjs --engine .
node scripts/assemble-content.mjs --content-root ../my-blog
npx --no-install astro dev --port 4321
```

Open http://localhost:4321. After changing content, rerun the assembly command; after changing site settings, rerun configuration as well.

To build locally, stop the preview and run from the engine directory:

```bash
npm run check
npm run build
npm run preview
```

Open http://localhost:4321 to inspect the production build. Diagram rendering may require Java, Graphviz and browser libraries; the template deployment workflow installs these on CI.

### 3.3. Use a custom domain

Set `site.config.json` → `url` to your HTTPS domain. Configure **Settings → Pages → Custom domain** and DNS following [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Commit the configuration and deploy again.

### 3.4. Use CLI or MCP

From the engine directory:

```bash
npm run tools:build
node .inkerio-tools/cli.js status
node .inkerio-tools/cli.js validate --content-root /absolute/path/to/my-blog
```

The CLI also supports `assemble`, `check`, `build`, `diagrams`, `routes` and `preview`. Run `node .inkerio-tools/cli.js --help` for arguments. Run configuration and content assembly before building; `preview` serves an existing build.

For an MCP client, set the command to `node`, pass the absolute path to `.inkerio-tools/mcp.js` as its argument, and set `INKERIO_CONTENT_ROOT` to your blog checkout. File-writing tools additionally require `INKERIO_MCP_ALLOW_MUTATIONS=1`.

### 3.5. Optional integrations

Analytics, reactions and comments are optional. To distribute articles to other platforms, [SyndiRelay](https://github.com/ThinkerQAQ/syndirelay) reads the same content repository.

The [live deployment repository](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io) demonstrates separate content, Workers and GitHub Pages/EdgeOne deployment. Start with the content template for a single-repository setup.

## 4. Troubleshooting

| Problem | Action |
| --- | --- |
| Deployment reports demo content | Replace or remove every reported example path, including media, About pages and copyright settings; commit again |
| Configuration validation fails | Replace placeholders and ensure `url` matches your actual site address |
| No deployment run | Set the Pages source to GitHub Actions, then run the deployment workflow manually |
| Preview shows sample content | Configure your blog and assemble it with `--content-root ../my-blog`; `npm run dev:quick` loads the demo template |
| Content changes do not appear locally | Rerun assembly and restart the preview |
| Local diagram rendering fails | Install the prerequisites used by the template's deployment workflow; CI provides the configured build environment |

## 5. Development

From the engine directory:

```bash
npm ci
npm run assemble:template
npm run test:engine
npm run check
npm run build:template
```

`build:template` builds the public examples for engine verification. Production deployment uses the publication check in your blog repository.

The template workflow pins an engine commit. To upgrade an existing blog, update its engine `ref` in `.github/workflows/deploy.yml` to a validated commit and check the resulting build.

## 6. License

Original engine code uses [MIT](LICENSE). User writing, photography, template examples and third-party dependencies have their own licenses; see [third-party notices](THIRD_PARTY_NOTICES.md).
