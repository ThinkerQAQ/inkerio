// Optional Umami Cloud collector proxy. No publishing, AI, KV, or site data.
// The upstream is fixed to avoid turning this reference into an open proxy.
const SCRIPT_UPSTREAM = 'https://cloud.umami.is/script.js';
const COLLECT_UPSTREAM = 'https://gateway.umami.is/api/send';
const MAX_BODY_BYTES = 64 * 1024;
const ALLOWED_REQUEST_HEADERS = ['content-type', 'x-umami-website-id', 'x-umami-hostname', 'x-umami-cache'];

function allowlist(value) {
  return new Set(String(value || '').split(',').map(item => item.trim()).filter(Boolean));
}
function cors(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': ALLOWED_REQUEST_HEADERS.join(','),
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}
function response(body, status, origin = '') {
  return new Response(body, { status, headers: {
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...(origin ? { ...cors(origin), 'content-type': 'application/json; charset=utf-8' } : {}),
  } });
}

export async function handleRequest(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname === '/health' && request.method === 'GET') {
    return Response.json({ status: 'ok' }, { headers: { 'cache-control': 'no-store' } });
  }
  // Serve the official Umami script from the collector domain only if needed.
  // A site may instead vendor an audited `/u.js` on its static origin.
  if (pathname === '/u.js') {
    if (request.method !== 'GET') return response('Method not allowed', 405);
    try {
      const upstream = await fetch(SCRIPT_UPSTREAM);
      return new Response(upstream.body, { status: upstream.status, headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
        'x-content-type-options': 'nosniff',
      } });
    } catch { return response('Tracker temporarily unavailable', 502); }
  }
  if (pathname !== '/api/send') return response('Not found', 404);
  const origin = request.headers.get('origin') || '';
  if (!origin || !allowlist(env.ALLOWED_ORIGINS).has(origin)) return response('Origin not allowed', 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (request.method !== 'POST') return response('Method not allowed', 405, origin);

  // Public website IDs and CORS are not authorization secrets; enforce a
  // Cloudflare-controlled per-client rate limit before forwarding requests.
  if (!env.ANALYTICS_RATE_LIMITER) return response('Rate limiter is not configured', 503, origin);
  const ip = request.headers.get('cf-connecting-ip') || origin;
  const { success: withinLimit } = await env.ANALYTICS_RATE_LIMITER.limit({ key: ip });
  if (!withinLimit) return response('Too many requests', 429, origin);
  const websiteId = request.headers.get('x-umami-website-id') || '';
  // Fail closed unless owner explicitly selects their sites and CORS origins.
  if (!websiteId || !allowlist(env.ALLOWED_WEBSITE_IDS).has(websiteId)) return response('Unknown Umami website', 403, origin);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return response('JSON content type required', 415, origin);
  }
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return response('Payload too large', 413, origin);
  let body;
  try { body = await request.arrayBuffer(); } catch { return response('Invalid request body', 400, origin); }
  if (body.byteLength > MAX_BODY_BYTES) return response('Payload too large', 413, origin);
  try {
    const data = JSON.parse(new TextDecoder().decode(body));
    // Avoid routing arbitrary non-Umami JSON through the collector.
    if (!data || typeof data !== 'object' || !['event', 'identify'].includes(data.type)) {
      return response('Unsupported Umami event', 400, origin);
    }
    if (data.payload?.website !== websiteId) return response('Website mismatch', 403, origin);
  } catch { return response('Invalid JSON payload', 400, origin); }

  const headers = new Headers();
  for (const key of ALLOWED_REQUEST_HEADERS) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set('origin', origin);
  // Only forward authorized request metadata. Do not forward cookies, IP
  // addresses, spoofed geography, Authorization, or arbitrary client headers.
  try {
    const upstream = await fetch(COLLECT_UPSTREAM, { method: 'POST', body, headers });
    const outputHeaders = new Headers({ ...cors(origin), 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    const type = upstream.headers.get('content-type');
    if (type) outputHeaders.set('content-type', type);
    return new Response(upstream.body, { status: upstream.status, headers: outputHeaders });
  } catch { return response('Upstream temporarily unavailable', 502, origin); }
}
export default { fetch: handleRequest };
