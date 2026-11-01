# Optional Cloudflare Umami Cloud collector

This **stateless, self-hostable reference Worker** proxies Umami Cloud tracking requests and optionally its public tracker script; it does **not** contain any ThinkerQAQ Analytics/KV/AI Search code or stored analytics data. It is not an official Umami service or installed by Inkerio. Your actual counts live in **your own Umami website**, not in this Worker. This reference does not implement the production site's bot filtering, detailed analytics reports or scheduled processing.

## Install

1. Create your own Umami Cloud website and note its public **website ID**. Read the upstream provider's terms and your site's privacy obligations.
2. Install Node.js/Wrangler and, in `examples/cloudflare/umami-collector`, copy `wrangler.example.jsonc` to `wrangler.jsonc`.
3. Set `name`, `ALLOWED_ORIGINS` (your site URLs only), `ALLOWED_WEBSITE_IDS` (your Umami public site IDs only).
4. Run `npx wrangler@latest deploy --config wrangler.jsonc` under **your own** Cloudflare account. Do not publish service credentials in `wrangler.jsonc`.
5. In your public site config, configure the Umami provider:

```json
{
  "integrations": {
    "analytics": {
      "provider": "umami",
      "scriptSrc": "https://your-collector.example.com/u.js",
      "websiteId": "YOUR_PUBLIC_UMAMI_ID",
      "collectorOrigin": "https://your-collector.example.com"
    }
  }
}
```

The browser fetches `GET /u.js` from your Worker and POSTs `/api/send` to the same **Worker origin**. If you already serve `/u.js` as an audited local asset, set `scriptSrc` to `/u.js` instead. This does **not** make your POST same-origin; a genuine same-origin reverse proxy is required to forward `/api/send` on a static site domain. You can also avoid this Worker and configure `collectorOrigin` directly to a supported Umami endpoint if its CORS and privacy requirements allow it.

The Worker rejects requests from origins/websites not explicitly configured and limits event payloads to 64 KiB. It forwards a small header allowlist and never forwards cookies, bearer tokens, client-supplied geography or arbitrary upstream URLs. No wildcard CORS. The `/health` endpoint reports only `{ "status": "ok" }`; this confirms liveness, not recorded pageviews or mainland connectivity. To validate tracking, check browser POST status and new events in your Umami dashboard using a permitted test visit.

```sh
node --test examples/cloudflare/umami-collector/src/index.test.js
```

Inkerio's custom analytics adapter is also available with `provider: "script"` and a configured public `scriptSrc` plus optional `data-*` attributes; it does not require Cloudflare or Umami. For controlled deployment, keep user-specific DNS, Worker bindings and credentials outside the engine. Original reference code is covered by the root MIT license; provider SDK/hosting terms remain separate.
