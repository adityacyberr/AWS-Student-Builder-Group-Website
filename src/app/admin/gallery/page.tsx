"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { MediaPicker } from "@/components/console/MediaPicker";
import { useAuth } from "@/context/AuthContext";
import { getEvents } from "@/lib/cms";
import { getGalleryImages, saveGalleryImage, deleteGalleryImage, CMSGalleryItem } from "@/lib/cms";
import { subscribeCmsUpdates } from "@/lib/cmsEvents";
import { SkeletonCard } from "@/components/console/SkeletonLoader";
import { CMSErrorBoundary, CMSErrorState } from "@/components/console/CMSErrorBoundary";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Loader,
  Edit2,
  Trash2,
  X,
  Save,
  Calendar,
  ExternalLink,
  Shield,
} from "lucide-react";

function ConsoleGallery() {
  const { user, profile, isSuperAdmin, canManage } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lists and filters
  const [items, setItems] = useState<CMSGalleryItem[]>([]);
  const [completedEventsCount, setCompletedEventsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CMSGalleryItem["category"]>("all");

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CMSGalleryItem["category"]>("workshops");
  const [imageUrl, setImageUrl] = useState("");
  const [placeholderColor, setPlaceholderColor] = useState<CMSGalleryItem["placeholderColor"]>("orange");

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    return /\.(mp4|webm|mov|avi|mkv|ogg)($|\?)/i.test(url);
  };

  const loadGallery = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [galleryData, eventsData] = await Promise.all([
        getGalleryImages(),
        getEvents(),
      ]);

      setItems(galleryData);
      setCompletedEventsCount(eventsData.filter((e) => e.status === "completed").length);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load gallery images. Please check your network connection.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
    // Centrally subscribe to CMS updates
    const unsubscribe = subscribeCmsUpdates("gallery_images", () => {
      loadGallery(true);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("");
    setDate(new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
    setDescription("");
    setCategory("workshops");
    setImageUrl("");
    setPlaceholderColor("orange");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CMSGalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDate(item.date);
    setDescription(item.description);
    setCategory(item.category);
    setImageUrl(item.imageUrl || "");
    setPlaceholderColor(item.placeholderColor || "orange");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !description || !imageUrl) {
      showToast("Please fill all required fields, including uploading an image.", "error");
      return;
    }
    setSaving(true);

    const payload: Omit<CMSGalleryItem, "id" | "ownerUserId" | "createdBy" | "updatedBy"> = {
      title,
      date,
      description,
      category,
      imageUrl,
      placeholderColor,
      participants: 0,
      location: "DRI Sandbox, RIMT University",
      photoCount: 1,
    };

    // Close modal immediately
    setIsModalOpen(false);

    // Snapshot for rollback
    const originalItems = [...items];
    const tempId = editingId || `optimistic-${Date.now()}`;
    const optimisticItem: CMSGalleryItem = {
      id: tempId,
      ...payload,
      ownerUserId: user?.id || "",
      createdBy: editingId ? (items.find((i) => i.id === editingId)?.createdBy || "") : (user?.id || ""),
      updatedBy: user?.id || "",
    };

    // Optimistic state update
    if (editingId) {
      setItems(items.map((i) => (i.id === editingId ? optimisticItem : i)));
    } else {
      setItems([optimisticItem, ...items]);
    }

    try {
      const saved = await saveGalleryImage(editingId, payload, user?.id || null, profile?.name || null);
      // Replace optimistic entry with DB output
      setItems((prev) => prev.map((i) => (i.id === tempId ? saved : i)));
      showToast(editingId ? "Gallery image updated successfully!" : "Gallery image published successfully!");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      // Rollback
      setItems(originalItems);
      showToast(err.message || "Failed to save gallery image. Rolled back.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;

    // Snapshot for rollback
    const originalItems = [...items];
    // Optimistic UI state delete
    setItems(items.filter((i) => i.id !== id));

    try {
      await deleteGalleryImage(id, user?.id || null, profile?.name || null);
      showToast("Gallery image deleted.");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      // Rollback
      setItems(originalItems);
      showToast("Failed to delete gallery image. Rolled back.", "error");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-500" />
            Gallery Images
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Upload and caption workshop captures, hackathon memories, and laboratory setups.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Gallery Image
        </button>
      </div>

      {/* Dynamic Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900/10 border border-zinc-900 p-4 rounded-xl">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block select-none">Total Photos</span>
          <p className="text-lg font-black text-white leading-none mt-1">{items.filter(item => !isVideo(item.imageUrl)).length}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block select-none">Total Videos</span>
          <p className="text-lg font-black text-white leading-none mt-1">{items.filter(item => isVideo(item.imageUrl)).length}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block select-none">Events Covered</span>
          <p className="text-lg font-black text-white leading-none mt-1">{items.length === 0 ? 0 : completedEventsCount}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block select-none">Total Memories</span>
          <p className="text-lg font-black text-white leading-none mt-1">{items.length}</p>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search gallery by title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        </div>

        <div className="flex bg-zinc-950 border border-zinc-850 rounded-lg p-0.5 text-xs select-none self-start md:self-auto">
          {["all", "workshops", "events", "labs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCategoryFilter(tab as any)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all capitalize text-[10px] ${
                categoryFilter === tab ? "bg-zinc-900 text-zinc-100 border border-zinc-800" : "text-zinc-500 hover:text-zinc-355"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <CMSErrorState message={error} onRetry={() => loadGallery()} />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900/50 rounded-xl">
          <p className="text-xs text-zinc-550">No gallery images found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-900 bg-zinc-950/20 rounded-xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-40 relative bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-850">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-zinc-700" />
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] font-black uppercase bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm px-2 py-0.5 rounded text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xs font-black text-white truncate max-w-[170px]">{item.title}</h3>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono flex-shrink-0">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-455 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 flex justify-between items-center">
                {item.imageUrl && (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-zinc-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
                  >
                    Open Full
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}

                <div className="flex justify-end gap-1.5 ml-auto">
                  {canManage(item) ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white transition-colors"
                        title="Edit Image"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-455 hover:text-rose-455 transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-medium px-2 py-1 flex items-center gap-1 bg-zinc-900/40 rounded border border-zinc-900/60">
                      <Shield className="h-3 w-3 text-zinc-650" />
                      Read-only
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm select-none overflow-y-auto">
          <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-355 p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
              {editingId ? "Edit Image Details" : "Add Image to Gallery"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                    Image Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Inaugural Meetup Session"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                    Session Date *
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CMSGalleryItem["category"])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  >
                    <option value="workshops" className="bg-zinc-950">Workshops</option>
                    <option value="events" className="bg-zinc-950">Events</option>
                    <option value="labs" className="bg-zinc-950">Labs</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                    Fallback Placeholder Color Theme *
                  </label>
                  <select
                    value={placeholderColor}
                    onChange={(e) => setPlaceholderColor(e.target.value as CMSGalleryItem["placeholderColor"])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  >
                    {["orange", "blue", "purple", "mint"].map((c) => (
                      <option key={c} value={c} className="bg-zinc-950 capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <MediaPicker
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="gallery"
                  label="Upload Gallery Photo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                  Captioned Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide brief context on what is happening in this photograph..."
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
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-955 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Publish Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsoleGalleryWrapped() {
  return (
    <CMSErrorBoundary>
      <ConsoleGallery />
    </CMSErrorBoundary>
  );
}
