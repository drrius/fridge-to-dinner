import {
  CopyIcon,
  MoreHorizontalIcon,
  SaveIcon,
  Share2Icon,
} from "lucide-react";
import { toast } from "sonner";

import type { Recipe } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { ScreenFrame } from "../screen-frame";
import { TopBar } from "../top-bar";

type ShareScreenProps = {
  recipe: Recipe;
  onBack: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSnapAgain: () => void;
};

export function ShareScreen({
  recipe,
  onBack,
  onCopy,
  onShare,
  onSnapAgain,
}: ShareScreenProps) {
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
          <Button
            variant="outline"
            size="lg"
            onClick={() => toast.success("Card saved.")}
          >
            <SaveIcon data-icon="inline-start" />
            Save card
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => toast("More share options soon.")}
          >
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
