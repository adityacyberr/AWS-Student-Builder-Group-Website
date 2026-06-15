"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  ArrowLeftRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    title: "Content",
    items: [
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { name: "Events", href: "/admin/events", icon: Calendar },
      { name: "Gallery Images", href: "/admin/gallery", icon: ImageIcon },
      { name: "Achievements", href: "/admin/achievements", icon: Trophy },
    ]
  },
  {
    title: "People",
    items: [
      { name: "Team Roster", href: "/admin/team", icon: Users },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Keyboard listener for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Exclude login page from sidebar layout wrapper
  const isLogin = pathname === "/admin/login";
  if (isLogin) {
    return <>{children}</>;
  }



  // Get active section name for Breadcrumbs
  const getBreadcrumbs = () => {
    const activeItem = navSections
      .flatMap(s => s.items)
      .find(item => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));
    
    return [
      { name: "Admin Portal", href: "/admin" },
      ...(activeItem && activeItem.href !== "/admin" ? [{ name: activeItem.name, href: activeItem.href }] : [])
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col md:flex-row antialiased font-sans">
      {/* 1. DESKTOP/TABLET SIDEBAR */}
      <aside className="hidden md:flex flex-col w-16 lg:w-64 bg-zinc-950 border-r border-zinc-900 h-screen sticky top-0 flex-shrink-0 select-none transition-all duration-300">
        {/* Brand Section */}
        <div className="h-16 flex items-center justify-center lg:justify-start px-4 lg:px-6 border-b border-zinc-900 gap-2.5">
          <div className="h-6.5 w-6.5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <Settings className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white hidden lg:inline-block">Admin Console</span>
        </div>

        {/* User Pill / Meta Details */}
        {profile && (
          <div className="p-2 lg:p-4 mx-2 lg:mx-3 my-4 rounded-xl border border-zinc-900 bg-zinc-900/10 flex items-center justify-center lg:justify-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-455 font-bold uppercase select-none text-xs flex-shrink-0">
              {profile.name.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-grow hidden lg:block">
              <div className="flex items-center gap-1.5 justify-between">
                <p className="text-xs text-zinc-300 font-bold truncate">{profile.name}</p>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                  {profile.portal_role}
                </span>
              </div>
              <p className="text-[10px] text-zinc-550 truncate font-mono">{profile.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Items (Grouped by section) */}
        <nav className="flex-grow px-2 lg:px-3 space-y-4 overflow-y-auto pt-2">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="text-[9px] font-bold text-zinc-650 uppercase tracking-widest px-3.5 hidden lg:block">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-center lg:justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all group ${
                        isActive
                          ? "bg-zinc-900 border border-zinc-800 text-white shadow-sm"
                          : "text-zinc-550 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                      }`}
                      title={item.name}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-4.5 w-4.5 transition-colors flex-shrink-0 ${isActive ? "text-orange-500" : "text-zinc-550 group-hover:text-zinc-350"}`} />
                        <span className="hidden lg:inline">{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3 w-3 text-zinc-500 hidden lg:block" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          
        </nav>

        {/* Footer / Logout */}
        <div className="p-2 lg:p-3 border-t border-zinc-900">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-555 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE WRAPPER (Top Bar + Body) */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Top Header Workspace */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-5 md:px-8 sticky top-0 z-40 select-none">
          {/* Mobile Menu Open Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 rounded-lg border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Admin Console</span>
          </div>

          {/* Breadcrumbs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2 text-xs">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.name}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />}
                <Link 
                  href={crumb.href}
                  className={`font-semibold transition-colors ${
                    idx === breadcrumbs.length - 1 ? "text-zinc-250 font-bold" : "text-zinc-550 hover:text-zinc-300"
                  }`}
                >
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Search Trigger and Status Bar */}
          <div className="flex items-center gap-4">
            {/* Global Search Button */}
            <button 
              onClick={() => setPaletteOpen(true)}
              className="h-9 px-3.5 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-900/10 flex items-center justify-between gap-6 text-zinc-500 hover:text-zinc-300 transition-all text-xs w-[160px] md:w-[220px]"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                <span className="font-medium">Search...</span>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded text-zinc-650 font-bold font-mono">⌘K</span>
            </button>
          </div>
        </header>        {/* Mobile Slide-Over Menu (Framer Motion Drawer) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm md:hidden"
              />
              {/* Drawer Panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 z-50 flex flex-col justify-between p-6 shadow-2xl md:hidden"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-900/60">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-500">
                        <Settings className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Admin console</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {profile && (
                    <div className="flex items-center gap-3 pb-5 border-b border-zinc-900/50">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold select-none text-xs flex-shrink-0">
                        {profile.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-zinc-200 font-bold truncate">{profile.name}</p>
                          <span className="px-1.5 py-0.2 rounded text-[7px] font-extrabold uppercase bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                            {profile.portal_role}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-550 truncate font-mono">{profile.email}</p>
                      </div>
                    </div>
                  )}

                  <nav className="space-y-4">
                    {navSections.map((section) => (
                      <div key={section.title} className="space-y-1">
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider px-2">
                          {section.title}
                        </p>
                        <div className="space-y-0.5">
                          {section.items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                  isActive ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-550 hover:text-zinc-350"
                                }`}
                              >
                                <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? "text-orange-500" : "text-zinc-550"}`} />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-zinc-900 text-xs font-bold text-zinc-550 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN CONTENT */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Cmd+K Search Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
