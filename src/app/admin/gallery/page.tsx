"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { MediaPicker } from "@/components/console/MediaPicker";
import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { getLocalEvents } from "@/data/events";
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
} from "lucide-react";

interface ConsoleGalleryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "events" | "workshops" | "labs" | "community" | "celebrations";
  imageUrl: string;
  placeholderColor?: string;
}

export default function ConsoleGallery() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Lists and filters
  const [items, setItems] = useState<ConsoleGalleryItem[]>([]);
  const [completedEventsCount, setCompletedEventsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ConsoleGalleryItem["category"]>("workshops");
  const [imageUrl, setImageUrl] = useState("");
  const [placeholderColor, setPlaceholderColor] = useState("orange");

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const isVideo = (url: string) => {
    if (!url) return false;
    return /\.(mp4|webm|mov|avi|mkv|ogg)($|\?)/i.test(url);
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const [galleryRes, eventsRes] = await Promise.all([
          supabase
            .from("gallery_images")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("events")
            .select("status")
            .eq("status", "completed")
        ]);

        if (galleryRes.error) throw galleryRes.error;

        const mapped = (galleryRes.data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          date: d.date,
          description: d.description,
          category: d.category,
          imageUrl: d.image_url || "",
          placeholderColor: d.placeholder_color || "orange",
        }));
        setItems(mapped);

        if (eventsRes.data) {
          setCompletedEventsCount(eventsRes.data.length);
        }
      } else {
        const stored = localStorage.getItem("aws_sbg_gallery");
        if (stored) {
          setItems(JSON.parse(stored));
        } else {
          setItems([]);
        }

        const storedEvents = localStorage.getItem("aws_sbg_events");
        if (storedEvents) {
          const localEvents = JSON.parse(storedEvents);
          setCompletedEventsCount(localEvents.filter((e: any) => e.status === "completed").length);
        } else {
          const localEvents = getLocalEvents();
          setCompletedEventsCount(localEvents.filter((e: any) => e.status === "completed").length);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error loading gallery images", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenEdit = (item: ConsoleGalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDate(item.date);
    setDescription(item.description);
    setCategory(item.category);
    setImageUrl(item.imageUrl);
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

    try {
      const payload: Omit<ConsoleGalleryItem, "id"> = {
        title,
        date,
        description,
        category,
        imageUrl,
        placeholderColor,
      };

      if (isSupabaseConfigured && supabase) {
        // Double-check check-constraint mapping for Category ('events', 'workshops', 'labs')
        let dbCategory = category;
        if (category === "community" || category === "celebrations") {
          dbCategory = "events";
        }

        const dbRow = {
          title: payload.title,
          date: payload.date,
          description: payload.description,
          category: dbCategory,
          placeholder_color: payload.placeholderColor,
          image_url: payload.imageUrl,
        };

        if (editingId) {
          const { error } = await supabase.from("gallery_images").update(dbRow).eq("id", editingId);
          if (error) throw error;
          showToast("Gallery image updated successfully!");
        } else {
          const { error } = await supabase.from("gallery_images").insert([dbRow]);
          if (error) throw error;
          showToast("Gallery image published successfully!");
        }
      } else {
        // Sandbox mode
        let list = [...items];
        if (editingId) {
          list = list.map((item) => (item.id === editingId ? { ...item, ...payload } : item));
          showToast("Gallery image updated in sandbox.");
        } else {
          list.unshift({
            id: Math.random().toString(36).substring(2, 9),
            ...payload,
          });
          showToast("Gallery image published in sandbox.");
        }
        localStorage.setItem("aws_sbg_gallery", JSON.stringify(list));
      }
      setIsModalOpen(false);
      await loadGallery();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save gallery image.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("gallery_images").delete().eq("id", id);
        if (error) throw error;
        showToast("Gallery image deleted.");
      } else {
        const list = items.filter((item) => item.id !== id);
        localStorage.setItem("aws_sbg_gallery", JSON.stringify(list));
        showToast("Gallery image deleted from sandbox.");
      }
      await loadGallery();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete gallery image", "error");
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
              onClick={() => setCategoryFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all capitalize text-[10px] ${
                categoryFilter === tab ? "bg-zinc-900 text-zinc-100 border border-zinc-800" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-5 w-5 text-amber-500 animate-spin" />
        </div>
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
                <div className="h-40 relative bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-905">
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
                  <p className="text-xs text-zinc-450 line-clamp-2 leading-relaxed">{item.description}</p>
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
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-455 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
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
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-350 p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
              {editingId ? "Edit Image Details" : "Add Image to Gallery"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
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
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
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
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ConsoleGalleryItem["category"])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  >
                    <option value="workshops" className="bg-zinc-950">Workshops</option>
                    <option value="events" className="bg-zinc-950">Events</option>
                    <option value="labs" className="bg-zinc-950">Labs</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Fallback Placeholder Color Theme *
                  </label>
                  <select
                    value={placeholderColor}
                    onChange={(e) => setPlaceholderColor(e.target.value)}
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
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
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
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
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
