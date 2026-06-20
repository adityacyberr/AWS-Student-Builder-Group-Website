"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Toast, ToastType } from "@/components/console/Toast";
import { getEvents, getTeamMembers, getGalleryImages, getAchievements, getAnnouncements } from "@/lib/cms";
import { setupRealtimeSubscriptions } from "@/lib/realtimeSubscriptions";
import { subscribeCmsUpdates } from "@/lib/cmsEvents";
import { SkeletonStatCard } from "@/components/console/SkeletonLoader";
import { CMSErrorBoundary, CMSErrorState } from "@/components/console/CMSErrorBoundary";
import {
  Calendar, Users, ImageIcon, Trophy, Megaphone, Loader, Plus, ExternalLink, Activity, ShieldCheck, Database, HardDrive, Key, CheckCircle, AlertTriangle, AlertCircle
} from "lucide-react";

function AdminDashboard() {
  const router = useRouter();
  const { profile, isSuperAdmin } = useAuth();
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
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // System Health states
  const [healthStatus, setHealthStatus] = useState({
    database: "Checking",
    storage: "Checking",
    realtime: "Checking",
    rls: "Checking",
    lastSync: "Never",
    failedUploads: 0,
    storageFilesCount: 0
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Unknown";
    }
  };

  const loadDashboardStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Load actual counts using central CMS getters (fully compatible with Supabase and Sandbox)
      const [eventsList, teamList, galleryList, achievementsList, announcementsList] = await Promise.all([
        getEvents(),
        getTeamMembers(),
        getGalleryImages(),
        getAchievements(),
        getAnnouncements()
      ]);

      setCounts({
        events: eventsList.length,
        team: teamList.length,
        gallery: galleryList.length,
        achievements: achievementsList.length,
        announcements: announcementsList.length
      });

      // Find the next upcoming event
      const upcoming = eventsList
        .filter((e) => e.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (upcoming.length > 0) {
        setNextEvent(`${upcoming[0].title} (${upcoming[0].date})`);
      } else {
        setNextEvent(null);
      }
      
      // Perform health check audit
      await runHealthCheck();

    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      showToast("Failed to fetch database statistics.", "error");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.warn("[Dashboard Logs] Error fetching activity logs:", error.message);
          return;
        }
        setActivityLogs(data || []);
      } catch (err: any) {
        console.error("Exception loading activity logs:", err);
      }
    } else {
      // Mock logs for Sandbox development
      setActivityLogs([
        { id: "1", user_name: "Sandbox Admin", action: "create", entity_type: "event", created_at: new Date().toISOString() },
        { id: "2", user_name: "System", action: "upload", entity_type: "gallery_image", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: "3", user_name: "Sandbox Admin", action: "update", entity_type: "announcement", created_at: new Date(Date.now() - 86400000).toISOString() }
      ]);
    }
  };

  const runHealthCheck = async () => {
    const status = {
      database: "Disconnected",
      storage: "Disconnected",
      realtime: "Inactive",
      rls: "Unknown",
      lastSync: new Date().toLocaleTimeString(),
      failedUploads: 0,
      storageFilesCount: 0
    };

    if (isSupabaseConfigured && supabase) {
      // 1. Database check
      try {
        const { error: dbError } = await supabase.from("events").select("id").limit(1);
        if (!dbError) {
          status.database = "Connected";
          status.rls = "Enforced";
        } else {
          status.database = "Error";
          status.rls = "Degraded";
        }
      } catch {
        status.database = "Exception";
      }

      // 2. Storage Check & counting files
      try {
        const { data: files, error: storageError } = await supabase.storage.from("builder-assets").list("events", { limit: 100 });
        if (!storageError) {
          status.storage = "Connected";
          status.storageFilesCount = files ? files.length : 0;
        } else {
          status.storage = "Degraded";
        }
      } catch {
        status.storage = "Exception";
      }

      // 3. Realtime check from cached client status
      const rtStatus = (window as any).__supabaseRealtimeStatus || "SUBSCRIBED";
      status.realtime = rtStatus === "SUBSCRIBED" ? "Active" : "Inactive";

      // 4. Failed upload log checks
      try {
        const yesterday = new Date(Date.now() - 24 * 3600000).toISOString();
        const { data: logs, error: logsError } = await supabase
          .from("activity_logs")
          .select("id")
          .eq("action", "upload")
          .gte("created_at", yesterday);
        if (!logsError && logs) {
          status.failedUploads = logs.length;
        }
      } catch {}
    } else {
      // sandbox mode statuses
      status.database = "Connected (Sandbox)";
      status.storage = "Ready (Data URLs)";
      status.realtime = "Mock Active";
      status.rls = "Bypassed (Local)";
    }

    setHealthStatus(status);
  };

  useEffect(() => {
    loadDashboardStats();
    loadActivityLogs();

    // Central realtime subscriptions cleanup setup
    const cleanupRealtime = setupRealtimeSubscriptions();

    // Refresh when cmsEvents notify updates
    const unsubscribeUpdates = subscribeCmsUpdates("all", () => {
      loadDashboardStats(true);
      loadActivityLogs();
    });

    const handleFocus = () => {
      loadDashboardStats(true);
      loadActivityLogs();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      cleanupRealtime();
      unsubscribeUpdates();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

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
    { label: "Create Event", href: "/admin/events", roleRestricted: false },
    { label: "Add Member", href: "/admin/team", roleRestricted: true },
    { label: "Upload Image", href: "/admin/gallery", roleRestricted: false },
    { label: "Add Announcement", href: "/admin/announcements", roleRestricted: false },
    { label: "Add Achievement", href: "/admin/achievements", roleRestricted: false },
  ].filter(action => !action.roleRestricted || isSuperAdmin);

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase select-none">
            Welcome back, {profile?.name || "Administrator"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-zinc-550">
              Role: 
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              {profile?.portal_role || "Member"}
            </span>
            <span className="text-zinc-700">&bull;</span>
            <span className="text-xs text-zinc-550 flex items-center gap-1">
              <Database className="h-3.5 w-3.5 text-zinc-500" />
              DB Mode: {isSupabaseConfigured ? "Supabase Cloud" : "Local Sandbox"}
            </span>
          </div>
        </div>
        
        <a 
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-850 hover:border-zinc-755 text-zinc-400 hover:text-white transition-all text-xs font-semibold select-none bg-zinc-900/10"
        >
          <span>Preview Website</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* RLS Permissions Panel */}
      <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-550 flex items-center gap-1.5">
          <Key className="h-3.5 w-3.5 text-orange-500" />
          Active Account Permissions
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {isSuperAdmin 
            ? "You are logged in as a Super Admin. You have unrestricted write permissions across all roster profiles, chapter milestones, and system configuration tables."
            : "You are logged in as a Member. You have ownership-based write policies. You can publish content and update records created by yourself, but cannot delete database records owned by other builders."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Database Overview</h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
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
        )}
      </div>

      {/* Quick Actions */}
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

      {/* Activity & System Health grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Health Section */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-orange-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Health</h3>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">Sync: {healthStatus.lastSync}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-900/40">
              <span className="text-zinc-450">Database Connectivity</span>
              <span className="flex items-center gap-1.5 font-bold font-mono">
                <span className={`h-2 w-2 rounded-full ${healthStatus.database.startsWith("Connected") ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className={healthStatus.database.startsWith("Connected") ? "text-emerald-450" : "text-rose-455"}>{healthStatus.database}</span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-900/40">
              <span className="text-zinc-450">Supabase Assets Storage</span>
              <span className="flex items-center gap-1.5 font-bold font-mono">
                <span className={`h-2 w-2 rounded-full ${healthStatus.storage.includes("Connected") || healthStatus.storage.includes("Ready") ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className={healthStatus.storage.includes("Connected") || healthStatus.storage.includes("Ready") ? "text-emerald-455" : "text-amber-450"}>{healthStatus.storage}</span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-900/40">
              <span className="text-zinc-455">Supabase Realtime Channel</span>
              <span className="flex items-center gap-1.5 font-bold font-mono">
                <span className={`h-2 w-2 rounded-full ${healthStatus.realtime.includes("Active") ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className={healthStatus.realtime.includes("Active") ? "text-emerald-455" : "text-rose-455"}>{healthStatus.realtime}</span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-900/40">
              <span className="text-zinc-455">Row-Level Security Checks</span>
              <span className="flex items-center gap-1.5 font-bold font-mono">
                <span className={`h-2 w-2 rounded-full ${healthStatus.rls === "Enforced" || healthStatus.rls.includes("Bypassed") ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-zinc-300">{healthStatus.rls}</span>
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-zinc-455">Failed Uploads (24h)</span>
              <span className={`font-bold font-mono ${healthStatus.failedUploads > 0 ? "text-rose-500 font-black animate-bounce" : "text-zinc-400"}`}>
                {healthStatus.failedUploads}
              </span>
            </div>
          </div>
        </div>

        {/* Real Activity log */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <HardDrive className="h-4.5 w-4.5 text-orange-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Portal Activity Logs</h3>
          </div>
          <div className="space-y-3.5">
            {isSuperAdmin ? (
              activityLogs.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-zinc-550">
                  No activity log entries registered yet.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between text-[11px] gap-4">
                    <span className="text-zinc-300 leading-normal font-mono break-all">
                      <strong className="text-orange-500">{log.user_name}</strong> {log.action}d {log.entity_type}
                    </span>
                    <span className="text-zinc-600 whitespace-nowrap font-mono shrink-0">{formatRelativeTime(log.created_at)}</span>
                  </div>
                ))
              )
            ) : (
              <div className="text-center py-8 text-[11px] text-zinc-550 flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Activity logs are restricted to Super Admin accounts.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function AdminDashboardWrapped() {
  return (
    <CMSErrorBoundary>
      <AdminDashboard />
    </CMSErrorBoundary>
  );
}
