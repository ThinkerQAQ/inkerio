import config from "../../site.config.json";
import { normalizeSiteFeatures } from "../lib/site-features.mjs";

export const SITE_FEATURES = normalizeSiteFeatures(config);
