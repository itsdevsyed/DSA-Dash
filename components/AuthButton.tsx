// components/AuthButton.tsx
"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User | null;
  signOut: () => Promise<void>;
}

export default function AuthButton({ user, signOut }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = useCallback(async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
      setLoading(false);
    }
  }, [loading, signOut]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
      >
        Sign in
      </Link>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="flex items-center gap-2">
      {/* Avatar (hidden on small screens, shown md+) */}
      <div className="hidden md:flex items-center gap-2">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            aria-hidden="true"
            className="h-6 w-6 rounded-full border border-[var(--border-subtle)] object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-6 w-6 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-medium text-[var(--text-secondary)]"
          >
            {initial}
          </div>
        )}

        <span
          className="text-xs text-[var(--text-tertiary)] max-w-[180px] truncate"
          title={user.email ?? ""}
        >
          {user.email}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        aria-busy={loading}
        className="px-3 py-1.5 rounded-md text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Spinner className="h-3.5 w-3.5" />
            Signing out…
          </span>
        ) : (
          "Sign out"
        )}
      </button>

      {error && (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
