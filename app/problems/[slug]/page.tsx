// app/problems/[slug]/page.tsx
"use client";
import { use } from "react";
import Link from "next/link";
import { problemBySlug } from "@/lib/mergeProgress";
import { useProblems } from "@/hooks/useProblems";
import { useUser } from "@/hooks/useUser";
import ProblemCard from "@/components/ProblemCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProblemDetail({ params }: Props) {
  const { slug } = use(params);
  const base = problemBySlug[slug];
  const { user } = useUser();
  const { problems, update, reset, hydrated } = useProblems(user?.id);
  const problem = problems.find((p) => p.Slug === slug);

  if (!base) {
    return <div className="p-8 text-white">Problem not found</div>;
  }

  if (!hydrated || !problem) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <Link href="/" className="text-sm text-blue-400">
          ← Back
        </Link>
        <ProblemCard problem={problem} onUpdate={update} onReset={reset} />
      </div>
    </main>
  );
}
