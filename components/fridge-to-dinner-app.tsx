"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { Ingredient, Preferences, Recipe } from "@/lib/schemas";
import { Toaster } from "@/components/ui/sonner";

import { DesktopAside } from "./desktop-aside";
import {
  baseIngredients,
  baseRecipes,
  demoImage,
  statusLines,
  suggestedIngredients,
} from "./mock-data";
import { buildRecipes, clearPhotoObjectUrl } from "./recipe-utils";
import { AnalyzingScreen } from "./screens/analyzing-screen";
import { ErrorScreen } from "./screens/error-screen";
import { HomeScreen } from "./screens/home-screen";
import { ManualScreen } from "./screens/manual-screen";
import { PrivacyScreen } from "./screens/privacy-screen";
import { RecipeDetailScreen } from "./screens/recipe-detail-screen";
import { ResultsScreen } from "./screens/results-screen";
import { ReviewScreen } from "./screens/review-screen";
import { ShareScreen } from "./screens/share-screen";
import type { Screen } from "./types";

const initialManualText = "eggs, cooked rice, carrots, spinach, cheddar";

export function FridgeToDinnerApp() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoObjectUrlRef = useRef<string | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>(baseIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>(baseRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState(baseRecipes[0].id);
  const [newIngredient, setNewIngredient] = useState("");
  const [manualText, setManualText] = useState(initialManualText);
  const [preferences, setPreferences] = useState<Required<Preferences>>({
    vegetarian: false,
    under30: true,
    useExpiringSoon: false,
  });

  const currentPhoto = photoUrl ?? demoImage;
  const selectedRecipe =
    recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0];
  const confidenceSummary = useMemo(() => {
    const high = ingredients.filter((item) => item.confidence === "high").length;
    const medium = ingredients.filter(
      (item) => item.confidence === "medium"
    ).length;
    const low = ingredients.filter((item) => item.confidence === "low").length;

    return { high, medium, low };
  }, [ingredients]);

  useEffect(() => {
    return () => clearPhotoObjectUrl(photoObjectUrlRef);
  }, []);

  useEffect(() => {
    if (screen !== "analyzing") {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(value + 14, 96));
      setStatusIndex((index) => (index + 1) % statusLines.length);
    }, 520);

    const complete = window.setTimeout(() => {
      setProgress(100);
      setIngredients((current) =>
        current.length > 0 ? current : baseIngredients
      );
      setRecipes(buildRecipes(ingredients, preferences));
      setSelectedRecipeId(baseRecipes[0].id);
      setScreen("results");
    }, 2800);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(complete);
    };
  }, [ingredients, preferences, screen]);

  function choosePhoto() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setScreen("error");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setScreen("error");
      return;
    }

    clearPhotoObjectUrl(photoObjectUrlRef);
    const objectUrl = URL.createObjectURL(file);
    photoObjectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setPhotoUrl(objectUrl);
    setScreen("review");
  }

  function useDemoPhoto() {
    clearPhotoObjectUrl(photoObjectUrlRef);
    setSelectedFile(null);
    setPhotoUrl(null);
    setScreen("review");
  }

  function startAnalysis() {
    setProgress(8);
    setStatusIndex(0);
    setScreen("analyzing");
  }

  function resetFlow() {
    clearPhotoObjectUrl(photoObjectUrlRef);
    setSelectedFile(null);
    setPhotoUrl(null);
    setProgress(0);
    setIngredients(baseIngredients);
    setRecipes(baseRecipes);
    setSelectedRecipeId(baseRecipes[0].id);
    setScreen("home");
  }

  function addIngredient(name = newIngredient) {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      return;
    }

    setIngredients((current) => [
      ...current,
      {
        id: ingredientId(normalized, current.length),
        name: normalized.replace(/\?$/, ""),
        confidence: "high",
        source: "user",
      },
    ]);
    setNewIngredient("");
  }

  function removeIngredient(id: string) {
    setIngredients((current) => current.filter((item) => item.id !== id));
  }

  function regenerateRecipes() {
    const nextRecipes = buildRecipes(ingredients, preferences);
    setRecipes(nextRecipes);
    setSelectedRecipeId(nextRecipes[0].id);
    toast.success("Recipes refreshed from your edited shelf.");
  }

  function submitManualIngredients() {
    const parsed = manualText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      toast.error("Add at least one ingredient.");
      return;
    }

    const manualIngredients = parsed.map<Ingredient>((name, index) => ({
      id: ingredientId(name, index, "ing_manual"),
      name,
      confidence: "high",
      source: "user",
    }));

    setIngredients(manualIngredients);
    setRecipes(buildRecipes(manualIngredients, preferences));
    setSelectedRecipeId(baseRecipes[0].id);
    setScreen("results");
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

  async function shareRecipe() {
    const text = `Tonight I am making ${selectedRecipe.title} with Fridge to Dinner.`;

    if (navigator.share) {
      await navigator.share({ title: selectedRecipe.title, text });
      return;
    }

    await navigator.clipboard.writeText(text);
    toast.success("Share text copied.");
  }

  async function copyRecipe() {
    await navigator.clipboard.writeText(
      `${selectedRecipe.title}\n\n${selectedRecipe.steps.join("\n")}`
    );
    toast.success("Recipe copied.");
  }

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl items-center gap-8 px-0 lg:grid-cols-[minmax(0,1fr)_minmax(380px,420px)] lg:px-6 lg:py-8">
        <DesktopAside
          screen={screen}
          confidenceSummary={confidenceSummary}
          selectedRecipe={selectedRecipe}
        />
        <section className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-paper lg:min-h-[840px] lg:max-w-[420px] lg:overflow-hidden lg:rounded-[42px] lg:border lg:border-border lg:shadow-float">
          {renderScreen(screen, {
            currentPhoto,
            fileInputRef,
            ingredients,
            manualText,
            newIngredient,
            preferences,
            progress,
            recipes,
            selectedFile,
            selectedRecipe,
            statusIndex,
            choosePhoto,
            copyRecipe,
            handleFileChange,
            openRecipe,
            regenerateRecipes,
            removeIngredient,
            resetFlow,
            setManualText,
            setNewIngredient,
            setScreen,
            shareRecipe,
            startAnalysis,
            submitManualIngredients,
            updatePreferences,
            useDemoPhoto,
            addIngredient,
          })}
        </section>
      </div>
      <Toaster position="bottom-center" />
    </main>
  );
}

