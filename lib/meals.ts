import { MealCategory } from "@/types";

export const MEAL_OPTIONS: { id: MealCategory; icon: string; label: string }[] = [
  { id: "Breakfast", icon: "☀️", label: "Breakfast" },
  { id: "Lunch", icon: "🌤", label: "Lunch" },
  { id: "Dinner", icon: "🌙", label: "Dinner" },
  { id: "Snack", icon: "🍎", label: "Snack" },
];

export function getCurrentMeal(): MealCategory {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 15) return "Lunch";
  if (hour >= 15 && hour < 21) return "Dinner";
  return "Snack";
}
