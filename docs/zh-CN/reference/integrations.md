# 站点集成参考

| 功能 | 实现位置 | 相关配置 |
| --- | --- | --- |
| 页面与 SEO | [`src/pages/`](../../../src/pages/)、[`structured-data.ts`](../../../src/lib/structured-data.ts) | Astro 站点构建 |
| Pagefind | [构建脚本](../../../scripts/build-pagefind.mjs)、[搜索页面](../../../src/pages/search.astro) | Astro 构建完成后生成静态索引 |
| 搜索引擎提交 | SyndiRelay、[部署 Workflow](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/.github/workflows/deploy.yml) | IndexNow、Google 等 |
| AI Search | [Worker 文档](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/workers/blog-ai/README.md)、SyndiRelay | Cloudflare 同步环境变量 |
| Ask Blog（可选） | [AskBlogSession](../../../src/components/AskBlogSession.astro)、[BaseLayout](../../../src/layouts/BaseLayout.astro) | 构建需同时配置 `PUBLIC_ASK_BLOG_ENABLED=true`、`PUBLIC_ASK_BLOG_WORKER_URL`、`PUBLIC_ASK_BLOG_TURNSTILE_SITE_KEY`，服务端另须启用 `ASK_BLOG_ENABLED=true` 和 Turnstile。默认关闭；索引同步不等于开放 AI 问答。 |
| Umami | [BaseLayout](../../../src/layouts/BaseLayout.astro)、[Analytics](../../../src/components/ContentAnalyticsRuntime.astro) | `PUBLIC_UMAMI_*` |
| 评论 | [ContentComments](../../../src/components/ContentComments.astro) | utterances |
| 文章反馈 | [ContentReaction](../../../src/components/ContentReaction.astro)、[Worker 文档](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/workers/blog-reactions/README.md) | `PUBLIC_REACTION_WORKER_URL` |
| EdgeOne 静态部署 | [部署 Workflow](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/blob/main/.github/workflows/deploy.yml) | `EDGEONE_API_TOKEN` |
| 多平台分发 | SyndiRelay | Bridge、发布平台 Adapter |

Umami 脚本属于**站点部署仓库**，例如 `ThinkerQAQ.github.io/public/u.js`，部署时复制到 Inkerio 的 `public/`。通用引擎默认不包含统计脚本，只有同时配置 `PUBLIC_UMAMI_WEBSITE_ID` 与 `PUBLIC_UMAMI_PROXY_ORIGIN` 才启用追踪。来源：`https://cloud.umami.is/script.js`（2026-10-11 获取，SHA-256：`91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`）；许可证见站点仓库的 `public/u.js.LICENSE.txt`。`PUBLIC_UMAMI_PROXY_ORIGIN` 是向 `POST /api/send` 上报的**后端 Origin**。脚本 `/u.js` 同域不代表上报同域；若仍指向 `workers.dev`，浏览器会跨域 POST。需要真正同域时，必须配置能够转发 POST 的反向代理，静态托管不能承担该职责；也可使用自己配置 DNS、TLS 和跨域规则的 Worker 自定义域名。不要在缺少代理时直接把上报 Origin 改成静态站点域名。迁移前先完成 Worker CI 测试。

部署环境变量参见[部署参考](deployment.md)。源码存在某个组件不代表线上功能已启用，需同时核对构建变量与运行时入口。

RSS 地址为中文 `/rss.xml` 和英文 `/en/rss.xml`。起始日期、最多条数、时区和内容类型由**各站点自己的** `site.config.json` → `rss` 决定；通用引擎不再写死 ThinkerQAQ 的摄影与健身日期。参考[站点行为配置](site-features.md)。
