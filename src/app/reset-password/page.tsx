"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Key, Eye, EyeOff, AlertCircle, Loader, Check } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { success, error } = await resetPassword(password);
      if (error) throw new Error(error);

      if (success) {
        setSuccessMsg("Your password has been successfully reset. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update your password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-orange-500 shadow-sm mx-auto">
              <Key className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-4 uppercase">New Password</h2>
            <p className="text-xs text-zinc-550 max-w-xs">
              Provide a secure new password for your account.
            </p>
          </div>

          {errorMsg && (
            <div className="w-full flex items-start gap-2.5 p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 text-xs text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="w-full flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-emerald-450 text-xs text-left">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/50"
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

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading && <Loader className="h-3 w-3 animate-spin text-zinc-950" />}
              {loading ? "Updating password..." : "Reset My Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
