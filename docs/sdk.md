# DesignOS SDK

The SDK allows you to programmatically access DesignOS capabilities outside of an MCP interface.

## Example

```typescript
import { DesignOS } from '@designos/core';

const os = await DesignOS.initialize();

// Query Sources
const sources = await os.research.query('modern SaaS dashboard references');

// Extract DNA
const dna = await os.designDna.extract(sources[0].url);
console.log(dna.palette, dna.typography);
```
