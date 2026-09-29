// lib/mergeProgress.ts
import problemsRaw from "../app/data/problems.json";
import type { MergedProblem, Problem, ProgressMap, UserProgress } from "./types";

export const USER_FIELDS: (keyof UserProgress)[] = [
  "Status",
  "Confidence",
  "Attempts",
  "Time Taken (min)",
  "Hints Used",
  "Solved Without Help",
  "Bookmarked",
  "Revision Count",
  "Last Attempted",
  "Next Review Date",
  "Short Notes",
  "Key Insight",
  "Mistakes Made",
  "Code Snippet",
  "Language",
  "Custom Tags",
  "Brute Force Time",
  "Brute Force Space",
  "Optimal Time",
  "Optimal Space",
];

export const USER_DEFAULTS: UserProgress = {
  Status: "Not Started",
  Confidence: 0,
  Attempts: 0,
  "Time Taken (min)": "",
  "Hints Used": 0,
  "Solved Without Help": false,
  Bookmarked: false,
  "Revision Count": 0,
  "Last Attempted": "",
  "Next Review Date": "",
  "Short Notes": "",
  "Key Insight": "",
  "Mistakes Made": "",
  "Code Snippet": "",
  Language: "javascript",
  "Custom Tags": [],
  "Brute Force Time": "",
  "Brute Force Space": "",
  "Optimal Time": "",
  "Optimal Space": "",
};

// Cast the imported JSON to our typed shape
export const problems = problemsRaw as unknown as Problem[];

export function mergeProblem(
  problem: Problem,
  userProgress: ProgressMap = {}
): MergedProblem {
  const id = problem["Question ID"];
  const user = userProgress[id] || {};
  return { ...problem, ...USER_DEFAULTS, ...user } as MergedProblem;
}

export function mergeAll(
  list: Problem[],
  userProgress: ProgressMap = {}
): MergedProblem[] {
  return list.map((p) => mergeProblem(p, userProgress));
}

export const problemBySlug: Record<string, Problem> = Object.fromEntries(
  problems.map((p) => [p.Slug, p])
);
