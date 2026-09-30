// app/login/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Status = "idle" | "google-loading" | "email-loading" | "email-sent";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const isLoading = status === "google-loading" || status === "email-loading";

  const getRedirectUrl = useCallback(() => {
    // Prefer env var so it works behind proxies/CDNs; fallback to window origin
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    return `${base}/auth/callback`;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError("");
    setStatus("google-loading");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: { prompt: "select_account" }, // always show account chooser
        },
      });
      if (error) throw error;
      // Browser will redirect — no need to reset status
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setStatus("idle");
    }
  }, [getRedirectUrl]);

  const signInWithEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setStatus("email-loading");
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: getRedirectUrl(),
            shouldCreateUser: true,
          },
        });
        if (error) throw error;
        setStatus("email-sent");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send link");
        setStatus("idle");
      }
    },
    [email, getRedirectUrl]
  );

  const resetEmailFlow = useCallback(() => {
    setStatus("idle");
    setEmail("");
    setError("");
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-sm text-slate-400">
            Welcome back. Choose how you&apos;d like to continue.
          </p>
        </div>

        {status === "email-sent" ? (
          <div
            role="status"
            className="space-y-3 text-center"
            aria-live="polite"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-green-400 font-medium">
              Check your email for the magic link.
            </p>
            <p className="text-sm text-slate-400">
              We sent it to <span className="text-slate-200">{email}</span>
            </p>
            <button
              type="button"
              onClick={resetEmailFlow}
              className="text-sm text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
              aria-busy={status === "google-loading"}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {status === "google-loading" ? (
                <Spinner className="h-5 w-5 text-slate-700" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              {status === "google-loading"
                ? "Redirecting…"
                : "Continue with Google"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">or</span>
              </div>
            </div>

            <form onSubmit={signInWithEmail} className="space-y-3" noValidate>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                aria-invalid={!!error}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 text-white border border-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 placeholder:text-slate-500 transition"
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                aria-busy={status === "email-loading"}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition"
              >
                {status === "email-loading" && (
                  <Spinner className="h-4 w-4 text-white" />
                )}
                {status === "email-loading"
                  ? "Sending…"
                  : "Send magic link"}
              </button>
            </form>

            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="text-red-400 text-sm text-center"
              >
                {error}
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full text-sm text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
