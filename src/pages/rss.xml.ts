import rss from "@astrojs/rss";
import { SITE } from "../config/site";
import { DEFAULT_LOCALE } from "../config/i18n";
import { getFeedItems } from "../lib/rss";
import { SITE_FEATURES } from "../config/site-features";

export async function GET(context: { site?: URL }) {
  return rss({
    title: SITE.title,
    description: SITE_FEATURES.rss.descriptions.zh,
    site: context.site ?? new URL(SITE.url),
    items: await getFeedItems(DEFAULT_LOCALE),
    customData: "<language>zh-CN</language>",
  });
}
