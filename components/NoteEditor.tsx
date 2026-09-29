// components/NoteEditor.tsx
"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
}

export default function NoteEditor({
  value,
  onSave,
  placeholder,
  label,
  rows = 3,
}: Props) {
  const [local, setLocal] = useState(value || "");
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Sync from parent only when NOT focused
  useEffect(() => {
    if (!focused) setLocal(value || "");
  }, [value, focused]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setLocal(v);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onSaveRef.current(v);
    }, 600);
  };

  const handleBlur = () => {
    setFocused(false);
    if (timer.current) clearTimeout(timer.current);
    if (local !== value) onSaveRef.current(local);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
          {label}
        </label>
      )}
      <textarea
        value={local}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 rounded-md bg-[var(--bg-input)] text-[var(--text-primary)] border text-sm resize-y transition-colors ${
          focused
            ? "border-[var(--accent)]"
            : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
        }`}
      />
    </div>
  );
}
