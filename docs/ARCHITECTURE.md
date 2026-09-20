# DesignOS Architecture

## Four loops
1. **Learn:** Sources -> capture -> Design DNA -> Vault.
2. **Design:** Requirements -> research -> moodboard -> approval -> storyboard -> approval.
3. **Build:** Spec -> components -> implementation -> visual QA -> repair.
4. **Launch:** Brand -> mockups -> screenshots -> video -> store/launch assets.

## State machine
```text
NEW -> DISCOVERY -> RESEARCH -> MOODBOARD_PENDING -> MOODBOARD_APPROVED
-> STORYBOARD_PENDING -> STORYBOARD_APPROVED -> DESIGN_SPEC_READY
-> IMPLEMENTING -> QA -> DESIGN_APPROVED -> PRODUCTION -> READY_TO_SHIP
```

## Knowledge
Obsidian-compatible Markdown for humans; SQLite/FTS + semantic vectors + visual embeddings + perceptual hashes + relationship graph for machines.

## Sources
Target 250–300 sources:
- 25–30 deep adapters
- 60–80 structured browser adapters
- 150+ generic reference adapters

## Browser
TinyFish handles external research/capture. Playwright handles deterministic/local inspection and visual QA.

## Token path
```text
request -> exact cache -> semantic cache -> Design Vault -> progressive retrieval
-> Caveman compression -> Token Governor -> model
```

## Production Studio
Brand Studio, Mockup Studio, Screenshot Studio, Store Studio, Motion Studio, Launch Studio, Prompt Studio, Export Studio.
