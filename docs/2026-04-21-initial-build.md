# Initial Build — 2026-04-21

## What Was Built

A complete single-page calorie tracker web app from scratch. The app allows a user to:

- Browse and search 25 pre-loaded common foods
- Add foods to a daily log with one click
- See real-time calorie progress toward a 2,000 cal/day goal
- View macro breakdown (protein, carbs, fat)
- Remove logged entries
- Persist the log across page refreshes

## Technical Choices & Rationale

### Framework: Next.js 14 with App Router
- Chosen for its built-in API routes (used for CRUD operations), TypeScript support, and fast DX.
- App Router used over Pages Router for the modern file-based routing and co-located API routes.

### Database: JSON file (`data/log.json`) via Node.js `fs`
- SQLite via `better-sqlite3` was considered but rejected because it requires native binary compilation, which can be unreliable on Windows with newer Node versions.
- A JSON file is zero-dependency, readable by humans, and more than sufficient for a personal local app that will never handle concurrent writes from multiple users.
- `data/log.json` is auto-created by the API if it doesn't exist, so no setup is required.

### Styling: Tailwind CSS v3
- Used for rapid UI development without a separate CSS file per component.
- Color system: green for positive progress, yellow for 80%+ of goal, red for over-goal. Blue/amber/orange for protein/carbs/fat respectively — consistent across CalorieSummary and FoodLog.

### State Management: React `useState` + `useEffect` (no external library)
- The app is simple enough that no external state library (Zustand, Redux) was needed.
- All app state lives in `CalorieTracker.tsx` and is passed down as props — easy to reason about.

### Food Data: Static array in `lib/foods.ts`
- 25 hand-curated foods covering all major food groups: proteins, carbs, fruits, vegetables, dairy, nuts, fats.
- Each food has: id, name, emoji, calories, protein, carbs, fat, servingSize, servingUnit, category.
- Stored as a static array (not in the database) since it's a read-only reference dataset.

### Optimistic UI for Remove
- When a user removes a log entry, the entry is removed from local state immediately (optimistic), then the DELETE request fires. This makes the UI feel instant.

## API Surface

| Method | Endpoint        | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | /api/log        | Fetch entries for a date (`?date=`)  |
| POST   | /api/log        | Add a new food entry                 |
| DELETE | /api/log/[id]   | Remove an entry by ID                |

## Files Created

- `package.json` — dependencies
- `tsconfig.json` — TypeScript config
- `next.config.js` — Next.js config
- `tailwind.config.ts` — Tailwind content paths
- `postcss.config.js` — PostCSS plugins
- `.eslintrc.json` — ESLint extends next/core-web-vitals
- `types/index.ts` — Food, LogEntry, MacroTotals types
- `lib/foods.ts` — 25 foods static dataset
- `lib/db.ts` — JSON file read/write helpers
- `app/globals.css` — Tailwind base import
- `app/layout.tsx` — Root layout
- `app/page.tsx` — Home page entry point
- `app/api/log/route.ts` — GET + POST handlers
- `app/api/log/[id]/route.ts` — DELETE handler
- `components/CalorieTracker.tsx` — Main stateful component
- `components/CalorieSummary.tsx` — Calorie + macro summary
- `components/FoodSearch.tsx` — Search bar + food grid
- `components/FoodCard.tsx` — Individual food card
- `components/FoodLog.tsx` — Daily food log list
- `data/log.json` — Empty initial log
- `CLAUDE.md` — Project documentation
- `docs/2026-04-21-initial-build.md` — This file
