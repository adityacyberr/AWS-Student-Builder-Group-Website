"use client";

import React, { useState, useEffect } from "react";
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


export default function ConsoleTeam() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Lists
  const [members, setMembers] = useState<TeamMember[]>([]);
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
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
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

        const mapped = (data || []).map((d: any) => ({
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
          linkedin: d.linkedin,
          github: d.github,
          displayOrder: d.display_order,
        }));
        setMembers(mapped);
      } else {
        const stored = localStorage.getItem("aws_sbg_team");
        if (stored) {
          setMembers(JSON.parse(stored).sort((a: any, b: any) => a.displayOrder - b.displayOrder));
        } else {
          localStorage.setItem("aws_sbg_team", JSON.stringify(TEAM_MEMBERS));
          setMembers(TEAM_MEMBERS);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error loading team members", "error");
    } finally {
      setLoading(false);
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
    setLinkedin("javascript:void(0)");
    setGithub("javascript:void(0)");
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
        name,
        role,
        branch,
        specialization,
        bio,
        quote,
        focusAreas,
        initials,
        themeColor,
        photo,
        linkedin,
        github,
        displayOrder,
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
          const { error } = await supabase.from("team_members").update(dbRow).eq("id", editingId);
          if (error) throw error;
          showToast("Member details updated!");
        } else {
          const { error } = await supabase.from("team_members").insert([dbRow]);
          if (error) throw error;
          showToast("Member created successfully!");
        }
      } else {
        // Sandbox mode
        let list = [...members];
        if (editingId) {
          list = list.map((m) => (m.id === editingId ? { ...m, ...payload } : m));
          showToast("Member details updated in sandbox.");
        } else {
          list.push({
            id: Math.random().toString(36).substring(2, 9),
            ...payload,
          });
          showToast("Member created in sandbox.");
        }
        localStorage.setItem("aws_sbg_team", JSON.stringify(list));
      }
      setIsModalOpen(false);
      await loadTeam();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save member details.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member from the roster?")) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("team_members").delete().eq("id", id);
        if (error) throw error;
        showToast("Member deleted.");
      } else {
        const list = members.filter((m) => m.id !== id);
        localStorage.setItem("aws_sbg_team", JSON.stringify(list));
        showToast("Member deleted from sandbox.");
      }
      await loadTeam();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete member.", "error");
    }
  };

  // Move a member up or down the display list
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const list = [...members];
    const memberA = list[index];
    const memberB = list[targetIndex];

    // Swap displayOrder values
    const tempOrder = memberA.displayOrder;
    memberA.displayOrder = memberB.displayOrder;
    memberB.displayOrder = tempOrder;

    try {
      if (isSupabaseConfigured && supabase) {
        // Update both in database
        await Promise.all([
          supabase.from("team_members").update({ display_order: memberA.displayOrder }).eq("id", memberA.id),
          supabase.from("team_members").update({ display_order: memberB.displayOrder }).eq("id", memberB.id),
        ]);
        showToast("Roster ordering updated.");
      } else {
        localStorage.setItem("aws_sbg_team", JSON.stringify(list));
        showToast("Roster ordering updated in sandbox.");
      }
      await loadTeam();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to change order.", "error");
    }
  };

  const filteredMembers = members.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Team Roster
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Manage student leader details, bios, specializations, and custom display orders.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Team Member
        </button>
      </div>

      {/* Controls: Search */}
      <div className="flex items-center bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search roster by name, role, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        </div>
      </div>

      {/* Roster Listing */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-5 w-5 text-amber-500 animate-spin" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900/50 rounded-xl">
          <p className="text-xs text-zinc-550">No team members match query.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((m, index) => (
            <div
              key={m.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 gap-4 hover:border-zinc-800 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Photo/Avatar */}
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-900 flex-shrink-0 flex items-center justify-center font-bold text-xs select-none">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-400">{m.initials}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xs font-black text-white truncate">{m.name}</h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">{m.role}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    {m.branch} — {m.specialization}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-900/80 pt-3.5 md:pt-0">
                {/* Display order arrows */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-550 mr-2 font-mono">Pos: {m.displayOrder}</span>
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="h-7 w-7 rounded border border-zinc-855 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === members.length - 1}
                    className="h-7 w-7 rounded border border-zinc-855 hover:border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Social icons indicator */}
                <div className="flex items-center gap-2">
                  {m.linkedin && m.linkedin !== "javascript:void(0)" && (
                    <LinkedInIcon className="h-3.5 w-3.5 text-zinc-550" />
                  )}
                  {m.github && m.github !== "javascript:void(0)" && (
                    <GitHubIcon className="h-3.5 w-3.5 text-zinc-550" />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="h-7 w-7 rounded border border-zinc-850 hover:border-zinc-750 hover:bg-rose-500/5 flex items-center justify-center text-zinc-450 hover:text-rose-400 transition-colors"
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
          <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-550 hover:text-zinc-350 p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
              {editingId ? "Edit Member details" : "Add Team Member"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pranav Bansal"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Roster Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Group Leader"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-855 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Academic Branch *
                  </label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Core Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cybersecurity, AI & ML"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Profile Initials *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. PB"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    Display Order Position
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <MediaPicker
                  value={photo}
                  onChange={setPhoto}
                  folder="team"
                  label="Upload Profile Picture"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    LinkedIn Link
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                    GitHub Link
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                  Focus Areas (Comma-separated)
                </label>
                <input
                  type="text"
                  value={focusAreasText}
                  onChange={(e) => setFocusAreasText(e.target.value)}
                  placeholder="e.g. Cloud Security, IAM, Web & Infrastructure"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-855 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                  Signature Quote *
                </label>
                <input
                  type="text"
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="e.g. Secure by design — building cloud skills the right way."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-850 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                  Short Biography *
                </label>
                <textarea
                  required
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe the member's contributions, focus areas, and cloud objectives..."
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
                  Save Member Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
