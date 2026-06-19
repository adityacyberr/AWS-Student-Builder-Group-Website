"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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
  Globe,
  Bell,
  Sun,
  Moon,
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
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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



  const isSuperAdmin = profile?.portal_role === "Super Admin";
  const allowedNavSections = navSections.map(section => {
    if (section.title === "System" && !isSuperAdmin) {
      return { ...section, items: [] };
    }
    return section;
  }).filter(section => section.items.length > 0);

  // Get active section name for Breadcrumbs
  const getBreadcrumbs = () => {
    const activeItem = allowedNavSections
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

        {/* User Pill / Meta Details with interactive toggle */}
        {profile && (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-full text-left p-2 lg:p-4 mx-2 lg:mx-3 my-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/20 flex items-center justify-center lg:justify-start gap-3 transition-colors cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold uppercase select-none text-xs flex-shrink-0 group-hover:border-orange-500/30 transition-colors">
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
            </button>

            {/* Sidebar dropdown menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute left-2 lg:left-4 bottom-16 mb-2 w-48 rounded-xl border border-zinc-900 bg-zinc-950 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-900/85 mb-1">
                    <p className="text-[9px] font-black uppercase text-zinc-650 tracking-wider">User Account</p>
                    <p className="text-xs font-bold text-zinc-250 truncate mt-0.5">{profile.name}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-550" />
                    <span>My Profile</span>
                  </Link>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#FF9900] hover:bg-orange-500/5 rounded-lg transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>View Website</span>
                  </a>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4 text-zinc-550" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 rounded-lg transition-colors text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation Items (Grouped by section) */}
        <nav className="flex-grow px-2 lg:px-3 space-y-4 overflow-y-auto pt-2">
          {allowedNavSections.map((section) => (
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
        <div className="p-2 lg:p-3 border-t border-zinc-900 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-[#FF9900] hover:bg-orange-500/5 hover:-translate-y-0.5 border border-transparent hover:border-orange-500/10 hover:shadow-[0_0_10px_rgba(255,153,0,0.05)] transition-all cursor-pointer"
            title="View Website"
          >
            <Globe className="h-4.5 w-4.5 text-[#FF9900]" />
            <span className="hidden lg:inline">View Website</span>
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
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

          {/* Breadcrumbs (Desktop) with Back Link */}
          <div className="hidden md:flex items-center justify-between flex-grow mr-6">
            <nav className="flex items-center space-x-2 text-xs">
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
            <a
              href="/"
              className="text-xs font-bold text-zinc-500 hover:text-[#FF9900] transition-colors flex items-center gap-1.5"
            >
              <span>← Back to Website</span>
            </a>
          </div>

          {/* Search Trigger and Actions */}
          <div className="flex items-center gap-3">
            {/* Preview Website Action */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-9 px-3.5 rounded-lg border border-orange-500/25 bg-orange-500/5 items-center gap-2 text-xs font-bold text-zinc-100 hover:border-orange-500/50 hover:bg-orange-500/10 hover:shadow-[0_0_15px_rgba(255,153,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Globe className="h-4 w-4 text-[#FF9900]" />
              <span>Preview Website</span>
            </a>

            {/* Global Search Trigger */}
            <button 
              onClick={() => setPaletteOpen(true)}
              className="h-9 px-3.5 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-900/10 flex items-center justify-between gap-4 text-zinc-550 hover:text-zinc-300 transition-all text-xs w-[120px] sm:w-[160px]"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                <span className="font-medium">Search...</span>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded text-zinc-650 font-bold font-mono hidden sm:inline">⌘K</span>
            </button>

            {/* Notification Bell */}
            <button className="h-9 w-9 rounded-lg border border-zinc-900 hover:border-zinc-850 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors">
              <Bell className="h-4 w-4" />
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => toggleTheme()}
              className="h-9 w-9 rounded-lg border border-zinc-900 hover:border-zinc-850 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors pointer-events-auto cursor-pointer"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Top Header User Profile Circle Menu */}
            {profile && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="h-9 px-2.5 rounded-lg border border-zinc-900 hover:border-zinc-855 bg-zinc-900/10 flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-zinc-100 transition-all"
                >
                  <div className="h-6.5 w-6.5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 uppercase text-[9px] font-black shrink-0">
                    {profile.name.substring(0, 2)}
                  </div>
                  <span className="hidden md:inline truncate max-w-[80px] font-medium">{profile.name.split(" ")[0]}</span>
                  <span className="text-zinc-650 text-[7px] shrink-0">▼</span>
                </button>

                {/* Dropdown Card */}
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-900 bg-zinc-950 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-zinc-900/80 mb-1">
                        <p className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">User Account</p>
                        <p className="text-xs font-bold text-zinc-200 truncate mt-0.5">{profile.name}</p>
                      </div>
                      <Link
                        href="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors"
                      >
                        <User className="h-4 w-4 text-zinc-550" />
                        <span>My Profile</span>
                      </Link>
                      <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#FF9900] hover:bg-orange-500/5 rounded-lg transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>View Website</span>
                      </a>
                      <Link
                        href="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4 text-zinc-550" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 rounded-lg transition-colors text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
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
                    {allowedNavSections.map((section) => (
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

                <div className="space-y-2.5 w-full mt-auto pt-4 border-t border-zinc-900/60">
                  <a
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-orange-500/10 bg-orange-500/5 text-xs font-bold text-[#FF9900] hover:bg-orange-500/10 transition-colors w-full cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                    <span>View Website</span>
                  </a>

                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/10 bg-red-500/5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
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
