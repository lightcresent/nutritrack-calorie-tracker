# NutriTrack — Project Plan

## What We Built

A production-quality single-page calorie and macro tracker with three food-entry modes and AI integration:

- **Quick Add** — 25 pre-loaded common foods, searchable, displayed as category-color-coded cards with hover effects and success flash on add
- **Describe** — Natural language input (e.g. "two scrambled eggs and toast"); Gemini 2.5 Flash Lite identifies each component with individual macros; add all or cherry-pick
- **Photo** — Upload or drag-and-drop a meal photo; Gemini identifies all visible foods; checkbox selection before committing to the log

**Tracking features:**
- Daily calorie progress bar with green/amber/red states
- Macro composition bar showing protein/carbs/fat proportion of consumed calories
- Per-macro progress bars with percentage labels (Protein 125g / Carbs 250g / Fat 55g targets)
- Meal categorization (Breakfast/Lunch/Dinner/Snack) with auto-detection by time of day
- Food log grouped by meal with per-meal calorie subtotals and item count badges
- Dark "Daily Total" footer showing full macro breakdown
- JSON file persistence across page refreshes (no database setup required)

**Technical stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v3, DM Sans + DM Serif Display fonts, Gemini 2.5 Flash Lite, Node.js fs for persistence.

---

## What We Improved

Starting from a functional but visually generic initial build, three rounds of review + frontend-design skill verification raised the quality to production standard:

### Round 1 — Structure and Palette
- Added `MealCategory` type and `meal?` field to `LogEntry`; created `lib/meals.ts` with auto-detect logic
- Rewrote `FoodLog` to group entries by meal with colored section headers
- Unified three different accent colors (green/violet/blue) into a single emerald system
- Redesigned tabs from pill-style to border-bottom editorial style

### Round 2 — Typography and Interaction
- Replaced Inter (generic) with DM Sans + DM Serif Display for a premium editorial feel
- Added CSS custom properties (`--color-bg`, `--color-primary`, `--shadow-card`, `--radius-card`)
- Skeleton shimmer loading state replaces a spinner
- Tab fade-in animation; macro bars show percentage labels
- Delete button made tappable on mobile (reduced opacity, not hover-only)
- Better empty and error states throughout

### Round 3 — Polish and Micro-interactions
- Page-load stagger: three sections slide in with 70ms offsets
- Macro composition bar: thin segmented bar showing what kind of calories you're eating
- FoodCard left-border accent per food category (7 distinct colors)
- Success flash on "Add": card briefly compresses, button flips to "✓ Added" with a pop animation
- Meal selector integrated into the FoodSearch card (eliminated orphaned section)
- Empty search state cross-links to Describe tab as a real button

---

## Future Roadmap

### Deploy
- **Vercel**: `vercel --prod`, set `GEMINI_API_KEY` as an environment variable — no other config needed
- The JSON file DB is local-only; production would need a real database (SQLite via better-sqlite3, or a hosted option like Supabase/PlanetScale)

### Near-term features
- **Calorie goal setting in UI** — let users configure their daily target instead of the hardcoded 2000 cal
- **Serving size multiplier** — let users pick "2 servings" on Quick Add cards instead of always 1
- **Custom food entry** — add foods not in the preset list with manual macro input
- **Export CSV** — download the full log for use in spreadsheets

### Medium-term features
- **Food history charts** — weekly calorie and macro trend charts (Recharts or Victory Native)
- **Barcode scanning** — integrate Open Food Facts API for packaged food lookup by barcode
- **User preferences** — configurable macro targets, theme, and goal in a settings panel
- **Meal templates** — save a common meal (e.g. "My usual breakfast") and log it in one tap

### Long-term
- **Multi-day calendar view** — browse past days, compare trends week-over-week
- **Recipe builder** — enter ingredients, get per-serving macros, save as a single food entry
- **Body weight logging** — track weight alongside calories for a correlation view
- **PWA / offline support** — installable on phone, works without a connection
