export function documentIdFromPath(entry) {
  const source = entry.replaceAll("\\", "/").replace(/\.md$/i, "");
  if (source.startsWith("documents/")) return source.slice("documents/".length);
  const match = source.match(/^projects\/([^/]+)\/docs\/(.*)$/);
  if (!match) throw new Error(`Invalid project document path: ${entry}`);
  const [, project, file] = match;
  return file.startsWith("en/") ? `en/${project}/${file.slice(3)}` : `${project}/${file}`;
}
export function seriesIdFromPath(entry) {
  const source = entry.replaceAll("\\", "/").replace(/\.md$/i, "");
  if (source.startsWith("series/")) return source.slice(7);
  const match = source.match(/^projects\/([^/]+)\/series$/);
  if (!match) throw new Error(`Invalid project series path: ${entry}`);
  return `${match[1]}-docs`;
}
