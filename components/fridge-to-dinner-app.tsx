"use client";

import { Toaster } from "@/components/ui/sonner";

import { DesktopAside } from "./desktop-aside";
import { RenderScreen } from "./render-screen";
import { useFridgeToDinnerFlow } from "./use-fridge-to-dinner-flow";

export function FridgeToDinnerApp() {
  const flow = useFridgeToDinnerFlow();

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl items-center gap-8 px-0 lg:grid-cols-[minmax(0,1fr)_minmax(380px,420px)] lg:px-6 lg:py-8">
        <DesktopAside
          screen={flow.screen}
          confidenceSummary={flow.confidenceSummary}
          selectedRecipe={flow.selectedRecipe}
        />
        <section className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-paper lg:min-h-[840px] lg:max-w-[420px] lg:overflow-hidden lg:rounded-[42px] lg:border lg:border-border lg:shadow-float">
          <RenderScreen flow={flow} />
        </section>
      </div>
      <Toaster position="bottom-center" />
    </main>
  );
}
