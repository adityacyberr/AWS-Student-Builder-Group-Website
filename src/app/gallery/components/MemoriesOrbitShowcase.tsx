"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Users, Calendar, Heart, Image as ImageIcon, Trophy } from "lucide-react";

interface CardData {
  id: string;
  imageSrc: string;
  title: string;
  subtitle: string;
  initialRotation: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  floatDelay: number;
  isCenter?: boolean;
}

const CARDS_DATA: CardData[] = [
  // CENTER CARD (Large Featured Card - 1.3x larger)
  {
    id: "center",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "AWS Community Day",
    subtitle: "RIMT University",
    initialRotation: 1.5,
    floatDelay: 0,
    isCenter: true,
  },
  // TOP LEFT
  {
    id: "top-left",
    imageSrc: "/gallery/launch-agenda.jpg",
    title: "Workshop",
    subtitle: "Hands-on Learning",
    initialRotation: -12,
    top: "12%",
    left: "5%",
    floatDelay: 0.8,
  },
  // TOP RIGHT
  {
    id: "top-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Meetup",
    subtitle: "Growing Together",
    initialRotation: 10,
    top: "8%",
    right: "5%",
    floatDelay: 1.4,
  },
  // BOTTOM LEFT
  {
    id: "bottom-left",
    imageSrc: "/gallery/launch-agenda.jpg",
    title: "Tech Talk",
    subtitle: "Expert Sessions",
    initialRotation: -8,
    bottom: "12%",
    left: "8%",
    floatDelay: 2.2,
  },
  // BOTTOM RIGHT
  {
    id: "bottom-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Achievements",
    subtitle: "Milestones Earned",
    initialRotation: 14,
    bottom: "8%",
    right: "8%",
    floatDelay: 2.8,
  },
];

