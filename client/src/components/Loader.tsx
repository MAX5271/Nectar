import { UtensilsCrossed } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 bg-transparent">
      <UtensilsCrossed className="h-6 w-6 animate-pulse text-beet" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-soft">Loading…</p>
    </div>
  );
};

export default Loader;
