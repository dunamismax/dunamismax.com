# Frontend Scaffold

This is the Phase 1 Bun + Astro + Vue migration lane for `dunamismax.com`.

Current truth:

- The deployed site is still the Python app in `src/app/`.
- This frontend exists to establish the target toolchain, directory shape, metadata contract, and quality scripts without claiming page or content parity.

## Commands

```bash
bun install
bun run dev
bun run check
bun run lint
bun run test
```

## Scope

- Shared site metadata and canonical URL helpers live in `src/config/site.ts`.
- Future content migrations should follow `src/content/config.ts` and `../docs/frontend-contract-inventory.md`.
- Vue is integrated, but no client island is shipped yet because the current site does not need one.
