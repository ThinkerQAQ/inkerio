# Inkerio source releases / 引擎源码发布

Inkerio engine tags use `inkerio-v*`. Engine archives contain versioned source, the MIT license and third-party notices—not a compiled personal website, node_modules or private SyndiRelay executables. Install Node.js/npm and follow [Quick Start](quick-start.md) with the public template.

SyndiRelay is maintained in a separate repository. An Inkerio source release makes no claim about that application’s binary distribution, platform API authorization or licensing. Personal articles, photography and content permissions remain separate.

Inkerio 使用 `inkerio-v*` 标签，发行包仅含源码、MIT 许可及第三方声明；不打包个人网站、npm 依赖或私有 SyndiRelay 二进制。安装 Node.js/npm 后可按照快速开始运行公开模板。引擎源码发布不代表其他产品的二进制分发或第三方平台自动化已获得授权。


## Official release location / 正式版本位置

Use [ThinkerQAQ/inkerio Releases](https://github.com/ThinkerQAQ/inkerio/releases). The historical `inkerio-v2.0.0` download previously attached to the **website wrapper** is superseded by this standalone engine repository; repository-scoped Git tags and Releases are different identities. Production wrappers should pin the audited engine **commit SHA**, not follow a mutable `latest` URL. Do not redistribute the site's private content or bundle a SyndiRelay executable inside an Inkerio source release.

正式下载入口是 [inkerio 仓库 Releases](https://github.com/ThinkerQAQ/inkerio/releases)。旧站点仓库内同名 `inkerio-v2.0.0` 历史附件不再作为正式发行包。站点生产工作流继续固定经过 CI 验证的 **commit SHA**，不要在生产自动跟踪 `latest`。源代码包不包含私有内容与 SyndiRelay 安装程序。
