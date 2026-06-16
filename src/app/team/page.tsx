"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowRight, Infinity, Sparkles, Heart, Target } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useReducedMotion } from "./hooks/useReducedMotion";
import { SolarBackground } from "./components/SolarBackground";
import { SolarProfileConsole } from "./components/SolarProfileConsole";
import { BottomSheet } from "./components/BottomSheet";
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

const opacityOnlyVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
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
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-x-clip text-slate-300">
      {/* Shared living background */}
      <SolarBackground reducedMotion={reducedMotion} />

      <motion.div
        variants={scrollContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* ====================================================== */}
        {/* OUR ORBIT. OUR STRENGTH.                                */}
        {/* ====================================================== */}
        <motion.div
          variants={opacityOnlyVariants}
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
