import type { Locale } from "../config/i18n";
import { SITE_FEATURES } from "../config/site-features";

const { categories: CATEGORY_LABELS_EN, rootTopics: ROOT_TOPIC_LABELS_EN,
  topics: TOPIC_LABELS_EN, sourceLabels: SOURCE_LABELS_EN,
  tags: TAG_LABELS_EN } = SITE_FEATURES.noteTaxonomy.translationsEn;

const HAN_CHARACTER = /[\u3400-\u9fff]/;

function splitNumericPrefix(label: string): { prefix: string; value: string } {
  const match = label.match(/^((?:\d+\.)+\s*)(.+)$/);
  return match ? { prefix: match[1]!, value: match[2]!.trim() } : { prefix: "", value: label.trim() };
}

function fallbackTopicLabel(id: string, label: string): string {
  const source = label || id;
  return source.replaceAll("_", " ");
}

export function localizeNoteCategoryLabel(
  category: string,
  label: string,
  locale: Locale,
): string {
  if (locale !== "en") return label;
  return CATEGORY_LABELS_EN[category] ?? label;
}

export function localizeNoteTopicLabel(
  category: string,
  id: string,
  label: string,
  locale: Locale,
): string {
  if (locale !== "en") return label;

  const { prefix, value } = splitNumericPrefix(label);
  const translated = id === "__root"
    ? ROOT_TOPIC_LABELS_EN[category] ?? SOURCE_LABELS_EN[value]
    : TOPIC_LABELS_EN[id] ?? SOURCE_LABELS_EN[value];

  return `${prefix}${translated ?? fallbackTopicLabel(id, value)}`;
}

export function localizeNoteTagLabel(tag: string, locale: Locale): string | undefined {
  if (locale !== "en") return tag;
  if (!HAN_CHARACTER.test(tag)) return tag;
  return TAG_LABELS_EN[tag] ?? SOURCE_LABELS_EN[tag];
}
