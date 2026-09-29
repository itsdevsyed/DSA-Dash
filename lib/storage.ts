// lib/storage.ts
"use client";
import { createClient } from "./supabase-browser";
import type { ProgressMap } from "./types";

const CACHE_KEY = "dsa-progress-cache";

export async function loadProgress(): Promise<ProgressMap> {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return {};

  const { data, error } = await createClient()
    .from("user_progress")
    .select("question_id, data");

  if (error) {
    console.error("loadProgress error:", error);
    return {};
  }

  const result: ProgressMap = {};
  for (const row of (data as { question_id: number; data: any }[]) || []) {
    result[row.question_id] = row.data;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  }
  return result;
}

export function loadCachedProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function saveOne(
  id: number,
  dataPatch: Partial<ProgressMap[number]>
): Promise<void> {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return;

  const cache = loadCachedProgress();
  cache[id] = { ...(cache[id] || {}), ...dataPatch };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

  const { error } = await createClient().from("user_progress").upsert(
    {
      user_id: user.id,
      question_id: Number(id),
      data: cache[id],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) console.error("saveOne error:", error);
}

export async function resetOne(id: number): Promise<void> {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return;

  const cache = loadCachedProgress();
  delete cache[id];
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

  const { error } = await createClient()
    .from("user_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("question_id", Number(id));

  if (error) console.error("resetOne error:", error);
}

export function exportProgress(): void {
  const data = loadCachedProgress();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dsa-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
