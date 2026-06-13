import { useRef, useEffect } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { Milestone } from "./MilestoneCard";

import { useReducedMotion } from "@/app/team/hooks/useReducedMotion";
import { useBodyScrollLock } from "@/app/team/hooks/useBodyScrollLock";
import { useMousePosition } from "@/app/team/hooks/useMousePosition";
import { useParallax } from "@/app/team/hooks/useParallax";

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

export function MilestoneModal({
  milestone,
  onClose,
}: {
  milestone: Milestone;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const isMobile = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

  useBodyScrollLock(true);
  
  const { x, y } = useMousePosition(!isMobile && !reducedMotion);
  const { rotateX, rotateY, shadowX, shadowY } = useParallax(x, y);

  const boxShadow = useMotionTemplate`0 0 0 1px rgba(255,140,0,0.15), ${shadowX}px ${shadowY}px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,140,0,0.08)`;

  // Accessibility: Esc key listener & Focus Trap
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "In Progress":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-slate-400 bg-slate-900/40 border-slate-800";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Milestone Inspector: ${milestone.title}`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[6px] md:backdrop-blur-[10px] lg:backdrop-blur-[14px] [background:radial-gradient(circle,rgba(7,10,19,0.5)_40%,rgba(4,5,10,0.95)_100%)] z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Behind modal light projection */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 1, 0.85], scale: [0.7, 1.1, 1] }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.8, ease: "easeOut", times: [0, 0.5, 1] }}
        className="absolute w-[600px] h-[600px] pointer-events-none mix-blend-screen select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 65%)"
        }}
      />

      {/* Holographic Panel */}
      <motion.div
        ref={modalRef}
        layoutId={`card-container-${milestone.id}`}
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
        className="relative w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/80 overflow-hidden z-10 border-t-white/10 border-x-white/5 border-b-white/0 shadow-[inset_0_0_12px_rgba(255,140,0,0.04)]"
      >
        {/* Scan line sweep */}
        {!reducedMotion && (
          <motion.div
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: ["0%", "100%"], opacity: [0, 0.35, 0.35, 0] }}
            transition={{ delay: 0.35, duration: 0.8, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
            className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-orange-500 to-transparent pointer-events-none z-20"
          />
        )}

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
          aria-label="Close inspector"
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X className="h-4 w-4" />
        </motion.button>

        {/* Modal Content container */}
        <motion.div
          variants={revealContainerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 sm:p-8 space-y-6 relative z-10"
        >
          {/* Header Block */}
          <div className="space-y-3">
            <motion.div 
              variants={revealChildVariants}
              className="inline-flex items-center gap-1.5"
            >
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(milestone.status)}`}>
                {milestone.status}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                {milestone.date}
              </span>
            </motion.div>

            <motion.h2 
              variants={revealChildVariants}
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
            >
              {milestone.title}
            </motion.h2>
          </div>

          {/* Description */}
          <motion.div variants={revealChildVariants} className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              LOG_DESCRIPTION
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/30 border border-slate-900 p-4 rounded-xl">
              {milestone.description}
            </p>
          </motion.div>

          {/* Impact Statement */}
          <motion.div 
            variants={revealChildVariants} 
            className="relative bg-orange-500/[0.03] border border-orange-500/10 rounded-xl p-4 shadow-[inset_0_0_12px_rgba(255,140,0,0.02)]"
          >
            <ShieldCheck className="absolute top-4 left-4 h-5 w-5 text-orange-500/40" />
            <div className="pl-7 space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
                IMPACT_STATEMENT
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                {milestone.impactStatement}
              </p>
            </div>
          </motion.div>

          {/* Related Initiatives */}
          {milestone.relatedInitiatives.length > 0 && (
            <div className="space-y-2.5">
              <motion.h4 
                variants={revealChildVariants}
                className="text-[11px] font-bold uppercase tracking-widest text-slate-500"
              >
                Related Initiatives
              </motion.h4>
              <motion.div 
                variants={revealChildVariants}
                className="flex flex-wrap gap-2"
              >
                {milestone.relatedInitiatives.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/20 hover:bg-orange-500/5 cursor-default transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>
          )}

          {/* Footer actions */}
          <motion.div 
            variants={revealChildVariants}
            className="flex items-center gap-3 pt-4 border-t border-slate-900 text-xs font-mono text-slate-600 justify-between"
          >
            <span>CONSOLE_ID // SBG_LOG_{milestone.id.toUpperCase()}</span>
            <span className="flex items-center gap-1 text-orange-500/60">
              TERMINAL SECURE <ShieldCheck className="h-3.5 w-3.5 text-orange-500/60" />
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
