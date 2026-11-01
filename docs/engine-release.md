# Inkerio source releases / Inkerio 引擎源码版本

The canonical download channel is [Inkerio Releases](https://github.com/ThinkerQAQ/inkerio/releases).
The refreshed standalone source-release line starts at `inkerio-v2.1.0`.
GitHub provides ZIP/TAR archives of the reusable Astro engine with committed
MIT/third-party notices. This is a **source-only** release, not an installer,
a complete personal website, or a bundled copy of SyndiRelay. It never
contains the author's private writing, deployment secrets or `node_modules`.

1. Install Node.js 22.12+, npm and Git.
2. Follow [Quick Start](quick-start.md) and assemble the
   [public content template](https://github.com/ThinkerQAQ/inkerio-content-template).
3. For production, pin the reviewed engine **commit SHA** in the site wrapper;
   do not follow a mutable `latest` branch or tag.
4. Content, static deployment, site-specific Workers and optional publishing
   are separate concerns; see [repository boundaries](architecture/repository-boundaries.md).

## 中文说明

正式发布入口为 [Inkerio Releases](https://github.com/ThinkerQAQ/inkerio/releases)。
重新梳理后的独立源码版本从 `inkerio-v2.1.0` 开始。
发行内容仅为可复用的 Astro 引擎**源码压缩包**，包含 MIT 许可证与
已提交的第三方许可说明，不包含文章、生产密钥、`node_modules`、
个人站点构建结果或 SyndiRelay 可执行程序。

安装 Node.js 22.12+、npm、Git 后，按照[快速开始](zh-CN/quick-start.md)
装配[内容模板](https://github.com/ThinkerQAQ/inkerio-content-template)。
生产部署应固定经过 CI 验证的 Git commit SHA，站点 Worker、内容仓库及
分发工具分别维护。
