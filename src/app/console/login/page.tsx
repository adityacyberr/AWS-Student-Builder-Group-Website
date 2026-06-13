"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle, Loader } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ConsoleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rate limiting lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.session) {
        setFailedAttempts(0);
        // Refresh page so middleware cookie check is triggered
        router.refresh();
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login failure:", err);
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        setLockoutTimeLeft(60);
        setErrorMsg("Too many failed attempts. Access locked for 60 seconds.");
      } else {
        setErrorMsg(err?.message || "Invalid credentials. Please check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Brand/Console Title */}
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-amber-500 shadow-sm mx-auto">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-4">Management Console</h2>
            <p className="text-xs text-zinc-500 max-w-xs">
              Provide credentials to access your chapter dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="w-full flex items-start gap-2.5 p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 text-xs text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                disabled={lockoutTimeLeft > 0}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sbg-rimt.com"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  disabled={lockoutTimeLeft > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 p-1"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTimeLeft > 0}
              className="w-full py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center justify-center gap-1.5"
            >
              {loading && <Loader className="h-3 w-3 animate-spin text-zinc-950" />}
              {lockoutTimeLeft > 0
                ? `Locked (${lockoutTimeLeft}s)`
                : loading
                ? "Authenticating..."
                : "Sign In"}
            </button>
          </form>

          {/* Fallback back link */}
          <div className="pt-2">
            {/* Direct to localhost:3000 or production site based on host */}
            <Link
              href={typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host.replace("console.", "")}` : "/"}
              className="text-xs text-zinc-650 hover:text-zinc-450 transition-colors"
            >
              Back to Public Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
