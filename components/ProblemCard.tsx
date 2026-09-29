// components/ProblemCard.tsx
"use client";
import NoteEditor from "./NoteEditor";
import type { MergedProblem, ProblemStatus, UserProgress } from "@/lib/types";

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  Hard: "text-red-400 bg-red-400/10",
};

const STATUS_COLOR: Record<ProblemStatus, string> = {
  "Not Started": "bg-slate-700",
  "In Progress": "bg-yellow-700",
  Solved: "bg-green-700",
  "Needs Review": "bg-red-700",
  Failed: "bg-red-900",
};

interface Props {
  problem: MergedProblem;
  onUpdate: (
    id: number,
    patch: Partial<UserProgress>,
    options?: { debounce?: number }
  ) => void;
  onReset: (id: number) => Promise<void>;
}

export default function ProblemCard({ problem: p, onUpdate, onReset }: Props) {
  const set = (patch: Partial<UserProgress>) =>
    onUpdate(p["Question ID"], patch);
  const setNow = (patch: Partial<UserProgress>) =>
    onUpdate(p["Question ID"], patch, { debounce: 0 });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">
              #{p["Question ID"]}
            </span>
            <a
              href={p.URL}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:text-blue-400 truncate"
            >
              {p["Question Name"]}
            </a>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                DIFF_COLOR[p.Difficulty] || ""
              }`}
            >
              {p.Difficulty}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded text-white ${
                STATUS_COLOR[p.Status] || "bg-slate-700"
              }`}
            >
              {p.Status}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {(p.Topics || []).join(" • ")} | Acceptance{" "}
            {p["Acceptance Rate"]?.toFixed(1)}%
          </div>
        </div>

        <button
          onClick={() => setNow({ Bookmarked: !p.Bookmarked })}
          className={`text-xl ${
            p.Bookmarked ? "text-yellow-400" : "text-slate-600"
          }`}
          title="Bookmark"
        >
          ★
        </button>
      </div>

      {/* Quick controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          value={p.Status}
          onChange={(e) =>
            setNow({ Status: e.target.value as ProblemStatus })
          }
          className="px-2 py-1 rounded bg-slate-800 text-white text-sm border border-slate-700"
        >
          {(
            [
              "Not Started",
              "In Progress",
              "Solved",
              "Needs Review",
              "Failed",
            ] as ProblemStatus[]
          ).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={p.Confidence}
          onChange={(e) => setNow({ Confidence: Number(e.target.value) })}
          className="px-2 py-1 rounded bg-slate-800 text-white text-sm border border-slate-700"
        >
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Confidence: {n}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          value={p.Attempts}
          onChange={(e) => set({ Attempts: Number(e.target.value) })}
          placeholder="Attempts"
          className="px-2 py-1 rounded bg-slate-800 text-white text-sm border border-slate-700"
        />

        <input
        type="number"
        min={0}
        value={p["Time Taken (min)"]}
        onChange={(e) => {
            const raw = e.target.value;
            set({ "Time Taken (min)": raw === "" ? "" : Number(raw) });
        }}
        placeholder="Time (min)"
        className="px-2 py-1 rounded bg-slate-800 text-white text-sm border border-slate-700"
        />
      </div>

      {/* Notes */}
      <div className="grid md:grid-cols-2 gap-2">
        <NoteEditor
          label="Short Notes"
          value={p["Short Notes"]}
          onSave={(v) => set({ "Short Notes": v })}
          placeholder="Quick recall..."
          rows={2}
        />
        <NoteEditor
          label="Key Insight"
          value={p["Key Insight"]}
          onSave={(v) => set({ "Key Insight": v })}
          placeholder="The 'aha' moment..."
          rows={2}
        />
        <NoteEditor
          label="Mistakes Made"
          value={p["Mistakes Made"]}
          onSave={(v) => set({ "Mistakes Made": v })}
          placeholder="Edge cases I missed..."
          rows={2}
        />
        <NoteEditor
          label="Code Snippet"
          value={p["Code Snippet"]}
          onSave={(v) => set({ "Code Snippet": v })}
          placeholder="Paste your solution..."
          rows={2}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onReset(p["Question ID"])}
          className="text-xs text-slate-500 hover:text-red-400"
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
