import type { Preferences } from "@/lib/schemas";

export type Screen =
  | "home"
  | "manual"
  | "review"
  | "analyzing"
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
