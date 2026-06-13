"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rate limiting / Brute-force state
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

      if (error) {
        throw error;
      }

      if (data?.session) {
        // Successful login: reset failed attempts
        setFailedAttempts(0);
        // Refresh page so middleware cookie check is triggered, redirecting to /admin
        router.refresh();
        router.push("/admin");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Login failure:", error);
      
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        // Lock out for 30 seconds
        setLockoutTimeLeft(30);
        setErrorMsg("Too many failed attempts. Access locked for 30 seconds.");
      } else {
        setErrorMsg(
          error.message || "Invalid credentials. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 relative bg-grid-pattern">
      <div className="absolute top-1/4 right-0 w-[30rem] h-[30rem] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[25rem] h-[25rem] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 rounded-2xl border border-slate-900 bg-slate-950/80 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-t-2xl" />

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Lock Icon */}
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md">
            <Lock className="h-5 w-5" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black tracking-tight text-white">Admin Authentication</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Chapter organizers can log in to edit events, milestones, team rosters, and site content live.
            </p>
          </div>

          {errorMsg && (
            <div className="w-full flex items-center gap-2.5 p-3 rounded-lg border border-red-900/30 bg-red-500/5 text-red-400 text-xs text-left">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                  className="w-full pl-3 pr-10 py-2 text-sm rounded-lg bg-slate-900/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTimeLeft > 0}
              className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {lockoutTimeLeft > 0
                ? `Locked (${lockoutTimeLeft}s)`
                : loading
                ? "Logging In..."
                : "Log In"}
            </button>
          </form>

          <Link href="/" className="text-xs text-slate-500 hover:text-slate-350 hover:underline">
            Back to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
