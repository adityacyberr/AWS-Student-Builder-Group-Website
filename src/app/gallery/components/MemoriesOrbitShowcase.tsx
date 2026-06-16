"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, Calendar, Heart, Trophy } from "lucide-react";

interface CardData {
  id: string;
  imageSrc: string;
  title: string;
  subtitle: string;
  initialRotation: number;
  // Position style values for desktop layout
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
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
    initialRotation: -8,
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
    initialRotation: 7,
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
    initialRotation: -10,
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
    initialRotation: 8,
    bottom: "3%",
    right: "4%",
    floatDelay: 2.8,
  },
];

export function MemoriesOrbitShowcase() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] md:h-[550px] lg:h-[600px] max-w-[650px] flex items-center justify-center overflow-hidden z-10 select-none">
      
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
      <div
        className="absolute w-[350px] h-[350px] sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.28), rgba(255,140,0,0.12), transparent 70%)"
        }}
      />

      {/* ================================================= */}
      {/* DESKTOP / TABLET: CONSTELLATION ORBIT VIEW        */}
      {/* ================================================= */}
      <div className="hidden sm:flex relative w-full h-full items-center justify-center pointer-events-none">
        
        {/* Tilted elliptical space for orbit paths and icons */}
        <div 
          className="absolute w-[600px] h-[600px] flex items-center justify-center pointer-events-none z-10"
          style={{ transform: "rotate(-12deg) scaleY(0.48)" }}
        >
          {/* Concentric dashed SVG Orbit paths */}
          <svg className="absolute w-full h-full overflow-visible opacity-30" viewBox="0 0 600 600">
            {/* Orbit Circle 1 (Inner - R=140px) */}
            <circle
              cx="300"
              cy="300"
              r="140"
              fill="none"
              stroke="rgba(249, 115, 22, 0.55)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
            {/* Orbit Circle 2 (Mid - R=210px) */}
            <circle
              cx="300"
              cy="300"
              r="210"
              fill="none"
              stroke="rgba(249, 115, 22, 0.35)"
              strokeWidth="1"
              strokeDasharray="6 12"
            />
            {/* Orbit Circle 3 (Outer - R=270px) */}
            <circle
              cx="300"
              cy="300"
              r="270"
              fill="none"
              stroke="rgba(249, 115, 22, 0.22)"
              strokeWidth="0.8"
              strokeDasharray="8 16"
            />
          </svg>

          {/* 3. Orbiting Icons travelling along paths (using CSS keyframes) */}
          
          {/* Inner Orbit (60s speed) - Camera */}
          <div className="absolute w-[280px] h-[280px] rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-orange-500/30 bg-slate-950/95 shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center justify-center animate-pulse pointer-events-auto">
              <div className="animate-[spin-reverse_60s_linear_infinite] flex items-center justify-center">
                <Camera className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>

          {/* Inner Orbit (60s speed) - Heart (180deg offset position) */}
          <div className="absolute w-[280px] h-[280px] rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]" style={{ transform: "rotate(180deg)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-orange-500/30 bg-slate-950/95 shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center justify-center animate-pulse pointer-events-auto" style={{ animationDelay: "1s" }}>
              <div className="animate-[spin-reverse_60s_linear_infinite] flex items-center justify-center">
                <Heart className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>

          {/* Mid Orbit (90s speed) - ImageIcon */}
          <div className="absolute w-[420px] h-[420px] rounded-full flex items-center justify-center animate-[spin_90s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-orange-500/25 bg-slate-950/95 shadow-[0_0_10px_rgba(249,115,22,0.3)] flex items-center justify-center animate-pulse pointer-events-auto" style={{ animationDelay: "0.5s" }}>
              <div className="animate-[spin-reverse_90s_linear_infinite] flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>

          {/* Mid Orbit (90s speed) - Calendar (180deg offset position) */}
          <div className="absolute w-[420px] h-[420px] rounded-full flex items-center justify-center animate-[spin_90s_linear_infinite]" style={{ transform: "rotate(180deg)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-orange-500/25 bg-slate-950/95 shadow-[0_0_10px_rgba(249,115,22,0.3)] flex items-center justify-center animate-pulse pointer-events-auto" style={{ animationDelay: "1.5s" }}>
              <div className="animate-[spin-reverse_90s_linear_infinite] flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>

          {/* Outer Orbit (120s speed) - Trophy */}
          <div className="absolute w-[540px] h-[540px] rounded-full flex items-center justify-center animate-[spin_120s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-orange-500/20 bg-slate-950/95 shadow-[0_0_8px_rgba(249,115,22,0.25)] flex items-center justify-center animate-pulse pointer-events-auto" style={{ animationDelay: "2s" }}>
              <div className="animate-[spin-reverse_120s_linear_infinite] flex items-center justify-center">
                <Trophy className="h-4 w-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>

        </div>

        {/* 4. Floating Photo Cards Layer */}
        {CARDS_DATA.map((card) => {
          const isHovered = hoveredCardId === card.id;
          const cardZIndex = isHovered ? 50 : card.isCenter ? 30 : 20;

          // Position style properties
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
              className={`absolute select-none pointer-events-auto group cursor-pointer overflow-hidden border border-orange-500/20 bg-slate-950/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 ${
                card.isCenter
                  ? "w-[360px] h-[240px] rounded-[24px]"
                  : "w-[230px] h-[155px] rounded-[20px]"
              }`}
              style={{
                ...positionStyle,
                zIndex: cardZIndex,
              }}
              initial={{ opacity: 0, scale: card.isCenter ? 0.95 : 0.85 }}
              animate={{
                opacity: 1,
                scale: isHovered ? 1.05 : card.isCenter ? 1.0 : 0.86,
                y: isHovered ? -6 : [0, -10, 0],
                rotate: isHovered
                  ? card.initialRotation
                  : [card.initialRotation, card.initialRotation + 1.5, card.initialRotation],
                borderColor: isHovered ? "rgba(249, 115, 22, 0.65)" : "rgba(249, 115, 22, 0.2)",
                boxShadow: isHovered
                  ? "0 0 35px rgba(249, 115, 22, 0.45), 0 16px 48px rgba(0,0,0,0.65)"
                  : card.isCenter
                  ? "0 0 25px rgba(249, 115, 22, 0.15), 0 8px 32px rgba(0,0,0,0.5)"
                  : "0 0 12px rgba(249, 115, 22, 0.05), 0 8px 32px rgba(0,0,0,0.5)",
              }}
              transition={{
                scale: { duration: 0.3, ease: "easeOut" },
                rotate: isHovered ? { duration: 0.3 } : { duration: 5, repeat: Infinity, ease: "easeInOut" },
                borderColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                y: isHovered
                  ? { duration: 0.3 }
                  : {
                      duration: card.isCenter ? 6.0 : 4.5,
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
                {/* Frosted dark overlay at bottom for labels */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent opacity-95 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Card Title/Subtitle Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 text-left">
                <h4 className={`font-black text-white leading-tight ${card.isCenter ? 'text-base sm:text-lg md:text-xl' : 'text-sm'}`}>
                  {card.title}
                </h4>
                <p className={`font-bold text-orange-400 mt-0.5 tracking-wide ${card.isCenter ? 'text-sm' : 'text-xs'}`}>
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
            className="flex-shrink-0 w-[260px] h-[185px] snap-center rounded-2xl overflow-hidden border border-orange-500/25 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative"
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

      {/* CSS KEYFRAME SPIN ANIMATIONS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg) scaleY(2.08) rotate(12deg); }
          to { transform: rotate(0deg) scaleY(2.08) rotate(12deg); }
        }
      `}</style>
    </div>
  );
}
