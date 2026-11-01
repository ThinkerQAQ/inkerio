import rss from "@astrojs/rss";
import { SITE } from "../../config/site";
import { getFeedItems } from "../../lib/rss";
import { SITE_FEATURES } from "../../config/site-features";

export async function GET(context: { site?: URL }) {
  return rss({
    title: SITE.title,
    description: SITE_FEATURES.rss.descriptions.en,
    site: context.site ?? new URL(SITE.url),
    items: await getFeedItems("en"),
    customData: "<language>en</language>",
  });
}
