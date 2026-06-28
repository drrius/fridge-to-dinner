import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type ModelMessage, Output } from "ai";
import { z } from "zod";

import { imageToDataUrl, type ValidatedImage } from "@/lib/image";
import {
  CONFIDENCE_VALUES,
  DIFFICULTY_VALUES,
  INGREDIENT_SOURCE_VALUES,
  type Ingredient,
  type Preferences,
  PublicApiError,
} from "@/lib/schema-types";
import { validateGeneratedContent } from "@/lib/schema-validation";

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

const generatedContentOutput = Output.object({
  schema: z.object({
    ingredients: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          confidence: z.enum(CONFIDENCE_VALUES),
          source: z.enum(INGREDIENT_SOURCE_VALUES),
        })
      )
      .min(1)
      .max(30),
    recipes: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          minutes: z.number().int().positive(),
          servings: z.number().int().positive(),
          difficulty: z.enum(DIFFICULTY_VALUES),
          have: z.array(z.string()),
          need: z.array(z.string()),
          steps: z.array(z.string()).min(1),
          whyThisWorks: z.string(),
        })
      )
      .min(1)
      .max(5),
  }),
});

type StructuredPrompt =
  | {
      system: string;
      prompt: string;
    }
  | {
      system: string;
      messages: ModelMessage[];
    };

export async function analyzeImage(input: AnalyzeInput) {
  const config = getOpenAIConfig();
  const imageUrl = await imageToDataUrl(input.image);
  const output = await generateStructuredContent(config, {
    system: [
      "You turn fridge or pantry photos into practical weeknight dinners.",
      "Return ingredient ids as stable snake_case strings.",
      "Do not claim certainty for unclear items.",
      "Prefer simple recipes that use the detected ingredients first.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              "Analyze this food photo and suggest three dinner recipes.",
              `Preferences: ${JSON.stringify(input.preferences)}.`,
            ].join(" "),
          },
          {
            type: "image",
            image: imageUrl,
          },
        ],
      },
    ],
  });

  return validateGeneratedContent(output);
}

export async function generateRecipes(input: RecipesInput) {
  const config = getOpenAIConfig();
  const output = await generateStructuredContent(config, {
    system: [
      "You generate practical weeknight recipes from a corrected ingredient list.",
      "Return ingredient ids as stable snake_case strings.",
      "Use the supplied ingredients as the have list where appropriate.",
      "Do not invent pantry staples as have items unless the user supplied them.",
    ].join(" "),
    prompt: JSON.stringify({
      ingredients: input.ingredients,
      preferences: input.preferences,
    }),
  });

  return validateGeneratedContent(output);
}

function getOpenAIConfig(): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    throw new PublicApiError(
      "provider_config_missing",
      "Recipe generation is not configured on this server.",
      { status: 503, retryable: true }
    );
  }

  return { apiKey, model };
}

async function generateStructuredContent(
  config: OpenAIConfig,
  structuredPrompt: StructuredPrompt
) {
  const openai = createOpenAI({ apiKey: config.apiKey });

  try {
    const model = openai(config.model);
    const result =
      "messages" in structuredPrompt
        ? await generateText({
            model,
            output: generatedContentOutput,
            system: structuredPrompt.system,
            messages: structuredPrompt.messages,
          })
        : await generateText({
            model,
            output: generatedContentOutput,
            system: structuredPrompt.system,
            prompt: structuredPrompt.prompt,
          });

    return result.output;
  } catch {
    throw new PublicApiError(
      "provider_failed",
      "Recipe generation is temporarily unavailable.",
      { status: 502, retryable: true }
    );
  }
}
