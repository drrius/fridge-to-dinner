import type { Preferences } from "@/lib/schemas";
import { Field, FieldTitle } from "@/components/ui/field";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import { preferenceValues } from "./recipe-utils";

type PreferenceControlsProps = {
  preferences: Required<Preferences>;
  onPreferencesChange: (values: string[]) => void;
};

export function PreferenceControls({
  preferences,
  onPreferencesChange,
}: PreferenceControlsProps) {
  const values = preferenceValues(preferences);

  return (
    <Field orientation="vertical">
      <FieldTitle>Preferences</FieldTitle>
      <ToggleGroup
        type="multiple"
        value={values}
        variant="outline"
        size="sm"
        className="flex w-full flex-wrap gap-2"
        onValueChange={(nextValues) => onPreferencesChange(nextValues)}
      >
        <ToggleGroupItem value="under30">Under 30 min</ToggleGroupItem>
        <ToggleGroupItem value="vegetarian">Vegetarian</ToggleGroupItem>
        <ToggleGroupItem value="useExpiringSoon">
          Use expiring soon
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}
