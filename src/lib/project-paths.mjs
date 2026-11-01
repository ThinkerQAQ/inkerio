export function documentIdFromPath(entry) {
  const source = entry.replaceAll("\\", "/").replace(/\.md$/i, "");
  if (source.startsWith("documents/")) return source.slice("documents/".length);
  const match = source.match(/^projects\/([^/]+)\/docs\/(.*)$/);
  if (!match) throw new Error(`Invalid project document path: ${entry}`);
  const [, project, file] = match;
  return file.startsWith("en/") ? `en/${project}/${file.slice(3)}` : `${project}/${file}`;
}
export function projectDocumentSlug(document) {
  const id = (document.data.translationOf ?? document.id).replace(/^en\//, "");
  const prefix = `${document.data.project}/`;
  if (!id.startsWith(prefix) || !id.slice(prefix.length) || id.split("/").some((part) => !part || part === "." || part === "..")) throw new Error(`Invalid project document ID: ${document.id}`);
  return id.slice(prefix.length);
}
