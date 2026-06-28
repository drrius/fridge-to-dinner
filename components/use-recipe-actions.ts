"use client";

import { toast } from "sonner";

import type { Recipe } from "@/lib/schema-types";

type UseRecipeActionsInput = {
  selectedRecipe: Recipe | null;
};

export function useRecipeActions({ selectedRecipe }: UseRecipeActionsInput) {
  async function shareRecipe() {
    if (!selectedRecipe) {
      toast.error("Scan or type ingredients before sharing.");
      return;
    }

    const text = `Tonight I am making ${selectedRecipe.title} with Fridge to Dinner.`;

    if (navigator.share) {
      await navigator.share({ title: selectedRecipe.title, text });
      return;
    }

    await navigator.clipboard.writeText(text);
    toast.success("Share text copied.");
  }

  async function copyRecipe() {
    if (!selectedRecipe) {
      toast.error("Scan or type ingredients before copying.");
      return;
    }

    await navigator.clipboard.writeText(
      `${selectedRecipe.title}\n\n${selectedRecipe.steps.join("\n")}`
    );
    toast.success("Recipe copied.");
  }

  function startCooking() {
    toast.success("Cooking mode ready. Keep going.");
  }

  return { copyRecipe, shareRecipe, startCooking };
}
