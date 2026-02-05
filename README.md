# Personal Website (Nuxt 4 SSR)

A long-lived Nuxt 4 SSR portfolio with a planned in-app CMS and SQLite-backed content. This repo is intentionally minimal today and designed to grow with pragmatic, production-ready increments.

## Goals

- Ship a fast, accessible personal portfolio with great SEO.
- Add a lightweight in-app CMS at `/admin` for content management.
- Store content in SQLite (WAL) with server-only access and clear caching rules.
- Fetch GitHub data server-side and cache it in SQLite with TTL.

## Stack

- Nuxt 4 (SSR)
- Vue 3
- Vite
- TypeScript
- ESLint (flat config)

## Project Structure

- `app/` - pages, layouts, components
- `public/` - static assets
- `server/` - server routes and backend logic (future)
- `nuxt.config.ts` - Nuxt config
- `eslint.config.mjs` - ESLint flat config
- `tsconfig.json` - TypeScript config

## Local Development

```bash
npm run dev
```

## Build / Preview / Typecheck

```bash
npm run build
npm run preview
npm run typecheck
```

## Environment

- Create a `.env` file for local secrets.
- Add a `.env.example` when new environment variables are introduced.

## Project Plan

Checklist is meant to be updated as work progresses. If you complete a step, check it off and add a brief note in the commit message.

### Phase 0: Repo Baseline

- [x] Initialize Nuxt 4 SSR app
- [x] Add ESLint flat config
- [x] Add TypeScript config
- [X] Update README with project context and plan (this file)

### Phase 1: Core Portfolio UI

- [ ] Define site information architecture (pages, sections, nav)
- [ ] Create base layout and typography system
- [ ] Build the Home page
- [ ] Add Projects page
- [ ] Add About page
- [ ] Add Contact page
- [ ] Add global SEO defaults (title template, meta, OG)
- [ ] Add basic analytics hook (provider TBD)

### Phase 2: Content Model

- [ ] Define content schema for pages, projects, and blog posts
- [ ] Decide on slug strategy and URL structure
- [ ] Implement content validation types
- [ ] Create seed content in SQLite

### Phase 3: SQLite + Data Access

- [ ] Choose SQLite driver (Node-compatible, server-only)
- [ ] Add database initialization and migrations
- [ ] Implement server-only data access layer
- [ ] Add caching/TTL helpers for GitHub data
- [ ] Add basic health check endpoint

### Phase 4: In-App CMS (`/admin`)

- [ ] Create `/admin` layout and auth strategy (local-only to start)
- [ ] Implement CRUD for pages
- [ ] Implement CRUD for projects
- [ ] Implement CRUD for blog posts
- [ ] Add file upload strategy (images)
- [ ] Add basic audit trail (created/updated timestamps)

### Phase 5: GitHub Integration

- [ ] Define GitHub data to show (repos, contributions, pins)
- [ ] Implement server route to fetch GitHub data
- [ ] Cache GitHub data in SQLite with TTL
- [ ] Render GitHub data on relevant pages

### Phase 6: Quality / Production

- [ ] Add tests for server routes (smoke)
- [ ] Add lint + typecheck to CI
- [ ] Add performance budget checks
- [ ] Add error monitoring (provider TBD)
- [ ] Define deployment target and setup

## Notes for Agents

- Prefer server routes in `server/` for backend logic.
- Keep database access server-only.
- Keep changes small and vertical (UI + API + data) where possible.
- Avoid adding dependencies unless necessary; justify them briefly.

