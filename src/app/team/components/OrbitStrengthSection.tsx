"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { TeamMember } from "@/data/team";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  GitPullRequest,
  DollarSign,
  Megaphone,
  Calendar,
  Camera,
  User,
  Quote,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";

/* ───────────────────────────── Icons ───────────────────────────── */

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

/* ───────────────────────────── Helpers ─────────────────────────── */

const getRoleIcon = (role: string, className = "h-5 w-5") => {
  switch (role) {
    case "Group Leader": return <Terminal className={className} />;
    case "Technical Head": return <GitPullRequest className={className} />;
    case "Treasurer": return <DollarSign className={className} />;
    case "Marketing Head": return <Megaphone className={className} />;
    case "Event Head": return <Calendar className={className} />;
    case "Director of Photography": return <Camera className={className} />;
    default: return <User className={className} />;
  }
};

const getRoleShortName = (role: string) => {
  switch (role) {
    case "Director of Photography": return "Photography Head";
    default: return role;
  }
};

const getRoleSubtitle = (role: string) => {
  switch (role) {
    case "Group Leader": return "Vision & Direction";
    case "Technical Head": return "Tech & Innovation";
    case "Marketing Head": return "Outreach & Branding";
    case "Event Head": return "Events & Engagement";
    case "Director of Photography": return "Moments & Stories";
    case "Treasurer": return "Finance & Resources";
    default: return "";
  }
};

/* ──────────────────── Split quote into lines ──────────────────── */
const splitQuoteIntoLines = (quote: string): string[] => {
  // Split on sentence boundaries (. , — ;) but keep short fragments together
  const parts = quote.split(/(?<=[.!?;—])\s+/).filter(Boolean);
  if (parts.length <= 1) {
    // Fallback: split into roughly equal chunks of ~8 words
    const words = quote.split(" ");
    const chunkSize = Math.ceil(words.length / Math.max(2, Math.ceil(words.length / 8)));
    const lines: string[] = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      lines.push(words.slice(i, i + chunkSize).join(" "));
    }
    return lines;
  }
  return parts;
};

/* ───────────────────────── Animation Variants ─────────────────── */

// Direction-aware profile card animations
const getProfileVariants = (direction: "down" | "up") => ({
  initial: {
    opacity: 0,
    y: direction === "down" ? 40 : -40,
    scale: 0.95,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: direction === "down" ? -30 : 30,
    scale: 0.95,
    filter: "blur(4px)",
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
});

// Stagger container for inner content
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// Quote line reveal
const quoteLineVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// Focus tag spring-in
const focusTagVariants = {
  initial: { opacity: 0, scale: 0.8, x: -12 },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 22,
    },
  },
};

