"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/app/team/hooks/useReducedMotion";
import { SolarBackground } from "@/app/team/components/SolarBackground";
import { SolarManifesto } from "./components/SolarManifesto";
import { OrbitingPillars } from "./components/OrbitingPillars";
import { AcademicIntegration } from "./components/AcademicIntegration";
import { SolarCTA } from "@/app/team/components/SolarCTA";

export default function AboutPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-hidden text-slate-300">
      {/* Permanent visual background */}
      <SolarBackground reducedMotion={reducedMotion} />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-20">
        
        {/* About Header Accent Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/10 px-3 py-1 rounded-full inline-block">
            {"// MOMENTS OF INCEPTION"}
          </span>
        </motion.div>

        {/* 1. Brand Manifesto (Story Section) */}
        <SolarManifesto reducedMotion={reducedMotion} />

        {/* 2. Interactive Orbiting Pillars (Solar Core Pillars Dashboard) */}
        <OrbitingPillars reducedMotion={reducedMotion} />

        {/* 3. Academic Integration (CSE Sponsor & Curriculum) */}
        <AcademicIntegration reducedMotion={reducedMotion} />

        {/* 4. Joining the Universe CTA Section */}
        <SolarCTA reducedMotion={reducedMotion} />

      </div>
    </div>
  );
}
