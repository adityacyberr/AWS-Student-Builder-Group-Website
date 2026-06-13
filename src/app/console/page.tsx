"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import {
  Settings,
  Activity,
  Calendar,
  Users,
  Image as ImageIcon,
  Trophy,
  Megaphone,
  Loader,
  Save,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { getLocalEvents } from "@/data/events";
import { getLocalAchievements } from "@/data/achievements";

interface StatItem {
  id: string;
  label: string;
  value: string;
  display_order: number;
}

export default function ConsoleDashboard() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Counts
  const [counts, setCounts] = useState({
    announcements: 0,
    events: 0,
    team: 0,
    gallery: 0,
    achievements: 0,
  });

  // Settings
  const [meetupUrl, setMeetupUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Homepage Stats CRUD state
  const [homeStats, setHomeStats] = useState<StatItem[]>([]);
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [newStatLabel, setNewStatLabel] = useState("");
  const [newStatValue, setNewStatValue] = useState("");
  const [newStatOrder, setNewStatOrder] = useState(1);
  const [showAddStat, setShowAddStat] = useState(false);
  const [statSaving, setStatSaving] = useState(false);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Fetch counts from Supabase
        const [
          { count: annCount },
          { count: evCount },
          { count: teamCount },
          { count: galCount },
          { count: achCount },
          { data: settingsData },
          { data: statsData },
        ] = await Promise.all([
          supabase.from("announcements").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("team_members").select("*", { count: "exact", head: true }),
          supabase.from("gallery_images").select("*", { count: "exact", head: true }),
          supabase.from("achievements").select("*", { count: "exact", head: true }),
          supabase.from("site_settings").select("*"),
          supabase.from("homepage_stats").select("*").order("display_order", { ascending: true }),
        ]);

        setCounts({
          announcements: annCount || 0,
          events: evCount || 0,
          team: teamCount || 0,
          gallery: galCount || 0,
          achievements: achCount || 0,
        });

        // Set Settings
        if (settingsData) {
          const meetup = settingsData.find((s) => s.key === "meetup_url")?.value || "";
          const whatsapp = settingsData.find((s) => s.key === "whatsapp_url")?.value || "";
          const email = settingsData.find((s) => s.key === "contact_email")?.value || "";
          setMeetupUrl(meetup);
          setWhatsappUrl(whatsapp);
          setContactEmail(email);
        }

        // Set Stats
        if (statsData) {
          setHomeStats(statsData as StatItem[]);
        }
      } else {
        // Local Sandbox Fallback
        const annList = JSON.parse(localStorage.getItem("aws_sbg_announcements") || "[]");
        const evList = getLocalEvents();
        const teamList = JSON.parse(localStorage.getItem("aws_sbg_team") || "[]");
        const galList = JSON.parse(localStorage.getItem("aws_sbg_gallery") || "[]");
        const achList = getLocalAchievements();

        setCounts({
          announcements: annList.length,
          events: evList.length,
          team: teamList.length,
          gallery: galList.length,
          achievements: achList.length,
        });

        setMeetupUrl(localStorage.getItem("aws_sbg_meetup_url") || "https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups");
        setWhatsappUrl(localStorage.getItem("aws_sbg_whatsapp_url") || "https://chat.whatsapp.com/aws-sbg-rimt");
        setContactEmail(localStorage.getItem("aws_sbg_contact_email") || "sbg.rimt@gmail.com");

        const localStats = JSON.parse(localStorage.getItem("aws_sbg_stats") || "[]");
        if (localStats.length === 0) {
          const defaultStats: StatItem[] = [
            { id: "1", label: "Members", value: "150+", display_order: 1 },
            { id: "2", label: "Bootcamps", value: "3+", display_order: 2 },
            { id: "3", label: "Hands-On", value: "100%", display_order: 3 },
          ];
          localStorage.setItem("aws_sbg_stats", JSON.stringify(defaultStats));
          setHomeStats(defaultStats);
        } else {
          setHomeStats(localStats);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("site_settings").upsert([
          { key: "meetup_url", value: meetupUrl },
          { key: "whatsapp_url", value: whatsappUrl },
          { key: "contact_email", value: contactEmail },
        ]);
        if (error) throw error;
        showToast("Site settings saved to Supabase successfully!");
      } else {
        localStorage.setItem("aws_sbg_meetup_url", meetupUrl);
        localStorage.setItem("aws_sbg_whatsapp_url", whatsappUrl);
        localStorage.setItem("aws_sbg_contact_email", contactEmail);
        showToast("Saved to browser sandbox storage.");
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error saving settings: ${err.message || "Unknown error"}`, "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatLabel || !newStatValue) return;
    setStatSaving(true);
    try {
      const newItem = {
        label: newStatLabel,
        value: newStatValue,
        display_order: newStatOrder,
      };

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from("homepage_stats").insert([newItem]).select();
        if (error) throw error;
        if (data) {
          setHomeStats([...homeStats, data[0]].sort((a, b) => a.display_order - b.display_order));
        }
        showToast("Metric added successfully!");
      } else {
        const localList = JSON.parse(localStorage.getItem("aws_sbg_stats") || "[]");
        const withId = { ...newItem, id: Math.random().toString(36).substring(2, 9) };
        const updated = [...localList, withId].sort((a, b) => a.display_order - b.display_order);
        localStorage.setItem("aws_sbg_stats", JSON.stringify(updated));
        setHomeStats(updated);
        showToast("Metric added to sandbox!");
      }
      setNewStatLabel("");
      setNewStatValue("");
      setNewStatOrder(homeStats.length + 2);
      setShowAddStat(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to add metric.", "error");
    } finally {
      setStatSaving(false);
    }
  };

  const handleUpdateStat = async (stat: StatItem) => {
    if (!stat.label || !stat.value) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("homepage_stats")
          .update({ label: stat.label, value: stat.value, display_order: stat.display_order })
          .eq("id", stat.id);
        if (error) throw error;
        showToast("Metric updated successfully!");
      } else {
        const localList = JSON.parse(localStorage.getItem("aws_sbg_stats") || "[]");
        const updated = localList.map((item: StatItem) =>
          item.id === stat.id ? stat : item
        ).sort((a: StatItem, b: StatItem) => a.display_order - b.display_order);
        localStorage.setItem("aws_sbg_stats", JSON.stringify(updated));
        setHomeStats(updated);
        showToast("Metric updated in sandbox.");
      }
      setEditingStat(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update metric.", "error");
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this metric?")) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("homepage_stats").delete().eq("id", id);
        if (error) throw error;
        setHomeStats(homeStats.filter((s) => s.id !== id));
        showToast("Metric deleted.");
      } else {
        const localList = JSON.parse(localStorage.getItem("aws_sbg_stats") || "[]");
        const updated = localList.filter((item: StatItem) => item.id !== id);
        localStorage.setItem("aws_sbg_stats", JSON.stringify(updated));
        setHomeStats(updated);
        showToast("Metric deleted from sandbox.");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete metric.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader className="h-6 w-6 text-amber-500 animate-spin" />
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loading Console Portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-amber-500" />
          Dashboard Overview
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review core database tallies, edit communication URL links, and set homepage stats.
        </p>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { name: "Announcements", count: counts.announcements, icon: Megaphone, color: "text-blue-400" },
          { name: "Events", count: counts.events, icon: Calendar, color: "text-amber-400" },
          { name: "Team Members", count: counts.team, icon: Users, color: "text-purple-400" },
          { name: "Gallery Images", count: counts.gallery, icon: ImageIcon, color: "text-emerald-400" },
          { name: "Achievements", count: counts.achievements, icon: Trophy, color: "text-indigo-400" },
        ].map((c) => (
          <div key={c.name} className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">{c.name}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">{c.count}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Settings form */}
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Settings className="h-4.5 w-4.5 text-zinc-450" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Site-Wide Settings</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Meetup Group Link
              </label>
              <input
                type="url"
                required
                value={meetupUrl}
                onChange={(e) => setMeetupUrl(e.target.value)}
                placeholder="https://meetup.com/..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                WhatsApp Community Link
              </label>
              <input
                type="url"
                required
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Contact Email Address
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sbg@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 select-none"
            >
              {settingsSaving ? <Loader className="h-3 w-3 animate-spin text-zinc-905" /> : <Save className="h-3.5 w-3.5" />}
              Save Links
            </button>
          </form>
        </div>

        {/* Homepage Stats list */}
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-zinc-450" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Homepage Metrics</h2>
            </div>
            <button
              onClick={() => {
                setNewStatOrder(homeStats.length + 1);
                setShowAddStat(!showAddStat);
              }}
              className="h-7 w-7 rounded-lg border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              {showAddStat ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>

          {showAddStat && (
            <form onSubmit={handleAddStat} className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-900/50 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-550 uppercase block">Label</label>
                  <input
                    type="text"
                    required
                    value={newStatLabel}
                    onChange={(e) => setNewStatLabel(e.target.value)}
                    placeholder="Members"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-550 uppercase block">Value</label>
                  <input
                    type="text"
                    required
                    value={newStatValue}
                    onChange={(e) => setNewStatValue(e.target.value)}
                    placeholder="150+"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-[9px] font-bold text-zinc-550 uppercase">Order:</label>
                  <input
                    type="number"
                    value={newStatOrder}
                    onChange={(e) => setNewStatOrder(parseInt(e.target.value) || 1)}
                    className="w-12 px-2 py-0.5 text-xs rounded bg-zinc-950 border border-zinc-800 text-white text-center focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={statSaving}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  {statSaving && <Loader className="h-3 w-3 animate-spin text-white" />}
                  Add Metric
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {homeStats.length === 0 ? (
              <p className="text-xs text-zinc-550 text-center py-4">No metrics configured.</p>
            ) : (
              homeStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 bg-zinc-950/20"
                >
                  {editingStat?.id === stat.id ? (
                    <div className="flex items-center gap-2 flex-grow">
                      <input
                        type="text"
                        value={editingStat.label}
                        onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                        className="w-1/3 px-2 py-1 text-xs rounded bg-zinc-900 border border-zinc-800 text-white"
                      />
                      <input
                        type="text"
                        value={editingStat.value}
                        onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                        className="w-1/3 px-2 py-1 text-xs rounded bg-zinc-900 border border-zinc-800 text-white"
                      />
                      <input
                        type="number"
                        value={editingStat.display_order}
                        onChange={(e) => setEditingStat({ ...editingStat, display_order: parseInt(e.target.value) || 1 })}
                        className="w-12 px-1.5 py-1 text-xs rounded bg-zinc-900 border border-zinc-800 text-white text-center"
                      />
                      <button
                        onClick={() => handleUpdateStat(editingStat)}
                        className="h-7 w-7 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingStat(null)}
                        className="h-7 w-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-white">{stat.value}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">{stat.label}</span>
                        <span className="text-[8px] bg-zinc-900 px-1 py-0.5 rounded text-zinc-550 border border-zinc-850">
                          Order: {stat.display_order}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingStat(stat)}
                          className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteStat(stat.id)}
                          className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 hover:bg-rose-500/5 flex items-center justify-center text-zinc-450 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
