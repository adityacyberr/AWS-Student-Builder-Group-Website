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
import { BottomSheet } from "./components/BottomSheet";
import { OrbitStrengthSection } from "./components/OrbitStrengthSection";
import { BuilderJourneySection } from "./components/BuilderJourneySection";
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
  const [activeMobileMember, setActiveMobileMember] = useState<TeamMember | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [sunHovered, setSunHovered] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const [parallax, setParallax] = useState({
    core: { x: 0, y: 0 },
    orbits: { x: 0, y: 0 },
    avatars: { x: 0, y: 0 },
  });
  const [loadStage, setLoadStage] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates: range -1 to 1 relative to center
    const normX = (x - rect.width / 2) / (rect.width / 2);
    const normY = (y - rect.height / 2) / (rect.height / 2);
    
    setMousePos({ x, y });
    setParallax({
      core: { x: normX * 5, y: normY * 5 },
      orbits: { x: normX * 10, y: normY * 10 },
      avatars: { x: normX * 18, y: normY * 18 },
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: -9999, y: -9999 });
    setParallax({
      core: { x: 0, y: 0 },
      orbits: { x: 0, y: 0 },
      avatars: { x: 0, y: 0 },
    });
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadStage(1), 500),  // 0.5s: Solar Core glows in
      setTimeout(() => setLoadStage(2), 1000), // 1.0s: Orbit rings draw
      setTimeout(() => setLoadStage(3), 1500), // 1.5s: Orange particles appear
      setTimeout(() => setLoadStage(4), 2000), // 2.0s: Members fly in
      setTimeout(() => setLoadStage(5), 2500), // 2.5s: Rotation begins
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setScaleFactor(0.42);
      } else if (w < 768) {
        setScaleFactor(0.65);
      } else if (w < 1280) {
        setScaleFactor(0.8);
      } else {
        setScaleFactor(1.0);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadTeam() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .order("display_order", { ascending: true });
          if (!error && data && data.length > 0) {
            const dbMembers = (data as DBTeamMemberRow[]).map((d) => ({
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
            setMembers(dbMembers);
            return;
          }
        } catch (err) {
          console.warn("Error loading team from Supabase:", err);
        }
      }

      // Fallback: use static data only if Supabase is not configured or returned nothing
      const unique = new Map<string, TeamMember>();
      TEAM_MEMBERS.forEach((member) => {
        const key = `${member.name.toLowerCase()}-${member.role.toLowerCase()}`;
        if (!unique.has(key)) {
          unique.set(key, member);
        }
      });
      setMembers(Array.from(unique.values()));
    }

    loadTeam();

    // Listen for CMS data updates (same-tab from admin portal)
    const handleUpdate = () => { loadTeam(); };
    window.addEventListener("cms-data-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cms-data-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.displayOrder - b.displayOrder),
    [members]
  );

  const openMember = useCallback((member: TeamMember) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setActiveMobileMember(member);
    } else {
      setSelectedMember(member);
    }
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
            <div className="space-y-6 relative z-20 text-center lg:text-left flex flex-col items-center lg:items-start">
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
                Meet the Builders<br />
                of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_25px_rgba(255,140,0,0.3)]">RIMT</span>
              </motion.h1>

              {/* Supporting text */}
              <motion.div variants={scrollItemVariants} className="space-y-1 max-w-md">
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  The founding team driving cloud learning, hands-on innovation, workshops, and community initiatives across RIMT University.
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
              className="relative flex items-center justify-center w-full z-20"
            >
              {/* Solar system container (concentric centered relative container) */}
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full aspect-square max-w-[850px] mx-auto bg-transparent"
              >
                {/* The Sun at the center */}
                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${parallax.core.x}px), calc(-50% + ${parallax.core.y}px)) scale(${scaleFactor})`,
                    transformOrigin: "center center",
                    transition: reducedMotion ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                    zIndex: 20,
                  }}
                >
                  <SolarCore
                    isHovered={sunHovered || hoveredMember !== null}
                    onHover={setSunHovered}
                    reducedMotion={reducedMotion}
                    visible={loadStage >= 1}
                  />
                </div>

                {/* Orbiting Planet Members */}
                {sortedMembers.length > 0 && (
                  <OrbitingPlanets
                    members={sortedMembers}
                    sunHovered={sunHovered}
                    selectedId={selectedMember?.id ?? null}
                    onSelect={openMember}
                    reducedMotion={reducedMotion}
                    scaleFactor={scaleFactor}
                    mousePos={mousePos}
                    parallaxOrbits={parallax.orbits}
                    parallaxAvatars={parallax.avatars}
                    loadStage={loadStage}
                    onHoverMember={setHoveredMember}
                  />
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
        {/* OUR BUILDER JOURNEY                                     */}
        {/* ====================================================== */}
        <motion.div
          variants={scrollItemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        >
          <BuilderJourneySection reducedMotion={reducedMotion} />
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

      {/* Mobile Bottom Sheet Summary */}
      <BottomSheet
        member={activeMobileMember}
        onClose={() => setActiveMobileMember(null)}
        onViewProfile={(member) => {
          setSelectedMember(member);
        }}
      />

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
