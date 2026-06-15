"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  Users,
  Image as ImageIcon,
  Trophy,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  ChevronRight,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { name: "Dashboard & Settings", href: "/admin", icon: LayoutDashboard },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Team Roster", href: "/admin/team", icon: Users },
  { name: "Gallery Images", href: "/admin/gallery", icon: ImageIcon },
  { name: "Achievements", href: "/admin/achievements", icon: Trophy },
];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Exclude login page from sidebar layout wrapper
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    // Get logged-in user email
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setAdminEmail(data.user.email || "Administrator");
        } else {
          setAdminEmail("Sandbox Admin");
        }
      });
    } else {
      setAdminEmail("Sandbox Admin");
    }
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // Delete session cookie (in case client SDK didn't clean it up)
    document.cookie = "sb-session=; path=/; max-age=0; SameSite=Lax; Secure";
    router.refresh();
    router.push("/admin/login");
    // Fallback: hard redirect in case router.push doesn't navigate away from admin
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col md:flex-row antialiased font-sans">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-900 h-screen sticky top-0 flex-shrink-0 select-none">
        {/* Brand Section */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-900 gap-2.5">
          <div className="h-6.5 w-6.5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Settings className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white">Console Portal</span>
        </div>

        {/* User Info / Pill */}
        {adminEmail && (
          <div className="p-4 mx-3 my-4 rounded-xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Active Account</p>
              <p className="text-xs text-zinc-300 font-medium truncate">{adminEmail}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-grow px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all group ${
                  isActive
                    ? "bg-zinc-905 border border-zinc-800 text-white shadow-sm"
                    : "text-zinc-550 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-amber-500" : "text-zinc-550 group-hover:text-zinc-350"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-3 w-3 text-zinc-550" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-zinc-900">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <header className="md:hidden h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-5 sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Settings className="h-3 w-3" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-white">Console Portal</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-9 w-9 rounded-lg border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-zinc-950/95 backdrop-blur-md z-35 flex flex-col justify-between p-6">
          <div className="space-y-6">
            {adminEmail && (
              <div className="flex items-center gap-3 pb-6 border-b border-zinc-900">
                <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-450">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Account</p>
                  <p className="text-xs text-zinc-200 font-medium truncate">{adminEmail}</p>
                </div>
              </div>
            )}

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-amber-500" : "text-zinc-500"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-zinc-900 text-xs font-bold text-zinc-550 hover:text-rose-400 hover:bg-rose-500/5 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* 3. MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
