import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIFoodItem, AIResponse } from "@/types/ai";

const MODEL = "gemini-2.5-flash-lite";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });
}

const BASE_PROMPT = `You are a precise nutrition analysis expert. Return ONLY valid JSON with no markdown, code blocks, or explanation. The JSON must match this schema exactly:

{
  "description": "brief summary of what was identified",
  "items": [
    {
      "name": "food item name",
      "calories": 300,
      "protein": 25.5,
      "carbs": 30.0,
      "fat": 8.0,
      "servingSize": 1,
      "servingUnit": "serving",
      "quantity": 1
    }
  ]
}

Rules:
- All numeric fields must be actual numbers, not strings
- calories must be a whole integer
- protein, carbs, fat must be numbers rounded to 1 decimal place
- servingSize and quantity must be positive numbers
- Estimate realistic values based on typical preparation and serving sizes
- Break combined meals into individual components where reasonable
- If a food is ambiguous, make your best reasonable estimate`;

function extractJSON(raw: string): string {
  // Strip markdown code fences if Gemini wraps the response
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Fall back to first JSON object found
  const obj = raw.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  return raw.trim();
}

function buildResponse(parsed: Record<string, unknown>): AIResponse {
  if (!Array.isArray(parsed.items)) {
    throw new Error("Gemini response missing items array");
  }

  const items: AIFoodItem[] = (parsed.items as Record<string, unknown>[]).map(
    (item) => ({
      name: String(item.name ?? "Unknown food"),
      calories: Math.round(Number(item.calories ?? 0)),
      protein: Math.round(Number(item.protein ?? 0) * 10) / 10,
      carbs: Math.round(Number(item.carbs ?? 0) * 10) / 10,
      fat: Math.round(Number(item.fat ?? 0) * 10) / 10,
      servingSize: Number(item.servingSize ?? 1),
      servingUnit: String(item.servingUnit ?? "serving"),
      quantity: Math.round(Number(item.quantity ?? 1)),
    })
  );

  const totals = items.reduce(
    (acc, item) => ({
      cal: acc.cal + item.calories * item.quantity,
      pro: acc.pro + item.protein * item.quantity,
      carb: acc.carb + item.carbs * item.quantity,
      fat: acc.fat + item.fat * item.quantity,
    }),
    { cal: 0, pro: 0, carb: 0, fat: 0 }
  );

  return {
    description: String(parsed.description ?? ""),
    items,
    totalCalories: Math.round(totals.cal),
    totalProtein: Math.round(totals.pro * 10) / 10,
    totalCarbs: Math.round(totals.carb * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
  };
}

export async function analyzeTextQuery(query: string): Promise<AIResponse> {
  const model = getModel();
  const prompt = `${BASE_PROMPT}\n\nMeal description to analyze: "${query}"`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  return buildResponse(JSON.parse(extractJSON(raw)));
}

export async function analyzeImage(
  base64Data: string,
  mimeType: string
): Promise<AIResponse> {
  const model = getModel();
  const prompt = `${BASE_PROMPT}\n\nAnalyze all food items visible in this image and estimate their nutritional content.`;
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: base64Data } },
  ]);
  const raw = result.response.text();
  return buildResponse(JSON.parse(extractJSON(raw)));
}
