import {
  CameraIcon,
  ImageIcon,
  LockKeyholeIcon,
  PencilIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ScreenFrame } from "../screen-frame";
import { TopBar } from "../top-bar";

type PrivacyScreenProps = {
  onBack: () => void;
  onStart: () => void;
};

const promises = [
  {
    icon: LockKeyholeIcon,
    title: "No account",
    copy: "The scan flow works without sign-up, profiles, or recipe history.",
  },
  {
    icon: ImageIcon,
    title: "No saved photo roll",
    copy: "Images are processed for the result and are not stored in v1.",
  },
  {
    icon: PencilIcon,
    title: "Editable guesses",
    copy: "Ingredient chips stay editable because fridge photos are never perfect.",
  },
];

export function PrivacyScreen({ onBack, onStart }: PrivacyScreenProps) {
  return (
    <ScreenFrame>
      <TopBar title="Privacy" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-center gap-7 py-8">
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs tracking-[0.14em] text-tomato uppercase">
            Plain promise
          </p>
          <h1 className="font-display text-5xl leading-[0.95] text-ink">
            Photos are for dinner, not a dossier.
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            Fridge to Dinner is designed for a quick answer, not another account
            to manage.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {promises.map(({ icon: Icon, title, copy }) => (
            <Card key={title} size="sm">
              <CardContent className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-pill bg-have-tint text-leaf">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="text-sm leading-5 text-text-muted">{copy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Button size="lg" onClick={onStart}>
        <CameraIcon data-icon="inline-start" />
        Snap your fridge
      </Button>
    </ScreenFrame>
  );
}
