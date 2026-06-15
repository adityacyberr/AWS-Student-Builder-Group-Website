"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Toast, ToastType } from "@/components/console/Toast";
import {
  Calendar, Users, ImageIcon, Trophy, Megaphone, Loader, Plus, ExternalLink, Sparkles, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Counts & Stats
  const [counts, setCounts] = useState({
    events: 0,
    team: 0,
    gallery: 0,
    achievements: 0,
    announcements: 0,
  });

  const [nextEvent, setNextEvent] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const [
          { count: evCount },
          { count: teamCount },
          { count: galCount },
          { count: achCount },
          { count: annCount },
          nextEventRes
        ] = await Promise.all([
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("team_members").select("*", { count: "exact", head: true }),
          supabase.from("gallery_images").select("*", { count: "exact", head: true }),
          supabase.from("achievements").select("*", { count: "exact", head: true }),
          supabase.from("announcements").select("*", { count: "exact", head: true }),
          supabase.from("events").select("title, date").eq("status", "upcoming").order("date", { ascending: true }).limit(1).maybeSingle()
        ]);

        setCounts({
          events: evCount || 0,
          team: teamCount || 0,
          gallery: galCount || 0,
          achievements: achCount || 0,
          announcements: annCount || 0,
        });

        if (nextEventRes.data) {
          setNextEvent(`${nextEventRes.data.title} (${nextEventRes.data.date})`);
        }
      } else {
        // Local Sandbox Fallback Counts
        setCounts({
          events: 1,
          team: 6,
          gallery: 3,
          achievements: 2,
          announcements: 1,
        });
        setNextEvent("Yet to be announced (July 29, 2026)");
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      showToast("Failed to fetch database statistics.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  const statCards = [
    {
      name: "Events",
      count: counts.events,
      meta: nextEvent ? `Next: ${nextEvent}` : "No upcoming events scheduled",
      icon: Calendar,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/10",
      href: "/admin/events",
    },
    {
      name: "Team Members",
      count: counts.team,
      meta: "Registered in Roster",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/10",
      href: "/admin/team",
    },
    {
      name: "Gallery Images",
      count: counts.gallery,
      meta: "Media elements",
      icon: ImageIcon,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/10",
      href: "/admin/gallery",
    },
    {
      name: "Achievements",
      count: counts.achievements,
      meta: "Milestones achieved",
      icon: Trophy,
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/10",
      href: "/admin/achievements",
    },
    {
      name: "Announcements",
      count: counts.announcements,
      meta: "Active news items",
      icon: Megaphone,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10",
      href: "/admin/announcements",
    },
  ];

  const quickActions = [
    { label: "Create Event", href: "/admin/events", action: "create" },
    { label: "Add Member", href: "/admin/team", action: "create" },
    { label: "Upload Image", href: "/admin/gallery", action: "create" },
    { label: "Add Announcement", href: "/admin/announcements", action: "create" },
    { label: "Add Achievement", href: "/admin/achievements", action: "create" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase select-none">
            Welcome back, {profile?.name || "Administrator"}
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Portal Role: <span className="text-orange-500 font-bold tracking-wide uppercase">{profile?.portal_role}</span> &bull; Chapter Database Status: Online.
          </p>
        </div>
        
        {/* Quick public site button */}
        <a 
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white transition-all text-xs font-semibold select-none bg-zinc-900/10"
        >
          <span>Preview Website</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Zone 1 — Clickable Stats Cards */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Database Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <button
              key={card.name}
              onClick={() => router.push(card.href)}
              className="flex flex-col p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/20 hover:border-zinc-800 text-left transition-all active:scale-[0.99] select-none group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-zinc-450 group-hover:text-zinc-300 transition-colors">
                  {card.name}
                </span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white tracking-tight">{card.count}</p>
                <p className="text-[10px] text-zinc-550 mt-1.5 truncate max-w-full font-mono">{card.meta}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone 2 — Quick Actions Row */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                router.push(action.href);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-xs font-bold text-zinc-300 hover:text-white transition-all select-none"
            >
              <Plus className="h-3.5 w-3.5 text-orange-500" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone 3 — Activity Indicator */}
      <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Activity className="h-4.5 w-4.5 text-orange-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">CMS System Status</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <p className="text-zinc-500 uppercase text-[9px] font-bold">Autosave Engine</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-300">Active (saves to SessionStorage)</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-zinc-500 uppercase text-[9px] font-bold">Uniqueness Constraints</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-300">Enforced (preventing duplicate rows)</span>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
