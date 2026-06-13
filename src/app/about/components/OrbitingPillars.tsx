"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Terminal, Award, Sparkles, Users, ArrowRight } from "lucide-react";

interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  initiatives: string[];
}

const PILLARS: Pillar[] = [
  {
    id: "learning",
    title: "Learning",
    subtitle: "Theoretical Mastery",
    description: "Bridging academic computer science guidelines with cutting-edge industry practices. We focus on masterclasses, structured certification preparational meetups, and open-source documentation.",
    icon: BookOpen,
    color: "#FF8C00", // Solar Orange
    initiatives: ["AWS Cloud Practitioner Prep", "SysOps & Architect Tracks", "Expert Guest Seminars"],
  },
  {
    id: "building",
    title: "Building",
    subtitle: "Hands-on Engineering",
    description: "Constructing production-ready cloud assets. We practice setting up AWS S3 static buckets, serverless Lambda microservices, secured API gateways, and custom database backends.",
    icon: Terminal,
    color: "#FFA500", // Bright Gold
    initiatives: ["Serverless Architectures", "Console Deployments", "API & Database Pipelines"],
  },
  {
    id: "leadership",
    title: "Leadership",
    subtitle: "Empowering Mentors",
    description: "Cultivating organizational talent. We train student builders to manage tech communities, lead peer-coding sessions, orchestrate hackathons, and handle corporate collaborations.",
    icon: Award,
    color: "#FF4500", // Orange Red
    initiatives: ["Peer Mentorship Circles", "Chapter Core Training", "Event Architecture Projects"],
  },
  {
    id: "innovation",
    title: "Innovation",
    subtitle: "Generative Horizons",
    description: "Exploring next-gen technologies. We leverage Amazon Bedrock, Bedrock API tokens, and PartyRock workspaces to design and test custom Generative AI agents and data models.",
    icon: Sparkles,
    color: "#FFB90F", // Goldenrod
    initiatives: ["Generative AI Prototyping", "Bedrock Playground Labs", "ML Infrastructure Trials"],
  },
  {
    id: "community",
    title: "Community",
    subtitle: "Connected Growth",
    description: "Building an open, warm, and highly collaborative ecosystem. We align diverse students, foster inclusive study groups, and connect with regional AWS builder branches.",
    icon: Users,
    color: "#FF7F24", // Honeydew Orange
    initiatives: ["Monthly Cloud Syncs", "Collaborative Study Circles", "Regional Chapter Syncs"],
  },
];

export function OrbitingPillars({ reducedMotion }: { reducedMotion: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Slow automatic rotation offset for the orbits when not hovered
  useEffect(() => {
    if (reducedMotion || isHovered) return;
    const interval = setInterval(() => {
      setRotationOffset((prev) => (prev + 0.15) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [reducedMotion, isHovered]);

  const activePillar = PILLARS[selectedIndex];
  const ActiveIcon = activePillar.icon;

  return (
    <section className="relative py-16 md:py-24 z-10 border-t border-slate-900/60">
      {/* Title */}
      <div className="max-w-4xl mx-auto mb-16 text-center md:text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4">
          {"// INTERACTIVE ECOSYSTEM"}
        </span>
        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Everything Revolves Around the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
            Core.
          </span>
        </h3>
        <p className="text-slate-400 text-sm mt-3 max-w-xl">
          Select or hover over any of the orbiting nodes to inspect how our fundamental values 
          draw energy from our shared builder mission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[500px]">
        {/* Orbital System (lg:col-span-7) */}
        <div 
          className="lg:col-span-7 flex items-center justify-center relative select-none overflow-visible h-[340px] sm:h-[450px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Dashboard Blueprint Radar Backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-orange-500/[0.04] relative animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full border border-orange-500/[0.06] absolute" />
            <div className="w-[100px] h-[100px] sm:w-[160px] sm:h-[160px] rounded-full border border-orange-500/[0.08] absolute" />
            {/* Crosshair lines */}
            <div className="absolute w-[320px] sm:w-[420px] h-px bg-orange-500/[0.03]" />
            <div className="absolute h-[320px] sm:h-[420px] w-px bg-orange-500/[0.03]" />
          </div>

          {/* Central Sun (Solar Core) */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Glowing Aura */}
            <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 blur-2xl opacity-40 animate-pulse" />
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center border border-orange-400/30 cursor-pointer transition-all duration-500"
              style={{
                boxShadow: "0 0 40px rgba(255,140,0,0.4), inset 0 0 15px rgba(255,255,255,0.2)",
              }}
            >
              <span className="text-white text-xs font-black tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                AWS
              </span>
            </div>
            <span className="absolute -bottom-8 text-[9px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/10 whitespace-nowrap">
              SOLAR CORE
            </span>
          </div>

          {/* Orbiting Planet Nodes */}
          {PILLARS.map((pillar, idx) => {
            const angleDeg = (idx * (360 / PILLARS.length) + rotationOffset) % 360;
            const angleRad = (angleDeg * Math.PI) / 180;
            
            // Adjust radius for desktop vs mobile
            const radius = typeof window !== "undefined" && window.innerWidth < 640 ? 110 : 155;
            
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);
            const isSelected = selectedIndex === idx;
            const PillarIcon = pillar.icon;

            return (
              <div
                key={pillar.id}
                className="absolute z-20 transition-transform duration-300 ease-out"
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0)`,
                }}
              >
                {/* Visual Connector Line to Center */}
                <div 
                  className="absolute origin-left h-px top-1/2 left-1/2 -translate-y-1/2 -z-10 bg-gradient-to-r from-transparent to-orange-500/20"
                  style={{
                    width: radius,
                    transform: `rotate(${angleDeg + 180}deg) translateX(${-radius}px)`,
                  }}
                />

                {/* Node Button */}
                <button
                  onClick={() => setSelectedIndex(idx)}
                  className={`group relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isSelected 
                      ? "bg-slate-900 border-orange-500 shadow-[0_0_20px_rgba(255,140,0,0.3)] text-orange-400 scale-110" 
                      : "bg-slate-950/90 border-slate-800 text-slate-400 hover:border-orange-500/50 hover:text-white"
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 20px rgba(255, 140, 0, 0.25)` : "none",
                  }}
                  aria-label={`Inspect ${pillar.title} pillar`}
                >
                  <PillarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  
                  {/* Floating Pillar Name */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {pillar.title}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Planet Inspector Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl border border-slate-800/80 bg-[#070b19]/60 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Scanlinesweep */}
              {!reducedMotion && (
                <div 
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none z-0"
                  style={{
                    animation: "inspector-sweep 1.2s ease-out forwards",
                  }}
                />
              )}

              {/* Glowing Corner Accents */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/[0.02] rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400"
                    style={{ textShadow: "0 0 10px rgba(255,140,0,0.5)" }}
                  >
                    <ActiveIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block">
                      {activePillar.subtitle}
                    </span>
                    <h4 className="text-2xl font-black text-white tracking-tight">
                      {activePillar.title}
                    </h4>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed">
                  {activePillar.description}
                </p>

                {/* Sub-items (Initiatives) */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">
                    Focus Initiatives
                  </span>
                  <div className="space-y-2">
                    {activePillar.initiatives.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/40 border border-slate-800/50 p-2.5 rounded-lg hover:border-orange-500/20 hover:bg-slate-900/60 transition-all duration-300"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        @keyframes inspector-sweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
