import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSiteFeatures, resolveKnowledgeSections } from './site-features.mjs';
import { expandLegacyRoutes, isLegacyRoute } from './legacy-routes.mjs';
import { zonedStartOfNextMonth } from './rss-time.mjs';

const base = { title: 'Sample', description: 'A sample site', homeTitle: 'Sample zh', homeTitleEn: 'Sample en' };
const realLike = {
  ...base,
  home: {
    hero: { zh: { title: '技术', description: '说明' }, en: { title: 'Engineering', description: 'Intro' } },
    knowledgeSections: [
      { id: 'engineering', titles: { zh: '技术', en: 'Technology' }, categories: [
        { id: 'java', labels: { zh: 'Java / JVM', en: 'Java / JVM' } },
        { id: 'database', labels: { zh: '数据库', en: 'Databases' } },
      ] },
      { id: 'life', titles: { zh: '生活', en: 'Life' }, categories: [
        { id: 'photography', labels: { zh: '摄影', en: 'Photography' } },
      ] },
    ],
  },
  rss: {
    maxItems: 100, photoSince: '2026-01-01T00:00:00+08:00', workoutSince: '2026-09',
    timezone: 'Asia/Shanghai', descriptions: { zh: '更新', en: 'Updates' },
  },
  legacyRedirects: {
    exact: [{ from: '/notes/category/mysql-database/', to: '/notes/category/database/topic/MySQL/' }],
    notePrefixes: [
      { from: '/notes/java-juc/', noteIdPrefix: 'java/JUC/' },
      { from: '/notes/mysql-database/', noteIdPrefix: 'database/MySQL/' },
      { from: '/notes/kafka-message-queue/', noteIdPrefix: 'message-queue/Kafka/' },
    ],
    categoryArchives: [{
      from: '/notes/category/java-juc/', to: '/notes/category/java/topic/JUC/',
      noteIdPrefix: 'java/JUC/', includeTopics: true, includePages: true,
    }],
  },
};
const clone = v => structuredClone(v);

test('no owner config defaults to content-derived categories and no legacy redirects', () => {
  const v = normalizeSiteFeatures(base);
  assert.equal(v.home.hero.en.title, 'Sample en');
  assert.equal(v.home.knowledgeSections, null);
  assert.equal(v.rss.photoSince, null);
  assert.equal(v.rss.workoutSince, null);
  assert.equal(v.rss.timezone, 'UTC');
  assert.deepEqual(v.legacyRedirects, { exact: [], notePrefixes: [], categoryArchives: [] });
  assert.deepEqual(resolveKnowledgeSections(null, [{ category: 'mytopic', entries: [{ data: { categoryLabel: '我的专题' } }] }], 'zh').map(s => s.entries[0].label), ['我的专题']);
});

test('site defined section order, translations, and empty category filtering', () => {
  const v = normalizeSiteFeatures(realLike);
  const groups = [{ category: 'photography', entries: [{}] }, { category: 'java', entries: [{}, {}] }];
  const resolved = resolveKnowledgeSections(v.home.knowledgeSections, groups, 'en');
  assert.deepEqual(resolved.map(s => [s.title, s.entries.map(e => e.label)]), [
    ['Technology', ['Java / JVM']], ['Life', ['Photography']],
  ]);
  assert.equal(v.home.hero.zh.title, '技术');
  assert.equal(v.rss.photoSince, '2026-01-01T00:00:00+08:00');
});

test('legacy declarations generate exact, note and paginated archive routes', () => {
  const v = normalizeSiteFeatures(realLike).legacyRedirects;
  const notes = [
    ...Array.from({ length: 12 }, (_, i) => ({ id: `java/JUC/Locks/part-${i}` })),
    { id: 'database/MySQL/sql' },
    { id: 'message-queue/Kafka/broker' },
    { id: 'distributed-systems/consensus' },
  ];
  const routes = expandLegacyRoutes(v, notes, 10, n => `/notes/${n.id}/`);
  const map = new Map(routes.map(r => [r.from, r.to]));
  assert.equal(map.get('/notes/category/mysql-database/'), '/notes/category/database/topic/MySQL/');
  assert.equal(map.get('/notes/category/java-juc/'), '/notes/category/java/topic/JUC/');
  assert.equal(map.get('/notes/category/java-juc/topic/Locks/'), '/notes/category/java/topic/JUC/');
  assert.equal(map.get('/notes/category/java-juc/page/2/'), '/notes/category/java/topic/JUC/');
  assert.equal(map.get('/notes/java-juc/Locks/part-11/'), '/notes/java/JUC/Locks/part-11/');
  assert.equal(map.get('/notes/mysql-database/sql/'), '/notes/database/MySQL/sql/');
  assert.equal(map.get('/notes/kafka-message-queue/broker/'), '/notes/message-queue/Kafka/broker/');
  assert.equal(map.has('/notes/java-juc/unmatched/'), false);
  for (const from of map.keys()) assert.equal(isLegacyRoute(from, v), true, from);
  assert.equal(isLegacyRoute('/notes/category/java/topic/JUC/', v), false);
  assert.equal(isLegacyRoute('/notes/database/MySQL/sql/', v), false);
});

