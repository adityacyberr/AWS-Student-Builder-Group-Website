"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Info,
  Calendar,
  Users,
  Camera,
  Trophy,
  Mail,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

import { useReducedMotion } from "@/app/team/hooks/useReducedMotion";
import { CosmicBackground } from "./CosmicBackground";
import { SolarCoreSun } from "./SolarCoreSun";
import { OrbitPlanet, PlanetDef } from "./OrbitPlanet";
import { PlanetInfoPanel } from "./PlanetInfoPanel";
import { ScrollExplorer } from "./ScrollExplorer";

const PLANETS: PlanetDef[] = [
  {
    id: "about",
    name: "About",
    tagline: "Who We Are",
    description:
      "Discover the mission, vision, and core pillars driving our builder community forward.",
    stats: ["Solar Core", "5 Pillars", "Academic Hub"],
    href: "/about",
    icon: Info,
    orbitRadius: 180,
    orbitSpeed: 60,
    orbitDelay: 0,
  },
  {
    id: "events",
    name: "Events",
    tagline: "Upcoming Missions",
    description:
      "Workshops, bootcamps, hackathons, and meetups designed to level up your cloud skills.",
    stats: ["Workshops", "Bootcamps", "Hackathons"],
    href: "/events",
    icon: Calendar,
    orbitRadius: 220,
    orbitSpeed: 75,
    orbitDelay: -12,
  },
  {
    id: "team",
    name: "Team",
    tagline: "Meet The Builders",
    description:
      "A multidisciplinary leadership team powering cloud innovation at RIMT University.",
    stats: ["6 Builders", "Student Led", "Multi-Track"],
    href: "/team",
    icon: Users,
    orbitRadius: 260,
    orbitSpeed: 90,
    orbitDelay: -25,
  },
  {
    id: "gallery",
    name: "Gallery",
    tagline: "Captured Moments",
    description:
      "A visual archive of every event, workshop, and builder moment captured across our journey.",
    stats: ["Photos", "Events", "Memories"],
    href: "/gallery",
    icon: Camera,
    orbitRadius: 300,
    orbitSpeed: 105,
    orbitDelay: -40,
  },
  {
    id: "achievements",
    name: "Achievements",
    tagline: "Mission Logs",
    description:
      "Milestones, accomplishments, and the roadmap of our growing community impact.",
    stats: ["Milestones", "Roadmap", "Impact"],
    href: "/achievements",
    icon: Trophy,
    orbitRadius: 340,
    orbitSpeed: 120,
    orbitDelay: -55,
  },
  {
    id: "contact",
    name: "Contact",
    tagline: "Connect With Us",
    description:
      "Questions, collaborations, partnerships, or speaker invitations — we are always open.",
    stats: ["Email", "Social", "Partnerships"],
    href: "/contact",
    icon: Mail,
    orbitRadius: 380,
    orbitSpeed: 135,
    orbitDelay: -70,
  },
];

export function SolarSystemHero() {
  const reducedMotion = useReducedMotion();
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [sunHovered, setSunHovered] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDef | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(
      window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768
    );
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion || isMobile) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouseX(x);
      setMouseY(y);
    },
    [reducedMotion, isMobile]
  );

  const handlePlanetSelect = useCallback(
    (planet: PlanetDef) => {
      if (selectedPlanet?.id === planet.id) {
        // Second click → navigate (handled by PlanetInfoPanel link)
        return;
      }
      setSelectedPlanet(planet);
    },
    [selectedPlanet]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedPlanet(null);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      className="relative w-full h-screen min-h-[600px] max-h-[1200px] bg-[#050816] bg-grid-pattern overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Cosmic Background */}
      <CosmicBackground reducedMotion={reducedMotion} />

      {/* Main content grid */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
            {/* LEFT SIDE — Text & CTAs */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-4 xl:col-span-4 space-y-6 z-20 relative"
            >
              {/* Label */}
              <motion.span
                variants={itemVariants}
                className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block"
              >
                {"// BUILD • LEARN • LEAD"}
              </motion.span>

              {/* Heading */}
              <motion.h1
                variants={itemVariants}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]"
              >
                One Community.
                <br />
                Six Worlds.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
                  Infinite Possibilities.
                </span>
              </motion.h1>

              {/* Supporting text */}
              <motion.p
                variants={itemVariants}
                className="text-slate-400 text-sm leading-relaxed max-w-md"
              >
                Explore a universe of builders, events, memories, achievements,
                and opportunities designed to inspire the next generation of
                cloud innovators.
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-3 pt-2"
              >
                <a
                  href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,140,0,0.1))",
                    border: "1px solid rgba(255,140,0,0.4)",
                    boxShadow:
                      "0 0 20px rgba(255,140,0,0.12), inset 0 0 20px rgba(255,140,0,0.05)",
                  }}
                >
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
                      animation: reducedMotion
                        ? "none"
                        : "btn-sweep 4s ease-in-out infinite",
                    }}
                  />
                  <span className="relative z-10 text-orange-400 group-hover:text-white transition-colors">
                    Enter The Universe
                  </span>
                  <ArrowRight className="relative z-10 h-4 w-4 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>

                <Link
                  href="/events"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-400 border border-slate-800 bg-slate-950/60 backdrop-blur-sm hover:text-white hover:border-slate-700 transition-all duration-300"
                >
                  Watch Journey
                </Link>
              </motion.div>
            </motion.div>

            {/* CENTER-RIGHT — Solar System */}
            <div className="lg:col-span-8 xl:col-span-8 relative h-[500px] sm:h-[600px] lg:h-full flex items-center justify-center">
              {/* Solar system container with parallax */}
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `translate3d(${mouseX * -4}px, ${mouseY * -4}px, 0)`,
                  transition: "transform 0.4s ease-out",
                }}
              >
                {/* Solar Core */}
                <SolarCoreSun
                  reducedMotion={reducedMotion}
                  mouseX={mouseX}
                  mouseY={mouseY}
                  isHovered={sunHovered}
                  onHover={setSunHovered}
                />

                {/* Orbiting Planets */}
                {PLANETS.map((planet) => (
                  <OrbitPlanet
                    key={planet.id}
                    planet={planet}
                    reducedMotion={reducedMotion}
                    isDimmed={
                      selectedPlanet !== null &&
                      selectedPlanet.id !== planet.id
                    }
                    isSelected={selectedPlanet?.id === planet.id}
                    sunHovered={sunHovered}
                    onSelect={handlePlanetSelect}
                  />
                ))}
              </div>

              {/* Planet Info Panel */}
              <PlanetInfoPanel
                planet={selectedPlanet}
                onClose={handleClosePanel}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Explorer */}
      <ScrollExplorer />

      <style jsx>{`
        @keyframes btn-sweep {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}
