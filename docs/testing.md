# Testing

DesignOS requires all tests to run successfully in a local environment prior to deployment. We do not rely on GitHub Actions for local CI feedback in order to conserve compute resources.

## Commands

- `pnpm test` - Runs unit and integration tests across the workspace using Vitest.
- `pnpm typecheck` - Validates TypeScript structural typing.
- `pnpm release:check` - The final release gate. Runs build, tests, and source validation.

Refer to `CONTRIBUTING.md` for our full QA standards.
