// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-8">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>

        {sent ? (
          <p className="text-green-400 text-center">
            Check your email for the magic link.
          </p>
        ) : (
          <>
            <button
              onClick={signInWithGoogle}
              className="w-full px-4 py-2 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100"
            >
              Continue with Google
            </button>

            <div className="text-center text-slate-500 text-sm">or</div>

            <form onSubmit={signInWithEmail} className="space-y-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Send magic link
              </button>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </form>
          </>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
