"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { TeamMember } from "@/data/team";
import { motion, AnimatePresence } from "framer-motion";

// Configuration for orbits and members
interface OrbitConfig {
  id: number;
  radiusPct: number; // radius as percentage of container width
  speed: number; // animation duration in seconds
  direction: "cw" | "ccw";
}

const ORBIT_CONFIGS: Record<number, OrbitConfig> = {
  1: { id: 1, radiusPct: 17.5, speed: 55, direction: "cw" },    // Orbit 1: 160px base (ratio 20% scaled down to 17.5% for safety margin)
  2: { id: 2, radiusPct: 26.25, speed: 70, direction: "ccw" },   // Orbit 2: 240px base (ratio 30% scaled down to 26.25%)
  3: { id: 3, radiusPct: 35.0, speed: 90, direction: "cw" },     // Orbit 3: 320px base (ratio 40% scaled down to 35.0%)
  4: { id: 4, radiusPct: 43.75, speed: 110, direction: "ccw" },  // Orbit 4: 400px base (ratio 50% scaled down to 43.75%)
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

export interface OrbitingPlanetsProps {
  members: TeamMember[];
  sunHovered: boolean;
  selectedId: string | null;
  onSelect: (member: TeamMember) => void;
  reducedMotion: boolean;
  scaleFactor: number;
}

export function OrbitingPlanets({
  members,
  sunHovered,
  selectedId,
  onSelect,
  reducedMotion,
  scaleFactor,
}: OrbitingPlanetsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

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

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full select-none z-10">
      {/* CW/CCW Rotations & counter-rotations stylesheets */}
      <style jsx global>{`
        @keyframes orbit-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes member-spin-cw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes member-spin-ccw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
      `}</style>

      {/* Core Reaction: Small floating dust particles revolving slowly */}
      {!reducedMotion && [
        { r: (9.0 / 100) * containerWidth, speed: 22, dir: "cw" },
        { r: (12.5 / 100) * containerWidth, speed: 30, dir: "ccw" },
        { r: (15.5 / 100) * containerWidth, speed: 38, dir: "cw" },
      ].map((p, idx) => (
        <div
          key={`particle-${idx}`}
          className="absolute pointer-events-none"
          style={{
            width: p.r * 2,
            height: p.r * 2,
            left: centerX - p.r,
            top: centerY - p.r,
            transformOrigin: "center center",
            animation: `orbit-spin-${p.dir} ${p.speed}s linear infinite`,
            zIndex: 15,
          }}
        >
          <div
            className="absolute rounded-full bg-orange-400/40"
            style={{
              width: 3 * scaleFactor,
              height: 3 * scaleFactor,
              left: "50%",
              top: 0,
              filter: "blur(0.5px)",
              boxShadow: "0 0 6px rgba(255,140,0,0.8)",
            }}
          />
        </div>
      ))}

      {/* Render Orbits */}
      {[1, 2, 3, 4].map((orbitId) => {
        const orbit = ORBIT_CONFIGS[orbitId];
        const r = (orbit.radiusPct / 100) * containerWidth;
        
        // Filter members that reside on this specific orbit path
        const orbitMembers = members.filter((m) => MEMBER_ORBITS[getMemberKey(m)] === orbitId);
        
        // Pause ONLY this orbit's rotation if a member of this orbit is hovered
        const isOrbitPaused = hoveredOrbitId === orbitId;
        const isOrbitHighlighted = orbitMembers.some((m) => m.id === hoveredMemberId);
        
        const rotationAnim = orbit.direction === "cw" ? "orbit-spin-cw" : "orbit-spin-ccw";

        return (
          <div
            key={orbitId}
            className="absolute"
            style={{
              width: r * 2,
              height: r * 2,
              left: centerX - r,
              top: centerY - r,
              transformOrigin: "center center",
              animation: reducedMotion ? "none" : `${rotationAnim} ${orbit.speed}s linear infinite`,
              animationPlayState: isOrbitPaused ? "paused" : "running",
              zIndex: isOrbitHighlighted ? 30 : 10,
            }}
          >
            {/* SVG Base Circle & Glowing Light Trail */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient id={`ring-grad-${orbitId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,140,0,0)" />
                  <stop offset="35%" stopColor={`rgba(255,140,0,${isOrbitHighlighted ? 0.26 : 0.12})`} />
                  <stop offset="70%" stopColor={`rgba(255,140,0,${isOrbitHighlighted ? 0.18 : 0.05})`} />
                  <stop offset="100%" stopColor="rgba(255,140,0,0)" />
                </linearGradient>
              </defs>
              {/* Dashed base orbit line */}
              <circle
                cx={r}
                cy={r}
                r={r}
                fill="none"
                stroke={`rgba(255,140,0,${isOrbitHighlighted ? 0.35 : sunHovered ? 0.18 : 0.08})`}
                strokeWidth={isOrbitHighlighted ? 1.5 : 1}
                strokeDasharray={isOrbitHighlighted ? "none" : "3 6"}
                style={{ transition: "stroke 0.4s ease, stroke-width 0.4s ease" }}
              />
              {/* Volumetric trailing sweep overlay */}
              <circle
                cx={r}
                cy={r}
                r={r}
                fill="none"
                stroke={`url(#ring-grad-${orbitId})`}
                strokeWidth={isOrbitHighlighted ? 3 : 1.5}
                style={{
                  filter: isOrbitHighlighted ? "blur(0.5px)" : "none",
                  transition: "stroke-width 0.4s ease",
                }}
              />
            </svg>

            {/* Connection dashed vector inside rotating container */}
            {orbitMembers.map((member, idx) => {
              const isHovered = hoveredMemberId === member.id;
              if (!isHovered || reducedMotion) return null;

              // Calculate spacing angle offset
              const totalOnOrbit = orbitMembers.length;
              const angleOffset = (idx / totalOnOrbit) * 2 * Math.PI + (orbitId * (Math.PI / 3));

              const x = r * Math.cos(angleOffset);
              const y = r * Math.sin(angleOffset);
              
              return (
                <svg
                  key={`line-${member.id}`}
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  style={{ zIndex: 0 }}
                >
                  <line
                    x1={r + x}
                    y1={r + y}
                    x2={r}
                    y2={r}
                    stroke="rgba(255,140,0,0.35)"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <circle r="3.5" fill="#ff9900">
                    <animateMotion
                      dur="1.2s"
                      repeatCount="indefinite"
                      path={`M${r + x},${r + y} L${r},${r}`}
                    />
                  </circle>
                </svg>
              );
            })}

            {/* Render Orbit Members */}
            {orbitMembers.map((member, idx) => {
              const totalOnOrbit = orbitMembers.length;
              
              // Spacing formula: distributed evenly + unique rotation starting angle offsets to keep layout balanced
              const angleOffset = (idx / totalOnOrbit) * 2 * Math.PI + (orbitId * (Math.PI / 3));

              const isHovered = hoveredMemberId === member.id;
              const isDimmed = selectedId !== null && selectedId !== member.id;
              
              const x = r * Math.cos(angleOffset);
              const y = r * Math.sin(angleOffset);
              
              const leftPx = r + x;
              const topPx = r + y;

              const avatarSize = Math.max(34, Math.round(58 * scaleFactor));
              
              // Counter-rotation style setup to cancel container rotation
              const counterAnim = orbit.direction === "cw" ? "member-spin-ccw" : "member-spin-cw";

              const isTopHalf = topPx / (r * 2) < 0.5;
              const isLeftHalf = leftPx / (r * 2) < 0.5;

              return (
                <div
                  key={member.id}
                  className="absolute cursor-pointer transition-opacity duration-300"
                  style={{
                    left: leftPx,
                    top: topPx,
                    width: avatarSize,
                    height: avatarSize,
                    transformOrigin: "center center",
                    animation: reducedMotion ? "translate(-50%, -50%)" : `${counterAnim} ${orbit.speed}s linear infinite`,
                    animationPlayState: isOrbitPaused ? "paused" : "running",
                    opacity: isDimmed ? 0.2 : 1,
                    zIndex: isHovered ? 50 : 25,
                  }}
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center rounded-full touch-target-expand"
                    onMouseEnter={() => setHoveredMemberId(member.id)}
                    onMouseLeave={() => setHoveredMemberId(null)}
                    onClick={() => onSelect(member)}
                  >
                    {/* Orange Glow Halos */}
                    <div
                      className="absolute rounded-full pointer-events-none transition-all duration-300"
                      style={{
                        inset: -6 * scaleFactor,
                        background: `radial-gradient(circle, rgba(255,140,0,${isHovered ? 0.35 : 0.08}) 0%, transparent 70%)`,
                        filter: `blur(${isHovered ? 8 * scaleFactor : 4 * scaleFactor}px)`,
                      }}
                    />

                    {/* Outer Border Ring */}
                    <div
                      className="absolute rounded-full pointer-events-none transition-all duration-300"
                      style={{
                        inset: -2.5 * scaleFactor,
                        border: `${1.5 * scaleFactor}px solid rgba(255,140,0,${isHovered ? 0.75 : 0.2})`,
                        boxShadow: isHovered ? "0 0 12px rgba(255,140,0,0.3)" : "none",
                      }}
                    />

                    {/* Avatar Frame */}
                    <div
                      className="relative w-full h-full rounded-full overflow-hidden border transition-all duration-300 bg-slate-950 shadow-md"
                      style={{
                        borderColor: isHovered ? "rgba(255,140,0,0.7)" : "rgba(255,140,0,0.25)",
                        transform: `scale(${isHovered ? 1.15 : 1.0})`,
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
                          className="absolute z-50 pointer-events-none select-none text-left"
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
                            <p className="text-[9px] text-slate-400 mt-1">{member.branch} • {member.specialization}</p>
                            
                            {member.focusAreas && member.focusAreas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {member.focusAreas.slice(0, 2).map((area) => (
                                  <span key={area} className="text-[8px] px-1.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-[9px] text-slate-500 italic mt-2 border-t border-slate-800/60 pt-1.5">
                              "{member.quote || member.bio.slice(0, 60) + '...'}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
