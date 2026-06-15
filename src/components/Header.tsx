"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight, LogOut, Settings, User as UserIcon, Layout, ChevronDown, Lock } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";


export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile, logout } = useAuth();

  // Hide header on panels and login/reset flows
  const isAuthOrPanelPath = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/member") || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/reset-password");

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isAuthOrPanelPath) return null;

  // Public Nav Items (Admin is removed because it moves to the user menu)
  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Team", href: "/team" },
    { name: "Gallery", href: "/gallery" },
    { name: "Achievements", href: "/achievements" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSignOutClick = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/85 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3.5 select-none group py-1">
              <div className="flex items-center justify-center h-10 px-2.5 rounded-lg bg-[#0e1726] border border-blue-500/30 shadow-inner relative overflow-hidden group-hover:border-orange-500/40 transition-colors duration-300">
                {/* Subtle orange accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 opacity-90" />
                <div className="flex flex-col leading-[1.1] text-left">
                  <span className="text-xs font-black tracking-widest text-white flex items-center gap-0.5">
                    RIMT<span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block" />
                  </span>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-305">
                    AWS SBG
                  </span>
                </div>
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                  AWS Student Builder Group
                </span>
                <span className="text-[9.5px] font-semibold text-slate-305 mt-1">
                  RIMT University, Punjab
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-orange-500 bg-slate-900/60 font-semibold"
                      : "text-slate-300 hover:text-orange-400 hover:bg-slate-900/40"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Menu CTA / User Profile Widget */}
          <div className="hidden md:flex items-center gap-4">
            {profile ? (
              /* Authenticated User Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-all select-none"
                >
                  <div className="h-7 w-7 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-[10px]">
                    {profile.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      profile.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="text-left leading-none max-w-[100px]">
                    <p className="text-[11px] font-bold text-white truncate">{profile.name}</p>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-orange-500/80">
                      {profile.portal_role}
                    </span>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-900 bg-slate-950 p-2 shadow-2xl transition-all">
                    <Link
                      href={profile.portal_role === "Member" ? "/member" : "/admin"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      <Layout className="h-4 w-4 text-orange-500" />
                      <span>
                        {profile.portal_role === "Member" ? "Member Portal" : "Admin Dashboard"}
                      </span>
                    </Link>
                    
                    {profile.portal_role !== "Member" && (
                      <Link
                        href="/admin/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-orange-500" />
                        <span>Settings</span>
                      </Link>
                    )}

                    <Link
                      href="/member"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-orange-500" />
                      <span>My Profile</span>
                    </Link>

                    <div className="my-1 border-t border-slate-900/60" />

                    <button
                      onClick={handleSignOutClick}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Login Link */
              <Link
                href="/login"
                title="Administrator Access"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-orange-400 px-3 py-2 rounded-lg border border-transparent hover:border-orange-500/20 hover:bg-orange-500/5 hover:shadow-[0_0_12px_rgba(255,153,0,0.12)] transition-all select-none"
              >
                <Lock className="h-3.5 w-3.5 text-orange-500/80" />
                <span>Admin</span>
              </Link>
            )}

            <a
              href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all select-none"
            >
              Join Our Club
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {profile && (
              <Link
                href={profile.portal_role === "Member" ? "/member" : "/admin"}
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400 font-extrabold text-[10px]"
              >
                {profile.name.substring(0, 2).toUpperCase()}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-45 bg-slate-950/60 backdrop-blur-sm md:hidden"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-[280px] max-w-full border-l border-slate-900 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-md md:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black tracking-widest text-white">RIMT AWS SBG</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Navigation Menu</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg border border-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Nav items list */}
                <nav className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "text-orange-500 bg-slate-900/60"
                            : "text-slate-300 hover:text-orange-400 hover:bg-slate-900/40"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  
                  {profile ? (
                    <>
                      <div className="my-2 border-t border-slate-900/60" />
                      <Link
                        href={profile.portal_role === "Member" ? "/member" : "/admin"}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-semibold text-orange-400 hover:bg-slate-900/40 cursor-pointer"
                      >
                        {profile.portal_role === "Member" ? "Member Portal" : "Admin Dashboard"}
                      </Link>
                      <button
                        onClick={handleSignOutClick}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      title="Administrator Access"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-350 hover:text-orange-400 hover:bg-slate-900/40 cursor-pointer"
                    >
                      <Lock className="h-4 w-4 text-orange-500/80" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Join our club CTA */}
              <div className="pt-4 border-t border-slate-900/60">
                <a
                  href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all select-none cursor-pointer"
                >
                  Join Our Club
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
