# DesignOS-MCP

DesignOS is a design-intelligence operating system for AI agents. It turns a PRD, prompt, URL, screenshot, or existing product into an approved moodboard, storyboard, design specification, validated implementation, brand system, and production launch assets.

## What ships
- DesignOS MCP Server
- DesignOS Agent Skill
- DesignOS repository / SDK

## Locked workflow
```text
Input -> Adaptive interview -> Vault + semantic cache -> Targeted research
-> Design DNA -> Moodboard [approval] -> Storyboard [approval]
-> Design spec / implementation -> Visual QA -> Production Studio
-> Brand kit / mockups / store assets / video / launch assets
```

DesignOS does not blindly clone references. It inspects and structures design logic, then reinterprets useful principles through the user's approved brand and requirements.

## Foundation
This initial slice includes:
- MCP v2 stdio server
- persistent ProjectSession store
- source registry + research router
- token governor, exact/semantic cache primitives, progressive retrieval, Caveman adapter contract
- TinyFish / Playwright browser boundary
- Remotion / HyperFrames video boundary
- DesignOS agent skill
- setup / doctor scripts
- architecture and implementation plan
- CI

## Start
```bash
pnpm install
pnpm designos:setup
pnpm dev
```

Optional full toolchain bootstrap:
```bash
pnpm designos:setup -- --full
```

See [Architecture](docs/ARCHITECTURE.md) and [Implementation Plan](docs/IMPLEMENTATION_PLAN.md).

## License
No open-source license has been granted yet. Treat this repository as all-rights-reserved until a license is explicitly added.
