import type { Preferences } from "@/lib/schema-types";

export type Screen =
  | "home"
  | "manual"
  | "review"
  | "analyzing"
  | "generating"
  | "results"
  | "detail"
  | "privacy"
  | "error"
  | "share";

export type PreferenceKey = keyof Required<Preferences>;

export type ConfidenceSummary = {
  high: number;
  medium: number;
  low: number;
};
