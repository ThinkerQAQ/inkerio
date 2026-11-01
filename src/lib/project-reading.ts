import type { CollectionEntry } from "astro:content";
import { type Locale } from "../config/i18n";
import { localizedProjectSummary, projectHref, seriesHref, type ProjectEntry, type SeriesEntry } from "./content";
import { seriesDocuments, documentHref, type DocumentEntry } from "./documentation";
import type { ReadingCollection } from "./reading";
export type ProjectReadme = CollectionEntry<"projectReadmes">;
export function projectReadme(project: ProjectEntry, readmes: ProjectReadme[], locale: Locale) {
  return readmes.find((entry) => entry.data.project === project.id && entry.data.language === locale);
}
export function projectReadingItems(project: ProjectEntry, series: SeriesEntry | undefined, documents: DocumentEntry[], locale: Locale) {
  return [{ href: projectHref(project, locale), title: "README", description: localizedProjectSummary(project, locale).description,
    language: locale, updatedAt: project.data.updatedAt },
    ...(series ? seriesDocuments(series, documents, locale).map((entry) => ({ href: documentHref(entry), title: entry.data.title,
      description: entry.data.description, language: entry.data.language, updatedAt: entry.data.updatedAt })) : [])];
}
export function projectReadingCollection(project: ProjectEntry, series: SeriesEntry | undefined, documents: DocumentEntry[], locale: Locale, currentHref: string): ReadingCollection {
  const items = projectReadingItems(project, series, documents, locale);
  return { label: locale === "en" ? "Series" : "所属系列", title: localizedProjectSummary(project, locale).title,
    href: series ? seriesHref(series, locale === "en" && !series.data.translations.en ? "zh" : locale) : projectHref(project, locale),
    groups: [{ items: items.map((item) => ({ ...item, current: item.href === currentHref })) }] };
}
export function projectSourceHref(kind: "readmes" | "docs", id: string) {
  return `/project-source/${kind}/${id.split("/").map(encodeURIComponent).join("/")}.md`;
}
