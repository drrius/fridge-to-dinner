import { PublicApiError, DIFFICULTY_VALUES, type Recipe } from "./schema-types";
import {
  isRecord,
  parseEnum,
  parseIdentifier,
  parseInteger,
  parseStringList,
  parseText,
} from "./schema-parse-helpers";

export function parseRecipes(value: unknown): Recipe[] {
  if (!Array.isArray(value)) {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned invalid recipes.",
      { status: 502, retryable: true }
    );
  }

  if (value.length === 0 || value.length > 5) {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned the wrong number of recipes.",
      { status: 502, retryable: true }
    );
  }

  return value.map(parseRecipe);
}

function parseRecipe(value: unknown, index: number): Recipe {
  if (!isRecord(value)) {
    throw new PublicApiError(
      "provider_response_invalid",
      `Recipe ${index + 1} is invalid.`,
      { status: 502, retryable: true }
    );
  }

  const recipe: Recipe = {
    id: parseIdentifier(value.id, "provider_response_invalid"),
    title: parseText(value.title, 3, 80, "provider_response_invalid"),
    minutes: parseInteger(value.minutes, 5, 180, "provider_response_invalid"),
    servings: parseInteger(value.servings, 1, 12, "provider_response_invalid"),
    difficulty: parseEnum(
      value.difficulty,
      DIFFICULTY_VALUES,
      "provider_response_invalid"
    ),
    have: parseStringList(value.have, "provider_response_invalid"),
    need: parseStringList(value.need, "provider_response_invalid"),
    steps: parseStringList(value.steps, "provider_response_invalid", {
      minItems: 2,
      maxItems: 12,
      minLength: 6,
    }),
    whyThisWorks: parseText(
      value.whyThisWorks,
      10,
      320,
      "provider_response_invalid"
    ),
  };

  if (recipe.have.length === 0) {
    throw new PublicApiError(
      "provider_response_invalid",
      "Recipes must use at least one ingredient you have.",
      { status: 502, retryable: true }
    );
  }

  return recipe;
}
