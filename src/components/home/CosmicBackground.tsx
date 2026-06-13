"use client";

import { useState } from "react";

interface CosmicBackgroundProps {
  reducedMotion: boolean;
}

export function CosmicBackground({ reducedMotion }: CosmicBackgroundProps) {
  const [stars] = useState(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: (i * 17 + 7) % 100,
      y: (i * 23 + 13) % 100,
      size: 0.5 + (i % 4) * 0.4,
      opacity: 0.08 + (i % 6) * 0.06,
      duration: 2.5 + (i % 8),
      delay: (i % 12) * 0.4,
    }))
  );

  const [particles] = useState(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: (i * 19 + 11) % 100,
      y: (i * 31 + 5) % 100,
      size: 1.5 + (i % 3),
      duration: 14 + (i % 8) * 3,
      delay: -(i * 2),
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep navy background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(255,140,0,0.035) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(255,140,0,0.02) 0%, transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 85% 20%, rgba(255,100,0,0.02) 0%, transparent 40%)",
        }}
      />

      {/* Stars */}
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
              : `cosmic-twinkle ${star.duration}s ease-in-out infinite`,
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
              animation: `cosmic-float ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              willChange: "transform",
              transform: "translate3d(0,0,0)",
            }}
          />
        ))}

      {/* Large nebula glow — upper left */}
      <div
        className="absolute -top-40 -left-40 w-[45rem] h-[45rem] rounded-full animate-pulse-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(255,140,0,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Large nebula glow — lower right */}
      <div
        className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] rounded-full animate-pulse-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(255,140,0,0.03) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      {/* Energy pulse rings from center */}
      {!reducedMotion && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-orange-500/[0.04]"
              style={{
                width: 300 + i * 150,
                height: 300 + i * 150,
                top: -(150 + i * 75),
                left: -(150 + i * 75),
                animation: `cosmic-pulse 8s ease-out infinite`,
                animationDelay: `${i * 2.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes cosmic-twinkle {
          0%,
          100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.45;
          }
        }
        @keyframes cosmic-float {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translate3d(25px, -120px, 0);
            opacity: 0;
          }
        }
        @keyframes cosmic-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
