/**
 * Minimal backend status page for the SwiftUI-first API service.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <main className="w-full max-w-md space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/50">
          Fridge to Dinner
        </p>
        <h1 className="text-3xl font-semibold">API service</h1>
        <p className="text-base leading-7 text-foreground/70">
          This deployment backs the SwiftUI app. Public product UI will live in
          the native client.
        </p>
      </main>
    </div>
  );
}
