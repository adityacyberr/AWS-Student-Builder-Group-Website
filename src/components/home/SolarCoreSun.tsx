"use client";

import { useState } from "react";

interface SolarCoreSunProps {
  reducedMotion: boolean;
  mouseX: number;
  mouseY: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  scaleFactor?: number;
}

export function SolarCoreSun({
  reducedMotion,
  mouseX,
  mouseY,
  isHovered,
  onHover,
  scaleFactor = 1,
}: SolarCoreSunProps) {
  // Subtle parallax based on mouse
  const parallaxX = reducedMotion ? 0 : mouseX * 8;
  const parallaxY = reducedMotion ? 0 : mouseY * 8;

  const sunSize = 160 * scaleFactor;
  const flare1Size = 210 * scaleFactor;
  const flare2Size = 240 * scaleFactor;
  const glow1Size = 380 * scaleFactor;
  const glow2Size = 260 * scaleFactor;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        transition: "transform 0.3s ease-out",
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Outermost volumetric glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: glow1Size,
          height: glow1Size,
          background:
            "radial-gradient(circle, rgba(255,140,0,0.06) 0%, rgba(255,140,0,0.02) 40%, transparent 70%)",
          filter: "blur(30px)",
          animation: reducedMotion ? "none" : "sun-breathe 6s ease-in-out infinite",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.8s ease-out",
        }}
      />

      {/* Mid glow layer */}
      <div
        className="absolute rounded-full"
        style={{
          width: glow2Size,
          height: glow2Size,
          background:
            "radial-gradient(circle, rgba(255,160,0,0.12) 0%, rgba(255,140,0,0.04) 50%, transparent 70%)",
          filter: "blur(20px)",
          animation: reducedMotion
            ? "none"
            : "sun-breathe 5s ease-in-out infinite 1s",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.6s ease-out",
        }}
      />

      {/* Solar flare ring */}
      {!reducedMotion && (
        <div
          className="absolute rounded-full"
          style={{
            width: flare1Size,
            height: flare1Size,
            border: "1px solid rgba(255,140,0,0.08)",
            background: `conic-gradient(from 0deg, transparent 0%, rgba(255,140,0,0.08) 10%, transparent 20%, transparent 50%, rgba(255,140,0,0.06) 60%, transparent 70%)`,
            animation: "sun-flare-rotate 20s linear infinite",
            opacity: isHovered ? 0.8 : 0.4,
            transition: "opacity 0.5s ease",
          }}
        />
      )}

      {/* Second flare ring (counter-rotate) */}
      {!reducedMotion && (
        <div
          className="absolute rounded-full"
          style={{
            width: flare2Size,
            height: flare2Size,
            background: `conic-gradient(from 180deg, transparent 0%, rgba(255,180,0,0.05) 15%, transparent 30%, transparent 60%, rgba(255,140,0,0.04) 75%, transparent 90%)`,
            animation: "sun-flare-counter 28s linear infinite",
            opacity: isHovered ? 0.7 : 0.3,
            transition: "opacity 0.5s ease",
          }}
        />
      )}

      {/* Core sun body */}
      <div
        className="relative z-10 rounded-full flex flex-col items-center justify-center cursor-pointer text-center"
        style={{
          width: sunSize,
          height: sunSize,
          background:
            "radial-gradient(circle at 40% 35%, rgba(255,200,80,0.95) 0%, rgba(255,140,0,0.9) 40%, rgba(200,100,0,0.85) 80%)",
          boxShadow: isHovered
            ? "0 0 60px rgba(255,140,0,0.5), 0 0 120px rgba(255,140,0,0.2), inset 0 0 30px rgba(255,255,255,0.15)"
            : "0 0 40px rgba(255,140,0,0.35), 0 0 80px rgba(255,140,0,0.12), inset 0 0 20px rgba(255,255,255,0.1)",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
          transition: "box-shadow 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Inner shine */}
        <div
          className="absolute top-2 left-4 w-12 h-6 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)",
          }}
        />

        {/* Text scaled down on mobile */}
        <span 
          className="font-black tracking-[0.2em] text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase leading-none"
          style={{ fontSize: `${Math.max(7, 11 * scaleFactor)}px` }}
        >
          AWS
        </span>
        <span 
          className="font-bold tracking-[0.15em] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase mt-0.5 leading-none"
          style={{ fontSize: `${Math.max(5, 7 * scaleFactor)}px` }}
        >
          Student Builder
        </span>
        <span 
          className="font-bold tracking-[0.15em] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase leading-none mt-0.5"
          style={{ fontSize: `${Math.max(5, 7 * scaleFactor)}px` }}
        >
          Group
        </span>
      </div>

      {/* Orbit ring decorations */}
      {[190, 240, 300, 370].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * scaleFactor,
            height: size * scaleFactor,
            border: `1px ${i % 2 === 0 ? "solid" : "dashed"} rgba(255,140,0,${isHovered ? 0.12 + i * 0.02 : 0.05 + i * 0.01})`,
            transition: "border-color 0.5s ease",
          }}
        />
      ))}

      <style jsx>{`
        @keyframes sun-breathe {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }
        @keyframes sun-flare-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes sun-flare-counter {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
