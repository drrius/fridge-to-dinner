"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { Ingredient, Preferences, Recipe } from "@/lib/schema-types";

import { analyzePhoto, regenerateFromIngredients } from "./api-client";
import { statusLines } from "./constants";
import {
  beginRequest,
  defaultErrorMessage,
  finishRequest,
  ingredientId,
  parseManualIngredients,
  toErrorMessage,
} from "./flow-helpers";
import { clearPhotoObjectUrl } from "./recipe-utils";
import type { Screen } from "./types";
import { useRecipeActions } from "./use-recipe-actions";

const initialManualText = "eggs, cooked rice, carrots, spinach, cheddar";

export function useFridgeToDinnerFlow() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoObjectUrlRef = useRef<string | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState("");
  const [manualText, setManualText] = useState(initialManualText);
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [preferences, setPreferences] = useState<Required<Preferences>>({
    vegetarian: false,
    under30: true,
    useExpiringSoon: false,
  });

  const selectedRecipe =
    recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0] ?? null;
  const { copyRecipe, shareRecipe, startCooking } = useRecipeActions({
    selectedRecipe,
  });
  const confidenceSummary = useMemo(() => {
    const high = ingredients.filter((item) => item.confidence === "high").length;
    const medium = ingredients.filter(
      (item) => item.confidence === "medium"
    ).length;
    const low = ingredients.filter((item) => item.confidence === "low").length;

    return { high, medium, low };
  }, [ingredients]);

  useEffect(() => {
    const activeRequest = activeRequestRef;
    const photoObjectUrl = photoObjectUrlRef;

    return () => {
      activeRequest.current?.abort();
      clearPhotoObjectUrl(photoObjectUrl);
    };
  }, []);

  useEffect(() => {
    if (screen !== "analyzing" && screen !== "generating") {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(value + 14, 96));
      setStatusIndex((index) => (index + 1) % statusLines.length);
    }, 520);

    return () => window.clearInterval(interval);
  }, [screen]);

  function choosePhoto() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showError("Use an image from your camera roll.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showError("That photo is too large. Try a smaller image.");
      return;
    }

    clearPhotoObjectUrl(photoObjectUrlRef);
    const objectUrl = URL.createObjectURL(file);
    photoObjectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setPhotoUrl(objectUrl);
    setScreen("review");
  }

  async function startAnalysis() {
    if (!selectedFile) {
      showError("Choose a fridge photo before starting the scan.");
      return;
    }

    startLoading();
    const controller = beginRequest(activeRequestRef);

    try {
      const result = await analyzePhoto(selectedFile, preferences, {
        signal: controller.signal,
      });

      applyApiResult(result);
      setProgress(100);
      setScreen("results");
    } catch (error) {
      handleRequestError(error, controller);
    } finally {
      finishRequest(activeRequestRef, controller);
    }
  }

  function resetFlow() {
    activeRequestRef.current?.abort();
    clearPhotoObjectUrl(photoObjectUrlRef);
    setSelectedFile(null);
    setPhotoUrl(null);
    setProgress(0);
    setIngredients([]);
    setRecipes([]);
    setSelectedRecipeId(null);
    setErrorMessage(defaultErrorMessage);
    setIsRegenerating(false);
    setScreen("home");
  }

  function addIngredient(name = newIngredient) {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      return;
    }

    const ingredientName = normalized.replace(/\?$/, "");

    setIngredients((current) => {
      const withoutAcceptedSuggestion = current.filter(
        (ingredient) =>
          ingredient.source !== "suggested" ||
          ingredient.name.toLowerCase() !== ingredientName.toLowerCase()
      );

      return [
        ...withoutAcceptedSuggestion,
        {
          id: ingredientId(ingredientName, withoutAcceptedSuggestion.length),
          name: ingredientName,
          confidence: "high",
          source: "user",
        },
      ];
    });
    setNewIngredient("");
  }

  function removeIngredient(id: string) {
    setIngredients((current) => current.filter((item) => item.id !== id));
  }

  async function regenerateRecipes() {
    const confirmedIngredients = ingredients.filter(
      (ingredient) => ingredient.source !== "suggested"
    );

    if (confirmedIngredients.length === 0) {
      toast.error("Keep at least one confirmed ingredient before regenerating.");
      return;
    }

    setIsRegenerating(true);
    const controller = beginRequest(activeRequestRef);

    try {
      const result = await regenerateFromIngredients(
        confirmedIngredients,
        preferences,
        {
          signal: controller.signal,
        }
      );

      if (controller.signal.aborted) {
        return;
      }

      applyApiResult(result);
      toast.success("Recipes refreshed from your edited shelf.");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      toast.error(toErrorMessage(error));
    } finally {
      const isCurrentRequest = activeRequestRef.current === controller;

      finishRequest(activeRequestRef, controller);

      if (isCurrentRequest) {
        setIsRegenerating(false);
      }
    }
  }

  async function submitManualIngredients() {
    const manualIngredients = parseManualIngredients(manualText);

    if (manualIngredients.length === 0) {
      toast.error("Add at least one ingredient.");
      return;
    }

    startLoading("generating");
    const controller = beginRequest(activeRequestRef);

    try {
      const result = await regenerateFromIngredients(manualIngredients, preferences, {
        signal: controller.signal,
      });

      applyApiResult(result);
      setProgress(100);
      setScreen("results");
    } catch (error) {
      handleRequestError(error, controller);
    } finally {
      finishRequest(activeRequestRef, controller);
    }
  }

  function updatePreferences(values: string[]) {
    setPreferences({
      vegetarian: values.includes("vegetarian"),
      under30: values.includes("under30"),
      useExpiringSoon: values.includes("useExpiringSoon"),
    });
  }

  function openRecipe(recipe: Recipe) {
    setSelectedRecipeId(recipe.id);
    setScreen("detail");
  }

  function showError(message: string) {
    setErrorMessage(message);
    setScreen("error");
  }

  function startLoading(nextScreen: Extract<Screen, "analyzing" | "generating"> = "analyzing") {
    setIsRegenerating(false);
    setProgress(8);
    setStatusIndex(0);
    setScreen(nextScreen);
  }

  function applyApiResult(result: { ingredients: Ingredient[]; recipes: Recipe[] }) {
    setIngredients(result.ingredients);
    setRecipes(result.recipes);
    setSelectedRecipeId(result.recipes[0].id);
  }

  function handleRequestError(error: unknown, controller: AbortController) {
    if (controller.signal.aborted) {
      return;
    }

    showError(toErrorMessage(error));
  }

  return {
    addIngredient,
    choosePhoto,
    confidenceSummary,
    copyRecipe,
    currentPhoto: photoUrl,
    errorMessage,
    fileInputRef,
    handleFileChange,
    ingredients,
    isRegenerating,
    manualText,
    newIngredient,
    openRecipe,
    preferences,
    progress,
    recipes,
    regenerateRecipes,
    removeIngredient,
    resetFlow,
    screen,
    selectedFile,
    selectedRecipe,
    setManualText,
    setNewIngredient,
    setScreen,
    shareRecipe,
    startAnalysis,
    startCooking,
    status: statusLines[statusIndex],
    submitManualIngredients,
    updatePreferences,
  };
}

export type FridgeToDinnerFlow = ReturnType<typeof useFridgeToDinnerFlow>;
