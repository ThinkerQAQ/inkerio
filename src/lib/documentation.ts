import type { CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "../config/i18n";
import type { ProjectEntry } from "./content";
import { projectDocumentSlug } from "./project-paths.mjs";
export type DocumentEntry = CollectionEntry<"documents">;
export function documentHref(document: DocumentEntry): string {
  return localizePath(document.data.language, `/projects/${document.data.project}/docs/${projectDocumentSlug(document)}/`);
}
export function projectDocuments(project: ProjectEntry, documents: DocumentEntry[], locale: Locale): DocumentEntry[] {
  return project.data.documents.map((id) => {
    const root = documents.find((entry) => entry.id === id);
    if (!root || root.data.translationOf || root.data.project !== project.id) throw new Error(`Project ${project.id}: invalid document root ${id}`);
    return documents.find((entry) => entry.data.translationOf === id && entry.data.language === locale) ?? root;
  });
}
export function validateDocuments(documents: DocumentEntry[], projects: ProjectEntry[]): void {
  const locales = new Set<string>();
  for (const project of projects) {
    if (new Set(project.data.documents).size !== project.data.documents.length) throw new Error(`Duplicate document in ${project.id}`);
    projectDocuments(project, documents, "zh");
  }
  for (const document of documents) {
    const project = projects.find((entry) => entry.id === document.data.project);
    const rootId = document.data.translationOf ?? document.id;
    if (!project || !project.data.documents.includes(rootId)) throw new Error(`Document ${document.id} is not registered in its project`);
    projectDocumentSlug(document);
    const key = `${rootId}:${document.data.language}`;
    if (locales.has(key)) throw new Error(`Duplicate document translation ${key}`);
    locales.add(key);
    if (document.data.translationOf && !documents.some((entry) => entry.id === rootId && entry.data.project === project.id && entry.data.language !== document.data.language && !entry.data.translationOf)) throw new Error(`Invalid document translation ${document.id}`);
  }
}
export function documentAlternatives(document: DocumentEntry, documents: DocumentEntry[]) {
  const id = document.data.translationOf ?? document.id;
  return documents.filter((entry) => (entry.data.translationOf ?? entry.id) === id).map((entry) => ({ locale: entry.data.language, href: documentHref(entry) }));
}
