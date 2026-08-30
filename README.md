# StudyBridge

StudyBridge is a student community platform that turns focused study time into visible progress. It brings together shared study sessions, a curated opportunity shelf, and a lightweight activity trail so students can build momentum with other people.

## Why this project exists

Many student tools track activity without helping students decide what to do next. StudyBridge is designed around a simple loop:

1. Find a worthwhile opportunity.
2. Make a clear plan for the next focus block.
3. Work alongside other students.
4. Leave evidence that the work happened.

The project is intentionally small enough to understand and extend, but complete enough to be useful to a real student community.

## Features

- Dashboard with streak, focus minutes, completed sessions, saved opportunities, and weekly rhythm
- Searchable opportunities directory with categories and save/unsave actions
- Study session creation and completion flow
- Recent community activity feed
- Responsive interface for desktop and mobile
- API-first backend with typed React Query hooks generated from OpenAPI
- PostgreSQL persistence with Drizzle ORM

## Tech stack

- React + Vite + TypeScript
- Express 5
- PostgreSQL + Drizzle ORM
- OpenAPI + Orval-generated Zod schemas and React Query hooks
- Tailwind CSS

## Run locally

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/studybridge run dev
```

The API server powers `/api/*`; the web app is served at the root preview path.

## API surface

- `GET /api/dashboard`
- `GET /api/opportunities`
- `PATCH /api/opportunities/:id/save`
- `GET /api/sessions`
- `POST /api/sessions`
- `PATCH /api/sessions/:id/complete`
- `GET /api/activity`

## Discord direction

The web app is the source of truth for progress and opportunities. A Discord bot can become the community layer on top of it with commands such as:

- `/focus` — announce a focus block and join a shared room
- `/opportunities` — show the latest curated opportunities
- `/session` — create or join a study session
- `/progress` — share a weekly progress snapshot

The bot should only be added after a real student community has been recruited, so the project can measure whether the Discord layer actually helps people show up.

## What to measure

For a real pilot, track:

- weekly active students
- sessions started versus completed
- repeat participation after seven days
- opportunities saved versus opened
- short qualitative feedback from students

That evidence is more meaningful than vanity metrics and makes the project easy to explain in an application, interview, or scholarship essay.