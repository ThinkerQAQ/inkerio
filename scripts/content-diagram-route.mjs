export function contentDiagramRoute(collection, id, data) {
  const locale = data.language || "zh";
  const prefix = locale === "zh" ? "" : `/${locale}`;
  const root = data.translationOf || id.replace(new RegExp(`^${locale}/`), "");
  if (collection === "documents") return `${prefix}/series/${data.series}/docs/${root}/`;
  if (collection === "project-translations") return `${prefix}/projects/${root}/`;
  if (collection === "note-translations") return `${prefix}/notes/${root}/`;
  if (collection === "articles") return `${prefix}/articles/${id.replace(new RegExp(`^${locale}/`), "")}/`;
  return `/${collection}/${id}/`;
}
