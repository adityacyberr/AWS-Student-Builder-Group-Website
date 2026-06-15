"use client";

import { useState, useEffect } from "react";

interface CosmicBackgroundProps {
  reducedMotion: boolean;
}

// Deterministic pseudo-random so server/client renders match (no hydration mismatch)
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function CosmicBackground({ reducedMotion }: CosmicBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stars] = useState(() =>
    Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: (seededRand(i * 3 + 0) * 100).toFixed(3),
      y: (seededRand(i * 3 + 1) * 100).toFixed(3),
      size: 0.5 + seededRand(i * 3 + 2) * 1.2,
      opacity: 0.06 + seededRand(i * 5) * 0.22,
      duration: 2.5 + seededRand(i * 7) * 7,
      delay: seededRand(i * 11) * 8,
    }))
  );

  const [particles] = useState(() =>
    Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: (seededRand(i * 13 + 5) * 100).toFixed(3),
      y: (seededRand(i * 13 + 7) * 100).toFixed(3),
      size: 1 + seededRand(i * 13 + 9) * 2.5,
      duration: 18 + seededRand(i * 13 + 11) * 20,
      delay: -(seededRand(i * 13 + 13) * 20),
      driftX: (seededRand(i * 13 + 15) - 0.5) * 60,
      driftY: -(30 + seededRand(i * 13 + 17) * 80),
      opacity: 0.06 + seededRand(i * 13 + 19) * 0.15,
    }))
  );

  if (!mounted) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 62% 38%, rgba(255,140,0,0.04) 0%, transparent 52%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 18% 75%, rgba(255,120,0,0.025) 0%, transparent 42%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 88% 15%, rgba(255,100,0,0.02) 0%, transparent 38%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep space background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 62% 38%, rgba(255,140,0,0.04) 0%, transparent 52%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 18% 75%, rgba(255,120,0,0.025) 0%, transparent 42%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 88% 15%, rgba(255,100,0,0.02) 0%, transparent 38%)",
        }}
      />

      {/* Stars — twinkling with varied speeds */}
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

      {/* Floating micro-particles — very subtle upward drift */}
      {!reducedMotion &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `rgba(255,140,0,${p.opacity})`,
              boxShadow: `0 0 ${p.size * 2}px rgba(255,140,0,${p.opacity * 0.8})`,
              animation: `particle-drift-${p.id} ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              willChange: "transform, opacity",
            }}
          />
        ))}

      {/* Large nebula glow — upper-left */}
      <div
        className="absolute -top-48 -left-48 w-[50rem] h-[50rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,140,0,0.035) 0%, transparent 68%)",
          animation: reducedMotion ? "none" : "nebula-pulse 12s ease-in-out infinite",
        }}
      />

      {/* Large nebula glow — lower-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[44rem] h-[44rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,100,0,0.028) 0%, transparent 68%)",
          animation: reducedMotion
            ? "none"
            : "nebula-pulse 14s ease-in-out infinite 5s",
        }}
      />

      {/* Particle drift keyframes (per-particle so each has unique trajectory) */}
      {!reducedMotion && (
        <style>{particles
          .map(
            (p) => `
          @keyframes particle-drift-${p.id} {
            0%   { transform: translate3d(0, 0, 0);
                   opacity: 0; }
            8%   { opacity: ${p.opacity}; }
            88%  { opacity: ${p.opacity}; }
            100% { transform: translate3d(${p.driftX}px, ${p.driftY}px, 0);
                   opacity: 0; }
          }`
          )
          .join("\n")}</style>
      )}

      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--star-lo, 0.08); transform: scale(1); }
          50%       { opacity: var(--star-hi, 0.5);  transform: scale(1.3); }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
