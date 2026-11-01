# Inkerio

[English](README.md)

- [1. Introduction](#1-introduction)
- [2. Quick Start](#2-quick-start)
- [3. Configuration](#3-configuration)
- [4. Optional Features](#4-optional-features)
- [5. Development](#5-development)
- [6. License](#6-license)

## 1. Introduction

Inkerio 是基于 Astro 的双语博客引擎，支持 Markdown 文章、笔记、思维导图、项目和摄影，以及全文搜索、RSS 和站点地图。

[内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)提供内容目录、网站配置和 GitHub Pages 工作流。使用模板创建自己的博客仓库，工作流会自动拉取引擎并构建网站。

[线上示例](https://thinkerqaq.com/) · [部署源码](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io)

## 2. Quick Start

准备一个 GitHub 账号，按以下步骤发布第一篇文章。

### 2.1. 创建博客仓库

打开[内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)，点击 **Use this template → Create a new repository**。

Owner 选择自己的账号，仓库名填写 `YOUR_USERNAME.github.io`，用户名使用小写。例如账号为 `alice`，仓库名就是 `alice.github.io`。使用 GitHub Free 时选择 **Public**，然后点击 **Create repository**。

### 2.2. 配置网站

在新仓库中打开 `site.config.json`，点击编辑，修改以下字段并提交到 `main`：

```json
{
  "title": "Alice 的博客",
  "author": "Alice",
  "url": "https://alice.github.io",
  "description": "我的个人博客，记录技术与生活。",
  "descriptionEn": "My personal blog about technology and life."
}
```

将示例身份和网址替换为自己的信息。作者和网址仍保留占位符时，构建会报错。

### 2.3. 替换示例内容

在刚创建的博客仓库中完成以下操作：

1. 删除 `articles/`、`notes/`、`note-translations/`、`series/`、`projects/`、`life/`、`workout-summaries/` 中的示例文件，路径均位于 `src/content/` 下。空目录添加一个空的 `.gitkeep` 文件，保留目录结构。
2. 删除 `public/media/articles/sample-article/` 和 `public/media/life/sample-album/` 中的演示图片。
3. 修改 `src/content/pages/about.md` 和 `src/content/pages/en/about.md` 的标题、简介和正文；保留 frontmatter 中的字段及语言值。
4. 修改 `src/content/site/copyright.json` 中的中英文版权文字，替换示例作者，并删除示例提示。

上传自己的封面到 `public/media/hello/cover.jpg`，然后创建 `src/content/articles/hello.md`：

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

替换示例日期、正文和封面说明，再提交到 `main`。已发布文章必须包含 `coverImage` 和 `coverImageAlt`；图片路径从 `/media/` 开始，不包含 `public`。

不要保留 `sample-*` 文件名：即使改了正文，发布检查仍会拦截。演示素材的使用范围见模板的[版权说明](https://github.com/ThinkerQAQ/inkerio-content-template/blob/main/COPYRIGHT.md)。

### 2.4. 部署 GitHub Pages

1. 在自己的博客仓库打开 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**。
2. 打开 **Actions**；如果提示启用工作流，先按提示启用。
3. 选择 **Deploy my Inkerio blog to GitHub Pages → Run workflow**，分支选 `main`，运行一次完整部署。
4. 等待这次运行的构建和部署任务均成功。

### 2.5. 检查网站

访问自己的站点，例如 `https://alice.github.io/`。打开刚发布的 Hello Inkerio，确认正文和封面正常，再打开 `/en/` 检查英文首页。

### 2.6. 常见问题

| 问题 | 处理方式 |
| --- | --- |
| 部署提示存在示例内容 | 按报错路径替换或删除全部示例，包括媒体、About 和版权配置，然后重新提交 |
| 网站配置校验失败 | 替换占位符，核对 `url` 与实际网站地址 |
| 没有部署任务 | 将 Pages 发布源设为 GitHub Actions，手动运行部署工作流 |

如果仍无法解决，请[提交 Issue](https://github.com/ThinkerQAQ/inkerio/issues)，附上运行失败的步骤、错误信息，以及使用的引擎提交。请先去除日志中的密钥和私人内容。

## 3. Configuration

### 3.1. 网站配置

在自己的博客仓库中编辑 `site.config.json`，提交到 `main` 后生效。

| 字段 | 用途 |
| --- | --- |
| `title` | 网站名称 |
| `author` | 作者名称 |
| `url` | 网站的 HTTPS 根地址，例如 `https://alice.github.io` |
| `description` | 中文简介 |
| `descriptionEn` | 英文简介 |

### 3.2. 内容目录

| 博客仓库中的路径 | 内容 |
| --- | --- |
| `src/content/articles/` | 文章 |
| `src/content/notes/`、`src/content/note-translations/` | 笔记及译文 |
| `src/content/series/` | 文章系列 |
| `src/content/projects/` | 项目 |
| `src/content/life/` | 摄影与生活记录 |
| `src/content/workout-summaries/` | 运动月报 |
| `src/content/pages/about.md`、`src/content/pages/en/about.md` | 中英文 About 页面 |
| `public/media/` | 图片等媒体 |
| `src/content/site/copyright.json` | 中英文版权声明 |

在这些目录中修改 Markdown 或图片，提交到 `main` 后自动发布。公开仓库中的未发布源文件也可以被他人查看，私人草稿和密钥应保存在仓库之外。

## 4. Optional Features

### 4.1. Case 1：本地预览与构建

先完成 Quick Start。准备 Git、Node.js 和 npm，Node.js 版本见 [CI 配置](.github/workflows/ci.yml)。

从自己的博客仓库 `.github/workflows/deploy.yml` 中，找到 **Checkout pinned Inkerio engine** 的 `ref`。将下面的 `ENGINE_COMMIT` 替换为该提交，`YOUR_USERNAME` 替换为自己的 GitHub 用户名：

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

打开 `http://localhost:4321`。修改内容后，先按 Ctrl+C 停止预览，重新执行装配命令，再启动预览。修改网站配置后，还需要重新执行配置命令。

需要本地构建时，停止预览，在引擎目录执行：

```bash
npm run check
npm run build
npm run preview
```

打开 `http://localhost:4321` 检查构建结果。自己的文章应使用上面的装配命令；`npm run dev:quick` 加载的是演示模板。

添加图表后，本地渲染还需要相应依赖：PlantUML 使用 Java 和 Graphviz，Mermaid 使用浏览器运行库。安装步骤可参考模板的[部署工作流](https://github.com/ThinkerQAQ/inkerio-content-template/blob/main/.github/workflows/deploy.yml)；GitHub Actions 已配置这些依赖。

### 4.2. Case 2：绑定独立域名

将 `site.config.json` 的 `url` 改为自己的 HTTPS 域名，在 **Settings → Pages → Custom domain** 中配置域名，并按照 [GitHub 自定义域名指南](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site)设置 DNS。提交配置并重新部署。

### 4.3. Case 3：通过 CLI 或 MCP 操作引擎

先完成 [4.1](#41-case-1本地预览与构建)，按 Ctrl+C 停止预览，再在引擎目录执行：

```bash
npm run tools:build
node .inkerio-tools/cli.js status
node .inkerio-tools/cli.js validate --content-root /absolute/path/to/my-blog
```

将 `/absolute/path/to/my-blog` 替换为本机博客仓库的绝对路径。

CLI 还支持 `assemble`、`check`、`build`、`diagrams`、`routes` 和 `preview`，参数见 `node .inkerio-tools/cli.js --help`。构建前先完成配置和内容装配，`preview` 用于查看已有构建结果。

MCP 客户端的启动命令设为 `node`，参数填写 `.inkerio-tools/mcp.js` 的绝对路径，并通过 `INKERIO_CONTENT_ROOT` 指定博客仓库。需要使用文件写入工具时，再设置 `INKERIO_MCP_ALLOW_MUTATIONS=1`。

### 4.4. Case 4：分发文章

需要将文章发布到其他平台时，按 [SyndiRelay](https://github.com/ThinkerQAQ/syndirelay) 的 README 配置，并指定同一份博客内容仓库。

## 5. Development

准备与 [CI](.github/workflows/ci.yml) 一致的 Node.js 和图表依赖，在新的开发目录执行：

```bash
git clone https://github.com/ThinkerQAQ/inkerio.git
cd inkerio
npm ci
npm run assemble:template
npm run test:engine
npm run check
npm run build:template
```

`assemble:template` 会自动克隆缺失的公开模板。开发目录与自己的博客预览目录分开。

模板工作流固定了引擎提交。升级已有博客时，修改 `.github/workflows/deploy.yml` 中的引擎 `ref`，指向已验证的提交，并检查构建结果。

## 6. License

原创引擎代码采用 [MIT](LICENSE)。用户文章、摄影、模板示例及第三方依赖适用各自的许可，详见[第三方说明](THIRD_PARTY_NOTICES.md)。
