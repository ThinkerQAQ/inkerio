# 从个人部署仓库构建 Inkerio

**Inkerio 只负责引擎，不直接负责个人站点的生产部署。** 新引擎 CI 只使用公开 Content Template；原 ThinkerQAQ 网站暂时继续使用[旧部署工作流](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/.github/workflows/)，未经验证不切换。

## 部署所需输入

`YOUR_USER.github.io` 一类站点集成仓库需要：

1. 固定版本或提交的 Inkerio。
2. 固定内容 SHA 的独立内容仓库（含 `src/content/`）。
3. 自己的 `site.config.json` 和站点资源。
4. GitHub Pages、EdgeOne 等平台的专属凭据。

内容仓库可以保持 Private，通过独立的只读部署密钥授权；不要将私人内容密钥配置到公开引擎的 CI。

## 构建流程

1. 检出引擎到 `engine/`、内容到 `content/`。
2. 覆盖 `engine/site.config.json` 和站点专有静态素材。
3. 在 `engine/` 执行 `npm ci`。
4. 执行 `node scripts/assemble-content.mjs --content-root ../content`。
5. 执行 `npm run check`、`npm run build`。
6. 仅将 `engine/dist/` 部署到 GitHub Pages、EdgeOne 等静态托管。

GitHub Pages 需在仓库 Settings → Pages 中选择 GitHub Actions，工作流按官方方式配置上传与部署权限。引擎自身的验证工作流**不会**发布网站。

## 切换生产前的验收

使用**相同内容提交**分别构建新旧引擎，核对页面路由、canonical/hreflang、RSS、Sitemap、结构化数据、摄影素材、搜索结果与重点文章，再决定切换。保留旧工作流或提交用于回滚。

参见[架构拆分方案](../../architecture/repository-boundaries.md)和[站点个性化](customize-site.md)。
