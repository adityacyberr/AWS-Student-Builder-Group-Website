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
    initialRotation: -10,
    top: "12%",
    left: "5%",
    floatDelay: 1.0,
  },
  // TOP RIGHT
  {
    id: "top-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Meetup",
    subtitle: "Growing Together",
    initialRotation: 8,
    top: "8%",
    right: "5%",
    floatDelay: 2.0,
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
    floatDelay: 3.0,
  },
  // BOTTOM RIGHT
  {
    id: "bottom-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Achievements",
    subtitle: "Milestones Earned",
    initialRotation: 10,
    bottom: "8%",
    right: "8%",
    floatDelay: 4.0,
  },
];

const DRIFTING_PARTICLES = [
  // Higher density near center
  { top: "44%", left: "48%", size: 2.2, duration: 4.5, delay: 0.2 },
  { top: "52%", left: "38%", size: 1.8, duration: 5.2, delay: 0.5 },
  { top: "48%", left: "55%", size: 2.5, duration: 3.8, delay: 0.8 },
  { top: "38%", left: "46%", size: 1.5, duration: 4.9, delay: 0.1 },
  { top: "58%", left: "52%", size: 2.0, duration: 4.2, delay: 1.2 },
  { top: "42%", left: "35%", size: 1.9, duration: 5.5, delay: 0.6 },
  { top: "56%", left: "62%", size: 2.4, duration: 3.9, delay: 1.5 },
  { top: "35%", left: "58%", size: 1.7, duration: 4.7, delay: 0.9 },
  // Medium distance
  { top: "28%", left: "28%", size: 2.1, duration: 5.8, delay: 0.3 },
  { top: "72%", left: "72%", size: 1.6, duration: 6.2, delay: 1.1 },
  { top: "30%", left: "70%", size: 2.3, duration: 5.0, delay: 0.7 },
  { top: "70%", left: "30%", size: 1.9, duration: 5.4, delay: 1.3 },
  { top: "25%", left: "50%", size: 2.6, duration: 4.8, delay: 0.4 },
  { top: "75%", left: "50%", size: 1.5, duration: 6.0, delay: 1.0 },
  // Far outside (lower density)
  { top: "12%", left: "85%", size: 1.2, duration: 7.2, delay: 0.1 },
  { top: "88%", left: "15%", size: 1.0, duration: 8.0, delay: 0.5 },
  { top: "5%",  left: "30%", size: 1.4, duration: 6.8, delay: 0.3 },
  { top: "95%", left: "70%", size: 1.3, duration: 7.5, delay: 1.4 }
];

