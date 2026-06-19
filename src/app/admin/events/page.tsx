"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { MediaPicker } from "@/components/console/MediaPicker";
import { useAuth } from "@/context/AuthContext";
import { getEvents, saveEvent, deleteEvent, CMSEvent } from "@/lib/cms";
import {
  Calendar,
  Plus,
  Search,
  Loader,
  Edit2,
  Trash2,
  X,
  Save,
  Link as LinkIcon,
  MapPin,
  Clock,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function ConsoleEvents() {
  const { user, isSuperAdmin, isOwner, canManage } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Lists and filters
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">("all");

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<CMSEvent["type"]>("Workshop");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [status, setStatus] = useState<CMSEvent["status"]>("upcoming");
  const [coverPlaceholderColor, setCoverPlaceholderColor] = useState<CMSEvent["coverPlaceholderColor"]>("orange");
  const [imageUrl, setImageUrl] = useState("");

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error(err);
      showToast("Error loading events", "error");
    } finally {
      setLoading(false);
    }
  };

  // Generate slug automatically
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingId) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDate("");
    setTime("TBA");
    setType("Workshop");
    setLocation("RIMT University Campus");
    setDescription("");
    setLongDescription("");
    setRegistrationLink("https://www.meetup.com/aws-sbg-at-rimt-university/");
    setStatus("upcoming");
    setCoverPlaceholderColor("orange");
    setImageUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: CMSEvent) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setSlug(ev.slug);
    setDate(ev.date);
    setTime(ev.time || "");
    setType(ev.type);
    setLocation(ev.location);
    setDescription(ev.description);
    setLongDescription(ev.longDescription || "");
    setRegistrationLink(ev.registrationLink);
    setStatus(ev.status);
    setCoverPlaceholderColor(ev.coverPlaceholderColor);
    setImageUrl(ev.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !date || !location || !description) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);

    try {
      const payload: Omit<CMSEvent, "id" | "ownerUserId" | "createdBy" | "updatedBy"> = {
        title,
        slug,
        date,
        time,
        type,
        location,
        description,
        longDescription,
        registrationLink,
        status,
        coverPlaceholderColor,
        imageUrl,
      };

      await saveEvent(editingId, payload, user?.id || null);
      showToast(editingId ? "Event updated successfully!" : "Event created successfully!");
      setIsModalOpen(false);
      await loadEvents();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save event.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action is irreversible.")) return;

    try {
      await deleteEvent(id);
      showToast("Event deleted successfully.");
      await loadEvents();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete event.", "error");
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "upcoming" && ev.status === "upcoming") ||
      (statusFilter === "completed" && ev.status === "completed");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Manage Events
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Create, update, and manage bootcamps, workshops, hackathons, and webinars.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search events by title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        </div>

        <div className="flex bg-zinc-950 border border-zinc-850 rounded-lg p-0.5 text-xs select-none self-start md:self-auto">
          {(["all", "upcoming", "completed"] as const).map((tab) => (
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

      {/* Events Grid list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-5 w-5 text-amber-500 animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900/50 rounded-xl">
          <p className="text-xs text-zinc-550">No events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400">
                    {ev.type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      ev.status === "upcoming"
                        ? "bg-amber-500/10 text-amber-450 border border-amber-500/10"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-black text-white leading-tight">{ev.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wide">{ev.slug}</p>
                </div>

                <p className="text-xs text-zinc-450 line-clamp-2 leading-relaxed">{ev.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-2.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-zinc-550 flex-shrink-0" />
                    <span className="truncate">{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-550 flex-shrink-0" />
                    <span className="truncate">{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <MapPin className="h-3 w-3 text-zinc-550 flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900/80 pt-3">
                <a
                  href={ev.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  Reg Link
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>

                <div className="flex gap-1">
                  {canManage(ev) ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-450 hover:text-rose-455 transition-colors"
                        title="Delete Event"
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
          <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-350 p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
              {editingId ? "Edit Event details" : "Create New Event"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. AWS Cloud Computing Workshop"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. aws-cloud-computing-workshop"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Event Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. July 25, 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Time / Hours
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 12:30 PM"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Event Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CMSEvent["type"])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  >
                    {["Workshop", "Bootcamp", "Meetup", "Webinar", "Hackathon", "Celebration", "Community Event", "Other"].map((t) => (
                      <option key={t} value={t} className="bg-zinc-950">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. School of Computing Lab 1"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Registration URL
                  </label>
                  <input
                    type="url"
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CMSEvent["status"])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  >
                    <option value="upcoming" className="bg-zinc-950">Upcoming</option>
                    <option value="completed" className="bg-zinc-950">Completed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Cover Color Theme *
                  </label>
                  <select
                    value={coverPlaceholderColor}
                    onChange={(e) => setCoverPlaceholderColor(e.target.value as CMSEvent["coverPlaceholderColor"])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  >
                    {["orange", "blue", "purple", "mint", "amber"].map((c) => (
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
                  folder="events"
                  label="Upload Event Banner or Cover Image"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                  Short Description (Card Summary) *
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keep it to 2 lines max. Displays on lists."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                  Long Description (Full Agenda details)
                </label>
                <textarea
                  rows={4}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Detail the event outline, prerequisites, guest speakers, key take-aways..."
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
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
