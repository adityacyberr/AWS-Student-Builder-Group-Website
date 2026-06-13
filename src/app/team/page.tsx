"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Terminal,
  GitPullRequest,
  DollarSign,
  Megaphone,
  Calendar,
  Camera,
  User,
  Users,
  Network,
  X,
  Quote,
} from "lucide-react";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/* Role icon helper                                                    */
/* ------------------------------------------------------------------ */
const getRoleIcon = (role: string, className = "h-4 w-4") => {
  switch (role) {
    case "Group Leader":
      return <Terminal className={className} />;
    case "Technical Head":
      return <GitPullRequest className={className} />;
    case "Treasurer":
      return <DollarSign className={className} />;
    case "Marketing Head":
      return <Megaphone className={className} />;
    case "Event Head":
      return <Calendar className={className} />;
    case "Director of Photography":
      return <Camera className={className} />;
    default:
      return <User className={className} />;
  }
};

/* ------------------------------------------------------------------ */
/* Member Card Component                                               */
/* ------------------------------------------------------------------ */
function MemberCard({
  member,
  onOpen,
}: {
  member: TeamMember;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`View details for ${member.name}`}
      className="group relative w-full text-left rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out hover:border-orange-500/50 hover:-translate-y-1.5 hover:shadow-[0_8px_40px_-12px_rgba(249,115,22,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none motion-reduce:transition-none" />

      {/* Card Content */}
      <div className="relative p-6 flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative h-28 w-28 rounded-2xl ring-2 ring-slate-800 group-hover:ring-orange-500/40 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-lg motion-reduce:transition-none">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <span className="text-2xl font-black text-orange-400/80 tracking-wider">
              {member.initials}
            </span>
          )}
          {/* Photo overlay on hover */}
          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition-colors duration-300 motion-reduce:transition-none" />
        </div>

        {/* Role badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {getRoleIcon(member.role, "h-3 w-3")}
          {member.role}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-white tracking-tight text-center leading-tight">
          {member.name}
        </h3>

        {/* Branch */}
        <p className="text-xs text-slate-400 font-medium -mt-2">
          {member.branch} ({member.specialization})
        </p>

        {/* Tap hint */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 group-hover:text-orange-400/60 transition-colors duration-300 mt-auto pt-2 motion-reduce:transition-none">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          Tap to learn more
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Member Modal Component                                              */
/* ------------------------------------------------------------------ */
function MemberModal({
  member,
  isOpen,
  onClose,
}: {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when modal opens
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} — ${member.role}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md animate-fade-in motion-reduce:animate-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950 shadow-2xl shadow-orange-500/5 animate-modal-in overflow-hidden motion-reduce:animate-none"
      >
        {/* Decorative top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header: Avatar + Name + Role */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl ring-2 ring-orange-500/30 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-2xl font-black text-orange-400/80 tracking-wider">
                    {member.initials}
                  </span>
                </div>
              )}
            </div>

            {/* Name & role */}
            <div className="min-w-0 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {getRoleIcon(member.role, "h-3 w-3")}
                {member.role}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {member.name}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {member.branch} ({member.specialization})
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="relative bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-4">
            <Quote className="absolute top-3 left-3 h-4 w-4 text-orange-500/30" />
            <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed pl-6">
              &ldquo;{member.quote}&rdquo;
            </p>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {member.bio}
          </p>

          {/* Focus Areas */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {member.focusAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:border-orange-500/30 hover:text-orange-300 transition-colors"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-900">
            {member.linkedin && member.linkedin !== "javascript:void(0)" ? (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-colors"
                title="LinkedIn Profile"
              >
                <svg className="h-4 w-4 fill-current text-orange-400" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs">LinkedIn</span>
              </a>
            ) : (
              <div
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                title="LinkedIn — Coming Soon"
              >
                <svg className="h-4 w-4 fill-current text-slate-650" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs">LinkedIn</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Org Hierarchy View                                                   */
/* ------------------------------------------------------------------ */
function OrgHierarchy({
  members,
  onOpenMember,
}: {
  members: TeamMember[];
  onOpenMember: (m: TeamMember) => void;
}) {
  const leader = members.find((m) => m.role === "Group Leader");
  const others = members.filter((m) => m.role !== "Group Leader");

  if (!leader) {
    return (
      <div className="relative max-w-5xl mx-auto border border-slate-900 rounded-2xl bg-slate-950/60 p-12 text-center text-slate-500 shadow-2xl">
        No hierarchy data loaded.
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto border border-slate-900 rounded-2xl bg-slate-950/60 p-6 sm:p-8 md:p-12 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-radial-gradient opacity-30" />

      <div className="relative z-10 flex flex-col items-center space-y-0">
        {/* Group Leader Node */}
        <div className="flex flex-col items-center w-full">
          <button
            onClick={() => onOpenMember(leader)}
            className="px-8 py-5 rounded-xl border border-orange-500/40 bg-orange-500/[0.03] text-center shadow-xl hover:border-orange-500 transition-all relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Chapter Head
            </div>
            <h4 className="text-xl font-extrabold text-white tracking-tight">
              {leader.name}
            </h4>
            <p className="text-xs text-orange-400 font-semibold">
              {leader.role}
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              {leader.branch} ({leader.specialization})
            </p>
          </button>

          {/* Connector tree - Desktop Only */}
          <div className="hidden lg:flex w-full flex-col items-center mt-0">
            <div className="h-10 w-0.5 bg-slate-700" />
            <div className="h-0.5 w-[82%] bg-slate-700" />
            <div className="w-[82%] flex justify-between">
              {others.map((_, i) => (
                <div key={i} className="h-8 w-0.5 bg-slate-700" />
              ))}
            </div>
          </div>
          {/* Mobile Connector - Simple Line */}
          <div className="flex lg:hidden h-8 w-0.5 bg-slate-700" />

        </div>

        {/* Core Team Nodes */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {others.map((member) => (
            <button
              key={member.id}
              onClick={() => onOpenMember(member)}
              className="px-2 py-4 rounded-lg border border-slate-800 hover:border-orange-500/50 bg-slate-950 text-center shadow-md hover:-translate-y-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 motion-reduce:hover:translate-y-0"
            >
              <h5 className="text-xs font-bold text-white truncate">
                {member.name}
              </h5>
              <p className="text-[9px] font-semibold text-orange-400">
                {member.role}
              </p>
              <p className="text-[8px] text-slate-300">{member.branch}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Team Page                                                      */
/* ------------------------------------------------------------------ */
interface DBTeamMemberRow {
  id: string;
  name: string;
  role: string;
  branch: string;
  specialization: string;
  bio: string;
  quote: string;
  focus_areas: string[];
  initials: string;
  theme_color: string;
  photo?: string;
  linkedin: string;
  github: string;
  display_order: number;
}

export default function TeamPage() {
  const [viewMode, setViewMode] = useState<"cards" | "hierarchy">("cards");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    async function loadTeam() {
      let teamList = [...TEAM_MEMBERS];
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .order("display_order", { ascending: true });
          if (!error && data && data.length > 0) {
            teamList = (data as DBTeamMemberRow[]).map((d) => ({
              id: d.id,
              name: d.name,
              role: d.role,
              branch: d.branch,
              specialization: d.specialization,
              bio: d.bio,
              quote: d.quote,
              focusAreas: d.focus_areas,
              initials: d.initials,
              themeColor: d.theme_color,
              photo: d.photo || "",
              linkedin: d.linkedin,
              github: d.github,
              displayOrder: d.display_order,
            }));
          }
        } catch (err) {
          console.error("Error loading team from Supabase:", err);
        }
      }
      setMembers(teamList);
    }

    loadTeam();
  }, []);

  const sortedMembers = [...members].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const openMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    // Delay clearing member to allow exit animation
    setTimeout(() => setSelectedMember(null), 200);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Users className="h-3.5 w-3.5" />
            Core Leadership
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Meet the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500">
              Builders
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            The founding force orchestrating cloud innovation, hands-on
            learning, and community engineering for the AWS Student Builder
            Group at RIMT University.
          </p>

          {/* Toggle Views */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Team Grid
            </button>
            <button
              onClick={() => setViewMode("hierarchy")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                viewMode === "hierarchy"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Network className="h-4 w-4" />
              Org Hierarchy
            </button>
          </div>
        </div>


        {/* Content Views */}
        {viewMode === "cards" ? (
          /* ============ EQUAL GRID VIEW ============ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sortedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpen={() => openMember(member)}
              />
            ))}
          </div>
        ) : (
          /* ============ ORG HIERARCHY VIEW ============ */
          <OrgHierarchy members={sortedMembers} onOpenMember={openMember} />
        )}
      </div>

      {/* Member Detail Modal */}
      <MemberModal
        member={selectedMember}
        isOpen={modalOpen}
        onClose={closeModal}
      />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out both;
        }
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-modal-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
