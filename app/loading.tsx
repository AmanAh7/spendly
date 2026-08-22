import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background px-4"
    >
      <PrismFluxLoader size={36} speed={5} textSize={16} />
    </div>
  );
}