test('no config yields no redirect pages; colliding legacy mappings fail closed', () => {
  const absent = normalizeSiteFeatures(base).legacyRedirects;
  assert.deepEqual(expandLegacyRoutes(absent, [{ id: 'java/JUC/Locks' }], 10, () => '/notes/x/'), []);
  const routes = clone(realLike);
  routes.legacyRedirects.exact.push({ from: '/notes/java-juc/a/', to: '/notes/x/' });
  assert.throws(() => expandLegacyRoutes(normalizeSiteFeatures(routes).legacyRedirects, [{ id: 'java/JUC/a' }], 10, () => '/notes/java/JUC/a/'), /Duplicate generated legacy URL/);
});

test('invalid or hostile route settings are rejected before building', () => {
  for (const path of ['https://external.example/', '//evil.test/', '/x?next=https://bad/', '/notes/../admin/', '/notes//a/']) {
    const c = clone(realLike); c.legacyRedirects.exact[0].to = path;
    assert.throws(() => normalizeSiteFeatures(c), /site-local/);
  }
  const a = clone(realLike); a.legacyRedirects.notePrefixes[1].from = a.legacyRedirects.notePrefixes[0].from;
  assert.throws(() => normalizeSiteFeatures(a), /Duplicate legacy route prefix/);
  const b = clone(realLike); b.home.knowledgeSections[1].categories[0].id = 'java';
  assert.throws(() => normalizeSiteFeatures(b), /Duplicate knowledge category/);
  const c = clone(realLike); c.rss.timezone = 'Mars/OlympusMons';
  assert.throws(() => normalizeSiteFeatures(c), /IANA timezone/);
  const d = clone(realLike); d.rss.workoutSince = '2026-13';
  assert.throws(() => normalizeSiteFeatures(d), /YYYY-MM/);
  const e = clone(realLike); e.rss.maxItems = 0;
  assert.throws(() => normalizeSiteFeatures(e), /maxItems/);
});

test('note taxonomy is isolated to site config and fails on duplicate appended categories', () => {
  const config = clone(base);
  config.noteTaxonomy = {
    appendedCategoryOrder: ['economics', 'photography'],
    translationsEn: { categories: { economics: 'Economics' }, tags: { '摄影': 'Photography' } },
  };
  const value = normalizeSiteFeatures(config).noteTaxonomy;
  assert.deepEqual(value.appendedCategoryOrder, ['economics', 'photography']);
  assert.equal(value.translationsEn.categories.economics, 'Economics');
  assert.equal(value.translationsEn.tags['摄影'], 'Photography');
  assert.deepEqual(value.translationsEn.rootTopics, {});
  config.noteTaxonomy.appendedCategoryOrder.push('economics');
  assert.throws(() => normalizeSiteFeatures(config), /unique category IDs/);
});

test('RSS month boundaries honor UTC, Asia/Shanghai, and DST-aware timezones', () => {
  assert.equal(zonedStartOfNextMonth('2026-09', 'Asia/Shanghai').toISOString(), '2026-09-30T16:00:00.000Z');
  assert.equal(zonedStartOfNextMonth('2026-09', 'UTC').toISOString(), '2026-10-01T00:00:00.000Z');
  assert.equal(zonedStartOfNextMonth('2026-02', 'America/New_York').toISOString(), '2026-03-01T05:00:00.000Z');
  assert.equal(zonedStartOfNextMonth('2026-06', 'America/New_York').toISOString(), '2026-07-01T04:00:00.000Z');
});
