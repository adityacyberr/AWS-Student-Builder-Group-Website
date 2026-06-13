"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SolarCTA({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Giant partial sun on the right */}
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle at 30% 50%, rgba(255,140,0,0.1) 0%, rgba(255,140,0,0.03) 40%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />

      {/* Orbit rings decoration */}
      {!reducedMotion && [200, 300, 400].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-orange-500/[0.04] pointer-events-none"
          style={{
            width: size,
            height: size,
            right: -size / 2 + 50,
            top: "50%",
            marginTop: -size / 2,
            animation: `cta-orbit ${25 + i * 10}s linear infinite`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-6">
          {"// JOIN OUR UNIVERSE"}
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          Want to Build<br />
          the Future{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
            with Us?
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
          Join a constellation of passionate builders who are learning, creating, and leading cloud innovation together.
        </p>

        <Link
          href="/contact"
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          style={{
            background: "linear-gradient(135deg, rgba(255,140,0,0.15), rgba(255,140,0,0.08))",
            border: "1px solid rgba(255,140,0,0.35)",
            boxShadow: "0 0 20px rgba(255,140,0,0.1), inset 0 0 20px rgba(255,140,0,0.05)",
          }}
        >
          {/* Light sweep animation */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
              animation: reducedMotion ? "none" : "light-sweep 4s ease-in-out infinite",
            }}
          />

          <span className="relative z-10 text-orange-400 group-hover:text-white transition-colors">
            Join The Builders
          </span>
          <ArrowRight className="relative z-10 h-4 w-4 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Bottom stats bar */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-slate-800/40">
        {[
          { value: "1", label: "Mission", sub: "Building a Better Tomorrow", icon: "🚀" },
          { value: "∞", label: "Possibilities", sub: "Limitless Impact Ahead", icon: "♾️" },
          { value: "100%", label: "Passion", sub: "Driven by Purpose", icon: "🔥" },
          { value: "1", label: "Community", sub: "Stronger Together", icon: "🌐" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-start gap-3 group cursor-default">
            <span className="text-lg">{stat.icon}</span>
            <div>
              <span className="text-xl font-black text-orange-400 block leading-tight">{stat.value}</span>
              <span className="text-xs font-bold text-white block">{stat.label}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes cta-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes light-sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
