// components/AuthButton.tsx
"use client";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User | null;
  signOut: () => Promise<void>;
}

export default function AuthButton({ user, signOut }: Props) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-tertiary)] hidden md:inline">
        {user.email}
      </span>
      <button
        onClick={signOut}
        className="px-3 py-1.5 rounded-md text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
