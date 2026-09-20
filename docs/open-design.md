# Open Design Integration

DesignOS can selectively interoperate with [Open Design](https://github.com/nexu-io/open-design) through a dedicated compatibility layer. 

## Approach

**DesignOS does not blindly embed or fork Open Design.**

Compatible permissively licensed skills, craft references, templates, design systems, frames, and plugin metadata can be imported through the upstream compatibility layer. This allows DesignOS to benefit from the Open Design ecosystem without adopting its entire framework or compromising strict license boundaries.

## Provenance and Licenses

Every imported module, skill, or component must specify its license and origin. DesignOS uses `packages/open-design-compat` to:
1. Fetch approved paths from a pinned Open Design commit.
2. Inspect the license headers.
3. Normalize the structure.
4. Calculate and register the provenance hashes.
5. Cache the dependencies under `.designos/vendor/open-design/`.

## Syncing Open Design

To pull the latest approved changes from the upstream Open Design repository:

```bash
pnpm designos:open-design:sync
```
