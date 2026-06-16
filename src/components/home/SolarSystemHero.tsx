"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Info,
  Calendar,
  Users,
  Camera,
  Trophy,
  Mail,
  ArrowRight,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useReducedMotion } from "@/app/team/hooks/useReducedMotion";
import { CosmicBackground } from "./CosmicBackground";
import { SolarCoreSun } from "./SolarCoreSun";
import { PlanetInfoPanel } from "./PlanetInfoPanel";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getLocalEvents } from "@/data/events";

// ─────────────────────────────────────────────
// PLANET DEFINITIONS
// orbit: inner | mid | outer
// angleDeg: starting angle (0 = top, 90 = right, 180 = bottom, 270 = left)
// ─────────────────────────────────────────────
export interface PlanetDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stats: string[];
  href: string;
  icon: React.ElementType;
  orbit: "inner" | "mid" | "outer";
  angleDeg: number; // initial position on the ring
  orbitSpeed: number; // seconds for one full revolution
  color: string;
}

const PLANETS: PlanetDef[] = [
  // ── INNER RING (2 planets, 180° apart) ──────────────────
  {
    id: "about",
    name: "About",
    tagline: "Who We Are at RIMT",
    description:
      "Discover the mission, vision, and core pillars driving our builder community forward.",
    stats: ["Solar Core", "5 Pillars", "Academic Hub"],
    href: "/about",
    icon: Info,
    orbit: "inner",
    angleDeg: 270, // starts left
    orbitSpeed: 48,
    color: "rgba(255,140,0,1)",
  },
  {
    id: "events",
    name: "Events",
    tagline: "RIMT Workshops & Meetups",
    description:
      "Workshops, bootcamps, hackathons, and meetups designed to level up your cloud skills.",
    stats: ["Workshops", "Bootcamps", "Hackathons"],
    href: "/events",
    icon: Calendar,
    orbit: "inner",
    angleDeg: 90, // starts right — 180° from About
    orbitSpeed: 48,
    color: "rgba(255,160,40,1)",
  },
  // ── MID RING (2 planets, 180° apart) ─────────────────────
  {
    id: "team",
    name: "Team",
    tagline: "Meet the RIMT Builders",
    description:
      "A multidisciplinary leadership team powering cloud innovation at RIMT University.",
    stats: ["6 Builders", "Student Led", "Multi-Track"],
    href: "/team",
    icon: Users,
    orbit: "mid",
    angleDeg: 315, // starts upper-left
    orbitSpeed: 60,
    color: "rgba(255,140,0,1)",
  },
  {
    id: "gallery",
    name: "Gallery",
    tagline: "RIMT Memories",
    description:
      "A visual archive of every event, workshop, and builder moment captured across our journey.",
    stats: ["Photos", "Events", "Memories"],
    href: "/gallery",
    icon: Camera,
    orbit: "mid",
    angleDeg: 135, // 180° from Team
    orbitSpeed: 60,
    color: "rgba(255,180,60,1)",
  },
  // ── OUTER RING (2 planets, 180° apart) ───────────────────
  {
    id: "achievements",
    name: "Achievements",
    tagline: "Mission Milestones",
    description:
      "Milestones, accomplishments, and the roadmap of our growing community impact.",
    stats: ["Milestones", "Roadmap", "Impact"],
    href: "/achievements",
    icon: Trophy,
    orbit: "outer",
    angleDeg: 45, // starts upper-right
    orbitSpeed: 75,
    color: "rgba(255,140,0,1)",
  },
  {
    id: "contact",
    name: "Contact",
    tagline: "Connect with the RIMT Community",
    description:
      "Questions, collaborations, partnerships, or speaker invitations — we are always open.",
    stats: ["Email", "Social", "Partnerships"],
    href: "/contact",
    icon: Mail,
    orbit: "outer",
    angleDeg: 225, // 180° from Achievements
    orbitSpeed: 75,
    color: "rgba(255,160,40,1)",
  },
];

// ─────────────────────────────────────────────
// ORBIT RADII (base values, scaled per viewport)
// ─────────────────────────────────────────────
const ORBIT_RADII = { inner: 175, mid: 260, outer: 350 };

