"use client";

import { useState, useEffect } from "react";

interface SolarCoreSunProps {
  reducedMotion: boolean;
  mouseX: number;
  mouseY: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  scaleFactor?: number;
  sunPulsed?: boolean; // triggered when a planet is clicked
}

export function SolarCoreSun({
  reducedMotion,
  mouseX,
  mouseY,
  isHovered,
  onHover,
  scaleFactor = 1,
  sunPulsed = false,
}: SolarCoreSunProps) {
  const [pulseRing, setPulseRing] = useState(false);

  // Trigger an extra pulse ring when a planet is clicked
  useEffect(() => {
    if (sunPulsed) {
      setPulseRing(true);
      const t = setTimeout(() => setPulseRing(false), 800);
      return () => clearTimeout(t);
    }
  }, [sunPulsed]);

  const parallaxX = reducedMotion ? 0 : mouseX * 7;
  const parallaxY = reducedMotion ? 0 : mouseY * 7;
  const rotateX = reducedMotion ? 0 : -mouseY * 12;
  const rotateY = reducedMotion ? 0 : mouseX * 12;

  // Scaled sizes (increased core by 15%, halos/glows by 25%)
  const s = Math.max(scaleFactor, 0.35);
  const sunSize   = Math.round(170 * s);
  const flare1    = Math.round(250 * s);
  const flare2    = Math.round(298 * s);
  const halo1     = Math.round(388 * s);
  const halo2     = Math.round(525 * s);
  const atmos     = Math.round(700 * s);
  const solarWind = Math.round(820 * s);

  return (
    <div
      className="absolute flex items-center justify-center select-none"
      style={{
        top: "50%",
        left: "50%",
        transform: `translate3d(calc(-50% + ${parallaxX}px), calc(-50% + ${parallaxY}px), 0) scale(${isHovered ? 1.05 : 1}) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.35s ease-out",
        zIndex: 10,
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* ── Layer 4.5: Outermost solar winds volumetric glow ─── */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: solarWind,
          height: solarWind,
          top: -solarWind / 2,
          left: -solarWind / 2,
          background:
            "radial-gradient(circle, rgba(255,140,0,0.02) 0%, rgba(255,100,0,0.005) 50%, transparent 80%)",
          filter: "blur(40px)",
          animation: reducedMotion ? "none" : "sun-atmos 12s ease-in-out infinite",
          opacity: isHovered ? 0.9 : 0.65,
          willChange: "transform, opacity",
        }}
      />

      {/* ── Layer 4: Atmospheric outer glow ─── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: atmos,
          height: atmos,
          top: -atmos / 2,
          left: -atmos / 2,
          background:
            "radial-gradient(circle, rgba(255,120,0,0.035) 0%, rgba(255,80,0,0.015) 45%, transparent 72%)",
          animation: reducedMotion ? "none" : "sun-atmos 9s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />

      {/* ── Layer 3: Large soft halo ─────────── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: halo2,
          height: halo2,
          top: -halo2 / 2,
          left: -halo2 / 2,
          background:
            "radial-gradient(circle, rgba(255,140,0,0.07) 0%, rgba(255,120,0,0.03) 50%, transparent 72%)",
          filter: "blur(18px)",
          animation: reducedMotion ? "none" : "sun-breathe 7s ease-in-out infinite",
          opacity: isHovered ? 1 : 0.7,
          transform: "scale(1)",
          transition: "opacity 0.6s ease-in-out",
          willChange: "opacity",
        }}
      />

      {/* ── Layer 2: Radial orange gradient ──── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: halo1,
          height: halo1,
          top: -halo1 / 2,
          left: -halo1 / 2,
          background:
            "radial-gradient(circle, rgba(255,160,0,0.14) 0%, rgba(255,140,0,0.06) 40%, transparent 70%)",
          filter: "blur(10px)",
          animation: reducedMotion ? "none" : "sun-breathe 5s ease-in-out infinite 1.5s",
          opacity: isHovered ? 1 : 0.75,
          transform: "scale(1)",
          transition: "opacity 0.5s ease-in-out",
          willChange: "opacity",
        }}
      />

      {/* ── Conic flare ring 1 (slow clockwise) ── */}
      {!reducedMotion && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: flare1,
            height: flare1,
            top: -flare1 / 2,
            left: -flare1 / 2,
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(255,140,0,0.09) 12%, transparent 24%, transparent 48%, rgba(255,140,0,0.07) 62%, transparent 76%)",
            border: "1px solid rgba(255,140,0,0.07)",
            animation: "sun-flare-cw 22s linear infinite",
            opacity: isHovered ? 0.9 : 0.45,
            transition: "opacity 0.5s ease",
          }}
        />
      )}

      {/* ── Conic flare ring 2 (counter-clockwise) ── */}
      {!reducedMotion && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: flare2,
            height: flare2,
            top: -flare2 / 2,
            left: -flare2 / 2,
            background:
              "conic-gradient(from 180deg, transparent 0%, rgba(255,180,0,0.06) 18%, transparent 36%, transparent 62%, rgba(255,140,0,0.05) 80%, transparent 95%)",
            animation: "sun-flare-ccw 30s linear infinite",
            opacity: isHovered ? 0.75 : 0.3,
            transition: "opacity 0.5s ease",
          }}
        />
      )}

      {/* ── Planet-click pulse ring ─────────── */}
      {pulseRing && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: halo1,
            height: halo1,
            top: -halo1 / 2,
            left: -halo1 / 2,
            border: "1.5px solid rgba(255,140,0,0.5)",
            animation: "sun-click-pulse 0.8s ease-out forwards",
          }}
        />
      )}

      {/* ── Layer 5: Faint slowly rotating orbital inscription ── */}
      <svg
        viewBox="0 0 240 240"
        className="absolute pointer-events-none z-10"
        style={{
          width: 240 * s,
          height: 240 * s,
          animation: reducedMotion ? "none" : "spin-clockwise 140s linear infinite",
          opacity: isHovered ? 0.55 : 0.2,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <defs>
          <path
            id="rimt-inscription-path"
            d="M 120 28 a 92 92 0 1 1 0 184 a 92 92 0 1 1 0 -184"
          />
        </defs>
        <text
          fill="rgba(255, 255, 255, 0.85)"
          style={{
            fontSize: "7px",
            fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          <textPath href="#rimt-inscription-path" startOffset="0%">
            RIMT UNIVERSITY • AWS STUDENT BUILDER GROUP • LUDHIANA • RIMT UNIVERSITY • AWS STUDENT BUILDER GROUP • LUDHIANA •
          </textPath>
        </text>
      </svg>

      {/* ── Layer 1: Bright core body ─────────── */}
      <div
        className="relative z-20 rounded-full flex flex-col items-center justify-center cursor-pointer text-center"
        style={{
          width: sunSize,
          height: sunSize,
          background:
            "radial-gradient(circle at 38% 32%, rgba(255,220,100,0.98) 0%, rgba(255,150,0,0.95) 38%, rgba(210,105,0,0.92) 72%, rgba(160,70,0,0.88) 100%)",
          boxShadow: isHovered
            ? `0 0 ${Math.round(55*s)}px rgba(255,140,0,0.55),
               0 0 ${Math.round(100*s)}px rgba(255,140,0,0.22),
               0 0 ${Math.round(160*s)}px rgba(255,120,0,0.1),
               inset 0 0 ${Math.round(28*s)}px rgba(255,255,255,0.18)`
            : `0 0 ${Math.round(38*s)}px rgba(255,140,0,0.4),
               0 0 ${Math.round(72*s)}px rgba(255,140,0,0.15),
               0 0 ${Math.round(120*s)}px rgba(255,120,0,0.07),
               inset 0 0 ${Math.round(20*s)}px rgba(255,255,255,0.12)`,
          transform: "scale(1)",
          transition: "box-shadow 0.5s ease",
          animation: reducedMotion ? "none" : "sun-shimmer 4s ease-in-out infinite",
        }}
      >
        {/* Inner shine highlight */}
        <div
          className="absolute rounded-full opacity-25 pointer-events-none"
          style={{
            top: Math.round(sunSize * 0.1),
            left: Math.round(sunSize * 0.2),
            width: Math.round(sunSize * 0.38),
            height: Math.round(sunSize * 0.22),
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, transparent 70%)",
          }}
        />

        {/* Energy shimmer inner ring */}
        {!reducedMotion && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.round(sunSize * 0.82),
              height: Math.round(sunSize * 0.82),
              border: "1px solid rgba(255,220,100,0.25)",
              animation: "sun-inner-ring 3s ease-in-out infinite",
            }}
          />
        )}

        {/* Text */}
        <span
          className="font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase leading-none relative z-10 transition-colors duration-300"
          style={{
            fontSize: `${Math.max(10, Math.round(15 * s))}px`,
            letterSpacing: "0.15em",
          }}
        >
          RIMT
        </span>
        <span
          className="font-bold text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase mt-1 leading-none relative z-10"
          style={{
            fontSize: `${Math.max(5.5, Math.round(7.5 * s))}px`,
            letterSpacing: "0.12em",
          }}
        >
          AWS Student
        </span>
        <span
          className="font-bold text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase leading-none mt-0.5 relative z-10"
          style={{
            fontSize: `${Math.max(5.5, Math.round(7.5 * s))}px`,
            letterSpacing: "0.12em",
          }}
        >
          Builder Group
        </span>

        {/* Build • Learn • Lead details */}
        <span
          className="font-medium text-white/45 uppercase tracking-widest mt-2 relative z-10 transition-all duration-300"
          style={{
            fontSize: `${Math.max(4.2, Math.round(5.2 * s))}px`,
            letterSpacing: "0.22em",
            opacity: isHovered ? 0.85 : 0.45,
          }}
        >
          Build • Learn • Lead
        </span>
      </div>

      <style>{`
        @keyframes sun-breathe {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.08); }
        }
        @keyframes sun-atmos {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          33%       { opacity: 0.8; transform: scale(1.04); }
          66%       { opacity: 0.6; transform: scale(0.98); }
        }
        @keyframes sun-shimmer {
          0%, 100% { filter: brightness(1); }
          40%       { filter: brightness(1.04); }
          70%       { filter: brightness(0.97); }
        }
        @keyframes sun-flare-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sun-flare-ccw {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes spin-clockwise {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sun-inner-ring {
          0%, 100% { opacity: 0.15; transform: scale(0.96); }
          50%       { opacity: 0.4;  transform: scale(1); }
        }
        @keyframes sun-click-pulse {
          0%   { transform: scale(1);    opacity: 0.8; }
          100% { transform: scale(2.2);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}
