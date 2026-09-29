// components/ProblemRow.tsx
"use client";
import { memo, useEffect, useRef, useState } from "react";
import NoteEditor from "./NoteEditor";
import { formatComplexity } from "@/lib/complexity";
import type { MergedProblem, ProblemStatus, UserProgress } from "@/lib/types";

/* ── Difficulty pill styles ── */
const DIFF_STYLES: Record<string, string> = {
  Easy: "bg-[var(--green-bg)] text-[var(--green)]",
  Medium: "bg-[var(--yellow-bg)] text-[var(--yellow)]",
  Hard: "bg-[var(--red-bg)] text-[var(--red)]",
};

/* ── Status options with colors ── */
const STATUS_OPTIONS: { value: ProblemStatus; label: string; color: string }[] = [
  { value: "Not Started",  label: "Not started",  color: "var(--text-tertiary)" },
  { value: "In Progress",  label: "In progress",  color: "var(--yellow)" },
  { value: "Solved",       label: "Solved",       color: "var(--green)" },
  { value: "Needs Review", label: "Needs review", color: "var(--red)" },
  { value: "Failed",       label: "Failed",       color: "var(--red)" },
];

const STATUS_COLOR: Record<ProblemStatus, string> = {
  "Not Started": "var(--text-tertiary)",
  "In Progress": "var(--yellow)",
  Solved: "var(--green)",
  "Needs Review": "var(--red)",
  Failed: "var(--red)",
};

interface Props {
  problem: MergedProblem;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onUpdate: (
    id: number,
    patch: Partial<UserProgress>,
    options?: { debounce?: number }
  ) => void;
  onReset: (id: number) => Promise<void>;
}

