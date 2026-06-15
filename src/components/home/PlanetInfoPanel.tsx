"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PlanetDef } from "./SolarSystemHero";

interface PlanetInfoPanelProps {
  planet: PlanetDef | null;
  onClose: () => void;
  reducedMotion: boolean;
}

export function PlanetInfoPanel({
  planet,
  onClose,
  reducedMotion,
}: PlanetInfoPanelProps) {
  if (!planet) return null;
  const Icon = planet.icon;

  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          key={planet.id}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 z-50 w-72 sm:w-80"
        >
          <div className="relative rounded-2xl border border-orange-500/20 bg-[#070b19]/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(255,140,0,0.08)] overflow-hidden">
            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

            {/* Scan line */}
            {!reducedMotion && (
              <div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none z-20"
                style={{ animation: "panel-sweep 1s ease-out forwards" }}
              />
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all z-30"
              aria-label="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest block">
                    {planet.tagline}
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {planet.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {planet.description}
              </p>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-1.5">
                {planet.stats.map((stat, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-semibold text-slate-300 bg-slate-900/60 border border-slate-800/50 px-2.5 py-1 rounded-md"
                  >
                    {stat}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={planet.href}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange-500/30 bg-orange-500/5 text-xs text-orange-400 font-bold uppercase tracking-wider hover:bg-orange-500/15 hover:text-white hover:border-orange-500/50 transition-all duration-300"
              >
                Explore
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <style jsx>{`
            @keyframes panel-sweep {
              0% {
                top: 0%;
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                top: 100%;
                opacity: 0;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
