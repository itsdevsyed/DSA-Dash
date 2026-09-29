// app/page.tsx
"use client";
import { useDeferredValue, useMemo, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useProblems } from "@/hooks/useProblems";
import StatsBar from "@/components/StatsBar";
import Filters from "@/components/Filters";
import ProblemList from "@/components/ProblemList";
import AuthButton from "@/components/AuthButton";
import ThemeToggle from "@/components/ThemeToggle";
import { exportProgress } from "@/lib/storage";
import type { FiltersState } from "@/lib/types";

export default function Home() {
  const { user, loading, signOut } = useUser();
  const { problems, update, reset, hydrated } = useProblems(user?.id);

  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    difficulty: "All",
    status: "All",
    topic: "All",
    bookmarkedOnly: false,
  });

  const deferredSearch = useDeferredValue(filters.search);

  const topics = useMemo(() => {
    const s = new Set<string>();
    problems.forEach((p) => (p.Topics || []).forEach((t) => s.add(t)));
    return [...s].sort();
  }, [problems]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return problems.filter((p) => {
      if (q) {
        const haystack =
          `${p["Question Name"]} ${p["Short Notes"]} ${p["Key Insight"]} ${p.Pattern}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.difficulty !== "All" && p.Difficulty !== filters.difficulty)
        return false;
      if (filters.status !== "All" && p.Status !== filters.status)
        return false;
      if (filters.topic !== "All" && !(p.Topics || []).includes(filters.topic))
        return false;
      if (filters.bookmarkedOnly && !p.Bookmarked) return false;
      return true;
    });
  }, [
    problems,
    deferredSearch,
    filters.difficulty,
    filters.status,
    filters.topic,
    filters.bookmarkedOnly,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-tertiary)]">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-xl font-semibold">DSA Tracker</h1>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {problems.length} problems
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {user && (
              <button
                onClick={exportProgress}
                className="px-3 py-1.5 rounded-md text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors"
              >
                Export
              </button>
            )}
            <AuthButton user={user} signOut={signOut} />
            <ThemeToggle />
          </div>
        </header>

        {!user ? (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center space-y-3">
            <p className="text-[var(--text-secondary)]">
              Sign in to sync your progress across devices.
            </p>
            <a
              href="/login"
              className="inline-block px-4 py-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
            >
              Sign in
            </a>
          </div>
        ) : !hydrated ? (
          <div className="text-[var(--text-tertiary)] text-center py-8">
            Loading your progress...
          </div>
        ) : (
          <>
            <StatsBar problems={problems} />

            <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-[var(--bg-app)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)]">
              <Filters
                filters={filters}
                setFilters={setFilters}
                topics={topics}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] px-1">
              <span>
                {filtered.length} of {problems.length}
              </span>
              {deferredSearch !== filters.search && (
                <span className="text-[var(--accent)]">Searching...</span>
              )}
            </div>

            <ProblemList
              problems={filtered}
              onUpdate={update}
              onReset={reset}
            />
          </>
        )}
      </div>
    </main>
  );
}
