import { useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { Rocket, Users, GraduationCap, Handshake, Cloud, Trophy, ArrowRight } from "lucide-react";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "Completed" | "In Progress" | "Upcoming";
  impactStatement: string;
  relatedInitiatives: string[];
  iconType: "rocket" | "team" | "graduation" | "handshake" | "cloud" | "trophy";
}

const iconMap = {
  rocket: Rocket,
  team: Users,
  graduation: GraduationCap,
  handshake: Handshake,
  cloud: Cloud,
  trophy: Trophy,
};

export function MilestoneCard({
  milestone,
  onOpen,
  variants,
}: {
  milestone: Milestone;
  onOpen: () => void;
  variants?: Variants;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const IconComponent = iconMap[milestone.iconType] || Trophy;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const card = cardRef.current;
    if (!card) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-[0_0_8px_rgba(255,140,0,0.15)]";
      case "In Progress":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]";
      default:
        return "text-slate-400 bg-slate-900/40 border-slate-800";
    }
  };

  return (
    <motion.div
      variants={variants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onOpen}
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
      className="group relative flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border border-slate-900 bg-slate-950/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-orange-500/35 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(255,140,0,0.08),inset_0_0_12px_rgba(255,140,0,0.02)] cursor-pointer select-none text-left"
    >
      {/* Follow Cursor Light (Desktop Only) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
        style={{
          background: "radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.07), transparent 40%)",
        }}
      />

      {/* Light sweep overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none z-0" />

      {/* Icon frame */}
      <div className="flex-shrink-0 relative z-10">
        <div className={`p-4 rounded-xl border flex items-center justify-center transition-all duration-300 ${
          milestone.status === "Completed"
            ? "text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/50"
            : milestone.status === "In Progress"
            ? "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50"
            : "text-slate-500 bg-slate-900/40 border-slate-800"
        } group-hover:scale-105 group-hover:rotate-3 shadow-inner`}>
          <IconComponent className="h-6 w-6" />
        </div>
      </div>

      {/* Text Details */}
      <div className="flex-grow space-y-3 relative z-10 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors leading-tight">
            {milestone.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800/80 px-2 py-0.5 rounded-full">
              {milestone.date}
            </span>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(milestone.status)}`}>
              {milestone.status}
            </span>
          </div>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
          {milestone.description}
        </p>

        {/* Explore indicator */}
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400/80 group-hover:text-orange-400 pt-1 transition-colors">
          <span>Inspect Log</span>
          <ArrowRight className="h-3 w-3 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </motion.div>
  );
}
