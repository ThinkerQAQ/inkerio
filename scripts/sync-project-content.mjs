import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { parse, stringify } from 'yaml';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

// Parse Markdown with the existing parser; edit only link destinations and the duplicate title.
export function prepareReadme(markdown, source) {
  const { repository, revision, file, routes = {} } = source;
  const base = new URL(`https://github.com/${repository}/blob/${revision}/${file}`);
  function destination(url, image = false) {
    if (!url || url.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url;
    const resolved = new URL(url, base);
    const relative = resolved.pathname.split(`/blob/${revision}/`)[1];
    const mapped = relative && routes[decodeURIComponent(relative)];
    if (!image && mapped) return mapped + resolved.search + resolved.hash;
    return image ? resolved.href.replace(`https://github.com/${repository}/blob/`, `https://raw.githubusercontent.com/${repository}/`) : resolved.href;
  }
  const tree = unified().use(remarkParse).parse(markdown);
  const edits = [];
  const first = tree.children[0];
  if (first?.type === 'heading' && first.depth === 1) edits.push([first.position.start.offset, first.position.end.offset, '']);
  function visit(node) {
    if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
      const start = node.position.start.offset, end = node.position.end.offset;
      const original = markdown.slice(start, end);
      const url = destination(node.url, node.type === 'image' || (node.type === 'definition' && imageDefinitions.has(node.identifier)));
      if (url !== node.url) {
        const index = original.lastIndexOf(node.url);
        if (index < 0) throw new Error(`Cannot rewrite escaped link destination: ${node.url}`);
        edits.push([start + index, start + index + node.url.length, url]);
      }
    }
    if (node.type === 'html') {
      const start = node.position.start.offset, end = node.position.end.offset;
      const html = markdown.slice(start, end).replace(/\b(href|src)=(['"])(.*?)\2/gi, (_, key, quote, value) => `${key}=${quote}${destination(value, key.toLowerCase() === 'src')}${quote}`);
      edits.push([start, end, html]);
    }
    for (const child of node.children ?? []) visit(child);
  }
  const imageDefinitions = new Set();
  function findImages(node) { if (node.type === 'imageReference') imageDefinitions.add(node.identifier); for (const child of node.children ?? []) findImages(child); }
  findImages(tree);
  visit(tree);
  for (const [start, end, replacement] of edits.sort((a,b) => b[0]-a[0])) markdown = markdown.slice(0,start) + replacement + markdown.slice(end);
  return markdown.trim() + '\n';
}

function frontmatter(data, body = '') { return `---\n${stringify(data)}---\n\n${body}`; }
function plainText(node) { return node.value ?? (node.children ?? []).map(plainText).join(''); }
export function describeDocument(markdown, filename) {
  const tree = unified().use(remarkParse).parse(markdown);
  const title = tree.children.find((node) => node.type === 'heading');
  const paragraph = tree.children.find((node) => node.type === 'paragraph');
  return { title: title ? plainText(title) : path.posix.basename(filename, '.md'),
    description: paragraph ? plainText(paragraph).replace(/\s+/g, ' ').slice(0, 180) : '' };
}
export function documentIdentity(file) {
  let relative = file.replace(/^docs\//, '');
  let locale = /(?:^|\/)(?:zh|zh-CN|cn)(?:\/)|\.(?:zh|zh-CN)\.md$|README_ZH\.md$/i.test(relative) ? 'zh' : 'en';
  relative = relative.replace(/README_ZH\.md$/i, 'README.md').replace(/^(?:zh|zh-CN|cn|en|en-US)\//i, '').replace(/\.(?:zh|zh-CN|en|en-US)\.md$/i, '.md');
  return { locale, slug: relative.replace(/\.md$/i, '') };
}
async function getPublic(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'Inkerio-project-sync' } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}
export async function syncProjectContent(contentRoot) {
  const root = path.resolve(contentRoot);
  const manifest = JSON.parse(await readFile(path.join(root, 'src/data/project-sources.json'), 'utf8'));
  const pending = [];
  const stale = [];
  for (const source of manifest.projects) {
    if (!/^[\w-]+$/.test(source.id) || !/^[\w.-]+\/[\w.-]+$/.test(source.repository) || !/^[a-f\d]{40}$/.test(source.revision)) throw new Error('Project sources require a valid ID, public repository and pinned commit');
    const directory = path.join(root, 'src/content/projects', source.id);
    const metadataPath = path.join(directory, 'project.md');
    const original = await readFile(metadataPath, 'utf8');
    const header = original.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!header) throw new Error(`Missing project metadata: ${source.id}`);
    const metadata = parse(header[1]);
    const seriesId = `${source.id}-docs`;
    const tree = source.docs === false ? { tree: [] } : await (await getPublic(`https://api.github.com/repos/${source.repository}/git/trees/${source.revision}?recursive=1`)).json();
    if (tree.truncated) throw new Error(`Source tree is truncated: ${source.repository}`);
    const files = tree.tree.filter((entry) => entry.type === 'blob' && /^docs\/.+\.md$/i.test(entry.path))
      .map((entry) => ({ file: entry.path, ...documentIdentity(entry.path) })).sort((a,b) => a.slug.localeCompare(b.slug, 'en') || a.locale.localeCompare(b.locale));
    const identities = new Map();
    for (const item of files) {
      const group = identities.get(item.slug) ?? {};
      if (group[item.locale]) throw new Error(`Duplicate documentation language: ${item.slug} ${item.locale}`);
      group[item.locale] = item; identities.set(item.slug, group);
    }
    const routes = { ...source.routes };
    for (const item of files) routes[item.file] = `${item.locale === 'en' ? '/en' : ''}/series/${seriesId}/docs/${source.id}/${item.slug}/`;
    const roots = [];
    const expectedDocs = new Set();
    for (const [slug, group] of identities) {
      const rootLocale = group.zh ? 'zh' : 'en';
      const rootId = `${source.id}/${slug}`;
      roots.push(rootLocale === 'en' ? `en/${rootId}` : rootId);
      for (const [locale, item] of Object.entries(group)) {
        const markdown = (await (await getPublic(`https://raw.githubusercontent.com/${source.repository}/${source.revision}/${item.file}`)).text()).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
        const data = { ...describeDocument(markdown, item.file), series: seriesId, language: locale, updatedAt: metadata.updatedAt };
        if (locale !== rootLocale) data.translationOf = rootLocale === 'en' ? `en/${rootId}` : rootId;
        const target = path.join(directory, 'docs', ...(locale === 'en' ? ['en'] : []), `${slug}.md`);
        expectedDocs.add(target);
        pending.push([target, frontmatter(data, prepareReadme(markdown, { ...source, file: item.file, routes }))]);
      }
    }
    async function findStale(directory) {
      const entries = await readdir(directory, { withFileTypes: true }).catch((error) => { if (error.code === 'ENOENT') return []; throw error; });
      for (const entry of entries) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) await findStale(target);
        else if (entry.isFile() && entry.name.endsWith('.md') && !expectedDocs.has(target)) stale.push(target);
      }
    }
    await findStale(path.join(directory, 'docs'));
    for (const [locale, file] of Object.entries(source.files)) {
      if (!['zh', 'en'].includes(locale) || file.startsWith('/') || file.split('/').includes('..') || !/\.md$/i.test(file)) throw new Error('Invalid README locale or path');
      const body = prepareReadme(await (await getPublic(`https://raw.githubusercontent.com/${source.repository}/${source.revision}/${file}`)).text(), { ...source, file, routes });
      pending.push([path.join(directory, locale === 'zh' ? 'README_ZH.md' : 'README.md'), frontmatter({ project: source.id, language: locale }, body)]);
    }
    pending.push([path.join(directory, 'series.md'), frontmatter({
      title: metadata.title, description: metadata.description, status: metadata.status === 'archived' ? 'complete' : 'active',
      updatedAt: metadata.updatedAt, kind: 'documentation', project: source.id, relatedDocuments: roots,
      translations: { en: { title: metadata.translations?.en?.title ?? metadata.title, description: metadata.translations?.en?.description ?? metadata.description } },
    })]);
  }
  // Validate and download every source before replacing synced Markdown. Other project files are preserved.
  for (const [target, content] of pending) { await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); }
  for (const target of stale) await rm(target);
  console.log(`Synchronized ${pending.length} project README, documentation and series files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rootIndex = process.argv.indexOf('--content-root');
  if (rootIndex < 0 || !process.argv[rootIndex + 1]) throw new Error('Usage: node scripts/sync-project-content.mjs --content-root <content repository>');
  await syncProjectContent(process.argv[rootIndex + 1]);
}
