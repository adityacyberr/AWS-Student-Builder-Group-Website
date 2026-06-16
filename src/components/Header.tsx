"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight, LogOut, Settings, Layout, ChevronDown, Lock } from "lucide-react";
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
    pathname.startsWith("/login") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/reset-password");

  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen && !isAuthOrPanelPath) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen, isAuthOrPanelPath]);

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

  // Public Nav Items
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
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/85 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[74px] items-center justify-between">
          {/* Left Side Group: Brand + Partners + Nav */}
          <div className="flex items-center flex-shrink-0">
            {/* Logo link */}
            <Link href="/" className="flex items-center gap-3 select-none group py-1 flex-shrink-0">
              <div className="flex items-center justify-center h-10 px-2.5 rounded-lg bg-[#0e1726] border border-blue-500/30 shadow-inner relative overflow-hidden group-hover:border-orange-500/40 transition-colors duration-300 flex-shrink-0">
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
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                  AWS Student Builder Group
                </span>
                <span className="text-[9.5px] font-semibold text-slate-305 mt-1">
                  RIMT University, Punjab
                </span>
              </div>
            </Link>

            {/* Compact Institutional Partners Section (Exactly 24px spacing via ml-6) */}
            <div className="hidden lg:flex items-center gap-2 select-none flex-shrink-0 ml-6">
              {/* Subtle gray text */}
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Supported by
              </span>

              {/* Tiny inline logos without separate containers (max height 28px, using h-[18px]) */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <img
                  src="/brand/rimt-university.jpg"
                  alt="RIMT"
                  className="h-[18px] w-auto object-contain rounded bg-white px-0.5"
                  title="RIMT University"
                />
                <img
                  src="/brand/dri-lab.png"
                  alt="DRI"
                  className="h-[18px] w-auto object-contain rounded bg-white px-0.5"
                  title="DRI – Department of Research, Innovation and Incubation"
                />
              </div>

              {/* Supported Text Line with Orange Dot Separator */}
              <span className="text-[10.5px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                RIMT University
                <span className="h-1 w-1 rounded-full bg-orange-500 inline-block" />
                DRI
              </span>
            </div>

            {/* Desktop Nav (Exactly 40px spacing via ml-10, Gap 24px via gap-6) */}
            <nav className="hidden lg:flex items-center gap-6 flex-shrink-0 ml-10">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
          </div>

          {/* Right Menu CTA / User Profile Widget */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
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
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      <Layout className="h-4 w-4 text-orange-500" />
                      <span>Admin Dashboard</span>
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
              className="inline-flex items-center justify-center gap-1.5 h-[42px] px-5 rounded-[12px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all select-none flex-shrink-0"
            >
              Join Our Club
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex lg:hidden items-center gap-3">
            {profile && (
              <Link
                href="/admin"
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

      {/* Fullscreen Mobile Navigation Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col justify-between p-6 md:hidden overflow-y-auto"
            style={{
              backgroundColor: "rgba(5, 8, 20, 0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Header top section */}
            <div className="flex flex-col space-y-4 w-full">
              <div className="flex items-center justify-between pb-4 border-b border-slate-900/60 w-full">
                {/* Logo replica */}
                <div className="flex items-center gap-2.5 select-none">
                  <div className="flex items-center justify-center h-10 px-2.5 rounded-lg bg-[#0e1726] border border-blue-500/30 shadow-inner relative overflow-hidden flex-shrink-0">
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

                  <div className="h-6 w-px bg-slate-800 flex-shrink-0" />

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center justify-center h-8.5 w-11 bg-white p-1 rounded-md border border-slate-200 shadow-sm flex-shrink-0">
                      <img
                        src="/brand/dri-lab.png"
                        alt="DRI – Department of Research, Innovation and Incubation"
                        className="max-h-full max-w-full object-contain"
                        title="DRI – Department of Research, Innovation and Incubation"
                      />
                    </div>
                    <div className="h-5 w-px bg-slate-850" />
                    <div className="flex items-center justify-center h-8.5 w-11 bg-white p-1 rounded-md border border-slate-200 shadow-sm flex-shrink-0">
                      <img
                        src="/brand/rimt-university.jpg"
                        alt="RIMT University"
                        className="max-h-full max-w-full object-contain"
                        title="RIMT University"
                      />
                    </div>
                  </div>
                </div>

                {/* Close X Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-900/40"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sub-header Brand text */}
              <div className="flex flex-col items-start text-left mt-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  RIMT AWS Student Builder Group
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 leading-relaxed">
                  An initiative under RIMT University & DRI – Department of Research, Innovation and Incubation
                </span>
              </div>
            </div>

            {/* Menu Items Centered Vertically */}
            <nav className="flex flex-col items-center justify-center space-y-6 my-auto py-6">
              {navItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.04, duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-2xl font-semibold transition-all duration-200 block py-1 cursor-pointer ${
                        isActive
                          ? "text-orange-500 border-b-2 border-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                          : "text-slate-200 hover:text-orange-400"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* Admin Portal option */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + navItems.length * 0.04, duration: 0.25 }}
              >
                {profile ? (
                  <div className="flex flex-col items-center space-y-4 pt-4 border-t border-slate-900/60 w-44">
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-2xl font-semibold transition-all duration-200 cursor-pointer ${
                        pathname === "/admin"
                          ? "text-orange-500 border-b-2 border-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                          : "text-slate-200 hover:text-orange-400"
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={handleSignOutClick}
                      className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors py-1 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-2xl font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                      pathname === "/login"
                        ? "text-orange-500 border-b-2 border-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        : "text-slate-200 hover:text-orange-400"
                    }`}
                  >
                    <Lock className="h-4.5 w-4.5 text-orange-500/80" />
                    <span>Admin Portal</span>
                  </Link>
                )}
              </motion.div>
            </nav>

            {/* Bottom Join CTA Button (Single Only, Never Duplicated) */}
            <div className="pb-8 w-full flex justify-center">
              <a
                href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-[85%] max-w-[320px] items-center justify-center gap-1.5 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all select-none cursor-pointer shadow-lg shadow-orange-500/10 active:scale-95"
              >
                Join Our Club
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
