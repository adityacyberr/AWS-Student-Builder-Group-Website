"use client";

import React, { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { useAuth } from "@/context/AuthContext";
import { getAnnouncements, saveAnnouncement, deleteAnnouncement, CMSAnnouncement } from "@/lib/cms";
import { subscribeCmsUpdates } from "@/lib/cmsEvents";
import { SkeletonRow } from "@/components/console/SkeletonLoader";
import { CMSErrorBoundary, CMSErrorState } from "@/components/console/CMSErrorBoundary";
import {
  Megaphone,
  Plus,
  Search,
  Loader,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";

function ConsoleAnnouncements() {
  const { user, profile, isSuperAdmin, canManage } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lists and filters
  const [announcements, setAnnouncements] = useState<CMSAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Add/Edit Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [active, setActive] = useState(true);
  
  const [initialValues, setInitialValues] = useState<{
    title: string;
    date: string;
    content: string;
    buttonText: string;
    destinationUrl: string;
    active: boolean;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAnnouncements = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load announcements. Please check your network connection.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    // Centralized update subscriber
    const unsubscribe = subscribeCmsUpdates("announcements", () => {
      loadAnnouncements(true);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    const defaultDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    setEditingId(null);
    setTitle("");
    setDate(defaultDate);
    setContent("");
    setButtonText("");
    setDestinationUrl("");
    setActive(true);
    setInitialValues({
      title: "",
      date: defaultDate,
      content: "",
      buttonText: "",
      destinationUrl: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: CMSAnnouncement) => {
    const initial = {
      title: ann.title,
      date: ann.date,
      content: ann.content,
      buttonText: ann.buttonText || "",
      destinationUrl: ann.destinationUrl || "",
      active: ann.active,
    };
    setEditingId(ann.id);
    setTitle(initial.title);
    setDate(initial.date);
    setContent(initial.content);
    setButtonText(initial.buttonText);
    setDestinationUrl(initial.destinationUrl);
    setActive(initial.active);
    setInitialValues(initial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (initialValues) {
      const hasChanges =
        title !== initialValues.title ||
        date !== initialValues.date ||
        content !== initialValues.content ||
        buttonText !== initialValues.buttonText ||
        destinationUrl !== initialValues.destinationUrl ||
        active !== initialValues.active;

      if (hasChanges) {
        if (!confirm("You have unsaved changes. Are you sure you want to close?")) {
          return;
        }
      }
    }
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedDate = date.trim();

    if (!trimmedTitle || !trimmedContent || !trimmedDate) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);

    const payload: Omit<CMSAnnouncement, "id" | "ownerUserId" | "createdBy" | "updatedBy"> = {
      title: trimmedTitle,
      content: trimmedContent,
      date: trimmedDate,
      active,
      buttonText: buttonText.trim() || undefined,
      destinationUrl: destinationUrl.trim() || undefined,
    };

    // Close modal immediately
    setIsModalOpen(false);

    // Snapshot for rollback
    const originalAnnouncements = [...announcements];
    const tempId = editingId || `optimistic-${Date.now()}`;
    const optimisticItem: CMSAnnouncement = {
      id: tempId,
      ...payload,
      ownerUserId: user?.id || "",
      createdBy: editingId ? (announcements.find((a) => a.id === editingId)?.createdBy || "") : (user?.id || ""),
      updatedBy: user?.id || "",
    };

    // Optimistic UI update
    if (editingId) {
      setAnnouncements(announcements.map((a) => (a.id === editingId ? optimisticItem : a)));
    } else {
      setAnnouncements([optimisticItem, ...announcements]);
    }

    try {
      const saved = await saveAnnouncement(editingId, payload, user?.id || null, profile?.name || null);
      // Replace optimistic entry with database entry
      setAnnouncements((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
      showToast(editingId ? "✅ Announcement updated successfully" : "✅ Announcement saved successfully");
    } catch (err: any) {
      console.error("Error saving announcement:", err.message || err);
      // Rollback
      setAnnouncements(originalAnnouncements);
      showToast(editingId ? "❌ Failed to update announcement. Rolled back." : "❌ Failed to save announcement. Rolled back.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    // Snapshot for rollback
    const originalAnnouncements = [...announcements];
    // Optimistic UI delete
    setAnnouncements(announcements.filter((a) => a.id !== id));

    try {
      await deleteAnnouncement(id, user?.id || null, profile?.name || null);
      showToast("Announcement deleted.");
    } catch (err: any) {
      console.error(err);
      // Rollback
      setAnnouncements(originalAnnouncements);
      showToast("Failed to delete announcement. Rolled back.", "error");
    }
  };

  // Filter and search logic
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && ann.active) ||
      (statusFilter === "inactive" && !ann.active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            Manage Announcements
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Publish site announcements, core update alerts, and chapter news.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Announcement
        </button>
      </div>

      {/* Controls: Search and filter tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        </div>

        <div className="flex bg-zinc-950 border border-zinc-850 rounded-lg p-0.5 text-xs select-none self-start md:self-auto">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all capitalize text-[10px] ${
                statusFilter === tab ? "bg-zinc-900 text-zinc-100 border border-zinc-800" : "text-zinc-500 hover:text-zinc-355"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid display */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : error ? (
        <CMSErrorState message={error} onRetry={() => loadAnnouncements()} />
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900/50 rounded-xl">
          <p className="text-xs text-zinc-550">No announcements match search query or filter.</p>
        </div>
      ) : (
        <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-900/5">
          {/* Table view (Desktop & Tablet) */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-black text-zinc-500 uppercase tracking-wider bg-zinc-950/20">
                <th className="py-3 px-4 w-40">Date</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Content</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/80 text-xs">
              {filteredAnnouncements.map((ann) => (
                <tr key={ann.id} className="hover:bg-zinc-900/20 animate-fade-in">
                  <td className="py-3.5 px-4 font-mono text-zinc-400">{ann.date}</td>
                  <td className="py-3.5 px-4 font-bold text-white max-w-[150px] truncate">{ann.title}</td>
                  <td className="py-3.5 px-4 text-zinc-400 max-w-[280px] truncate">{ann.content}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        ann.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                      }`}
                    >
                      {ann.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {canManage(ann) ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(ann)}
                            className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white transition-colors"
                            title="Edit announcement"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(ann.id)}
                            className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-455 hover:text-rose-455 transition-colors"
                            title="Delete announcement"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Card view (Mobile) */}
          <div className="md:hidden divide-y divide-zinc-900 bg-zinc-950/20">
            {filteredAnnouncements.map((ann) => (
              <div key={ann.id} className="p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-400">{ann.date}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      ann.active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                    }`}
                  >
                    {ann.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">{ann.title}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">{ann.content}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900/30">
                  {canManage(ann) ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-zinc-855 hover:border-zinc-700 text-[10px] font-bold text-zinc-455 hover:text-white transition-all cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-zinc-855 hover:border-zinc-755 hover:bg-rose-500/5 text-[10px] font-bold text-zinc-455 hover:text-rose-455 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
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
        </div>
      )}

      {/* Slide-out Panel / Dialog Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-355 p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
              {editingId ? "Edit Announcement" : "Create Announcement"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AWS Cloud Day Relaunch"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Display Date
                  </label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. June 25, 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                  Announcement Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide details about what, when, and how students can participate..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Learn More"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                    Destination URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-amber-500/35"
                />
                <label htmlFor="activeCheck" className="text-xs text-zinc-350 cursor-pointer font-semibold">
                  Publish Active (Make visible immediately in the header banner)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-900 text-zinc-450 hover:text-zinc-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingId ? "Update Announcement" : "Save Announcement"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsoleAnnouncementsWrapped() {
  return (
    <CMSErrorBoundary>
      <ConsoleAnnouncements />
    </CMSErrorBoundary>
  );
}