// ─────────────────────────────────────────────
// SINGLE PLANET COMPONENT
// Uses a translate-based CSS animation so the orbit ring never rotates.
// This prevents counter-rotation jitter entirely.
// ─────────────────────────────────────────────
function OrbitPlanet({
  planet,
  radius,
  reducedMotion,
  isDimmed,
  isSelected,
  sunHovered,
  onSelect,
  scaleFactor,
}: {
  planet: PlanetDef;
  radius: number;
  reducedMotion: boolean;
  isDimmed: boolean;
  isSelected: boolean;
  sunHovered: boolean;
  onSelect: (p: PlanetDef) => void;
  scaleFactor: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const Icon = planet.icon;

  const planetSize = Math.round((scaleFactor < 0.6 ? 32 : 42) * Math.max(scaleFactor, 0.7));
  const iconSize = Math.round((scaleFactor < 0.6 ? 13 : 18) * Math.max(scaleFactor, 0.7));
  const fontSize = Math.max(9, Math.round(11 * scaleFactor));
  const subFontSize = Math.max(8, Math.round(9 * scaleFactor));

  // The animation name is unique per planet so each can have its own start angle
  const animName = `orbit-planet-${planet.id}`;
  // Start offset: we delay the animation so the planet begins at angleDeg
  // A negative delay of (angleDeg/360 * duration) puts it at that phase
  const delaySeconds = -(planet.angleDeg / 360) * planet.orbitSpeed;

  const handleClick = () => {
    setClicked(true);
    onSelect(planet);
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <>
      <div
        className="absolute"
        style={{
          width: planetSize,
          height: planetSize,
          top: `calc(50% - ${planetSize / 2}px)`,
          left: `calc(50% - ${planetSize / 2}px)`,
          // Translate-based orbit: starts at (0, -radius) = top, sweeps clockwise
          animation: reducedMotion
            ? "none"
            : `${animName} ${planet.orbitSpeed}s linear infinite`,
          animationDelay: `${delaySeconds}s`,
          opacity: isDimmed ? 0.18 : 1,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: reducedMotion ? 0 : 1.2 + (planet.angleDeg / 360) * 0.4,
          }}
          className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
        >
          <button
            className="group relative flex flex-col items-center cursor-pointer outline-none touch-target-expand"
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label={`Explore ${planet.name}`}
          >
          {/* Planet glow trail (pseudo-orbital afterimage) */}
          {!reducedMotion && (hovered || isSelected) && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: planetSize * 2.4,
                height: planetSize * 2.4,
                top: -(planetSize * 0.7),
                left: -(planetSize * 0.7),
                background:
                  "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)",
                filter: "blur(8px)",
                animation: "planet-aura-pulse 2s ease-in-out infinite",
              }}
            />
          )}

          {/* Planet body */}
          <div
            className="relative flex items-center justify-center rounded-full backdrop-blur-sm"
            style={{
              width: planetSize,
              height: planetSize,
              background:
                hovered || isSelected
                  ? "radial-gradient(circle at 35% 35%, rgba(255,180,60,0.22) 0%, rgba(255,140,0,0.12) 60%, rgba(10,15,30,0.85) 100%)"
                  : clicked
                  ? "rgba(255,140,0,0.25)"
                  : "radial-gradient(circle at 35% 35%, rgba(255,140,0,0.1) 0%, rgba(10,15,30,0.9) 100%)",
              border: `1.5px solid rgba(255,140,0,${hovered || isSelected ? 0.8 : sunHovered ? 0.3 : 0.18})`,
              boxShadow:
                hovered || isSelected
                  ? `0 0 28px rgba(255,140,0,0.55), 0 0 56px rgba(255,140,0,0.25), inset 0 0 16px rgba(255,140,0,0.2)`
                  : clicked
                  ? "0 0 35px rgba(255,140,0,0.6)"
                  : `0 0 10px rgba(255,140,0,0.12)`,
              transform: `scale(${hovered ? 1.18 : sunHovered ? 1.04 : clicked ? 1.18 : 1}) translateY(${hovered ? -3 : 0}px)`,
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Inner shine highlight */}
            <div
              className="absolute top-1 left-2 rounded-full opacity-30 pointer-events-none"
              style={{
                width: planetSize * 0.3,
                height: planetSize * 0.2,
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)",
              }}
            />
            <Icon
              style={{
                width: iconSize,
                height: iconSize,
                color:
                  hovered || isSelected
                    ? "rgba(255,185,70,1)"
                    : "rgba(255,140,0,0.65)",
                filter:
                  hovered || isSelected
                    ? "drop-shadow(0 0 5px rgba(255,140,0,0.6))"
                    : "none",
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            />
          </div>

          {/* Label */}
          <div
            className="mt-2.5 text-center whitespace-nowrap select-none"
            style={{
              transform: hovered ? "translateY(-2px)" : "translateY(0)",
              transition: "transform 0.3s ease",
            }}
          >
            <span
              className="block font-black uppercase transition-all duration-300"
              style={{
                fontSize,
                letterSpacing: hovered ? "0.12em" : "0.08em",
                color:
                  hovered || isSelected
                    ? "#FF8C00"
                    : "rgba(255,255,255,0.85)",
                textShadow:
                  hovered || isSelected
                    ? "0 0 8px rgba(255,140,0,0.4)"
                    : "none",
              }}
            >
              {planet.name}
            </span>
            <span
              className="block text-slate-400 font-medium tracking-wide mt-0.5 transition-all duration-300"
              style={{
                fontSize: subFontSize,
                opacity: hovered || isSelected ? 1 : 0.75,
              }}
            >
              {planet.tagline}
            </span>
          </div>

          {/* Hover tooltip */}
          {hovered && !isSelected && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                top: "calc(100% + 10px)",
                left: "50%",
                transform: "translateX(-50%)",
                width: Math.max(160, 180 * scaleFactor),
                animation: "tooltip-rise 0.2s ease-out forwards",
              }}
            >
              <div
                className="rounded-xl border border-orange-500/20 bg-[#070b19]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.7)] p-3"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent rounded-t-xl" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {planet.description}
                </p>
                <span className="block text-[9px] text-orange-400 font-bold mt-2 uppercase tracking-wider">
                  Click to explore →
                </span>
              </div>
            </div>
          )}
          </button>
        </motion.div>
      </div>

      {/* Per-planet keyframe injected as a style tag */}
      <style>{`
        @keyframes ${animName} {
          0%   { transform: rotate(0deg)   translate(0, -${radius}px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(0, -${radius}px) rotate(-360deg); }
        }
        @keyframes planet-aura-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes tooltip-rise {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────
// ORBIT RING COMPONENT (SVG-based with gradient trail arc)
// ─────────────────────────────────────────────
function OrbitRing({
  radius,
  isActive,
  reducedMotion,
  sunHovered,
}: {
  radius: number;
  isActive: boolean;
  reducedMotion: boolean;
  sunHovered: boolean;
}) {
  const r = radius;
  const size = r * 2 + 4;
  const cx = r + 2;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        top: `calc(50% - ${r + 2}px)`,
        left: `calc(50% - ${r + 2}px)`,
        transition: "opacity 0.5s ease",
        opacity: isActive ? 1 : 0.6,
      }}
    >
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`ring-grad-${r}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,140,0,0)" />
            <stop offset="40%" stopColor={`rgba(255,140,0,${isActive ? 0.35 : sunHovered ? 0.22 : 0.15})`} />
            <stop offset="70%" stopColor={`rgba(255,140,0,${isActive ? 0.25 : 0.12})`} />
            <stop offset="100%" stopColor="rgba(255,140,0,0)" />
          </linearGradient>
        </defs>
        {/* Dashed base ring */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={`rgba(255,140,0,${isActive ? 0.35 : sunHovered ? 0.22 : 0.12})`}
          strokeWidth={isActive ? 1.5 : 1}
          strokeDasharray={isActive ? "none" : "4 6"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          style={{ transition: "stroke 0.5s ease, stroke-width 0.5s ease" }}
        />
        {/* Gradient glow ring overlay */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={`url(#ring-grad-${r})`}
          strokeWidth={isActive ? 3 : 1.5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.6 }}
          style={{
            filter: isActive ? "blur(1px)" : "none",
            transition: "stroke-width 0.5s ease",
          }}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN HERO COMPONENT
// ─────────────────────────────────────────────
export function SolarSystemHero() {
  const reducedMotion = useReducedMotion();
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [sunHovered, setSunHovered] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDef | null>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState<string>("0");

  useEffect(() => {
    async function loadUpcomingEventsCount() {
      let count = 0;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("date, status");
          if (!error && data) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            count = data.filter((d: any) => {
              const parsed = Date.parse(d.date);
              if (isNaN(parsed)) {
                return d.status === "upcoming";
              }
              const eventDate = new Date(parsed);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate.getTime() >= today.getTime();
            }).length;
          }
        } catch (err) {
          console.error("Error fetching events from Supabase:", err);
        }
      } else {
        // Fallback to local storage
        const local = getLocalEvents();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        count = local.filter((ev) => {
          const parsed = Date.parse(ev.date);
          if (isNaN(parsed)) {
            return ev.status === "upcoming";
          }
          const eventDate = new Date(parsed);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() >= today.getTime();
        }).length;
      }
      setUpcomingEventsCount(String(count));
    }

    loadUpcomingEventsCount();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      if (!isSupabaseConfigured || !supabase) {
        loadUpcomingEventsCount();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Supabase Real-time listener
    let channel: any;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel("realtime-events-count")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "events" },
          () => {
            loadUpcomingEventsCount();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 380)       setScaleFactor(0.42);
      else if (w < 480)  setScaleFactor(0.55);
      else if (w < 640)  setScaleFactor(0.68);
      else if (w < 768)  setScaleFactor(0.78);
      else if (w < 1024) setScaleFactor(0.88);
      else if (w < 1280) setScaleFactor(0.95);
      else if (w < 1600) setScaleFactor(1.05);
      else               setScaleFactor(1.15);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setMouseX(((e.clientX - rect.left) / rect.width - 0.5) * 2);
      setMouseY(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    },
    [reducedMotion]
  );

  const handlePlanetSelect = useCallback(
    (planet: PlanetDef) => {
      setSelectedPlanet((prev) => (prev?.id === planet.id ? null : planet));
    },
    []
  );

  const handleClosePanel = useCallback(() => setSelectedPlanet(null), []);

  // Compute scaled radii
  const innerR = Math.round(ORBIT_RADII.inner * scaleFactor);
  const midR   = Math.round(ORBIT_RADII.mid   * scaleFactor);
  const outerR = Math.round(ORBIT_RADII.outer  * scaleFactor);

  const getRadius = (orbit: PlanetDef["orbit"]) =>
    orbit === "inner" ? innerR : orbit === "mid" ? midR : outerR;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <section
      className="relative w-full h-auto lg:h-[calc(100vh-5rem)] min-h-[650px] lg:max-h-[1000px] bg-[#050816] bg-grid-pattern overflow-hidden pt-6 pb-8 lg:py-0"
      onMouseMove={handleMouseMove}
    >
      {/* Cosmic Background */}
      <CosmicBackground reducedMotion={reducedMotion} />

      {/* Main content grid */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">

            {/* ── LEFT: Text & CTAs ─────────────────────────── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 xl:col-span-6 space-y-6 z-20 relative text-center lg:text-left flex flex-col items-center lg:items-start"
            >
              <motion.span
                variants={itemVariants}
                className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block"
              >
                {"// BUILD • LEARN • LEAD"}
              </motion.span>

              <motion.h1
                variants={itemVariants}
                className="text-fluid-hero font-black text-white tracking-tight leading-[1.1]"
              >
                One Community. Six Worlds.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
                  Infinite Possibilities.
                </span>
              </motion.h1>

              {/* Institutional Collaboration Notice */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center lg:justify-start gap-2.5 pt-0.5 select-none"
              >
                <div className="flex items-center gap-1.5 opacity-40 hover:opacity-70 transition-opacity duration-300 flex-shrink-0">
                  <img
                    src="/brand/rimt-university.jpg"
                    alt="RIMT University"
                    className="h-4.5 w-auto object-contain brightness-0 invert"
                  />
                  <img
                    src="/brand/dri-lab.png"
                    alt="DRI Lab"
                    className="h-4.5 w-auto object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 tracking-wide text-left leading-normal">
                  An initiative under RIMT University in collaboration with the DRI Lab.
                </span>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-slate-400 text-sm leading-relaxed max-w-md"
              >
                Explore a universe of RIMT Builders, events, memories, milestones,
                and opportunities designed to inspire the next generation of
                cloud innovators.
              </motion.p>

              {/* Community Metrics Cards */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-3.5 w-full max-w-md pt-2 select-none"
              >
                {[
                  { value: "150+", label: "Members" },
                  { value: upcomingEventsCount, label: upcomingEventsCount === "1" ? "Upcoming Event" : "Upcoming Events" },
                  { value: "100%", label: "Student-Led" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-xl bg-[#090e1a]/80 border border-slate-900 hover:border-orange-500/25 transition-all duration-300 shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500/40 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
                      {stat.value}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5 line-clamp-2 max-w-[90px] leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                {/* Primary CTA */}
                <a
                  href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff8c00 0%, #ff5500 100%)",
                    border: "1px solid #ff9900",
                    boxShadow:
                      "0 0 25px rgba(255,140,0,0.25), 0 4px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Light sweep */}
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)",
                      animation: reducedMotion
                        ? "none"
                        : "btn-sweep 4s ease-in-out infinite",
                    }}
                  />
                  <span className="relative z-10 text-white font-extrabold transition-colors">
                    Join Our Club
                  </span>
                  <ArrowRight className="relative z-10 h-4 w-4 text-white group-hover:translate-x-1 transition-all" />
                </a>

                {/* Secondary CTA */}
                <Link
                  href="/events"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 border border-slate-800/80 bg-slate-950/20 hover:text-white hover:border-slate-700 transition-all duration-300"
                >
                  <Compass className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Discover Our Community
                </Link>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Solar System ───────────────────────── */}
            <div
              className="lg:col-span-6 xl:col-span-6 relative h-[300px] sm:h-[420px] md:h-[520px] lg:h-full flex items-center justify-center"
            >
              {/* Parallax wrapper */}
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `translate3d(${mouseX * -3}px, ${mouseY * -3}px, 0)`,
                  transition: "transform 0.5s ease-out",
                  willChange: "transform",
                }}
              >
                {/* ── ORBIT RINGS ────────────────── */}
                <OrbitRing
                  radius={innerR}
                  isActive={
                    selectedPlanet?.orbit === "inner" ||
                    (!selectedPlanet && sunHovered)
                  }
                  reducedMotion={reducedMotion}
                  sunHovered={sunHovered}
                />
                <OrbitRing
                  radius={midR}
                  isActive={
                    selectedPlanet?.orbit === "mid" ||
                    (!selectedPlanet && sunHovered)
                  }
                  reducedMotion={reducedMotion}
                  sunHovered={sunHovered}
                />
                <OrbitRing
                  radius={outerR}
                  isActive={
                    selectedPlanet?.orbit === "outer" ||
                    (!selectedPlanet && sunHovered)
                  }
                  reducedMotion={reducedMotion}
                  sunHovered={sunHovered}
                />

                {/* ── SOLAR CORE ─────────────────── */}
                <SolarCoreSun
                  reducedMotion={reducedMotion}
                  mouseX={mouseX}
                  mouseY={mouseY}
                  isHovered={sunHovered}
                  onHover={setSunHovered}
                  scaleFactor={scaleFactor}
                  sunPulsed={selectedPlanet !== null}
                />

                {/* ── ORBITING PLANETS ───────────── */}
                {PLANETS.map((planet) => (
                  <OrbitPlanet
                    key={planet.id}
                    planet={planet}
                    radius={getRadius(planet.orbit)}
                    reducedMotion={reducedMotion}
                    isDimmed={
                      selectedPlanet !== null &&
                      selectedPlanet.id !== planet.id
                    }
                    isSelected={selectedPlanet?.id === planet.id}
                    sunHovered={sunHovered}
                    onSelect={handlePlanetSelect}
                    scaleFactor={scaleFactor}
                  />
                ))}
              </div>

              {/* Planet Info Panel */}
              <PlanetInfoPanel
                planet={selectedPlanet}
                onClose={handleClosePanel}
                reducedMotion={reducedMotion}
              />

              {/* Discovery Hint */}
              <div
                className="absolute left-1/2 -translate-x-1/2 text-center select-none pointer-events-none z-20"
                style={{
                  top: scaleFactor < 0.6 
                    ? `calc(50% + ${outerR + 12}px)` 
                    : `calc(50% + ${outerR + 24}px)`
                }}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-orange-400/40">
                  Click any orbit to explore
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes btn-sweep {
          0%, 100% { transform: translateX(-200%); }
          50%       { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}
