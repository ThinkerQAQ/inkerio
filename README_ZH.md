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

自己的文章放在 `src/content/articles/`，笔记在 `src/content/notes/`，关于页面在 `src/content/pages/`，图片在 `public/media/`。中英文版权策略统一维护在 `src/content/site/copyright.json`，不要把示例授权说明当成自己的版权声明。

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

## 可选配置与项目关系

独立域名需要同时修改 `site.config.json` 的 `url` 与 GitHub Pages 的自定义域名设置。访问量统计、点赞及评论均属于可选集成，不影响基本建站。

如果将来需要把文章分发到其他内容平台，可以使用 [SyndiRelay](https://github.com/ThinkerQAQ/syndirelay)，**它直接读取同一份博客内容**，不需要用户再建立一个 Blog Content 仓库。

**实际案例（Live Example）：** [thinkerqaq.com](https://thinkerqaq.com/) 使用 Inkerio 构建，其 [ThinkerQAQ.github.io](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io) 仓库展示了更复杂的生产环境方案，包括独立内容仓库、网站部署包装层、Worker 及 GitHub Pages/EdgeOne。这是可参考的**生产实践**，不是要求新用户直接复制的建站模板。普通用户应优先使用单仓库内容模板。

**版权：** Inkerio 原创引擎代码采用 [MIT](LICENSE)；用户文章、摄影、模板演示素材与第三方依赖各有不同的权利边界，详见 [第三方说明](THIRD_PARTY_NOTICES.md)。生产环境建议固定已经验证的引擎提交版本，避免不经验证地自动追踪 `main`。
