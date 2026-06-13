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
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

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
/* Floating Particles Component                                        */
/* ------------------------------------------------------------------ */
function FloatingParticles({ count = 15, active = true }: { count?: number; active?: boolean }) {
  const [particles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>(() => {
    if (!active) return [];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1, // 1px to 3.5px
      duration: Math.random() * 12 + 10, // 10s to 22s
      delay: Math.random() * -20, // Pre-animated
    }));
  });

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-orange-500/10 blur-[0.5px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float-particle ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-80px) translateX(15px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Border Tracer Animation Component                                   */
/* ------------------------------------------------------------------ */
const BorderTracer = () => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" fill="none">
      <motion.rect
        x="0.5"
        y="0.5"
        width="99.7%"
        height="99.7%"
        rx="24"
        stroke="rgba(249,115,22,0.4)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Member Card Component                                               */
/* ------------------------------------------------------------------ */
function MemberCard({
  member,
  onOpen,
  isDimmed,
}: {
  member: TeamMember;
  onOpen: () => void;
  isDimmed: boolean;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={onOpen}
      onMouseMove={handleMouseMove}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`View details for ${member.name}`}
      className={`group relative w-full text-left rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${
        isDimmed 
          ? "border-slate-900 bg-slate-950/20 opacity-30 blur-[2px] pointer-events-none scale-[0.98]" 
          : "border-slate-800/80 bg-slate-950/60 backdrop-blur-sm hover:border-orange-500/40 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_12px_40px_-12px_rgba(255,140,0,0.25),inset_0_0_12px_rgba(255,140,0,0.05)]"
      }`}
    >
      {/* Cursor Follow Light Overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
        style={{
          background: "radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.08), transparent 40%)"
        }}
      />

      {/* Hover glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none motion-reduce:transition-none z-0" />

      {/* Card Content */}
      <div className="relative p-6 flex flex-col items-center gap-4 z-10">
        {/* Avatar */}
        <motion.div 
          layoutId={`avatar-container-${member.id}`}
          className="relative h-28 w-28 rounded-2xl ring-2 ring-slate-800 group-hover:ring-orange-500/50 group-hover:shadow-[0_0_20px_rgba(255,140,0,0.15)] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-lg motion-reduce:transition-none"
        >
          {member.photo ? (
            <motion.div 
              layoutId={`avatar-img-${member.id}`}
              className="absolute inset-0"
            >
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="112px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </motion.div>
          ) : (
            <motion.span 
              layoutId={`avatar-initials-${member.id}`}
              className="text-2xl font-black text-orange-400/80 tracking-wider"
            >
              {member.initials}
            </motion.span>
          )}
          {/* Photo overlay on hover */}
          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition-colors duration-300 motion-reduce:transition-none" />
        </motion.div>

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

        {/* Bottom CTA */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase group-hover:text-orange-400 transition-colors duration-300 mt-auto pt-4 motion-reduce:transition-none">
          <span>Explore Profile</span>
          <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200 ease-out font-sans text-xs">
            →
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Member Modal Component                                              */
/* ------------------------------------------------------------------ */
function MemberModal({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const timeoutId = setTimeout(() => {
      setReducedMotion(mediaQuery.matches);
      setIsMobile(
        window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768
      );
    }, 0);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);

    return () => {
      clearTimeout(timeoutId);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  // Parallax hooks (Framer Motion)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 120 };
  const rotateX = useSpring(useTransform(y, [-300, 300], [2.2, -2.2]), springConfig);
  const rotateY = useSpring(useTransform(x, [-300, 300], [-2.2, 2.2]), springConfig);

  const avatarX = useSpring(useTransform(x, [-300, 300], [-3.5, 3.5]), springConfig);
  const avatarY = useSpring(useTransform(y, [-300, 300], [-3.5, 3.5]), springConfig);

  const shadowX = useSpring(useTransform(x, [-300, 300], [-6, 6]), springConfig);
  const shadowY = useSpring(useTransform(y, [-300, 300], [14, 26]), springConfig);

  const boxShadow = useMotionTemplate`0 0 0 1px rgba(255,140,0,0.15), ${shadowX}px ${shadowY}px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,140,0,0.08)`;

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile, reducedMotion, x, y]);

  // Prevent background scrolling and trap focus
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} — ${member.role}`}
    >
      {/* Backdrop with vignette overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[14px] [background:radial-gradient(circle,rgba(7,10,19,0.5)_40%,rgba(4,5,10,0.95)_100%)] z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered soft radial glow pulse behind modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ 
          opacity: [0, 1, 0.85], 
          scale: [0.7, 1.12, 1] 
        }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ 
          duration: 1.3, 
          ease: "easeOut",
          times: [0, 0.55, 1] 
        }}
        className="absolute w-[600px] h-[600px] pointer-events-none mix-blend-screen select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 65%)"
        }}
      />

      {/* Modal Content */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: reducedMotion || isMobile ? 0 : rotateX,
          rotateY: reducedMotion || isMobile ? 0 : rotateY,
          transformStyle: "preserve-3d",
          boxShadow: reducedMotion ? "0 20px 80px rgba(0,0,0,0.6)" : boxShadow,
        }}
        className="relative w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/75 backdrop-blur-2xl overflow-hidden z-10 border-t-white/10 border-x-white/5 border-b-white/0 shadow-[inset_0_0_12px_rgba(255,140,0,0.05)]"
      >
        {/* Border path tracer animation */}
        {!reducedMotion && <BorderTracer />}

        {/* Scan effect sweeps top to bottom */}
        {!reducedMotion && (
          <motion.div
            initial={{ top: "0%", opacity: 0 }}
            animate={{ 
              top: ["0%", "100%"],
              opacity: [0, 0.35, 0.35, 0]
            }}
            transition={{ 
              delay: 0.5, 
              duration: 0.9, 
              ease: "easeInOut",
              times: [0, 0.15, 0.85, 1]
            }}
            className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-orange-500 to-transparent pointer-events-none z-20"
          />
        )}

        {/* Drifting particles */}
        {!reducedMotion && !isMobile && <FloatingParticles count={15} active={true} />}

        {/* Top reflection light highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        {/* Redesigned close button */}
        <motion.button
          ref={closeButtonRef}
          onClick={onClose}
          whileHover={{ 
            scale: 1.08, 
            rotate: 90, 
            borderColor: "rgba(249,115,22,0.6)", 
            boxShadow: "0 0 15px rgba(249,115,22,0.25)",
            backgroundColor: "rgba(15,23,42,0.8)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X className="h-4 w-4" />
        </motion.button>

        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          {/* Header: Avatar + Name + Role */}
          <div className="flex items-center gap-5">
            {/* Avatar container */}
            <motion.div 
              layoutId={`avatar-container-${member.id}`}
              className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl ring-2 ring-orange-500/30 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden"
              style={{
                x: reducedMotion || isMobile ? 0 : avatarX,
                y: reducedMotion || isMobile ? 0 : avatarY,
              }}
            >
              {/* Rotating Gradient Ring */}
              {!reducedMotion && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-orange-500/0 via-orange-500/40 to-orange-500/0 animate-[spin_18s_linear_infinite] blur-[1px] z-0" />
              )}
              
              <div className="relative w-full h-full rounded-2xl overflow-hidden z-10 bg-slate-950">
                {member.photo ? (
                  <motion.div 
                    layoutId={`avatar-img-${member.id}`}
                    className="absolute inset-0"
                  >
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="96px"
                      className="object-cover animate-avatar-pulse"
                    />
                  </motion.div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-950">
                    <motion.span 
                      layoutId={`avatar-initials-${member.id}`}
                      className="text-2xl font-black text-orange-400/80 tracking-wider"
                    >
                      {member.initials}
                    </motion.span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Name & role */}
            <div className="min-w-0 space-y-1.5">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                {getRoleIcon(member.role, "h-3 w-3")}
                {member.role}
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
              >
                {member.name}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm text-slate-400 font-medium"
              >
                {member.branch} ({member.specialization})
              </motion.p>
            </div>
          </div>

          {/* Quote */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-4 shadow-[inset_0_0_12px_rgba(255,140,0,0.02)]"
          >
            <Quote className="absolute top-3 left-3 h-4 w-4 text-orange-500/30" />
            <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed pl-6">
              &ldquo;{member.quote}&rdquo;
            </p>
          </motion.div>

          {/* Bio */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm text-slate-300 leading-relaxed"
          >
            {member.bio}
          </motion.p>

          {/* Focus Areas */}
          <div className="space-y-2.5">
            <motion.h4 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.38 }}
              className="text-[11px] font-bold uppercase tracking-widest text-slate-500"
            >
              Focus Areas
            </motion.h4>
            <div className="flex flex-wrap gap-2">
              {member.focusAreas.map((area, idx) => (
                <motion.span
                  key={area}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.28, 
                    delay: 0.4 + idx * 0.05, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  whileHover={{ 
                    y: -2, 
                    boxShadow: "0 0 12px rgba(255, 140, 0, 0.2)", 
                    borderColor: "rgba(255, 140, 0, 0.45)",
                    color: "rgba(255, 255, 255, 1)",
                    backgroundColor: "rgba(255, 140, 0, 0.05)"
                  }}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 transition-all cursor-default"
                >
                  {area}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Social links */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 pt-2 border-t border-slate-900"
          >
            {member.linkedin && member.linkedin !== "javascript:void(0)" ? (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-colors"
                title="LinkedIn Profile"
              >
                <svg className="h-4 w-4 fill-current text-orange-400 group-hover/link:text-orange-300 transition-colors" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs">LinkedIn</span>
              </a>
            ) : (
              <div
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                title="LinkedIn — Coming Soon"
              >
                <svg className="h-4 w-4 fill-current text-slate-700" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs">LinkedIn</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
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
    // Delay clearing member to allow exit animation
    setTimeout(() => setSelectedMember(null), 450);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden py-16">
      {/* Background Grid Pattern with scale & drift */}
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
                isDimmed={selectedMember !== null && selectedMember.id !== member.id}
              />
            ))}
          </div>
        ) : (
          /* ============ ORG HIERARCHY VIEW ============ */
          <OrgHierarchy members={sortedMembers} onOpenMember={openMember} />
        )}
      </div>

      {/* Member Detail Modal wrapped in AnimatePresence for smooth mounting/unmounting */}
      <AnimatePresence mode="wait">
        {modalOpen && selectedMember && (
          <MemberModal
            key={selectedMember.id}
            member={selectedMember}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      {/* Custom Styles */}
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
