import { getCollection } from "astro:content";
import type { Locale } from "../config/i18n";
import { SITE_FEATURES } from "../config/site-features";
import { zonedStartOfNextMonth } from "./rss-time.mjs";
import { articleHref } from "./content";
import { getLifeEntries, lifeHref, lifeTitle } from "./life";
import { getWorkoutSummaries, workoutMonthHref, workoutMonthName } from "./workouts";

interface FeedEntry {
  title: string;
  description: string;
  pubDate: Date;
  link: string;
  categories: string[];
  content?: string;
}

const RSS = SITE_FEATURES.rss;
const photoSince = RSS.photoSince ? new Date(RSS.photoSince) : null;

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function workoutPublishedAt(month: string): Date {
  return zonedStartOfNextMonth(month, RSS.timezone);
}

function workoutDescription(
  data: { month: string; trainingDays: number; durationMinutes?: number; volumeKg?: number },
  locale: Locale,
): string {
  const zh = locale === "zh";
  const number = new Intl.NumberFormat(zh ? "zh-CN" : "en-US", { maximumFractionDigits: 1 });
  const parts = [zh ? data.trainingDays + " 天训练" : data.trainingDays + " training days"];
  if (data.durationMinutes !== undefined) {
    parts.push(number.format(data.durationMinutes / 60) + (zh ? " 小时" : " hours"));
  }
  if (data.volumeKg !== undefined) {
    parts.push(number.format(data.volumeKg / 1000) + (zh ? " 吨训练容量" : " t training volume"));
  }
  return workoutMonthName(data.month, locale) + (zh ? "：" : ": ") +
    parts.join(zh ? "，" : ", ") + (zh ? "。" : ".");
}

export async function getFeedItems(locale: Locale, now = new Date()): Promise<FeedEntry[]> {
  const [articles, photos, workouts] = await Promise.all([
    getCollection("articles", ({ data }) => data.status === "published" && data.language === locale),
    getLifeEntries(locale),
    getWorkoutSummaries(),
  ]);

  const currentMonth = new Intl.DateTimeFormat("en-CA", {
    timeZone: RSS.timezone, year: "numeric", month: "2-digit",
  }).format(now);

  const articleItems: FeedEntry[] = articles.map((entry) => ({
    title: entry.data.title,
    description: entry.data.description,
    pubDate: entry.data.publishedAt,
    link: articleHref(entry),
    categories: entry.data.tags,
  }));

  const photoItems: FeedEntry[] = RSS.includePhotography ? photos
    .filter((entry) => !photoSince || entry.data.publishedAt >= photoSince)
    .map((entry) => {
      const description = entry.data.description ?? lifeTitle(entry);
      const cover = entry.data.images[0];
      return {
        title: lifeTitle(entry),
        description,
        pubDate: entry.data.publishedAt,
        link: lifeHref(entry),
        categories: entry.data.tags,
        content: "<p>" + escapeHtml(description) + "</p>" +
          (cover ? '<p><img src="' + escapeHtml(cover.thumbnail ?? cover.src) +
            '" alt="' + escapeHtml(cover.alt) + '" /></p>' : ""),
      };
    }) : [];

  const workoutItems: FeedEntry[] = RSS.includeWorkouts ? workouts
    .filter((entry) => (!RSS.workoutSince || entry.data.month >= RSS.workoutSince) &&
      entry.data.month < currentMonth &&
      entry.data.trainingDays >= RSS.minTrainingDays && (RSS.includeDemoWorkouts || !entry.data.demo))
    .map((entry) => ({
      title: workoutMonthName(entry.data.month, locale) +
        (locale === "zh" ? " · 健身记录" : " · Fitness log"),
      description: workoutDescription(entry.data, locale),
      pubDate: workoutPublishedAt(entry.data.month),
      link: workoutMonthHref(locale, entry.data.month),
      categories: [locale === "zh" ? "健身" : "Fitness"],
    })) : [];

  // Every item has a stable canonical URL. Rebuilding or re-syncing a month
  // cannot create a different RSS identity or move older records to the top.
  const unique = new Map<string, FeedEntry>();
  for (const item of [...articleItems, ...photoItems, ...workoutItems]) {
    if (!unique.has(item.link)) unique.set(item.link, item);
  }
  return [...unique.values()]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime() ||
      a.link.localeCompare(b.link))
    .slice(0, RSS.maxItems);
}
