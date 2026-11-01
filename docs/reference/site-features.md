# Configurable site behavior

Inkerio keeps its reusable code separate from a site's content and deployment preferences. Put all **public** preferences below in the deployment repository's `site.config.json`; overlay that file before building. The engine's checked-in config is only a portable example. Do not put passwords, API tokens, private content or cookies here.

## Home page and categories

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

Each category `id` must match the `category` value in note frontmatter. Sections and categories are shown **in the order supplied**, and empty categories/sections are hidden. A category may be listed only once. When `home.knowledgeSections` is absent, Inkerio automatically displays all indexable note categories as one **Topics** section. Explicit `[]` hides the knowledge sections. Hero text defaults to the site's `homeTitle`, `homeTitleEn` and descriptions.

A site can also set `noteTaxonomy` to control the order on `/notes/` and English category/topic/tag labels:

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

`appendedCategoryOrder` moves only the listed categories to the end, in that order; others retain the normal content-derived ordering. All translation maps are optional and fall back to the note's own labels (or the existing generic topic fallback). This does not change note IDs, translations or canonical URLs.

## RSS policy

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

Defaults: up to 100 entries; **no minimum date**, UTC timezone, photos/workouts enabled, and demo workouts excluded. The `photoSince` field requires an ISO-8601 timestamp including a timezone; `workoutSince` requires `YYYY-MM`. Workout summaries are emitted only for completed months with at least `minTrainingDays` training days. Their publication timestamp is midnight on the **first day of the following month** in `rss.timezone`, including daylight-saving time where applicable. Setting `includePhotography` or `includeWorkouts` to false excludes the corresponding entry type. A site's rules are deliberately independent of other sites' history.

## Legacy links and canonical redirects

```json
{
  "legacyRedirects": {
    "exact": [
      {"from": "/old-section/", "to": "/notes/"}
    ],
    "notePrefixes": [
      {"from": "/old-notes/", "noteIdPrefix": "archive/"}
    ],
    "categoryArchives": [
      {
        "from": "/old-category/",
        "to": "/notes/category/archive/",
        "noteIdPrefix": "archive/",
        "includeTopics": true,
        "includePages": true
      }
    ]
  }
}
```

The build generates static redirect HTML pages (meta refresh and `location.replace`) and a canonical link. `exact` maps one URL. `notePrefixes` emits one redirect per existing note whose ID starts with `noteIdPrefix`; the remaining suffix is preserved. `categoryArchives` additionally emits an archive landing page, the previous topic paths and pagination (the engine's current note page size). No redirect is emitted for a missing note. Source and target URLs must be site-local, slash-terminated paths; external origins and malformed paths are rejected. Duplicate generated URLs and self-redirects fail the build. All legacy URLs are excluded from the Sitemap, while canonical targets remain indexable.

**Compatibility:** an existing site must copy its original policy to its deployment config before upgrading its pinned Inkerio commit. Without `legacyRedirects` the public engine no longer creates anyone's historical alias URLs. Validate a production upgrade against the site's original URL inventory, RSS and SEO before deploying. See [deployment](deployment.md).
