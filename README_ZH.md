# Inkerio

[English](README.md)

- [1. 简介](#1-简介)
- [2. Quick Start](#2-quick-start)
- [3. 使用](#3-使用)
- [4. 常见问题](#4-常见问题)
- [5. 开发](#5-开发)
- [6. 许可证](#6-许可证)

## 1. 简介

Inkerio 是基于 Astro 的双语博客引擎，支持 Markdown 文章、笔记、思维导图、项目和摄影，以及全文搜索、RSS 和站点地图。

[内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)提供内容目录、网站配置和 GitHub Pages 工作流。使用模板创建自己的博客仓库，工作流会自动拉取引擎并构建网站。

[线上示例](https://thinkerqaq.com/) · [部署源码](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io)

## 2. Quick Start

### 2.1. 创建博客仓库

打开[内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)，点击 **Use this template → Create a new repository**。

Owner 选择自己的账号，仓库名填写 `YOUR_USERNAME.github.io`，用户名使用小写。例如账号为 `alice`，仓库名就是 `alice.github.io`。使用 GitHub Free 时选择 **Public**。

以后文章、图片、网站配置和部署工作流都在这个仓库中维护。

### 2.2. 配置网站

编辑新仓库根目录的 `site.config.json`：

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

替换或删除模板中的示例，按原有目录结构添加自己的内容：

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

可以参考示例 Markdown 的格式编写自己的内容，保留必需的 frontmatter 字段。同时修改两份 About 和版权配置，替换或删除虚构运动记录、演示照片。

部署前会执行 `node scripts/check-publication.mjs`，拦截残留示例并列出文件路径。示例素材仅供本地预览，详见模板的[版权说明](https://github.com/ThinkerQAQ/inkerio-content-template/blob/main/COPYRIGHT.md)。

### 2.4. 部署 GitHub Pages

1. 在自己的博客仓库打开 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**。
2. 将配置与内容修改提交到 `main`。
3. 打开 **Actions → Deploy my Inkerio blog to GitHub Pages**。如果没有运行记录，点击 **Run workflow**。
4. 等待构建和部署任务均成功。

工作流会安装依赖、检查配置与内容、构建网站，并使用 GitHub 内置权限完成部署。

访问 **https://YOUR_USERNAME.github.io/**，检查首页、文章、图片和 `/en/` 英文首页。

## 3. 使用

### 3.1. 更新内容

在博客仓库修改 Markdown 或图片，提交到 `main` 后，工作流会重新构建并发布。

公开仓库中的未发布源文件也可以被他人查看。私人草稿和密钥应保存在仓库之外。

### 3.2. 本地预览

准备 Git、Node.js **22.12+** 和 npm。将引擎与自己的博客克隆到同一个父目录：

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

打开 http://localhost:4321。修改内容后重新执行装配命令；修改网站配置后，还需要重新执行配置命令。

需要本地构建时，停止预览，在引擎目录执行：

```bash
npm run check
npm run build
npm run preview
```

打开 http://localhost:4321 检查构建结果。图表渲染可能需要 Java、Graphviz 和浏览器依赖，模板部署工作流会在 CI 中安装这些依赖。

### 3.3. 绑定独立域名

将 `site.config.json` 的 `url` 改为自己的 HTTPS 域名，在 **Settings → Pages → Custom domain** 中配置域名，并按照 [GitHub 自定义域名指南](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site)设置 DNS。提交配置并重新部署。

### 3.4. CLI 与 MCP

在引擎目录执行：

```bash
npm run tools:build
node .inkerio-tools/cli.js status
node .inkerio-tools/cli.js validate --content-root /absolute/path/to/my-blog
```

CLI 还支持 `assemble`、`check`、`build`、`diagrams`、`routes` 和 `preview`，参数见 `node .inkerio-tools/cli.js --help`。构建前先完成配置和内容装配，`preview` 用于查看已有构建结果。

MCP 客户端的启动命令设为 `node`，参数填写 `.inkerio-tools/mcp.js` 的绝对路径，并通过 `INKERIO_CONTENT_ROOT` 指定博客仓库。需要使用文件写入工具时，再设置 `INKERIO_MCP_ALLOW_MUTATIONS=1`。

### 3.5. 可选集成

访问统计、点赞和评论按需接入。需要将文章分发到其他平台时，[SyndiRelay](https://github.com/ThinkerQAQ/syndirelay)可以直接读取同一份内容仓库。

[实际部署仓库](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io)展示了独立内容仓库、Worker 和 GitHub Pages/EdgeOne 部署方式。初次使用可以从单仓库内容模板开始。

## 4. 常见问题

| 问题 | 处理方式 |
| --- | --- |
| 部署提示存在示例内容 | 按报错路径替换或删除全部示例，包括媒体、About 和版权配置，然后重新提交 |
| 网站配置校验失败 | 替换占位符，核对 `url` 与实际网站地址 |
| 没有部署任务 | 将 Pages 发布源设为 GitHub Actions，手动运行部署工作流 |
| 本地看到的还是示例内容 | 配置自己的站点并通过 `--content-root ../my-blog` 装配；`npm run dev:quick` 加载的是演示模板 |
| 本地修改没有生效 | 重新装配内容并重启预览 |
| 本地图表渲染失败 | 参考模板部署工作流安装对应依赖；CI 已配置构建环境 |

## 5. 开发

在引擎目录执行：

```bash
npm ci
npm run assemble:template
npm run test:engine
npm run check
npm run build:template
```

`build:template` 使用公开示例验证引擎。正式部署由自己的博客仓库执行发布前检查。

模板工作流固定了引擎提交。升级已有博客时，修改 `.github/workflows/deploy.yml` 中的引擎 `ref`，指向已验证的提交，并检查构建结果。

## 6. 许可证

原创引擎代码采用 [MIT](LICENSE)。用户文章、摄影、模板示例及第三方依赖适用各自的许可，详见[第三方说明](THIRD_PARTY_NOTICES.md)。
