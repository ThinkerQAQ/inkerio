# 站点行为配置

Inkerio 是通用博客引擎。首页分类、笔记分类顺序、RSS 策略和历史地址由部署仓库的 **`site.config.json`** 管理，构建时覆盖引擎内的同名配置。该文件仅保存公开设置，**不要放入 API Key、Cookie、密码或私有文章**。

## 首页主题和笔记分类

```json
{
  "home": {
    "hero": {
      "zh": {"title": "我的笔记", "description": "持续记录。"},
      "en": {"title": "My Notes", "description": "Notes and ideas."}
    },
    "knowledgeSections": [
      {
        "id": "engineering",
        "titles": {"zh": "技术", "en": "Engineering"},
        "categories": [
          {"id": "database", "labels": {"zh": "数据库", "en": "Databases"}}
        ]
      }
    ]
  }
}
```

分类 `id` 必须与笔记 Frontmatter 的 `category` 相同。栏目和分类按照配置顺序显示，没有内容的分类会自动隐藏。一个分类不能重复出现在多个栏目。省略 `home.knowledgeSections` 时，自动根据可索引笔记生成一个「知识主题 / Topics」栏目；显式设置 `[]` 则隐藏知识栏目。首页主标题与简介默认取 `homeTitle`、`homeTitleEn` 和站点简介。

笔记索引页的分类顺序和英文标签也属于站点设置：

```json
{
  "noteTaxonomy": {
    "appendedCategoryOrder": ["economics", "photography"],
    "translationsEn": {
      "categories": {"database": "Databases"},
      "rootTopics": {},
      "topics": {"index": "Indexes"},
      "sourceLabels": {},
      "tags": {"数据库": "Databases"}
    }
  }
}
```

`appendedCategoryOrder` 仅将指定分类按顺序移动到笔记索引末尾，其余保留原有内容排序。英文翻译字典均可省略，缺少词条时使用笔记自身文字或通用后备标签，不改变笔记 ID 和原文链接。

## RSS 规则

```json
{
  "rss": {
    "maxItems": 100,
    "photoSince": "2026-01-01T00:00:00+08:00",
    "workoutSince": "2026-09",
    "timezone": "Asia/Shanghai",
    "minTrainingDays": 1,
    "includePhotography": true,
    "includeWorkouts": true,
    "includeDemoWorkouts": false,
    "descriptions": {
      "zh": "最新文章与记录。",
      "en": "New writing and updates."
    }
  }
}
```

默认保留最多 100 条、没有日期下限、使用 UTC 时区、允许摄影和健身记录、排除演示健身数据。`photoSince` 必须是带时区的 ISO 时间，`workoutSince` 为 `YYYY-MM`。只发布已结束且训练天数达到 `minTrainingDays` 的月份。健身月报发布时间取**次月第一天、指定时区的零点**；支持有夏令时的 IANA 时区。可以用 `includePhotography` / `includeWorkouts` 禁用对应内容。

## 旧链接重定向

```json
{
  "legacyRedirects": {
    "exact": [{"from": "/old-section/", "to": "/notes/"}],
    "notePrefixes": [{"from": "/old-notes/", "noteIdPrefix": "archive/"}],
    "categoryArchives": [{
      "from": "/old-category/", "to": "/notes/category/archive/",
      "noteIdPrefix": "archive/", "includeTopics": true, "includePages": true
    }]
  }
}
```

`exact` 映射固定 URL；`notePrefixes` 根据实际存在的笔记 ID 批量生成旧地址；`categoryArchives` 额外保留旧分类首页、主题和分页链接。所有旧地址构建为包含 Canonical 的静态跳转页（meta refresh 和 `location.replace`），**不进入 Sitemap**。不允许外部域名、畸形路径、重复生成的路径或重定向到自身。没有对应笔记则不生成链接。

**升级兼容性：** 先把原站点的分类、RSS 和旧链接规则移入部署配置，再升级固定的 Inkerio 版本。通用引擎不再内置某个站长的 Java / MySQL / Kafka 历史别名。生产升级前需核对原有页面、RSS、Sitemap 和 SEO。详见[部署参考](deployment.md)。
