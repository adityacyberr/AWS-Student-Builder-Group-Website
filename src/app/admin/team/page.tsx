"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Toast, ToastType } from "@/components/console/Toast";
import { MediaPicker } from "@/components/console/MediaPicker";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import {
  Users,
  Plus,
  Search,
  Loader,
  Edit2,
  Trash2,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// ─── Client-side dedup safety net ────────────────────────────────────────────
// Even if DB has duplicates, the UI will never show them while the proper
// DB cleanup is being applied.
function deduplicateMembers(list: TeamMember[]): TeamMember[] {
  const seen = new Map<string, TeamMember>();
  for (const m of list) {
    const key = `${m.name.trim().toLowerCase()}||${m.role.trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, m);
    }
  }
  return Array.from(seen.values());
}

export default function ConsoleTeam() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingDups, setRemovingDups] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // ── useRef guard prevents React Strict Mode double-invocation ────────────
  const hasFetched = useRef(false);

  // Lists
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [dbCount, setDbCount] = useState<number | null>(null); // raw DB row count
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [branch, setBranch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [quote, setQuote] = useState("");
  const [focusAreasText, setFocusAreasText] = useState("");
  const [initials, setInitials] = useState("");
  const [themeColor, setThemeColor] = useState("orange");
  const [photo, setPhoto] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Guard: only fetch once even in React Strict Mode (which mounts twice in dev)
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .order("display_order", { ascending: true });

        if (error) throw error;

        const rawCount = (data || []).length;
        setDbCount(rawCount);

        const mapped: TeamMember[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          role: d.role,
          branch: d.branch,
          specialization: d.specialization,
          bio: d.bio,
          quote: d.quote,
          focusAreas: d.focus_areas || [],
          initials: d.initials,
          themeColor: d.theme_color,
          photo: d.photo || "",
          linkedin: d.linkedin || "",
          github: d.github || "",
          displayOrder: d.display_order,
        }));

        // Safety-net dedup on the client side
        const deduped = deduplicateMembers(mapped);

        console.log(
          `[Team Roster] DB rows: ${rawCount} | After dedup: ${deduped.length}`
        );

        if (rawCount > deduped.length) {
          console.warn(
            `[Team Roster] ⚠️ ${rawCount - deduped.length} duplicate row(s) detected in DB. Use "Remove Duplicates" to clean up.`
          );
        }

        // ALWAYS replace, never append
        setMembers(deduped);
      } else {
        // Sandbox mode
        const stored = localStorage.getItem("aws_sbg_team");
        const raw: TeamMember[] = stored
          ? JSON.parse(stored)
          : TEAM_MEMBERS;
        const deduped = deduplicateMembers(
          raw.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        );
        setDbCount(raw.length);
        setMembers(deduped);
      }
    } catch (err: any) {
      console.error("[Team Roster] Load error:", err);
      showToast("Error loading team members", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Remove Duplicates (calls DB RPC) ─────────────────────────────────────
  const handleRemoveDuplicates = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox: just dedup localStorage
      const stored = localStorage.getItem("aws_sbg_team");
      if (stored) {
        const raw = JSON.parse(stored);
        const deduped = deduplicateMembers(raw);
        localStorage.setItem("aws_sbg_team", JSON.stringify(deduped));
        setMembers(deduped);
        showToast(`Sandbox: removed ${raw.length - deduped.length} duplicate(s).`);
      }
      return;
    }

    setRemovingDups(true);
    try {
      // Approach: fetch all rows, find duplicates by (name, role),
      // keep the one with the smallest created_at (oldest), delete the rest.
      const { data: allRows, error: fetchErr } = await supabase
        .from("team_members")
        .select("id, name, role, created_at")
        .order("created_at", { ascending: true });

      if (fetchErr) throw fetchErr;

      const seen = new Map<string, string>(); // key → id to keep
      const toDelete: string[] = [];

      for (const row of allRows || []) {
        const key = `${row.name.trim().toLowerCase()}||${row.role.trim().toLowerCase()}`;
        if (seen.has(key)) {
          toDelete.push(row.id);
        } else {
          seen.set(key, row.id);
        }
      }

      if (toDelete.length === 0) {
        showToast("No duplicates found — roster is clean ✓");
        setRemovingDups(false);
        return;
      }

      const { error: delErr } = await supabase
        .from("team_members")
        .delete()
        .in("id", toDelete);

      if (delErr) throw delErr;

      showToast(`${toDelete.length} duplicate record(s) removed successfully.`);
      hasFetched.current = false; // allow reload
      await loadTeam();
      hasFetched.current = true;
    } catch (err: any) {
      console.error("[Remove Duplicates] Error:", err);
      showToast(err.message || "Failed to remove duplicates.", "error");
    } finally {
      setRemovingDups(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setBranch("B.Tech CSE");
    setSpecialization("");
    setBio("");
    setQuote("");
    setFocusAreasText("");
    setInitials("");
    setThemeColor("orange");
    setPhoto("");
    setLinkedin("");
    setGithub("");
    setDisplayOrder(members.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setName(m.name);
    setRole(m.role);
    setBranch(m.branch);
    setSpecialization(m.specialization);
    setBio(m.bio);
    setQuote(m.quote);
    setFocusAreasText((m.focusAreas || []).join(", "));
    setInitials(m.initials);
    setThemeColor(m.themeColor);
    setPhoto(m.photo);
    setLinkedin(m.linkedin);
    setGithub(m.github);
    setDisplayOrder(m.displayOrder);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !bio || !initials) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);

    const focusAreas = focusAreasText
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    try {
      const payload = {
        name, role, branch, specialization, bio, quote,
        focusAreas, initials, themeColor, photo, linkedin, github, displayOrder,
      };

      if (isSupabaseConfigured && supabase) {
        const dbRow = {
          name: payload.name,
          role: payload.role,
          branch: payload.branch,
          specialization: payload.specialization,
          bio: payload.bio,
          quote: payload.quote,
          focus_areas: payload.focusAreas,
          initials: payload.initials,
          theme_color: payload.themeColor,
          photo: payload.photo || null,
          linkedin: payload.linkedin,
          github: payload.github,
          display_order: payload.displayOrder,
        };

        if (editingId) {
          const { error } = await supabase
            .from("team_members")
            .update(dbRow)
            .eq("id", editingId);
          if (error) throw error;
          showToast("Member updated successfully!");
        } else {
          // Use UPSERT to prevent duplicates on insert
          const { error } = await supabase
            .from("team_members")
            .upsert([dbRow], { onConflict: "name,role" });
          if (error) throw error;
          showToast("Member added successfully!");
        }
      } else {
        let list = [...members];
        if (editingId) {
          list = list.map((m) => (m.id === editingId ? { ...m, ...payload } : m));
          showToast("Member updated in sandbox.");
        } else {
          list.push({
            id: Math.random().toString(36).substring(2, 9),
            ...payload,
          });
          showToast("Member added in sandbox.");
        }
        list = deduplicateMembers(list);
        localStorage.setItem("aws_sbg_team", JSON.stringify(list));
      }

      setIsModalOpen(false);
      hasFetched.current = false;
      await loadTeam();
      hasFetched.current = true;
    } catch (err: any) {
      console.error("[Save Member]", err);
      showToast(err.message || "Failed to save member.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this member from the roster permanently?")) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("team_members").delete().eq("id", id);
        if (error) throw error;
        showToast("Member removed.");
      } else {
        const list = deduplicateMembers(members.filter((m) => m.id !== id));
        localStorage.setItem("aws_sbg_team", JSON.stringify(list));
        showToast("Member removed from sandbox.");
      }
      hasFetched.current = false;
      await loadTeam();
      hasFetched.current = true;
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete member.", "error");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const list = [...members];
    const a = list[index];
    const b = list[targetIndex];
    const tempOrder = a.displayOrder;
    a.displayOrder = b.displayOrder;
    b.displayOrder = tempOrder;

    try {
      if (isSupabaseConfigured && supabase) {
        await Promise.all([
          supabase.from("team_members").update({ display_order: a.displayOrder }).eq("id", a.id),
          supabase.from("team_members").update({ display_order: b.displayOrder }).eq("id", b.id),
        ]);
        showToast("Order updated.");
      } else {
        localStorage.setItem("aws_sbg_team", JSON.stringify(list));
        showToast("Order updated in sandbox.");
      }
      hasFetched.current = false;
      await loadTeam();
      hasFetched.current = true;
    } catch (err: any) {
      console.error(err);
      showToast("Failed to update order.", "error");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasDuplicatesInDb =
    dbCount !== null && dbCount > members.length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Team Roster
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Manage student leader details, bios, specializations, and display order.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start">
          {/* Remove Duplicates button — shown when DB has more rows than displayed */}
          {hasDuplicatesInDb && (
            <button
              onClick={handleRemoveDuplicates}
              disabled={removingDups}
              className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
              title={`DB has ${dbCount} rows but only ${members.length} unique — click to clean up`}
            >
              {removingDups ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5" />
              )}
              {removingDups ? "Cleaning…" : `Remove Duplicates (${(dbCount ?? 0) - members.length} found)`}
            </button>
          )}

          {/* Manual refresh */}
          <button
            onClick={() => { hasFetched.current = false; loadTeam(); hasFetched.current = true; }}
            disabled={loading}
            className="h-8 w-8 rounded-lg border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Refresh roster"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* ── Debug info bar ─────────────────────────────────── */}
      {dbCount !== null && (
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-mono ${
            hasDuplicatesInDb
              ? "border-rose-500/30 bg-rose-500/5 text-rose-400"
              : "border-zinc-900 bg-zinc-900/20 text-zinc-500"
          }`}
        >
          <span>
            DB rows: <strong className="text-zinc-300">{dbCount}</strong>
          </span>
          <span className="text-zinc-700">·</span>
          <span>
            Unique: <strong className="text-zinc-300">{members.length}</strong>
          </span>
          <span className="text-zinc-700">·</span>
          <span>
            Rendered: <strong className="text-zinc-300">{filteredMembers.length}</strong>
          </span>
          {hasDuplicatesInDb && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-rose-400 font-bold">
                ⚠ {(dbCount ?? 0) - members.length} duplicate(s) in DB — click "Remove Duplicates" above
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="flex items-center bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by name, role, specialization…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        </div>
      </div>

      {/* ── Roster List ────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-5 w-5 text-amber-500 animate-spin" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900/50 rounded-xl">
          <p className="text-xs text-zinc-550">No members match your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((m, index) => (
            <div
              key={m.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 gap-4 hover:border-zinc-800 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Photo / Avatar */}
                <div className="h-10 w-10 rounded-full overflow-hidden border border-zinc-850 bg-zinc-900 flex-shrink-0 flex items-center justify-center font-bold text-xs select-none">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-400">{m.initials}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-xs font-black text-white truncate">{m.name}</h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">{m.role}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    {m.branch} — {m.specialization}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-zinc-900/80 pt-3.5 md:pt-0">
                {/* Order controls */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-550 mr-1.5 font-mono">Pos: {m.displayOrder}</span>
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="h-7 w-7 rounded border border-zinc-855 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === filteredMembers.length - 1}
                    className="h-7 w-7 rounded border border-zinc-855 hover:border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2">
                  {m.linkedin && m.linkedin !== "javascript:void(0)" && m.linkedin !== "" && (
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer"
                       className="text-zinc-550 hover:text-blue-400 transition-colors">
                      <LinkedInIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {m.github && m.github !== "javascript:void(0)" && m.github !== "" && (
                    <a href={m.github} target="_blank" rel="noopener noreferrer"
                       className="text-zinc-550 hover:text-zinc-200 transition-colors">
                      <GitHubIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-450 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit / Add Modal ───────────────────────────────── */}
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
              {editingId ? "Edit Member" : "Add Team Member"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Full Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pranav Bansal"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-amber-500/50" />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Roster Role *</label>
                  <input type="text" required value={role} onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Group Leader"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-855 text-white focus:outline-none focus:border-amber-500/50" />
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Academic Branch *</label>
                  <input type="text" required value={branch} onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
                </div>

                {/* Specialization */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Specialization *</label>
                  <input type="text" required value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cybersecurity, AI & ML"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
                </div>

                {/* Initials */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Initials *</label>
                  <input type="text" required maxLength={2} value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. PB"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Display Order</label>
                  <input type="number" value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
                </div>
              </div>

              {/* Photo */}
              <div className="space-y-1.5">
                <MediaPicker value={photo} onChange={setPhoto} folder="team" label="Upload Profile Picture" />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">LinkedIn URL</label>
                  <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">GitHub URL</label>
                  <input type="text" value={github} onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Focus Areas (comma-separated)</label>
                <input type="text" value={focusAreasText} onChange={(e) => setFocusAreasText(e.target.value)}
                  placeholder="e.g. Cloud Security, IAM, Web & Infrastructure"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-855 text-white focus:outline-none" />
              </div>

              {/* Quote */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Signature Quote *</label>
                <input type="text" required value={quote} onChange={(e) => setQuote(e.target.value)}
                  placeholder="e.g. Secure by design — building cloud skills the right way."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none" />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Biography *</label>
                <textarea required rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe the member's contributions, focus, and cloud objectives…"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none resize-none" />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
                  {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