// Social link fade-in
const socialLinkVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// Number flip for counter
const numberFlipVariants = (direction: "down" | "up") => ({
  initial: { opacity: 0, y: direction === "down" ? 14 : -14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: direction === "down" ? -14 : 14,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
});

/* ───────────────────────── Component ──────────────────────────── */

interface OrbitStrengthSectionProps {
  members: TeamMember[];
  reducedMotion: boolean;
}

export function OrbitStrengthSection({ members, reducedMotion }: OrbitStrengthSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [isStickyEnabled, setIsStickyEnabled] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevIndexRef = useRef(0);

  // ─── Responsive: enable sticky only on tall screens ───
  useEffect(() => {
    const checkHeight = () => {
      setIsStickyEnabled(window.innerHeight >= 650);
    };
    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  // ─── IntersectionObserver: auto-select first member on viewport entry ───
  useEffect(() => {
    if (!containerRef.current || !isStickyEnabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered) {
          setHasEntered(true);
          setActiveIndex(0);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isStickyEnabled, hasEntered]);

  // ─── Scroll-driven index mapping ───
  useEffect(() => {
    if (!isStickyEnabled) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // The sticky container has top-20 (80px) offset
      const scrollableDistance = elementHeight - viewportHeight + 80;
      const scrolled = -rect.top + 80;

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

      const n = members.length;
      const index = Math.min(Math.floor(progress * n), n - 1);

      if (index !== prevIndexRef.current) {
        setScrollDirection(index > prevIndexRef.current ? "down" : "up");
        prevIndexRef.current = index;
        setActiveIndex(index);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isStickyEnabled, members.length]);

  // ─── Scroll page to bring a specific member into view ───
  const scrollToMember = useCallback((index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const totalHeight = rect.height;
    const viewportHeight = window.innerHeight;
    const scrollable = totalHeight - viewportHeight;

    const progress = (index + 0.5) / members.length;

    window.scrollTo({
      top: absoluteTop + progress * scrollable,
      behavior: "smooth",
    });
  }, [members.length]);

  const handleCardClick = useCallback((index: number) => {
    if (isStickyEnabled) {
      scrollToMember(index);
    } else {
      setScrollDirection(index > activeIndex ? "down" : "up");
      setActiveIndex(index);
    }
  }, [isStickyEnabled, scrollToMember, activeIndex]);

  const goNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % members.length;
    if (isStickyEnabled) {
      scrollToMember(nextIndex);
    } else {
      setScrollDirection("down");
      setActiveIndex(nextIndex);
    }
  }, [activeIndex, members.length, isStickyEnabled, scrollToMember]);

  const goPrev = useCallback(() => {
    const prevIndex = (activeIndex - 1 + members.length) % members.length;
    if (isStickyEnabled) {
      scrollToMember(prevIndex);
    } else {
      setScrollDirection("up");
      setActiveIndex(prevIndex);
    }
  }, [activeIndex, members.length, isStickyEnabled, scrollToMember]);

  // ─── Auto-scroll active role card into horizontal view on mobile ───
  useEffect(() => {
    if (buttonRefs.current[activeIndex]) {
      buttonRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  if (members.length === 0) return null;

  const activeMember = members[activeIndex];
  const quoteLines = splitQuoteIntoLines(activeMember.quote);
  const profileVariants = getProfileVariants(scrollDirection);
  const counterVariants = numberFlipVariants(scrollDirection);

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      style={{ height: isStickyEnabled ? "600vh" : "auto" }}
    >
      <div
        className={
          isStickyEnabled
            ? "sticky top-20 min-h-[calc(100vh-80px)] flex flex-col justify-center py-6 overflow-hidden"
            : "relative py-12 md:py-24"
        }
        style={{ willChange: "transform" }}
      >
        {/* ─── Section Header ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mb-8 items-end">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4">
              {"// OUR ORBIT. OUR STRENGTH"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Different Orbits.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_15px_rgba(255,140,0,0.2)]">
                One Solar Core.
              </span>
            </h2>
          </div>
          <div>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Each member brings unique strengths, ideas, and energy to fuel our mission and community.
            </p>
          </div>
        </div>

        {/* ─── Role Orbit Selector ─── */}
        <div className="relative mb-10">
          {/* Central connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent -translate-y-1/2 pointer-events-none" />

          <div className="flex overflow-x-auto md:grid md:grid-cols-6 gap-3 md:gap-4 relative z-10 scrollbar-none pb-3 pt-1 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
            {members.map((member, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={member.id}
                  ref={(el) => { buttonRefs.current[i] = el; }}
                  onClick={() => handleCardClick(i)}
                  className={`group relative flex flex-col items-center gap-2 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0 w-[140px] md:w-auto snap-center ${
                    isActive
                      ? "bg-orange-500/10 border-orange-500 -translate-y-1 scale-[1.02] orbit-card-active"
                      : "bg-slate-950/60 border-slate-800/60 hover:border-orange-500/20 hover:bg-slate-900/40 hover:-translate-y-0.5"
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow:
                            "0 0 25px rgba(255,140,0,0.25), 0 0 50px rgba(255,140,0,0.08), 0 8px 32px rgba(0,0,0,0.4)",
                        }
                      : undefined
                  }
                >
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(255,140,0,0.15)]"
                        : "bg-slate-900/60 text-slate-500 group-hover:text-orange-400/60"
                    }`}
                  >
                    {getRoleIcon(member.role)}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight transition-colors ${
                      isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {getRoleShortName(member.role)}
                  </span>
                  <span
                    className={`text-[8px] sm:text-[9px] text-center leading-tight transition-colors ${
                      isActive ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {getRoleSubtitle(member.role)}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="orbit-active-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,140,0,0.5)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Profile Console ─── */}
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeMember.id}
              variants={reducedMotion ? undefined : profileVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative rounded-3xl border border-slate-800/70 bg-[#0a0f1e]/85 backdrop-blur-xl overflow-hidden"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,140,0,0.06), 0 20px 60px rgba(0,0,0,0.4)",
                willChange: "transform, opacity, filter",
              }}
            >
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none z-10" />

              {/* Background orbits */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[150, 250, 350].map((size, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-orange-500/[0.03]"
                    style={{
                      width: size,
                      height: size,
                      right: -size / 3,
                      top: "50%",
                      marginTop: -size / 2,
                      animation: reducedMotion
                        ? "none"
                        : `orbit-bg ${25 + i * 12}s linear infinite`,
                    }}
                  />
                ))}
              </div>

              <motion.div
                className="relative z-10 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 p-5 sm:p-8 lg:p-10"
                variants={reducedMotion ? undefined : staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* ─── Left: Avatar with orbit ring & particles ─── */}
                <motion.div
                  className="flex flex-col items-center gap-4"
                  variants={fadeIn}
                >
                  <div className="relative" style={{ willChange: "transform" }}>
                    {/* Rotating orbit ring with pulse effect */}
                    <div
                      key={`orbit-pulse-${activeMember.id}`}
                      className="absolute -inset-4 rounded-full pointer-events-none"
                      style={{
                        animation: reducedMotion
                          ? "none"
                          : "orbit-pulse-once 0.8s ease-out forwards",
                      }}
                    >
                      {!reducedMotion && (
                        <div
                          className="w-full h-full rounded-full border border-orange-500/15"
                          style={{ animation: "orbit-bg 10s linear infinite" }}
                        >
                          <div
                            className="absolute rounded-full bg-orange-400"
                            style={{
                              width: 5,
                              height: 5,
                              top: -2.5,
                              left: "50%",
                              marginLeft: -2.5,
                              boxShadow: "0 0 8px rgba(255,140,0,0.5)",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Soft orange halo */}
                    <div
                      className="absolute inset-[-10px] rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)",
                        animation: reducedMotion ? "none" : "halo-pulse 2.5s ease-in-out infinite",
                      }}
                    />

                    {/* Glowing particles orbiting the member image */}
                    {!reducedMotion &&
                      [1, 2, 3, 4].map((id) => (
                        <div
                          key={`particle-${activeMember.id}-${id}`}
                          className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 pointer-events-none"
                          style={{
                            left: "50%",
                            top: "50%",
                            boxShadow: "0 0 8px rgba(255, 140, 0, 0.8)",
                            animation: `particle-orbit-${id} ${4 + id * 1.5}s linear infinite`,
                            animationDelay: `${id * -0.7}s`,
                          }}
                        />
                      ))}

                    {/* Glow */}
                    <div className="absolute inset-0 rounded-full bg-orange-500/8 blur-xl pointer-events-none" />

                    <motion.div
                      className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-orange-500/25"
                      initial={{ scale: 1, boxShadow: "0 0 0px rgba(255,140,0,0)" }}
                      animate={{
                        scale: 1.05,
                        boxShadow: "0 0 30px rgba(255,140,0,0.18)",
                      }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      style={{ willChange: "transform" }}
                    >
                      {activeMember.photo ? (
                        <Image
                          src={activeMember.photo}
                          alt={activeMember.name}
                          fill
                          sizes="(max-width: 640px) 112px, 160px"
                          priority
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <span className="text-3xl font-black text-orange-400/80">
                            {activeMember.initials}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={goPrev}
                        className="p-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        aria-label="Previous member"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Animated counter */}
                      <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={`counter-${activeIndex}`}
                            variants={counterVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="text-orange-400 font-bold inline-block"
                          >
                            {String(activeIndex + 1).padStart(2, "0")}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-500">
                          {String(members.length).padStart(2, "0")}
                        </span>
                      </div>

                      <button
                        onClick={goNext}
                        className="p-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        aria-label="Next member"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      {members.map((_, idx) => (
                        <div
                          key={idx}
                          className="relative"
                          style={{ width: 8, height: 8 }}
                        >
                          {/* Base dot */}
                          <div
                            className="absolute inset-0 rounded-full transition-all duration-500 ease-out"
                            style={{
                              background:
                                idx <= activeIndex
                                  ? "rgb(249, 115, 22)"
                                  : "rgb(30, 41, 59)",
                              boxShadow:
                                idx <= activeIndex
                                  ? "0 0 8px rgba(255,140,0,0.6)"
                                  : "none",
                              transform:
                                idx === activeIndex
                                  ? "scale(1.3)"
                                  : "scale(1)",
                            }}
                          />
                          {/* Active dot pulse */}
                          {idx === activeIndex && !reducedMotion && (
                            <div
                              className="absolute inset-0 rounded-full bg-orange-500/40"
                              style={{
                                animation:
                                  "dot-pulse 2s ease-in-out infinite",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ─── Right: Details with staggered reveals ─── */}
                <div className="space-y-4">
                  {/* Role badge */}
                  <motion.div variants={fadeSlideUp}>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {getRoleIcon(activeMember.role, "h-3 w-3")}
                      {activeMember.role}
                    </div>
                  </motion.div>

                  {/* Name */}
                  <motion.h3
                    variants={fadeSlideUp}
                    className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                  >
                    {activeMember.name}
                  </motion.h3>

                  {/* Quote — line-by-line reveal */}
                  <motion.div
                    variants={fadeSlideUp}
                    className="relative bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-4"
                  >
                    <Quote className="absolute top-3 left-3 h-4 w-4 text-orange-500/30" />
                    <div className="pl-6 space-y-0.5">
                      <motion.span
                        className="text-sm text-slate-200 italic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        &ldquo;
                      </motion.span>
                      {quoteLines.map((line, lineIdx) => (
                        <motion.p
                          key={`${activeMember.id}-qline-${lineIdx}`}
                          variants={quoteLineVariants}
                          initial="initial"
                          animate="animate"
                          transition={{
                            delay: 0.25 + lineIdx * 0.12,
                          }}
                          className="text-sm text-slate-200 italic leading-relaxed"
                        >
                          {line}
                          {lineIdx === quoteLines.length - 1 && (
                            <span>&rdquo;</span>
                          )}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>

                  {/* Bio */}
                  <motion.p
                    variants={fadeSlideUp}
                    className="text-sm text-slate-400 leading-relaxed"
                  >
                    {activeMember.bio}
                  </motion.p>

                  {/* Focus Areas — spring-staggered one-by-one */}
                  <motion.div variants={fadeSlideUp} className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-400/70">
                      Focus Areas
                    </h4>
                    <motion.div
                      key={`focus-anim-${activeMember.id}`}
                      initial="initial"
                      animate="animate"
                      variants={{
                        initial: {},
                        animate: {
                          transition: {
                            staggerChildren: 0.08,
                            delayChildren: 0.35,
                          },
                        },
                      }}
                      className="flex flex-wrap gap-2"
                    >
                      {activeMember.focusAreas.map((area) => (
                        <motion.span
                          key={area}
                          variants={focusTagVariants}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-300 transition-all cursor-default"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                          {area}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Social Links — delayed fade-in */}
                  <motion.div
                    variants={socialLinkVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.55 }}
                    className="flex items-center gap-3 pt-4 border-t border-slate-800/50"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mr-1">
                      Connect
                    </span>
                    {activeMember.linkedin &&
                      activeMember.linkedin !== "javascript:void(0)" && (
                        <motion.a
                          href={activeMember.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.4 }}
                        >
                          <LinkedInIcon className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                          <span className="text-xs">LinkedIn</span>
                        </motion.a>
                      )}
                    <motion.a
                      href={`mailto:awsbuild@rimt.ac.in?subject=Reaching%20out%20to%20${encodeURIComponent(activeMember.name)}`}
                      className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <Mail className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                      <span className="text-xs">Email</span>
                    </motion.a>
                  </motion.div>
                </div>
              </motion.div>

              <p className="text-[9px] font-mono text-slate-700 text-center pb-4 uppercase tracking-widest">
                {isStickyEnabled
                  ? "Scroll to explore team members"
                  : "Click cards to explore"}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit-bg {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbit-pulse-once {
          0% {
            transform: scale(1);
            border-color: rgba(255, 140, 0, 0.15);
            box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
          }
          50% {
            transform: scale(1.1);
            border-color: rgba(255, 140, 0, 0.7);
            box-shadow: 0 0 20px 4px rgba(255, 140, 0, 0.3);
          }
          100% {
            transform: scale(1);
            border-color: rgba(255, 140, 0, 0.15);
            box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
          }
        }
        @keyframes halo-pulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
        @keyframes dot-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes orbit-card-pulse {
          0%,
          100% {
            transform: translateY(-4px) scale(1.02);
          }
          50% {
            transform: translateY(-4px) scale(1.04);
          }
        }
        .orbit-card-active {
          animation: orbit-card-pulse 2.5s ease-in-out infinite;
        }
        @keyframes particle-orbit-1 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(70px)
              rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(70px)
              rotate(-360deg);
            opacity: 0;
          }
        }
        @keyframes particle-orbit-2 {
          0% {
            transform: translate(-50%, -50%) rotate(120deg) translateY(85px)
              rotate(-120deg);
            opacity: 0;
          }
          15% {
            opacity: 0.7;
          }
          85% {
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) rotate(480deg) translateY(85px)
              rotate(-480deg);
            opacity: 0;
          }
        }
        @keyframes particle-orbit-3 {
          0% {
            transform: translate(-50%, -50%) rotate(240deg) translateX(80px)
              rotate(-240deg);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) rotate(600deg) translateX(80px)
              rotate(-600deg);
            opacity: 0;
          }
        }
        @keyframes particle-orbit-4 {
          0% {
            transform: translate(-50%, -50%) rotate(60deg) translateY(-75px)
              rotate(-60deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) rotate(420deg) translateY(-75px)
              rotate(-420deg);
            opacity: 0;
          }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
