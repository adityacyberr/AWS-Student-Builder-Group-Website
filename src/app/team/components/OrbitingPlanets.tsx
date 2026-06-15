"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { TeamMember } from "@/data/team";
import { motion, AnimatePresence } from "framer-motion";

// Configuration for orbits and members
interface OrbitConfig {
  id: number;
  radiusPct: number; // radius as percentage of container half-width (e.g. 20.0, 28.8, 37.7, 46.6)
  speed: number; // animation duration in seconds
  direction: "cw" | "ccw";
}

const ORBIT_CONFIGS: Record<number, OrbitConfig> = {
  1: { id: 1, radiusPct: 20.0, speed: 60, direction: "cw" },
  2: { id: 2, radiusPct: 28.8, speed: 70, direction: "ccw" },
  3: { id: 3, radiusPct: 37.7, speed: 80, direction: "cw" },
  4: { id: 4, radiusPct: 46.6, speed: 90, direction: "ccw" },
};

// Map each member to an Orbit and an Angle Offset (in radians)
const MEMBER_ORBITS: Record<string, { orbitId: number; angleOffset: number }> = {
  "pranav-bansal": { orbitId: 1, angleOffset: 0 },
  "aditya-kumar":  { orbitId: 2, angleOffset: Math.PI * 0.25 }, // 45 deg
  "amisha":        { orbitId: 2, angleOffset: Math.PI * 1.25 }, // 225 deg (opposite)
  "amber-prashar": { orbitId: 3, angleOffset: Math.PI * 0.6 },  // 108 deg
  "rohan-verma":   { orbitId: 3, angleOffset: Math.PI * 1.6 },  // 288 deg (opposite)
  "rinku-bhalotiya": { orbitId: 4, angleOffset: Math.PI * 0.9 }, // 162 deg
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

  // Keep track of parent container sizing dynamically to build pixel-based rendering
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Fallback measurement
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

  // Determine if rotation should be paused globally
  const isPaused = hoveredMemberId !== null;

  // Helper to get member orbit info
  const getMemberOrbitInfo = useCallback((member: TeamMember, index: number) => {
    const config = MEMBER_ORBITS[member.id];
    if (config) return config;

    // Sane fallback if member details are modified in database
    const orbitId = (index % 4) + 1;
    const angleOffset = (index / 6) * Math.PI * 2;
    return { orbitId, angleOffset };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full select-none z-10">
      {/* Dynamic inline styles for CW/CCW rotations & counter-rotations */}
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
        @keyframes card-fade-up {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* Render Orbits */}
      {[1, 2, 3, 4].map((orbitId) => {
        const orbit = ORBIT_CONFIGS[orbitId];
        const r = (orbit.radiusPct / 100) * containerWidth;
        const orbitMembers = members.filter((m, i) => getMemberOrbitInfo(m, i).orbitId === orbitId);
        
        // Highlight orbit if one of its members is hovered
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
              animationPlayState: isPaused ? "paused" : "running",
              zIndex: isOrbitHighlighted ? 30 : 10,
            }}
          >
            {/* Dashed Orbit Ring */}
            <div
              className="absolute inset-0 rounded-full border transition-all duration-500"
              style={{
                borderColor: `rgba(255,140,0,${isOrbitHighlighted ? 0.35 : sunHovered ? 0.15 : 0.07})`,
                borderWidth: isOrbitHighlighted ? "1.5px" : "1px",
                borderStyle: isOrbitHighlighted ? "solid" : "dashed",
                boxShadow: isOrbitHighlighted ? "0 0 15px rgba(255,140,0,0.12)" : "none",
              }}
            />

            {/* Connection line vector (rendered inside the rotating container) */}
            {orbitMembers.map((member, idx) => {
              const { angleOffset } = getMemberOrbitInfo(member, idx);
              const isHovered = hoveredMemberId === member.id;
              
              if (!isHovered || reducedMotion) return null;

              const x = r * Math.cos(angleOffset);
              const y = r * Math.sin(angleOffset);
              
              return (
                <svg
                  key={`line-${member.id}`}
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  style={{ zIndex: 0 }}
                >
                  {/* Dashed line to center Sun */}
                  <line
                    x1={r + x}
                    y1={r + y}
                    x2={r}
                    y2={r}
                    stroke="rgba(255,140,0,0.35)"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  {/* Animated energy travel particle */}
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

            {/* Render Members inside this Orbit */}
            {orbitMembers.map((member, idx) => {
              const { angleOffset } = getMemberOrbitInfo(member, idx);
              
              const isHovered = hoveredMemberId === member.id;
              const isDimmed = selectedId !== null && selectedId !== member.id;
              
              const x = r * Math.cos(angleOffset);
              const y = r * Math.sin(angleOffset);
              
              // Member positioning relative to Orbit container center (r, r)
              const leftPx = r + x;
              const topPx = r + y;

              // Size adjustments
              const avatarSize = Math.max(34, Math.round(58 * scaleFactor));
              
              // Dynamic upright counter rotation
              const counterAnim = orbit.direction === "cw" ? "member-spin-ccw" : "member-spin-cw";

              // Check card placement quadrant to prevent bounds overflow
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
                    animationPlayState: isPaused ? "paused" : "running",
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

                    {/* Outer Border ring */}
                    <div
                      className="absolute rounded-full pointer-events-none transition-all duration-300"
                      style={{
                        inset: -2.5 * scaleFactor,
                        border: `${1.5 * scaleFactor}px solid rgba(255,140,0,${isHovered ? 0.75 : 0.2})`,
                        boxShadow: isHovered ? "0 0 12px rgba(255,140,0,0.3)" : "none",
                      }}
                    />

                    {/* Avatar Image container */}
                    <div
                      className="relative w-full h-full rounded-full overflow-hidden border transition-all duration-300 bg-slate-950"
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
                            // Dynamic alignment depending on quadrant to avoid edge clipping
                            ...(isTopHalf ? { top: "125%" } : { bottom: "125%" }),
                            ...(isLeftHalf ? { left: "0%" } : { right: "0%" }),
                          }}
                        >
                          <div className="rounded-2xl border border-orange-500/35 bg-[#080c16]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.85)] p-4 relative">
                            {/* Accent highlight line */}
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
