// components/ProblemList.tsx
"use client";
import { useCallback, useState } from "react";
import ProblemRow from "./ProblemRow";
import type { MergedProblem, UserProgress } from "@/lib/types";

interface Props {
  problems: MergedProblem[];
  onUpdate: (
    id: number,
    patch: Partial<UserProgress>,
    options?: { debounce?: number }
  ) => void;
  onReset: (id: number) => Promise<void>;
}

export default function ProblemList({ problems, onUpdate, onReset }: Props) {
  // Which problems are expanded — using a Set for O(1) lookup
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (problems.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        No problems match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {problems.map((p) => (
        <ProblemRow
          key={p["Question ID"]}
          problem={p}
          isExpanded={expanded.has(p["Question ID"])}
          onToggle={toggle}
          onUpdate={onUpdate}
          onReset={onReset}
        />
      ))}
    </div>
  );
}
