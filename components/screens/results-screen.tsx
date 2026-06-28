import { PlusIcon, RefreshCcwIcon, WandSparklesIcon } from "lucide-react";

import type { Ingredient, Preferences, Recipe } from "@/lib/schema-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { IngredientChip } from "../ingredient-chip";
import { PreferenceControls } from "../preference-controls";
import { PrivacyNote } from "../privacy-note";
import { RecipeCard } from "../recipe-card";
import { ScreenFrame } from "../screen-frame";

type ResultsScreenProps = {
  ingredients: Ingredient[];
  newIngredient: string;
  preferences: Required<Preferences>;
  recipes: Recipe[];
  isRegenerating: boolean;
  onAddIngredient: (name?: string) => void;
  onNewIngredientChange: (value: string) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onPreferencesChange: (values: string[]) => void;
  onRegenerate: () => void;
  onRemoveIngredient: (id: string) => void;
  onShowPrivacy: () => void;
  onSnapAgain: () => void;
};

export function ResultsScreen({
  ingredients,
  newIngredient,
  preferences,
  recipes,
  isRegenerating,
  onAddIngredient,
  onNewIngredientChange,
  onOpenRecipe,
  onPreferencesChange,
  onRegenerate,
  onRemoveIngredient,
  onShowPrivacy,
  onSnapAgain,
}: ResultsScreenProps) {
  const detectedIngredients = ingredients.filter(
    (ingredient) => ingredient.source !== "suggested"
  );
  const suggestedIngredients = ingredients.filter(
    (ingredient) => ingredient.source === "suggested"
  );

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
            <CardDescription>
              Edit anything the camera guessed wrong.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {detectedIngredients.map((ingredient) => (
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
              <Button
                size="icon"
                variant="outline"
                onClick={() => onAddIngredient()}
              >
                <PlusIcon />
                <span className="sr-only">Add ingredient</span>
              </Button>
            </div>

            {suggestedIngredients.length > 0 ? (
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
            ) : null}
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
        <Button
          className="w-full"
          size="lg"
          disabled={isRegenerating}
          onClick={onRegenerate}
        >
          <WandSparklesIcon data-icon="inline-start" />
          {isRegenerating ? "Regenerating..." : "Regenerate from edits"}
        </Button>
      </div>
    </ScreenFrame>
  );
}
