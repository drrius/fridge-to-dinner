import {
  CONFIDENCE_VALUES,
  INGREDIENT_SOURCE_VALUES,
  PublicApiError,
  type ApiErrorCode,
  type ApiErrorEnvelope,
  type ApiMeta,
  type ApiSuccess,
  type Ingredient,
  type Preferences,
  type RecipeRequest,
} from "./schema-types";
import {
  isRecord,
  parseEnum,
  parseIdentifier,
  parseName,
} from "./schema-parse-helpers";
import { parseRecipes } from "./schema-recipe-validation";

export function createRequestId() {
  return `req_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function createSuccessEnvelope(
  data: Omit<ApiSuccess, "meta">,
  meta: ApiMeta
): ApiSuccess {
  return {
    ingredients: data.ingredients,
    recipes: data.recipes,
    meta,
  };
}

export function createErrorResponse(error: unknown) {
  if (error instanceof PublicApiError) {
    return Response.json(toErrorEnvelope(error), { status: error.status });
  }

  const fallback = new PublicApiError(
    "internal_error",
    "Something went wrong. Please try again.",
    { status: 500, retryable: true }
  );

  return Response.json(toErrorEnvelope(fallback), { status: fallback.status });
}

export function parseAnalyzePreferences(value: FormDataEntryValue | null): Preferences {
  if (value === null || value === "") {
    return {};
  }

  if (typeof value !== "string") {
    throw new PublicApiError(
      "preferences_invalid",
      "Preferences must be sent as JSON text.",
      { status: 400 }
    );
  }

  return parsePreferencesJson(value);
}

export async function parseRecipeRequest(request: Request): Promise<RecipeRequest> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new PublicApiError("bad_json", "Send a valid JSON body.", {
      status: 400,
    });
  }

  if (!isRecord(body)) {
    throw new PublicApiError("bad_json", "Send a valid JSON object.", {
      status: 400,
    });
  }

  const ingredients = parseIngredients(body.ingredients, {
    code: "ingredients_invalid",
    requireVision: false,
    allowSuggested: true,
  });
  const preferences = parsePreferences(body.preferences ?? {});

  return { ingredients, preferences };
}

export function validateGeneratedContent(value: unknown): Omit<ApiSuccess, "meta"> {
  if (!isRecord(value)) {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned an invalid response.",
      { status: 502, retryable: true }
    );
  }

  const ingredients = parseIngredients(value.ingredients, {
    code: "provider_response_invalid",
    requireVision: false,
    allowSuggested: true,
  });
  const recipes = parseRecipes(value.recipes);

  if (recipes.length === 0) {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service did not return any recipes.",
      { status: 502, retryable: true }
    );
  }

  return { ingredients, recipes };
}

export function jsonContentType(request: Request) {
  return request.headers.get("content-type")?.toLowerCase() ?? "";
}

function toErrorEnvelope(error: PublicApiError): ApiErrorEnvelope {
  return {
    error: {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    },
  };
}

function parsePreferencesJson(value: string): Preferences {
  try {
    return parsePreferences(JSON.parse(value));
  } catch (error) {
    if (error instanceof PublicApiError) {
      throw error;
    }

    throw new PublicApiError(
      "preferences_invalid",
      "Preferences must be valid JSON.",
      { status: 400 }
    );
  }
}

function parsePreferences(value: unknown): Preferences {
  if (!isRecord(value)) {
    throw new PublicApiError(
      "preferences_invalid",
      "Preferences must be a JSON object.",
      { status: 400 }
    );
  }

  const preferences: Preferences = {};

  for (const key of ["vegetarian", "under30", "useExpiringSoon"] as const) {
    const item = value[key];

    if (item === undefined) {
      continue;
    }

    if (typeof item !== "boolean") {
      throw new PublicApiError(
        "preferences_invalid",
        "Preference values must be true or false.",
        { status: 400 }
      );
    }

    preferences[key] = item;
  }

  return preferences;
}

function parseIngredients(
  value: unknown,
  options: {
    code: ApiErrorCode;
    requireVision: boolean;
    allowSuggested: boolean;
  }
): Ingredient[] {
  if (!Array.isArray(value)) {
    throw new PublicApiError(
      options.code,
      options.code === "ingredients_invalid"
        ? "Ingredients must be sent as an array."
        : "The recipe service returned invalid ingredients.",
      {
        status: options.code === "ingredients_invalid" ? 400 : 502,
        retryable: options.code !== "ingredients_invalid",
      }
    );
  }

  if (value.length === 0 || value.length > 30) {
    throw new PublicApiError(
      options.code,
      options.code === "ingredients_invalid"
        ? "Send between 1 and 30 ingredients."
        : "The recipe service returned invalid ingredients.",
      {
        status: options.code === "ingredients_invalid" ? 400 : 502,
        retryable: options.code !== "ingredients_invalid",
      }
    );
  }

  return value.map((item, index) => parseIngredient(item, index, options));
}

function parseIngredient(
  value: unknown,
  index: number,
  options: {
    code: ApiErrorCode;
    requireVision: boolean;
    allowSuggested: boolean;
  }
): Ingredient {
  if (!isRecord(value)) {
    throw new PublicApiError(
      options.code,
      options.code === "ingredients_invalid"
        ? `Ingredient ${index + 1} must be an object.`
        : "The recipe service returned invalid ingredients.",
      {
        status: options.code === "ingredients_invalid" ? 400 : 502,
        retryable: options.code !== "ingredients_invalid",
      }
    );
  }

  const id = parseIdentifier(value.id, options.code);
  const name = parseName(value.name, options.code);
  const confidence = parseEnum(value.confidence, CONFIDENCE_VALUES, options.code);
  const source = parseEnum(
    value.source,
    options.allowSuggested
      ? INGREDIENT_SOURCE_VALUES
      : INGREDIENT_SOURCE_VALUES.filter((item) => item !== "suggested"),
    options.code
  );

  if (options.requireVision && source !== "vision") {
    throw new PublicApiError(
      options.code,
      options.code === "ingredients_invalid"
        ? "Detected ingredients must come from image analysis."
        : "The recipe service returned invalid ingredients.",
      {
        status: options.code === "ingredients_invalid" ? 400 : 502,
        retryable: options.code !== "ingredients_invalid",
      }
    );
  }

  return { id, name, confidence, source };
}
