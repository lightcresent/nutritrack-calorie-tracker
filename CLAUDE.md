# NutriTrack — Calorie & Macro Tracker

A single-page calorie and macro tracking web app built with Next.js 14, TypeScript, and Tailwind CSS. Includes AI-powered food lookup via Gemini (text description and photo upload), meal categorization, and a polished production-grade UI.

## What It Does

- **Quick Add** — search and one-click add from 25 pre-loaded common foods with category color-coded cards
- **Describe** — type a meal in plain English; Gemini breaks it into components with macros
- **Photo** — upload or drop a photo; Gemini identifies all foods; confirm items before adding
- **Meal Categories** — tag entries as Breakfast / Lunch / Dinner / Snack (auto-detected by time of day)
- Tracks calories, protein, carbs, and fat per entry
- Daily calorie progress bar (green → amber → red) plus macro progress bars with % labels
- Macro composition bar showing protein/carbs/fat proportion of consumed calories
- Food log grouped by meal with per-meal calorie subtotals
- Persists the food log across page refreshes using a local JSON file

## How to Run

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**. Requires `GEMINI_API_KEY` in `.env`.

## Tech Stack

| Layer       | Choice                                          |
|-------------|-------------------------------------------------|
| Framework   | Next.js 14 (App Router)                         |
| Language    | TypeScript                                      |
| Styling     | Tailwind CSS v3 + CSS custom properties         |
| Fonts       | DM Sans (body) + DM Serif Display (display)     |
| Database    | JSON file (`data/log.json`) via Node fs         |
| AI          | Gemini 2.5 Flash Lite via `@google/generative-ai` |
| Runtime     | Node.js 22+                                     |

## Folder Structure

```
calorie-tracker-app/
├── app/
│   ├── layout.tsx            # Root layout — DM Sans + DM Serif Display fonts
│   ├── page.tsx              # Entry point — renders CalorieTracker
│   ├── globals.css           # Design tokens (CSS vars), animations, skeleton
│   └── api/
│       ├── log/route.ts      # GET (fetch entries) + POST (add entry)
│       ├── log/[id]/route.ts # DELETE (remove entry)
│       ├── ai/text/route.ts  # POST — text description → nutrition JSON
│       └── ai/image/route.ts # POST — image upload → nutrition JSON
├── components/
│   ├── CalorieTracker.tsx    # Main client component — app state + all add handlers
│   ├── CalorieSummary.tsx    # Calorie progress bar + macro breakdown + composition bar
│   ├── FoodSearch.tsx        # Tab container with integrated meal selector
│   ├── FoodCard.tsx          # Individual food card with category accent + success flash
│   ├── FoodLog.tsx           # Today's log grouped by meal with skeleton loading
│   ├── AITextSearch.tsx      # Describe tab — text → Gemini → per-item results
│   └── AIImageUpload.tsx     # Photo tab — upload → preview → Gemini → checkbox confirm
├── lib/
│   ├── foods.ts              # Static list of 25 foods with full macro data
│   ├── meals.ts              # MEAL_OPTIONS + getCurrentMeal() helper
│   ├── db.ts                 # JSON file read/write helpers
│   └── gemini.ts             # Gemini client, prompt, JSON extractor
├── types/
│   ├── index.ts              # Shared types (Food, LogEntry, MacroTotals, MealCategory)
│   └── ai.ts                 # AI types (AIFoodItem, AIResponse)
└── data/log.json             # Persisted food log (auto-created if missing)
```

## Design System

- **Primary accent**: Emerald (`#059669`) — buttons, active states, progress bars
- **Background**: `#f3f8f5` — subtle warm-green tint on the page canvas
- **Typography**: DM Sans for UI text; DM Serif Display for hero numbers and headings
- **Cards**: `1.25rem` border-radius, `1px` border, subtle `box-shadow`
- **Animations**: `slideUp` stagger on page load, `fadeIn` on tab switch, `shimmer` skeleton, `successPop` on add

## Key Decisions

- **Meal auto-detection**: Defaults to Breakfast (5–11am), Lunch (11am–3pm), Dinner (3–9pm), Snack (otherwise)
- **Macro targets**: Protein 125g / Carbs 250g / Fat 55g (25/50/25 split of 2000 cal goal)
- **JSON file DB**: No native compilation — works cleanly on Windows
- **Daily goal hardcoded**: Change `DAILY_GOAL` in `CalorieTracker.tsx` to adjust
- **No accounts/login**: Single-user local app by design

## AI Routes

Both routes return the same `AIResponse` shape:

```json
{
  "items": [{ "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "servingSize": 1, "servingUnit": "serving", "quantity": 1 }],
  "description": "...",
  "totalCalories": 0, "totalProtein": 0, "totalCarbs": 0, "totalFat": 0
}
```

**Text route** — `POST /api/ai/text` — body: `{ "query": "two scrambled eggs and toast" }`  
**Image route** — `POST /api/ai/image` — multipart/form-data, field `image` (JPEG/PNG/WebP/HEIC, max 10 MB)

## Next Steps

- **Deploy to Vercel**: `vercel --prod` — add `GEMINI_API_KEY` as an environment variable
- **Food history charts**: Weekly calorie/macro trend with a charting library (Recharts or Victory)
- **User preferences**: Configurable calorie goal, macro targets, and theme in a settings panel
- **Barcode scanning**: Integrate Open Food Facts API for packaged food lookup via barcode
- **Custom food entry**: Add foods not in the preset list (name, calories, macros)
- **Serving size multiplier**: Let users adjust quantity/serving on Quick Add cards
- **Export CSV**: Download the log as a spreadsheet
