"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { MediaPicker } from "@/components/console/MediaPicker";
import { useAuth } from "@/context/AuthContext";
import { getEvents, saveEvent, deleteEvent, checkSlugAvailable, CMSEvent } from "@/lib/cms";
import { subscribeCmsUpdates } from "@/lib/cmsEvents";
import { SkeletonCard } from "@/components/console/SkeletonLoader";
import { CMSErrorBoundary, CMSErrorState } from "@/components/console/CMSErrorBoundary";
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

function ConsoleEvents() {
  const { user, profile, isSuperAdmin, isOwner, canManage } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  
  // Slug verification state
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "unique" | "taken">("idle");

  const [initialValues, setInitialValues] = useState<{
    title: string;
    slug: string;
    date: string;
    time: string;
    type: CMSEvent["type"];
    location: string;
    description: string;
    longDescription: string;
    registrationLink: string;
    status: CMSEvent["status"];
    coverPlaceholderColor: CMSEvent["coverPlaceholderColor"];
    imageUrl: string;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadEvents = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load events. Please check your network connection.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // Subscribe to CMS updates centrally
    const unsubscribe = subscribeCmsUpdates("events", () => {
      loadEvents(true);
    });
    return () => unsubscribe();
  }, []);

  // Slug auto-generation & validation
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

  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSlugStatus("checking");
      try {
        const available = await checkSlugAvailable(slug, editingId || undefined);
        setSlugStatus(available ? "unique" : "taken");
      } catch (err) {
        console.error(err);
        setSlugStatus("idle");
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [slug, editingId]);

  const handleOpenAdd = () => {
    const defaultTime = "TBA";
    const defaultLocation = "RIMT University Campus";
    const defaultRegLink = "https://www.meetup.com/aws-sbg-at-rimt-university/";
    const defaultType = "Workshop";
    const defaultStatus = "upcoming";
    const defaultCover = "orange";

    setEditingId(null);
    setTitle("");
    setSlug("");
    setDate("");
    setTime(defaultTime);
    setType(defaultType);
    setLocation(defaultLocation);
    setDescription("");
    setLongDescription("");
    setRegistrationLink(defaultRegLink);
    setStatus(defaultStatus);
    setCoverPlaceholderColor(defaultCover);
    setImageUrl("");

    setInitialValues({
      title: "",
      slug: "",
      date: "",
      time: defaultTime,
      type: defaultType,
      location: defaultLocation,
      description: "",
      longDescription: "",
      registrationLink: defaultRegLink,
      status: defaultStatus,
      coverPlaceholderColor: defaultCover,
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: CMSEvent) => {
    const initial = {
      title: ev.title,
      slug: ev.slug,
      date: ev.date,
      time: ev.time || "",
      type: ev.type,
      location: ev.location,
      description: ev.description,
      longDescription: ev.longDescription || "",
      registrationLink: ev.registrationLink,
      status: ev.status,
      coverPlaceholderColor: ev.coverPlaceholderColor,
      imageUrl: ev.imageUrl || "",
    };

    setEditingId(ev.id);
    setTitle(initial.title);
    setSlug(initial.slug);
    setDate(initial.date);
    setTime(initial.time);
    setType(initial.type);
    setLocation(initial.location);
    setDescription(initial.description);
    setLongDescription(initial.longDescription);
    setRegistrationLink(initial.registrationLink);
    setStatus(initial.status);
    setCoverPlaceholderColor(initial.coverPlaceholderColor);
    setImageUrl(initial.imageUrl);

    setInitialValues(initial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (initialValues) {
      const hasChanges =
        title !== initialValues.title ||
        slug !== initialValues.slug ||
        date !== initialValues.date ||
        time !== initialValues.time ||
        type !== initialValues.type ||
        location !== initialValues.location ||
        description !== initialValues.description ||
        longDescription !== initialValues.longDescription ||
        registrationLink !== initialValues.registrationLink ||
        status !== initialValues.status ||
        coverPlaceholderColor !== initialValues.coverPlaceholderColor ||
        imageUrl !== initialValues.imageUrl;

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
    if (imageUploading) {
      showToast("Please wait for the banner image to finish uploading.", "error");
      return;
    }
    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    const trimmedDate = date.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedSlug || !trimmedDate || !trimmedLocation || !trimmedDescription) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);

    try {
      // 1. Verify slug uniqueness
      const isUnique = await checkSlugAvailable(trimmedSlug, editingId || undefined);
      if (!isUnique) {
        showToast(`Slug '${trimmedSlug}' is already in use. Please choose a different slug.`, "error");
        setSaving(false);
        return;
      }

      const payload: Omit<CMSEvent, "id" | "ownerUserId" | "createdBy" | "updatedBy"> = {
        title: trimmedTitle,
        slug: trimmedSlug,
        date: trimmedDate,
        time: time.trim(),
        type,
        location: trimmedLocation,
        description: trimmedDescription,
        longDescription: longDescription.trim(),
        registrationLink: registrationLink.trim(),
        status,
        coverPlaceholderColor,
        imageUrl: imageUrl.trim() || undefined,
      };

      // Close modal immediately for optimistic feedback
      setIsModalOpen(false);

      // Snapshot for rollback
      const originalEvents = [...events];
      const tempId = editingId || `optimistic-${Date.now()}`;
      const optimisticItem: CMSEvent = {
        id: tempId,
        ...payload,
        ownerUserId: user?.id || "",
        createdBy: editingId ? (events.find((e) => e.id === editingId)?.createdBy || "") : (user?.id || ""),
        updatedBy: user?.id || "",
      };

      // Optimistic UI update
      if (editingId) {
        setEvents(events.map((e) => (e.id === editingId ? optimisticItem : e)));
      } else {
        setEvents([optimisticItem, ...events]);
      }

      // Perform actual DB save
      try {
        const saved = await saveEvent(editingId, payload, user?.id || null, profile?.name || null);
        // Replace optimistic entry with real database entry
        setEvents((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
        showToast(editingId ? "✅ Event updated successfully" : "✅ Event saved successfully");
        router.refresh();
      } catch (dbErr) {
        // Rollback on failure
        setEvents(originalEvents);
        throw dbErr;
      }
    } catch (err: any) {
      console.error("Error saving event:", err.message || err);
      showToast(editingId ? "❌ Failed to update event. Rolled back." : "❌ Failed to save event. Rolled back.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action is irreversible.")) return;

    const originalEvents = [...events];
    // Optimistic UI delete
    setEvents(events.filter((e) => e.id !== id));

    try {
      await deleteEvent(id, user?.id || null, profile?.name || null);
      showToast("Event deleted successfully.");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      // Rollback
      setEvents(originalEvents);
      showToast("Failed to delete event. Rolled back.", "error");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <CMSErrorState message={error} onRetry={() => loadEvents()} />
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
                  <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 line-clamp-1">
                    {ev.title}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-550">slug: {ev.slug}</p>
                  <p className="text-[10px] text-zinc-450 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-2.5 text-[10px] text-zinc-450">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-zinc-550" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-zinc-550" />
                    <span>{ev.time || "TBA"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="h-3 w-3 text-zinc-550 shrink-0" />
                    <span className="line-clamp-1">{ev.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-900">
                {ev.registrationLink ? (
                  <a
                    href={ev.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 font-bold"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Registration Link
                  </a>
                ) : (
                  <span className="text-[9px] text-zinc-600">No external link</span>
                )}

                {canManage(ev) ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      disabled={saving}
                      className="p-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Edit event"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={saving}
                      className="p-1.5 rounded-lg border border-zinc-850 hover:border-red-950 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] text-zinc-650 flex items-center gap-1 select-none">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm select-none overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative my-8">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-355 p-1"
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                      URL Slug *
                    </label>
                    <span className="text-[9px] font-semibold flex items-center gap-1">
                      {slugStatus === "checking" && (
                        <span className="text-zinc-500 flex items-center gap-1 animate-pulse">
                          <Loader className="h-2.5 w-2.5 animate-spin" /> Checking
                        </span>
                      )}
                      {slugStatus === "unique" && (
                        <span className="text-emerald-500 flex items-center gap-1">
                          ✓ Available
                        </span>
                      )}
                      {slugStatus === "taken" && (
                        <span className="text-rose-500 flex items-center gap-1 font-bold">
                          ✗ Taken
                        </span>
                      )}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
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
                  onUploadingStateChange={setImageUploading}
                  onUploadSuccess={() => showToast("Banner uploaded successfully.", "success")}
                  onUploadError={() => showToast("Failed to upload banner image.", "error")}
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
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || imageUploading || slugStatus === "taken"}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : imageUploading ? (
                    <>
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading Banner...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingId ? "Update Event" : "Save Event"}</span>
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

export default function ConsoleEventsWrapped() {
  return (
    <CMSErrorBoundary>
      <ConsoleEvents />
    </CMSErrorBoundary>
  );
}
