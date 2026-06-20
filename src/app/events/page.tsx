"use client";

import { useState, useEffect } from "react";
import { getLocalEvents, EventItem } from "@/data/events";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Cloud,
  Mic,
  Trophy,
  Rocket,
  Users,
  Star,
  Sun,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion } from "framer-motion";

interface DBEventRow {
  id: string;
  title: string;
  slug: string;
  date: string;
  time?: string;
  type: "Workshop" | "Bootcamp" | "Meetup" | "Webinar" | "Hackathon" | "Celebration" | "Community Event" | "Other";
  location: string;
  description: string;
  long_description?: string;
  registration_link: string;
  status: "upcoming" | "completed";
  cover_placeholder_color: "orange" | "blue" | "purple" | "mint" | "amber";
  image_url?: string | null;
}

// ─── Animation variants ─────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ─── Type icon map ───────────────────────────────────────────────
const getTypeIcon = (type: string, className = "h-5 w-5") => {
  switch (type) {
    case "Workshop":
      return <Cloud className={className} />;
    case "Bootcamp":
      return <Rocket className={className} />;
    case "Meetup":
      return <Mic className={className} />;
    case "Webinar":
      return <Rocket className={className} />;
    case "Hackathon":
      return <Trophy className={className} />;
    case "Celebration":
      return <Star className={className} />;
    case "Community Event":
      return <Users className={className} />;
    case "Other":
      return <Sun className={className} />;
    default:
      return <Cloud className={className} />;
  }
};

// ─── Filter types ────────────────────────────────────────────────
type FilterType = "all" | "upcoming" | "completed";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

