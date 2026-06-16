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
    top: "6%",
    left: "2%",
    floatDelay: 0.8,
  },
  // TOP RIGHT
  {
    id: "top-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Meetup",
    subtitle: "Growing Together",
    initialRotation: 10,
    top: "3%",
    right: "2%",
    floatDelay: 1.4,
  },
  // BOTTOM LEFT
  {
    id: "bottom-left",
    imageSrc: "/gallery/launch-agenda.jpg",
    title: "Tech Talk",
    subtitle: "Expert Sessions",
    initialRotation: -8,
    bottom: "6%",
    left: "4%",
    floatDelay: 2.2,
  },
  // BOTTOM RIGHT
  {
    id: "bottom-right",
    imageSrc: "/gallery/welcome-team.jpg",
    title: "Achievements",
    subtitle: "Milestones Earned",
    initialRotation: 14,
    bottom: "3%",
    right: "4%",
    floatDelay: 2.8,
  },
];

export function MemoriesOrbitShowcase() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] md:h-[580px] lg:h-[650px] max-w-[680px] flex items-center justify-center overflow-hidden z-10 select-none">
      
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
            className="absolute h-1.5 w-1.5 bg-orange-500/30 rounded-full"
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
        className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,153,0,0.18), rgba(255,153,0,0.08), transparent 70%)"
        }}
      />

      {/* ================================================= */}
      {/* DESKTOP / TABLET: CONSTELLATION ORBIT VIEW        */}
      {/* ================================================= */}
      <div className="hidden sm:flex relative w-full h-full items-center justify-center pointer-events-none">
        
        {/* Glow filter definition for orbits & moving particles */}
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="orbit-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Orbit Path 1 (Inner Ellipse) - Tilted -15deg */}
        <div 
          className="absolute w-[600px] h-[600px] flex items-center justify-center pointer-events-none z-10 animate-[spin_60s_linear_infinite]"
          style={{ transform: "rotate(-15deg) scaleY(0.48)" }}
        >
          <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 600 600">
            <path
              id="orbit-path-1"
              d="M 160,300 A 140,67 0 1,0 440,300 A 140,67 0 1,0 160,300"
              fill="none"
              stroke="rgba(255,153,0,0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow)"
            />
            {/* Glowing moving particle */}
            <circle r="4" fill="#FF9900" filter="url(#orbit-glow)">
              <animateMotion dur="8s" repeatCount="indefinite">
                <mpath href="#orbit-path-1" />
              </animateMotion>
            </circle>
          </svg>

          {/* Camera (Top) */}
          <div className="absolute w-[280px] h-[280px] rounded-full flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/85 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 duration-350">
              <div className="animate-[spin-reverse-inner-1_60s_linear_infinite] flex items-center justify-center w-full h-full">
                <div className="animate-[pulse-icon_4s_ease-in-out_infinite] flex items-center justify-center">
                  <Camera className="h-5 w-5 text-orange-400 filter drop-shadow-[0_0_4px_rgba(255,153,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Heart (Bottom - 180deg offset) */}
          <div className="absolute w-[280px] h-[280px] rounded-full flex items-center justify-center" style={{ transform: "rotate(180deg)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/85 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 duration-350">
              <div className="animate-[spin-reverse-inner-2_60s_linear_infinite] flex items-center justify-center w-full h-full">
                <div className="animate-[pulse-icon_4s_ease-in-out_infinite] flex items-center justify-center" style={{ animationDelay: "1s" }}>
                  <Heart className="h-5 w-5 text-orange-400 filter drop-shadow-[0_0_4px_rgba(255,153,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orbit Path 2 (Mid-1 Ellipse) - Tilted 18deg */}
        <div 
          className="absolute w-[600px] h-[600px] flex items-center justify-center pointer-events-none z-10 animate-[spin_90s_linear_infinite]"
          style={{ transform: "rotate(18deg) scaleY(0.48)" }}
        >
          <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 600 600">
            <path
              id="orbit-path-2"
              d="M 100,300 A 200,96 0 1,0 500,300 A 200,96 0 1,0 100,300"
              fill="none"
              stroke="rgba(255,153,0,0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow)"
            />
            <circle r="4" fill="#FF9900" filter="url(#orbit-glow)">
              <animateMotion dur="12s" repeatCount="indefinite">
                <mpath href="#orbit-path-2" />
              </animateMotion>
            </circle>
          </svg>

          {/* Gallery Icon (Top) */}
          <div className="absolute w-[400px] h-[400px] rounded-full flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/85 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 duration-350">
              <div className="animate-[spin-reverse-mid-1_90s_linear_infinite] flex items-center justify-center w-full h-full">
                <div className="animate-[pulse-icon_4s_ease-in-out_infinite] flex items-center justify-center" style={{ animationDelay: "0.5s" }}>
                  <ImageIcon className="h-5 w-5 text-orange-400 filter drop-shadow-[0_0_4px_rgba(255,153,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          {/* People Icon (Bottom - 180deg offset) */}
          <div className="absolute w-[400px] h-[400px] rounded-full flex items-center justify-center" style={{ transform: "rotate(180deg)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/85 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 duration-350">
              <div className="animate-[spin-reverse-mid-2_90s_linear_infinite] flex items-center justify-center w-full h-full">
                <div className="animate-[pulse-icon_4s_ease-in-out_infinite] flex items-center justify-center" style={{ animationDelay: "1.5s" }}>
                  <Users className="h-5 w-5 text-orange-400 filter drop-shadow-[0_0_4px_rgba(255,153,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orbit Path 3 (Mid-2 Ellipse) - Tilted -35deg */}
        <div 
          className="absolute w-[600px] h-[600px] flex items-center justify-center pointer-events-none z-10 animate-[spin_120s_linear_infinite]"
          style={{ transform: "rotate(-35deg) scaleY(0.48)" }}
        >
          <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 600 600">
            <path
              id="orbit-path-3"
              d="M 40,300 A 260,124 0 1,0 560,300 A 260,124 0 1,0 40,300"
              fill="none"
              stroke="rgba(255,153,0,0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow)"
            />
            <circle r="4" fill="#FF9900" filter="url(#orbit-glow)">
              <animateMotion dur="15s" repeatCount="indefinite">
                <mpath href="#orbit-path-3" />
              </animateMotion>
            </circle>
          </svg>

          {/* Calendar Icon (Top) */}
          <div className="absolute w-[520px] h-[520px] rounded-full flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/85 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 duration-350">
              <div className="animate-[spin-reverse-outer-1_120s_linear_infinite] flex items-center justify-center w-full h-full">
                <div className="animate-[pulse-icon_4s_ease-in-out_infinite] flex items-center justify-center" style={{ animationDelay: "2s" }}>
                  <Calendar className="h-5 w-5 text-orange-400 filter drop-shadow-[0_0_4px_rgba(255,153,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orbit Path 4 (Outer Ellipse) - Tilted 42deg */}
        <div 
          className="absolute w-[600px] h-[600px] flex items-center justify-center pointer-events-none z-10 animate-[spin_150s_linear_infinite]"
          style={{ transform: "rotate(42deg) scaleY(0.48)" }}
        >
          <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 600 600">
            <path
              id="orbit-path-4"
              d="M -10,300 A 310,148 0 1,0 610,300 A 310,148 0 1,0 -10,300"
              fill="none"
              stroke="rgba(255,153,0,0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              filter="url(#orbit-glow)"
            />
            <circle r="4" fill="#FF9900" filter="url(#orbit-glow)">
              <animateMotion dur="18s" repeatCount="indefinite">
                <mpath href="#orbit-path-4" />
              </animateMotion>
            </circle>
          </svg>

          {/* Trophy Icon (Top) */}
          <div className="absolute w-[620px] h-[620px] rounded-full flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border border-orange-500/45 bg-[#0f0f19]/85 shadow-[0_0_15px_rgba(255,153,0,0.35),0_0_35px_rgba(255,153,0,0.18)] backdrop-blur-[12px] flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 duration-350">
              <div className="animate-[spin-reverse-outer-2_150s_linear_infinite] flex items-center justify-center w-full h-full">
                <div className="animate-[pulse-icon_4s_ease-in-out_infinite] flex items-center justify-center" style={{ animationDelay: "2.5s" }}>
                  <Trophy className="h-5 w-5 text-orange-400 filter drop-shadow-[0_0_4px_rgba(255,153,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                y: isHovered ? -8 : [0, -8, 0],
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
                rotate: isHovered ? { duration: 0.3 } : { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                borderColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                y: isHovered
                  ? { duration: 0.3 }
                  : {
                      duration: card.isCenter ? 6.5 : 4.8,
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

      {/* CSS KEYFRAME SPIN & PULSE ANIMATIONS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-inner-1 {
          from { transform: rotate(360deg) scaleY(2.08) rotate(15deg); }
          to { transform: rotate(0deg) scaleY(2.08) rotate(15deg); }
        }
        @keyframes spin-reverse-inner-2 {
          from { transform: rotate(180deg) scaleY(2.08) rotate(15deg); }
          to { transform: rotate(-180deg) scaleY(2.08) rotate(15deg); }
        }
        @keyframes spin-reverse-mid-1 {
          from { transform: rotate(360deg) scaleY(2.08) rotate(-18deg); }
          to { transform: rotate(0deg) scaleY(2.08) rotate(-18deg); }
        }
        @keyframes spin-reverse-mid-2 {
          from { transform: rotate(180deg) scaleY(2.08) rotate(-18deg); }
          to { transform: rotate(-180deg) scaleY(2.08) rotate(-18deg); }
        }
        @keyframes spin-reverse-outer-1 {
          from { transform: rotate(360deg) scaleY(2.08) rotate(35deg); }
          to { transform: rotate(0deg) scaleY(2.08) rotate(35deg); }
        }
        @keyframes spin-reverse-outer-2 {
          from { transform: rotate(360deg) scaleY(2.08) rotate(-42deg); }
          to { transform: rotate(0deg) scaleY(2.08) rotate(-42deg); }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
