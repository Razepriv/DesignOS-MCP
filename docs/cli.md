# DesignOS CLI

The DesignOS CLI provides terminal-based utilities for managing the registry and workspace.

## Common Commands

- `pnpm designos:setup` - Bootstraps the local database and required environment.
- `pnpm designos:doctor` - Verifies that all subsystems (Playwright, SQLite, etc.) are healthy.
- `pnpm designos:sources:validate` - Checks the source registry for invalid URLs and duplicate IDs.
- `pnpm designos:open-design:sync` - Syncs approved assets from the Open Design upstream repository.
