# Inkerio 命令

独立引擎不再要求安装 Go 或 BlogCTL。

| 命令 | 用途 |
| --- | --- |
| `npm ci` | 安装依赖 |
| `npm run dev:quick` | 装配公开示例并预览 |
| `node scripts/assemble-content.mjs --content-root ../content` | 装配独立内容库 |
| `npm run check` | Astro 类型检查 |
| `npm run test:engine` | 引擎与内容安全测试 |
| `npm run build` | 静态网站与 Pagefind 构建 |
| `npm run build:template` | 示例内容完整构建 |
| `npm run preview` | 预览构建成果 |

第三方平台分发属于独立的 [BlogCTL](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/tools/blogctl)，不在引擎命令范围内。
