"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { TeamMember } from "@/data/team";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Configuration for orbits and members
interface OrbitConfig {
  id: number;
  radiusPct: number; // radius as percentage of container width
  speed: number; // animation duration in seconds
  direction: "cw" | "ccw";
}

const ORBIT_CONFIGS: Record<number, OrbitConfig> = {
  1: { id: 1, radiusPct: 17.5, speed: 20, direction: "cw" },    // Orbit 1: 18s-22s duration
  2: { id: 2, radiusPct: 26.25, speed: 30, direction: "ccw" },   // Orbit 2: 28s-35s duration
  3: { id: 3, radiusPct: 35.0, speed: 34, direction: "cw" },     // Orbit 3: 28s-35s duration
  4: { id: 4, radiusPct: 43.75, speed: 45, direction: "ccw" },  // Orbit 4: 40s-50s duration
};

// Robust slug mapper to identify members independently of UUID databases
const getMemberKey = (member: TeamMember) => {
  const nameLower = member.name.toLowerCase();
  const idLower = member.id.toLowerCase();
  if (nameLower.includes("pranav") || idLower.includes("pranav")) return "pranav";
  if (nameLower.includes("aditya") || idLower.includes("aditya")) return "aditya";
  if (nameLower.includes("rohan") || idLower.includes("rohan")) return "rohan";
  if (nameLower.includes("amisha") || idLower.includes("amisha")) return "amisha";
  if (nameLower.includes("rinku") || idLower.includes("rinku")) return "rinku";
  if (nameLower.includes("amber") || idLower.includes("amber")) return "amber";
  return idLower;
};

const MEMBER_ORBITS: Record<string, number> = {
  "pranav": 1,
  "aditya": 2,
  "rohan":  2,
  "amisha": 3,
  "rinku":  3,
  "amber":  4,
};

// Map each member to their starting orbit and mathematical angle based on global index
const getMemberOrbitAndAngle = (member: TeamMember, sortedMembers: TeamMember[]) => {
  const key = getMemberKey(member);
  const globalIdx = sortedMembers.findIndex((m) => getMemberKey(m) === key);
  
  if (globalIdx === -1) {
    return { orbitId: 1, angle: 0 };
  }

  // Spreads the 6 members evenly at 60 degree intervals (0, 60, 120, 180, 240, 300) on page load
  const angle = (globalIdx / sortedMembers.length) * 2 * Math.PI;
  const orbitId = MEMBER_ORBITS[key] || 1;

  return { orbitId, angle };
};

// Generate deterministic starting directions for the entry fly-in
const getFlyInStartCoords = (globalIdx: number) => {
  const angle = ((globalIdx * 73 + 37) % 360) * Math.PI / 180;
  return {
    x: Math.cos(angle) * 500,
    y: Math.sin(angle) * 500,
  };
};

export interface OrbitingPlanetsProps {
  members: TeamMember[];
  sunHovered: boolean;
  selectedId: string | null;
  onSelect: (member: TeamMember) => void;
  reducedMotion: boolean;
  scaleFactor: number;
  mousePos: { x: number; y: number };
  parallaxOrbits: { x: number; y: number };
  parallaxAvatars: { x: number; y: number };
  loadStage: number;
}

