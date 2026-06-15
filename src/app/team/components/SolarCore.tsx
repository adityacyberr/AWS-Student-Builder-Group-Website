"use client";

import { useState } from "react";

interface SolarCoreProps {
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  reducedMotion: boolean;
  visible?: boolean;
}

export function SolarCore({ isHovered, onHover, reducedMotion, visible = true }: SolarCoreProps) {
  const [localHover, setLocalHover] = useState(false);
  const active = isHovered || localHover;

  return (
    <div
      className="relative flex items-center justify-center transition-all duration-1000"
      onMouseEnter={() => { setLocalHover(true); onHover(true); }}
      onMouseLeave={() => { setLocalHover(false); onHover(false); }}
      style={{
        width: 340,
        height: 340,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
        transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Layer 3: Large blurred halo */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: active ? 360 : 310,
          height: active ? 360 : 310,
          background: "radial-gradient(circle, rgba(255,140,0,0.18) 0%, rgba(255,60,0,0.03) 60%, transparent 100%)",
          filter: `blur(${active ? 36 : 28}px)`,
        }}
      />

      {/* Layer 2: Soft glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-500"
        style={{
          width: active ? 220 : 190,
          height: active ? 220 : 190,
          background: "radial-gradient(circle, rgba(255,140,0,0.38) 0%, rgba(255,100,0,0.1) 60%, transparent 100%)",
          filter: `blur(${active ? 16 : 10}px)`,
        }}
      />

      {/* Orbit rings (inner accent lines around core) */}
      {!reducedMotion && [180, 220, 260, 300].map((size, i) => (
        <div
          key={`orbit-${i}`}
          className="absolute rounded-full border pointer-events-none"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(255,140,0,${active ? 0.18 + i * 0.03 : 0.08 + i * 0.02})`,
            borderWidth: 1,
            animation: reducedMotion ? "none" : `spin ${25 + i * 12}s linear infinite${i % 2 === 0 ? " reverse" : ""}`,
            transition: "border-color 0.5s ease",
          }}
        >
          {/* Tiny orbiting dot on each ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 3.5,
              height: 3.5,
              top: -1.75,
              left: "50%",
              marginLeft: -1.75,
              backgroundColor: `rgba(255,140,0,${active ? 0.7 : 0.4})`,
              boxShadow: `0 0 6px rgba(255,140,0,${active ? 0.6 : 0.3})`,
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
            width: 2.5,
            height: active ? 95 : 65,
            background: `linear-gradient(to top, rgba(255,140,0,${active ? 0.28 : 0.12}), transparent)`,
            transform: `rotate(${i * 45}deg)`,
            transformOrigin: "bottom center",
            left: "calc(50% - 1.25px)",
            bottom: "50%",
            transition: "height 0.6s ease, background 0.6s ease",
            animation: `flare-pulse ${3.5 + i * 0.5}s ease-in-out infinite`,
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
            border: `1px solid rgba(255,140,0,${active ? 0.25 : 0.1})`,
            animation: `energy-wave 4s ease-out infinite`,
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}

      {/* Main Sun body - core (Layer 1) */}
      <div
        className="relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 cursor-pointer"
        style={{
          width: active ? 140 : 130,
          height: active ? 140 : 130,
          background: "radial-gradient(circle at 45% 35%, #ffffff 0%, #fff59d 15%, #ffb300 45%, #ff6f00 80%, #d84315 100%)",
          border: `1.5px solid rgba(255,183,77,${active ? 0.7 : 0.45})`,
          boxShadow: `inset 0 0 30px rgba(255,110,0,0.55), 0 0 ${active ? 45 : 20}px rgba(255,110,0,0.45)`,
          animation: reducedMotion ? "none" : "sun-pulse 5s ease-in-out infinite",
        }}
      >
        {/* Inner surface texture gradient */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "conic-gradient(from 0deg, rgba(255,140,0,0.06), rgba(255,224,130,0.1), rgba(255,140,0,0.04), rgba(255,200,80,0.09), rgba(255,140,0,0.06))",
            animation: reducedMotion ? "none" : "spin 25s linear infinite",
          }}
        />

        {/* Core text */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-0 select-none">
          {["BUILD", "LEARN", "INNOVATE", "LEAD"].map((word) => (
            <span
              key={word}
              className="text-[11px] font-black tracking-[0.35em] leading-[1.8]"
              style={{
                color: `rgba(255,${word === "INNOVATE" ? "200" : "160"},0,${active ? 0.95 : 0.75})`,
                textShadow: `0 0 ${active ? 15 : 8}px rgba(255,110,0,${active ? 0.6 : 0.35})`,
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
          0% { transform: scale(1); opacity: 0.65; }
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
