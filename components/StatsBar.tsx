// components/StatsBar.tsx
"use client";
import { memo } from "react";
import type { MergedProblem } from "@/lib/types";

interface Props {
  problems: MergedProblem[];
}

function StatsBar({ problems }: Props) {
  const stats = problems.reduce(
    (acc, p) => {
      acc.total++;
      if (p.Status === "Solved") acc.solved++;
      if (p.Status === "In Progress") acc.inProgress++;
      if (p.Status === "Needs Review") acc.needsReview++;
      if (p.Bookmarked) acc.bookmarked++;
      return acc;
    },
    { total: 0, solved: 0, inProgress: 0, needsReview: 0, bookmarked: 0 }
  );

  const pct = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;

  const cards = [
    { label: "Total", value: stats.total, color: "var(--text-primary)" },
    { label: "Solved", value: stats.solved, color: "var(--green)" },
    { label: "In progress", value: stats.inProgress, color: "var(--yellow)" },
    { label: "Needs review", value: stats.needsReview, color: "var(--red)" },
    { label: "Bookmarked", value: stats.bookmarked, color: "var(--purple)" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5"
          >
            <div
              className="text-xl font-semibold tabular-nums"
              style={{ color: c.color }}
            >
              {c.value}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mt-0.5">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-[var(--bg-hover)] rounded-full h-1 overflow-hidden">
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, var(--green), var(--accent))`,
            }}
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">
          {pct}%
        </span>
      </div>
    </div>
  );
}

export default memo(StatsBar);
