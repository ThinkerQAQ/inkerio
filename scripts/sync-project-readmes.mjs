import { readFile, writeFile } from 'node:fs/promises';
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

export async function syncProjectReadmes(contentRoot) {
  const root = path.resolve(contentRoot);
  const manifest = JSON.parse(await readFile(path.join(root, 'src/data/project-readmes.json'), 'utf8'));
  const pending = [];
  for (const source of manifest.projects) {
    if (!/^[\w-]+$/.test(source.id) || !/^[\w.-]+\/[\w.-]+$/.test(source.repository) || !/^[a-f\d]{40}$/.test(source.revision)) throw new Error('README sources must name a repository and a pinned 40-character commit');
    for (const [locale, file] of Object.entries(source.files)) {
      if (!['zh', 'en'].includes(locale) || file.startsWith('/') || file.split('/').includes('..') || !/\.md$/i.test(file)) throw new Error('Invalid README locale or path');
      const relative = locale === 'zh' ? `projects/${source.id}.md` : `project-translations/${locale}/${source.id}.md`;
      const target = path.resolve(root, 'src/content', relative);
      if (!target.startsWith(path.join(root, 'src/content') + path.sep)) throw new Error('Invalid target path');
      const original = await readFile(target, 'utf8');
      const frontmatter = original.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
      if (!frontmatter) throw new Error(`Missing frontmatter: ${relative}`);
      const response = await fetch(`https://raw.githubusercontent.com/${source.repository}/${source.revision}/${file}`, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`${source.repository}/${file}: HTTP ${response.status}`);
      const body = prepareReadme(await response.text(), { ...source, file });
      pending.push([target, frontmatter[0].trimEnd() + '\n\n' + body]);
    }
  }
  // Fetch and validate every source before replacing any snapshot.
  for (const [target, content] of pending) await writeFile(target, content);
  console.log(`Synchronized ${pending.length} README snapshots from pinned public sources.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rootIndex = process.argv.indexOf('--content-root');
  if (rootIndex < 0 || !process.argv[rootIndex + 1]) throw new Error('Usage: node scripts/sync-project-readmes.mjs --content-root <content repository>');
  await syncProjectReadmes(process.argv[rootIndex + 1]);
}
