import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSiteIntegrations, resolveAnalyticsIntegration, resolveReactionIntegration } from './site-integrations.mjs';

const defaults = () => normalizeSiteIntegrations();
const legacy = { PUBLIC_UMAMI_WEBSITE_ID: 'public-website-id', PUBLIC_UMAMI_PROXY_ORIGIN: 'https://collect.example.org' };
const reactionEnv = { PUBLIC_REACTION_WORKER_URL: 'https://reactions.example.org/' };

test('a new site starts with both optional integrations disabled', () => {
  const config = defaults();
  assert.equal(resolveAnalyticsIntegration(config.analytics), null);
  assert.equal(resolveReactionIntegration(config.reactions), null);
});

test('legacy site PUBLIC_* environment remains compatible with default config', () => {
  const config = defaults();
  assert.deepEqual(resolveAnalyticsIntegration(config.analytics, legacy), {
    provider: 'umami', src: '/u.js', websiteId: 'public-website-id', collectorOrigin: 'https://collect.example.org',
  });
  assert.deepEqual(resolveReactionIntegration(config.reactions, reactionEnv), {
    provider: 'http', endpoint: 'https://reactions.example.org', apiPath: '/v1/reactions',
  });
});

test('explicit none disables integrations even when legacy PUBLIC_* env vars exist', () => {
  const config = normalizeSiteIntegrations({ analytics: { provider: 'none' }, reactions: { provider: 'none' } });
  assert.equal(resolveAnalyticsIntegration(config.analytics, legacy), null);
  assert.equal(resolveReactionIntegration(config.reactions, reactionEnv), null);
});

test('Umami site config alone enables collection; env overrides are supported', () => {
  const config = normalizeSiteIntegrations({ analytics: {
    provider: 'umami', scriptSrc: 'https://assets.example.com/tracker.js',
    websiteId: 'site-config-id', collectorOrigin: 'https://collect.example.com',
  } });
  const result = resolveAnalyticsIntegration(config.analytics);
  assert.equal(result.websiteId, 'site-config-id');
  assert.equal(result.src, 'https://assets.example.com/tracker.js');
  assert.equal(resolveAnalyticsIntegration(config.analytics, legacy).websiteId, 'public-website-id');
  assert.equal(resolveAnalyticsIntegration(config.analytics, legacy).collectorOrigin, 'https://collect.example.org');
});

test('custom analytics script only exposes explicitly configured public data attributes', () => {
  const config = normalizeSiteIntegrations({ analytics: { provider: 'script', scriptSrc: '/assets/stats.js', attributes: { 'data-site': 'demo' } } });
  assert.deepEqual(resolveAnalyticsIntegration(config.analytics, legacy), { provider: 'script', src: '/assets/stats.js', attributes: { 'data-site': 'demo' } });
});

test('custom HTTP reaction adapter supports own endpoint and protocol path', () => {
  const config = normalizeSiteIntegrations({ reactions: { provider: 'http', endpoint: 'https://feedback.example.net', apiPath: '/api/reactions' } });
  assert.deepEqual(resolveReactionIntegration(config.reactions), { provider: 'http', endpoint: 'https://feedback.example.net', apiPath: '/api/reactions' });
  assert.equal(resolveReactionIntegration(config.reactions, reactionEnv).endpoint, 'https://reactions.example.org');
});

test('provider and public URL configurations reject malformed or unsafe values', () => {
  const invalids = [
    { analytics: { provider: 'unrecognized' } },
    { analytics: { provider: 'script' } },
    { analytics: { provider: 'umami', attributes: { 'data-id': 'x' } } },
    { analytics: { provider: 'script', scriptSrc: 'javascript:alert(1)' } },
    { analytics: { provider: 'script', scriptSrc: '//tracker.example.org/u.js' } },
    { analytics: { provider: 'script', scriptSrc: '/../../secret' } },
    { analytics: { provider: 'script', scriptSrc: '/a.js', attributes: { onload: 'javascript:alert(1)' } } },
    { analytics: { provider: 'umami', collectorOrigin: 'http://localhost:3000' } },
    { analytics: { provider: 'umami', collectorOrigin: 'https://user:password@api.example.com' } },
    { reactions: { provider: 'http', endpoint: 'https://api.example.net?token=secret' } },
    { reactions: { provider: 'http', endpoint: 'https://api.example.net/ignored-path' } },
    { analytics: { provider: 'umami', collectorOrigin: 'https://collector.example.com/api/send' } },
    { reactions: { apiPath: 'https://evil.example.com/path' } },
    { reactions: { apiPath: '/../private' } },
  ];
  for (const invalid of invalids) assert.throws(() => normalizeSiteIntegrations(invalid), undefined, JSON.stringify(invalid));
});

test('legacy environment overrides reject URLs with hidden path configuration', () => {
  const cfg = defaults();
  assert.throws(() => resolveAnalyticsIntegration(cfg.analytics, { ...legacy, PUBLIC_UMAMI_PROXY_ORIGIN: 'https://collector.example.org/api/send' }), /HTTPS origin/);
  assert.throws(() => resolveReactionIntegration(cfg.reactions, { PUBLIC_REACTION_WORKER_URL: 'https://reactions.example.org/not-an-origin' }), /HTTPS origin/);
});
