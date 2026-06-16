"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, Calendar, Heart, Trophy } from "lucide-react";

interface CardData {
  id: string;
  imageSrc: string;
  title: string;
  subtitle: string;
  rotation: string;
  // Position style classes for tablet/desktop layout
  className: string;
  floatDelay: number;
  isCenter?: boolean;
}

const CARDS_DATA: CardData[] = [
  // CENTER CARD (Large Featured Card)
  {
    id: "center",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "AWS Community Day",
    subtitle: "RIMT University",
    rotation: "rotate(1.5deg)",
    className: "w-[240px] h-[170px] sm:w-[280px] sm:h-[190px] md:w-[320px] md:h-[220px] z-30",
    floatDelay: 0,
    isCenter: true,
  },
  // TOP LEFT
  {
    id: "top-left",
    imageSrc: "/gallery/launch-agenda.jpg",
    title: "Workshop",
    subtitle: "Hands-on Learning",
    rotation: "rotate(-6deg)",
    className: "top-[4%] left-[2%] sm:top-[8%] sm:left-[5%] md:top-[10%] md:left-[8%] w-[160px] h-[120px] sm:w-[190px] sm:h-[135px] md:w-[220px] md:h-[150px] z-20",
    floatDelay: 0.8,
  },
  // TOP RIGHT
  {
    id: "top-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Meetup",
    subtitle: "Growing Together",
    rotation: "rotate(5deg)",
    className: "top-[2%] right-[2%] sm:top-[6%] sm:right-[5%] md:top-[8%] md:right-[8%] w-[160px] h-[120px] sm:w-[190px] sm:h-[135px] md:w-[220px] md:h-[150px] z-20",
    floatDelay: 1.4,
  },
  // BOTTOM LEFT
  {
    id: "bottom-left",
    imageSrc: "/gallery/launch-agenda.jpg",
    title: "Tech Talk",
    subtitle: "Expert Sessions",
    rotation: "rotate(4deg)",
    className: "bottom-[4%] left-[4%] sm:bottom-[8%] sm:left-[7%] md:bottom-[10%] md:left-[10%] w-[160px] h-[120px] sm:w-[190px] sm:h-[135px] md:w-[220px] md:h-[150px] z-20",
    floatDelay: 2.2,
  },
  // BOTTOM RIGHT
  {
    id: "bottom-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Achievements",
    subtitle: "Milestones Earned",
    rotation: "rotate(-5deg)",
    className: "bottom-[2%] right-[4%] sm:bottom-[6%] sm:right-[7%] md:bottom-[8%] md:right-[10%] w-[160px] h-[120px] sm:w-[190px] sm:h-[135px] md:w-[220px] md:h-[150px] z-20",
    floatDelay: 2.8,
  },
];

