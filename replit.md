# StudyBridge

StudyBridge helps students discover opportunities, plan focused study sessions, and turn consistent effort into visible progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/studybridge/` — React + Vite frontend and shared shell
- `artifacts/api-server/src/routes/studybridge.ts` — StudyBridge API handlers and demo seed
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/db/src/schema/studybridge.ts` — PostgreSQL tables
- `README.md` — project story, local run instructions, and Discord direction

## Architecture decisions

- OpenAPI is the source of truth so the frontend and API share generated contracts.
- Demo data seeds on first API access so the product is useful immediately without a setup wizard.
- Opportunity and session changes are persisted in PostgreSQL rather than browser-only state.
- The Discord bot is intentionally a follow-on community layer, so product value can be validated before adding credentials and external service coupling.

## Product

- Dashboard for study momentum and recent community activity
- Curated opportunities with search, categories, and saved shortlist
- Shared study sessions with creation and completion flows
- About page that communicates the project's purpose and future Discord direction

## User preferences

No additional preferences recorded.

## Gotchas

- Keep the OpenAPI contract and generated client packages in sync after API changes.
- Use the artifact workflow to run the frontend so `PORT` and `BASE_PATH` are provided.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
