// lib/types.ts

export interface Problem {
    "Question ID": number;
    "Question Name": string;
    Slug: string;
    Difficulty: "Easy" | "Medium" | "Hard";
    Topics: string[];
    Companies: string[];
    "Company Count": number;
    "Acceptance Rate": number;
    URL: string;
    Platform: string;
    Pattern: string;
    "Sub-Pattern": string;
    "Video Solution URL": string;
    "Editorial URL": string;
    "Similar Questions": number[];
    "Brute Force Time": string;
    "Brute Force Space": string;
    "Optimal Time": string;
    "Optimal Space": string;
  }

  export type ProblemStatus =
    | "Not Started"
    | "In Progress"
    | "Solved"
    | "Needs Review"
    | "Failed";

  export interface UserProgress {
    Status: ProblemStatus;
    Confidence: number;
    Attempts: number;
    "Time Taken (min)": number | "";
    "Hints Used": number;
    "Solved Without Help": boolean;
    Bookmarked: boolean;
    "Revision Count": number;
    "Last Attempted": string;
    "Next Review Date": string;
    "Short Notes": string;
    "Key Insight": string;
    "Mistakes Made": string;
    "Code Snippet": string;
    Language: string;
    "Custom Tags": string[];

    // Complexity fields (user-editable)
    "Brute Force Time": string;
    "Brute Force Space": string;
    "Optimal Time": string;
    "Optimal Space": string;
  }

  export type MergedProblem = Problem & UserProgress;

  export type ProgressMap = Record<number, Partial<UserProgress>>;

  export interface FiltersState {
    search: string;
    difficulty: "All" | "Easy" | "Medium" | "Hard";
    status: "All" | ProblemStatus;
    topic: string;
    bookmarkedOnly: boolean;
  }
