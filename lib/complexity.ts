// lib/complexity.ts

/**
 * Normalizes a raw complexity string into "O(...)" format.
 * - "" → "—"
 * - "n" → "O(n)"
 * - "n log n" → "O(n log n)"
 * - "O(n)" → "O(n)"       (already wrapped — leave as is)
 * - "1" → "O(1)"
 */
export function formatComplexity(raw: string | undefined | null): string {
    const v = (raw ?? "").trim();
    if (!v) return "—";
    if (v.startsWith("O(") || v.startsWith("o(")) return v;
    return `O(${v})`;
  }
