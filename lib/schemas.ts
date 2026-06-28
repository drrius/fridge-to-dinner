export const CONFIDENCE_VALUES = ["high", "medium", "low"] as const;
export const INGREDIENT_SOURCE_VALUES = ["vision", "user", "suggested"] as const;
export const DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;

export type Confidence = (typeof CONFIDENCE_VALUES)[number];
export type IngredientSource = (typeof INGREDIENT_SOURCE_VALUES)[number];
export type Difficulty = (typeof DIFFICULTY_VALUES)[number];

export type Ingredient = {
  id: string;
  name: string;
  confidence: Confidence;
  source: IngredientSource;
};

export type Preferences = {
  vegetarian?: boolean;
  under30?: boolean;
  useExpiringSoon?: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  minutes: number;
  servings: number;
  difficulty: Difficulty;
  have: string[];
  need: string[];
  steps: string[];
  whyThisWorks: string;
};

export type ApiMeta = {
  requestId: string;
  latencyMs: number;
};

export type ApiSuccess = {
  ingredients: Ingredient[];
  recipes: Recipe[];
  meta: ApiMeta;
};

export type ApiErrorCode =
  | "bad_json"
  | "content_type_unsupported"
  | "image_missing"
  | "image_too_large"
  | "image_type_unsupported"
  | "image_invalid"
  | "ingredients_invalid"
  | "preferences_invalid"
  | "provider_config_missing"
  | "provider_failed"
  | "provider_response_invalid"
  | "request_too_large"
  | "internal_error";

export type ApiErrorEnvelope = {
  error: {
    code: ApiErrorCode;
    message: string;
    retryable: boolean;
  };
};

export type RecipeRequest = {
  ingredients: Ingredient[];
  preferences: Preferences;
};

export class PublicApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly retryable: boolean;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { status?: number; retryable?: boolean } = {},
  ) {
    super(message);
    this.name = "PublicApiError";
    this.code = code;
    this.status = options.status ?? 400;
    this.retryable = options.retryable ?? false;
  }
}

export function createRequestId() {
  return `req_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function createSuccessEnvelope(
  data: Omit<ApiSuccess, "meta">,
  meta: ApiMeta,
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
    { status: 500, retryable: true },
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
      { status: 400 },
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
      { status: 502, retryable: true },
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
      { status: 502, retryable: true },
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
      { status: 400 },
    );
  }
}

function parsePreferences(value: unknown): Preferences {
  if (!isRecord(value)) {
    throw new PublicApiError(
      "preferences_invalid",
      "Preferences must be a JSON object.",
      { status: 400 },
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
        { status: 400 },
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
  },
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
      },
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
      },
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
  },
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
      },
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
    options.code,
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
      },
    );
  }

  return { id, name, confidence, source };
}

function parseRecipes(value: unknown): Recipe[] {
  if (!Array.isArray(value)) {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned invalid recipes.",
      { status: 502, retryable: true },
    );
  }

  if (value.length === 0 || value.length > 5) {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned the wrong number of recipes.",
      { status: 502, retryable: true },
    );
  }

  return value.map(parseRecipe);
}

function parseRecipe(value: unknown, index: number): Recipe {
  if (!isRecord(value)) {
    throw new PublicApiError(
      "provider_response_invalid",
      `Recipe ${index + 1} is invalid.`,
      { status: 502, retryable: true },
    );
  }

  const recipe: Recipe = {
    id: parseIdentifier(value.id, "provider_response_invalid"),
    title: parseText(value.title, 3, 80, "provider_response_invalid"),
    minutes: parseInteger(value.minutes, 5, 180, "provider_response_invalid"),
    servings: parseInteger(value.servings, 1, 12, "provider_response_invalid"),
    difficulty: parseEnum(value.difficulty, DIFFICULTY_VALUES, "provider_response_invalid"),
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
      "provider_response_invalid",
    ),
  };

  if (recipe.have.length === 0) {
    throw new PublicApiError(
      "provider_response_invalid",
      "Recipes must use at least one ingredient you have.",
      { status: 502, retryable: true },
    );
  }

  return recipe;
}

function parseIdentifier(value: unknown, code: ApiErrorCode) {
  return parseText(value, 2, 80, code, /^[a-zA-Z0-9_-]+$/);
}

function parseName(value: unknown, code: ApiErrorCode) {
  return parseText(value, 2, 60, code);
}

function parseText(
  value: unknown,
  minLength: number,
  maxLength: number,
  code: ApiErrorCode,
  pattern?: RegExp,
) {
  if (typeof value !== "string") {
    throw new PublicApiError(code, "The response shape was invalid.", {
      status: code === "ingredients_invalid" ? 400 : 502,
      retryable: code !== "ingredients_invalid",
    });
  }

  const trimmed = value.trim();

  if (
    trimmed.length < minLength ||
    trimmed.length > maxLength ||
    (pattern && !pattern.test(trimmed))
  ) {
    throw new PublicApiError(code, "The response shape was invalid.", {
      status: code === "ingredients_invalid" ? 400 : 502,
      retryable: code !== "ingredients_invalid",
    });
  }

  return trimmed;
}

function parseInteger(
  value: unknown,
  min: number,
  max: number,
  code: ApiErrorCode,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new PublicApiError(code, "The response shape was invalid.", {
      status: code === "ingredients_invalid" ? 400 : 502,
      retryable: code !== "ingredients_invalid",
    });
  }

  return value;
}

function parseEnum<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  code: ApiErrorCode,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new PublicApiError(code, "The response shape was invalid.", {
      status: code === "ingredients_invalid" ? 400 : 502,
      retryable: code !== "ingredients_invalid",
    });
  }

  return value;
}

function parseStringList(
  value: unknown,
  code: ApiErrorCode,
  options: { minItems?: number; maxItems?: number; minLength?: number } = {},
) {
  const minItems = options.minItems ?? 0;
  const maxItems = options.maxItems ?? 20;
  const minLength = options.minLength ?? 2;

  if (!Array.isArray(value) || value.length < minItems || value.length > maxItems) {
    throw new PublicApiError(code, "The response shape was invalid.", {
      status: 502,
      retryable: true,
    });
  }

  return value.map((item) => parseText(item, minLength, 120, code));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
