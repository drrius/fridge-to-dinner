import { cn } from "@/lib/utils";

type ScreenFrameProps = {
  children: React.ReactNode;
  compact?: boolean;
  footer?: React.ReactNode;
};

export function ScreenFrame({
  children,
  compact = false,
  footer,
}: ScreenFrameProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-1 flex-col bg-paper px-5 py-7 lg:min-h-full lg:px-6",
        compact ? "overflow-y-auto" : ""
      )}
    >
      <div className="flex flex-1 flex-col">{children}</div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}
