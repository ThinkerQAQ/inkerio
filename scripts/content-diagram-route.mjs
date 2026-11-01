export function contentDiagramRoute(collection, id, data) {
  const locale = data.language || "zh";
  const prefix = locale === "zh" ? "" : `/${locale}`;
  const root = (data.translationOf || id.replace(/^(?:[^/]+)\/docs\//, "").replace(new RegExp(`^${locale}/`), "")).replace(/^en\//, "");
  if (collection === "documents") {
    const project = id.includes("/docs/") ? id.split("/")[0] : "";
    const slug = data.translationOf ? root : project ? `${project}/${root}` : root;
    return `${prefix}/projects/${data.project}/docs/${slug.replace(new RegExp(`^${data.project}/`), "")}/`;
  }
  if (collection === "projects" && /\/README(?:_ZH)?$/.test(id)) return `${prefix}/projects/${data.project || id.split("/")[0]}/`;
  if (collection === "project-translations") return `${prefix}/projects/${root}/`;
  if (collection === "note-translations") return `${prefix}/notes/${root}/`;
  if (collection === "articles") return `${prefix}/articles/${id.replace(new RegExp(`^${locale}/`), "")}/`;
  return `/${collection}/${id}/`;
}
