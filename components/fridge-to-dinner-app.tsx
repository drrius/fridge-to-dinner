"use client";

import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CameraIcon,
  ChefHatIcon,
  ChevronRightIcon,
  Clock3Icon,
  CopyIcon,
  ImageIcon,
  KeyboardIcon,
  LeafIcon,
  LockKeyholeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  SaveIcon,
  Share2Icon,
  ShieldCheckIcon,
  ShoppingBasketIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  UtensilsIcon,
  WandSparklesIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { Ingredient, Preferences, Recipe } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Screen =
  | "home"
  | "manual"
  | "review"
  | "analyzing"
  | "results"
  | "detail"
  | "privacy"
  | "error"
  | "share";

type PreferenceKey = keyof Required<Preferences>;

const demoImage = "/fridge-demo.svg";

const baseIngredients: Ingredient[] = [
  { id: "ing_eggs", name: "eggs", confidence: "high", source: "vision" },
  {
    id: "ing_rice",
    name: "cooked rice",
    confidence: "high",
    source: "vision",
  },
  { id: "ing_carrot", name: "carrots", confidence: "medium", source: "vision" },
  { id: "ing_spinach", name: "spinach", confidence: "medium", source: "vision" },
  { id: "ing_cheddar", name: "cheddar", confidence: "low", source: "vision" },
  { id: "ing_yogurt", name: "plain yogurt", confidence: "medium", source: "vision" },
];

const suggestedIngredients: Ingredient[] = [
  { id: "ing_cilantro", name: "cilantro?", confidence: "low", source: "suggested" },
  { id: "ing_lime", name: "lime?", confidence: "low", source: "suggested" },
  { id: "ing_tofu", name: "tofu?", confidence: "low", source: "suggested" },
];

const baseRecipes: Recipe[] = [
  {
    id: "recipe_fried_rice",
    title: "Fridge Fried Rice",
    minutes: 20,
    servings: 2,
    difficulty: "easy",
    have: ["eggs", "cooked rice", "carrots", "spinach"],
    need: ["soy sauce", "scallions"],
    steps: [
      "Warm a wide skillet with a little oil over medium-high heat.",
      "Scramble the eggs first, then slide them onto a plate.",
      "Stir-fry carrots and rice until the grains crisp at the edges.",
      "Fold in spinach and eggs, then season with soy sauce.",
    ],
    whyThisWorks:
      "Cooked rice and eggs make a fast base, while the vegetables add color and texture without needing a long cook.",
  },
  {
    id: "recipe_omelet",
    title: "Cheddar Spinach Omelet",
    minutes: 12,
    servings: 1,
    difficulty: "easy",
    have: ["eggs", "spinach", "cheddar"],
    need: ["toast"],
    steps: [
      "Wilt the spinach in a nonstick pan.",
      "Add beaten eggs and cook until just set.",
      "Scatter cheddar over one side, fold, and rest for one minute.",
    ],
    whyThisWorks:
      "It turns the highest-confidence staples into dinner with very little prep.",
  },
  {
    id: "recipe_rice_bowl",
    title: "Carrot Rice Bowl",
    minutes: 18,
    servings: 2,
    difficulty: "easy",
    have: ["cooked rice", "carrots", "spinach", "plain yogurt"],
    need: ["sesame oil", "chili crisp"],
    steps: [
      "Saute carrots until lightly browned.",
      "Add rice and spinach, then cook until hot.",
      "Spoon yogurt over the bowl for a cool contrast.",
      "Finish with sesame oil and chili crisp.",
    ],
    whyThisWorks:
      "The bowl uses ready-to-eat leftovers and only asks for pantry flavor boosters.",
  },
];

