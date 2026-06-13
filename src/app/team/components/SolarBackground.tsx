"use client";

import { useState } from "react";

interface SolarBackgroundProps {
  reducedMotion: boolean;
}

export function SolarBackground({ reducedMotion }: SolarBackgroundProps) {
  // Pre-generate stable positions for stars and particles
  const [stars] = useState(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: (i * 17 + 7) % 100,
      y: (i * 23 + 13) % 100,
      size: (i % 3) * 0.5 + 0.5,
      opacity: 0.1 + (i % 5) * 0.08,
      duration: 3 + (i % 7),
      delay: (i % 10) * 0.5,
    }))
  );

  const [particles] = useState(() =>
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: (i * 19 + 11) % 100,
      y: (i * 29 + 3) % 100,
      size: 1.5 + (i % 3),
      duration: 12 + (i % 8) * 2,
      delay: -(i * 2.5),
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep navy background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(255,140,0,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Secondary radial glow - lower area */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 30% 70%, rgba(255,140,0,0.025) 0%, transparent 50%)",
        }}
      />

      {/* Blueprint grid pattern (inherited from bg-grid-pattern) */}

      {/* Tiny stars */}
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
              : `star-twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      {!reducedMotion &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-orange-500/15 blur-[0.5px]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animation: `solar-float ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              willChange: "transform",
              transform: "translate3d(0,0,0)",
            }}
          />
        ))}

      {/* Very faint radar circles at center-right */}
      {!reducedMotion && (
        <div className="absolute top-1/3 right-1/4 opacity-30">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-orange-500/[0.06]"
              style={{
                width: 200 + i * 100,
                height: 200 + i * 100,
                top: -(100 + i * 50),
                left: -(100 + i * 50),
                animation: `radar-pulse 6s ease-out infinite`,
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Faint wireframe globe - top right */}
      {!reducedMotion && (
        <div
          className="absolute top-[15%] right-[8%] opacity-[0.03]"
          style={{
            width: 200,
            height: 200,
            border: "1px solid rgba(255,140,0,0.3)",
            borderRadius: "50%",
            animation: "globe-rotate 30s linear infinite",
          }}
        >
          {/* Latitude lines */}
          {[0.3, 0.5, 0.7].map((pos, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-orange-500/30"
              style={{ top: `${pos * 100}%` }}
            />
          ))}
          {/* Vertical meridian */}
          <div
            className="absolute top-0 bottom-0 left-1/2 border-l border-orange-500/30"
            style={{ transform: "translateX(-50%)" }}
          />
        </div>
      )}

      {/* Large radial orange glow - upper left */}
      <div
        className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full animate-pulse-slow"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Large radial glow - lower right */}
      <div
        className="absolute -bottom-32 -right-32 w-[35rem] h-[35rem] rounded-full animate-pulse-slow"
        style={{
          background: "radial-gradient(circle, rgba(255,140,0,0.03) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      <style jsx>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
        @keyframes solar-float {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate3d(20px, -100px, 0); opacity: 0; }
        }
        @keyframes radar-pulse {
          0% { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes globe-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
