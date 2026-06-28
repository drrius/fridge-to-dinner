import type { Ingredient } from "@/lib/schema-types";

import { ClientApiError } from "./api-client";

export const defaultErrorMessage =
  "Try a smaller image, retake the shelf, or skip straight to typing ingredients.";

export function parseManualIngredients(manualText: string): Ingredient[] {
  return manualText
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: ingredientId(name, index, "ing_manual"),
      name,
      confidence: "high",
      source: "user",
    }));
}

export function ingredientId(name: string, index: number, prefix = "ing") {
  return `${prefix}_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${index}`;
}

export function beginRequest(ref: React.MutableRefObject<AbortController | null>) {
  ref.current?.abort();
  const controller = new AbortController();

  ref.current = controller;
  return controller;
}

export function finishRequest(
  ref: React.MutableRefObject<AbortController | null>,
  controller: AbortController
) {
  if (ref.current === controller) {
    ref.current = null;
  }
}

export function toErrorMessage(error: unknown) {
  if (error instanceof ClientApiError) {
    return error.message;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "The scan was canceled.";
  }

  return defaultErrorMessage;
}
