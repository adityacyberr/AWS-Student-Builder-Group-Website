"use client";

import { useState } from "react";

interface SolarBackgroundProps {
  reducedMotion: boolean;
}

export function SolarBackground({ reducedMotion }: SolarBackgroundProps) {
  // Pre-generate stable positions for stars to prevent hydration mismatch
  const [stars] = useState(() =>
    Array.from({ length: 75 }).map((_, i) => ({
      id: i,
      x: (i * 13 + 17) % 100,
      y: (i * 27 + 7) % 100,
      size: (i % 3) * 0.4 + 0.6, // 0.6px to 1.4px (very small and subtle)
      opacity: 0.05 + (i % 4) * 0.08, // 0.05 to 0.29 (extremely low brightness)
      duration: 5 + (i % 6), // very slow twinkle
      delay: (i % 8) * 0.8,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#050816]">
      {/* Subtle Vignette Overlay around screen edges */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{
          background: "radial-gradient(circle, transparent 55%, rgba(5, 8, 22, 0.75) 100%)",
        }}
      />

      {/* Very Faint Purple Nebula Cloud (Top Left Area) */}
      <div
        className="absolute top-[5%] left-[5%] w-[60rem] h-[60rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, rgba(76, 29, 149, 0.015) 55%, transparent 100%)",
          filter: "blur(60px)",
        }}
      />

      {/* Very Faint Blue Nebula Cloud (Mid Right Area) */}
      <div
        className="absolute top-[35%] right-[5%] w-[65rem] h-[65rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.045) 0%, rgba(30, 58, 138, 0.01) 60%, transparent 100%)",
          filter: "blur(70px)",
        }}
      />

      {/* Very Faint Violet Nebula Cloud (Bottom Left Area) */}
      <div
        className="absolute bottom-[10%] left-[10%] w-[55rem] h-[55rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.035) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Soft Orange Glow Patch behind the Solar System graphic area */}
      <div
        className="absolute top-[20%] right-[10%] w-[50rem] h-[50rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255, 140, 0, 0.04) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Soft Orange Glow Patch behind the CTA / lower area */}
      <div
        className="absolute bottom-[5%] left-[20%] w-[60rem] h-[60rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255, 140, 0, 0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Tiny Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: reducedMotion
              ? "none"
              : `galaxy-star-twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Distant Easter Egg Galaxy (Top-Left Edge) */}
      <div
        className="absolute top-[12%] left-[4%] opacity-[0.035] select-none pointer-events-none"
        style={{ transform: "rotate(-15deg)" }}
      >
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
          <ellipse cx="30" cy="20" rx="15" ry="4" fill="rgba(147, 51, 234, 0.6)" filter="blur(3px)" />
          <ellipse cx="30" cy="20" rx="6" ry="1.5" fill="#ffffff" filter="blur(0.5px)" />
          <path d="M 30 20 Q 42 16 40 26" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="0.75" strokeLinecap="round" fill="none" />
          <path d="M 30 20 Q 18 24 20 14" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="0.75" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Distant Easter Egg Ringed Planet (Bottom-Left Edge) */}
      <div className="absolute bottom-[18%] left-[5%] opacity-[0.03] select-none pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* Back half of the ring */}
          <path d="M 6 17.5 A 17 5 0 0 1 34 14.5" stroke="rgba(255, 140, 0, 0.3)" strokeWidth="1" transform="rotate(-18 20 20)" />
          {/* Planet core */}
          <circle cx="20" cy="20" r="6.5" fill="url(#planet-glow-grad)" />
          {/* Front half of the ring */}
          <path d="M 6 17.5 A 17 5 0 0 0 34 14.5" stroke="rgba(255, 140, 0, 0.45)" strokeWidth="1" transform="rotate(-18 20 20)" />
          <defs>
            <radialGradient id="planet-glow-grad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffe3a1" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Distant Easter Egg Nebula Cloud Cluster (Mid-Left Edge) */}
      <div className="absolute top-[48%] left-[2%] opacity-[0.025] select-none pointer-events-none">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="20" cy="20" r="12" fill="rgba(59, 130, 246, 0.4)" filter="blur(6px)" />
          <circle cx="30" cy="28" r="10" fill="rgba(147, 51, 234, 0.35)" filter="blur(5px)" />
          <circle cx="24" cy="24" r="3" fill="#ffffff" filter="blur(1px)" />
        </svg>
      </div>

      {/* Distant Easter Egg Pinwheel Galaxy (Bottom-Right Corner) */}
      <div
        className="absolute bottom-[22%] right-[4%] opacity-[0.03] select-none pointer-events-none"
        style={{ transform: "rotate(30deg)" }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="14" fill="rgba(147, 51, 234, 0.4)" filter="blur(4px)" />
          <circle cx="25" cy="25" r="4" fill="#ffffff" filter="blur(1px)" />
          <path d="M 25 25 C 32 20, 32 32, 28 35" stroke="rgba(255, 140, 0, 0.3)" strokeWidth="0.75" fill="none" />
          <path d="M 25 25 C 18 30, 18 18, 22 15" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.75" fill="none" />
        </svg>
      </div>

      {/* Slow Occasional Shooting Stars */}
      {!reducedMotion && (
        <>
          <div className="absolute top-[15%] left-[75%] w-[80px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[-35deg] pointer-events-none animate-shooting-1" />
          <div className="absolute top-[40%] left-[20%] w-[60px] h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent rotate-[-40deg] pointer-events-none animate-shooting-2" />
          <div className="absolute top-[65%] left-[60%] w-[90px] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-[-30deg] pointer-events-none animate-shooting-3" />
        </>
      )}

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes galaxy-star-twinkle {
          0%, 100% { opacity: 0.04; transform: scale(0.9); }
          55% { opacity: 0.35; transform: scale(1.1); }
        }

        @keyframes shooting-star-run {
          0% {
            transform: translate3d(0, 0, 0) scaleX(0.1);
            opacity: 0;
          }
          3% {
            opacity: 0.7;
          }
          10% {
            transform: translate3d(-180px, 130px, 0) scaleX(1.2);
            opacity: 0;
          }
          100% {
            transform: translate3d(-180px, 130px, 0) scaleX(0);
            opacity: 0;
          }
         }

        .animate-shooting-1 {
          animation: shooting-star-run 16s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          animation-delay: 2s;
        }

        .animate-shooting-2 {
          animation: shooting-star-run 22s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          animation-delay: 8s;
        }

        .animate-shooting-3 {
          animation: shooting-star-run 26s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          animation-delay: 14s;
        }
      `}</style>
    </div>
  );
}
