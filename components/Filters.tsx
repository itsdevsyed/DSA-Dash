// components/Filters.tsx
"use client";
import { memo } from "react";
import type { FiltersState, ProblemStatus } from "@/lib/types";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
const STATUSES: ("All" | ProblemStatus)[] = [
  "All",
  "Not Started",
  "In Progress",
  "Solved",
  "Needs Review",
  "Failed",
];

interface Props {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  topics: string[];
}

function Filters({ filters, setFilters, topics }: Props) {
  const update = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) => setFilters((f) => ({ ...f, [key]: value }));

  const clearAll = () =>
    setFilters({
      search: "",
      difficulty: "All",
      status: "All",
      topic: "All",
      bookmarkedOnly: false,
    });

  const hasActiveFilter =
    filters.search ||
    filters.difficulty !== "All" ||
    filters.status !== "All" ||
    filters.topic !== "All" ||
    filters.bookmarkedOnly;

  const selectClass =
    "px-2.5 py-1.5 rounded-md bg-[var(--bg-input)] text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] cursor-pointer";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[240px]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, notes, pattern..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[var(--bg-input)] text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] transition-colors"
        />
      </div>

      <select
        value={filters.difficulty}
        onChange={(e) =>
          update("difficulty", e.target.value as FiltersState["difficulty"])
        }
        className={selectClass}
      >
        {DIFFICULTIES.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) =>
          update("status", e.target.value as FiltersState["status"])
        }
        className={selectClass}
      >
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.topic}
        onChange={(e) => update("topic", e.target.value)}
        className={`${selectClass} max-w-[160px]`}
      >
        <option value="All">All topics</option>
        {topics.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <button
        onClick={() => update("bookmarkedOnly", !filters.bookmarkedOnly)}
        className={`px-3 py-1.5 rounded-md text-sm border transition-colors flex items-center gap-1.5 ${
          filters.bookmarkedOnly
            ? "bg-[var(--yellow-bg)] border-[var(--yellow)] text-[var(--yellow)]"
            : "bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={filters.bookmarkedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        Starred
      </button>

      {hasActiveFilter && (
        <button
          onClick={clearAll}
          className="px-3 py-1.5 rounded-md text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default memo(Filters);
