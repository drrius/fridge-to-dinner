import { imageToDataUrl, type ValidatedImage } from "@/lib/image";
import {
  type Ingredient,
  type Preferences,
  PublicApiError,
  validateGeneratedContent,
} from "@/lib/schemas";

type ProviderInput = {
  preferences: Preferences;
};

type AnalyzeInput = ProviderInput & {
  image: ValidatedImage;
};

type RecipesInput = ProviderInput & {
  ingredients: Ingredient[];
};

type OpenAIConfig = {
  apiKey: string;
  model: string;
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export async function analyzeImage(input: AnalyzeInput) {
  if (shouldUseFixtureMode()) {
    return createFixtureResult(input.preferences);
  }

  const config = getOpenAIConfig();
  const imageUrl = await imageToDataUrl(input.image);
  const raw = await callOpenAI(config, [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "You turn fridge or pantry photos into practical weeknight dinners.",
            "Return only JSON matching the provided schema.",
            "Do not claim certainty for unclear items.",
          ].join(" "),
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Analyze this food photo and suggest three recipes. Preferences: ${JSON.stringify(input.preferences)}.`,
        },
        {
          type: "input_image",
          image_url: imageUrl,
        },
      ],
    },
  ]);

  return validateGeneratedContent(raw);
}

export async function generateRecipes(input: RecipesInput) {
  if (shouldUseFixtureMode()) {
    return createFixtureResult(input.preferences, input.ingredients);
  }

  const config = getOpenAIConfig();
  const raw = await callOpenAI(config, [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "You generate practical weeknight recipes from a corrected ingredient list.",
            "Return only JSON matching the provided schema.",
            "Use the supplied ingredients as the have list where appropriate.",
          ].join(" "),
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            ingredients: input.ingredients,
            preferences: input.preferences,
          }),
        },
      ],
    },
  ]);

  return validateGeneratedContent(raw);
}

function shouldUseFixtureMode() {
  const fixtureMode = process.env.FRIDGE_TO_DINNER_FIXTURE_MODE?.toLowerCase();

  return fixtureMode === "1" || fixtureMode === "true" || !process.env.OPENAI_API_KEY;
}

function getOpenAIConfig(): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    throw new PublicApiError(
      "provider_config_missing",
      "Recipe generation is not configured on this server.",
      { status: 503, retryable: true },
    );
  }

  return { apiKey, model };
}

async function callOpenAI(config: OpenAIConfig, input: unknown[]) {
  let response: Response;

  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        input,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "fridge_to_dinner_result",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });
  } catch {
    throw new PublicApiError(
      "provider_failed",
      "Recipe generation is temporarily unavailable.",
      { status: 502, retryable: true },
    );
  }

  if (!response.ok) {
    throw new PublicApiError(
      "provider_failed",
      "Recipe generation is temporarily unavailable.",
      { status: 502, retryable: true },
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned an invalid response.",
      { status: 502, retryable: true },
    );
  }

  return parseOpenAIJson(body);
}

function parseOpenAIJson(body: unknown) {
  if (isRecord(body) && typeof body.output_text === "string") {
    return parseJsonOutput(body.output_text);
  }

  if (isRecord(body) && Array.isArray(body.output)) {
    const text = body.output
      .flatMap((item) => (isRecord(item) && Array.isArray(item.content) ? item.content : []))
      .map((item) => (isRecord(item) && typeof item.text === "string" ? item.text : ""))
      .join("");

    if (text) {
      return parseJsonOutput(text);
    }
  }

  throw new PublicApiError(
    "provider_response_invalid",
    "The recipe service returned an invalid response.",
    { status: 502, retryable: true },
  );
}

function parseJsonOutput(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new PublicApiError(
      "provider_response_invalid",
      "The recipe service returned an invalid response.",
      { status: 502, retryable: true },
    );
  }
}

function createFixtureResult(
  preferences: Preferences,
  ingredients: Ingredient[] = fixtureIngredients,
) {
  const normalizedIngredients = ingredients.map((ingredient) => ({
    ...ingredient,
    confidence: ingredient.source === "user" ? "high" : ingredient.confidence,
  })) satisfies Ingredient[];

  return validateGeneratedContent({
    ingredients: normalizedIngredients,
    recipes: createFixtureRecipes(normalizedIngredients, preferences),
  });
}

function createFixtureRecipes(ingredients: Ingredient[], preferences: Preferences) {
  const have = ingredients.map((ingredient) => ingredient.name);
  const baseNeed = preferences.vegetarian ? ["lemon", "fresh herbs"] : ["chicken broth"];
  const quickNeed = preferences.under30 ? ["tortillas"] : ["parmesan"];

  return [
    {
      id: "recipe_1",
      title: preferences.vegetarian ? "Tomato Bean Skillet" : "Fridge Fried Rice",
      minutes: preferences.under30 ? 20 : 30,
      servings: 2,
      difficulty: "easy",
      have: have.slice(0, 4),
      need: baseNeed,
      steps: [
        "Warm a large skillet and add the heartier ingredients first.",
        "Fold in the faster-cooking items until just tender.",
        "Season, taste, and finish with a bright squeeze of lemon or sauce.",
      ],
      whyThisWorks:
        "It turns the most flexible fridge ingredients into a fast skillet dinner with a small flavor boost.",
    },
    {
      id: "recipe_2",
      title: "Clean-Out Quesadillas",
      minutes: 18,
      servings: 2,
      difficulty: "easy",
      have: have.slice(0, 3),
      need: quickNeed,
      steps: [
        "Chop the ingredients into small pieces so the filling heats evenly.",
        "Layer the filling into tortillas and toast until crisp on both sides.",
        "Slice and serve with any yogurt, salsa, or hot sauce you have.",
      ],
      whyThisWorks:
        "A tortilla makes mixed leftovers feel intentional while keeping the cook time short.",
    },
    {
      id: "recipe_3",
      title: "Pantry Soup Bowl",
      minutes: preferences.under30 ? 25 : 35,
      servings: 3,
      difficulty: "medium",
      have: have.slice(0, 5),
      need: preferences.vegetarian ? ["vegetable stock"] : ["stock"],
      steps: [
        "Simmer the firmest ingredients with stock until they start to soften.",
        "Add delicate items near the end so they keep their texture.",
        "Serve as a brothy bowl with toast, rice, or noodles if available.",
      ],
      whyThisWorks:
        "Soup is forgiving with uneven fridge odds and ends, and it preserves the have-versus-need split clearly.",
    },
  ];
}

const fixtureIngredients = [
  {
    id: "ing_eggs",
    name: "eggs",
    confidence: "high",
    source: "vision",
  },
  {
    id: "ing_rice",
    name: "rice",
    confidence: "medium",
    source: "vision",
  },
  {
    id: "ing_carrot",
    name: "carrot",
    confidence: "medium",
    source: "vision",
  },
  {
    id: "ing_spinach",
    name: "spinach",
    confidence: "low",
    source: "vision",
  },
] satisfies Ingredient[];

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ingredients", "recipes"],
  properties: {
    ingredients: {
      type: "array",
      minItems: 1,
      maxItems: 30,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "confidence", "source"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
          source: { type: "string", enum: ["vision", "user", "suggested"] },
        },
      },
    },
    recipes: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "title",
          "minutes",
          "servings",
          "difficulty",
          "have",
          "need",
          "steps",
          "whyThisWorks",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          minutes: { type: "integer" },
          servings: { type: "integer" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          have: { type: "array", items: { type: "string" } },
          need: { type: "array", items: { type: "string" } },
          steps: { type: "array", items: { type: "string" } },
          whyThisWorks: { type: "string" },
        },
      },
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
