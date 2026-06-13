import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionTemplate } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Share2, MapPin, Users, Camera, Info, ShieldCheck } from "lucide-react";
import { GalleryItem } from "@/data/gallery";

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
      delayChildren: 0.12,
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

export function MediaInspector({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const isMobile = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

  useBodyScrollLock(true);

  const { x, y } = useMousePosition(!isMobile && !reducedMotion);
  const { rotateX, rotateY, shadowX, shadowY } = useParallax(x, y);

  const boxShadow = useMotionTemplate`0 0 0 1px rgba(255,140,0,0.15), ${shadowX}px ${shadowY}px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,140,0,0.08)`;

  // Accessibility Esc key listener & Focus Trap
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
      if (e.key === "ArrowLeft") {
        onPrev();
        return;
      }
      if (e.key === "ArrowRight") {
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
  }, [onClose, onPrev, onNext]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.imageUrl;
    link.download = `${item.id}-aws-sbg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Sharing link copied to clipboard!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Media Inspector: ${item.title}`}
    >
      {/* Backdrop with blurs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[6px] md:backdrop-blur-[10px] lg:backdrop-blur-[14px] [background:radial-gradient(circle,rgba(7,10,19,0.5)_40%,rgba(4,5,10,0.95)_100%)] z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Spotlighting behind modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 1, 0.85], scale: [0.7, 1.1, 1] }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.8, ease: "easeOut", times: [0, 0.5, 1] }}
        className="absolute w-[800px] h-[800px] pointer-events-none mix-blend-screen select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)"
        }}
      />

      {/* Modal Inspector Console Panel */}
      <motion.div
        ref={modalRef}
        layoutId={`card-container-${item.id}`}
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
        className="relative w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-950/90 overflow-hidden z-10 border-t-white/10 border-x-white/5 border-b-white/0 shadow-[inset_0_0_12px_rgba(255,140,0,0.04)] flex flex-col md:flex-row items-stretch"
      >
        {/* Scan line sweep */}
        {!reducedMotion && (
          <motion.div
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: ["0%", "100%"], opacity: [0, 0.3, 0.3, 0] }}
            transition={{ delay: 0.35, duration: 0.85, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
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

        {/* Left Side: Large Projected Media Image */}
        <div className="w-full md:w-[60%] h-64 sm:h-80 md:h-auto relative overflow-hidden bg-slate-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-900 group/image">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={true}
            className="object-cover transition-transform duration-500 group-hover/image:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />

          {/* Left Arrow Controls overlay */}
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white backdrop-blur-sm transition-all hover:bg-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
            title="Previous image (ArrowLeft)"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Arrow Controls overlay */}
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white backdrop-blur-sm transition-all hover:bg-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
            title="Next image (ArrowRight)"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Right Side: Details Inspector Panel */}
        <motion.div
          variants={revealContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full md:w-[40%] p-6 sm:p-8 flex flex-col justify-between space-y-6 relative z-10 bg-slate-950/50 backdrop-blur-md"
        >
          <div className="space-y-6">
            {/* Header badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {item.category}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                {item.date}
              </span>
            </div>

            {/* Title */}
            <motion.h2 
              variants={revealChildVariants}
              className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight"
            >
              {item.title}
            </motion.h2>

            {/* Parameters Grid */}
            <motion.div variants={revealChildVariants} className="grid grid-cols-1 gap-3 py-3 border-y border-slate-900/80">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <MapPin className="h-4 w-4 text-orange-500/60" />
                <span className="font-medium text-slate-400">Location:</span>
                <span className="font-semibold text-white truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Users className="h-4 w-4 text-orange-500/60" />
                <span className="font-medium text-slate-400">Participants:</span>
                <span className="font-semibold text-white">{item.participants} Builders</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Camera className="h-4 w-4 text-orange-500/60" />
                <span className="font-medium text-slate-400">Captured:</span>
                <span className="font-semibold text-white">{item.photoCount} High-res Photos</span>
              </div>
            </motion.div>

            {/* Description log */}
            <motion.div variants={revealChildVariants} className="space-y-1.5">
              <span className="text-[9px] font-mono font-extrabold text-slate-500 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" /> ARCHIVE_LOG_DEC
              </span>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bg-slate-950/60 border border-slate-900 p-4 rounded-xl shadow-inner">
                {item.description}
              </p>
            </motion.div>
          </div>

          {/* Action Row */}
          <motion.div 
            variants={revealChildVariants}
            className="flex items-center justify-between gap-4 pt-4 border-t border-slate-900"
          >
            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Share event link"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Footer security tag */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 pt-2">
            <span>SECURE_ARCHIVE_PORT</span>
            <span className="flex items-center gap-0.5 text-orange-500/50">
              LOG_SECURE <ShieldCheck className="h-3 w-3" />
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
