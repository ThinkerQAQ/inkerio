// Build-time, owner-neutral site policy. All input is public configuration;
// no credentials or mutable runtime state belong here.
const object = (value, field) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value;
};
const string = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value.trim();
};
const localized = (value, field) => {
  const data = object(value, field);
  return { zh: string(data.zh, `${field}.zh`), en: string(data.en, `${field}.en`) };
};
const safeLocalPath = (value, field) => {
  const path = string(value, field);
  if (!path.startsWith('/') || !path.endsWith('/') || path.includes('//') || path.includes('\\') || /[?#%]/.test(path) || path.split('/').some(part => part === '.' || part === '..')) {
    throw new Error(`${field} must be an absolute site-local slash-terminated path`);
  }
  return path;
};
const safeNotePrefix = (value, field) => {
  const prefix = string(value, field);
  if (prefix.startsWith('/') || !prefix.endsWith('/') || prefix.includes('\\') || prefix.includes('//') || /[?#%]/.test(prefix) || prefix.split('/').some(part => part === '.' || part === '..')) {
    throw new Error(`${field} must be a site-local note ID prefix ending in /`);
  }
  return prefix;
};
const boolean = (value, field, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') throw new Error(`${field} must be a boolean`);
  return value;
};
const integer = (value, field, fallback, min, max) => {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${field} must be an integer from ${min} to ${max}`);
  return value;
};

export function normalizeSiteFeatures(config) {
  object(config, 'site.config.json');
  const home = config.home === undefined ? {} : object(config.home, 'home');
  const hero = home.hero === undefined ? {} : object(home.hero, 'home.hero');
  const defaultHero = {
    zh: { title: config.homeTitle || config.title, description: config.description },
    en: { title: config.homeTitleEn || config.title, description: config.descriptionEn || config.description },
  };
  const heroCopy = Object.fromEntries(['zh', 'en'].map(locale => {
    const entry = hero[locale] === undefined ? defaultHero[locale] : object(hero[locale], `home.hero.${locale}`);
    return [locale, { title: string(entry.title, `home.hero.${locale}.title`), description: string(entry.description, `home.hero.${locale}.description`) }];
  }));
  let knowledgeSections = null; // null = discover categories from the assembled content
  if (home.knowledgeSections !== undefined) {
    if (!Array.isArray(home.knowledgeSections)) throw new Error('home.knowledgeSections must be an array');
    const ids = new Set();
    const categoryIds = new Set();
    knowledgeSections = home.knowledgeSections.map((value, index) => {
      const entry = object(value, `home.knowledgeSections[${index}]`);
      const id = string(entry.id, `home.knowledgeSections[${index}].id`);
      if (!/^[a-z][a-z0-9_-]*$/i.test(id)) throw new Error('Knowledge section ID must be alphanumeric with _ or -');
      if (ids.has(id)) throw new Error('Duplicate knowledge section: ' + id);
      ids.add(id);
      if (!Array.isArray(entry.categories)) throw new Error(`home.knowledgeSections[${index}].categories must be an array`);
      const categories = entry.categories.map((item, n) => {
        const category = object(item, `knowledge category ${n}`);
        const categoryId = string(category.id, `knowledge category ${n}.id`);
        if (categoryId.includes('/') || categoryId.includes('\\')) throw new Error('Knowledge category IDs cannot be paths');
        if (categoryIds.has(categoryId)) throw new Error('Duplicate knowledge category: ' + categoryId);
        categoryIds.add(categoryId);
        return { id: categoryId, labels: localized(category.labels, `knowledge category ${categoryId}.labels`) };
      });
      return { id, titles: localized(entry.titles, `home section ${id}.titles`), categories };
    });
  }

  const rss = config.rss === undefined ? {} : object(config.rss, 'rss');
  const optionalDate = (value, kind, field) => {
    if (value === undefined || value === null) return null;
    const date = string(value, field);
    if (kind === 'month' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) throw new Error(`${field} must be YYYY-MM`);
    if (kind === 'date' && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(date) || !Number.isFinite(Date.parse(date)))) throw new Error(`${field} must be a valid ISO date with a timezone`);
    return date;
  };
  const timezone = rss.timezone === undefined ? 'UTC' : string(rss.timezone, 'rss.timezone');
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(); }
  catch { throw new Error('rss.timezone must be a valid IANA timezone'); }
  const rssDescriptions = rss.descriptions === undefined
    ? { zh: `${config.title} 的更新。`, en: `Updates from ${config.title}.` }
    : localized(rss.descriptions, 'rss.descriptions');

  const taxonomy = config.noteTaxonomy === undefined ? {} : object(config.noteTaxonomy, 'noteTaxonomy');
  const appendedCategoryOrder = taxonomy.appendedCategoryOrder === undefined ? [] : taxonomy.appendedCategoryOrder;
  if (!Array.isArray(appendedCategoryOrder) || appendedCategoryOrder.some(item => typeof item !== 'string' || !item.trim()) || new Set(appendedCategoryOrder).size !== appendedCategoryOrder.length) {
    throw new Error('noteTaxonomy.appendedCategoryOrder must be an array of unique category IDs');
  }
  const translationsEn = taxonomy.translationsEn === undefined ? {} : object(taxonomy.translationsEn, 'noteTaxonomy.translationsEn');
  const translate = (field) => {
    const raw = translationsEn[field] === undefined ? {} : object(translationsEn[field], `noteTaxonomy.translationsEn.${field}`);
    return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, string(value, `noteTaxonomy.translationsEn.${field}.${key}`)]));
  };
  const noteTaxonomy = {
    appendedCategoryOrder,
    translationsEn: {
      categories: translate('categories'), rootTopics: translate('rootTopics'),
      topics: translate('topics'), sourceLabels: translate('sourceLabels'), tags: translate('tags'),
    },
  };

  const legacy = config.legacyRedirects === undefined ? {} : object(config.legacyRedirects, 'legacyRedirects');
  const list = (value, field) => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
    return value;
  };
  const exact = list(legacy.exact, 'legacyRedirects.exact').map((raw, i) => {
    const item = object(raw, `legacyRedirects.exact[${i}]`);
    return { from: safeLocalPath(item.from, `legacyRedirects.exact[${i}].from`), to: safeLocalPath(item.to, `legacyRedirects.exact[${i}].to`) };
  });
  const notePrefixes = list(legacy.notePrefixes, 'legacyRedirects.notePrefixes').map((raw, i) => {
    const item = object(raw, `legacyRedirects.notePrefixes[${i}]`);
    return { from: safeLocalPath(item.from, `legacyRedirects.notePrefixes[${i}].from`), noteIdPrefix: safeNotePrefix(item.noteIdPrefix, `legacyRedirects.notePrefixes[${i}].noteIdPrefix`) };
  });
  const categoryArchives = list(legacy.categoryArchives, 'legacyRedirects.categoryArchives').map((raw, i) => {
    const item = object(raw, `legacyRedirects.categoryArchives[${i}]`);
    return {
      from: safeLocalPath(item.from, `legacyRedirects.categoryArchives[${i}].from`),
      to: safeLocalPath(item.to, `legacyRedirects.categoryArchives[${i}].to`),
      noteIdPrefix: safeNotePrefix(item.noteIdPrefix, `legacyRedirects.categoryArchives[${i}].noteIdPrefix`),
      includeTopics: boolean(item.includeTopics, 'includeTopics', false),
      includePages: boolean(item.includePages, 'includePages', false),
    };
  });
  const sources = new Set();
  for (const item of [...exact, ...notePrefixes, ...categoryArchives]) {
    if (sources.has(item.from)) throw new Error(`Duplicate legacy route prefix: ${item.from}`);
    sources.add(item.from);
  }
  return {
    home: { hero: heroCopy, knowledgeSections },
    rss: {
      maxItems: integer(rss.maxItems, 'rss.maxItems', 100, 1, 1000),
      photoSince: optionalDate(rss.photoSince, 'date', 'rss.photoSince'),
      workoutSince: optionalDate(rss.workoutSince, 'month', 'rss.workoutSince'),
      timezone,
      minTrainingDays: integer(rss.minTrainingDays, 'rss.minTrainingDays', 1, 0, 31),
      includeDemoWorkouts: boolean(rss.includeDemoWorkouts, 'rss.includeDemoWorkouts', false),
      includePhotography: boolean(rss.includePhotography, 'rss.includePhotography', true),
      includeWorkouts: boolean(rss.includeWorkouts, 'rss.includeWorkouts', true),
      descriptions: rssDescriptions,
    },
    noteTaxonomy,
    legacyRedirects: { exact, notePrefixes, categoryArchives },
  };
}

// Resolve the visible categories based on existing, indexable note content.
export function resolveKnowledgeSections(configured, groups, locale = 'zh') {
  const available = new Map(groups.map(group => [group.category, group]));
  const sections = configured ?? [{
    id: 'topics', titles: { zh: '知识主题', en: 'Topics' },
    categories: groups.map(group => ({ id: group.category, labels: { zh: group.entries[0]?.data?.categoryLabel || group.category, en: group.entries[0]?.data?.categoryLabel || group.category } })),
  }];
  return sections.map(section => ({
    id: section.id,
    title: section.titles[locale],
    entries: section.categories.flatMap(category => {
      const group = available.get(category.id);
      return group?.entries?.length ? [{ category: category.id, label: category.labels[locale], count: group.entries.length }] : [];
    }),
  })).filter(section => section.entries.length);
}