export function MemoriesOrbitShowcase() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] md:h-[550px] lg:h-[620px] max-w-[650px] flex items-center justify-center overflow-hidden z-10 select-none">
      
      {/* 1. Ambient Background Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[
          { top: "12%", left: "85%", delay: 0.1, duration: 2.5 },
          { top: "25%", left: "15%", delay: 0.4, duration: 3.2 },
          { top: "45%", left: "78%", delay: 0.7, duration: 2.8 },
          { top: "68%", left: "22%", delay: 1.1, duration: 4.1 },
          { top: "85%", left: "60%", delay: 0.2, duration: 3.5 },
          { top: "18%", left: "40%", delay: 0.9, duration: 2.2 },
          { top: "55%", left: "88%", delay: 1.5, duration: 3.8 },
          { top: "72%", left: "9%",  delay: 0.5, duration: 2.9 },
          { top: "32%", left: "65%", delay: 1.2, duration: 3.3 },
          { top: "89%", left: "30%", delay: 0.8, duration: 4.5 }
        ].map((pt, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-orange-500/35 rounded-full"
            style={{
              top: pt.top,
              left: pt.left,
            }}
            animate={{
              opacity: [0.15, 0.75, 0.15],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: pt.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pt.delay,
            }}
          />
        ))}
      </div>

      {/* 2. Soft radial orange glow behind the constellation */}
      <div className="absolute w-[250px] h-[250px] sm:w-[380px] sm:h-[380px] rounded-full bg-orange-600/10 blur-[80px] sm:blur-[130px] pointer-events-none z-0" />

      {/* ================================================= */}
      {/* DESKTOP / TABLET: CONSTELLATION ORBIT VIEW        */}
      {/* ================================================= */}
      <div className="hidden sm:flex relative w-full h-full items-center justify-center pointer-events-none">
        
        {/* Orbital Paths (Curved orange dashed SVG paths) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <svg className="w-full h-full max-w-[620px] max-h-[620px] overflow-visible opacity-30" viewBox="0 0 600 600">
            <defs>
              <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(249,115,22,0.15)" />
                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
              </radialGradient>
            </defs>
            {/* Center glow area */}
            <circle cx="300" cy="300" r="280" fill="url(#orbit-glow)" />
            
            {/* Orbit Circle 1 */}
            <circle
              cx="300"
              cy="300"
              r="130"
              fill="none"
              stroke="rgba(249, 115, 22, 0.45)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
              className="animate-[spin_40s_linear_infinite]"
              style={{ transformOrigin: "300px 300px" }}
            />
            {/* Orbit Circle 2 */}
            <circle
              cx="300"
              cy="300"
              r="200"
              fill="none"
              stroke="rgba(249, 115, 22, 0.3)"
              strokeWidth="1"
              strokeDasharray="6 12"
              className="animate-[spin_70s_linear_infinite_reverse]"
              style={{ transformOrigin: "300px 300px" }}
            />
            {/* Orbit Circle 3 */}
            <circle
              cx="300"
              cy="300"
              r="260"
              fill="none"
              stroke="rgba(249, 115, 22, 0.2)"
              strokeWidth="0.8"
              strokeDasharray="8 16"
              className="animate-[spin_110s_linear_infinite]"
              style={{ transformOrigin: "300px 300px" }}
            />
          </svg>
        </div>

        {/* 3. Floating Icons Traveling along Orbits */}
        {/* Camera Icon - Inner path */}
        <div
          className="absolute z-20 pointer-events-auto animate-[orbit-inner-1_24s_linear_infinite]"
          style={{ width: "36px", height: "36px" }}
        >
          <div className="w-full h-full rounded-full border border-orange-500/30 bg-slate-950/90 shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center justify-center animate-pulse">
            <Camera className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
          </div>
        </div>

        {/* Heart Icon - Inner path (offset starting position) */}
        <div
          className="absolute z-20 pointer-events-auto animate-[orbit-inner-2_28s_linear_infinite]"
          style={{ width: "36px", height: "36px" }}
        >
          <div className="w-full h-full rounded-full border border-orange-500/30 bg-slate-950/90 shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center justify-center animate-pulse" style={{ animationDelay: "1s" }}>
            <Heart className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
          </div>
        </div>

        {/* Gallery Icon - Mid path */}
        <div
          className="absolute z-20 pointer-events-auto animate-[orbit-mid-1_42s_linear_infinite]"
          style={{ width: "36px", height: "36px" }}
        >
          <div className="w-full h-full rounded-full border border-orange-500/25 bg-slate-950/90 shadow-[0_0_10px_rgba(249,115,22,0.25)] flex items-center justify-center animate-pulse" style={{ animationDelay: "0.5s" }}>
            <ImageIcon className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
          </div>
        </div>

        {/* Calendar Icon - Mid path (offset starting position) */}
        <div
          className="absolute z-20 pointer-events-auto animate-[orbit-mid-2_48s_linear_infinite]"
          style={{ width: "36px", height: "36px" }}
        >
          <div className="w-full h-full rounded-full border border-orange-500/25 bg-slate-950/90 shadow-[0_0_10px_rgba(249,115,22,0.25)] flex items-center justify-center animate-pulse" style={{ animationDelay: "1.5s" }}>
            <Calendar className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
          </div>
        </div>

        {/* Trophy Icon - Outer path */}
        <div
          className="absolute z-20 pointer-events-auto animate-[orbit-outer_64s_linear_infinite]"
          style={{ width: "36px", height: "36px" }}
        >
          <div className="w-full h-full rounded-full border border-orange-500/20 bg-slate-950/90 shadow-[0_0_8px_rgba(249,115,22,0.2)] flex items-center justify-center animate-pulse" style={{ animationDelay: "2s" }}>
            <Trophy className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
          </div>
        </div>

        {/* 4. Interactive Floating Photo Cards */}
        {CARDS_DATA.map((card) => {
          const isHovered = hoveredCardId === card.id;
          const cardZIndex = isHovered ? 50 : card.isCenter ? 30 : 20;

          return (
            <motion.div
              key={card.id}
              className={`absolute select-none pointer-events-auto group cursor-pointer overflow-hidden border border-orange-500/20 bg-slate-950/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 ${card.className}`}
              style={{
                transform: card.rotation,
                zIndex: cardZIndex,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: isHovered ? 1.05 : 1,
                y: isHovered ? -5 : [0, -10, 0],
                borderColor: isHovered ? "rgba(249, 115, 22, 0.65)" : "rgba(249, 115, 22, 0.2)",
                boxShadow: isHovered
                  ? "0 0 30px rgba(249, 115, 22, 0.4), 0 12px 48px rgba(0,0,0,0.6)"
                  : card.isCenter
                  ? "0 0 25px rgba(249, 115, 22, 0.15), 0 8px 32px rgba(0,0,0,0.5)"
                  : "0 0 15px rgba(249, 115, 22, 0.05), 0 8px 32px rgba(0,0,0,0.5)",
              }}
              transition={{
                scale: { duration: 0.3, ease: "easeOut" },
                borderColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                y: isHovered
                  ? { duration: 0.3 }
                  : {
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: card.floatDelay,
                    },
              }}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
            >
              {/* Glossy reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

              {/* Card Image */}
              <div className="w-full h-full relative overflow-hidden bg-slate-900">
                <img
                  src={card.imageSrc}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-104"
                  loading="lazy"
                />
                {/* Shadow Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
              </div>

              {/* Card Title/Subtitle */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4.5 z-20 text-left">
                <h4 className={`font-black text-white leading-tight ${card.isCenter ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm'}`}>
                  {card.title}
                </h4>
                <p className={`font-bold text-orange-400 mt-0.5 tracking-wide ${card.isCenter ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* MOBILE VIEW: SWIPEABLE CAROUSEL (Orbits disabled) */}
      {/* ================================================= */}
      <div className="flex sm:hidden overflow-x-auto gap-4 px-6 py-8 w-full snap-x snap-mandatory scrollbar-none scroll-smooth">
        {CARDS_DATA.map((card) => (
          <div
            key={card.id}
            className="flex-shrink-0 w-[240px] h-[175px] snap-center rounded-2xl overflow-hidden border border-orange-500/25 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative"
          >
            {/* Card Image */}
            <div className="w-full h-full relative overflow-hidden bg-slate-900">
              <img
                src={card.imageSrc}
                alt={card.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 text-left">
              <h4 className="font-black text-white text-sm">
                {card.title}
              </h4>
              <p className="font-bold text-orange-400 mt-0.5 text-xs">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CSS KEYFRAME ANIMATIONS FOR THE ORBITING ICONS */}
      <style>{`
        @keyframes orbit-inner-1 {
          from { transform: rotate(0deg) translate(130px) rotate(0deg); }
          to { transform: rotate(360deg) translate(130px) rotate(-360deg); }
        }
        @keyframes orbit-inner-2 {
          from { transform: rotate(180deg) translate(130px) rotate(-180deg); }
          to { transform: rotate(540deg) translate(130px) rotate(-540deg); }
        }
        @keyframes orbit-mid-1 {
          from { transform: rotate(45deg) translate(200px) rotate(-45deg); }
          to { transform: rotate(405deg) translate(200px) rotate(-405deg); }
        }
        @keyframes orbit-mid-2 {
          from { transform: rotate(225deg) translate(200px) rotate(-225deg); }
          to { transform: rotate(585deg) translate(200px) rotate(-585deg); }
        }
        @keyframes orbit-outer {
          from { transform: rotate(270deg) translate(260px) rotate(-270deg); }
          to { transform: rotate(630deg) translate(260px) rotate(-630deg); }
        }
      `}</style>
    </div>
  );
}