const statusLines = [
  "reading the shelves",
  "spotting ingredients",
  "checking weeknight options",
  "building dinner cards",
];

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
  const [manualText, setManualText] = useState(
    "eggs, cooked rice, carrots, spinach, cheddar"
  );
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
    const medium = ingredients.filter((item) => item.confidence === "medium").length;
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
      setIngredients((current) => (current.length > 0 ? current : baseIngredients));
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
        id: `ing_${normalized.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${current.length}`,
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
      id: `ing_manual_${index}_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
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

  const content = {
    home: (
      <HomeScreen
        fileInputRef={fileInputRef}
        onChoosePhoto={choosePhoto}
        onDemoPhoto={useDemoPhoto}
        onFileChange={handleFileChange}
        onManual={() => setScreen("manual")}
        onPrivacy={() => setScreen("privacy")}
      />
    ),
    manual: (
      <ManualScreen
        manualText={manualText}
        preferences={preferences}
        onBack={() => setScreen("home")}
        onManualTextChange={setManualText}
        onPreferencesChange={updatePreferences}
        onSubmit={submitManualIngredients}
      />
    ),
    review: (
      <ReviewScreen
        photoUrl={currentPhoto}
        onBack={() => setScreen("home")}
        onRetake={choosePhoto}
        onUsePhoto={startAnalysis}
      />
    ),
    analyzing: (
      <AnalyzingScreen
        photoUrl={currentPhoto}
        progress={progress}
        status={statusLines[statusIndex]}
        onCancel={resetFlow}
      />
    ),
    results: (
      <ResultsScreen
        ingredients={ingredients}
        newIngredient={newIngredient}
        preferences={preferences}
        recipes={recipes}
        suggestedIngredients={suggestedIngredients}
        onAddIngredient={addIngredient}
        onNewIngredientChange={setNewIngredient}
        onOpenRecipe={openRecipe}
        onPreferencesChange={updatePreferences}
        onRegenerate={regenerateRecipes}
        onRemoveIngredient={removeIngredient}
        onShowPrivacy={() => setScreen("privacy")}
        onSnapAgain={resetFlow}
      />
    ),
    detail: (
      <RecipeDetailScreen
        recipe={selectedRecipe}
        onBack={() => setScreen("results")}
        onShare={() => setScreen("share")}
        onStartCooking={() => toast.success("Cooking mode ready. Keep going.")}
      />
    ),
    privacy: <PrivacyScreen onBack={() => setScreen("home")} onStart={choosePhoto} />,
    error: (
      <ErrorScreen
        onManual={() => setScreen("manual")}
        onRetake={choosePhoto}
        onRetry={() => setScreen(selectedFile ? "review" : "home")}
      />
    ),
    share: (
      <ShareScreen
        recipe={selectedRecipe}
        onBack={() => setScreen("detail")}
        onCopy={copyRecipe}
        onShare={shareRecipe}
        onSnapAgain={resetFlow}
      />
    ),
  } satisfies Record<Screen, React.ReactNode>;

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl items-center gap-8 px-0 lg:grid-cols-[minmax(0,1fr)_minmax(380px,420px)] lg:px-6 lg:py-8">
        <DesktopAside
          screen={screen}
          confidenceSummary={confidenceSummary}
          selectedRecipe={selectedRecipe}
        />
        <section className="mx-auto flex min-h-svh w-full flex-col bg-background lg:min-h-[840px] lg:max-w-[420px] lg:overflow-hidden lg:rounded-[42px] lg:border lg:border-border lg:bg-paper lg:shadow-float">
          {content[screen]}
        </section>
      </div>
      <Toaster position="bottom-center" />
    </main>
  );
}

function HomeScreen({
  fileInputRef,
  onChoosePhoto,
  onDemoPhoto,
  onFileChange,
  onManual,
  onPrivacy,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChoosePhoto: () => void;
  onDemoPhoto: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onManual: () => void;
  onPrivacy: () => void;
}) {
  return (
    <ScreenFrame footer={<PrivacyNote onClick={onPrivacy} />}>
      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-2 pt-2">
          <p className="font-machine text-xs font-medium tracking-[0.16em] text-tomato uppercase">
            No login / ~15 sec
          </p>
          <p className="font-machine text-sm text-text-muted">Fridge to Dinner</p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-7 py-10">
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
              Your fridge already knows what&apos;s for{" "}
              <span className="italic text-tomato">dinner.</span>
            </h1>
            <p className="max-w-[31ch] text-base leading-7 font-semibold text-ink/75">
              Snap a photo of your shelves. Get three dinners you can make
              tonight plus the few things you would grab.
            </p>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[250px] sm:block lg:hidden">
            <Image
              src={demoImage}
              alt="Illustrated fridge shelves"
              width={960}
              height={1200}
              className="aspect-[4/5] w-full rounded-2xl border border-border object-cover shadow-hard-sm"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={onChoosePhoto}>
            <CameraIcon data-icon="inline-start" />
            Snap your fridge
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={onDemoPhoto}>
              <ImageIcon data-icon="inline-start" />
              Demo
            </Button>
            <Button variant="outline" size="lg" onClick={onManual}>
              <KeyboardIcon data-icon="inline-start" />
              Type
            </Button>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function ManualScreen({
  manualText,
  preferences,
  onBack,
  onManualTextChange,
  onPreferencesChange,
  onSubmit,
}: {
  manualText: string;
  preferences: Required<Preferences>;
  onBack: () => void;
  onManualTextChange: (value: string) => void;
  onPreferencesChange: (values: string[]) => void;
  onSubmit: () => void;
}) {
  return (
    <ScreenFrame>
      <TopBar title="Type ingredients" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-7 py-8">
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs font-medium tracking-[0.14em] text-tomato uppercase">
            No photo needed
          </p>
          <h1 className="font-display text-4xl leading-none text-ink">
            Tell me what&apos;s on the shelf.
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            Separate ingredients with commas or new lines. We will keep it
            practical and dinner-sized.
          </p>
        </div>

        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="manual-ingredients">Ingredients</FieldLabel>
              <Textarea
                id="manual-ingredients"
                value={manualText}
                onChange={(event) => onManualTextChange(event.target.value)}
              />
              <FieldDescription>
                Example: eggs, rice, carrots, spinach, cheddar.
              </FieldDescription>
            </Field>
            <PreferenceControls
              preferences={preferences}
              onPreferencesChange={onPreferencesChange}
            />
          </FieldGroup>
        </FieldSet>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={onSubmit}>
          <WandSparklesIcon data-icon="inline-start" />
          Make dinner ideas
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack}>
          Back to photo scan
        </Button>
      </div>
    </ScreenFrame>
  );
}

function ReviewScreen({
  photoUrl,
  onBack,
  onRetake,
  onUsePhoto,
}: {
  photoUrl: string;
  onBack: () => void;
  onRetake: () => void;
  onUsePhoto: () => void;
}) {
  return (
    <ScreenFrame>
      <TopBar title="Looks good?" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <PhotoSurface photoUrl={photoUrl} alt="Selected fridge photo" />
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="mt-0.5 size-5 text-leaf" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-ink">Photo is processed once.</p>
              <p className="text-sm leading-5 text-text-muted">
                We only need enough detail to spot ingredients. No saved photo
                history in v1.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={onUsePhoto}>
          <SparklesIcon data-icon="inline-start" />
          Use this photo
        </Button>
        <Button variant="outline" size="lg" onClick={onRetake}>
          <RotateCcwIcon data-icon="inline-start" />
          Retake
        </Button>
      </div>
    </ScreenFrame>
  );
}

function AnalyzingScreen({
  photoUrl,
  progress,
  status,
  onCancel,
}: {
  photoUrl: string;
  progress: number;
  status: string;
  onCancel: () => void;
}) {
  return (
    <ScreenFrame>
      <div className="flex flex-1 flex-col justify-center gap-7">
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs font-medium tracking-[0.14em] text-tomato uppercase">
            Scanning
          </p>
          <h1 className="font-display text-4xl leading-none text-ink">
            Reading your shelves.
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            The app is looking for ingredients and ignoring the chaos around
            them.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-ink bg-surface shadow-hard-sm">
          <Image
            src={photoUrl}
            alt="Fridge photo being scanned"
            width={960}
            height={1200}
            className="aspect-[4/5] w-full object-cover"
            unoptimized={photoUrl.startsWith("blob:")}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan-sweep bg-[linear-gradient(180deg,transparent,rgba(232,84,46,0.4),rgba(229,168,35,0.18),transparent)]" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-machine text-xs tracking-[0.13em] text-text-muted uppercase">
              {status}
            </p>
            <p className="font-machine text-xs tracking-[0.13em] text-tomato uppercase">
              {Math.round(progress)}%
            </p>
          </div>
          <Progress value={progress} />
          <p className="text-sm leading-6 text-text-muted">
            spotting ingredients / 12 found
            <span className="inline-flex w-6 justify-start">
              <span className="animate-blink">...</span>
            </span>
          </p>
        </div>
      </div>
      <Button variant="ghost" size="lg" onClick={onCancel}>
        Cancel scan
      </Button>
    </ScreenFrame>
  );
}

function ResultsScreen({
  ingredients,
  newIngredient,
  preferences,
  recipes,
  suggestedIngredients,
  onAddIngredient,
  onNewIngredientChange,
  onOpenRecipe,
  onPreferencesChange,
  onRegenerate,
  onRemoveIngredient,
  onShowPrivacy,
  onSnapAgain,
}: {
  ingredients: Ingredient[];
  newIngredient: string;
  preferences: Required<Preferences>;
  recipes: Recipe[];
  suggestedIngredients: Ingredient[];
  onAddIngredient: (name?: string) => void;
  onNewIngredientChange: (value: string) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onPreferencesChange: (values: string[]) => void;
  onRegenerate: () => void;
  onRemoveIngredient: (id: string) => void;
  onShowPrivacy: () => void;
  onSnapAgain: () => void;
}) {
  return (
    <ScreenFrame compact footer={<PrivacyNote onClick={onShowPrivacy} />}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-machine text-xs font-medium tracking-[0.14em] text-tomato uppercase">
              Tonight I&apos;m making
            </p>
            <h1 className="font-display text-4xl leading-none text-ink">
              Three dinners that fit your fridge.
            </h1>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onSnapAgain}>
            <RefreshCcwIcon />
            <span className="sr-only">Snap again</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detected shelf</CardTitle>
            <CardDescription>Edit anything the camera guessed wrong.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <IngredientChip
                  key={ingredient.id}
                  ingredient={ingredient}
                  onRemove={() => onRemoveIngredient(ingredient.id)}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                aria-label="Add ingredient"
                value={newIngredient}
                placeholder="Add ingredient"
                onChange={(event) => onNewIngredientChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onAddIngredient();
                  }
                }}
              />
              <Button size="icon" variant="outline" onClick={() => onAddIngredient()}>
                <PlusIcon />
                <span className="sr-only">Add ingredient</span>
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-machine text-[0.68rem] tracking-[0.13em] text-text-muted uppercase">
                Maybe spotted
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedIngredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    className="min-h-10 rounded-pill border border-dashed border-ink/25 bg-surface px-3 text-sm font-semibold text-text-subtle transition hover:border-tomato hover:text-tomato"
                    onClick={() => onAddIngredient(ingredient.name)}
                  >
                    {ingredient.name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <PreferenceControls
          preferences={preferences}
          onPreferencesChange={onPreferencesChange}
        />

        <div className="flex flex-col gap-3">
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isBestMatch={index === 0}
              onOpen={() => onOpenRecipe(recipe)}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-5 border-t border-border bg-paper/92 px-5 pt-4 pb-5 backdrop-blur lg:-mx-6 lg:px-6">
        <Button className="w-full" size="lg" onClick={onRegenerate}>
          <WandSparklesIcon data-icon="inline-start" />
          Regenerate from edits
        </Button>
      </div>
    </ScreenFrame>
  );
}

function RecipeDetailScreen({
  recipe,
  onBack,
  onShare,
  onStartCooking,
}: {
  recipe: Recipe;
  onBack: () => void;
  onShare: () => void;
  onStartCooking: () => void;
}) {
  return (
    <ScreenFrame compact>
      <TopBar title="Best match" onBack={onBack} />
      <div className="flex flex-col gap-5 py-5">
        <div className="flex flex-col gap-3">
          <Badge>Best match</Badge>
          <h1 className="font-display text-5xl leading-[0.95] text-ink">
            {recipe.title}
          </h1>
          <p className="text-base leading-7 text-text-subtle">{recipe.whyThisWorks}</p>
        </div>

        <MetaRow recipe={recipe} />

        <div className="grid gap-3">
          <HaveNeedPanel title="You have" items={recipe.have} variant="have" />
          <HaveNeedPanel title="Grab" items={recipe.need} variant="need" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Steps</CardTitle>
            <CardDescription>Weeknight pace, no ceremony.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex list-decimal flex-col gap-4 pl-5">
              {recipe.steps.map((step) => (
                <li key={step} className="pl-1 text-base leading-7 text-ink/82">
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Button size="lg" onClick={onStartCooking}>
          <UtensilsIcon data-icon="inline-start" />
          Start cooking
        </Button>
        <Button variant="outline" size="icon-lg" onClick={onShare}>
          <Share2Icon />
          <span className="sr-only">Share recipe</span>
        </Button>
      </div>
    </ScreenFrame>
  );
}

function PrivacyScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  const promises = [
    {
      icon: LockKeyholeIcon,
      title: "No account",
      copy: "The scan flow works without sign-up, profiles, or recipe history.",
    },
    {
      icon: ImageIcon,
      title: "No saved photo roll",
      copy: "Images are processed for the result and are not stored in v1.",
    },
    {
      icon: PencilIcon,
      title: "Editable guesses",
      copy: "Ingredient chips stay editable because fridge photos are never perfect.",
    },
  ];

  return (
    <ScreenFrame>
      <TopBar title="Privacy" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-center gap-7 py-8">
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs tracking-[0.14em] text-tomato uppercase">
            Plain promise
          </p>
          <h1 className="font-display text-5xl leading-[0.95] text-ink">
            Photos are for dinner, not a dossier.
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            Fridge to Dinner is designed for a quick answer, not another account
            to manage.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {promises.map(({ icon: Icon, title, copy }) => (
            <Card key={title} size="sm">
              <CardContent className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-pill bg-have-tint text-leaf">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="text-sm leading-5 text-text-muted">{copy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Button size="lg" onClick={onStart}>
        <CameraIcon data-icon="inline-start" />
        Snap your fridge
      </Button>
    </ScreenFrame>
  );
}

function ErrorScreen({
  onManual,
  onRetake,
  onRetry,
}: {
  onManual: () => void;
  onRetake: () => void;
  onRetry: () => void;
}) {
  return (
    <ScreenFrame>
      <div className="flex flex-1 flex-col justify-center gap-7">
        <div className="grid size-16 place-items-center rounded-2xl bg-need-tint text-tomato-deep shadow-hard-sm">
          <AlertTriangleIcon className="size-8" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs tracking-[0.14em] text-tomato uppercase">
            Recoverable
          </p>
          <h1 className="font-display text-5xl leading-[0.95] text-ink">
            That photo did not make it through.
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            Try a smaller image, retake the shelf, or skip straight to typing
            ingredients.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={onRetry}>
          <RefreshCcwIcon data-icon="inline-start" />
          Try again
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={onRetake}>
            <CameraIcon data-icon="inline-start" />
            Retake
          </Button>
          <Button variant="outline" size="lg" onClick={onManual}>
            <KeyboardIcon data-icon="inline-start" />
            Type
          </Button>
        </div>
      </div>
    </ScreenFrame>
  );
}

function ShareScreen({
  recipe,
  onBack,
  onCopy,
  onShare,
  onSnapAgain,
}: {
  recipe: Recipe;
  onBack: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSnapAgain: () => void;
}) {
  return (
    <ScreenFrame>
      <TopBar title="Share result" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-center gap-7 py-8">
        <div className="rounded-[34px] border border-ink bg-surface p-6 shadow-hard">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-machine text-xs tracking-[0.14em] text-text-muted uppercase">
                Tonight I&apos;m making
              </p>
              <Badge variant="amber">{recipe.minutes} min</Badge>
            </div>
            <h1 className="font-display text-5xl leading-[0.95] text-ink">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {recipe.have.slice(0, 4).map((item) => (
                <Badge key={item} variant="have">
                  {item}
                </Badge>
              ))}
            </div>
            <Separator />
            <p className="font-machine text-xs tracking-[0.14em] text-text-muted uppercase">
              made with Fridge to Dinner
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" onClick={onShare}>
            <Share2Icon data-icon="inline-start" />
            Share
          </Button>
          <Button variant="outline" size="lg" onClick={onCopy}>
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
          <Button variant="outline" size="lg" onClick={() => toast.success("Card saved.")}>
            <SaveIcon data-icon="inline-start" />
            Save card
          </Button>
          <Button variant="outline" size="lg" onClick={() => toast("More share options soon.")}>
            <MoreHorizontalIcon data-icon="inline-start" />
            More
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="lg" onClick={onSnapAgain}>
        Snap again
      </Button>
    </ScreenFrame>
  );
}

function ScreenFrame({
  children,
  compact = false,
  footer,
}: {
  children: React.ReactNode;
  compact?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-1 flex-col bg-paper px-5 py-7 lg:min-h-full lg:px-6",
        compact ? "overflow-y-auto" : ""
      )}
    >
      <div className="flex flex-1 flex-col">{children}</div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <Button variant="ghost" size="icon-sm" onClick={onBack}>
        <ArrowLeftIcon />
        <span className="sr-only">Back</span>
      </Button>
      <p className="font-display text-2xl leading-none text-ink">{title}</p>
    </div>
  );
}

function PhotoSurface({ photoUrl, alt }: { photoUrl: string; alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-ink bg-surface shadow-hard">
      <Image
        src={photoUrl}
        alt={alt}
        width={960}
        height={1200}
        className="aspect-[4/5] w-full object-cover"
        unoptimized={photoUrl.startsWith("blob:")}
        priority
      />
      <div className="absolute top-4 right-4 rounded-pill bg-surface/92 px-3 py-2 font-machine text-[0.68rem] tracking-[0.12em] text-leaf uppercase">
        not saved
      </div>
    </div>
  );
}

function PreferenceControls({
  preferences,
  onPreferencesChange,
}: {
  preferences: Required<Preferences>;
  onPreferencesChange: (values: string[]) => void;
}) {
  const values = preferenceValues(preferences);

  return (
    <Field orientation="vertical">
      <FieldTitle>Preferences</FieldTitle>
      <ToggleGroup
        type="multiple"
        value={values}
        variant="outline"
        size="sm"
        className="flex w-full flex-wrap gap-2"
        onValueChange={(nextValues) => onPreferencesChange(nextValues)}
      >
        <ToggleGroupItem value="under30">Under 30 min</ToggleGroupItem>
        <ToggleGroupItem value="vegetarian">Vegetarian</ToggleGroupItem>
        <ToggleGroupItem value="useExpiringSoon">Use expiring soon</ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}

function IngredientChip({
  ingredient,
  onRemove,
}: {
  ingredient: Ingredient;
  onRemove: () => void;
}) {
  const isUser = ingredient.source === "user";
  const isLow = ingredient.confidence === "low";

  return (
    <span
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-pill border px-3 text-sm font-semibold",
        isUser
          ? "border-leaf/35 bg-have-tint text-ink"
          : isLow
            ? "border-amber/40 bg-amber-tint text-ink"
            : "border-border bg-surface text-ink"
      )}
    >
      <span>{ingredient.name}</span>
      <span className="font-machine text-[0.62rem] tracking-[0.11em] text-text-muted uppercase">
        {isUser ? "edited" : ingredient.confidence}
      </span>
      <button
        type="button"
        aria-label={`Remove ${ingredient.name}`}
        className="grid size-6 place-items-center rounded-pill text-text-muted transition hover:bg-need-tint hover:text-tomato"
        onClick={onRemove}
      >
        <XIcon className="size-3.5" />
      </button>
    </span>
  );
}

function RecipeCard({
  recipe,
  isBestMatch,
  onOpen,
}: {
  recipe: Recipe;
  isBestMatch: boolean;
  onOpen: () => void;
}) {
  return (
    <Card className={cn(isBestMatch ? "shadow-hard-sm" : "")}>
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardAction>{isBestMatch ? <Badge>Best match</Badge> : null}</CardAction>
        <CardDescription>{recipe.whyThisWorks}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <MetaRow recipe={recipe} compact />
        <div className="grid grid-cols-2 gap-2">
          <SummaryPill
            variant="have"
            label="You have"
            value={recipe.have.length.toString()}
          />
          <SummaryPill
            variant="need"
            label="Grab"
            value={recipe.need.length.toString()}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" size="lg" onClick={onOpen}>
          Open recipe
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function MetaRow({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  const items = [
    { icon: TimerIcon, label: `${recipe.minutes} min` },
    { icon: UsersIcon, label: `serves ${recipe.servings}` },
    { icon: ChefHatIcon, label: recipe.difficulty },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", compact ? "" : "py-1")}>
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-pill bg-muted px-3 font-machine text-[0.68rem] tracking-[0.11em] text-text-muted uppercase"
        >
          <Icon className="size-3.5" />
          {label}
        </span>
      ))}
    </div>
  );
}

function SummaryPill({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "have" | "need";
}) {
  const Icon = variant === "have" ? LeafIcon : ShoppingBasketIcon;

  return (
    <div
      className={cn(
        "flex min-h-16 items-center gap-2 rounded-xl px-3",
        variant === "have" ? "bg-have-tint text-leaf" : "bg-need-tint text-tomato-deep"
      )}
    >
      <Icon className="size-4" />
      <div className="flex flex-col">
        <span className="font-machine text-[0.64rem] tracking-[0.12em] uppercase">
          {label}
        </span>
        <span className="text-xl leading-none font-extrabold">{value}</span>
      </div>
    </div>
  );
}

function HaveNeedPanel({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "have" | "need";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>
          {variant === "have" ? "Already on the shelf." : "Worth grabbing nearby."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

function PrivacyNote({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="mx-auto flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-text-muted transition hover:text-ink"
      onClick={onClick}
    >
      <ShieldCheckIcon className="size-4 text-leaf" />
      Photos are processed once, never saved.
    </button>
  );
}

function DesktopAside({
  screen,
  confidenceSummary,
  selectedRecipe,
}: {
  screen: Screen;
  confidenceSummary: { high: number; medium: number; low: number };
  selectedRecipe: Recipe;
}) {
  return (
    <aside className="hidden min-h-[820px] flex-col justify-between rounded-[42px] border border-border bg-surface/70 p-8 shadow-card lg:flex">
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-machine text-xs tracking-[0.16em] text-tomato uppercase">
              Photo in / dinner out
            </p>
            <h2 className="max-w-[11ch] font-display text-6xl leading-[0.92] text-ink">
              Fridge to Dinner
            </h2>
          </div>
          <Badge variant="amber">Web app</Badge>
        </div>

        <div className="relative w-full max-w-[330px] self-center">
          <Image
            src={demoImage}
            alt="Illustrated fridge shelves"
            width={960}
            height={1200}
            className="aspect-[4/5] w-full animate-bob rounded-[36px] border border-ink object-cover shadow-hard"
            priority
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="High" value={confidenceSummary.high} />
          <MetricCard label="Med" value={confidenceSummary.medium} />
          <MetricCard label="Low" value={confidenceSummary.low} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Separator />
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-need-tint text-tomato">
            <Clock3Icon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-machine text-xs tracking-[0.14em] text-text-muted uppercase">
              Current screen
            </p>
            <p className="text-lg font-bold capitalize text-ink">{screen}</p>
            <p className="text-sm leading-5 text-text-muted">
              Best match: {selectedRecipe.title}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-paper p-4">
      <p className="font-machine text-[0.68rem] tracking-[0.14em] text-text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl leading-none text-ink">{value}</p>
    </div>
  );
}

function preferenceValues(preferences: Required<Preferences>) {
  return (Object.keys(preferences) as PreferenceKey[]).filter((key) => preferences[key]);
}

function clearPhotoObjectUrl(ref: MutableRefObject<string | null>) {
  if (!ref.current) {
    return;
  }

  URL.revokeObjectURL(ref.current);
  ref.current = null;
}

function buildRecipes(ingredients: Ingredient[], preferences: Required<Preferences>) {
  const available = new Set(ingredients.map((ingredient) => ingredient.name.toLowerCase()));

  return baseRecipes
    .filter((recipe) => (preferences.under30 ? recipe.minutes <= 30 : true))
    .map((recipe) => ({
      ...recipe,
      have: recipe.have.filter((item) => available.has(item.toLowerCase())),
      need: recipe.need.filter((item) => !available.has(item.toLowerCase())),
    }))
    .sort((left, right) => right.have.length - left.have.length);
}
