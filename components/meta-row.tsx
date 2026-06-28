import { ChefHatIcon, TimerIcon, UsersIcon } from "lucide-react";

import type { Recipe } from "@/lib/schema-types";
import { cn } from "@/lib/utils";

type MetaRowProps = {
  recipe: Recipe;
  compact?: boolean;
};

export function MetaRow({ recipe, compact = false }: MetaRowProps) {
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
