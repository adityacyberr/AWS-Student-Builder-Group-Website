"use client";

import React, { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { useAuth } from "@/context/AuthContext";
import { getSpeakers, saveSpeaker, deleteSpeaker, getEvents, CMSSpeaker } from "@/lib/cms";
import { subscribeCmsUpdates } from "@/lib/cmsEvents";
import { CMSErrorBoundary } from "@/components/console/CMSErrorBoundary";
import {
  Mic,
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
  Link as LinkIcon,
} from "lucide-react";

function ConsoleSpeakers() {
  const { user, profile, isSuperAdmin, canManage } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lists and filters
  const [speakers, setSpeakers] = useState<CMSSpeaker[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "non-featured">("all");

  // Add/Edit Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [achievementsInput, setAchievementsInput] = useState(""); // Comma separated
  const [quote, setQuote] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [eventId, setEventId] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  const [initialValues, setInitialValues] = useState<{
    name: string;
    title: string;
    bio: string;
    imageUrl: string;
    achievementsInput: string;
    quote: string;
    isFeatured: boolean;
    sortOrder: number;
    eventId: string;
    linkedin: string;
    twitter: string;
    website: string;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [speakersData, eventsData] = await Promise.all([
        getSpeakers(),
        getEvents(),
      ]);
      setSpeakers(speakersData);
      setEventsList(eventsData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load speakers. Please check your network connection.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Centralized update subscriber
    const unsubscribe = subscribeCmsUpdates("speakers", () => {
      loadData(true);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setTitle("");
    setBio("");
    setImageUrl("");
    setAchievementsInput("");
    setQuote("");
    setIsFeatured(false);
    setSortOrder(0);
    setEventId("");
    setLinkedin("");
    setTwitter("");
    setWebsite("");
    
    const initial = {
      name: "",
      title: "",
      bio: "",
      imageUrl: "",
      achievementsInput: "",
      quote: "",
      isFeatured: false,
      sortOrder: 0,
      eventId: "",
      linkedin: "",
      twitter: "",
      website: "",
    };
    setInitialValues(initial);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (speaker: CMSSpeaker) => {
    const initial = {
      name: speaker.name,
      title: speaker.title,
      bio: speaker.bio,
      imageUrl: speaker.imageUrl || "",
      achievementsInput: (speaker.achievements || []).join(", "),
      quote: speaker.quote || "",
      isFeatured: speaker.isFeatured,
      sortOrder: speaker.sortOrder || 0,
      eventId: speaker.eventId || "",
      linkedin: speaker.socialLinks?.linkedin || "",
      twitter: speaker.socialLinks?.twitter || "",
      website: speaker.socialLinks?.website || "",
    };
    setEditingId(speaker.id);
    setName(initial.name);
    setTitle(initial.title);
    setBio(initial.bio);
    setImageUrl(initial.imageUrl);
    setAchievementsInput(initial.achievementsInput);
    setQuote(initial.quote);
    setIsFeatured(initial.isFeatured);
    setSortOrder(initial.sortOrder);
    setEventId(initial.eventId);
    setLinkedin(initial.linkedin);
    setTwitter(initial.twitter);
    setWebsite(initial.website);
    setInitialValues(initial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (initialValues) {
      const hasChanges =
        name !== initialValues.name ||
        title !== initialValues.title ||
        bio !== initialValues.bio ||
        imageUrl !== initialValues.imageUrl ||
        achievementsInput !== initialValues.achievementsInput ||
        quote !== initialValues.quote ||
        isFeatured !== initialValues.isFeatured ||
        sortOrder !== initialValues.sortOrder ||
        eventId !== initialValues.eventId ||
        linkedin !== initialValues.linkedin ||
        twitter !== initialValues.twitter ||
        website !== initialValues.website;

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
    const trimmedName = name.trim();
    const trimmedTitle = title.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName || !trimmedTitle || !trimmedBio) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);

    const achievements = achievementsInput
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const payload = {
      name: trimmedName,
      title: trimmedTitle,
      bio: trimmedBio,
      imageUrl: imageUrl.trim() || undefined,
      achievements,
      socialLinks: {
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
        website: website.trim() || undefined,
      },
      eventId: eventId || undefined,
      isFeatured,
      sortOrder: Number(sortOrder) || 0,
      quote: quote.trim() || undefined,
    };

    // Close modal immediately
    setIsModalOpen(false);

    // Snapshot for rollback
    const originalSpeakers = [...speakers];
    const tempId = editingId || `optimistic-${Date.now()}`;
    const optimisticItem: CMSSpeaker = {
      id: tempId,
      ...payload,
      ownerUserId: user?.id || "",
      createdBy: editingId ? (speakers.find((s) => s.id === editingId)?.createdBy || "") : (user?.id || ""),
      updatedBy: user?.id || "",
    };

    // Optimistic UI update
    if (editingId) {
      setSpeakers(speakers.map((s) => (s.id === editingId ? optimisticItem : s)));
    } else {
      setSpeakers([optimisticItem, ...speakers]);
    }

    try {
      const saved = await saveSpeaker(payload, editingId || undefined, user?.id || null, profile?.name || null);
      // Replace optimistic entry with database entry
      setSpeakers((prev) => prev.map((s) => (s.id === tempId ? saved : s)));
      showToast(editingId ? "✅ Speaker updated successfully" : "✅ Speaker saved successfully");
    } catch (err: any) {
      console.error("Error saving speaker:", err.message || err);
      // Rollback
      setSpeakers(originalSpeakers);
      showToast(editingId ? "❌ Failed to update speaker. Rolled back." : "❌ Failed to save speaker. Rolled back.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this speaker? This action cannot be undone.")) {
      return;
    }

    // Snapshot for rollback
    const originalSpeakers = [...speakers];

    // Optimistic UI update
    setSpeakers(speakers.filter((s) => s.id !== id));

    try {
      await deleteSpeaker(id, user?.id || null, profile?.name || null);
      showToast("🗑️ Speaker deleted successfully");
    } catch (err: any) {
      console.error("Error deleting speaker:", err.message || err);
      // Rollback
      setSpeakers(originalSpeakers);
      showToast("❌ Failed to delete speaker. Rolled back.", "error");
    }
  };

  // Filter list
  const filteredSpeakers = speakers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (featuredFilter === "featured") return matchesSearch && s.isFeatured;
    if (featuredFilter === "non-featured") return matchesSearch && !s.isFeatured;
    return matchesSearch;
  });

  return (
    <CMSErrorBoundary>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Mic className="h-6 w-6 text-purple-500" />
              Speakers List
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage the guest speakers highlighted on the website homepage.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Speaker
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-grow max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search speakers by name, title, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "featured", "non-featured"] as const).map((filterOpt) => (
              <button
                key={filterOpt}
                onClick={() => setFeaturedFilter(filterOpt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                  featuredFilter === filterOpt
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {filterOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6">Speaker Details</th>
                  <th className="py-4 px-6">Achievements</th>
                  <th className="py-4 px-6 text-center">Featured</th>
                  <th className="py-4 px-6 text-center">Order</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredSpeakers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No speakers found. Click "Add Speaker" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSpeakers.map((speaker) => (
                    <tr key={speaker.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500/10 border border-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                            {speaker.imageUrl ? (
                              <img src={speaker.imageUrl} alt={speaker.name} className="w-full h-full object-cover" />
                            ) : (
                              speaker.name.split(" ").map(n => n[0]).join("")
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{speaker.name}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{speaker.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {speaker.achievements && speaker.achievements.map((ach, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 truncate max-w-[120px]">
                              {ach}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2 py-1.5 rounded-full text-xs font-bold ${
                          speaker.isFeatured 
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                          {speaker.isFeatured ? "Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-medium">
                        {speaker.sortOrder}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage(speaker) ? (
                            <>
                              <button
                                onClick={() => handleOpenEdit(speaker)}
                                className="p-1.5 text-slate-400 hover:text-purple-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Speaker"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(speaker.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Delete Speaker"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No access</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Editor Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Guest Speaker" : "Add Guest Speaker"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bhoomi Raut"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title/Role *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. AWS Community Builder | AWS 3X Certified"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio *</label>
                  <textarea
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Brief professional background/biography..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image URL (WebP/PNG)</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="e.g. /events/bhoomi-raut.png"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quote (Optional)</label>
                    <input
                      type="text"
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="e.g. Building the future with cloud, code..."
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Badges / Achievements (Comma separated)</label>
                  <input
                    type="text"
                    value={achievementsInput}
                    onChange={(e) => setAchievementsInput(e.target.value)}
                    placeholder="AWS Community Builder, AWS 3X Certified, AWS UG Pune"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated Event</label>
                    <select
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    >
                      <option value="">None / Independent</option>
                      {eventsList.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col justify-end pb-1.5 space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Settings</label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <span>Feature on Homepage</span>
                    </label>
                  </div>
                </div>

                {/* Social Links Sub-Group */}
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="h-3 w-3" />
                    Social Media Profiles
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">LinkedIn URL</label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Twitter/X URL</label>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Website URL</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Save Speaker
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast alerts */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </CMSErrorBoundary>
  );
}

export default function SpeakersPage() {
  return <ConsoleSpeakers />;
}
