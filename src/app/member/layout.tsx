"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  User, LogOut, Settings, Menu, X, ArrowLeftRight, HelpCircle
} from "lucide-react";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Exclude login page from layout checks (though login page has its own routing now, just in case)
  const isLogin = pathname === "/member/login";
  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col md:flex-row antialiased font-sans">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-900 h-screen sticky top-0 flex-shrink-0 select-none">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-900 gap-2.5">
          <div className="h-6.5 w-6.5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white">Member Portal</span>
        </div>

        {/* Profile Pill */}
        {profile && (
          <div className="p-4 mx-3 my-4 rounded-xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-grow">
              <div className="flex items-center gap-1.5 justify-between">
                <p className="text-xs text-zinc-300 font-bold truncate">{profile.name}</p>
                <span className="px-1.5 py-0.2 rounded text-[7px] font-extrabold uppercase bg-zinc-900 border border-zinc-850 text-zinc-400 shrink-0">
                  {profile.portal_role}
                </span>
              </div>
              <p className="text-[10px] text-zinc-550 truncate font-mono">{profile.email}</p>
            </div>
          </div>
        )}

        {/* Member Nav Items */}
        <nav className="flex-grow px-3 space-y-1 pt-2">
          <Link
            href="/member"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              pathname === "/member"
                ? "bg-zinc-900 border border-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
            }`}
          >
            <User className="h-4.5 w-4.5 text-orange-500" />
            <span>My Profile</span>
          </Link>
          
          {/* Quick link to Admin view for Super Admins / Editors */}
          {profile && (profile.portal_role === "Super Admin" || profile.portal_role === "Editor") && (
            <div className="pt-4 border-t border-zinc-900/50 mt-4">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-orange-400 hover:bg-orange-500/5 transition-all border border-transparent hover:border-orange-500/10"
              >
                <ArrowLeftRight className="h-4.5 w-4.5" />
                <span>Go to Admin Portal</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-zinc-900">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN SPACE WRAPPER */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-5 sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 rounded-lg border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Member Portal</span>
          </div>

          <button
            onClick={logout}
            className="text-xs font-bold text-zinc-500 hover:text-red-400 p-2"
          >
            Sign Out
          </button>
        </header>

        {/* Mobile Slide-Over */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-zinc-950/98 backdrop-blur-md z-45 flex flex-col justify-between p-6">
            <div className="space-y-6">
              {profile && (
                <div className="flex items-center gap-3 pb-6 border-b border-zinc-900">
                  <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-405 font-bold text-xs select-none">
                    {profile.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-200 font-bold truncate">{profile.name}</p>
                    <p className="text-[10px] text-zinc-550 truncate">{profile.email}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                <Link
                  href="/member"
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === "/member" ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  <User className="h-5 w-5 text-orange-500" />
                  <span>My Profile</span>
                </Link>
                
                {profile && (profile.portal_role === "Super Admin" || profile.portal_role === "Editor") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-500 hover:text-orange-400 transition-colors"
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    <span>Go to Admin Portal</span>
                  </Link>
                )}
              </nav>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-zinc-900 text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* 3. MAIN WORKSPACE */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