export function MemoriesOrbitShowcase() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[400px] sm:h-[640px] md:h-[720px] lg:h-[800px] max-w-[800px] flex items-center justify-center overflow-hidden z-10 select-none">
      
      {/* 1. Ambient Twinkling & Drifting Background Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {DRIFTING_PARTICLES.map((pt, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#FF9900]/40 rounded-full"
            style={{
              top: pt.top,
              left: pt.left,
              width: pt.size,
              height: pt.size,
              boxShadow: "0 0 8px rgba(255, 153, 0, 0.6)",
            }}
            animate={{
              opacity: [0.2, 0.85, 0.2],
              scale: [1, 1.35, 1],
              y: [0, -6, 0],
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

      {/* 2. Focused Radial Orange Glow Behind center card */}
      <div
        className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.35) 0%, rgba(255,140,0,0.15) 35%, transparent 75%)",
          filter: "blur(70px)"
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
          {/* ORBIT 1 (INNER): rx: 220, ry: 140, tilt: -35deg, duration: 40s */}
          {/* ------------------------------------------------- */}
          <g transform="rotate(-35 400 400)">
            <path
              id="orbit-path-inner"
              d="M 180,400 A 220,140 0 1,0 620,400 A 220,140 0 1,0 180,400"
              fill="none"
              stroke="rgba(255,153,0,0.42)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow-filter)"
            />

            {/* Glowing moving particles */}
            {[0, -10, -20, -30, -40, -50].map((delay, idx) => (
              <circle key={`p-inn-${idx}`} r="3" fill="#FF9900" filter="url(#orbit-glow-filter)">
                <animateMotion dur="40s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#orbit-path-inner" />
                </animateMotion>
              </circle>
            ))}

            {/* Camera Icon -> top-left orbit */}
            <g className="pointer-events-auto">
              <foreignObject width="60" height="60" x="-30" y="-30">
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="rounded-full flex items-center justify-center animate-[floatIcon_4s_ease-in-out_infinite]"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "rgba(255, 140, 0, 0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 140, 0, 0.25)",
                      boxShadow: "0 0 15px rgba(255, 140, 0, 0.4), 0 0 35px rgba(255, 140, 0, 0.2)",
                      animationDelay: "0s"
                    }}
                  >
                    <Camera 
                      className="text-[#ff9d1f]" 
                      style={{
                        width: "16px",
                        height: "16px",
                        filter: "drop-shadow(0 0 6px rgba(255, 140, 0, 0.7))"
                      }}
                    />
                  </div>
                </div>
              </foreignObject>
              <animateMotion dur="40s" repeatCount="indefinite" begin="-6s">
                <mpath href="#orbit-path-inner" />
              </animateMotion>
            </g>

            {/* Heart Icon -> bottom orbit */}
            <g className="pointer-events-auto">
              <foreignObject width="60" height="60" x="-30" y="-30">
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="rounded-full flex items-center justify-center animate-[floatIcon_4s_ease-in-out_infinite]"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "rgba(255, 140, 0, 0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 140, 0, 0.25)",
                      boxShadow: "0 0 15px rgba(255, 140, 0, 0.4), 0 0 35px rgba(255, 140, 0, 0.2)",
                      animationDelay: "-1.6s"
                    }}
                  >
                    <Heart 
                      className="text-[#ff9d1f]" 
                      style={{
                        width: "16px",
                        height: "16px",
                        filter: "drop-shadow(0 0 6px rgba(255, 140, 0, 0.7))"
                      }}
                    />
                  </div>
                </div>
              </foreignObject>
              <animateMotion dur="40s" repeatCount="indefinite" begin="-30s">
                <mpath href="#orbit-path-inner" />
              </animateMotion>
            </g>
          </g>

          {/* ------------------------------------------------- */}
          {/* ORBIT 2 (MIDDLE): rx: 300, ry: 190, tilt: 18deg, duration: 60s */}
          {/* ------------------------------------------------- */}
          <g transform="rotate(18 400 400)">
            <path
              id="orbit-path-middle"
              d="M 100,400 A 300,190 0 1,0 700,400 A 300,190 0 1,0 100,400"
              fill="none"
              stroke="rgba(255,153,0,0.42)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow-filter)"
            />

            {/* Glowing moving particles */}
            {[0, -12, -24, -36, -48, -60].map((delay, idx) => (
              <circle key={`p-mid-${idx}`} r="3" fill="#FF9900" filter="url(#orbit-glow-filter)">
                <animateMotion dur="60s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#orbit-path-middle" />
                </animateMotion>
              </circle>
            ))}

            {/* Community Icon -> lower-right orbit */}
            <g className="pointer-events-auto">
              <foreignObject width="60" height="60" x="-30" y="-30">
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="rounded-full flex items-center justify-center animate-[floatIcon_4s_ease-in-out_infinite]"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "rgba(255, 140, 0, 0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 140, 0, 0.25)",
                      boxShadow: "0 0 15px rgba(255, 140, 0, 0.4), 0 0 35px rgba(255, 140, 0, 0.2)",
                      animationDelay: "-2.4s"
                    }}
                  >
                    <Users 
                      className="text-[#ff9d1f]" 
                      style={{
                        width: "16px",
                        height: "16px",
                        filter: "drop-shadow(0 0 6px rgba(255, 140, 0, 0.7))"
                      }}
                    />
                  </div>
                </div>
              </foreignObject>
              <animateMotion dur="60s" repeatCount="indefinite" begin="-38s">
                <mpath href="#orbit-path-middle" />
              </animateMotion>
            </g>

            {/* Trophy Icon -> right orbit */}
            <g className="pointer-events-auto">
              <foreignObject width="60" height="60" x="-30" y="-30">
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="rounded-full flex items-center justify-center animate-[floatIcon_4s_ease-in-out_infinite]"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "rgba(255, 140, 0, 0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 140, 0, 0.25)",
                      boxShadow: "0 0 15px rgba(255, 140, 0, 0.4), 0 0 35px rgba(255, 140, 0, 0.2)",
                      animationDelay: "-3.2s"
                    }}
                  >
                    <Trophy 
                      className="text-[#ff9d1f]" 
                      style={{
                        width: "16px",
                        height: "16px",
                        filter: "drop-shadow(0 0 6px rgba(255, 140, 0, 0.7))"
                      }}
                    />
                  </div>
                </div>
              </foreignObject>
              <animateMotion dur="60s" repeatCount="indefinite" begin="-30s">
                <mpath href="#orbit-path-middle" />
              </animateMotion>
            </g>
          </g>

          {/* ------------------------------------------------- */}
          {/* ORBIT 3 (OUTER): rx: 380, ry: 240, tilt: -18deg, duration: 80s */}
          {/* ------------------------------------------------- */}
          <g transform="rotate(-18 400 400)">
            <path
              id="orbit-path-outer"
              d="M 20,400 A 380,240 0 1,0 780,400 A 380,240 0 1,0 20,400"
              fill="none"
              stroke="rgba(255,153,0,0.42)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow-filter)"
            />

            {/* Glowing moving particles */}
            {[0, -15, -30, -45, -60, -75].map((delay, idx) => (
              <circle key={`p-out-${idx}`} r="3" fill="#FF9900" filter="url(#orbit-glow-filter)">
                <animateMotion dur="80s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#orbit-path-outer" />
                </animateMotion>
              </circle>
            ))}

            {/* Gallery Icon -> top orbit */}
            <g className="pointer-events-auto">
              <foreignObject width="60" height="60" x="-30" y="-30">
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="rounded-full flex items-center justify-center animate-[floatIcon_4s_ease-in-out_infinite]"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "rgba(255, 140, 0, 0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 140, 0, 0.25)",
                      boxShadow: "0 0 15px rgba(255, 140, 0, 0.4), 0 0 35px rgba(255, 140, 0, 0.2)",
                      animationDelay: "-0.8s"
                    }}
                  >
                    <ImageIcon 
                      className="text-[#ff9d1f]" 
                      style={{
                        width: "16px",
                        height: "16px",
                        filter: "drop-shadow(0 0 6px rgba(255, 140, 0, 0.7))"
                      }}
                    />
                  </div>
                </div>
              </foreignObject>
              <animateMotion dur="80s" repeatCount="indefinite" begin="-20s">
                <mpath href="#orbit-path-outer" />
              </animateMotion>
            </g>
          </g>
        </svg>

        {/* 4. Interactive Floating Photo Cards Layer */}
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
              className={`absolute select-none pointer-events-auto group cursor-pointer overflow-hidden border bg-[#0f0f19]/85 backdrop-blur-sm transition-all duration-300 ${
                card.isCenter
                  ? "w-[360px] h-[240px] rounded-[20px] border-[#FF9900]/30"
                  : "w-[230px] h-[155px] rounded-[20px] border-[#FF9900]/20"
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
                      duration: 6.0,
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

      {/* CSS KEYFRAME FLOATING ANIMATION FOR ORB BADGES */}
      <style>{`
        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
