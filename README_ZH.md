# Inkerio

[English](README.md) · [创建自己的博客](https://github.com/ThinkerQAQ/inkerio-content-template) · [线上示例](https://thinkerqaq.com/) · [实际部署代码](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io) · [MIT 许可证](LICENSE)

**Inkerio 是一个基于 Astro 的开源双语博客引擎。** 它支持 Markdown 文章、笔记与交互式思维导图、项目、摄影、RSS、站点地图及全文搜索。引擎只负责内容装配与渲染，不与某个人的博客数据、域名或部署平台绑定。

我们希望解决的是一个具体的问题：**如何让一个没有接触过 Inkerio 的程序员，从零创建并上线自己的 `username.github.io` 博客？** 现在通过[公开内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)即可完成，不需要复制引擎或研究作者自己的部署仓库。

## Quick Start：从零创建并上线个人博客

### 1. 创建博客仓库

打开 [inkerio-content-template](https://github.com/ThinkerQAQ/inkerio-content-template)，点击 **Use this template → Create a new repository**。

将仓库命名为 `YOUR_USERNAME.github.io`，`YOUR_USERNAME` 替换为自己的 GitHub 用户名（小写）。使用 GitHub Free 的话，仓库需要选择 **Public**。

**普通用户只需要这一个仓库。** 内容、图片、网站配置和 GitHub Pages 工作流都放在其中；Inkerio 作为外部引擎，在构建时自动检出。

### 2. 修改网站配置

在新仓库根目录编辑 `site.config.json`：

```json
{
  "title": "Alice 的博客",
  "author": "Alice",
  "url": "https://alice.github.io",
  "description": "我的个人博客，记录技术与生活。",
  "descriptionEn": "My personal blog about technology and life."
}
```

其中 `url` 与自己的网站地址保持一致，不能保留示例用户名；未修改的作者和域名占位符会导致构建失败，以免误发布。

公开部署之前必须替换模板里的演示文章、摄影图片、虚构运动记录、About 与示例版权配置。GitHub Pages 工作流会拦截仍然保留的演示素材，具体路径见新建仓库 README 中的 `check-publication.mjs`。自己的文章放在 `src/content/articles/`，笔记在 `src/content/notes/`，关于页面在 `src/content/pages/`，图片在 `public/media/`。中英文版权策略统一维护在 `src/content/site/copyright.json`，不要把示例授权说明当成自己的版权声明。

### 3. 自动部署 GitHub Pages

进入新仓库的 **Settings → Pages → Build and deployment**，将 **Source** 选择为 **GitHub Actions**。

把 `site.config.json` 的修改提交至 `main`，然后在 **Actions** 查看 **Deploy my Inkerio blog to GitHub Pages**。如未自动触发，可通过 **Run workflow** 手动执行。

整个构建流程是：检出固定版本的 Inkerio → 合并个人站点配置 → 装配文章和图片 → 类型检查 → 生成静态网站 → 发布 GitHub Pages。

**不需要自己申请 Token、配置浏览器 Cookie、购买云服务器，也不依赖 SyndiRelay。**

### 4. 验证上线

访问 **https://YOUR_USERNAME.github.io/**。检查首页、文章、图片及英文页面 `/en/`。当 GitHub Actions 的构建和部署任务都成功，才算完成了第一轮建站。

需要注意，GitHub Free 的公开仓库意味着其中的草稿文件也可以被他人直接查看，敏感内容和密钥不要提交进去。

### 5. 本地预览（可选）

需要 Git、Node.js **22.12+** 和 npm。将自己的内容仓库与 Inkerio 克隆到同一父目录：

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

访问 http://localhost:4321 即可预览**自己的博客**。`npm run dev:quick` 是演示模板预览命令，不能用它取代自己的内容装配。需要正式本地构建时，先装配内容，再执行 `npm run check` 和 `npm run build`。

## 引擎 CLI 与 MCP（可选）

Inkerio 也支持在不使用 GitHub Pages 的情况下本地开发。执行 `npm ci`、`npm run tools:build` 后，可以通过 `node .inkerio-tools/cli.js status` 查看状态，通过 `validate --content-root /绝对路径/blog` 校验内容，或者执行 `build`、`preview --port 4321`。MCP 客户端可以启动本地 STDIO 服务：`node /绝对路径/inkerio/.inkerio-tools/mcp.js`。通过 `INKERIO_CONTENT_ROOT` 指定允许访问的内容仓库，具有文件写入副作用的工具还需要本机设置 `INKERIO_MCP_ALLOW_MUTATIONS=1`。这不是第三方文章分发接口。

## 可选配置与项目关系

独立域名需要同时修改 `site.config.json` 的 `url` 与 GitHub Pages 的自定义域名设置。访问量统计、点赞及评论均属于可选集成，不影响基本建站。

如果将来需要把文章分发到其他内容平台，可以使用 [SyndiRelay](https://github.com/ThinkerQAQ/syndirelay)，**它直接读取同一份博客内容**，不需要用户再建立一个 Blog Content 仓库。

**实际案例（Live Example）：** [thinkerqaq.com](https://thinkerqaq.com/) 使用 Inkerio 构建，其 [ThinkerQAQ.github.io](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io) 仓库展示了更复杂的生产环境方案，包括独立内容仓库、网站部署包装层、Worker 及 GitHub Pages/EdgeOne。这是可参考的**生产实践**，不是要求新用户直接复制的建站模板。普通用户应优先使用单仓库内容模板。

**版权：** Inkerio 原创引擎代码采用 [MIT](LICENSE)；用户文章、摄影、模板演示素材与第三方依赖各有不同的权利边界，详见 [第三方说明](THIRD_PARTY_NOTICES.md)。生产环境建议固定已经验证的引擎提交版本，避免不经验证地自动追踪 `main`。




### 项目 README 与 docs

每个项目存放在 `src/content/projects/<id>/`：`project.md` 保存项目元数据及有序的 `documents` 章节 ID，`README_ZH.md` 与 `README.md` 保存中英文介绍，`docs/` 保存章节（英文对应文件位于 `docs/en/`）。README 是项目目录第一项。项目、文档和普通文章复用阅读布局、目录及导航组件，但项目文档不属于文章系列，不进入「系列」集合、系列列表和首页系列推荐，也不进入普通文章列表或文章 RSS。

项目首页为 `/projects/<id>/`，文档目录为 `/projects/<id>/docs/`，章节为 `/projects/<id>/docs/<chapter>/`，英文有对应路径。可选的引擎命令 `node scripts/sync-project-content.mjs --content-root /path/to/content` 同步公开仓库的 README 及 `docs/` 下全部 Markdown，保留子目录、匹配译文并更新 `project.md` 的章节顺序，不生成系列元数据。在 `src/data/project-sources.json` 的 `projects` 中配置 `id`、公开 `repository`（`owner/repo`）、固定的 40 位提交 `revision`、`files`（`zh`/`en` README 路径）和可选的 `routes` 映射；仅同步 README 时设置 `docs: false`。来源全部下载成功后才更新快照；构建和页面访问使用已提交的本地内容。
