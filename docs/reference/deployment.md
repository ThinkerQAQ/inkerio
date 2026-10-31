# Deployment reference

Inkerio is a build-time engine, not the website's production deployment owner.

The [standalone CI workflow](../../.github/workflows/ci.yml) builds the public [content template](https://github.com/ThinkerQAQ/inkerio-content-template) without any private credentials.

To deploy a real site, use a separate wrapper repository which checks out a **pinned Inkerio commit or release**, the intended content revision, and then overlays site.config.json and any site-specific public files. Execute the Inkerio assembly and static build from that wrapper.

For the original ThinkerQAQ deployment workflow (not yet migrated), see [the existing website workflow](https://github.com/ThinkerQAQ/ThinkerQAQ.github.io/tree/main/.github/workflows/).

See the [migration plan](../architecture/repository-boundaries.md) before changing production.