type RenderScreenArgs = {
  currentPhoto: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  ingredients: Ingredient[];
  manualText: string;
  newIngredient: string;
  preferences: Required<Preferences>;
  progress: number;
  recipes: Recipe[];
  selectedFile: File | null;
  selectedRecipe: Recipe;
  statusIndex: number;
  choosePhoto: () => void;
  copyRecipe: () => Promise<void>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openRecipe: (recipe: Recipe) => void;
  regenerateRecipes: () => void;
  removeIngredient: (id: string) => void;
  resetFlow: () => void;
  setManualText: (value: string) => void;
  setNewIngredient: (value: string) => void;
  setScreen: (screen: Screen) => void;
  shareRecipe: () => Promise<void>;
  startAnalysis: () => void;
  submitManualIngredients: () => void;
  updatePreferences: (values: string[]) => void;
  useDemoPhoto: () => void;
  addIngredient: (name?: string) => void;
};

function renderScreen(screen: Screen, args: RenderScreenArgs) {
  switch (screen) {
    case "home":
      return (
        <HomeScreen
          fileInputRef={args.fileInputRef}
          onChoosePhoto={args.choosePhoto}
          onDemoPhoto={args.useDemoPhoto}
          onFileChange={args.handleFileChange}
          onManual={() => args.setScreen("manual")}
          onPrivacy={() => args.setScreen("privacy")}
        />
      );
    case "manual":
      return (
        <ManualScreen
          manualText={args.manualText}
          preferences={args.preferences}
          onBack={() => args.setScreen("home")}
          onManualTextChange={args.setManualText}
          onPreferencesChange={args.updatePreferences}
          onSubmit={args.submitManualIngredients}
        />
      );
    case "review":
      return (
        <ReviewScreen
          photoUrl={args.currentPhoto}
          onBack={() => args.setScreen("home")}
          onRetake={args.choosePhoto}
          onUsePhoto={args.startAnalysis}
        />
      );
    case "analyzing":
      return (
        <AnalyzingScreen
          photoUrl={args.currentPhoto}
          progress={args.progress}
          status={statusLines[args.statusIndex]}
          onCancel={args.resetFlow}
        />
      );
    case "results":
      return (
        <ResultsScreen
          ingredients={args.ingredients}
          newIngredient={args.newIngredient}
          preferences={args.preferences}
          recipes={args.recipes}
          suggestedIngredients={suggestedIngredients}
          onAddIngredient={args.addIngredient}
          onNewIngredientChange={args.setNewIngredient}
          onOpenRecipe={args.openRecipe}
          onPreferencesChange={args.updatePreferences}
          onRegenerate={args.regenerateRecipes}
          onRemoveIngredient={args.removeIngredient}
          onShowPrivacy={() => args.setScreen("privacy")}
          onSnapAgain={args.resetFlow}
        />
      );
    case "detail":
      return (
        <RecipeDetailScreen
          recipe={args.selectedRecipe}
          onBack={() => args.setScreen("results")}
          onShare={() => args.setScreen("share")}
          onStartCooking={() => toast.success("Cooking mode ready. Keep going.")}
        />
      );
    case "privacy":
      return (
        <PrivacyScreen
          onBack={() => args.setScreen("home")}
          onStart={args.choosePhoto}
        />
      );
    case "error":
      return (
        <ErrorScreen
          onManual={() => args.setScreen("manual")}
          onRetake={args.choosePhoto}
          onRetry={() => args.setScreen(args.selectedFile ? "review" : "home")}
        />
      );
    case "share":
      return (
        <ShareScreen
          recipe={args.selectedRecipe}
          onBack={() => args.setScreen("detail")}
          onCopy={args.copyRecipe}
          onShare={args.shareRecipe}
          onSnapAgain={args.resetFlow}
        />
      );
  }
}

function ingredientId(name: string, index: number, prefix = "ing") {
  return `${prefix}_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${index}`;
}
