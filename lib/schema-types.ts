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
    options: { status?: number; retryable?: boolean } = {}
  ) {
    super(message);
    this.name = "PublicApiError";
    this.code = code;
    this.status = options.status ?? 400;
    this.retryable = options.retryable ?? false;
  }
}
