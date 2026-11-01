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


## 可插拔统计与点赞

两项能力都由站点自主选择，默认不启用，**不要求所有用户注册 Cloudflare，也不使用 ThinkerQAQ 的线上服务**。部署仓库的 `site.config.json` 可以配置公开选项；不要将 API Key、Cookie、数据库 UUID 或私有数据写入该文件。

```json
{
  "integrations": {
    "analytics": {
      "provider": "umami",
      "scriptSrc": "/u.js",
      "websiteId": "YOUR_PUBLIC_UMAMI_WEBSITE_ID",
      "collectorOrigin": "https://your-collector.example.com"
    },
    "reactions": {
      "provider": "http",
      "endpoint": "https://your-reactions.example.com",
      "apiPath": "/v1/reactions"
    }
  }
}
```

| 适配器 | 含义 |
| --- | --- |
| Analytics `none` | 强制关闭统计，环境变量存在也不启用 |
| Analytics `umami` | 加载 `scriptSrc` 的 Umami 脚本，附带公开站点 ID 和采集 Origin，向 `/api/send` 上报 |
| Analytics `script` | 注入其他用户授权的 HTTPS / 同域脚本以及允许的 `data-*` 公开属性，不绑定 Cloudflare |
| Reactions `none` | 不渲染点赞按钮，不发起请求 |
| Reactions `http` | 使用兼容的 HTTPS 点赞接口，存储后端可以是 D1 或自建服务 |

不提供 `integrations` 字段时，继续兼容旧 CI 环境变量 `PUBLIC_UMAMI_WEBSITE_ID`、`PUBLIC_UMAMI_PROXY_ORIGIN`、`PUBLIC_REACTION_WORKER_URL`；环境变量也可以覆盖配置里的公开 ID、采集地址和点赞地址。显式 `provider: "none"` 永远优先。缺少 ID 或后端地址时会跳过功能，不产生不可点击的按钮。脚本地址要求 HTTPS 或站点内绝对路径；采集 Origin／点赞端点必须是 HTTPS；`apiPath` 为站点内绝对路径。

### 点赞 HTTP 协议 v1

前端请求 `<endpoint><apiPath>?contentType=article&contentId=...`，方法是 `GET`、`PUT`、`DELETE`，发送随机化的 `X-Reaction-Visitor` 和浏览器 `Origin`。返回固定 JSON：`{ "count": 12, "reacted": true }`。`PUT` / `DELETE` 必须幂等，GET 失败时不允许写入，写入失败会回滚 UI。`contentType` 支持 `article`、`note`、`fitness`、`life`；`contentId` 使用稳定的内容 ID（健身使用年月），不能随标题变化。

### 可自行部署的参考后端

- [Umami Cloud 统计代理](../../../examples/cloudflare/umami-collector/README.md)：只有 `/api/send`、可选 `/u.js`，严格检查 Origin、公开 Website ID、请求大小，不包含私人数据、AI Search 或报表定时任务。
- [Cloudflare D1 点赞服务](../../../examples/cloudflare/reactions/README.md)：协议 v1、D1 表结构、HMAC 访客哈希、来源校验与限流。

两者都**不会自动部署**，示例的 Wrangler 文件只包含占位值。用户必须在自己的 Cloudflare 账户下创建对应服务、数据库与密钥；其他符合协议的服务也可替代。ThinkerQAQ 的生产 Worker、原始 D1/KV、Umami 地址与 CI 变量不进行迁移，避免影响现网。代码可通过 `npm run test:integrations` 验证，不代表实际生产网络已完成验收。

Umami 脚本属于**站点部署仓库**，例如 `ThinkerQAQ.github.io/public/u.js`，部署时复制到 Inkerio 的 `public/`。通用引擎默认不包含统计脚本，只有同时配置 `PUBLIC_UMAMI_WEBSITE_ID` 与 `PUBLIC_UMAMI_PROXY_ORIGIN` 才启用追踪。来源：`https://cloud.umami.is/script.js`（2026-10-11 获取，SHA-256：`91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`）；许可证见站点仓库的 `public/u.js.LICENSE.txt`。`PUBLIC_UMAMI_PROXY_ORIGIN` 是向 `POST /api/send` 上报的**后端 Origin**。脚本 `/u.js` 同域不代表上报同域；若仍指向 `workers.dev`，浏览器会跨域 POST。需要真正同域时，必须配置能够转发 POST 的反向代理，静态托管不能承担该职责；也可使用自己配置 DNS、TLS 和跨域规则的 Worker 自定义域名。不要在缺少代理时直接把上报 Origin 改成静态站点域名。迁移前先完成 Worker CI 测试。

部署环境变量参见[部署参考](deployment.md)。源码存在某个组件不代表线上功能已启用，需同时核对构建变量与运行时入口。

RSS 地址为中文 `/rss.xml` 和英文 `/en/rss.xml`。起始日期、最多条数、时区和内容类型由**各站点自己的** `site.config.json` → `rss` 决定；通用引擎不再写死 ThinkerQAQ 的摄影与健身日期。参考[站点行为配置](site-features.md)。
