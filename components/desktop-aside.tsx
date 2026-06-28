import Image from "next/image";
import { Clock3Icon } from "lucide-react";

import type { Recipe } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { demoImage } from "./mock-data";
import type { ConfidenceSummary, Screen } from "./types";

type DesktopAsideProps = {
  screen: Screen;
  confidenceSummary: ConfidenceSummary;
  selectedRecipe: Recipe;
};

export function DesktopAside({
  screen,
  confidenceSummary,
  selectedRecipe,
}: DesktopAsideProps) {
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

type MetricCardProps = {
  label: string;
  value: number;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-paper p-4">
      <p className="font-machine text-[0.68rem] tracking-[0.14em] text-text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl leading-none text-ink">{value}</p>
    </div>
  );
}
