# AI Frontend Integration — 2026-04-21

## What Was Added

Connected the two existing AI API routes (`/api/ai/text`, `/api/ai/image`) to the frontend. Users now have three ways to add food, accessible via a tab bar in the "Add Food" section.

| Tab | Label | Flow |
|---|---|---|
| ⚡ | Quick Add | Existing behaviour — search/filter 25 preset foods, click card to add |
| ✍️ | Describe | Type meal description → Gemini → per-item results with individual + "Add All" |
| 📷 | Photo | Upload/drop image → preview → Gemini → checkboxes → "Add Selected" |

## Files Changed

| File | Change |
|---|---|
| `components/FoodSearch.tsx` | Refactored into a tab container; delegates to new components per tab |
| `components/CalorieTracker.tsx` | Added `handleAddAIItem`, refactored shared `saveEntry`, passes `onAddAIItem` to FoodSearch |
| `components/AITextSearch.tsx` | New — text input, spinner, error, per-item results, Add All |
| `components/AIImageUpload.tsx` | New — drag/drop zone, image preview, spinner, checkbox result list, Add Selected |
| `tsconfig.json` | Added `"target": "ES2017"` (required for Set spread in strict mode) |

## Technical Decisions

### Tab layout for three modes
Chosen over three separate sections stacked vertically. Keeps the page compact and makes the three modes feel like distinct tools rather than one overwhelming form. The tab bar uses a pill/segment control pattern (gray background, white active tab with shadow) common in mobile UIs — familiar and compact.

### Text tab: individual "+" per item plus "Add All"
Users often describe a meal with components they want to log separately (e.g. "chicken with rice and salad" → 3 items). Individual add buttons let them cherry-pick. "Add All" is a convenience shortcut when they want everything. Once an item is added its button shows "✓ Added" and disables — prevents double-adds without resetting the whole result.

### Image tab: checkbox confirm before adding
Unlike text search where the user typed the query and knows what to expect, image analysis can surprise — Gemini might identify a garnish or background item the user doesn't want to log. Showing checkboxes (all pre-checked) with a "Add Selected" confirm step gives the user control. After confirming, the panel resets so they can upload another image.

### Spinner state on "Add All" and "Add Selected"
Both buttons show a loading spinner and disable during the add sequence. This prevents double-clicks and shows that work is happening, since each item is a separate API call to `/api/log`.

### Sequential writes to prevent JSON file race condition
The JSON database (`data/log.json`) is not concurrency-safe: two simultaneous writes will corrupt each other (last write wins, first write lost). Both "Add All" (text) and "Add Selected" (image) use `for...of` with `await` on each `handleAddAIItem` call to serialize the writes. This means N items take N × ~5ms (local disk write) in sequence — negligible for the 2–8 items typical in a meal description.

### `foodId` for AI-sourced entries
Quick-add entries use the preset food's stable ID (e.g. `chicken-breast`). AI entries get `ai-${Date.now()}` since they have no ID in a known catalogue. This is fine for a personal log — IDs are only used for deletion.

### `img` tag instead of `next/image` for the preview
The image preview in `AIImageUpload` uses a local `blob:` URL created by `URL.createObjectURL()`. Next.js's `<Image>` component requires the domain to be whitelisted in `next.config.js` and doesn't support arbitrary `blob:` URLs. A plain `<img>` with `eslint-disable-next-line @next/next/no-img-element` is the correct choice here.

### Prompt colour coding
Each AI mode uses a distinct accent colour so users know which mode they're in and which results came from where:
- Quick Add: green (consistent with the existing "Add" button colour)
- Describe (text): violet
- Photo (image): blue

## Error Handling

Both AI components catch all errors and display a red alert box with the error message. Common cases:
- Network failure (Gemini unreachable)
- Gemini API error (bad key, rate limit, quota exceeded)
- JSON parse failure (rare — `extractJSON()` in `lib/gemini.ts` handles most format variations)
- Image too large or wrong type (validated in the API route before the Gemini call)
