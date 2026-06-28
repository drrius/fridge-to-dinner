import { XIcon } from "lucide-react";

import type { Ingredient } from "@/lib/schema-types";
import { cn } from "@/lib/utils";

type IngredientChipProps = {
  ingredient: Ingredient;
  onRemove: () => void;
};

export function IngredientChip({ ingredient, onRemove }: IngredientChipProps) {
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
