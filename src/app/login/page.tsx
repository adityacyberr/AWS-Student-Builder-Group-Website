"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Lock, Eye, EyeOff, AlertCircle, Loader, Key, Check, Shield, Mail } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, forgotPassword } = useAuth();
  
  // Auth view: login or forgot password
  const [view, setView] = useState<"login" | "forgot">("login");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lockout State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  // Card 3D Parallax Effect
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  // Detect Reduced Motion
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Floating Particles
  const [particles, setParticles] = useState<Array<{ id: number; top: string; left: string; size: string; delay: string; duration: string }>>([]);

  // Redirect parameter
  const redirectTo = searchParams.get("redirectTo") || "";

  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", listener);

    // Generate floating particles on client-side only to avoid hydration mismatch
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 90 + 5}%`,
      left: `${Math.random() * 90 + 5}%`,
      size: `${Math.random() * 2.5 + 1.2}px`,
      delay: `${Math.random() * -6}s`, // Negative delay makes them start animating immediately
      duration: `${Math.random() * 18 + 14}s`,
    }));
    setParticles(generated);

    return () => media.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Limit rotation to max 2.5 degrees for premium feel
    setRotateX(-y / rect.height * 5);
    setRotateY(x / rect.width * 5);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;

    if (!isSupabaseConfigured) {
      setErrorMsg("Supabase is not configured. Redirecting to sandbox mode...");
      setLoading(true);
      setTimeout(() => {
        router.push(redirectTo || "/admin");
      }, 1000);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await login(email, password, rememberMe);
      if (error) throw new Error(error);

      setFailedAttempts(0);
      setSuccessMsg("Success! Directing to your portal...");
      
      // Delay navigation slightly to let success animation play
      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push("/admin");
        }
      }, 800);
    } catch (err: any) {
      console.error("Login Error:", err);
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        setLockoutTimeLeft(60);
        setErrorMsg("Too many failed attempts. Login locked for 60 seconds.");
      } else {
        setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
      }
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { success, error } = await forgotPassword(email);
      if (error) throw new Error(error);
      if (success) {
        setSuccessMsg("Password reset email sent! Please check your inbox.");
        setEmail("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trigger password reset.");
    } finally {
      setView("login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 sm:p-6 text-zinc-100 relative overflow-hidden selection:bg-orange-500/30 selection:text-orange-300">
      {/* Background Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 153, 0, 0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 153, 0, 0.012) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 80%)"
        }}
      />

      {/* Blurred Orange Radial Glow behind Card (slow pulse) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" 
        style={{
          animation: reducedMotion ? "none" : "pulse-glow 10s ease-in-out infinite"
        }}
      />

      {/* Subtle Floating Particles */}
      {!reducedMotion && particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-orange-400/20 pointer-events-none animate-float-slow"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Main Glassmorphic Login Card Panel */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-[540px] bg-[rgba(8,12,22,0.85)] border border-orange-500/12 rounded-[28px] backdrop-blur-[20px] shadow-[0_0_60px_rgba(255,153,0,0.08)] p-8 sm:p-10 relative z-10 hover:border-orange-500/20"
        style={{
          transform: reducedMotion 
            ? "none" 
            : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.1s ease-out, border-color 0.4s ease, box-shadow 0.4s ease",
          willChange: "transform"
        }}
      >
        <div className="flex flex-col space-y-6">
          {/* Card Header Section */}
          <div className="space-y-4 text-center">
            {/* Glowing Shield/Key Container */}
            <div className="h-14 w-14 rounded-full border border-orange-500/18 bg-orange-500/5 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(255,153,0,0.12)] mx-auto relative select-none">
              <div className="absolute inset-0 rounded-full bg-orange-500/8 blur-sm animate-[pulse_2s_infinite]" />
              {view === "login" ? <Shield className="h-6 w-6 relative z-10" /> : <Key className="h-6 w-6 relative z-10 animate-pulse" />}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-[0.25em] text-orange-500 uppercase block select-none">
                RIMT AWS Student Builder Group
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white select-none">
                {view === "login" ? "Admin Portal" : "Reset Portal Key"}
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed select-none">
                {view === "login"
                  ? "Authorized administrators and team members only."
                  : "Submit your authorized email address below to receive a validation key link."}
              </p>
            </div>

            {/* System Status Indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                System Status: Operational
              </span>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="w-full flex items-start gap-2.5 p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-red-400 text-xs text-left animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="w-full flex items-start gap-2.5 p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 text-xs text-left animate-fade-in">
              <Check className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          {view === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-orange-500 transition-colors duration-300">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    disabled={loading || lockoutTimeLeft > 0}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@sbg-rimt.com"
                    className="w-full h-14 pl-12 pr-4 text-sm rounded-2xl bg-[#060a12] border border-slate-900 hover:border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                  Password
                </label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-orange-500 transition-colors duration-300">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={loading || lockoutTimeLeft > 0}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-12 text-sm rounded-2xl bg-[#060a12] border border-slate-900 hover:border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 px-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-400 font-medium select-none cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#060a12] border-slate-900 text-orange-500 focus:ring-0 focus:ring-offset-0 focus:outline-none h-4 w-4 cursor-pointer transition-colors"
                  />
                  <span className="group-hover:text-slate-300 transition-colors">Remember session details</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setErrorMsg(null); setSuccessMsg(null); setView("forgot"); }}
                  className="text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors tracking-wide"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || lockoutTimeLeft > 0}
                  className="group w-full h-14 rounded-2xl border border-orange-500/20 bg-slate-900/50 hover:bg-slate-900/90 text-orange-400 hover:text-white text-sm font-bold tracking-wide shadow-md shadow-orange-500/5 hover:shadow-orange-500/15 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-orange-400" />
                      <span>Authenticating...</span>
                    </>
                  ) : lockoutTimeLeft > 0 ? (
                    <span>Locked ({lockoutTimeLeft}s)</span>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-orange-400 group-hover:text-white transition-colors" />
                      <span>Verify Administrative Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              {/* Email Address field for Forgot */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-orange-500 transition-colors duration-300">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@sbg-rimt.com"
                    className="w-full h-14 pl-12 pr-4 text-sm rounded-2xl bg-[#060a12] border border-slate-900 hover:border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Forgot Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff9900] to-[#ffb347] hover:from-[#ffa624] hover:to-[#ffbd66] text-slate-950 text-sm font-extrabold shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Sending key link...</span>
                    </>
                  ) : (
                    <span>Send Verification link</span>
                  )}
                </button>
              </div>

              {/* Back to sign in */}
              <button
                type="button"
                onClick={() => { setErrorMsg(null); setSuccessMsg(null); setView("login"); }}
                className="w-full text-center text-xs text-slate-450 hover:text-slate-200 transition-colors select-none font-bold pt-1"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-2 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-900/60"></div>
            </div>
            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.2em]">
              <span className="bg-[#080c16]/95 px-3 text-slate-600">Portal Actions</span>
            </div>
          </div>

          {/* Back to Website action (ghost button) */}
          <Link
            href="/"
            className="w-full h-14 rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 text-slate-400 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 select-none"
          >
            <span>← Return to Public Site</span>
          </Link>

          {/* Security Footer Section */}
          <div className="pt-6 border-t border-slate-900/40 mt-2 flex items-start gap-3.5 text-left select-none">
            <div className="p-1.5 rounded-lg bg-orange-500/5 border border-orange-500/10 text-orange-500/60 mt-0.5 flex-shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">
                Protected Administration Console
              </p>
              <p className="text-[9px] text-slate-500 leading-normal">
                Authorized personnel only. All access attempts, sessions, and data modifications are securely authenticated, audited, and logged.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Support Subtext */}
      <div className="mt-8 flex flex-col items-center gap-3 text-center z-10 max-w-sm px-4">
        <p className="text-[11px] text-slate-500 font-semibold tracking-wide leading-relaxed">
          Official portal of the RIMT AWS Student Builder Group under RIMT University and DRI Lab.
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <img
            src="/brand/rimt-university.jpg"
            alt="RIMT University"
            className="h-6 w-auto object-contain bg-white px-1 py-0.5 rounded filter grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-all duration-300 shadow-sm border border-slate-800/10"
          />
          <img
            src="/brand/dri-lab.png"
            alt="DRI Lab"
            className="h-6 w-auto object-contain bg-[#080c16]/80 border border-slate-900 px-1 py-0.5 rounded filter grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      {/* Embedded Animations styling block */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;    transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes float-slow {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.35; }
          90%  { opacity: 0.35; }
          100% { transform: translateY(-120px) translateX(40px); opacity: 0; }
        }
        .animate-float-slow {
          animation: float-slow linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.35s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
