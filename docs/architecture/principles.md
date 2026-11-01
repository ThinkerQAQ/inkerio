# Architecture principles

**Definition:** keep a small, stable engine with replaceable components and explicit contracts; reuse mature implementations before custom work.

## Decision hierarchy

1. Is the need already handled by a standard/protocol?
2. Is there a maintained SDK, mature open-source library, service or infrastructure capability?
3. Can an existing provider/profile be configured to solve it?
4. Is a project extension appropriate?
5. Only if these are insufficient, implement a custom mechanism and document its maintenance cost.

## Applied to the blog

- **Core:** canonical content assembly and static site output have stable ownership.
- **Extensions:** platform publishers, search adapters, diagram renderers and EdgeOne integration can change independently.
- **Configuration:** `site.config.json` and CI environment variables define site identity and optional providers without hardcoded secrets.
- **Self-hosting:** Node.js scripts assemble/build/validate a public demo without private services.

## Example

Remote publishing adapters belong in independent SyndiRelay; never introduce third-party login sessions, browser automation or platform credentials into the engine.

**Documentation boundary:** keep design decisions and relevant tradeoffs under Architecture, system models under Concepts, and supported CLI/configuration under Reference. Inkerio and SyndiRelay retain separate documentation entrypoints; link shared workflows instead of duplicating them.
