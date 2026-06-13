import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { Camera, Video, Calendar, Users } from "lucide-react";

interface StatItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: "photos",
    icon: <Camera className="h-5 w-5" />,
    label: "Photos",
    value: 128,
    suffix: "+",
  },
  {
    id: "videos",
    icon: <Video className="h-5 w-5" />,
    label: "Videos",
    value: 14,
    suffix: "+",
  },
  {
    id: "events",
    icon: <Calendar className="h-5 w-5" />,
    label: "Events",
    value: 22,
    suffix: "+",
  },
  {
    id: "participants",
    icon: <Users className="h-5 w-5" />,
    label: "Participants",
    value: 500,
    suffix: "+",
  },
];

function CountUp({ end, duration = 1.2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const endVal = end;
    if (endVal === 0) return;

    let start = 0;
    const totalMs = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMs / endVal), 25);
    
    const timer = setInterval(() => {
      start += Math.ceil(endVal / 40); // larger step for big numbers
      if (start >= endVal) {
        start = endVal;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
}

function StatCard({ item, variants }: { item: StatItem; variants?: Variants }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

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

  return (
    <motion.div
      variants={variants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative flex items-center gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(255,140,0,0.01)] cursor-default select-none transition-all duration-300 hover:border-orange-500/35 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(255,140,0,0.12)]"
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Spotlight follow cursor (Desktop Only) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
        style={{
          background: "radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.07), transparent 40%)",
        }}
      />

      <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform duration-300 relative z-10">
        {item.icon}
      </div>
      <div className="relative z-10">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</h4>
        <p className="text-lg font-black text-white mt-1 flex items-baseline gap-0.5">
          <CountUp end={item.value} />
          <span className="text-orange-400 font-extrabold">{item.suffix}</span>
        </p>
      </div>
    </motion.div>
  );
}

export function QuickStats({ containerVariants, itemVariants }: { containerVariants?: Variants; itemVariants?: Variants }) {
  return (
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full"
    >
      {STATS_DATA.map((item) => (
        <StatCard key={item.id} item={item} variants={itemVariants} />
      ))}
    </motion.div>
  );
}
