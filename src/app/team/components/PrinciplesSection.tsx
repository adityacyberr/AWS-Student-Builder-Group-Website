"use client";

import { Rocket, BookOpen, Crown } from "lucide-react";
import { useState } from "react";

const principles = [
  {
    word: "BUILD",
    icon: Rocket,
    description: "We build opportunities, projects, and the future together.",
  },
  {
    word: "LEARN",
    icon: BookOpen,
    description: "We learn, explore, and grow as cloud builders.",
  },
  {
    word: "LEAD",
    icon: Crown,
    description: "We lead with passion and empower the community.",
  },
];

export function PrinciplesSection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="relative py-16 md:py-24">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4">
        {"// OUR PRINCIPLES"}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {principles.map((p) => (
          <PrincipleCard key={p.word} principle={p} reducedMotion={reducedMotion} />
        ))}
      </div>
    </section>
  );
}

function PrincipleCard({
  principle,
  reducedMotion,
}: {
  principle: (typeof principles)[number];
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = principle.icon;

  return (
    <div
      className="group relative rounded-2xl border border-slate-800/70 bg-[#0a0f1e]/70 backdrop-blur-sm overflow-hidden transition-all duration-400 cursor-default"
      style={{
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? "0 0 0 1px rgba(255,140,0,0.15), 0 20px 50px rgba(0,0,0,0.4), 0 0 40px rgba(255,140,0,0.06)"
          : "0 0 0 1px rgba(255,140,0,0.04), 0 8px 24px rgba(0,0,0,0.2)",
        borderColor: hovered ? "rgba(255,140,0,0.25)" : undefined,
        transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Energy wave sweep */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: hovered
              ? "linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.06) 50%, transparent 100%)"
              : "none",
            animation: hovered ? "energy-sweep 1.5s ease-in-out" : "none",
          }}
        />
      )}

      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent pointer-events-none" />

      <div className="relative z-10 p-8 flex flex-col items-start gap-4">
        {/* Icon container */}
        <div
          className="p-4 rounded-xl transition-all duration-400"
          style={{
            background: hovered ? "rgba(255,140,0,0.12)" : "rgba(255,140,0,0.06)",
            boxShadow: hovered ? "0 0 20px rgba(255,140,0,0.15)" : "none",
            border: "1px solid",
            borderColor: hovered ? "rgba(255,140,0,0.3)" : "rgba(255,140,0,0.1)",
          }}
        >
          <Icon
            className="h-6 w-6 transition-all duration-400"
            style={{
              color: hovered ? "rgba(255,180,60,1)" : "rgba(255,140,0,0.7)",
              transform: hovered ? "rotate(5deg) scale(1.1)" : "rotate(0deg) scale(1)",
              filter: hovered ? "drop-shadow(0 0 6px rgba(255,140,0,0.4))" : "none",
              transition: "color 0.3s, transform 0.3s, filter 0.3s",
            }}
          />
        </div>

        {/* Word */}
        <h3
          className="text-2xl font-black tracking-tight transition-colors duration-300"
          style={{
            color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.9)",
            textShadow: hovered ? "0 0 20px rgba(255,140,0,0.2)" : "none",
          }}
        >
          {principle.word}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed">
          {principle.description}
        </p>
      </div>

      {/* Floating particles on hover */}
      {hovered && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-orange-500/20"
              style={{
                width: 3,
                height: 3,
                left: `${20 + i * 20}%`,
                bottom: 0,
                animation: `particle-rise ${1.5 + i * 0.3}s ease-out forwards`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes energy-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes particle-rise {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-80px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
