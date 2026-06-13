"use client";

import { useState, useEffect, useCallback } from "react";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Users, Network } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { MemberCard } from "./components/MemberCard";
import { MemberModal } from "./components/MemberModal";
import { OrgHierarchy } from "./components/OrgHierarchy";

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
      
      // Deduplicate teamList by name and role on the client side
      const unique = new Map<string, TeamMember>();
      teamList.forEach((member) => {
        const key = `${member.name.toLowerCase()}-${member.role.toLowerCase()}`;
        if (!unique.has(key)) {
          unique.set(key, member);
        }
      });
      setMembers(Array.from(unique.values()));
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
    // Delay clearing member to allow exit morph animation to complete
    setTimeout(() => setSelectedMember(null), 450);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden py-16">
      {/* Background Grid Pattern with scale & drift transitions */}
      <div 
        className="absolute inset-0 bg-grid-pattern pointer-events-none transition-all duration-600 ease-out z-0"
        style={{
          transform: modalOpen ? 'scale(1.02) translate(3px, -3px)' : 'scale(1) translate(0, 0)',
          opacity: modalOpen ? 0.5 : 0.8,
        }}
      />

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px] animate-pulse-slow pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-500/5 blur-[120px] animate-pulse-slow pointer-events-none z-0" />

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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Team Grid
            </button>
            <button
              onClick={() => setViewMode("hierarchy")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer ${
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
                isDimmed={selectedMember !== null && selectedMember.id !== member.id}
              />
            ))}
          </div>
        ) : (
          /* ============ ORG HIERARCHY VIEW ============ */
          <OrgHierarchy members={sortedMembers} onOpenMember={openMember} />
        )}
      </div>

      {/* Member Detail Modal wrapped in AnimatePresence for smooth morph/exit */}
      <AnimatePresence mode="wait">
        {modalOpen && selectedMember && (
          <MemberModal
            key={selectedMember.id}
            member={selectedMember}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      {/* Custom Global Style for Avatar pulse glow */}
      <style jsx global>{`
        @keyframes avatar-pulse {
          0% {
            box-shadow: 0 0 0 0px rgba(255, 140, 0, 0.4);
          }
          30% {
            box-shadow: 0 0 0 8px rgba(255, 140, 0, 0.2);
          }
          100% {
            box-shadow: 0 0 0 0px rgba(255, 140, 0, 0);
          }
        }
        .animate-avatar-pulse {
          animation: avatar-pulse 2s ease-out 1;
        }
      `}</style>
    </div>
  );
}
