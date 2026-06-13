"use client";

import { useRef, useEffect } from "react";
import { TeamMember } from "@/data/team";
import Image from "next/image";
import { motion } from "framer-motion";
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
  Mail,
} from "lucide-react";

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface SolarProfileConsoleProps {
  member: TeamMember;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function SolarProfileConsole({
  member,
  onClose,
  onPrev,
  onNext,
}: SolarProfileConsoleProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(true);

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
      if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
        return;
      }
      if (e.key === "ArrowRight" && onNext) {
        onNext();
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
          if (document.activeElement === first) { last.focus(); e.preventDefault(); }
        } else {
          if (document.activeElement === last) { first.focus(); e.preventDefault(); }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} — ${member.role}`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0 bg-[#050816]/85 backdrop-blur-[10px] md:backdrop-blur-[16px] z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered spotlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.8, 0.6], scale: [0.7, 1.1, 1] }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.8, ease: "easeOut", times: [0, 0.5, 1] }}
        className="absolute w-[500px] h-[500px] pointer-events-none mix-blend-screen select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 65%)",
        }}
      />

      {/* Console Card */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
        }}
        className="relative w-full max-w-2xl rounded-3xl border border-slate-800/80 bg-[#0a0f1e]/90 backdrop-blur-xl overflow-hidden z-10 shadow-[0_0_0_1px_rgba(255,140,0,0.1),0_25px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(255,140,0,0.06)]"
        style={{
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none z-20" />

        {/* Scan line */}
        <motion.div
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: ["0%", "100%"], opacity: [0, 0.3, 0.3, 0] }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
          className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent pointer-events-none z-20"
        />

        {/* Background orbit decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[120, 200, 280].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-orange-500/[0.04]"
              style={{
                width: size,
                height: size,
                top: "50%",
                left: "50%",
                marginTop: -size / 2,
                marginLeft: -size / 2,
                animation: `modal-orbit ${20 + i * 10}s linear infinite`,
              }}
            />
          ))}
        </div>

        {/* Close Button */}
        <motion.button
          ref={closeButtonRef}
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white hover:border-orange-500/40 backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X className="h-4 w-4" />
        </motion.button>

        {/* Navigation arrows */}
        {onPrev && (
          <button
            onClick={onPrev}
            aria-label="Previous member"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            aria-label="Next member"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 p-6 sm:p-8"
        >
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar with orbit ring */}
            <motion.div variants={childVariants} className="relative flex-shrink-0">
              {/* Rotating orbit ring */}
              <div
                className="absolute -inset-3 rounded-full border border-orange-500/20 pointer-events-none"
                style={{ animation: "modal-orbit 8s linear infinite" }}
              >
                <div
                  className="absolute rounded-full bg-orange-400"
                  style={{
                    width: 5,
                    height: 5,
                    top: -2.5,
                    left: "50%",
                    marginLeft: -2.5,
                    boxShadow: "0 0 8px rgba(255,140,0,0.6)",
                  }}
                />
              </div>

              {/* Glow behind avatar */}
              <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl pointer-events-none" />

              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-orange-500/30 shadow-[0_0_20px_rgba(255,140,0,0.15)]">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <span className="text-2xl font-black text-orange-400/80">
                      {member.initials}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info block */}
            <div className="text-center sm:text-left space-y-2 min-w-0">
              <motion.div
                variants={childVariants}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                {getRoleIcon(member.role, "h-3 w-3")}
                {member.role}
              </motion.div>

              <motion.h2
                variants={childVariants}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
              >
                {member.name}
              </motion.h2>

              <motion.p
                variants={childVariants}
                className="text-xs sm:text-sm text-slate-400 font-medium"
              >
                {member.branch} • {member.specialization}
              </motion.p>
            </div>
          </div>

          {/* Quote */}
          <motion.div
            variants={childVariants}
            className="relative bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-4 mt-6 shadow-[inset_0_0_12px_rgba(255,140,0,0.02)]"
          >
            <Quote className="absolute top-3 left-3 h-4 w-4 text-orange-500/30" />
            <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed pl-6">
              &ldquo;{member.quote}&rdquo;
            </p>
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={childVariants}
            className="text-sm text-slate-300 leading-relaxed mt-4"
          >
            {member.bio}
          </motion.p>

          {/* Focus Areas */}
          <motion.div variants={childVariants} className="mt-5 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-400/70">
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {member.focusAreas.map((area) => (
                <span
                  key={area}
                  className="relative px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-300 transition-all hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-300 cursor-default overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                    {area}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={childVariants}
            className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/60"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mr-1">Connect</span>
            {member.linkedin && member.linkedin !== "javascript:void(0)" && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                title="LinkedIn Profile"
              >
                <LinkedInIcon className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                <span className="text-xs">LinkedIn</span>
              </a>
            )}
            {member.github && member.github !== "javascript:void(0)" && (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                title="GitHub Profile"
              >
                <GitHubIcon className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                <span className="text-xs">GitHub</span>
              </a>
            )}
            <a
              href={`mailto:awsbuild@rimt.ac.in?subject=Reaching%20out%20to%20${encodeURIComponent(member.name)}`}
              className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
              title="Email"
            >
              <Mail className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
              <span className="text-xs">Email</span>
            </a>
          </motion.div>
        </motion.div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes modal-orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
