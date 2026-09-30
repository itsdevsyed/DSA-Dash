// components/CodeEditor.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";
import type { Extension } from "@codemirror/state";

const LANGUAGES: { value: string; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

function getLanguageExtension(lang: string): Extension[] {
  switch (lang) {
    case "javascript":
      return [javascript()];
    case "typescript":
      return [javascript({ typescript: true })];
    case "python":
      return [python()];
    case "java":
      return [java()];
    case "cpp":
      return [cpp()];
    default:
      return [javascript()];
  }
}

interface Props {
  value: string;
  onSave: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function CodeEditor({
  value,
  onSave,
  language,
  onLanguageChange,
}: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [local, setLocal] = useState(value || "");
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Latest value ref so blur/flush can use it
  const localRef = useRef(local);
  localRef.current = local;

  useEffect(() => setMounted(true), []);

  // ✅ Only sync from parent when NOT focused (avoid clobbering typing)
  useEffect(() => {
    if (!focused) {
      setLocal(value || "");
    }
  }, [value, focused]);

  const handleChange = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onSaveRef.current(v);
      timer.current = null;
    }, 800);
  };

  // ✅ Flush on blur so nothing is lost
  const handleBlur = () => {
    setFocused(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    // If local differs from prop, save immediately
    if (localRef.current !== value) {
      onSaveRef.current(localRef.current);
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
          Code snippet
        </label>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs px-2 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand"}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              {expanded ? (
                <>
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              ) : (
                <>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`rounded-md border overflow-hidden transition-all ${
          expanded ? "h-[600px]" : "h-[280px]"
        } border-[var(--border-subtle)] hover:border-[var(--border-strong)]`}
      >
        {mounted && (
          <CodeMirror
            value={local}
            height="100%"
            theme={isDark ? oneDark : "light"}
            extensions={getLanguageExtension(language)}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: false,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              searchKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
          />
        )}
      </div>

      <div className="text-[10px] text-[var(--text-tertiary)] flex justify-between px-0.5">
        <span>Auto-saves after 800ms · or on blur</span>
        <span>{local.split("\n").length} lines</span>
      </div>
    </div>
  );
}
