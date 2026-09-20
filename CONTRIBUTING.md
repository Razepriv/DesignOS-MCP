# Contributing to DesignOS

## Welcome

Thank you for your interest in contributing to DesignOS-MCP! DesignOS is designed to grow through new sources, adapters, craft rules, integrations, and production capabilities. We welcome contributions from developers, designers, and AI engineers.

## Ways to contribute

You can help improve DesignOS in many ways:
- **Bug fixes**: Resolving issues with existing functionality.
- **Source additions**: Adding new high-quality design sources to the registry.
- **Source adapters**: Writing structured or deep adapters for specific websites.
- **Craft rules**: Adding new design principles and accessibility guidelines.
- **Documentation**: Improving our README, guides, and tutorials.
- **Tests**: Adding unit or integration tests.
- **MCP features**: Extending the tool capabilities.
- **Production tools**: Enhancing the video, mockup, or export pipelines.

## Local setup

To set up the project locally:

```bash
git clone https://github.com/Razepriv/DesignOS-MCP.git
cd DesignOS-MCP
pnpm install
pnpm designos:setup
pnpm designos:doctor
pnpm dev
```

## Repository architecture

DesignOS is a monorepo consisting of multiple packages under `packages/`:
- **`core`**: Main orchestrator and project state machine.
- **`mcp`**: The MCP server interfaces and tool definitions.
- **`source-registry`**: The database of 270+ validated design sources.
- **`optimization`**: Caching, tokens, and Caveman context compression.
- **`design-dna`**: Analyzes references and extracts design principles.
- **`browser`**: Captures screenshots and DOM trees via Playwright/TinyFish.

## Branch naming

Please use a descriptive branch name. Some examples:
- `feat/source-mobbin`
- `fix/source-router`
- `docs/mcp-installation`
- `test/design-dna`

## Commit conventions

We use conventional commits. Please prefix your commit messages with one of the following:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `test:` Adding missing tests or correcting existing tests
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `chore:` Changes to the build process or auxiliary tools

## Pull request requirements

When opening a Pull Request, your PR must include:
- What changed?
- Why?
- How was it tested?
- Any new dependencies?
- Any license implications?
- Any source/provenance implications?

## Adding a source

To add a source, you must follow the exact source-registry schema in `sources/registry/sources.json`:

```json
{
  "id": "unique-id",
  "name": "Source Name",
  "url": "https://example.com",
  "category": "inspiration",
  "tags": ["tag1", "tag2"],
  "access": "public",
  "adapter": "generic-reference",
  "capabilities": {
    "search": false,
    "screenshot": true,
    "recording": false,
    "code": false,
    "registry": false,
    "components": false,
    "inspiration": true
  },
  "authRequired": false,
  "licenseNotes": "Content belongs to respective owners.",
  "priority": 0.5,
  "freshnessPolicy": "monthly",
  "lastVerified": "2024-01-01"
}
```

Use `pnpm designos:sources:validate` to ensure it passes.

## Adding a deep adapter

Deep adapters require implementing the `DesignAdapter` interface in `packages/source-adapters`. You must provide `search`, `fetch`, and `extract` methods specific to that source's DOM or API.

## Adding craft

Craft files are written in markdown with YAML frontmatter. Place them in the `craft/` directory or appropriately scoped package. They must define exact enforceable rules.

## Adding plugin

Plugins are scoped and run in the `packages/plugin-runtime`. They must include a `designos.json` declaring requested capabilities and be reviewed for security before being merged as bundled plugins.

## Test requirements

All contributions must pass the local test suite:
```bash
pnpm typecheck
pnpm test
pnpm release:check
```
Do not rely on GitHub Actions for your initial test feedback.

## License/provenance requirements

If you introduce external data, dependencies, or references, you must document their provenance. DesignOS relies on strict attribution and licensing tracking. Ensure your contribution respects the upstream licenses.
