# Inkerio

[English](README.md) · [公开内容模板](https://github.com/ThinkerQAQ/inkerio-content-template) · [拆分方案](docs/architecture/repository-boundaries.md) · [MIT License](LICENSE)

**Inkerio 是基于 Astro 的中英文静态博客引擎**，支持文章、笔记、思维导图、项目、系列、摄影、RSS、Sitemap、增量索引清单和全文搜索。内容由独立仓库提供，不与引擎源码混存。

**状态：独立引擎迁移验证阶段。** [ThinkerQAQ 个人网站](https://thinkerqaq.com/) 仍使用原部署工作流，本仓库暂不触及生产部署。

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
- **BlogCTL**：跨平台内容分发、CLI、Bridge、浏览器扩展及 MCP，暂时留在[原仓库](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/tools/blogctl)。
- **ThinkerQAQ.github.io**：未来只负责个人配置、域名验证文件和 CI/CD。

[site.config.json](site.config.json) 使用通用演示身份。部署时由专用站点仓库覆盖，不向公共引擎提交凭据、备案、Cookie 或真实内容。

见[完整迁移顺序](docs/architecture/repository-boundaries.md)。原创引擎代码使用 [MIT](LICENSE)，第三方依赖及用户内容保留独立版权；参见[第三方声明](THIRD_PARTY_NOTICES.md)。
