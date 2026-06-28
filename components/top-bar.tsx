import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopBarProps = {
  title: string;
  onBack: () => void;
};

export function TopBar({ title, onBack }: TopBarProps) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <Button variant="ghost" size="icon-sm" onClick={onBack}>
        <ArrowLeftIcon />
        <span className="sr-only">Back</span>
      </Button>
      <p className="font-display text-2xl leading-none text-ink">{title}</p>
    </div>
  );
}
