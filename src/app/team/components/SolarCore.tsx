"use client";

import { useState } from "react";

interface SolarCoreProps {
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  reducedMotion: boolean;
}

export function SolarCore({ isHovered, onHover, reducedMotion }: SolarCoreProps) {
  const [localHover, setLocalHover] = useState(false);
  const active = isHovered || localHover;

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => { setLocalHover(true); onHover(true); }}
      onMouseLeave={() => { setLocalHover(false); onHover(false); }}
      style={{ width: 340, height: 340 }}
    >
      {/* Outermost volumetric glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: active ? 400 : 360,
          height: active ? 400 : 360,
          background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, rgba(255,140,0,0.04) 40%, transparent 70%)",
          filter: `blur(${active ? 40 : 30}px)`,
        }}
      />

      {/* Orbit rings */}
      {!reducedMotion && [180, 220, 260, 300].map((size, i) => (
        <div
          key={`orbit-${i}`}
          className="absolute rounded-full border pointer-events-none"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(255,140,0,${active ? 0.15 + i * 0.03 : 0.06 + i * 0.02})`,
            borderWidth: 1,
            animation: reducedMotion ? "none" : `spin ${30 + i * 15}s linear infinite${i % 2 === 0 ? " reverse" : ""}`,
            transition: "border-color 0.5s ease",
          }}
        >
          {/* Tiny orbiting dot on each ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              top: -1.5,
              left: "50%",
              marginLeft: -1.5,
              backgroundColor: `rgba(255,140,0,${active ? 0.6 : 0.3})`,
              boxShadow: `0 0 6px rgba(255,140,0,${active ? 0.5 : 0.2})`,
            }}
          />
        </div>
      ))}

      {/* Solar flare rays */}
      {!reducedMotion && Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`flare-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: 2,
            height: active ? 90 : 60,
            background: `linear-gradient(to top, rgba(255,140,0,${active ? 0.25 : 0.1}), transparent)`,
            transform: `rotate(${i * 45}deg)`,
            transformOrigin: "bottom center",
            left: "calc(50% - 1px)",
            bottom: "50%",
            transition: "height 0.6s ease, background 0.6s ease",
            animation: `flare-pulse ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Energy wave pulses */}
      {!reducedMotion && [0, 1, 2].map((i) => (
        <div
          key={`wave-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 140,
            height: 140,
            border: `1px solid rgba(255,140,0,${active ? 0.2 : 0.08})`,
            animation: `energy-wave 4s ease-out infinite`,
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}

      {/* Main Sun body - outer glow ring */}
      <div
        className="absolute rounded-full transition-all duration-500"
        style={{
          width: active ? 160 : 148,
          height: active ? 160 : 148,
          background: "radial-gradient(circle, rgba(255,140,0,0.3) 0%, rgba(255,140,0,0.08) 60%, transparent 100%)",
          boxShadow: `0 0 ${active ? 60 : 35}px rgba(255,140,0,${active ? 0.35 : 0.2}), 0 0 ${active ? 120 : 70}px rgba(255,140,0,${active ? 0.15 : 0.08})`,
        }}
      />

      {/* Main Sun body - core */}
      <div
        className="relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 cursor-pointer"
        style={{
          width: active ? 140 : 130,
          height: active ? 140 : 130,
          background: "radial-gradient(circle at 40% 35%, rgba(255,180,60,0.3), rgba(255,140,0,0.15) 50%, rgba(200,80,0,0.08) 100%)",
          border: `1.5px solid rgba(255,140,0,${active ? 0.5 : 0.3})`,
          boxShadow: `inset 0 0 40px rgba(255,140,0,${active ? 0.2 : 0.1}), 0 0 ${active ? 30 : 15}px rgba(255,140,0,${active ? 0.3 : 0.15})`,
          animation: reducedMotion ? "none" : "sun-pulse 4s ease-in-out infinite",
        }}
      >
        {/* Inner surface texture gradient */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "conic-gradient(from 0deg, rgba(255,140,0,0.05), rgba(255,200,100,0.08), rgba(255,140,0,0.03), rgba(255,180,60,0.07), rgba(255,140,0,0.05))",
            animation: reducedMotion ? "none" : "spin 20s linear infinite",
          }}
        />

        {/* Core text */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-0 select-none">
          {["BUILD", "LEARN", "INNOVATE", "LEAD"].map((word) => (
            <span
              key={word}
              className="text-[11px] font-black tracking-[0.35em] leading-[1.8]"
              style={{
                color: `rgba(255,${word === "INNOVATE" ? "180" : "140"},0,${active ? 0.9 : 0.65})`,
                textShadow: `0 0 ${active ? 12 : 6}px rgba(255,140,0,${active ? 0.5 : 0.25})`,
                transition: "color 0.4s, text-shadow 0.4s",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes energy-wave {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes flare-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
