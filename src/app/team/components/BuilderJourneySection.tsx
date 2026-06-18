"use client";

import React, { useState } from "react";

interface Stage {
  id: string;
  num: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function BuilderJourneySection({ reducedMotion }: { reducedMotion: boolean }) {
  const stages: Stage[] = [
    {
      id: "discover",
      num: "01",
      title: "Discover AWS",
      description: "Explore the world of cloud computing and discover endless possibilities.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          {/* Cloud path */}
          <path
            d="M11 26C7.686 26 5 23.314 5 20C5 16.997 7.203 14.51 10.156 14.069C10.053 13.72 10 13.353 10 12.972C10 9.122 13.12 6 17 6C20.263 6 23.016 8.238 23.802 11.25C24.631 10.455 25.759 10 27 10C29.761 10 32 12.239 32 15C32 15.292 31.975 15.578 30.927 15.855C33.829 16.424 36 18.958 36 22C36 25.866 32.866 29 29 29H13C11.895 29 11 28.105 11 27V26Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* "aws" text inside the cloud */}
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            fill="currentColor"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.02em"
          >
            aws
          </text>
          {/* AWS Arrow signature smile */}
          <path
            d="M13 22.5C15.5 24.5 20.5 24.5 23 22.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "build",
      num: "02",
      title: "Build Projects",
      description: "Apply knowledge, build real-world projects, and turn ideas into impact.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          {/* Crossed Wrench and Code </> */}
          <path
            d="M26 12C27.7 10.3 27.7 7.7 26 6C24.3 4.3 21.7 4.3 20 6L9 17C8.2 17.8 7.7 18.8 7.5 19.9L7 23.4L10.5 22.9C11.6 22.7 12.6 22.2 13.4 21.4L24.5 10.3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 6L24 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* </> symbol in bottom-right area */}
          <path
            d="M23 29L20 32L23 35"
            stroke="currentColor"
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 29L32 32L29 35"
            stroke="currentColor"
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 27L25 37"
            stroke="currentColor"
            strokeWidth="2.0"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "collaborate",
      num: "03",
      title: "Collaborate",
      description: "Work together, share knowledge, and create stronger solutions.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          {/* Center Leader Person */}
          <circle cx="20" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M11 26.5V25C11 21.5 14.5 19 20 19C25.5 19 29 21.5 29 25V26.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Left Person */}
          <circle cx="11" cy="16" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M5 28.5V27.5C5 24.5 7.5 22.5 11 22.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right Person */}
          <circle cx="29" cy="16" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M29 22.5C32.5 22.5 35 24.5 35 27.5V28.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "lead",
      num: "04",
      title: "Lead the Community",
      description: "Lead initiatives, mentor others, and shape the future of our community.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          {/* Sleek Tilted Rocket */}
          <path
            d="M32.5 7.5C26.5 11.5 20.5 17.5 19 21L15 25L20 30L24 26C27.5 24.5 34.5 17.5 38.5 11.5C38.5 11.5 39.5 8.5 32.5 7.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left fin */}
          <path
            d="M19 15L16 18L10 16L14 11L19 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right fin */}
          <path
            d="M25 21L22 24L16 28L11 32L15 35L20 30L25 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Flames */}
          <path
            d="M10 30L6 34L11 33L10 30Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
          />
          {/* Thrust path */}
          <path
            d="M15 25L9 31"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-16 md:py-20 overflow-visible z-10">
      {/* Background glow patches to anchor the section */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[35rem] rounded-full pointer-events-none opacity-[0.035] bg-[radial-gradient(circle,rgba(255,140,0,0.45)_0%,transparent_70%)] blur-[40px] z-0" />

      {/* Pill Badge */}
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3.5 py-1.5 rounded-full inline-block mb-3 relative z-10">
        {"// OUR JOURNEY"}
      </span>

      {/* Title Header */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3 relative z-10">
        Our Builder{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
          Journey
        </span>
      </h2>
      <p className="text-slate-400 text-sm sm:text-base max-w-2xl mb-10 relative z-10 leading-relaxed">
        From discovering the cloud to leading the future, we grow, build, and empower together.
      </p>

      {/* Timeline Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 lg:gap-8 relative z-10 overflow-visible mt-10">
        {stages.map((stage, idx) => (
          <JourneyCard
            key={stage.id}
            stage={stage}
            idx={idx}
            isLast={idx === stages.length - 1}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes orbit-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spark-out-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-14px, -14px) scale(0); opacity: 0; }
        }
        @keyframes spark-out-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(14px, 14px) scale(0); opacity: 0; }
        }
        @keyframes line-sweep {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes line-sweep-vertical {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { top: 100%; opacity: 0; }
        }

        .orbit-inner {
          animation: orbit-spin-cw 24s linear infinite;
        }
        .orbit-outer {
          animation: orbit-spin-ccw 32s linear infinite;
        }
        .animate-spark-1 {
          animation: spark-out-1 1.2s ease-out infinite;
        }
        .animate-spark-2 {
          animation: spark-out-2 1.2s ease-out infinite;
          animation-delay: 0.6s;
        }
      `}</style>
    </section>
  );
}

interface JourneyCardProps {
  stage: Stage;
  idx: number;
  isLast: boolean;
  reducedMotion: boolean;
}

function JourneyCard({ stage, idx, isLast, reducedMotion }: JourneyCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-start h-full w-full overflow-visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ─── CONNECTOR LINES (Desktop, Tablet & Mobile) ─── */}
      {/* Positioned exactly through the vertical center of the orbit circles (y = 64px from wrapper top) */}
      {!isLast && (
        <>
          {/* Horizontal Connector (Desktop: LG screens) */}
          <div
            className="absolute left-[50%] right-[-50%] top-[64px] h-[2px] z-0 hidden lg:block"
            style={{
              background: `repeating-linear-gradient(to right, transparent, transparent 4px, ${
                hovered ? "rgba(255,140,0,0.5)" : "rgba(255,140,0,0.25)"
              } 4px, ${hovered ? "rgba(255,140,0,0.5)" : "rgba(255,140,0,0.25)"} 8px)`,
              transition: "background 0.4s ease",
            }}
          >
            {/* Traveling Energy Beam */}
            {!reducedMotion && (
              <div
                className="absolute top-1/2 left-0 w-12 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent -translate-y-1/2 blur-[1.5px]"
                style={{
                  animation: "line-sweep 3.5s linear infinite",
                  animationDelay: `${idx * 0.85}s`,
                }}
              />
            )}

            {/* Glowing energy checkpoint node exactly in the middle of connector */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            >
              {/* Pulse glow background ring */}
              {!reducedMotion && (
                <div
                  className="absolute w-6 h-6 rounded-full border border-orange-500/40 animate-ping pointer-events-none"
                  style={{
                    animationDuration: hovered ? "1.0s" : "2.6s",
                  }}
                />
              )}
              {/* Radiating micro-particles */}
              {hovered && !reducedMotion && (
                <div className="absolute inset-0 pointer-events-none w-6 h-6 flex items-center justify-center">
                  <div className="absolute w-1 h-1 rounded-full bg-orange-400 animate-spark-1" />
                  <div className="absolute w-1 h-1 rounded-full bg-orange-400 animate-spark-2" />
                </div>
              )}
              {/* Core checkpoint dot */}
              <div
                className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300 transition-all duration-400"
                style={{
                  boxShadow: hovered
                    ? "0 0 14px #ff8c00, 0 0 28px #ff8c00"
                    : "0 0 8px rgba(255, 140, 0, 0.8), 0 0 16px rgba(255, 140, 0, 0.4)",
                  transform: hovered ? "scale(1.25)" : "scale(1.0)",
                }}
              />
            </div>
          </div>

          {/* Horizontal Connector (Tablet: MD screens, connects 01->02 and 03->04) */}
          {idx % 2 === 0 && (
            <div
              className="absolute left-[50%] right-[-50%] top-[64px] h-[2px] z-0 hidden md:block lg:hidden"
              style={{
                background: `repeating-linear-gradient(to right, transparent, transparent 4px, ${
                  hovered ? "rgba(255,140,0,0.45)" : "rgba(255,140,0,0.22)"
                } 4px, ${hovered ? "rgba(255,140,0,0.45)" : "rgba(255,140,0,0.22)"} 8px)`,
                transition: "background 0.4s ease",
              }}
            >
              {!reducedMotion && (
                <div
                  className="absolute top-1/2 left-0 w-10 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent -translate-y-1/2 blur-[1.5px]"
                  style={{
                    animation: "line-sweep 3.5s linear infinite",
                  }}
                />
              )}
              {/* Glowing checkpoint node */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                {!reducedMotion && (
                  <div className="absolute w-5 h-5 rounded-full border border-orange-500/30 animate-ping pointer-events-none" />
                )}
                <div
                  className="w-2 h-2 rounded-full bg-orange-500 border border-orange-300 transition-all duration-400"
                  style={{
                    boxShadow: hovered ? "0 0 12px #ff8c00" : "0 0 6px rgba(255, 140, 0, 0.7)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Vertical Connector (Mobile: SM screens, spans exactly between circles) */}
          <div
            className="absolute top-[64px] left-1/2 w-[2px] z-0 block md:hidden"
            style={{
              height: "calc(100% + 96px)", // stretches to the center of the next circle (96px = mobile grid gap)
              background: `repeating-linear-gradient(to bottom, transparent, transparent 4px, ${
                hovered ? "rgba(255,140,0,0.5)" : "rgba(255,140,0,0.25)"
              } 4px, ${hovered ? "rgba(255,140,0,0.5)" : "rgba(255,140,0,0.25)"} 8px)`,
              transition: "background 0.4s ease",
            }}
          >
            {/* Traveling Vertical energy pulse */}
            {!reducedMotion && (
              <div
                className="absolute left-1/2 top-0 w-[2px] h-12 bg-gradient-to-b from-transparent via-orange-400 to-transparent -translate-x-1/2 blur-[1.5px]"
                style={{
                  animation: "line-sweep-vertical 3.5s linear infinite",
                  animationDelay: `${idx * 0.85}s`,
                }}
              />
            )}

            {/* Glowing energy checkpoint node exactly in the middle */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            >
              {!reducedMotion && (
                <div
                  className="absolute w-6 h-6 rounded-full border border-orange-500/40 animate-ping pointer-events-none"
                  style={{
                    animationDuration: hovered ? "1.0s" : "2.6s",
                  }}
                />
              )}
              <div
                className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300 transition-all duration-400"
                style={{
                  boxShadow: hovered
                    ? "0 0 14px #ff8c00, 0 0 28px #ff8c00"
                    : "0 0 8px rgba(255, 140, 0, 0.8), 0 0 16px rgba(255, 140, 0, 0.4)",
                  transform: hovered ? "scale(1.25)" : "scale(1.0)",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ─── GLOWING ORBIT CIRCLE (Top centered circle, sibling of the card container) ─── */}
      <div
        className="relative w-32 h-32 flex items-center justify-center z-20 pointer-events-none transition-transform duration-500"
        style={{
          transform: hovered ? "translateY(-10px)" : "translateY(0)",
        }}
      >
        {/* Inner Soft Orange Glow */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-500"
          style={{
            width: 90,
            height: 90,
            background: "radial-gradient(circle, rgba(255,140,0,0.2) 0%, transparent 70%)",
            opacity: hovered ? 1.0 : 0.55,
            transform: hovered ? "scale(1.25)" : "scale(1.0)",
          }}
        />

        {/* Ring 1: Inner Orbit ring (Rotates Clockwise, defined 25% opacity) */}
        <div
          className="absolute rounded-full border transition-all duration-500 orbit-inner"
          style={{
            width: 98,
            height: 98,
            border: "1.5px solid rgba(255, 153, 0, 0.25)",
            boxShadow: "0 0 10px rgba(255, 140, 0, 0.15), inset 0 0 10px rgba(255, 140, 0, 0.08)",
            animationDuration: hovered ? "14s" : "24s",
          }}
        >
          {/* Dot on inner ring */}
          <div className="absolute top-[-3.5px] left-[50%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
        </div>

        {/* Ring 2: Outer Orbit ring (Rotates Counter-Clockwise, defined 15% opacity) */}
        <div
          className="absolute rounded-full border transition-all duration-500 orbit-outer"
          style={{
            width: 120,
            height: 120,
            border: "1.5px solid rgba(255, 153, 0, 0.15)",
            boxShadow: "0 0 12px rgba(255, 140, 0, 0.12), inset 0 0 12px rgba(255, 140, 0, 0.05)",
            animationDuration: hovered ? "20s" : "32s",
          }}
        >
          {/* Dot on outer ring */}
          <div className="absolute bottom-[-3px] left-[30%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
        </div>

        {/* Tiny Floating Particles orbiting around */}
        {!reducedMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full bg-orange-500/35 animate-pulse transition-all duration-500"
                style={{
                  width: 2.5,
                  height: 2.5,
                  left: `${25 + i * 18}%`,
                  top: `${20 + (i * 25) % 60}%`,
                  opacity: hovered ? 0.95 : 0.45,
                }}
              />
            ))}
          </div>
        )}

        {/* Numbered Badge (Attached exactly to top-left edge of outer orbit circle at 135 deg) */}
        <div
          className="absolute top-[22px] left-[22px] -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border border-orange-500/60 text-[10px] font-black text-orange-400 flex items-center justify-center z-25 shadow-[0_0_8px_rgba(255,140,0,0.3)] transition-all duration-500"
          style={{
            borderColor: hovered ? "rgba(255,140,0,1)" : "rgba(255,140,0,0.6)",
            boxShadow: hovered ? "0 0 12px rgba(255,140,0,0.6)" : "0 0 6px rgba(255,140,0,0.2)",
          }}
        >
          {stage.num}
        </div>

        {/* Core Icon Container */}
        <div
          className="relative w-[78px] h-[78px] rounded-full bg-slate-900/90 border border-orange-500/30 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(255,140,0,0.06)] transition-all duration-500"
          style={{
            borderColor: hovered ? "rgba(255,140,0,0.8)" : "rgba(255,140,0,0.35)",
            boxShadow: hovered
              ? "0 0 24px rgba(255,140,0,0.4), inset 0 0 12px rgba(255,140,0,0.2)"
              : "0 0 12px rgba(255,140,0,0.06)",
          }}
        >
          <div
            className="transition-all duration-500"
            style={{
              color: hovered ? "rgba(255,160,20,1)" : "rgba(255,140,0,0.85)",
              transform: hovered ? "scale(1.08)" : "scale(1.0)",
              filter: hovered ? "drop-shadow(0 0 8px rgba(255,140,0,0.5))" : "none",
            }}
          >
            {stage.icon}
          </div>
        </div>
      </div>

      {/* ─── INFORMATION CARD (Sibling of the circle container) ─── */}
      {/* Centered dynamically and shifts up by 51.2px (marginTop: -51px) to overlap orbit circle by exactly 40% */}
      <div
        className="w-full relative pt-20 pb-8 px-6 bg-[#0a0f1e]/85 backdrop-blur-md rounded-[24px] border flex flex-col items-center justify-start text-center cursor-default transition-all duration-500 overflow-visible flex-1 min-h-[220px] z-10"
        style={{
          transform: hovered ? "translateY(-10px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 0 0 1.5px rgba(255,140,0,0.28), 0 20px 40px rgba(0,0,0,0.6), 0 0 35px rgba(255,140,0,0.12)"
            : "0 0 0 1px rgba(255,140,0,0.06), 0 8px 30px rgba(0,0,0,0.35)",
          borderColor: hovered ? "rgba(255,140,0,0.35)" : "rgba(255,140,0,0.15)",
          marginTop: "-51px", // exact 40% vertical overlap of 128px high circle
        }}
      >
        {/* Subtle orange aura top-highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none" />

        {/* Content Box with aligned start position */}
        <div className="flex flex-col items-center flex-1 justify-start w-full mt-4">
          {/* Card Title */}
          <h3
            className="text-lg sm:text-xl font-bold text-white mb-3 transition-colors duration-400 select-text"
            style={{
              textShadow: hovered ? "0 0 15px rgba(255,140,0,0.25)" : "none",
            }}
          >
            {stage.title}
          </h3>

          {/* Card Description */}
          <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] select-text">
            {stage.description}
          </p>
        </div>

        {/* Divider and Pulse Dot at Bottom (Always aligned perfectly) */}
        <div className="relative w-16 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent mt-6 mx-auto">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00] transition-all duration-400"
            style={{
              transform: hovered
                ? "translate-x(-50%) translate-y(-50%) scale(1.4)"
                : "translate-x(-50%) translate-y(-50%) scale(1.0)",
              boxShadow: hovered ? "0 0 12px #ff8c00" : "0 0 8px #ff8c00",
            }}
          />
        </div>
      </div>
    </div>
  );
}
