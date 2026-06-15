import { useRef, useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Rocket, Users, GraduationCap, Handshake, Cloud, Trophy, ChevronRight, ChevronLeft } from "lucide-react";
import { Milestone } from "./MilestoneCard";

const iconMap = {
  rocket: Rocket,
  team: Users,
  graduation: GraduationCap,
  handshake: Handshake,
  cloud: Cloud,
  trophy: Trophy,
};

export function HorizontalTimeline({
  milestones,
  onSelect,
  variants,
}: {
  milestones: Milestone[];
  onSelect: (m: Milestone) => void;
  variants?: Variants;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setViewport("mobile");
      } else if (w < 1024) {
        setViewport("tablet");
      } else {
        setViewport("desktop");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 450;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-[0_0_12px_rgba(255,140,0,0.25)]";
      case "In Progress":
        return "text-blue-400 border-blue-500/40 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.25)]";
      default:
        return "text-slate-400 border-slate-800 bg-slate-900/40";
    }
  };

  if (viewport === "mobile") {
    return (
      <motion.div variants={variants} className="relative w-full py-6 space-y-6">
        <div className="flex items-center gap-2 px-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full">
            {"// VERTICAL TIMELINE"}
          </span>
        </div>

        <div className="relative pl-10 pr-2 space-y-6">
          {/* Vertical axis line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-900/60 z-0">
            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-b from-orange-500/30 via-blue-500/30 to-slate-900/10" />
          </div>

          {milestones.map((item) => {
            const IconComponent = iconMap[item.iconType] || Trophy;
            return (
              <div key={item.id} className="relative flex flex-col items-start w-full">
                {/* Node Dot on the left line */}
                <div className="absolute left-[-29px] top-2.5 w-5 h-5 rounded-full border border-slate-900 bg-slate-950 flex items-center justify-center z-10">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === "Completed"
                      ? "bg-orange-500 shadow-[0_0_8px_#ff8c00]"
                      : item.status === "In Progress"
                      ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                      : "bg-slate-800"
                  }`} />
                </div>

                {/* Milestone Card box (Full width) */}
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  onClick={() => onSelect(item)}
                  className="w-full p-5 rounded-2xl border border-slate-900 bg-slate-950/60 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(255,140,0,0.01)] hover:border-orange-500/35 transition-all duration-300 cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${
                      item.status === "Completed"
                        ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                        : item.status === "In Progress"
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        : "text-slate-500 bg-slate-900/40 border-slate-800"
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {item.date}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white tracking-tight mt-3 leading-tight">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span>LOG_SBG_{item.id.slice(0, 5).toUpperCase()}</span>
                    <span className="text-orange-400/80 font-bold uppercase tracking-wider">
                      INSPECT →
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const isTablet = viewport === "tablet";
  const axisTopStyle = isTablet ? "70px" : "50%";

  return (
    <motion.div 
      variants={variants}
      className="relative w-full py-8 space-y-4"
    >
      {/* Scroll Navigation Controls */}
      <div className="flex justify-between items-center px-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full">
            {isTablet ? "// TABLET TIMELINE" : "// HORIZONTAL TIMELINE"}
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Drag or scroll to explore
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-white hover:border-orange-500/30 transition-all cursor-pointer"
            title="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-white hover:border-orange-500/30 transition-all cursor-pointer"
            title="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeline Scroll Runway Wrapper */}
      <div 
        ref={scrollContainerRef}
        className={`overflow-x-auto scrollbar-none relative py-12 px-8 flex gap-8 items-center w-full cursor-grab active:cursor-grabbing select-none ${
          isTablet ? "min-h-[360px]" : "min-h-[480px]"
        }`}
        style={{
          transformStyle: "preserve-3d",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Central horizontal axis line running full width */}
        <div 
          className="absolute left-0 right-0 h-[2px] bg-slate-900/60 pointer-events-none z-0"
          style={{ top: axisTopStyle }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-blue-500/30 to-slate-900/10" />
          
          {/* Animated signal dots traveling horizontally */}
          <div className="absolute top-[-2px] left-0 w-2.5 h-2.5 rounded-full bg-orange-400 blur-[1px] animate-[travel_8s_linear_infinite]" />
          <div className="absolute top-[-2px] left-1/4 w-2 h-2 rounded-full bg-blue-400 blur-[1px] animate-[travel_10s_linear_infinite_reverse] [animation-delay:2s]" />
        </div>

        {/* Render milestones dynamically inside alternating track */}
        {milestones.map((item, index) => {
          const isEven = index % 2 === 0;
          const IconComponent = iconMap[item.iconType] || Trophy;

          return (
            <div
              key={item.id}
              className={`flex-shrink-0 w-72 sm:w-80 flex flex-col items-center relative z-10 ${
                isTablet 
                  ? "justify-start pt-20 h-[280px]" 
                  : (isEven ? "justify-end pb-32 h-[380px]" : "justify-start pt-32 h-[380px]")
              }`}
            >
              {/* Timeline dot node on the central axis */}
              <div 
                className="absolute w-8 h-8 rounded-full border border-slate-900 bg-slate-950/95 flex items-center justify-center pointer-events-none z-20 hover:scale-110 transition-transform duration-300"
                style={{
                  top: axisTopStyle,
                  transform: "translateY(-50%)",
                }}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${
                  item.status === "Completed"
                    ? "bg-orange-500 shadow-[0_0_10px_#ff8c00] animate-pulse"
                    : item.status === "In Progress"
                    ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                    : "bg-slate-800"
                }`} />
              </div>

              {/* Vertical connector line linking node to card */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 w-[1.5px] border-l border-dashed border-slate-800/80 pointer-events-none z-0 ${
                  isTablet 
                    ? "top-[70px] bottom-auto h-[60px]" 
                    : (isEven ? "bottom-1/2 top-auto h-24" : "top-1/2 bottom-auto h-24")
                }`}
              >
                <div className="absolute bottom-0 top-0 left-0 right-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
              </div>

              {/* Milestone Card box */}
              <motion.div
                whileHover={{ y: isTablet ? 6 : (isEven ? -6 : 6), scale: 1.02 }}
                transition={{ duration: 0.25 }}
                onClick={() => onSelect(item)}
                className="w-full p-5 rounded-2xl border border-slate-900 bg-slate-950/60 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(255,140,0,0.01)] hover:border-orange-500/35 hover:shadow-[0_12px_30px_rgba(255,140,0,0.08),inset_0_0_12px_rgba(255,140,0,0.02)] transition-all duration-300 cursor-pointer select-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg border ${
                    item.status === "Completed"
                      ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                      : item.status === "In Progress"
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : "text-slate-500 bg-slate-900/40 border-slate-800"
                  }`}>
                    <IconComponent className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block">
                      {item.date}
                    </span>
                    <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-white tracking-tight mt-3 leading-tight hover:text-orange-400 transition-colors">
                  {item.title}
                </h4>
                
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>LOG_SBG_{item.id.slice(0, 5).toUpperCase()}</span>
                  <span className="text-orange-400/80 group-hover:text-orange-400 font-bold uppercase tracking-wider">
                    INSPECT →
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes travel {
          0% { left: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
