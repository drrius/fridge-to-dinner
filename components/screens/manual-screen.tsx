import { WandSparklesIcon } from "lucide-react";

import type { Preferences } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { PreferenceControls } from "../preference-controls";
import { ScreenFrame } from "../screen-frame";
import { TopBar } from "../top-bar";

type ManualScreenProps = {
  manualText: string;
  preferences: Required<Preferences>;
  onBack: () => void;
  onManualTextChange: (value: string) => void;
  onPreferencesChange: (values: string[]) => void;
  onSubmit: () => void;
};

export function ManualScreen({
  manualText,
  preferences,
  onBack,
  onManualTextChange,
  onPreferencesChange,
  onSubmit,
}: ManualScreenProps) {
  return (
    <ScreenFrame>
      <TopBar title="Type ingredients" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-7 py-8">
        <div className="flex flex-col gap-3">
          <p className="font-machine text-xs font-medium tracking-[0.14em] text-tomato uppercase">
            No photo needed
          </p>
          <h1 className="font-display text-4xl leading-none text-ink">
            Tell me what&apos;s on the shelf.
          </h1>
          <p className="text-base leading-7 text-text-subtle">
            Separate ingredients with commas or new lines. We will keep it
            practical and dinner-sized.
          </p>
        </div>

        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="manual-ingredients">Ingredients</FieldLabel>
              <Textarea
                id="manual-ingredients"
                value={manualText}
                onChange={(event) => onManualTextChange(event.target.value)}
              />
              <FieldDescription>
                Example: eggs, rice, carrots, spinach, cheddar.
              </FieldDescription>
            </Field>
            <PreferenceControls
              preferences={preferences}
              onPreferencesChange={onPreferencesChange}
            />
          </FieldGroup>
        </FieldSet>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={onSubmit}>
          <WandSparklesIcon data-icon="inline-start" />
          Make dinner ideas
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack}>
          Back to photo scan
        </Button>
      </div>
    </ScreenFrame>
  );
}
