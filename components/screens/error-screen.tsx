import {
  AlertTriangleIcon,
  CameraIcon,
  KeyboardIcon,
  RefreshCcwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { ScreenFrame } from "../screen-frame";

type ErrorScreenProps = {
  onManual: () => void;
  onRetake: () => void;
  onRetry: () => void;
};

export function ErrorScreen({
  onManual,
  onRetake,
  onRetry,
}: ErrorScreenProps) {
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
