// app/page.tsx
"use client";

import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import { useUser } from "@/hooks/useUser";
import { useProblems } from "@/hooks/useProblems";
import StatsBar from "@/components/StatsBar";
import Filters from "@/components/Filters";
import ProblemList from "@/components/ProblemList";
import AuthButton from "@/components/AuthButton";
import ThemeToggle from "@/components/ThemeToggle";
import { exportProgress } from "@/lib/storage";
import type { FiltersState } from "@/lib/types";

const INITIAL_FILTERS: FiltersState = {
  search: "",
  difficulty: "All",
  status: "All",
  topic: "All",
  bookmarkedOnly: false,
};

export default function Home() {
  const { user, loading, signOut } = useUser();
  const { problems, update, reset, hydrated } = useProblems(user?.id);

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [exportError, setExportError] = useState("");

  const deferredSearch = useDeferredValue(filters.search);

  const topics = useMemo(() => {
    const s = new Set<string>();
    for (const p of problems) {
      for (const t of p.Topics ?? []) s.add(t);
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [problems]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const { difficulty, status, topic, bookmarkedOnly } = filters;

    return problems.filter((p) => {
      if (difficulty !== "All" && p.Difficulty !== difficulty) return false;
      if (status !== "All" && p.Status !== status) return false;
      if (topic !== "All" && !(p.Topics ?? []).includes(topic)) return false;
      if (bookmarkedOnly && !p.Bookmarked) return false;

      if (q) {
        const haystack =
          `${p["Question Name"]} ${p["Short Notes"]} ${p["Key Insight"]} ${p.Pattern}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
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

  const handleExport = useCallback(() => {
    setExportError("");
    try {
      exportProgress();
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    }
  }, []);

  if (loading) return <LoadingScreen />;

  const isSearching = deferredSearch !== filters.search;

  return (
    <main className="min-h-screen relative">
      {/* Ambient gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.08] blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-500 opacity-[0.06] blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                DSA Tracker
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                {problems.length} problem{problems.length === 1 ? "" : "s"} in
                your bank
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {user && (
              <button
                type="button"
                onClick={handleExport}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
              >
                <DownloadIcon className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                Export
              </button>
            )}
            <AuthButton user={user} signOut={signOut} />
            <ThemeToggle />
          </div>
        </header>

        {exportError && (
          <p
            role="alert"
            className="text-sm text-red-400 px-1 flex items-center gap-2"
          >
            <span aria-hidden="true">⚠</span>
            {exportError}
          </p>
        )}

        {!user ? (
          <HeroEmptyState />
        ) : !hydrated ? (
          <HydratingState />
        ) : (
          <>
            <StatsBar problems={problems} />

            {/* Sticky filters bar */}
            <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-[var(--bg-app)]/85 backdrop-blur-md border-y border-[var(--border-subtle)]">
              <Filters
                filters={filters}
                setFilters={setFilters}
                topics={topics}
              />
            </div>

            {/* Result count */}
            <div
              className="flex items-center justify-between text-xs text-[var(--text-tertiary)] px-1"
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-2">
                <span className="font-medium text-[var(--text-secondary)]">
                  {filtered.length}
                </span>
                <span>of {problems.length} shown</span>
                {isSearching && (
                  <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                    Searching…
                  </span>
                )}
              </span>
            </div>

            {filtered.length === 0 ? (
              <NoResults onClear={() => setFilters(INITIAL_FILTERS)} />
            ) : (
              <ProblemList
                problems={filtered}
                onUpdate={update}
                onReset={reset}
              />
            )}
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}

/* ---------- Sub-components ---------- */

function Logo() {
  return (
    <div
      aria-hidden="true"
      className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[var(--accent)]/20"
    >
      DSA
    </div>
  );
}

function HeroEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 md:p-14 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-blue-500/5"
      />
      <div className="relative space-y-4 max-w-md mx-auto">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
          <svg
            className="h-7 w-7 text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Track your DSA grind</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Sign in to sync your progress across devices, bookmark problems, and
          never lose your streak.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]"
        >
          Get started
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

function HydratingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--text-tertiary)]">
      <div className="h-6 w-6 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)] animate-spin" />
      <span className="text-sm">Loading your progress…</span>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-subtle)] p-10 text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
        <svg
          className="h-5 w-5 text-[var(--text-tertiary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No problems match your filters</p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Try adjusting your search or clearing filters.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-[var(--accent)] hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
      >
        Clear all filters
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="pt-8 pb-4 text-center text-xs text-[var(--text-tertiary)] border-t border-[var(--border-subtle)]">
      Built for the grind · Keep showing up
    </footer>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-[var(--text-tertiary)]">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)] animate-spin" />
      <span className="text-sm">Loading…</span>
    </div>
  );
}

function DownloadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}
