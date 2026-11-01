import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest } from './index.js';

const owner = 'https://my-blog.example';
const worker = 'https://my-collector.example';
const env = { ALLOWED_ORIGINS: owner, ALLOWED_WEBSITE_IDS: 'my-public-website-id' };
const event = { type: 'event', payload: { website: 'my-public-website-id', url: '/', hostname: 'my-blog.example' } };
function post(extra = {}, body = event) {
  return new Request(worker + '/api/send', {
    method: 'POST', headers: { origin: owner, 'content-type': 'application/json', 'x-umami-website-id': 'my-public-website-id', ...extra },
    body: JSON.stringify(body),
  });
}

test('public health endpoint carries no site data', async () => {
  const res = await handleRequest(new Request(worker + '/health'), env);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});
test('CORS accepts configured origin and rejects other origins without wildcard', async () => {
  const options = new Request(worker + '/api/send', { method: 'OPTIONS', headers: { origin: owner } });
  const res = await handleRequest(options, env);
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), owner);
  assert.equal((await handleRequest(new Request(worker + '/api/send', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }), env)).status, 403);
});
test('POST is disabled without an explicit website allowlist', async () => {
  assert.equal((await handleRequest(post(), { ALLOWED_ORIGINS: owner })).status, 403);
});
test('refuses unrecognized public website IDs and mismatched JSON IDs', async () => {
  assert.equal((await handleRequest(post({ 'x-umami-website-id': 'attacker-site' }), env)).status, 403);
  assert.equal((await handleRequest(post({}, { type: 'event', payload: { website: 'other-site' } }), env)).status, 403);
});
test('refuses non-JSON, malformed events and oversized bodies', async () => {
  assert.equal((await handleRequest(post({ 'content-type': 'text/plain' }), env)).status, 415);
  assert.equal((await handleRequest(post({}, { type: 'exec', payload: { website: 'my-public-website-id' } }), env)).status, 400);
  assert.equal((await handleRequest(post({}, { ...event, padding: 'A'.repeat(70_000) }), env)).status, 413);
});
test('forwards only the allowlisted Umami headers and an approved event to fixed Cloud upstream', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    assert.equal(String(url), 'https://gateway.umami.is/api/send');
    assert.equal(opts.method, 'POST');
    assert.equal(opts.headers.get('origin'), owner);
    assert.equal(opts.headers.get('x-umami-website-id'), 'my-public-website-id');
    assert.equal(opts.headers.get('authorization'), null);
    assert.equal(opts.headers.get('cookie'), null);
    assert.equal(opts.headers.get('x-umami-client-country'), null);
    assert.deepEqual(JSON.parse(new TextDecoder().decode(opts.body)), event);
    return Response.json({ cache: 'next' });
  };
  try {
    const res = await handleRequest(post({ authorization: 'private-test-token', cookie: 'private-test-cookie', 'x-umami-client-country': 'US' }), env);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { cache: 'next' });
  } finally { globalThis.fetch = original; }
});
test('wrong methods and unknown paths do not proxy requests', async () => {
  assert.equal((await handleRequest(new Request(worker + '/api/send', { headers: { origin: owner } }), env)).status, 405);
  assert.equal((await handleRequest(new Request(worker + '/not-a-route'), env)).status, 404);
});
