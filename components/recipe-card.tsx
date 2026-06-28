import {
  ChevronRightIcon,
  LeafIcon,
  ShoppingBasketIcon,
} from "lucide-react";

import type { Recipe } from "@/lib/schemas";
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

import { MetaRow } from "./meta-row";

type RecipeCardProps = {
  recipe: Recipe;
  isBestMatch: boolean;
  onOpen: () => void;
};

export function RecipeCard({
  recipe,
  isBestMatch,
  onOpen,
}: RecipeCardProps) {
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

type SummaryPillProps = {
  label: string;
  value: string;
  variant: "have" | "need";
};

function SummaryPill({ label, value, variant }: SummaryPillProps) {
  const Icon = variant === "have" ? LeafIcon : ShoppingBasketIcon;

  return (
    <div
      className={cn(
        "flex min-h-16 items-center gap-2 rounded-xl px-3",
        variant === "have"
          ? "bg-have-tint text-leaf"
          : "bg-need-tint text-tomato-deep"
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
