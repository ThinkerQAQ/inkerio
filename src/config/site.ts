// Site identity lives in the deployment repository. This checked-in file is
// a generic demo; deployments may replace site.config.json before building.
import config from "../../site.config.json";

export const SITE = {
  title: config.title,
  homeTitle: config.homeTitle,
  description: config.description,
  author: config.author,
  icpRecord: config.icpRecord,
  icpLookupUrl: config.icpLookupUrl,
  publicSecurityRecord: config.publicSecurityRecord,
  publicSecurityLookupUrl: config.publicSecurityLookupUrl,
  authorProfilePath: config.authorProfilePath,
  alternateNames: config.alternateNames,
  url: config.url,
  github: config.github,
  profiles: config.profiles,
  repository: config.repository,
  contactEmail: config.contactEmail,
  locale: config.locale,
} as const;

export const ARTICLE_PAGE_SIZE = 10;
export const NOTE_PAGE_SIZE = 10;

export const COMMENTS = {
  provider: "utterances",
  repository: config.commentsRepository,
  label: "blog-comment",
  theme: "preferred-color-scheme",
} as const;

export const NAV_ITEMS = [
  { href: "/articles/", label: "文章" },
  { href: "/projects/", label: "项目" },
  { href: "/series/", label: "系列" },
  { href: "/notes/", label: "笔记" },
  { href: "/life/", label: "生活" },
  { href: "/about/", label: "关于" },
] as const;
