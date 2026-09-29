// hooks/useProblems.ts
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { problems as rawProblems, mergeAll } from "@/lib/mergeProgress";
import {
  loadProgress,
  loadCachedProgress,
  saveOne,
  resetOne,
} from "@/lib/storage";
import type { MergedProblem, ProgressMap, UserProgress } from "@/lib/types";

interface UpdateOptions {
  debounce?: number;
}

interface UseProblemsReturn {
  problems: MergedProblem[];
  update: (
    id: number,
    patch: Partial<UserProgress>,
    options?: UpdateOptions
  ) => void;
  reset: (id: number) => Promise<void>;
  hydrated: boolean;
}

export function useProblems(userId?: string): UseProblemsReturn {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!userId) {
      setProgress({});
      setHydrated(true);
      return;
    }

    setProgress(loadCachedProgress());
    loadProgress().then((fresh) => {
      setProgress(fresh);
      setHydrated(true);
    });
  }, [userId]);

  const merged = useMemo(
    () => mergeAll(rawProblems, progress),
    [progress]
  );

  const update = useCallback(
    (id: number, patch: Partial<UserProgress>, options: UpdateOptions = {}) => {
      const { debounce = 400 } = options;

      setProgress((prev) => {
        const next: ProgressMap = {
          ...prev,
          [id]: { ...(prev[id] || {}), ...patch },
        };

        clearTimeout(timers.current[id]);
        timers.current[id] = setTimeout(() => {
          saveOne(id, next[id]);
        }, debounce);

        return next;
      });
    },
    []
  );

  const reset = useCallback(async (id: number) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await resetOne(id);
  }, []);

  return { problems: merged, update, reset, hydrated };
}
