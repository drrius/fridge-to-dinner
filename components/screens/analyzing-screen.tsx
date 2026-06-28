import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { ScreenFrame } from "../screen-frame";

type AnalyzingScreenProps = {
  photoUrl?: string;
  progress: number;
  status: string;
  onCancel: () => void;
};

export function AnalyzingScreen({
  photoUrl,
  progress,
  status,
  onCancel,
}: AnalyzingScreenProps) {
  return (
    <ScreenFrame>
      <div className="flex flex-1 flex-col justify-center gap-7">
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs font-medium tracking-[0.14em] text-tomato uppercase">
            {photoUrl ? "Scanning" : "Generating"}
          </p>
          <h1 className="font-display text-4xl leading-none text-ink">
            {photoUrl ? "Reading your shelves." : "Building dinner ideas."}
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            {photoUrl
              ? "The app is looking for ingredients and ignoring the chaos around them."
              : "The app is turning your ingredient list into practical weeknight options."}
          </p>
        </div>

        {photoUrl ? (
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
        ) : null}

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
            {photoUrl ? "spotting ingredients / 12 found" : "matching ingredients / 3 ideas"}
            <span className="inline-flex w-6 justify-start">
              <span className="animate-blink">...</span>
            </span>
          </p>
        </div>
      </div>
      <Button variant="ghost" size="lg" onClick={onCancel}>
        {photoUrl ? "Cancel scan" : "Cancel"}
      </Button>
    </ScreenFrame>
  );
}
