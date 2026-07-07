"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { 
  Settings as SettingsIcon, Save, Activity, Plus, Trash2, Edit2, X, Check, Loader, Info, ShieldAlert
} from "lucide-react";

interface StatItem {
  id: string;
  label: string;
  value: string;
  display_order: number;
}

interface DBSettingRow {
  key: string;
  value: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const { isSuperAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push("/admin");
    }
  }, [isSuperAdmin, authLoading, router]);

  const [activeTab, setActiveTab] = useState<"general" | "metrics" | "seo" | "danger">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // General Site Settings
  const [siteName, setSiteName] = useState("AWS Student Builder Group");
  const [siteTagline, setSiteTagline] = useState("RIMT University Campus Chapter");
  const [meetupUrl, setMeetupUrl] = useState("https://www.meetup.com/aws-sbg-at-rimt-university/");
  const [contactEmail, setContactEmail] = useState("sbg.rimt@gmail.com");
  const [linkedinUrl, setLinkedinUrl] = useState("https://www.linkedin.com/company/awsrimt/");
  const [instagramUrl, setInstagramUrl] = useState("https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==");
  const [githubUrl, setGithubUrl] = useState("");
  const [xUrl, setXUrl] = useState("");

  // SEO Settings
  const [seoTitle, setSeoTitle] = useState("AWS Student Builder Group | RIMT University");
  const [seoDescription, setSeoDescription] = useState("Official student-led cloud community of Amazon Web Services at RIMT.");

  // Homepage Metrics State
  const [homeStats, setHomeStats] = useState<StatItem[]>([]);
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [newStatLabel, setNewStatLabel] = useState("");
  const [newStatValue, setNewStatValue] = useState("");
  const [newStatOrder, setNewStatOrder] = useState(1);
  const [showAddStat, setShowAddStat] = useState(false);
  const [statSaving, setStatSaving] = useState(false);

  // Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Fetch settings and stats in parallel
        const [settingsRes, statsRes] = await Promise.all([
          supabase.from("site_settings").select("*"),
          supabase.from("homepage_stats").select("*").order("display_order", { ascending: true })
        ]);

        if (settingsRes.data) {
          settingsRes.data.forEach((row: DBSettingRow) => {
            if (row.key === "site_name") setSiteName(row.value);
            if (row.key === "site_tagline") setSiteTagline(row.value);
            if (row.key === "meetup_url") setMeetupUrl(row.value);
            if (row.key === "contact_email") setContactEmail(row.value);
            if (row.key === "linkedin_url") setLinkedinUrl(row.value);
            if (row.key === "instagram_url") setInstagramUrl(row.value);
            if (row.key === "github_url") setGithubUrl(row.value);
            if (row.key === "x_url") setXUrl(row.value);
            if (row.key === "seo_title") setSeoTitle(row.value);
            if (row.key === "seo_description") setSeoDescription(row.value);
          });
        }

        if (statsRes.data) {
          setHomeStats(statsRes.data);
        }
      } else {
        // Fallback Local Storage Load
        if (typeof window !== "undefined") {
          setMeetupUrl(localStorage.getItem("aws_sbg_meetup_url") || "https://www.meetup.com/aws-sbg-at-rimt-university/");
          setContactEmail(localStorage.getItem("aws_sbg_contact_email") || "sbg.rimt@gmail.com");
          
          const storedStats = localStorage.getItem("aws_sbg_home_stats");
          if (storedStats) {
            setHomeStats(JSON.parse(storedStats));
          } else {
            setHomeStats([
              { id: "1", label: "Members", value: "150+", display_order: 1 },
              { id: "2", label: "Bootcamps", value: "3+", display_order: 2 },
              { id: "3", label: "Hands-On", value: "100%", display_order: 3 },
            ]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load settings data:", err);
      showToast("Failed to load settings from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const rows = [
          { key: "site_name", value: siteName.trim() },
          { key: "site_tagline", value: siteTagline.trim() },
          { key: "meetup_url", value: meetupUrl.trim() },
          { key: "contact_email", value: contactEmail.trim() },
          { key: "linkedin_url", value: linkedinUrl.trim() },
          { key: "instagram_url", value: instagramUrl.trim() },
          { key: "github_url", value: githubUrl.trim() },
          { key: "x_url", value: xUrl.trim() },
        ];

        const { error } = await supabase.from("site_settings").upsert(rows);
        if (error) throw error;
      } else {
        localStorage.setItem("aws_sbg_meetup_url", meetupUrl.trim());
        localStorage.setItem("aws_sbg_contact_email", contactEmail.trim());
      }
      showToast("General settings updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const rows = [
          { key: "seo_title", value: seoTitle.trim() },
          { key: "seo_description", value: seoDescription.trim() },
        ];

        const { error } = await supabase.from("site_settings").upsert(rows);
        if (error) throw error;
      }
      showToast("SEO settings updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save SEO settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Metrics CRUD Handlers
  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatLabel || !newStatValue) return;
    setStatSaving(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("homepage_stats")
          .insert({
            label: newStatLabel.trim(),
            value: newStatValue.trim(),
            display_order: newStatOrder,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setHomeStats([...homeStats, data].sort((a, b) => a.display_order - b.display_order));
      } else {
        const newStat: StatItem = {
          id: Math.random().toString(),
          label: newStatLabel.trim(),
          value: newStatValue.trim(),
          display_order: newStatOrder,
        };
        const updated = [...homeStats, newStat].sort((a, b) => a.display_order - b.display_order);
        setHomeStats(updated);
        localStorage.setItem("aws_sbg_home_stats", JSON.stringify(updated));
      }
      setNewStatLabel("");
      setNewStatValue("");
      setShowAddStat(false);
      showToast("Homepage metric added!");
    } catch (err: any) {
      showToast(err.message || "Failed to add metric.", "error");
    } finally {
      setStatSaving(false);
    }
  };

  const handleUpdateStat = async (stat: StatItem) => {
    setStatSaving(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("homepage_stats")
          .update({
            label: stat.label,
            value: stat.value,
            display_order: stat.display_order,
          })
          .eq("id", stat.id);

        if (error) throw error;
      }
      const updated = homeStats.map((s) => (s.id === stat.id ? stat : s)).sort((a, b) => a.display_order - b.display_order);
      setHomeStats(updated);
      if (!isSupabaseConfigured) {
        localStorage.setItem("aws_sbg_home_stats", JSON.stringify(updated));
      }
      setEditingStat(null);
      showToast("Homepage metric updated!");
    } catch (err: any) {
      showToast(err.message || "Failed to update metric.", "error");
    } finally {
      setStatSaving(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    setConfirmTitle("Delete Metric");
    setConfirmDesc("Are you sure you want to remove this metric from the homepage? This cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.from("homepage_stats").delete().eq("id", id);
          if (error) throw error;
        }
        const updated = homeStats.filter((s) => s.id !== id);
        setHomeStats(updated);
        if (!isSupabaseConfigured) {
          localStorage.setItem("aws_sbg_home_stats", JSON.stringify(updated));
        }
        showToast("Homepage metric deleted.");
      } catch (err: any) {
        showToast(err.message || "Failed to delete metric.", "error");
      } finally {
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleClearCache = () => {
    setConfirmTitle("Clear System Cache");
    setConfirmDesc("This will clear all system caches and reload local storage fallbacks. OK?");
    setConfirmAction(() => () => {
      localStorage.clear();
      showToast("Cache cleared successfully!");
      setConfirmOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    });
    setConfirmOpen(true);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400 max-w-md">
          This profile can only be managed by its owner or an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-5">
        <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">System Settings</h1>
          <p className="text-xs text-zinc-550">Configure global parameters, homepage settings, and SEO credentials.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 gap-4">
        {[
          { id: "general", label: "General & Branding" },
          { id: "metrics", label: "Homepage Metrics" },
          { id: "seo", label: "SEO Config" },
          { id: "danger", label: "System Maintenance" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === tab.id
                ? "text-orange-500 font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "general" && (
          <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl bg-zinc-900/10 border border-zinc-900 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Info className="h-4 w-4 text-orange-500" />
              Website Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Website Name</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Site Tagline</label>
                <input
                  type="text"
                  required
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pt-4 pb-3">
              <Info className="h-4 w-4 text-orange-500" />
              Contact & Social Channels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Meetup Group Link</label>
                <input
                  type="url"
                  value={meetupUrl}
                  onChange={(e) => setMeetupUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Official Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">LinkedIn Page Link</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Instagram Account URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">GitHub Organization</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 select-none"
              >
                {saving ? <Loader className="h-3 w-3 animate-spin text-zinc-950" /> : <Save className="h-3.5 w-3.5" />}
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === "metrics" && (
          <div className="space-y-4 max-w-2xl bg-zinc-900/10 border border-zinc-900 rounded-xl p-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-orange-500" />
                Homepage Stats & Metrics
              </h3>
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
              <form onSubmit={handleAddStat} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/40 space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center justify-between border-t border-zinc-850/50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Display Order:</label>
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
                    className="px-3 py-1.5 bg-orange-550 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    {statSaving && <Loader className="h-3 w-3 animate-spin text-white" />}
                    Add Metric
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {homeStats.length === 0 ? (
                <p className="text-xs text-zinc-550 text-center py-4">No metrics configured.</p>
              ) : (
                homeStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-900 bg-zinc-900/20"
                  >
                    {editingStat && editingStat.id === stat.id ? (
                      <div className="flex items-center gap-2 flex-grow">
                        <input
                          type="text"
                          value={editingStat.label}
                          onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                          className="px-2 py-1 text-xs rounded bg-zinc-950 border border-zinc-800 text-white w-28"
                        />
                        <input
                          type="text"
                          value={editingStat.value}
                          onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                          className="px-2 py-1 text-xs rounded bg-zinc-950 border border-zinc-800 text-white w-20"
                        />
                        <input
                          type="number"
                          value={editingStat.display_order}
                          onChange={(e) => setEditingStat({ ...editingStat, display_order: parseInt(e.target.value) || 1 })}
                          className="px-2 py-1 text-xs rounded bg-zinc-950 border border-zinc-800 text-white w-12 text-center"
                        />
                        <button
                          onClick={() => handleUpdateStat(editingStat)}
                          className="h-7 w-7 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-green-400 hover:text-green-300"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingStat(null)}
                          className="h-7 w-7 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold font-mono text-zinc-650 bg-zinc-900/50 border border-zinc-850 px-1.5 py-0.5 rounded">
                            #{stat.display_order}
                          </span>
                          <div>
                            <p className="text-xs text-white font-bold">{stat.label}</p>
                            <p className="text-[10px] text-orange-400 font-mono font-semibold">{stat.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingStat(stat)}
                            className="h-7 w-7 rounded-lg border border-zinc-900 hover:border-zinc-800 hover:text-white text-zinc-550 flex items-center justify-center transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStat(stat.id)}
                            className="h-7 w-7 rounded-lg border border-zinc-900 hover:border-red-900/30 hover:text-red-400 text-zinc-550 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <form onSubmit={handleSaveSeo} className="space-y-4 max-w-2xl bg-zinc-900/10 border border-zinc-900 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Info className="h-4 w-4 text-orange-500" />
              SEO Configurations
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Default Meta Title</label>
              <input
                type="text"
                required
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Default Meta Description</label>
              <textarea
                rows={3}
                required
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>

            <div className="border-t border-zinc-900 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 select-none"
              >
                {saving ? <Loader className="h-3 w-3 animate-spin text-zinc-950" /> : <Save className="h-3.5 w-3.5" />}
                Save SEO Settings
              </button>
            </div>
          </form>
        )}

        {activeTab === "danger" && (
          <div className="space-y-6 max-w-2xl bg-red-950/5 border border-red-900/15 rounded-xl p-6">
            <h3 className="text-sm font-bold text-red-450 uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
              <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
              Danger Zone / Maintenance
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-900/10 bg-red-950/10">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-red-400 uppercase">Clear System Cache</h4>
                  <p className="text-[11px] text-zinc-500">Flush all localStorage flags, local cache maps, and session stores.</p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-3 py-2 bg-red-650/10 hover:bg-red-650/20 border border-red-650/20 hover:border-red-650/40 text-red-400 font-bold rounded-lg text-xs transition-all active:scale-[0.98]"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        isDestructive={true}
        onConfirm={() => confirmAction?.()}
        onCancel={() => setConfirmOpen(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
