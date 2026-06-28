import type { MutableRefObject } from "react";

import type { Ingredient, Preferences } from "@/lib/schemas";

import { baseRecipes } from "./mock-data";
import type { PreferenceKey } from "./types";

export function preferenceValues(preferences: Required<Preferences>) {
  return (Object.keys(preferences) as PreferenceKey[]).filter(
    (key) => preferences[key]
  );
}

export function clearPhotoObjectUrl(ref: MutableRefObject<string | null>) {
  if (!ref.current) {
    return;
  }

  URL.revokeObjectURL(ref.current);
  ref.current = null;
}

export function buildRecipes(
  ingredients: Ingredient[],
  preferences: Required<Preferences>
) {
  const available = new Set(
    ingredients.map((ingredient) => ingredient.name.toLowerCase())
  );

  return baseRecipes
    .filter((recipe) => (preferences.under30 ? recipe.minutes <= 30 : true))
    .map((recipe) => ({
      ...recipe,
      have: recipe.have.filter((item) => available.has(item.toLowerCase())),
      need: recipe.need.filter((item) => !available.has(item.toLowerCase())),
    }))
    .sort((left, right) => right.have.length - left.have.length);
}
