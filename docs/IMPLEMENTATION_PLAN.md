# Implementation Plan

## V1 definition
A fresh user can install DesignOS, connect an MCP client, submit a PRD/URL/screenshot, complete adaptive discovery, approve moodboard and storyboard, generate a design system, inspect/build an implementation, run visual QA, produce brand/mockup/store/video assets, export them, resume later, and observe cache/token savings.

| Phase | Scope | Exit |
|---|---|---|
| 0 | Schemas/events/naming | contract frozen |
| 1 | Monorepo/MCP/setup | fresh clone boots |
| 2 | ProjectSession/state | projects resume |
| 3 | Vault + SQLite/FTS/vector/artifacts | knowledge retrievable |
| 4 | Exact + semantic cache + Caveman + Token Governor | metrics work |
| 5 | Registry + generic adapter | public sources represented |
| 6 | TinyFish + Playwright | capture pipeline works |
| 7 | First 10 deep adapters | structured research works |
| 8 | Design DNA + visual search | screenshot/reference retrieval works |
| 9 | Interview + RequirementsGraph | adaptive discovery works |
| 10 | Moodboard + approval | direction approved |
| 11 | Storyboard + motion spec | executable story approved |
| 12 | Component resolver + sandbox | safe dependency install |
| 13 | Visual QA | build repair loop works |
| 14 | Brand kit/tokens | brand exports |
| 15 | Mockup/screenshot studios | marketing visuals export |
| 16 | App Store/Play Store exporters | store validation/export |
| 17 | Remotion + HyperFrames + FFmpeg | video works |
| 18 | Vercel preview | review deployments work |
| 19 | Skill/docs/examples | external agents operate DesignOS |
| 20 | 250–300 sources | source target |
| 21 | security/licensing/performance | release candidate |

## First vertical slice
Prompt -> Interview -> 10–20 source research -> Design DNA -> Moodboard -> approval -> Storyboard -> approval -> brand tokens -> implementation spec -> preview capture -> visual QA.

## Observability
Track sources, cache hits, browser/model calls, input/compressed tokens, tokens saved, Caveman ratio, approvals, QA iterations, artifacts, errors.

## Fallbacks
TinyFish -> Playwright/cache. Semantic cache -> normal retrieval. Caveman -> summarized retrieval. Vercel -> local preview. Video failure -> preserve render spec. Licensed source unavailable -> public alternatives.
