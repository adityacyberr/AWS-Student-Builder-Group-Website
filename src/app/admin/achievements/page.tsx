"use client";

import React, { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { useAuth } from "@/context/AuthContext";
import { getAchievements, saveAchievement, deleteAchievement, CMSAchievement } from "@/lib/cms";
import { subscribeCmsUpdates } from "@/lib/cmsEvents";
import { SkeletonRow } from "@/components/console/SkeletonLoader";
import { CMSErrorBoundary, CMSErrorState } from "@/components/console/CMSErrorBoundary";
import {
  Trophy,
  Plus,
  Search,
  Loader,
  Edit2,
  Trash2,
  X,
  Save,
  Award,
  Calendar,
  Shield,
} from "lucide-react";

function ConsoleAchievements() {
  const { user, profile, isSuperAdmin, canManage } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lists and filters
  const [achievements, setAchievements] = useState<CMSAchievement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [badgeType, setBadgeType] = useState<CMSAchievement["badgeType"]>("milestone");
  const [description, setDescription] = useState("");

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAchievements = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getAchievements();
      setAchievements(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load achievements. Please check your network connection.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
    // Centralized CMS update subscription
    const unsubscribe = subscribeCmsUpdates("achievements", () => {
      loadAchievements(true);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("");
    setDate(new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
    setBadgeType("milestone");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ach: CMSAchievement) => {
    setEditingId(ach.id);
    setTitle(ach.title);
    setDate(ach.date);
    setBadgeType(ach.badgeType);
    setDescription(ach.description);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !description) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);

    const payload: Omit<CMSAchievement, "id" | "ownerUserId" | "createdBy" | "updatedBy"> = {
      title,
      date,
      description,
      badgeType,
    };

    // Close modal immediately
    setIsModalOpen(false);

    // Snapshot for rollback
    const originalAchievements = [...achievements];
    const tempId = editingId || `optimistic-${Date.now()}`;
    const optimisticItem: CMSAchievement = {
      id: tempId,
      ...payload,
      ownerUserId: user?.id || "",
      createdBy: editingId ? (achievements.find((a) => a.id === editingId)?.createdBy || "") : (user?.id || ""),
      updatedBy: user?.id || "",
    };

    // Optimistic UI state update
    if (editingId) {
      setAchievements(achievements.map((a) => (a.id === editingId ? optimisticItem : a)));
    } else {
      setAchievements([optimisticItem, ...achievements]);
    }

    try {
      const saved = await saveAchievement(editingId, payload, user?.id || null, profile?.name || null);
      // Replace optimistic entry with DB entry
      setAchievements((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
      showToast(editingId ? "Milestone updated successfully!" : "Milestone created successfully!");
    } catch (err: any) {
      console.error(err);
      // Rollback
      setAchievements(originalAchievements);
      showToast(err.message || "Failed to save achievement. Rolled back.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement milestone?")) return;

    // Snapshot for rollback
    const originalAchievements = [...achievements];
    // Optimistic UI state delete
    setAchievements(achievements.filter((a) => a.id !== id));

    try {
      await deleteAchievement(id, user?.id || null, profile?.name || null);
      showToast("Deleted milestone.");
    } catch (err: any) {
      console.error(err);
      // Rollback
      setAchievements(originalAchievements);
      showToast("Failed to delete achievement. Rolled back.", "error");
    }
  };

  const filteredAchievements = achievements.filter((ach) => {
    const matchesSearch =
      ach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ach.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      badgeFilter === "all" || ach.badgeType === badgeFilter;

    return matchesSearch && matchesType;
  });

  const getBadgeBadgeStyle = (type: CMSAchievement["badgeType"]) => {
    switch (type) {
      case "charter":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/10";
      case "team":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/10";
      case "milestone":
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/10";
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Manage Achievements
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Track official cloud chapter foundation milestones, core roster accomplishments, and awards.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Achievement
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search milestones by title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        </div>

        <div className="flex bg-zinc-950 border border-zinc-850 rounded-lg p-0.5 text-xs select-none self-start md:self-auto">
          {["all", "charter", "team", "milestone"].map((tab) => (
            <button
              key={tab}
              onClick={() => setBadgeFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all capitalize text-[10px] ${
                badgeFilter === tab ? "bg-zinc-900 text-zinc-100 border border-zinc-800" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Roster list */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : error ? (
        <CMSErrorState message={error} onRetry={() => loadAchievements()} />
      ) : filteredAchievements.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900/50 rounded-xl">
          <p className="text-xs text-zinc-550">No achievements found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className="p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl flex items-start justify-between gap-4 hover:border-zinc-805 transition-all animate-fade-in"
            >
              <div className="flex gap-3">
                <div className="h-8.5 w-8.5 rounded-lg border border-zinc-850 bg-zinc-900/50 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-xs font-black text-white">{ach.title}</h3>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${getBadgeBadgeStyle(ach.badgeType)}`}>
                      {ach.badgeType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{ach.date}</span>
                  </div>
                  <p className="text-xs text-zinc-450 leading-relaxed max-w-2xl">{ach.description}</p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                {canManage(ach) ? (
                  <>
                    <button
                      onClick={() => handleOpenEdit(ach)}
                      className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white transition-colors"
                      title="Edit Achievement"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(ach.id)}
                      className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-455 hover:text-rose-450 transition-colors"
                      title="Delete Achievement"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-zinc-650 font-medium px-2 py-1 flex items-center gap-1 bg-zinc-900/40 rounded border border-zinc-900/60">
                    <Shield className="h-3 w-3 text-zinc-650" />
                    Read-only
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-355 p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
              {editingId ? "Edit Milestone details" : "Add Achievement Milestone"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Milestone Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Official Chapter Founded"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Achievement Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. June 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                  Badge Type *
                </label>
                <select
                  value={badgeType}
                  onChange={(e) => setBadgeType(e.target.value as CMSAchievement["badgeType"])}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                >
                  <option value="charter" className="bg-zinc-950">Charter Badge (Core Foundations)</option>
                  <option value="team" className="bg-zinc-950">Team Badge (Roster Achievements)</option>
                  <option value="milestone" className="bg-zinc-950">Milestone Badge (Other Milestones)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                  Milestone Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the significance of this chapter achievement..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-900 text-zinc-450 hover:text-zinc-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsoleAchievementsWrapped() {
  return (
    <CMSErrorBoundary>
      <ConsoleAchievements />
    </CMSErrorBoundary>
  );
}