// ─── Reduced motion hook (inline) ───────────────────────────────
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setTimeout(() => setReduced(mq.matches), 0);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => {
      clearTimeout(timer);
      mq.removeEventListener("change", listener);
    };
  }, []);
  return reduced;
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<FilterType>("all");
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function loadEvents() {
      let eventsList = getLocalEvents();
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data) {
            eventsList = (data as DBEventRow[]).map((d) => ({
              id: d.id,
              title: d.title,
              slug: d.slug,
              date: d.date,
              time: d.time || "",
              type: d.type,
              location: d.location,
              description: d.description,
              longDescription: d.long_description || "",
              registrationLink: d.registration_link,
              status: d.status,
              coverPlaceholderColor: d.cover_placeholder_color,
              imageUrl: d.image_url || "",
            }));
          }
        } catch (err) {
          console.warn("Error loading events from Supabase:", err);
        }
      }
      setEvents(eventsList);
    }
    loadEvents();

    // Listen for custom updates and storage changes
    if (typeof window !== "undefined") {
      window.addEventListener("cms-data-updated", loadEvents);
      window.addEventListener("storage", loadEvents);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cms-data-updated", loadEvents);
        window.removeEventListener("storage", loadEvents);
      }
    };
  }, []);

  // ─── Filtering ──────────────────────────────────────────────────
  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const upcomingCount = upcomingEvents.length;

  // ─── Featured event (first upcoming) ───────────────────────────
  const featuredEvent = upcomingEvents[0] || null;

  // ─── Non-featured upcoming events ──────────────────────────────
  const otherUpcoming = upcomingEvents.filter((e) => e.id !== featuredEvent?.id);

  return (
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-hidden text-slate-300">
      {/* ═══ Background effects ═══ */}
      <EventsBackground reducedMotion={reducedMotion} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-28 md:pb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Hero text */}
            <div className="space-y-6">
              <motion.span
                variants={itemVariants}
                className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block"
              >
                {"// COMMUNITY MISSIONS"}
              </motion.span>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08]"
              >
                Events at <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">RIMT AWS Student Builder Group</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md"
              >
                Workshops, bootcamps, meetups, hackathons, and hands-on sessions designed for builders at RIMT University.
              </motion.p>

              <motion.div variants={itemVariants}>
                <button
                  onClick={() => document.getElementById("events-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,140,0,0.12), rgba(255,140,0,0.06))",
                    border: "1px solid rgba(255,140,0,0.3)",
                    boxShadow: "0 0 15px rgba(255,140,0,0.08), inset 0 0 15px rgba(255,140,0,0.04)",
                  }}
                >
                  {!reducedMotion && (
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
                        animation: "light-sweep 4s ease-in-out infinite",
                      }}
                    />
                  )}
                  <span className="relative z-10 text-orange-400 group-hover:text-white transition-colors">
                    Explore Events
                  </span>
                  <ArrowRight className="relative z-10 h-4 w-4 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </motion.div>
            </div>

            {/* Right - Event Sun */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center"
            >
              <EventSun count={upcomingCount} reducedMotion={reducedMotion} />
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FILTER BAR                                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-12"
          id="events-grid"
        >
          <div className="flex flex-wrap justify-center gap-2 p-3 rounded-2xl border border-slate-800/60 bg-[#0a0f1e]/60 backdrop-blur-sm">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isActive
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_12px_rgba(255,140,0,0.08)]"
                      : "bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/40 hover:-translate-y-0.5"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FEATURED EVENT                                             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {featuredEvent && filter === "all" && (
          <motion.section
            variants={itemVariants}
            className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-16"
          >
            <FeaturedEventCard event={featuredEvent} reducedMotion={reducedMotion} />
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* EVENTS GRID                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-20"
        >
          {/* Section header */}
          {filter === "all" && otherUpcoming.length > 0 && (
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Upcoming Events
              </h2>
              <Link
                href="/events"
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider transition-colors"
              >
                View All Events
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* Grid of event cards */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filter === "all" ? otherUpcoming.concat(events.filter((e) => e.status === "completed")) : filteredEvents)
                .filter((e) => filter === "all" ? e.id !== featuredEvent?.id : true)
                .map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} reducedMotion={reducedMotion} />
                ))}
            </div>
          ) : null}

          {/* Empty state */}
          {events.length === 0 && (
            <EmptyState />
          )}

          {filteredEvents.length === 0 && events.length > 0 && (
            <div className="text-center py-16 rounded-2xl border border-slate-800/40 bg-[#0a0f1e]/40">
              <p className="text-slate-500 text-sm">No events found in this category.</p>
            </div>
          )}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* BOTTOM CTA                                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-20"
        >
          <BottomCTA reducedMotion={reducedMotion} />
        </motion.section>
      </motion.div>

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes light-sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ─── Background ──────────────────────────────────────────────────
function EventsBackground({ reducedMotion }: { reducedMotion: boolean }) {
  const [stars] = useState(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (i * 17 + 7) % 100,
      y: (i * 23 + 13) % 100,
      size: (i % 3) * 0.5 + 0.5,
      opacity: 0.08 + (i % 5) * 0.06,
      duration: 3 + (i % 7),
      delay: (i % 10) * 0.5,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Radial glows */}
      <div
        className="absolute -top-32 -left-32 w-[35rem] h-[35rem] rounded-full animate-pulse-slow"
        style={{ background: "radial-gradient(circle, rgba(255,140,0,0.04) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full animate-pulse-slow"
        style={{ background: "radial-gradient(circle, rgba(255,140,0,0.03) 0%, transparent 70%)", animationDelay: "4s" }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: reducedMotion ? "none" : `star-twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      {!reducedMotion &&
        Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`p-${i}`}
            className="absolute rounded-full bg-orange-500/15 blur-[0.5px]"
            style={{
              left: `${(i * 19 + 11) % 100}%`,
              top: `${(i * 29 + 3) % 100}%`,
              width: 1.5 + (i % 3),
              height: 1.5 + (i % 3),
              animation: `solar-float ${12 + (i % 8) * 2}s linear infinite`,
              animationDelay: `${-(i * 2.5)}s`,
              willChange: "transform",
              transform: "translate3d(0,0,0)",
            }}
          />
        ))}

      <style jsx>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.4; }
        }
        @keyframes solar-float {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate3d(20px, -100px, 0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Event Sun (Hero right side) ─────────────────────────────────
function EventSun({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const orbitItems = [
    { icon: <Cloud className="h-4 w-4" />, label: "Workshop", angle: 0 },
    { icon: <Mic className="h-4 w-4" />, label: "Meetup", angle: 90 },
    { icon: <Trophy className="h-4 w-4" />, label: "Hackathon", angle: 180 },
    { icon: <Rocket className="h-4 w-4" />, label: "Bootcamp", angle: 270 },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
      {/* Outer volumetric glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(255,140,0,0.08) 0%, rgba(255,140,0,0.02) 50%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-orange-500/10 pointer-events-none"
        style={{
          width: 280,
          height: 280,
          animation: reducedMotion ? "none" : "orbit-spin 40s linear infinite",
        }}
      />

      {/* Energy pulse waves */}
      {!reducedMotion && [0, 1, 2].map((i) => (
        <div
          key={`pulse-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 120,
            height: 120,
            border: "1px solid rgba(255,140,0,0.08)",
            animation: "energy-pulse 4s ease-out infinite",
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}

      {/* Solar flare rays */}
      {!reducedMotion && Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`flare-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: 1.5,
            height: 50,
            background: "linear-gradient(to top, rgba(255,140,0,0.12), transparent)",
            transform: `rotate(${i * 60}deg)`,
            transformOrigin: "bottom center",
            left: "calc(50% - 0.75px)",
            bottom: "50%",
            animation: `flare-breathe ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Main sun body */}
      <div
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: 140,
          height: 140,
          background: "radial-gradient(circle at 40% 35%, rgba(255,180,60,0.25), rgba(255,140,0,0.12) 50%, rgba(200,80,0,0.06) 100%)",
          border: "1.5px solid rgba(255,140,0,0.35)",
          boxShadow: "inset 0 0 30px rgba(255,140,0,0.12), 0 0 20px rgba(255,140,0,0.15), 0 0 60px rgba(255,140,0,0.08)",
          animation: reducedMotion ? "none" : "sun-breathe 4s ease-in-out infinite",
        }}
      >
        {/* Rotating conic texture */}
        {!reducedMotion && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "conic-gradient(from 0deg, rgba(255,140,0,0.04), rgba(255,200,100,0.06), rgba(255,140,0,0.02), rgba(255,180,60,0.05), rgba(255,140,0,0.04))",
              animation: "orbit-spin 20s linear infinite",
            }}
          />
        )}

        {/* Count + label */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center select-none">
          <span
            className="text-4xl font-black leading-none"
            style={{
              color: "rgba(255,160,40,0.9)",
              textShadow: "0 0 15px rgba(255,140,0,0.4)",
            }}
          >
            {String(count).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/70 mt-1">
            Upcoming
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/50">
            Events
          </span>
        </div>
      </div>

      {/* Orbiting category icons */}
      {orbitItems.map((item, i) => {
        const radius = 155;
        const angle = item.angle * (Math.PI / 180);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={item.label}
            className="absolute flex flex-col items-center gap-1.5 pointer-events-none"
            style={{
              left: 170 + x - 24,
              top: 170 + y - 24,
              animation: reducedMotion ? "none" : `orbit-item-float ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-orange-500/15 text-orange-400/80 shadow-[0_0_8px_rgba(255,140,0,0.06)]">
              {item.icon}
            </div>
            <span className="text-[9px] font-bold text-orange-400/60 uppercase tracking-wider whitespace-nowrap">
              {item.label}
            </span>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes energy-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes flare-breathe {
          0%, 100% { opacity: 0.5; height: 50px; }
          50% { opacity: 1; height: 65px; }
        }
        @keyframes sun-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes orbit-item-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Featured Event Card ─────────────────────────────────────────
function FeaturedEventCard({
  event,
  reducedMotion,
}: {
  event: EventItem;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative rounded-3xl border overflow-hidden transition-all duration-400"
      style={{
        background: "linear-gradient(135deg, rgba(10,15,30,0.9), rgba(10,15,30,0.7))",
        borderColor: hovered ? "rgba(255,140,0,0.3)" : "rgba(30,41,59,0.6)",
        boxShadow: hovered
          ? "0 0 0 1px rgba(255,140,0,0.1), 0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(255,140,0,0.05)"
          : "0 0 0 1px rgba(255,140,0,0.03), 0 10px 30px rgba(0,0,0,0.2)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left content */}
        <div className="p-8 sm:p-10 lg:p-12 space-y-5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Star className="h-3 w-3" />
            Featured Event
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h3>

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-orange-400/70" />
              {event.date}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-orange-400/70" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5 text-orange-400/70" />
              150 Participants
            </div>
            {event.time && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-orange-400/70" />
                {event.time}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            {event.description}
          </p>

          <Link
            href={`/events/${event.slug}`}
            className="group/btn relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            style={{
              background: "linear-gradient(135deg, rgba(255,140,0,0.15), rgba(255,140,0,0.08))",
              border: "1px solid rgba(255,140,0,0.35)",
              boxShadow: "0 0 12px rgba(255,140,0,0.08)",
            }}
          >
            <span className="text-orange-400 group-hover/btn:text-white transition-colors">
              Register Now
            </span>
            <ArrowRight className="h-4 w-4 text-orange-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Right - AWS cloud illustration area or Custom Event Image */}
        <div className="relative min-h-[250px] lg:min-h-full overflow-hidden flex items-center justify-center">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            />
          ) : (
            <>
              {/* Background glow */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 300,
                  height: 300,
                  background: "radial-gradient(circle, rgba(255,140,0,0.08) 0%, transparent 70%)",
                  filter: "blur(30px)",
                  transform: hovered ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.6s ease",
                }}
              />

              {/* Orbit rings */}
              {!reducedMotion && [100, 150, 200].map((size, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-orange-500/[0.06] pointer-events-none"
                  style={{
                    width: size,
                    height: size,
                    animation: `orbit-spin ${20 + i * 10}s linear infinite`,
                  }}
                />
              ))}

              {/* AWS-style cloud icon */}
              <div
                className="relative flex items-center justify-center transition-transform duration-500"
                style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
              >
                <div className="text-orange-400/50" style={{ filter: "drop-shadow(0 0 20px rgba(255,140,0,0.2))" }}>
                  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="text-orange-400/40">
                    <path
                      d="M97 65H28c-11 0-20-9-20-20s9-20 20-20c1-11 10-20 22-20 10 0 19 7 21 17 3-2 6-3 9-3 8 0 15 7 15 15h2c8 0 14 6 14 14s-6 14-14 14v3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  className="absolute text-3xl font-black select-none"
                  style={{
                    color: "rgba(255,140,0,0.35)",
                    textShadow: "0 0 20px rgba(255,140,0,0.15)",
                    letterSpacing: "0.1em",
                  }}
                >
                  aws
                </span>
              </div>

              {/* Particles */}
              {!reducedMotion && [0, 1, 2, 3].map((i) => (
                <div
                  key={`fp-${i}`}
                  className="absolute rounded-full bg-orange-500/20"
                  style={{
                    width: 2,
                    height: 2,
                    left: `${30 + i * 15}%`,
                    top: `${40 + i * 8}%`,
                    animation: `solar-float ${10 + i * 3}s linear infinite`,
                    animationDelay: `${i * 2}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ──────────────────────────────────────────────────
function EventCard({
  event,
  index,
  reducedMotion,
}: {
  event: EventItem;
  index: number;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isUpcoming = event.status === "upcoming";

  return (
    <div
      className="group relative rounded-2xl border overflow-hidden flex flex-col transition-all"
      style={{
        background: "rgba(10,15,30,0.8)",
        borderColor: hovered ? "rgba(255,140,0,0.25)" : "rgba(30,41,59,0.5)",
        boxShadow: hovered
          ? "0 0 0 1px rgba(255,140,0,0.08), 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(255,140,0,0.04)"
          : "0 4px 16px rgba(0,0,0,0.15)",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/10 to-transparent pointer-events-none z-10" />

      {/* Event Custom Image banner */}
      {event.imageUrl && (
        <div className="h-44 w-full overflow-hidden relative border-b border-slate-900/50">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Glowing planet peek - bottom right */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full pointer-events-none z-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle, rgba(255,140,0,${hovered ? 0.1 : 0.04}) 0%, transparent 70%)`,
          filter: `blur(${hovered ? 8 : 12}px)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex-grow flex flex-col gap-4">
        {/* Status badge */}
        <span
          className={`self-start px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
            isUpcoming
              ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
              : "text-slate-500 bg-slate-900/60 border-slate-800"
          }`}
        >
          {isUpcoming ? "Upcoming" : "Completed"}
        </span>

        {/* Title row */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 ${
              hovered
                ? "bg-orange-500/12 text-orange-400 shadow-[0_0_8px_rgba(255,140,0,0.1)]"
                : "bg-slate-900/60 text-slate-500"
            }`}
            style={{ border: "1px solid", borderColor: hovered ? "rgba(255,140,0,0.2)" : "rgba(30,41,59,0.5)" }}
          >
            {getTypeIcon(event.type)}
          </div>
          <h3 className="text-base font-bold text-white leading-snug tracking-tight mt-0.5">
            {event.title}
          </h3>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mt-auto mb-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 text-orange-400/50 flex-shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
            <MapPin className="h-3.5 w-3.5 text-orange-400/50 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/events/${event.slug}`}
          className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/25 hover:text-white flex items-center justify-center gap-1.5 mt-2 h-11"
        >
          <span>{isUpcoming ? "Register Now" : "View Details"}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Hover particles */}
      {hovered && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-orange-500/25"
              style={{
                width: 2,
                height: 2,
                left: `${20 + i * 25}%`,
                bottom: 0,
                animation: `card-particle ${1.2 + i * 0.3}s ease-out forwards`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes card-particle {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="max-w-lg mx-auto text-center py-20 px-8 rounded-3xl border border-orange-500/15 bg-[#0a0f1e]/60 backdrop-blur-sm space-y-6 shadow-[0_0_40px_rgba(255,140,0,0.03)]">
      <div className="text-5xl">🌞</div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">
          No Upcoming Missions
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          We&apos;re preparing our next event.<br />
          Follow us to stay updated.
        </p>
      </div>
      <a
        href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold overflow-hidden transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(255,140,0,0.15), rgba(255,140,0,0.08))",
          border: "1px solid rgba(255,140,0,0.35)",
          boxShadow: "0 0 12px rgba(255,140,0,0.08)",
        }}
      >
        <span className="text-orange-400 group-hover:text-white transition-colors">
          Join the Club
        </span>
        <ArrowRight className="h-4 w-4 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </a>
    </div>
  );
}

// ─── Bottom CTA ──────────────────────────────────────────────────
function BottomCTA({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative rounded-3xl border border-slate-800/50 bg-[#0a0f1e]/70 backdrop-blur-sm overflow-hidden">
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[320px]">
        {/* Left text */}
        <div className="p-10 sm:p-12 lg:p-16 flex flex-col justify-center space-y-5 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Ready To Join<br />
            The Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_15px_rgba(255,140,0,0.2)]">
              Mission?
            </span>
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Be a part of our upcoming events and build the future with us.
          </p>

          <a
            href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            style={{
              background: "linear-gradient(135deg, rgba(255,140,0,0.15), rgba(255,140,0,0.08))",
              border: "1px solid rgba(255,140,0,0.35)",
              boxShadow: "0 0 15px rgba(255,140,0,0.08)",
            }}
          >
            {!reducedMotion && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
                  animation: "light-sweep 4s ease-in-out infinite",
                }}
              />
            )}
            <span className="relative z-10 text-orange-400 group-hover:text-white transition-colors">
              Join the Club
            </span>
            <ArrowRight className="relative z-10 h-4 w-4 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </a>
        </div>

        {/* Right - Partial sun emerging from bottom-right */}
        <div className="relative flex items-end justify-end overflow-hidden">
          {/* Giant partial sun glow */}
          <div
            className="absolute -bottom-32 -right-32 pointer-events-none"
            style={{
              width: 400,
              height: 400,
              background: "radial-gradient(circle at 30% 30%, rgba(255,140,0,0.12) 0%, rgba(255,140,0,0.04) 40%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(20px)",
            }}
          />

          {/* Orbit rings */}
          {!reducedMotion && [120, 180, 250].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-orange-500/[0.05] pointer-events-none"
              style={{
                width: size,
                height: size,
                bottom: -size / 2 + 20,
                right: -size / 2 + 20,
                animation: `orbit-spin ${25 + i * 10}s linear infinite`,
              }}
            />
          ))}

          {/* Particles */}
          {!reducedMotion && Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`cta-p-${i}`}
              className="absolute rounded-full bg-orange-500/20 pointer-events-none"
              style={{
                width: 2,
                height: 2,
                right: `${10 + i * 12}%`,
                bottom: `${10 + i * 10}%`,
                animation: `solar-float ${8 + i * 3}s linear infinite`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes solar-float {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate3d(20px, -100px, 0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
