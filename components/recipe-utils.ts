import type { MutableRefObject } from "react";

import type { Preferences } from "@/lib/schema-types";

import type { PreferenceKey } from "./types";

export function preferenceValues(preferences: Required<Preferences>) {
  return (Object.keys(preferences) as PreferenceKey[]).filter(
    (key) => preferences[key]
  );
}

export function clearPhotoObjectUrl(ref: MutableRefObject<string | null>) {
  if (!ref.current) {
    return;
  }

  URL.revokeObjectURL(ref.current);
  ref.current = null;
}
