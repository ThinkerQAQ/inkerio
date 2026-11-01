# Optional Cloudflare D1 reaction backend

This is a **self-hostable reference implementation** for Inkerio's portable `http` reactions provider. It uses the same HTTP wire contract as the existing ThinkerQAQ production Worker, but it contains **no production binding ID, domain, database, user records, or API credentials**. It is not deployed by Inkerio. Each adopter owns the Cloudflare account and database.

## API (version 1)

All calls target `https://YOUR_WORKER/v1/reactions?contentType=article&contentId=slug`, with browser `Origin` and `X-Reaction-Visitor` (random 16–128 character ID). `contentType` is `article`, `note`, `fitness`, or `life`. `contentId` is a stable entry ID (fitness uses `YYYY-MM`).

| HTTP method | Operation | JSON response |
| --- | --- | --- |
| `GET` | Read count and this visitor's state | `{ "count": 0, "reacted": false }` |
| `PUT` | Idempotently add one reaction | `{ "count": 1, "reacted": true }` |
| `DELETE` | Idempotently remove it | `{ "count": 0, "reacted": false }` |

The Worker stores an HMAC-SHA256 **hash** of the browser's pseudonymous visitor ID in D1, not the raw ID; it does not persist user email or IP. Rate limiting uses the configured Cloudflare Worker `REACTION_RATE_LIMITER` binding. `ALLOWED_ORIGINS` is an explicit comma-separated allowlist; no wildcard credentials or permissive `*` CORS. For production set a strong server-side `REACTION_HMAC_SECRET` through Wrangler Secrets and restrict origins. The site has a responsibility to publish its own privacy notice and implement deletion/retention policies where applicable.

## Deploy under your own account

Use Node.js and Wrangler. This example is intentionally **not connected** to ThinkerQAQ's production D1; do not copy `workers/blog-reactions/wrangler.jsonc` from that deployment repo.

```sh
cd examples/cloudflare/reactions
cp wrangler.example.jsonc wrangler.jsonc
# Edit wrangler.jsonc: your Worker name, allowed site origins, D1 database ID.
npx wrangler@latest d1 create my-blog-reactions
# Copy the returned database_id into wrangler.jsonc (the all-zero ID is invalid).
npx wrangler@latest d1 migrations apply REACTIONS_DB --remote --config wrangler.jsonc
npx wrangler@latest secret put REACTION_HMAC_SECRET --config wrangler.jsonc
npx wrangler@latest deploy --config wrangler.jsonc
```

Use your own domain in the public Inkerio `site.config.json`:

```json
{ "integrations": { "reactions": { "provider": "http", "endpoint": "https://your-reactions.example.com" } } }
```

`provider: "none"` disables reactions entirely. The legacy `PUBLIC_REACTION_WORKER_URL` CI variable is still accepted and takes precedence over the configured endpoint. The generic HTTP adapter also accepts `apiPath` for a compatible non-Cloudflare server, but that server **must** implement the same response and idempotency contract.

```sh
node --test examples/cloudflare/reactions/src/index.test.js
```

**Safety:** Never run production migrations using an example or another user's D1 binding. No automatic data transfer occurs. The root Inkerio MIT license covers this original reference source; Cloudflare and transitive tooling have their own licenses/terms.
