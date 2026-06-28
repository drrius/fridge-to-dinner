import type { Ingredient, Recipe } from "@/lib/schemas";

export const demoImage = "/fridge-demo.svg";

export const baseIngredients: Ingredient[] = [
  { id: "ing_eggs", name: "eggs", confidence: "high", source: "vision" },
  {
    id: "ing_rice",
    name: "cooked rice",
    confidence: "high",
    source: "vision",
  },
  {
    id: "ing_carrot",
    name: "carrots",
    confidence: "medium",
    source: "vision",
  },
  {
    id: "ing_spinach",
    name: "spinach",
    confidence: "medium",
    source: "vision",
  },
  {
    id: "ing_cheddar",
    name: "cheddar",
    confidence: "low",
    source: "vision",
  },
  {
    id: "ing_yogurt",
    name: "plain yogurt",
    confidence: "medium",
    source: "vision",
  },
];

export const suggestedIngredients: Ingredient[] = [
  {
    id: "ing_cilantro",
    name: "cilantro?",
    confidence: "low",
    source: "suggested",
  },
  { id: "ing_lime", name: "lime?", confidence: "low", source: "suggested" },
  { id: "ing_tofu", name: "tofu?", confidence: "low", source: "suggested" },
];

export const baseRecipes: Recipe[] = [
  {
    id: "recipe_fried_rice",
    title: "Fridge Fried Rice",
    minutes: 20,
    servings: 2,
    difficulty: "easy",
    have: ["eggs", "cooked rice", "carrots", "spinach"],
    need: ["soy sauce", "scallions"],
    steps: [
      "Warm a wide skillet with a little oil over medium-high heat.",
      "Scramble the eggs first, then slide them onto a plate.",
      "Stir-fry carrots and rice until the grains crisp at the edges.",
      "Fold in spinach and eggs, then season with soy sauce.",
    ],
    whyThisWorks:
      "Cooked rice and eggs make a fast base, while the vegetables add color and texture without needing a long cook.",
  },
  {
    id: "recipe_omelet",
    title: "Cheddar Spinach Omelet",
    minutes: 12,
    servings: 1,
    difficulty: "easy",
    have: ["eggs", "spinach", "cheddar"],
    need: ["toast"],
    steps: [
      "Wilt the spinach in a nonstick pan.",
      "Add beaten eggs and cook until just set.",
      "Scatter cheddar over one side, fold, and rest for one minute.",
    ],
    whyThisWorks:
      "It turns the highest-confidence staples into dinner with very little prep.",
  },
  {
    id: "recipe_rice_bowl",
    title: "Carrot Rice Bowl",
    minutes: 18,
    servings: 2,
    difficulty: "easy",
    have: ["cooked rice", "carrots", "spinach", "plain yogurt"],
    need: ["sesame oil", "chili crisp"],
    steps: [
      "Saute carrots until lightly browned.",
      "Add rice and spinach, then cook until hot.",
      "Spoon yogurt over the bowl for a cool contrast.",
      "Finish with sesame oil and chili crisp.",
    ],
    whyThisWorks:
      "The bowl uses ready-to-eat leftovers and only asks for pantry flavor boosters.",
  },
];

export const statusLines = [
  "reading the shelves",
  "spotting ingredients",
  "checking weeknight options",
  "building dinner cards",
];
