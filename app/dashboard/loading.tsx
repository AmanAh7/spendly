import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";

export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="relative min-h-screen px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Background image layer */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/images/dashboard-bg.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />

      {/* Dark translucent overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black/42 dark:bg-black/58"
        aria-hidden="true"
      />

      {/* Loader content above layers */}
      <div className="relative z-10 flex min-h-[calc(100vh-3rem)] items-center justify-center">
        <PrismFluxLoader size={40} speed={5} textSize={16} />
      </div>
    </main>
  );
}