export function MemoriesOrbitShowcase() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[400px] sm:h-[640px] md:h-[720px] lg:h-[800px] max-w-[800px] flex items-center justify-center overflow-hidden z-10 select-none">
      
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
            className="absolute h-1.5 w-1.5 bg-[#FF9900]/30 rounded-full animate-pulse"
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
      <div
        className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at center, rgba(255,153,0,0.18), rgba(255,153,0,0.08), transparent 72%)"
        }}
      />

      {/* ================================================= */}
      {/* DESKTOP / TABLET: CONSTELLATION ORBIT VIEW        */}
      {/* ================================================= */}
      <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none">
        
        {/* Unified circular/elliptical SVG for 3 centered orbits */}
        <svg 
          className="absolute w-full h-full overflow-visible pointer-events-none z-10 opacity-85" 
          viewBox="0 0 800 800"
        >
          <defs>
            <filter id="orbit-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* ------------------------------------------------- */}
          {/* ORBIT 1: OUTER (rx: 360, ry: 230, tilt: -18deg)   */}
          {/* ------------------------------------------------- */}
          <g transform="rotate(-18 400 400)">
            <path
              id="orbit-path-outer"
              d="M 40,400 A 360,230 0 1,0 760,400 A 360,230 0 1,0 40,400"
              fill="none"
              stroke="rgba(255,153,0,0.42)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow-filter)"
            />

            {/* Glowing moving particles (6 staggered particles) */}
            {[0, -20, -40, -60, -80, -100].map((delay, idx) => (
              <circle key={`p-out-${idx}`} r="3" fill="#FF9900" filter="url(#orbit-glow-filter)">
                <animateMotion dur="140s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#orbit-path-outer" />
                </animateMotion>
              </circle>
            ))}

            {/* Icons: Camera (top center ≈ 25% of path), Gallery (right center ≈ 50%), Calendar (bottom-left ≈ 80%) */}
            <foreignObject width="60" height="60" x="-30" y="-30" className="pointer-events-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/88 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center animate-[pulse-icon_4s_ease-in-out_infinite]">
                  <Camera className="h-5 w-5 text-[#FF9900]" />
                </div>
              </div>
              <animateMotion dur="140s" repeatCount="indefinite" begin="-35s">
                <mpath href="#orbit-path-outer" />
              </animateMotion>
            </foreignObject>

            <foreignObject width="60" height="60" x="-30" y="-30" className="pointer-events-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/88 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center animate-[pulse-icon_4s_ease-in-out_infinite]">
                  <ImageIcon className="h-5 w-5 text-[#FF9900]" />
                </div>
              </div>
              <animateMotion dur="140s" repeatCount="indefinite" begin="-70s">
                <mpath href="#orbit-path-outer" />
              </animateMotion>
            </foreignObject>

            <foreignObject width="60" height="60" x="-30" y="-30" className="pointer-events-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/88 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center animate-[pulse-icon_4s_ease-in-out_infinite]">
                  <Calendar className="h-5 w-5 text-[#FF9900]" />
                </div>
              </div>
              <animateMotion dur="140s" repeatCount="indefinite" begin="-112s">
                <mpath href="#orbit-path-outer" />
              </animateMotion>
            </foreignObject>
          </g>

          {/* ------------------------------------------------- */}
          {/* ORBIT 2: MIDDLE (rx: 270, ry: 170, tilt: 18deg)    */}
          {/* ------------------------------------------------- */}
          <g transform="rotate(18 400 400)">
            <path
              id="orbit-path-middle"
              d="M 130,400 A 270,170 0 1,0 670,400 A 270,170 0 1,0 130,400"
              fill="none"
              stroke="rgba(255,153,0,0.42)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow-filter)"
            />

            {/* Glowing moving particles (6 staggered particles) */}
            {[0, -16, -33, -50, -66, -83].map((delay, idx) => (
              <circle key={`p-mid-${idx}`} r="3" fill="#FF9900" filter="url(#orbit-glow-filter)">
                <animateMotion dur="100s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#orbit-path-middle" />
                </animateMotion>
              </circle>
            ))}

            {/* Icons: People (left center ≈ 0%), Heart (bottom center ≈ 75%) */}
            <foreignObject width="60" height="60" x="-30" y="-30" className="pointer-events-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/88 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center animate-[pulse-icon_4s_ease-in-out_infinite]">
                  <Users className="h-5 w-5 text-[#FF9900]" />
                </div>
              </div>
              <animateMotion dur="100s" repeatCount="indefinite" begin="0s">
                <mpath href="#orbit-path-middle" />
              </animateMotion>
            </foreignObject>

            <foreignObject width="60" height="60" x="-30" y="-30" className="pointer-events-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/88 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center animate-[pulse-icon_4s_ease-in-out_infinite]">
                  <Heart className="h-5 w-5 text-[#FF9900]" />
                </div>
              </div>
              <animateMotion dur="100s" repeatCount="indefinite" begin="-75s">
                <mpath href="#orbit-path-middle" />
              </animateMotion>
            </foreignObject>
          </g>

          {/* ------------------------------------------------- */}
          {/* ORBIT 3: INNER (rx: 190, ry: 120, tilt: -35deg)   */}
          {/* ------------------------------------------------- */}
          <g transform="rotate(-35 400 400)">
            <path
              id="orbit-path-inner"
              d="M 210,400 A 190,120 0 1,0 590,400 A 190,120 0 1,0 210,400"
              fill="none"
              stroke="rgba(255,153,0,0.42)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow-filter)"
            />

            {/* Glowing moving particles (6 staggered particles) */}
            {[0, -11, -23, -35, -46, -58].map((delay, idx) => (
              <circle key={`p-inn-${idx}`} r="3" fill="#FF9900" filter="url(#orbit-glow-filter)">
                <animateMotion dur="70s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#orbit-path-inner" />
                </animateMotion>
              </circle>
            ))}

            {/* Icons: Trophy (top-right ≈ 35%) */}
            <foreignObject width="60" height="60" x="-30" y="-30" className="pointer-events-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/88 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center animate-[pulse-icon_4s_ease-in-out_infinite]">
                  <Trophy className="h-5 w-5 text-[#FF9900]" />
                </div>
              </div>
              <animateMotion dur="70s" repeatCount="indefinite" begin="-25s">
                <mpath href="#orbit-path-inner" />
              </animateMotion>
            </foreignObject>
          </g>
        </svg>

        {/* 4. Interactive Floating Photo Cards */}
        {CARDS_DATA.map((card) => {
          const isHovered = hoveredCardId === card.id;
          const cardZIndex = isHovered ? 50 : card.isCenter ? 30 : 25;

          const positionStyle = card.isCenter
            ? {
                top: "calc(50% - 120px)",
                left: "calc(50% - 180px)",
              }
            : {
                top: card.top,
                bottom: card.bottom,
                left: card.left,
                right: card.right,
              };

          return (
            <motion.div
              key={card.id}
              className={`absolute select-none pointer-events-auto group cursor-pointer overflow-hidden border border-orange-500/20 bg-[#0f0f19]/85 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-300 ${
                card.isCenter
                  ? "w-[360px] h-[240px] rounded-[20px]"
                  : "w-[230px] h-[155px] rounded-[20px]"
              }`}
              style={{
                ...positionStyle,
                zIndex: cardZIndex,
              }}
              initial={{ opacity: 0, scale: card.isCenter ? 0.95 : 0.85 }}
              animate={{
                opacity: 1,
                scale: isHovered ? 1.04 : card.isCenter ? 1.0 : 0.88,
                y: isHovered ? -8 : [0, -6, 0],
                rotate: isHovered
                  ? card.initialRotation
                  : [card.initialRotation, card.initialRotation + 1.2, card.initialRotation],
                borderColor: isHovered ? "rgba(255, 153, 0, 0.65)" : "rgba(255, 153, 0, 0.2)",
                boxShadow: isHovered
                  ? "0 0 35px rgba(255, 153, 0, 0.45), 0 16px 48px rgba(0,0,0,0.65)"
                  : card.isCenter
                  ? "0 0 25px rgba(255, 153, 0, 0.15), 0 10px 40px rgba(0,0,0,0.45)"
                  : "0 0 12px rgba(255, 153, 0, 0.05), 0 10px 40px rgba(0,0,0,0.45)",
              }}
              transition={{
                scale: { duration: 0.3, ease: "easeOut" },
                rotate: isHovered ? { duration: 0.3 } : { duration: 6.0, repeat: Infinity, ease: "easeInOut" },
                borderColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                y: isHovered
                  ? { duration: 0.3 }
                  : {
                      duration: card.isCenter ? 8.0 : 6.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: card.floatDelay,
                    },
              }}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
            >
              {/* Glossy reflection sheen overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

              {/* Card Image */}
              <div className="w-full h-full relative overflow-hidden bg-slate-900">
                <img
                  src={card.imageSrc}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-104"
                  loading="lazy"
                />
                {/* Bottom Overlay Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-95 transition-opacity duration-300" />
              </div>

              {/* Card Labels */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 text-left">
                <h4 className={`font-bold text-white leading-tight ${card.isCenter ? 'text-base sm:text-lg md:text-xl' : 'text-sm'}`}>
                  {card.title}
                </h4>
                <p className={`font-bold text-[#FF9900] mt-0.5 tracking-wide ${card.isCenter ? 'text-sm' : 'text-xs'}`}>
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* MOBILE VIEW: VERTICAL STACKED CARDS (Orbits hidden) */}
      {/* ================================================= */}
      <div className="flex sm:hidden flex-col gap-6 w-full items-center px-4 py-8">
        {CARDS_DATA.map((card) => (
          <div
            key={card.id}
            className="w-[280px] h-[190px] rounded-2xl overflow-hidden border border-orange-500/25 bg-[#0f0f19]/85 shadow-[0_10px_40px_rgba(0,0,0,0.45)] relative"
          >
            {/* Card Image */}
            <div className="w-full h-full relative overflow-hidden bg-slate-900">
              <img
                src={card.imageSrc}
                alt={card.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 text-left">
              <h4 className="font-bold text-white text-sm">
                {card.title}
              </h4>
              <p className="font-bold text-[#FF9900] mt-0.5 text-xs">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CSS KEYFRAME PULSE ANIMATION FOR BADGES */}
      <style>{`
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
