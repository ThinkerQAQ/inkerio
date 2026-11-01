# Inkerio

[English](README.md) · [公开内容模板](https://github.com/ThinkerQAQ/inkerio-content-template) · [拆分方案](docs/architecture/repository-boundaries.md) · [源码 Releases](https://github.com/ThinkerQAQ/inkerio/releases) · [MIT License](LICENSE)

**Inkerio 是基于 Astro 的中英文静态博客引擎**，支持文章、笔记、思维导图、项目、系列、摄影、RSS、Sitemap、增量索引清单和全文搜索。内容由独立仓库提供，不与引擎源码混存。

**状态：独立引擎已投入生产。** [ThinkerQAQ 网站](https://thinkerqaq.com/)通过专门的部署仓库固定 Inkerio 版本；本引擎仓库不持有网站凭据或个人内容。

## 快速启动

需要 Node.js 22.12+、npm、Git，不再依赖 Go 或 BlogCTL。

```bash
git clone https://github.com/ThinkerQAQ/inkerio.git
cd inkerio
npm ci
npm run dev:quick
```

浏览器访问 http://localhost:4321。命令自动克隆公开的 [inkerio-content-template](https://github.com/ThinkerQAQ/inkerio-content-template) 生成演示内容。

完整构建：`npm run build:template`。使用自己的内容仓库：

```bash
node scripts/assemble-content.mjs --content-root ../your-content-repo
npm run check
npm run build
```

内容库必须具有 `src/content/`；可选 `public/media/` 与 `src/data/content-manifest.json`。装配只复制到引擎忽略目录，不修改真实内容库。

## 职责边界

- **Inkerio**：通用页面、内容 Schema、Markdown/图表渲染、静态构建和搜索。
- **inkerio-content-template**：公开虚构样例，不与个人网站集成仓库合并。
- **blog-content**：你的真实文章、摄影及版权政策，保持独立 Private。
- [**SyndiRelay**](https://github.com/ThinkerQAQ/syndirelay)（独立开源仓库）：可选的跨平台分发、CLI、Bridge、浏览器扩展与 MCP；引擎本身不依赖它。
- **ThinkerQAQ.github.io**：已经缩减为个人网站身份配置、域名验证文件、专属 Worker 与 CI/CD 部署。

首页分类、笔记分类、RSS 和历史重定向详见[站点行为配置](docs/zh-CN/reference/site-features.md)。

[site.config.json](site.config.json) 使用通用演示身份。部署时由专用站点仓库覆盖，不向公共引擎提交凭据、备案、Cookie 或真实内容。

见[完整迁移顺序](docs/architecture/repository-boundaries.md)。原创引擎代码使用 [MIT](LICENSE)，第三方依赖及用户内容保留独立版权；参见[第三方声明](THIRD_PARTY_NOTICES.md)。

## 引擎源码发布

正式版本入口：[Inkerio Releases](https://github.com/ThinkerQAQ/inkerio/releases)。
重新梳理后的独立源码版本从 `inkerio-v2.1.0` 开始。
GitHub 提供的 ZIP/TAR 是**引擎源码**，不是开箱即用的网站安装包。
须先安装 Node.js/npm，再装配[公开内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)
或自己的内容仓库。

[SyndiRelay](https://github.com/ThinkerQAQ/syndirelay) 已独立开源，
仅负责可选的内容分发，不是 Inkerio 构建和渲染的必需依赖。
生产部署应固定经过测试的 **commit SHA**，而不是自动追踪最新版。
文章、摄影与生产 Worker 分别由各自仓库维护。


## CLI 与 MCP（无需浏览器扩展）

Inkerio 提供独立的 Node.js CLI 和 MCP stdio 入口，直接复用现有 Astro、图表及内容装配脚本。它不负责向第三方内容平台发布，也不依赖 Go、BlogCTL、浏览器扩展或 Cookie。

```bash
npm ci
npm run tools:build
node .inkerio-tools/cli.js status
node .inkerio-tools/cli.js validate --content-root /absolute/path/to/content
node .inkerio-tools/cli.js build
node .inkerio-tools/cli.js preview --port 4321
```

MCP 客户端配置 stdio 命令 `node /absolute/path/to/inkerio/.inkerio-tools/mcp.js`；`INKERIO_CONTENT_ROOT` 配置内容仓库的绝对路径。查询类工具默认只读；内容装配、构建、图表渲染和启动预览等写入操作需在**本地 MCP 进程环境**中显式设置 `INKERIO_MCP_ALLOW_MUTATIONS=1`。MCP 不暴露任意 Shell，也不包含线上发布权限。跨平台运行依赖 Node.js 和引擎自身的依赖安装。
