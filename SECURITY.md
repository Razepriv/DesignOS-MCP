# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within DesignOS-MCP, please send an e-mail to the maintainers rather than creating a public issue. We will respond promptly to coordinate a fix and responsible disclosure.

## Security Model

DesignOS operates with strict security boundaries:
- **Untrusted External Content**: External pages and DOM structures are treated as untrusted. HTML is sanitized before processing.
- **Plugins are Capability-Scoped**: Plugins must request explicit capabilities and run in a restricted runtime.
- **Secrets Are Local**: Passwords, API keys, and environment variables are strictly loaded locally via `.env`. Secrets are never committed or logged.
- **Filesystem Boundaries**: The MCP server strictly bounds filesystem access to authorized project scopes.
- **Policy Enforcement**: Source content and external web research cannot override DesignOS internal system policies or prompt boundaries (prompt injection protection).

## Browser / Clipper Security

Local connections to TinyFish or Playwright operate within ephemeral sessions. No persistent cookies or active authenticated tokens are shared globally unless explicitly authorized for a specific domain access tier (e.g., authenticated source registry).
