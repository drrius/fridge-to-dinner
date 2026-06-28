import { ShieldCheckIcon } from "lucide-react";

type PrivacyNoteProps = {
  onClick: () => void;
};

export function PrivacyNote({ onClick }: PrivacyNoteProps) {
  return (
    <button
      type="button"
      className="mx-auto flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-text-muted transition hover:text-ink"
      onClick={onClick}
    >
      <ShieldCheckIcon className="size-4 text-leaf" />
      Photos are processed once, never saved.
    </button>
  );
}
