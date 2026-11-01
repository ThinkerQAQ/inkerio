# Inkerio

[简体中文](README_ZH.md)

- [1. Introduction](#1-introduction)
- [2. Quick Start](#2-quick-start)
- [3. Configuration](#3-configuration)
- [4. Optional Features](#4-optional-features)
- [5. Development](#5-development)
- [6. License](#6-license)

## 1. Introduction

Inkerio is an Astro-based bilingual blog engine. It renders Markdown articles, notes, mind maps, projects and photography, with full-text search, RSS and sitemaps.

[Content Template](https://github.com/ThinkerQAQ/inkerio-content-template) provides the content structure, site configuration and GitHub Pages workflow. Create your blog from the template; the workflow fetches the engine automatically.

[Live website](https://thinkerqaq.com/) · [Deployment source](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io)

## 2. Quick Start

Use your GitHub account to publish your first article.

### 2.1. Create your blog repository

Open [Content Template](https://github.com/ThinkerQAQ/inkerio-content-template) and select **Use this template → Create a new repository**.

Choose your account as owner and name the repository `YOUR_USERNAME.github.io`, using your GitHub username in lowercase. For example, `alice` creates `alice.github.io`. Select **Public** when using GitHub Free, then click **Create repository**.

### 2.2. Configure your site

In your new repository, open `site.config.json`, select Edit, update these fields and commit to `main`:

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

In the blog repository you just created:

1. Remove example files from `articles/`, `notes/`, `note-translations/`, `series/`, `projects/`, `life/` and `workout-summaries/` under `src/content/`. Add an empty `.gitkeep` file to any empty directory to preserve its structure.
2. Remove demo images from `public/media/articles/sample-article/` and `public/media/life/sample-album/`.
3. Edit the titles, descriptions and body text in `src/content/pages/about.md` and `src/content/pages/en/about.md`; keep their frontmatter fields and language values.
4. Update both languages in `src/content/site/copyright.json`, replacing the sample author and removing example-policy notices.

Upload your own cover to `public/media/hello/cover.jpg`, then create `src/content/articles/hello.md`:

```markdown
---
title: "Hello Inkerio"
description: "My first post."
publishedAt: "2026-01-01T00:00:00Z"
language: zh
status: published
coverImage: "/media/hello/cover.jpg"
coverImageAlt: "My cover image"
---

Hello Inkerio!
```

Replace the date, body and cover description, then commit to `main`. Published articles require `coverImage` and `coverImageAlt`; image paths start with `/media/`, without `public`.

Do not keep `sample-*` filenames: the publication check blocks them even after editing their contents. See the template's [copyright notice](https://github.com/ThinkerQAQ/inkerio-content-template/blob/main/COPYRIGHT.md) for demo-material terms.

### 2.4. Deploy to GitHub Pages

1. In your blog repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
2. Open **Actions** and enable workflows if prompted.
3. Select **Deploy my Inkerio blog to GitHub Pages → Run workflow**, choose `main` and start a fresh deployment.
4. Wait for this run's build and deployment jobs to succeed.

### 2.5. Check the website

Open your site, for example `https://alice.github.io/`. Open Hello Inkerio and check its text and cover, then visit `/en/` to check the English home page.

### 2.6. Troubleshooting

| Problem | Action |
| --- | --- |
| Deployment reports demo content | Replace or remove every reported example path, including media, About pages and copyright settings; commit again |
| Configuration validation fails | Replace placeholders and ensure `url` matches your actual site address |
| No deployment run | Set the Pages source to GitHub Actions, then run the deployment workflow manually |

If the problem persists, [open an Issue](https://github.com/ThinkerQAQ/inkerio/issues) with the failing step, error message and engine commit. Remove credentials and private content from logs first.

## 3. Configuration

### 3.1. Site settings

Edit `site.config.json` in your blog repository and commit to `main` to apply changes.

| Field | Purpose |
| --- | --- |
| `title` | Site name |
| `author` | Author name |
| `url` | HTTPS site origin, for example `https://alice.github.io` |
| `description` | Chinese description |
| `descriptionEn` | English description |

### 3.2. Content directories

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

Edit Markdown or images in these directories and commit to `main` to publish. A public repository also exposes unpublished source files; keep private drafts and credentials outside it.

## 4. Optional Features

### 4.1. Case 1: Preview and build locally

Complete Quick Start first. Install Git, Node.js and npm; use the Node.js version in the [CI configuration](.github/workflows/ci.yml).

In your blog's `.github/workflows/deploy.yml`, find the `ref` under **Checkout pinned Inkerio engine**. Replace `ENGINE_COMMIT` below with that commit and `YOUR_USERNAME` with your GitHub username:

```bash
mkdir inkerio-workspace
cd inkerio-workspace
git clone https://github.com/ThinkerQAQ/inkerio.git
git clone https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git my-blog
cd inkerio
git checkout ENGINE_COMMIT
npm ci
node ../my-blog/scripts/check-publication.mjs
node ../my-blog/scripts/configure-site.mjs --engine .
node scripts/assemble-content.mjs --content-root ../my-blog
npx --no-install astro dev --port 4321
```

Open `http://localhost:4321`. After changing content, stop the preview with Ctrl+C, rerun assembly and start the preview again. Rerun configuration as well after changing site settings.

To build locally, stop the preview and run from the engine directory:

```bash
npm run check
npm run build
npm run preview
```

Open `http://localhost:4321` to inspect the build. Use the assembly command above for your content; `npm run dev:quick` loads the demo template.

Local diagram rendering needs additional dependencies: Java and Graphviz for PlantUML, browser libraries for Mermaid. See the template's [deployment workflow](https://github.com/ThinkerQAQ/inkerio-content-template/blob/main/.github/workflows/deploy.yml) for setup; GitHub Actions already provides them.

### 4.2. Case 2: Use a custom domain

Set `site.config.json` → `url` to your HTTPS domain. Configure **Settings → Pages → Custom domain** and DNS following [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Commit the configuration and deploy again.

### 4.3. Case 3: Use CLI or MCP

Complete [4.1](#41-case-1-preview-and-build-locally), stop the preview with Ctrl+C, then run from the engine directory:

```bash
npm run tools:build
node .inkerio-tools/cli.js status
node .inkerio-tools/cli.js validate --content-root /absolute/path/to/my-blog
```

Replace `/absolute/path/to/my-blog` with the absolute path to your local blog repository.

The CLI also supports `assemble`, `check`, `build`, `diagrams`, `routes` and `preview`. Run `node .inkerio-tools/cli.js --help` for arguments. Run configuration and content assembly before building; `preview` serves an existing build.

For an MCP client, set the command to `node`, pass the absolute path to `.inkerio-tools/mcp.js` as its argument, and set `INKERIO_CONTENT_ROOT` to your blog checkout. File-writing tools additionally require `INKERIO_MCP_ALLOW_MUTATIONS=1`.

### 4.4. Case 4: Distribute articles

To publish on other platforms, follow the [SyndiRelay README](https://github.com/ThinkerQAQ/syndirelay) and point it at the same blog content repository.

## 5. Development

Install the Node.js and diagram prerequisites from [CI](.github/workflows/ci.yml), then run in a new development directory:

```bash
git clone https://github.com/ThinkerQAQ/inkerio.git
cd inkerio
npm ci
npm run assemble:template
npm run test:engine
npm run check
npm run build:template
```

`assemble:template` clones the public template if missing. Keep this checkout separate from your own blog preview.

The template workflow pins an engine commit. To upgrade an existing blog, update its engine `ref` in `.github/workflows/deploy.yml` to a validated commit and check the resulting build.

## 6. License

Original engine code uses [MIT](LICENSE). User writing, photography, template examples and third-party dependencies have their own licenses; see [third-party notices](THIRD_PARTY_NOTICES.md).
