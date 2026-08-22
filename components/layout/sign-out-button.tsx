import { LogOut } from "lucide-react";

import { signOutUser } from "@/actions/auth-actions";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form action={signOutUser} className={className}>
      <button
        type="submit"
        className="group flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut
          className="h-4 w-4 shrink-0 text-white/60 transition-colors group-hover:text-white/80"
          aria-hidden="true"
        />
        <span>Sign out</span>
      </button>
    </form>
  );
}
