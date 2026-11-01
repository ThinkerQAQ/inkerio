// Public, build-time integration contract. Runtime credentials stay in providers.
const record = (value, field) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value;
};
const pick = (value, choices, field) => {
  if (!choices.includes(value)) throw new Error(`${field} must be one of ${choices.join(', ')}`);
  return value;
};
const url = (value, field, { allowLocal = false } = {}) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a URL`);
  const input = value.trim();
  if (allowLocal && /^\/(?!\/)[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9_-]+)?$/.test(input)) return input;
  let parsed;
  try { parsed = new URL(input); } catch { throw new Error(`${field} must be HTTPS or site-local`); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !parsed.hostname || parsed.search || parsed.hash) {
    throw new Error(`${field} must be HTTPS without credentials, query or fragment`);
  }
  return parsed.toString().replace(/\/$/, '');
};
const optionalUrl = (value, field, opts) => value === undefined || value === '' ? '' : url(value, field, opts);
const optionalOrigin = (value, field) => {
  const origin = optionalUrl(value, field);
  if (!origin) return '';
  const parsed = new URL(origin);
  if (parsed.pathname !== '/') throw new Error(`${field} must be an HTTPS origin without a path`);
  return parsed.origin;
};
const optionalString = (value, field) => {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value.trim();
};
const path = (value, field) => {
  const text = optionalString(value, field);
  if (!text || !/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(text) || text.includes('..') || text.includes('//')) {
    throw new Error(`${field} must be an absolute site-local URL pathname`);
  }
  return text;
};

export function normalizeSiteIntegrations(value) {
  const config = value === undefined ? {} : record(value, 'integrations');
  const analytics = config.analytics === undefined ? {} : record(config.analytics, 'integrations.analytics');
  const reactions = config.reactions === undefined ? {} : record(config.reactions, 'integrations.reactions');
  const analyticsProvider = pick(analytics.provider ?? 'auto', ['auto', 'none', 'umami', 'script'], 'integrations.analytics.provider');
  const reactionsProvider = pick(reactions.provider ?? 'auto', ['auto', 'none', 'http'], 'integrations.reactions.provider');
  const rawAttributes = analytics.attributes === undefined ? {} : record(analytics.attributes, 'integrations.analytics.attributes');
  const attributes = Object.fromEntries(Object.entries(rawAttributes).map(([key, value]) => {
    if (!/^data-[a-z][a-z0-9-]*$/.test(key) || typeof value !== 'string' || !value.trim()) {
      throw new Error('integrations.analytics.attributes must contain nonempty data-* string attributes');
    }
    return [key, value.trim()];
  }));
  if (analyticsProvider !== 'script' && Object.keys(attributes).length) {
    throw new Error('integrations.analytics.attributes requires provider=script');
  }
  const scriptSrc = optionalUrl(analytics.scriptSrc, 'integrations.analytics.scriptSrc', { allowLocal: true });
  if (analyticsProvider === 'script' && !scriptSrc) throw new Error('integrations.analytics.scriptSrc is required for provider=script');
  const collectorOrigin = optionalOrigin(analytics.collectorOrigin, 'integrations.analytics.collectorOrigin');
  const websiteId = optionalString(analytics.websiteId, 'integrations.analytics.websiteId');
  const endpoint = optionalOrigin(reactions.endpoint, 'integrations.reactions.endpoint');
  const apiPath = path(reactions.apiPath ?? '/v1/reactions', 'integrations.reactions.apiPath');
  return {
    analytics: { provider: analyticsProvider, scriptSrc: scriptSrc || '/u.js', websiteId, collectorOrigin, attributes },
    reactions: { provider: reactionsProvider, endpoint, apiPath },
  };
}

// The old PUBLIC_* variables are intentionally supported until each site has
// migrated to site.config.json. `none` always disables the integration.
export function resolveAnalyticsIntegration(config, env = {}) {
  if (config.provider === 'none') return null;
  if (config.provider === 'script') return { provider: 'script', src: config.scriptSrc, attributes: config.attributes };
  const websiteId = optionalString(env.PUBLIC_UMAMI_WEBSITE_ID, 'PUBLIC_UMAMI_WEBSITE_ID') || config.websiteId;
  const origin = optionalOrigin(env.PUBLIC_UMAMI_PROXY_ORIGIN, 'PUBLIC_UMAMI_PROXY_ORIGIN') || config.collectorOrigin;
  if (!websiteId || !origin) return null;
  return { provider: 'umami', src: config.scriptSrc, websiteId, collectorOrigin: origin };
}
export function resolveReactionIntegration(config, env = {}) {
  if (config.provider === 'none') return null;
  const endpoint = optionalOrigin(env.PUBLIC_REACTION_WORKER_URL, 'PUBLIC_REACTION_WORKER_URL') || config.endpoint;
  if (!endpoint) return null;
  return { provider: 'http', endpoint, apiPath: config.apiPath };
}
