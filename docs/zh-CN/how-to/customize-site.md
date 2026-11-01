# 个性化站点（不修改引擎源码）

Inkerio 自带的 [site.config.json](../../../site.config.json) 只包含**虚构演示值**。真实域名、身份、备案信息、图标、站长验证文件和集成配置应由个人网站部署仓库维护，而不是直接改通用引擎。

## 网站身份与 Canonical

在部署仓库准备自己的 `site.config.json`，构建时复制到 Inkerio 引擎根目录。主要字段：

| 字段 | 用途 |
| --- | --- |
| `title`、`homeTitle`、`homeTitleEn` | 网站名称及双语首页标题 |
| `description`、`descriptionEn`、`author`、`authorProfilePath` | SEO 和作者信息 |
| `url` | HTTPS 站点源地址，统一用于 Astro 和结构化数据 |
| `github`、`profiles`、`repository` | 公开社交与代码仓库链接 |
| `contactEmail` | 联系邮箱，可留空 |
| `icpRecord`、`publicSecurityRecord`、`publicSecurityIcon` | 可选备案信息和图标，默认留空 |
| `commentsRepository` | utterances 评论仓库，留空时关闭评论 |

[Astro 配置](../../../astro.config.mjs)及[站点模块](../../../src/config/site.ts)都读取该 JSON，常规身份配置不再要求编辑引擎内部 TS 代码。通用 UI 文案仍位于[国际化配置](../../../src/config/i18n.ts)，需要结构性文案修改时再考虑上游改进。

首页分类、笔记分类顺序、英文标签、RSS 和历史链接的配置方式见[站点行为配置](../reference/site-features.md)。这些属于部署配置，不应直接修改通用引擎源码。

## 内容与图片

真实文章、笔记、About、项目、摄影和版权政策属于独立内容库。用 `node scripts/assemble-content.mjs --content-root ../your-content` 装配内容，版权政策以内容仓库的 `src/content/site/copyright.json` 为准。个人头像、Logo、站长验证文件由部署仓库注入；引擎自带图标只是演示。

## 可选集成

- 评论：配置 `commentsRepository`；留空时不渲染 utterances 评论区。
- Umami：使用 `PUBLIC_UMAMI_WEBSITE_ID`、`PUBLIC_UMAMI_PROXY_ORIGIN`；站点专用 `public/u.js` 应由部署仓库提供，引擎不分发此资源。
- 点赞：`PUBLIC_REACTION_WORKER_URL` 指向自己的 Worker。
- AI：作为可选外部服务，通用引擎不负责部署。

SyndiRelay 是独立的内容分发工具，其 Canonical 与外部平台配置应单独确认，不能假定与网站的 `site.config.json` 自动同步。

## 验证

装配自己的内容后执行 `npm run check`、`npm run build`，检查 `dist/` 中的域名、双语链接、RSS、Sitemap、About、版权、头像和可选服务。不要将真实内容或密钥提交回 Inkerio。部署流程见[部署指南](deploy.md)。
