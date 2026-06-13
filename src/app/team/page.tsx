"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowRight, Infinity, Sparkles, Heart, Target } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useReducedMotion } from "./hooks/useReducedMotion";
import { SolarBackground } from "./components/SolarBackground";
import { SolarCore } from "./components/SolarCore";
import { OrbitingPlanets } from "./components/OrbitingPlanets";
import { SolarProfileConsole } from "./components/SolarProfileConsole";
import { OrbitStrengthSection } from "./components/OrbitStrengthSection";
import { PrinciplesSection } from "./components/PrinciplesSection";
import { SolarCTA } from "./components/SolarCTA";

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

const scrollContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const scrollItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function TeamPage() {
  const reducedMotion = useReducedMotion();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [sunHovered, setSunHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
  }, []);

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

      // Deduplicate
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

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.displayOrder - b.displayOrder),
    [members]
  );

  const openMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedMember(null);
  }, []);

  const selectedIndex = selectedMember
    ? sortedMembers.findIndex((m) => m.id === selectedMember.id)
    : -1;

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedMember(sortedMembers[selectedIndex - 1]);
    }
  }, [selectedIndex, sortedMembers]);

  const goNext = useCallback(() => {
    if (selectedIndex < sortedMembers.length - 1) {
      setSelectedMember(sortedMembers[selectedIndex + 1]);
    }
  }, [selectedIndex, sortedMembers]);

  // Solar system center coordinates for the hero section
  const solarCenter = { x: 280, y: 220 };

  return (
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-hidden text-slate-300">
      {/* Shared living background */}
      <SolarBackground reducedMotion={reducedMotion} />

      <motion.div
        variants={scrollContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* ====================================================== */}
        {/* HERO SECTION                                            */}
        {/* ====================================================== */}
        <motion.section
          variants={scrollItemVariants}
          className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[600px]">
            {/* Left side - Hero text */}
            <div className="space-y-6 relative z-20">
              {/* Badge */}
              <motion.span
                variants={scrollItemVariants}
                className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block"
              >
                {"// CORE LEADERSHIP"}
              </motion.span>

              {/* Heading */}
              <motion.h1
                variants={scrollItemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]"
              >
                Meet The Builders<br />
                Powering Cloud<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_25px_rgba(255,140,0,0.3)]">
                  Innovation.
                </span>
              </motion.h1>

              {/* Supporting text */}
              <motion.div variants={scrollItemVariants} className="space-y-1 max-w-md">
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  A constellation of passionate builders, connected by one mission:
                </p>
                <p className="text-white font-bold text-sm sm:text-base">
                  Learn.{" "}
                  <span className="text-orange-400">Build.</span>{" "}
                  Lead.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div variants={scrollItemVariants}>
                <button
                  onClick={() => {
                    document.getElementById("orbit-strength")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,140,0,0.12), rgba(255,140,0,0.06))",
                    border: "1px solid rgba(255,140,0,0.3)",
                    boxShadow: "0 0 15px rgba(255,140,0,0.08), inset 0 0 15px rgba(255,140,0,0.04)",
                  }}
                >
                  {/* Light sweep */}
                  {!reducedMotion && (
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
                        animation: "hero-sweep 4s ease-in-out infinite",
                      }}
                    />
                  )}
                  <span className="relative z-10 text-orange-400 group-hover:text-white transition-colors">
                    Explore The Solar System
                  </span>
                  <ArrowRight className="relative z-10 h-4 w-4 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </motion.div>

              {/* Compact stats */}
              <motion.div
                variants={scrollItemVariants}
                className="grid grid-cols-3 gap-4 max-w-sm pt-4"
              >
                {[
                  { value: "06", label: "Founding Members", icon: <Sparkles className="h-3.5 w-3.5" /> },
                  { value: "01", label: "Builder Community", icon: <Heart className="h-3.5 w-3.5" /> },
                  { value: "100%", label: "Student Led", icon: <Target className="h-3.5 w-3.5" /> },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/60 bg-slate-950/50 backdrop-blur-sm"
                  >
                    <div className="text-orange-400/60">{stat.icon}</div>
                    <div>
                      <span className="text-lg font-black text-white block leading-tight">{stat.value}</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right side - Solar System Visualization */}
            <motion.div
              variants={scrollItemVariants}
              className="relative flex items-center justify-center"
              style={{ minHeight: 500 }}
            >
              {/* Solar system container */}
              <div className="relative" style={{ width: 560, height: 440 }}>
                {/* The Sun at the center */}
                <div
                  className="absolute"
                  style={{
                    left: solarCenter.x - 170,
                    top: solarCenter.y - 170,
                  }}
                >
                  <SolarCore
                    isHovered={sunHovered}
                    onHover={setSunHovered}
                    reducedMotion={reducedMotion}
                  />
                </div>

                {/* Orbiting Planet Members */}
                {sortedMembers.length > 0 && !isMobile && (
                  <OrbitingPlanets
                    members={sortedMembers}
                    sunHovered={sunHovered}
                    selectedId={selectedMember?.id ?? null}
                    onSelect={openMember}
                    reducedMotion={reducedMotion}
                    containerCenter={solarCenter}
                  />
                )}

                {/* Mobile: Static grid of member avatars */}
                {isMobile && sortedMembers.length > 0 && (
                  <div className="absolute inset-0 flex items-end justify-center pb-4">
                    <div className="flex gap-3 flex-wrap justify-center max-w-[320px]">
                      {sortedMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => openMember(member)}
                          className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                          style={{
                            boxShadow: "0 0 10px rgba(255,140,0,0.1), 0 4px 12px rgba(0,0,0,0.3)",
                          }}
                          aria-label={`View ${member.name}'s profile`}
                        >
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <span className="text-xs font-bold text-orange-400">{member.initials}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ====================================================== */}
        {/* OUR ORBIT. OUR STRENGTH.                                */}
        {/* ====================================================== */}
        <motion.div
          variants={scrollItemVariants}
          id="orbit-strength"
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        >
          <OrbitStrengthSection
            members={sortedMembers}
            reducedMotion={reducedMotion}
          />
        </motion.div>

        {/* ====================================================== */}
        {/* OUR PRINCIPLES                                          */}
        {/* ====================================================== */}
        <motion.div
          variants={scrollItemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        >
          <PrinciplesSection reducedMotion={reducedMotion} />
        </motion.div>

        {/* ====================================================== */}
        {/* FINAL CTA                                               */}
        {/* ====================================================== */}
        <motion.div
          variants={scrollItemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 border-t border-slate-800/30"
        >
          <SolarCTA reducedMotion={reducedMotion} />
        </motion.div>
      </motion.div>

      {/* Member Profile Console Modal */}
      <AnimatePresence mode="wait">
        {selectedMember && (
          <SolarProfileConsole
            key={selectedMember.id}
            member={selectedMember}
            onClose={closeModal}
            onPrev={selectedIndex > 0 ? goPrev : undefined}
            onNext={selectedIndex < sortedMembers.length - 1 ? goNext : undefined}
          />
        )}
      </AnimatePresence>

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes hero-sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
