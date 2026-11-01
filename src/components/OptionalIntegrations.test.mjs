import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL(name, import.meta.url), "utf8");

test("public Ask Blog requires explicit opt-in and the two public settings", async () => {
  const layout = await read("../layouts/BaseLayout.astro");
  assert.match(layout, /PUBLIC_ASK_BLOG_ENABLED\s*===\s*"true"/);
  assert.match(layout, /PUBLIC_ASK_BLOG_WORKER_URL/);
  assert.match(layout, /PUBLIC_ASK_BLOG_TURNSTILE_SITE_KEY/);
  assert.match(layout, /askBlogEnabled && <AskBlogSession locale=\{locale\}/);
});

test("analytics and reactions remain independent optional site integrations", async () => {
  const layout = await read("../layouts/BaseLayout.astro");
  const reactions = await read("./ContentReaction.astro");
  assert.match(layout, /analytics && umamiWebsiteId && umamiProxyOrigin/);
  assert.match(layout, /src="\/u\.js"/);
  assert.match(reactions, /const enabled = Boolean\(endpoint\)/);
  assert.match(reactions, /\{enabled && \(/);
});

test("content analytics runtime uses engine-neutral navigation cleanup keys", async () => {
  const runtime = await read("./ContentAnalyticsRuntime.astro");
  assert.ok(runtime.includes("__inkerioContentAnalyticsPageCleanup"));
  assert.ok(runtime.includes("__inkerioContentAnalyticsBootstrapCleanup"));
  assert.ok(!runtime.includes("__thinkerContentAnalytics"));
});
