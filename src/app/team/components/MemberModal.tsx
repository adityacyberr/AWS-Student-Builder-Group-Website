import { useRef, useEffect } from "react";
import { TeamMember } from "@/data/team";
import Image from "next/image";
import { motion, useMotionTemplate } from "framer-motion";
import {
  Terminal,
  GitPullRequest,
  DollarSign,
  Megaphone,
  Calendar,
  Camera,
  User,
  X,
  Quote,
} from "lucide-react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useMousePosition } from "../hooks/useMousePosition";
import { useParallax } from "../hooks/useParallax";
import { FloatingParticles } from "./FloatingParticles";
import { BorderTracer } from "./BorderTracer";

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

// Parent/Child stagger reveal variants
const revealContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const revealChildVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function MemberModal({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const isMobile = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

  // Dynamic locks & coordinates tracking
  useBodyScrollLock(true);
  const { x, y } = useMousePosition(!isMobile && !reducedMotion);
  const { rotateX, rotateY, avatarX, avatarY, shadowX, shadowY } = useParallax(x, y);

  const boxShadow = useMotionTemplate`0 0 0 1px rgba(255,140,0,0.15), ${shadowX}px ${shadowY}px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,140,0,0.08)`;

  // Accessibility: Focus trap & Esc listener
  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement;

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
      previousActiveElement?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} — ${member.role}`}
    >
      {/* Backdrop with single-layer adaptive blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[6px] md:backdrop-blur-[10px] lg:backdrop-blur-[14px] [background:radial-gradient(circle,rgba(7,10,19,0.5)_40%,rgba(4,5,10,0.95)_100%)] z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Spotlight behind modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ 
          opacity: [0, 1, 0.85], 
          scale: [0.7, 1.1, 1] 
        }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          times: [0, 0.5, 1] 
        }}
        className="absolute w-[600px] h-[600px] pointer-events-none mix-blend-screen select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 65%)"
        }}
      />

      {/* Modal Console container with GPU optimization */}
      <motion.div
        ref={modalRef}
        layoutId={`card-container-${member.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: reducedMotion || isMobile ? 0 : rotateX,
          rotateY: reducedMotion || isMobile ? 0 : rotateY,
          transformStyle: "preserve-3d",
          boxShadow: reducedMotion ? "0 20px 80px rgba(0,0,0,0.6)" : boxShadow,
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
        }}
        className="relative w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/80 overflow-hidden z-10 border-t-white/10 border-x-white/5 border-b-white/0 shadow-[inset_0_0_12px_rgba(255,140,0,0.05)]"
      >
        {/* Border path tracer */}
        {!reducedMotion && <BorderTracer />}

        {/* Scan line sweeping top to bottom */}
        {!reducedMotion && (
          <motion.div
            initial={{ top: "0%", opacity: 0 }}
            animate={{ 
              top: ["0%", "100%"],
              opacity: [0, 0.35, 0.35, 0]
            }}
            transition={{ 
              delay: 0.4, 
              duration: 0.8, 
              ease: "easeInOut",
              times: [0, 0.15, 0.85, 1]
            }}
            className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-orange-500 to-transparent pointer-events-none z-20"
          />
        )}

        {/* Performance optimized background particles */}
        {!reducedMotion && !isMobile && <FloatingParticles count={8} active={true} />}

        {/* Highlight pseudo top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        {/* Close Button */}
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

        {/* Main Panel Content revealing with single Variant Timeline */}
        <motion.div 
          variants={revealContainerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 sm:p-8 space-y-6 relative z-10"
        >
          {/* Header */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <motion.div 
              layoutId={`avatar-container-${member.id}`}
              className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl ring-2 ring-orange-500/30 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden"
              style={{
                x: reducedMotion || isMobile ? 0 : avatarX,
                y: reducedMotion || isMobile ? 0 : avatarY,
                transform: "translate3d(0,0,0)",
              }}
            >
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
                      sizes="(max-width: 640px) 80px, 96px"
                      priority={true} // Priority preload currently selected card
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

            {/* Title Block */}
            <div className="min-w-0 space-y-1.5">
              <motion.div 
                variants={revealChildVariants}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                {getRoleIcon(member.role, "h-3 w-3")}
                {member.role}
              </motion.div>
              
              <motion.h2 
                variants={revealChildVariants}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
              >
                {member.name}
              </motion.h2>
              
              <motion.p 
                variants={revealChildVariants}
                className="text-xs sm:text-sm text-slate-400 font-medium"
              >
                {member.branch} ({member.specialization})
              </motion.p>
            </div>
          </div>

          {/* Quote */}
          <motion.div 
            variants={revealChildVariants}
            className="relative bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-4 shadow-[inset_0_0_12px_rgba(255,140,0,0.02)]"
          >
            <Quote className="absolute top-3 left-3 h-4 w-4 text-orange-500/30" />
            <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed pl-6">
              &ldquo;{member.quote}&rdquo;
            </p>
          </motion.div>

          {/* Bio Description */}
          <motion.p 
            variants={revealChildVariants}
            className="text-sm text-slate-300 leading-relaxed"
          >
            {member.bio}
          </motion.p>

          {/* Focus Areas */}
          <div className="space-y-2.5">
            <motion.h4 
              variants={revealChildVariants}
              className="text-[11px] font-bold uppercase tracking-widest text-slate-500"
            >
              Focus Areas
            </motion.h4>
            <motion.div 
              variants={revealChildVariants}
              className="flex flex-wrap gap-2"
            >
              {member.focusAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 transition-all hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-300 cursor-default"
                >
                  {area}
                </span>
              ))}
            </motion.div>
          </div>

          {/* LinkedIn Button */}
          <motion.div 
            variants={revealChildVariants}
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
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-700 cursor-not-allowed"
                title="LinkedIn — Coming Soon"
              >
                <svg className="h-4 w-4 fill-current text-slate-800" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs">LinkedIn</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
