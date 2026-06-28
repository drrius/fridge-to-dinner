import {
  RotateCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { PhotoSurface } from "../photo-surface";
import { ScreenFrame } from "../screen-frame";
import { TopBar } from "../top-bar";

type ReviewScreenProps = {
  photoUrl: string;
  onBack: () => void;
  onRetake: () => void;
  onUsePhoto: () => void;
};

export function ReviewScreen({
  photoUrl,
  onBack,
  onRetake,
  onUsePhoto,
}: ReviewScreenProps) {
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
