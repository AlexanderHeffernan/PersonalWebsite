# AGENTS.md

This repository is a Nuxt 4 SSR app for a personal portfolio with a future in-app CMS and SQLite-backed content. Keep changes pragmatic and production-ready for a long-lived project.

## Tech Stack
- Nuxt 4 (SSR)
- Vue 3
- Vite
- TypeScript
- ESLint (flat config)

## Local Dev Commands
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run typecheck` - run TypeScript checks

## Conventions
- Keep code minimal and maintainable; prefer clear structure over cleverness.
- Avoid adding dependencies unless necessary; justify new deps briefly.
- Prefer server routes in `server/` for backend logic.
- Keep database interactions server-only.
- Use TypeScript for new modules and server code.

## Project Structure (current)
- `app/` - app source (pages, components, layouts)
- `public/` - static assets
- `nuxt.config.ts` - Nuxt config
- `eslint.config.mjs` - ESLint flat config
- `tsconfig.json` - TypeScript config

## Notes for Future Work
- The app is intended to read/write content from SQLite (WAL) at runtime.
- A custom `/admin` CMS is planned inside the same Nuxt app.
- GitHub data will be fetched server-side and cached in SQLite with TTL.

## AI Context
- When working on Nuxt-specific details, consult `/Users/alexanderheffernan/Documents/MyDocuments/Coding/WebDev/PersonalWebsite/llms.txt` for repo context.

## Quality Bar
- Prefer small, vertical slices (UI + API + data) when introducing new features.
- If you add or change scripts, update this file accordingly.
