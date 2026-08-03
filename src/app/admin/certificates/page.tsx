"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Toast, ToastType } from "@/components/console/Toast";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Award,
  Plus,
  Search,
  Loader,
  Edit2,
  Trash2,
  X,
  Save,
  Upload,
  Download,
  Eye,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Clock,
  GripVertical,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ── Types ── */
interface CertEvent {
  id: string;
  title: string;
  slug: string;
  template_url: string | null;
  name_x: number;
  name_y: number;
  font_family: string;
  font_size: number;
  font_weight: string;
  text_color: string;
  text_align: "left" | "center" | "right";
  is_published: boolean;
  created_at: string;
  participantCount?: number;
  downloadCount?: number;
}

interface Participant {
  id: string;
  event_id: string;
  roll_number: string;
  participant_name: string;
  created_at: string;
}

interface DownloadLog {
  id: string;
  participant_name: string;
  roll_number: string;
  downloaded_at: string;
}

interface ImportRow {
  rollNumber: string;
  participantName: string;
  valid: boolean;
  error?: string;
}

/* ── Page Component ── */
function AdminCertificates() {
  const { isSuperAdmin } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(true);

  // Events
  const [events, setEvents] = useState<CertEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CertEvent | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CertEvent | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [saving, setSaving] = useState(false);

  // Template & positioning
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null);
  const [nameX, setNameX] = useState(50);
  const [nameY, setNameY] = useState(55);
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState("bold");
  const [textColor, setTextColor] = useState("#1a1a2e");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download logs
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Active Tab in detail view
  const [activeTab, setActiveTab] = useState<"template" | "participants" | "logs">("template");

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Load Events ── */
  const loadEvents = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
    const client = supabase;

    try {
      const { data, error } = await client
        .from("certificate_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get counts for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (ev: any) => {
          const { count: pCount } = await client
            .from("certificate_participants")
            .select("*", { count: "exact", head: true })
            .eq("event_id", ev.id);

          const { count: dCount } = await client
            .from("certificate_downloads")
            .select("*", { count: "exact", head: true })
            .eq("event_id", ev.id);

          return { ...ev, participantCount: pCount || 0, downloadCount: dCount || 0 };
        })
      );

      setEvents(eventsWithCounts);
    } catch (err) {
      console.error("Failed to load cert events:", err);
      showToast("Failed to load certificate events.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  /* ── Create / Update Event ── */
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase || !formTitle.trim() || !formSlug.trim()) return;
    setSaving(true);

    try {
      let templateUrl = editingEvent?.template_url || null;

      // Upload template if a new file is selected
      if (templateFile) {
        const ext = templateFile.name.split(".").pop() || "png";
        const fileName = `cert-templates/${formSlug}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("builder-assets")
          .upload(fileName, templateFile, { contentType: templateFile.type, upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("builder-assets")
          .getPublicUrl(fileName);

        templateUrl = urlData.publicUrl;
      }

      const payload = {
        title: formTitle.trim(),
        slug: formSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        template_url: templateUrl,
        name_x: nameX,
        name_y: nameY,
        font_family: "Amazon Ember Display",
        font_size: fontSize,
        font_weight: fontWeight,
        text_color: textColor,
        text_align: textAlign,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("certificate_events")
          .update(payload)
          .eq("id", editingEvent.id);
        if (error) throw error;
        showToast("Event updated successfully.");
      } else {
        const { error } = await supabase
          .from("certificate_events")
          .insert(payload);
        if (error) throw error;
        showToast("Event created successfully.");
      }

      closeModal();
      await loadEvents();
    } catch (err: any) {
      console.error("Save event error:", err);
      showToast(err.message || "Failed to save event.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle publish ── */
  const handleTogglePublish = async (ev: CertEvent) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("certificate_events")
        .update({ is_published: !ev.is_published })
        .eq("id", ev.id);
      if (error) throw error;
      showToast(ev.is_published ? "Event unpublished." : "Event published!");
      await loadEvents();
      if (selectedEvent?.id === ev.id) {
        setSelectedEvent({ ...ev, is_published: !ev.is_published });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to toggle publish state.", "error");
    }
  };

  /* ── Delete Event ── */
  const handleDeleteEvent = async (id: string) => {
    if (!supabase) return;
    if (!confirm("This will permanently delete the event and all its participants. Continue?")) return;

    try {
      const { error } = await supabase.from("certificate_events").delete().eq("id", id);
      if (error) throw error;
      showToast("Event deleted.");
      if (selectedEvent?.id === id) setSelectedEvent(null);
      await loadEvents();
    } catch (err: any) {
      showToast(err.message || "Failed to delete event.", "error");
    }
  };

  /* ── Load Participants ── */
  const loadParticipants = useCallback(async (eventId: string) => {
    if (!supabase) return;
    setParticipantsLoading(true);
    try {
      const { data, error } = await supabase
        .from("certificate_participants")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setParticipantsLoading(false);
    }
  }, []);

  /* ── Load Download Logs ── */
  const loadDownloadLogs = useCallback(async (eventId: string) => {
    if (!supabase) return;
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from("certificate_downloads")
        .select("id, downloaded_at, participant_id, certificate_participants!inner(participant_name, roll_number)")
        .eq("event_id", eventId)
        .order("downloaded_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const logs: DownloadLog[] = (data || []).map((d: any) => ({
        id: d.id,
        participant_name: d.certificate_participants?.participant_name || "Unknown",
        roll_number: d.certificate_participants?.roll_number || "—",
        downloaded_at: d.downloaded_at,
      }));

      setDownloadLogs(logs);
    } catch (err) {
      console.error("Failed to load download logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  /* ── Select Event ── */
  const handleSelectEvent = (ev: CertEvent) => {
    setSelectedEvent(ev);
    setActiveTab("template");
    setParticipantSearch("");
    loadParticipants(ev.id);
    loadDownloadLogs(ev.id);
    // Set template preview
    setTemplatePreviewUrl(ev.template_url || null);
    setNameX(ev.name_x);
    setNameY(ev.name_y);
    setFontSize(ev.font_size);
    setFontWeight(ev.font_weight);
    setTextColor(ev.text_color);
    setTextAlign(ev.text_align);
  };

  /* ── CSV/Excel Import ── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          processImportData(results.data);
        },
        error: () => {
          showToast("Failed to parse CSV file.", "error");
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const wb = XLSX.read(event.target?.result, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

          if (jsonData.length < 2) {
            showToast("File appears to be empty.", "error");
            return;
          }

          // Map header row
          const headers = (jsonData[0] as string[]).map((h) => h?.toString().trim().toLowerCase());
          const rollIdx = headers.findIndex((h) => h.includes("roll") || h.includes("number") || h.includes("id"));
          const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("participant"));

          if (rollIdx === -1 || nameIdx === -1) {
            showToast('Could not find "Roll Number" and "Name" columns in the file.', "error");
            return;
          }

          const rows = (jsonData as any[][]).slice(1).map((row) => ({
            rollNumber: row[rollIdx]?.toString().trim() || "",
            participantName: row[nameIdx]?.toString().trim() || "",
          }));

          processImportData(rows);
        } catch (err) {
          showToast("Failed to parse Excel file.", "error");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      showToast("Unsupported file format. Use .csv or .xlsx.", "error");
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportData = (rawData: any[]) => {
    const seen = new Set<string>();
    const rows: ImportRow[] = [];

    for (const row of rawData) {
      const rollNumber = (row.rollNumber || row["Roll Number"] || row["roll_number"] || row["Roll No"] || row["roll number"] || "").toString().trim().toUpperCase();
      const participantName = (row.participantName || row["Participant Name"] || row["participant_name"] || row["Name"] || row["name"] || "").toString().trim();

      let valid = true;
      let error: string | undefined;

      if (!rollNumber) {
        valid = false;
        error = "Missing roll number";
      } else if (!participantName) {
        valid = false;
        error = "Missing participant name";
      } else if (seen.has(rollNumber)) {
        valid = false;
        error = "Duplicate roll number";
      }

      if (rollNumber) seen.add(rollNumber);
      rows.push({ rollNumber, participantName, valid, error });
    }

    setImportRows(rows);
    setShowImportModal(true);
  };

  const handleConfirmImport = async () => {
    if (!supabase || !selectedEvent) return;
    setImporting(true);

    try {
      const validRows = importRows.filter((r) => r.valid);
      if (validRows.length === 0) {
        showToast("No valid rows to import.", "error");
        setImporting(false);
        return;
      }

      const payload = validRows.map((r) => ({
        event_id: selectedEvent.id,
        roll_number: r.rollNumber,
        participant_name: r.participantName,
      }));

      const { error } = await supabase
        .from("certificate_participants")
        .upsert(payload, { onConflict: "event_id,roll_number" });

      if (error) throw error;

      showToast(`${validRows.length} participant(s) imported successfully.`);
      setShowImportModal(false);
      setImportRows([]);
      await loadParticipants(selectedEvent.id);
      await loadEvents();
    } catch (err: any) {
      showToast(err.message || "Import failed.", "error");
    } finally {
      setImporting(false);
    }
  };

  /* ── Delete Participant ── */
  const handleDeleteParticipant = async (id: string) => {
    if (!supabase || !selectedEvent) return;
    try {
      const { error } = await supabase.from("certificate_participants").delete().eq("id", id);
      if (error) throw error;
      showToast("Participant removed.");
      await loadParticipants(selectedEvent.id);
      await loadEvents();
    } catch (err: any) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  /* ── Save template positioning ── */
  const handleSavePositioning = async () => {
    if (!supabase || !selectedEvent) return;
    setSaving(true);
    try {
      let templateUrl = selectedEvent.template_url;

      if (templateFile) {
        const ext = templateFile.name.split(".").pop() || "png";
        const fileName = `cert-templates/${selectedEvent.slug}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("builder-assets")
          .upload(fileName, templateFile, { contentType: templateFile.type, upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("builder-assets").getPublicUrl(fileName);
        templateUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("certificate_events")
        .update({
          template_url: templateUrl,
          name_x: nameX,
          name_y: nameY,
          font_size: fontSize,
          font_weight: fontWeight,
          text_color: textColor,
          text_align: textAlign,
        })
        .eq("id", selectedEvent.id);

      if (error) throw error;
      showToast("Template settings saved!");
      setTemplateFile(null);
      await loadEvents();
    } catch (err: any) {
      showToast(err.message || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Modal helpers ── */
  const openCreateModal = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormSlug("");
    setTemplateFile(null);
    setNameX(50);
    setNameY(55);
    setFontSize(48);
    setFontWeight("bold");
    setTextColor("#1a1a2e");
    setTextAlign("center");
    setIsModalOpen(true);
  };

  const openEditModal = (ev: CertEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormSlug(ev.slug);
    setTemplateFile(null);
    setNameX(ev.name_x);
    setNameY(ev.name_y);
    setFontSize(ev.font_size);
    setFontWeight(ev.font_weight);
    setTextColor(ev.text_color);
    setTextAlign(ev.text_align);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setTemplateFile(null);
  };

  /* ── Filtered Participants ── */
  const filteredParticipants = participants.filter((p) => {
    if (!participantSearch) return true;
    const q = participantSearch.toLowerCase();
    return (
      p.participant_name.toLowerCase().includes(q) ||
      p.roll_number.toLowerCase().includes(q)
    );
  });

  /* ── Template drag positioning ── */
  const templateContainerRef = useRef<HTMLDivElement>(null);

  const handleTemplateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNameX(Math.round(x * 10) / 10);
    setNameY(Math.round(y * 10) / 10);
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-400" />
            Certificate Portal
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Create events, upload templates, manage participants, and track downloads.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Event
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-2xl">
          <Award className="h-10 w-10 text-[var(--text-secondary)] mx-auto mb-4 opacity-40" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Certificate Events</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
            Create your first event to start issuing certificates.
          </p>
        </div>
      ) : !selectedEvent ? (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => handleSelectEvent(ev)}
              className="group cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 hover:border-orange-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{ev.title}</h3>
                  <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">/{ev.slug}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    ev.is_published
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {ev.is_published ? "Live" : "Draft"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {ev.participantCount} participants
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" /> {ev.downloadCount} downloads
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Event Detail View ── */
        <div className="space-y-4">
          {/* Back + Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[var(--text-primary)] truncate">{selectedEvent.title}</h2>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">/{selectedEvent.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTogglePublish(selectedEvent)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  selectedEvent.is_published
                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:text-orange-400 hover:border-orange-500/30"
                }`}
              >
                {selectedEvent.is_published ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                {selectedEvent.is_published ? "Published" : "Publish"}
              </button>
              <button
                onClick={() => openEditModal(selectedEvent)}
                className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="p-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[var(--border-color)]">
            {(["template", "participants", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab === "template" ? "Template & Position" : tab === "logs" ? "Download Logs" : tab}
              </button>
            ))}
          </div>

          {/* ── Tab: Template ── */}
          {activeTab === "template" && (
            <div className="space-y-5">
              {/* Upload new template */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Upload className="h-4 w-4 text-orange-400" />
                  Certificate Template
                </h3>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--border-color)] cursor-pointer hover:border-orange-500/30 transition-all">
                    <Upload className="h-6 w-6 text-[var(--text-secondary)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      {templateFile ? templateFile.name : "Click to upload template (PNG, JPG)"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setTemplateFile(f);
                          setTemplatePreviewUrl(URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Template Preview with name position */}
                {(templatePreviewUrl || selectedEvent.template_url) && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
                      Click on the template to set name position
                    </p>
                    <div
                      ref={templateContainerRef}
                      onClick={handleTemplateClick}
                      className="relative rounded-xl overflow-hidden border border-[var(--border-color)] cursor-crosshair max-h-[400px]"
                      style={{ aspectRatio: "297/210" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={templatePreviewUrl || selectedEvent.template_url || ""}
                        alt="Certificate template"
                        className="w-full h-full object-contain"
                      />
                      {/* Name overlay preview */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: textAlign === "center" ? `${nameX}%` : textAlign === "right" ? `${nameX}%` : `${nameX}%`,
                          top: `${nameY}%`,
                          transform: textAlign === "center" ? "translate(-50%, -50%)" : textAlign === "right" ? "translate(-100%, -50%)" : "translateY(-50%)",
                          fontSize: `${Math.max(fontSize / 4, 10)}px`,
                          fontWeight: fontWeight === "bold" || fontWeight === "700" || fontWeight === "900" ? "bold" : "normal",
                          color: textColor,
                          textAlign: textAlign,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Sample Participant Name
                      </div>
                      {/* Crosshair indicator */}
                      <div
                        className="absolute w-3 h-3 border-2 border-orange-500 rounded-full pointer-events-none"
                        style={{
                          left: `${nameX}%`,
                          top: `${nameY}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Position Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">X Position</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={nameX}
                      onChange={(e) => setNameX(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-orange-500"
                    />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">{nameX}%</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Y Position</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={nameY}
                      onChange={(e) => setNameY(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-orange-500"
                    />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">{nameY}%</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Font Size</label>
                    <input
                      type="number"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                      className="w-full mt-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Text Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">{textColor}</span>
                    </div>
                  </div>
                </div>

                {/* Alignment & Weight */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setTextAlign(a)}
                        className={`px-3 py-1.5 text-xs transition-all ${
                          textAlign === a
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {a === "left" ? <AlignLeft className="h-3.5 w-3.5" /> : a === "center" ? <AlignCenter className="h-3.5 w-3.5" /> : <AlignRight className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
                    {(["normal", "bold"] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setFontWeight(w)}
                        className={`px-3 py-1.5 text-xs capitalize transition-all ${
                          fontWeight === w
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={handleSavePositioning}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Template Settings
                </button>
              </div>
            </div>
          )}

          {/* ── Tab: Participants ── */}
          {activeTab === "participants" && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by name or roll number..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-orange-500/30"
                  />
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-orange-500/30 cursor-pointer transition-all">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Import CSV / Excel
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Participant Table */}
              {participantsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-5 w-5 animate-spin text-orange-400" />
                </div>
              ) : filteredParticipants.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-xl">
                  <Users className="h-8 w-8 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Participants</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Import a CSV or Excel file to add participants.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">#</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Roll Number</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Participant Name</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParticipants.map((p, idx) => (
                          <tr key={p.id} className="border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                            <td className="px-4 py-2.5 text-[var(--text-secondary)] font-mono">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-mono text-[var(--text-primary)]">{p.roll_number}</td>
                            <td className="px-4 py-2.5 text-[var(--text-primary)]">{p.participant_name}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => handleDeleteParticipant(p.id)}
                                className="p-1 rounded text-red-400/50 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      Showing {filteredParticipants.length} of {participants.length} participant(s)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Download Logs ── */}
          {activeTab === "logs" && (
            <div>
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-5 w-5 animate-spin text-orange-400" />
                </div>
              ) : downloadLogs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-xl">
                  <Download className="h-8 w-8 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Downloads Yet</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Download logs will appear here once students start downloading certificates.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Participant</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Roll Number</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Downloaded At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloadLogs.map((log) => (
                          <tr key={log.id} className="border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                            <td className="px-4 py-2.5 text-[var(--text-primary)]">{log.participant_name}</td>
                            <td className="px-4 py-2.5 font-mono text-[var(--text-secondary)]">{log.roll_number}</td>
                            <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                              {new Date(log.downloaded_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Event Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingEvent ? "Edit Event" : "Create Certificate Event"}
                </h3>
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                  <X className="h-4 w-4 text-[var(--text-secondary)]" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Event Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (!editingEvent) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                      }
                    }}
                    placeholder="GenAI Hands-on Bootcamp"
                    required
                    className="w-full mt-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-orange-500/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="genai-bootcamp"
                    required
                    className="w-full mt-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formTitle.trim() || !formSlug.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all"
                  >
                    {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {editingEvent ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Import Preview Modal ── */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowImportModal(false); setImportRows([]); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-lg max-h-[80vh] rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Import Preview</h3>
                <button onClick={() => { setShowImportModal(false); setImportRows([]); }} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                  <X className="h-4 w-4 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Summary */}
              <div className="px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex gap-4 text-xs">
                <span className="text-emerald-400">
                  <Check className="inline h-3 w-3 mr-1" />
                  {importRows.filter((r) => r.valid).length} valid
                </span>
                <span className="text-red-400">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  {importRows.filter((r) => !r.valid).length} invalid
                </span>
                <span className="text-[var(--text-secondary)]">
                  {importRows.length} total rows
                </span>
              </div>

              {/* Row list */}
              <div className="flex-1 overflow-y-auto px-6 py-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      <th className="text-left py-1">Roll Number</th>
                      <th className="text-left py-1">Name</th>
                      <th className="text-left py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className={`border-b border-[var(--border-color)] last:border-0 ${!row.valid ? "opacity-50" : ""}`}>
                        <td className="py-1.5 font-mono text-[var(--text-primary)]">{row.rollNumber || "—"}</td>
                        <td className="py-1.5 text-[var(--text-primary)]">{row.participantName || "—"}</td>
                        <td className="py-1.5">
                          {row.valid ? (
                            <span className="text-emerald-400 text-[10px]">✓ Valid</span>
                          ) : (
                            <span className="text-red-400 text-[10px]">{row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importRows.length > 100 && (
                  <p className="text-[10px] text-[var(--text-secondary)] mt-2">
                    Showing first 100 of {importRows.length} rows.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => { setShowImportModal(false); setImportRows([]); }}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing || importRows.filter((r) => r.valid).length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all"
                >
                  {importing ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Import {importRows.filter((r) => r.valid).length} Participants
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminCertificatesPage() {
  return <AdminCertificates />;
}