function ProblemRow({
  problem: p,
  isExpanded,
  onToggle,
  onUpdate,
  onReset,
}: Props) {
  const set = (patch: Partial<UserProgress>) =>
    onUpdate(p["Question ID"], patch);
  const setNow = (patch: Partial<UserProgress>) =>
    onUpdate(p["Question ID"], patch, { debounce: 0 });

  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNow({ Bookmarked: !p.Bookmarked });
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className={`group rounded-lg border transition-all duration-150 ${
        isExpanded
          ? "border-[var(--border-strong)] bg-[var(--bg-card)]"
          : "border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
      }`}
    >
      {/* ── Header row (always visible) ── */}
      <div
        onClick={() => onToggle(p["Question ID"])}
        className="flex items-center gap-3 px-3 py-2 cursor-pointer select-none"
      >
        {/* Status circle (click for menu) */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusMenu((v) => !v);
            }}
            title="Change status"
            className="w-4 h-4 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center"
            style={{
              borderColor: STATUS_COLOR[p.Status],
              background:
                p.Status === "Solved" ? STATUS_COLOR[p.Status] : "transparent",
            }}
          >
            {p.Status === "Solved" && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {showStatusMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(false);
                }}
              />
              <div className="absolute top-full left-0 mt-1 z-20 min-w-[160px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-xl py-1 animate-fade-in">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNow({ Status: opt.value });
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: opt.color }}
                    />
                    {opt.label}
                    {p.Status === opt.value && (
                      <span className="ml-auto text-[var(--text-tertiary)]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ID */}
        <span className="shrink-0 text-xs tabular-nums text-[var(--text-tertiary)] w-10">
          {p["Question ID"]}
        </span>

        {/* Name */}
        <a
          href={p.URL}
          target="_blank"
          rel="noreferrer"
          onClick={stop}
          className="flex-1 min-w-0 text-[15px] font-medium text-[var(--text-primary)] hover:underline truncate"
        >
          {p["Question Name"]}
        </a>

        {/* Difficulty */}
        <span
          className={`shrink-0 hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full ${
            DIFF_STYLES[p.Difficulty] || ""
          }`}
        >
          {p.Difficulty}
        </span>

        {/* Topics preview */}
        <div className="hidden lg:flex shrink-0 gap-1 max-w-[240px]">
          {(p.Topics || []).slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] whitespace-nowrap"
            >
              {t}
            </span>
          ))}
          {(p.Topics || []).length > 2 && (
            <span className="text-[11px] text-[var(--text-tertiary)] self-center">
              +{p.Topics.length - 2}
            </span>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={toggleBookmark}
          title={p.Bookmarked ? "Remove bookmark" : "Bookmark"}
          className={`shrink-0 w-6 h-6 flex items-center justify-center rounded transition-all ${
            p.Bookmarked
              ? "text-[var(--yellow)]"
              : "text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-primary)]"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={p.Bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* ── Expanded content ── */}
      {isExpanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3 space-y-4 animate-slide-down">
          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Meta label="Platform" value={p.Platform || "—"} />
            <Meta
              label="Acceptance"
              value={
                typeof p["Acceptance Rate"] === "number"
                  ? `${p["Acceptance Rate"].toFixed(1)}%`
                  : "—"
              }
            />
            <Meta
              label="Optimal time"
              value={formatComplexity(p["Optimal Time"])}
              mono
            />
            <Meta
              label="Optimal space"
              value={formatComplexity(p["Optimal Space"])}
              mono
            />
          </div>

          {/* Topics */}
          {p.Topics?.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                Topics
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.Topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {p.Companies?.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                Companies
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.Companies.slice(0, 8).map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] capitalize"
                  >
                    {c}
                  </span>
                ))}
                {p.Companies.length > 8 && (
                  <span className="text-xs text-[var(--text-tertiary)] self-center">
                    +{p.Companies.length - 8}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Complexity — 4 inputs */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Complexity
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <ComplexityInput
                label="Brute — Time"
                value={p["Brute Force Time"]}
                onSave={(v) => set({ "Brute Force Time": v })}
                placeholder="n^2"
              />
              <ComplexityInput
                label="Brute — Space"
                value={p["Brute Force Space"]}
                onSave={(v) => set({ "Brute Force Space": v })}
                placeholder="1"
              />
              <ComplexityInput
                label="Optimal — Time"
                value={p["Optimal Time"]}
                onSave={(v) => set({ "Optimal Time": v })}
                placeholder="n"
              />
              <ComplexityInput
                label="Optimal — Space"
                value={p["Optimal Space"]}
                onSave={(v) => set({ "Optimal Space": v })}
                placeholder="1"
              />
            </div>
          </div>

          {/* Quick controls row */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Progress
            </div>
            <div className="flex flex-wrap gap-2">
              <InlineNumber
                label="Confidence"
                value={p.Confidence}
                onChange={(v) => setNow({ Confidence: v })}
                min={0}
                max={5}
              />
              <InlineNumber
                label="Attempts"
                value={p.Attempts}
                onChange={(v) => set({ Attempts: v })}
                min={0}
              />
              <InlineNumber
                label="Time (min)"
                value={
                  p["Time Taken (min)"] === ""
                    ? 0
                    : Number(p["Time Taken (min)"])
                }
                onChange={(v) => set({ "Time Taken (min)": v })}
                min={0}
              />
              <InlineNumber
                label="Hints"
                value={p["Hints Used"]}
                onChange={(v) => set({ "Hints Used": v })}
                min={0}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Notes
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <NoteEditor
                label="Short notes"
                value={p["Short Notes"]}
                onSave={(v) => set({ "Short Notes": v })}
                placeholder="Quick recall..."
                rows={2}
              />
              <NoteEditor
                label="Key insight"
                value={p["Key Insight"]}
                onSave={(v) => set({ "Key Insight": v })}
                placeholder="The 'aha' moment..."
                rows={2}
              />
              <NoteEditor
                label="Mistakes made"
                value={p["Mistakes Made"]}
                onSave={(v) => set({ "Mistakes Made": v })}
                placeholder="Edge cases I missed..."
                rows={2}
              />
              <NoteEditor
                label="Code snippet"
                value={p["Code Snippet"]}
                onSave={(v) => set({ "Code Snippet": v })}
                placeholder="Paste your solution..."
                rows={2}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
            <a
              href={p.URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Open on {p.Platform} ↗
            </a>
            <button
              onClick={() => onReset(p["Question ID"])}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red)] transition-colors"
            >
              Reset progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small helpers ── */

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      <div
        className={`text-sm text-[var(--text-primary)] ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InlineNumber({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-input)] px-2.5 py-1.5 hover:border-[var(--border-strong)] transition-colors">
      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-12 bg-transparent text-sm text-[var(--text-primary)] text-right tabular-nums"
      />
    </div>
  );
}

function ComplexityInput({
  label,
  value,
  onSave,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value || "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(v), 500);
  };

  return (
    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-input)] px-2.5 py-1.5 hover:border-[var(--border-strong)] transition-colors">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-0.5">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xs text-[var(--text-tertiary)] font-mono">
          O(
        </span>
        <input
          type="text"
          value={local}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-[var(--text-primary)] font-mono"
        />
        <span className="text-xs text-[var(--text-tertiary)] font-mono">
          )
        </span>
      </div>
    </div>
  );
}

export default memo(ProblemRow);
