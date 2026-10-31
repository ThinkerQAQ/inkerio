# Inkerio CLI commands

This standalone engine no longer requires Go or BlogCTL.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install Node dependencies |
| `npm run dev:quick` | Assemble and preview public sample content |
| `node scripts/assemble-content.mjs --content-root ../content` | Assemble any standalone content source |
| `npm run check` | Astro diagnostics |
| `npm run test:engine` | Engine and content-safety tests |
| `npm run build` | Build static site and Pagefind |
| `npm run build:template` | Assemble public template and build |
| `npm run preview` | Preview static output |

External syndication belongs to [BlogCTL](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/tools/blogctl).