export function OrbitingPlanets({
  members,
  sunHovered,
  selectedId,
  onSelect,
  reducedMotion,
  scaleFactor,
  mousePos,
  parallaxOrbits,
  parallaxAvatars,
  loadStage,
}: OrbitingPlanetsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  // requestAnimationFrame continuous angles state
  const [angles, setAngles] = useState([0, 0, 0, 0]);
  const anglesRef = useRef([0, 0, 0, 0]);

  // Monitor sizing changes dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    
    setContainerWidth(containerRef.current.offsetWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const centerX = containerWidth / 2;
  const centerY = containerWidth / 2;

  // Retrieve the currently hovered member to check which orbit to pause
  const hoveredMember = members.find((m) => m.id === hoveredMemberId);
  const hoveredOrbitId = hoveredMember ? MEMBER_ORBITS[getMemberKey(hoveredMember)] : null;

  // requestAnimationFrame loop
  useEffect(() => {
    if (reducedMotion || loadStage < 5) return;

    let animFrameId: number;
    let lastTime = performance.now();

    const update = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const newAngles = [...anglesRef.current];
      for (let i = 0; i < 4; i++) {
        const config = ORBIT_CONFIGS[i + 1];
        const baseSpeed = 360 / config.speed; // degrees per second
        
        // Slow down by 75% if a member of this orbit is hovered
        const speedMultiplier = (hoveredOrbitId === i + 1) ? 0.25 : 1.0;
        const deltaAngle = baseSpeed * speedMultiplier * delta;
        
        const dir = config.direction === "cw" ? 1 : -1;
        newAngles[i] = (newAngles[i] + dir * deltaAngle) % 360;
      }
      anglesRef.current = newAngles;
      setAngles(newAngles);
      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, [hoveredOrbitId, reducedMotion, loadStage]);

  // Generate solar dust particles
  const [solarDust] = useState(() =>
    Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      radius: 65 + Math.random() * 85, // 65px to 150px (near Core)
      speed: 14 + Math.random() * 16, // 14s to 30s
      size: 1.2 + Math.random() * 1.8, // 1.2px to 3px
      delay: Math.random() * -30,
      opacity: 0.35 + Math.random() * 0.4,
    }))
  );

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full select-none z-10">
      {/* CW/CCW Rotations, breathing, & dust drift stylesheets */}
      <style jsx global>{`
        @keyframes orbit-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes avatar-breathe {
          0%, 100% {
            transform: scale(1) translateY(0px);
          }
          50% {
            transform: scale(1.04) translateY(-3px);
          }
        }
        @keyframes solar-dust-drift {
          0% {
            transform: translateY(0px) scale(0.85);
            opacity: 0.35;
          }
          100% {
            transform: translateY(12px) scale(1.2);
            opacity: 0.95;
          }
        }
      `}</style>

      {/* Orbit Rings & Trails (translated by parallaxOrbits) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${parallaxOrbits.x}px, ${parallaxOrbits.y}px)`,
          transition: reducedMotion ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex: 10,
        }}
      >
        {[1, 2, 3, 4].map((orbitId) => {
          const orbit = ORBIT_CONFIGS[orbitId];
          const r = (orbit.radiusPct / 100) * containerWidth;
          const orbitMembers = members.filter((m) => MEMBER_ORBITS[getMemberKey(m)] === orbitId);
          const isOrbitHighlighted = orbitMembers.some((m) => m.id === hoveredMemberId);
          const orbitAngle = angles[orbitId - 1];

          return (
            <div
              key={`ring-${orbitId}`}
              className="absolute"
              style={{
                width: r * 2,
                height: r * 2,
                left: centerX - r,
                top: centerY - r,
                transformOrigin: "center center",
                transform: `rotate(${orbitAngle}deg)`,
                transition: "none",
              }}
            >
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id={`ring-grad-${orbitId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,140,0,0)" />
                    <stop offset="35%" stopColor={`rgba(255,140,0,${isOrbitHighlighted ? 0.22 : 0.08})`} />
                    <stop offset="70%" stopColor={`rgba(255,140,0,${isOrbitHighlighted ? 0.15 : 0.04})`} />
                    <stop offset="100%" stopColor="rgba(255,140,0,0)" />
                  </linearGradient>
                </defs>
                {/* Dashed base orbit line */}
                <motion.circle
                  cx={r}
                  cy={r}
                  r={r}
                  fill="none"
                  stroke={`rgba(255,140,0,${isOrbitHighlighted ? 0.35 : sunHovered ? 0.18 : 0.06})`}
                  strokeWidth={isOrbitHighlighted ? 1.5 : 1}
                  strokeDasharray={isOrbitHighlighted ? "none" : "3 6"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={loadStage >= 2 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: (orbitId - 1) * 0.15 }}
                  style={{ transition: "stroke 0.4s ease, stroke-width 0.4s ease" }}
                />
                {/* Glowing light trail */}
                <motion.circle
                  cx={r}
                  cy={r}
                  r={r}
                  fill="none"
                  stroke={`url(#ring-grad-${orbitId})`}
                  strokeWidth={isOrbitHighlighted ? 3 : 1.5}
                  initial={{ opacity: 0 }}
                  animate={loadStage >= 2 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 1 }}
                  style={{
                    filter: isOrbitHighlighted ? "blur(0.5px)" : "none",
                  }}
                />

                {/* SVG Comet Trails & Hover connections */}
                {loadStage >= 3 && orbitMembers.map((member) => {
                  const { angle: angleOffset } = getMemberOrbitAndAngle(member, members);
                  const isHovered = hoveredMemberId === member.id;

                  // Dynamic trailing arc (45 degrees behind the head position)
                  const trailArc = 45 * Math.PI / 180;
                  const tailAngle = orbit.direction === "cw" ? angleOffset - trailArc : angleOffset + trailArc;

                  const x1 = r * Math.cos(angleOffset);
                  const y1 = r * Math.sin(angleOffset);
                  const x2 = r * Math.cos(tailAngle);
                  const y2 = r * Math.sin(tailAngle);

                  const sweepFlag = orbit.direction === "cw" ? 1 : 0;
                  const pathData = `M ${r + x2} ${r + y2} A ${r} ${r} 0 0 ${sweepFlag} ${r + x1} ${r + y1}`;

                  return (
                    <g key={`trail-group-${member.id}`}>
                      <defs>
                        <linearGradient
                          id={`trail-grad-${member.id}`}
                          x1={r + x2}
                          y1={r + y2}
                          x2={r + x1}
                          y2={r + y1}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="rgba(255,140,0,0)" />
                          <stop offset="50%" stopColor="rgba(255,140,0,0.15)" />
                          <stop offset="100%" stopColor="rgba(255,140,0,0.5)" />
                        </linearGradient>
                      </defs>

                      {/* Fading trail */}
                      {!reducedMotion && loadStage >= 4 && (
                        <path
                          d={pathData}
                          fill="none"
                          stroke={`url(#trail-grad-${member.id})`}
                          strokeWidth={isHovered ? 4.5 : 2.5}
                          filter="blur(1.5px)"
                          style={{
                            transition: "stroke-width 0.4s ease",
                            opacity: 0.85,
                          }}
                        />
                      )}
                      
                      {/* Connection dashed vector inside rotating container */}
                      {isHovered && !reducedMotion && (
                        <>
                          <line
                            x1={r + x1}
                            y1={r + y1}
                            x2={r}
                            y2={r}
                            stroke="rgba(255,140,0,0.4)"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                          />
                          <circle r="3.5" fill="#ff9900">
                            <animateMotion
                              dur="1.2s"
                              repeatCount="indefinite"
                              path={`M${r + x1},${r + y1} L${r},${r}`}
                            />
                          </circle>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>

      {/* Solar Dust particles revolving around core */}
      {!reducedMotion && loadStage >= 3 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${parallaxOrbits.x}px, ${parallaxOrbits.y}px)`,
            transition: reducedMotion ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
            zIndex: 12,
            opacity: loadStage >= 3 ? 1 : 0,
          }}
        >
          {solarDust.map((dust) => (
            <div
              key={`dust-${dust.id}`}
              className="absolute"
              style={{
                left: centerX,
                top: centerY,
                width: 0,
                height: 0,
                transform: `rotate(${dust.id * 15}deg)`,
                animation: `orbit-spin-cw ${dust.speed}s linear infinite`,
                animationDelay: `${dust.delay}s`,
              }}
            >
              <div
                className="absolute rounded-full bg-orange-500/70"
                style={{
                  width: dust.size * scaleFactor,
                  height: dust.size * scaleFactor,
                  left: - (dust.size * scaleFactor) / 2,
                  top: -dust.radius * scaleFactor,
                  filter: "blur(0.3px)",
                  boxShadow: "0 0 5px rgba(255,140,0,0.6)",
                  animation: `solar-dust-drift ${4 + (dust.id % 3)}s ease-in-out infinite alternate`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Members Avatars layer (translated by parallaxAvatars) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${parallaxAvatars.x}px, ${parallaxAvatars.y}px)`,
          transition: reducedMotion ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex: 25,
        }}
      >
        {[1, 2, 3, 4].map((orbitId) => {
          const orbit = ORBIT_CONFIGS[orbitId];
          const r = (orbit.radiusPct / 100) * containerWidth;
          const orbitMembers = members.filter((m) => MEMBER_ORBITS[getMemberKey(m)] === orbitId);
          const orbitAngle = angles[orbitId - 1];

          return (
            <div
              key={`avatar-orbit-${orbitId}`}
              className="absolute pointer-events-none"
              style={{
                width: r * 2,
                height: r * 2,
                left: centerX - r,
                top: centerY - r,
                transformOrigin: "center center",
                transform: `rotate(${orbitAngle}deg)`,
                transition: "none",
              }}
            >
              {orbitMembers.map((member) => {
                const { angle: angleOffset } = getMemberOrbitAndAngle(member, members);
                
                const isHovered = hoveredMemberId === member.id;
                const isDimmed = selectedId !== null && selectedId !== member.id;

                // Calculate current coordinates in container reference frame to check mouse distance
                const currentAngleRad = angleOffset + (orbit.direction === "cw" ? 1 : -1) * (orbitAngle * Math.PI / 180);
                const currentX = centerX + r * Math.cos(currentAngleRad);
                const currentY = centerY + r * Math.sin(currentAngleRad);

                // Magnetic pull logic
                let pullX = 0;
                let pullY = 0;
                if (mousePos.x !== -9999) {
                  const dx = mousePos.x - currentX;
                  const dy = mousePos.y - currentY;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 100) {
                    // Pull intensity: linear decay
                    const pullStrength = 10 * (1 - dist / 100);
                    pullX = (dx / dist) * pullStrength;
                    pullY = (dy / dist) * pullStrength;
                  }
                }

                // Node size calculations
                const avatarSize = Math.max(34, Math.round(58 * scaleFactor));
                
                // Polar rectangular offsets inside rotating coordinate system
                const x = r * Math.cos(angleOffset);
                const y = r * Math.sin(angleOffset);

                // Entry coordinates
                const globalIdx = members.findIndex((m) => getMemberKey(m) === getMemberKey(member));
                const flyStart = getFlyInStartCoords(globalIdx);

                const isTopHalf = (r + y) / (r * 2) < 0.5;
                const isLeftHalf = (r + x) / (r * 2) < 0.5;

                return (
                  <div key={member.id}>
                    {/* DIV 1: Framer Motion spring fly-in */}
                    <motion.div
                      initial={{ x: flyStart.x, y: flyStart.y, scale: 0, opacity: 0 }}
                      animate={loadStage >= 4
                        ? { x: x, y: y, scale: 1, opacity: isDimmed ? 0.2 : 1 }
                        : { x: flyStart.x, y: flyStart.y, scale: 0, opacity: 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 60,
                        damping: 15,
                        delay: globalIdx * 0.1,
                      }}
                      className="absolute pointer-events-auto"
                      style={{
                        left: r,
                        top: r,
                        width: avatarSize,
                        height: avatarSize,
                        transformOrigin: "center center",
                        zIndex: isHovered ? 50 : 25,
                      }}
                    >
                      {/* DIV 2: Upright counter-rotation */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          transform: `translate(-50%, -50%) rotate(${-orbitAngle}deg)`,
                          transformOrigin: "center center",
                        }}
                      >
                        {/* DIV 3: Magnetic pull translation & hover scaling */}
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            transform: `translate(${pullX}px, ${pullY}px) scale(${isHovered ? 1.15 : 1.0})`,
                            transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                          }}
                        >
                          {/* DIV 4: Avatar floating & breathing wrapper */}
                          <div
                            className="relative w-full h-full flex items-center justify-center rounded-full touch-target-expand cursor-pointer pointer-events-auto"
                            onMouseEnter={() => setHoveredMemberId(member.id)}
                            onMouseLeave={() => setHoveredMemberId(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(member);
                            }}
                            style={{
                              animation: reducedMotion ? "none" : `avatar-breathe 3.5s ease-in-out infinite`,
                            }}
                          >
                            {/* Orange Glow Halos */}
                            <div
                              className="absolute rounded-full pointer-events-none transition-all duration-300"
                              style={{
                                inset: -6 * scaleFactor,
                                background: `radial-gradient(circle, rgba(255,140,0,${isHovered ? 0.42 : 0.08}) 0%, transparent 70%)`,
                                filter: `blur(${isHovered ? 8 * scaleFactor : 4 * scaleFactor}px)`,
                              }}
                            />

                            {/* Outer Border Ring */}
                            <div
                              className="absolute rounded-full pointer-events-none transition-all duration-300"
                              style={{
                                inset: -2.5 * scaleFactor,
                                border: `${1.5 * scaleFactor}px solid rgba(255,140,0,${isHovered ? 0.8 : 0.2})`,
                                boxShadow: isHovered ? "0 0 12px rgba(255,140,0,0.3)" : "none",
                              }}
                            />

                            {/* Avatar Frame */}
                            <div
                              className="relative w-full h-full rounded-full overflow-hidden border transition-all duration-300 bg-slate-950 shadow-md"
                              style={{
                                borderColor: isHovered ? "rgba(255,140,0,0.7)" : "rgba(255,140,0,0.25)",
                              }}
                            >
                              {member.photo ? (
                                <Image
                                  src={member.photo}
                                  alt={member.name}
                                  fill
                                  sizes={`${avatarSize}px`}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                  <span
                                    className="font-bold text-orange-400"
                                    style={{ fontSize: `${Math.max(9, Math.round(11 * scaleFactor))}px` }}
                                  >
                                    {member.initials}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Upright Name/Role simple tag */}
                            <div
                              className="absolute text-center whitespace-nowrap pointer-events-none transition-all duration-300"
                              style={{
                                top: "105%",
                                opacity: isHovered ? 1.0 : 0.65,
                                transform: `scale(${isHovered ? 1.05 : 1})`,
                              }}
                            >
                              <p
                                className="font-black text-white leading-none font-sans"
                                style={{ fontSize: `${Math.max(9, Math.round(10.5 * scaleFactor))}px` }}
                              >
                                {member.name.split(" ")[0]}
                              </p>
                              <p
                                className="text-orange-400 font-bold uppercase mt-0.5 tracking-wider"
                                style={{ fontSize: `${Math.max(6.5, Math.round(7.5 * scaleFactor))}px` }}
                              >
                                {member.role.split(" ")[0]}
                              </p>
                            </div>

                            {/* Expanded Glassmorphic Info Card */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute z-50 pointer-events-auto select-none text-left"
                                  style={{
                                    width: "220px",
                                    // Inward alignment quadrant-checks to prevent cutting off
                                    ...(isTopHalf ? { top: "125%" } : { bottom: "125%" }),
                                    ...(isLeftHalf ? { left: "0%" } : { right: "0%" }),
                                  }}
                                >
                                  <div className="rounded-2xl border border-orange-500/35 bg-[#080c16]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.85)] p-4 relative">
                                    {/* Inner upper line flare */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent rounded-t-2xl" />
                                    
                                    <h4 className="text-xs font-black text-white">{member.name}</h4>
                                    <p className="text-[9.5px] text-orange-400 font-bold uppercase tracking-wider mt-0.5">{member.role}</p>
                                    <p className="text-[9.5px] text-slate-300 mt-2 leading-relaxed">
                                      {member.bio.length > 90 ? member.bio.slice(0, 90) + "..." : member.bio}
                                    </p>
                                    
                                    {member.linkedin && (
                                      <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-[9px] font-black text-white uppercase tracking-wider transition-all cursor-pointer pointer-events-auto shadow-md"
                                      >
                                        <span>LinkedIn Profile</span>
                                        <ArrowRight className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
