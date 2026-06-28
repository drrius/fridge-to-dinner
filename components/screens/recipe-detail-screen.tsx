import { Share2Icon, UtensilsIcon } from "lucide-react";

import type { Recipe } from "@/lib/schema-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { HaveNeedPanel } from "../have-need-panel";
import { MetaRow } from "../meta-row";
import { ScreenFrame } from "../screen-frame";
import { TopBar } from "../top-bar";

type RecipeDetailScreenProps = {
  recipe: Recipe;
  onBack: () => void;
  onShare: () => void;
  onStartCooking: () => void;
};

export function RecipeDetailScreen({
  recipe,
  onBack,
  onShare,
  onStartCooking,
}: RecipeDetailScreenProps) {
  return (
    <ScreenFrame compact>
      <TopBar title="Best match" onBack={onBack} />
      <div className="flex flex-col gap-5 py-5">
        <div className="flex flex-col gap-3">
          <Badge>Best match</Badge>
          <h1 className="font-display text-5xl leading-[0.95] text-ink">
            {recipe.title}
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            {recipe.whyThisWorks}
          </p>
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
