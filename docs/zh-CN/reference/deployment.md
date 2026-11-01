# 部署参考

Inkerio 是构建引擎，不直接管理个人网站的生产部署。

[独立引擎 CI](../../../.github/workflows/ci.yml) 只使用公开的 [Content Template](https://github.com/ThinkerQAQ/inkerio-content-template) 进行测试，不读取私有内容与凭据。

个人站点需由独立集成仓库固定 Inkerio 的版本和内容库的提交，再注入站点配置文件和静态资源，调用引擎完成装配与构建。

ThinkerQAQ 网站已通过[独立部署仓库](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/.github/workflows/)构建固定版本的 Inkerio，并使用隔离的权限访问私有内容。

生产切换流程参见[迁移方案](../../architecture/repository-boundaries.md)。
