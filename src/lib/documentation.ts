import type { CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "../config/i18n";
import { type SeriesEntry } from "./content";
export type DocumentEntry = CollectionEntry<"documents">;
export function documentHref(document: DocumentEntry): string {
  const id = (document.data.translationOf ?? document.id).replace(/^en\//, "");
  return localizePath(document.data.language, `/series/${document.data.series}/docs/${id}/`);
}
export function seriesDocuments(series: SeriesEntry, documents: DocumentEntry[], locale: Locale): DocumentEntry[] {
  return series.data.relatedDocuments.map((id) => {
    const root = documents.find((entry) => entry.id === id);
    if (!root || root.data.translationOf || root.data.series !== series.id) {
      throw new Error(`Series ${series.id}: invalid document root ${id}`);
    }
    return documents.find((entry) => entry.data.translationOf === id && entry.data.language === locale) ?? root;
  });
}
export function validateDocuments(documents: DocumentEntry[], seriesEntries: SeriesEntry[]): void {
  const locales = new Set<string>();
  for (const series of seriesEntries) {
    if (new Set(series.data.relatedDocuments).size !== series.data.relatedDocuments.length) throw new Error(`Duplicate document in ${series.id}`);
    if (series.data.kind !== "documentation" && series.data.relatedDocuments.length) throw new Error(`Document series ${series.id} requires kind: documentation`);
    seriesDocuments(series, documents, "zh");
  }
  for (const document of documents) {
    const series = seriesEntries.find((entry) => entry.id === document.data.series);
    const rootId = document.data.translationOf ?? document.id;
    if (!series || series.data.kind !== "documentation" || !series.data.relatedDocuments.includes(rootId)) throw new Error(`Document ${document.id} is not registered in its documentation series`);
    const key = `${rootId}:${document.data.language}`;
    if (locales.has(key)) throw new Error(`Duplicate document translation ${key}`);
    locales.add(key);
    if (document.data.translationOf && (!documents.some((entry) => entry.id === rootId && entry.data.series === series.id && entry.data.language !== document.data.language && !entry.data.translationOf))) throw new Error(`Invalid document translation ${document.id}`);
  }
}
export function documentAlternatives(document: DocumentEntry, documents: DocumentEntry[]) {
  const id = document.data.translationOf ?? document.id;
  return documents.filter((entry) => (entry.data.translationOf ?? entry.id) === id).map((entry) => ({ locale: entry.data.language, href: documentHref(entry) }));
}
