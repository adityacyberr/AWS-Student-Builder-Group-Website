"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  1: { id: 1, radiusPct: 23.0, speed: 20, direction: "cw" },    // Orbit 1: expanded to avoid overlap
  2: { id: 2, radiusPct: 34.0, speed: 30, direction: "ccw" },   // Orbit 2: expanded
  3: { id: 3, radiusPct: 45.0, speed: 34, direction: "cw" },     // Orbit 3: expanded
  4: { id: 4, radiusPct: 56.0, speed: 45, direction: "ccw" },  // Orbit 4: expanded
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
  onHoverMember?: (id: string | null) => void;
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
  onHoverMember,
}: OrbitingPlanetsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [hoveredAvatarEl, setHoveredAvatarEl] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [windowHeight, setWindowHeight] = useState(800);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onHoverMember?.(hoveredMemberId);
  }, [hoveredMemberId, onHoverMember]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWindowWidth(w);
      setWindowHeight(h);
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      if (hoveredMemberId) {
        setScrollTrigger((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hoveredMemberId]);

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
        
        // Pause orbit completely if a member of this orbit is hovered
        const speedMultiplier = (hoveredOrbitId === i + 1) ? 0.0 : 1.0;
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


  // We will calculate positioning details for the hovered member if it exists
  let popupDetails = null;

  if (hoveredMember && selectedId === null && hoveredAvatarEl) {
    // Reference scrollTrigger and angles to ensure re-calculation on scroll / animation frames
    const _anglesRefVal = angles;
    const _scrollTriggerVal = scrollTrigger;

    const avatarRect = hoveredAvatarEl.getBoundingClientRect();
    const avatarViewportX = avatarRect.left + avatarRect.width / 2;
    const avatarViewportY = avatarRect.top + avatarRect.height / 2;
    const avatarRadius = avatarRect.width / 2;

    const popupWidth = isMobile ? Math.min(320, windowWidth - 32) : (isTablet ? 280 : 320);
    const popupHeight = 240; // budget estimate for height check

    const gap = 20; // consistent gap of 20px

    const spaceLeft = avatarRect.left;
    const spaceRight = windowWidth - avatarRect.right;
    const spaceTop = avatarRect.top;
    const spaceBottom = windowHeight - avatarRect.bottom;

    let hDir: "left" | "right" = "right";
    let vDir: "top" | "bottom" = "top";

    // Horizontal placement check
    if (spaceRight >= gap + popupWidth) {
      hDir = "right";
    } else if (spaceLeft >= gap + popupWidth) {
      hDir = "left";
    } else {
      hDir = spaceRight >= spaceLeft ? "right" : "left";
    }

    // Vertical placement check
    const defaultTop = avatarViewportY - popupHeight;
    if (defaultTop >= 24) {
      vDir = "top";
    } else {
      vDir = "bottom";
    }

    // Viewport-relative horizontal position
    let popupViewportX = 0;
    if (hDir === "right") {
      popupViewportX = avatarRect.right + gap;
    } else {
      popupViewportX = avatarRect.left - gap - popupWidth;
    }

    // Viewport-relative vertical position
    let popupViewportY = 0;
    if (vDir === "top") {
      popupViewportY = avatarViewportY - popupHeight;
    } else {
      popupViewportY = avatarViewportY;
    }

    // Viewport boundary constraints (keeps it 16px from edges)
    popupViewportX = Math.max(16, Math.min(popupViewportX, windowWidth - popupWidth - 16));
    popupViewportY = Math.max(16, Math.min(popupViewportY, windowHeight - popupHeight - 16));

    // Calculate dynamic transform origin for corner scaling
    let transformOrigin = "bottom left";
    if (hDir === "right" && vDir === "top") {
      transformOrigin = "bottom left";
    } else if (hDir === "left" && vDir === "top") {
      transformOrigin = "bottom right";
    } else if (hDir === "right" && vDir === "bottom") {
      transformOrigin = "top left";
    } else if (hDir === "left" && vDir === "bottom") {
      transformOrigin = "top right";
    }

    popupDetails = {
      member: hoveredMember,
      hDir,
      vDir,
      popupWidth,
      popupViewportX,
      popupViewportY,
      avatarViewportX,
      avatarViewportY,
      avatarRadius,
      transformOrigin,
    };
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full select-none pointer-events-none"
      style={{ zIndex: 30 }}
    >
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
        @keyframes bg-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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

          const isOrbitHovered = hoveredOrbitId === orbitId;

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
                zIndex: isOrbitHovered ? 40 : 10,
              }}
            >
               {orbitMembers.map((member) => {
                const { angle: angleOffset } = getMemberOrbitAndAngle(member, members);
                
                const isHovered = hoveredMemberId === member.id;
                const isAnyMemberHovered = hoveredMemberId !== null;
                const isDimmed = (selectedId !== null && selectedId !== member.id) || (isAnyMemberHovered && hoveredMemberId !== member.id);

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
                const avatarSize = Math.max(34, Math.round(80 * scaleFactor));
                
                // Polar rectangular offsets inside rotating coordinate system
                const x = r * Math.cos(angleOffset);
                const y = r * Math.sin(angleOffset);
                // Entry coordinates
                const globalIdx = members.findIndex((m) => getMemberKey(m) === getMemberKey(member));
                const flyStart = getFlyInStartCoords(globalIdx);

                return (
                  <div key={member.id}>
                    {/* DIV 1: Framer Motion spring fly-in */}
                    <motion.div
                      initial={{ x: flyStart.x, y: flyStart.y, scale: 0, opacity: 0 }}
                      animate={loadStage >= 4
                        ? { x: x, y: y, scale: 1, opacity: isDimmed ? 0.55 : 1 }
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
                            onMouseEnter={(e) => {
                              setHoveredMemberId(member.id);
                              setHoveredAvatarEl(e.currentTarget as HTMLElement);
                              if (onHoverMember) onHoverMember(member.id);
                            }}
                            onMouseLeave={() => {
                              setHoveredMemberId(null);
                              setHoveredAvatarEl(null);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHoveredMemberId(null);
                              setHoveredAvatarEl(null);
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
                                inset: -9 * scaleFactor,
                                background: `radial-gradient(circle, rgba(255,140,0,${isHovered ? 0.65 : 0.09}) 0%, transparent 70%)`,
                                filter: `blur(${isHovered ? 16 * scaleFactor : 6 * scaleFactor}px)`,
                              }}
                            />

                            {/* Outer Border Ring */}
                            <div
                              className="absolute rounded-full pointer-events-none transition-all duration-300"
                              style={{
                                inset: -3.5 * scaleFactor,
                                border: `${2.0 * scaleFactor}px solid rgba(255,140,0,${isHovered ? 1.0 : 0.25})`,
                                boxShadow: isHovered ? "0 0 24px rgba(255,140,0,0.65)" : "none",
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
                                top: "108%",
                                opacity: isHovered ? 1.0 : 0.65,
                                transform: `scale(${isHovered ? 1.05 : 1})`,
                              }}
                            >
                              <p
                                className="font-black text-white leading-none font-sans"
                                style={{ fontSize: `${Math.max(12.0, Math.round(14.5 * scaleFactor))}px` }}
                              >
                                {member.name.split(" ")[0]}
                              </p>
                              <p
                                className="text-orange-400 font-bold uppercase mt-0.5 tracking-wider"
                                style={{ fontSize: `${Math.max(9.0, Math.round(10.5 * scaleFactor))}px` }}
                              >
                                {member.role.split(" ")[0]}
                              </p>
                            </div>

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

        {/* Dynamic Popup rendering */}
        <AnimatePresence>
          {mounted && popupDetails && createPortal(
            <>
              {/* If mobile, render backdrop overlay */}
              {isMobile && (
                <div
                  className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-[9998] pointer-events-auto"
                  onClick={() => {
                    setHoveredMemberId(null);
                    setHoveredAvatarEl(null);
                  }}
                />
              )}

              {/* Connecting line (not shown on mobile) */}
              {!isMobile && (
                <div
                  className="fixed pointer-events-none"
                  style={{
                    left: popupDetails.hDir === "right" 
                      ? `${popupDetails.avatarViewportX + popupDetails.avatarRadius}px` 
                      : `${popupDetails.avatarViewportX - popupDetails.avatarRadius - 20}px`,
                    top: `${popupDetails.avatarViewportY}px`,
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "10px",
                    zIndex: 9998,
                  }}
                >
                  {popupDetails.hDir === "right" ? (
                    <svg className="w-full h-full overflow-visible">
                      <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(255,145,0,0.6)" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="20">
                        <animate attributeName="stroke-dashoffset" values="20;0" dur="0.25s" fill="freeze" />
                      </line>
                      <circle cx="0" cy="5" r="3" fill="#ff9100" filter="drop-shadow(0 0 3px #ff9100)">
                        <animate attributeName="cx" values="0;20" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  ) : (
                    <svg className="w-full h-full overflow-visible">
                      <line x1="20" y1="5" x2="0" y2="5" stroke="rgba(255,145,0,0.6)" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="20">
                        <animate attributeName="stroke-dashoffset" values="20;0" dur="0.25s" fill="freeze" />
                      </line>
                      <circle cx="20" cy="5" r="3" fill="#ff9100" filter="drop-shadow(0 0 3px #ff9100)">
                        <animate attributeName="cx" values="20;0" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  )}
                </div>
              )}

              {/* The Popup Card */}
              <div
                style={
                  isMobile
                    ? {
                        position: "fixed",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: `${popupDetails.popupWidth}px`,
                        zIndex: 9999,
                        pointerEvents: "auto",
                      }
                    : {
                        position: "fixed",
                        left: `${popupDetails.popupViewportX}px`,
                        top: `${popupDetails.popupViewportY}px`,
                        width: `${popupDetails.popupWidth}px`,
                        zIndex: 9999,
                        pointerEvents: "auto",
                      }
                }
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{
                    transformOrigin: popupDetails.transformOrigin,
                    background: "linear-gradient(-45deg, #080a16, #101224, #0c0e1c, #080a16)",
                    backgroundSize: "400% 400%",
                    animation: "bg-gradient-shift 12s ease infinite",
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-50 pointer-events-auto select-none text-left rounded-[22px] border border-orange-500/25 bg-[#080a16]/92 backdrop-blur-[20px] shadow-[0_0_40px_rgba(255,140,0,0.22)] p-5 overflow-hidden"
                >
                  {/* Tiny floating particles */}
                  {[...Array(4)].map((_, idx) => {
                    const angles = [45, 135, 225, 315];
                    const rad = angles[idx] * Math.PI / 180;
                    return (
                      <motion.div
                        key={idx}
                        className="absolute w-1 h-1 rounded-full bg-orange-400/80 shadow-[0_0_4px_#ff8c00]"
                        animate={{
                          x: [Math.cos(rad) * 155, Math.cos(rad) * 162, Math.cos(rad) * 155],
                          y: [Math.sin(rad) * 95, Math.sin(rad) * 102, Math.sin(rad) * 95],
                          opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                          duration: 3 + idx,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          left: "50%",
                          top: "50%",
                        }}
                      />
                    );
                  })}

                  {/* Outer border top glow line */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none" />

                  {/* Close button for Mobile centered modal */}
                  {isMobile && (
                    <button
                      onClick={() => {
                        setHoveredMemberId(null);
                        setHoveredAvatarEl(null);
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white z-50 pointer-events-auto"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Header Row */}
                  <div className="flex items-center gap-4">
                    {/* 64px Avatar with orange glow ring */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-[0_0_12px_rgba(255,140,0,0.35)] bg-slate-950 flex-shrink-0">
                      {popupDetails.member.photo ? (
                        <Image
                          src={popupDetails.member.photo}
                          alt={popupDetails.member.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center font-bold text-orange-400 text-sm">
                          {popupDetails.member.initials}
                        </div>
                      )}
                    </div>

                    {/* Name & Role */}
                    <div className="min-w-0">
                      <h4 className="text-xl font-bold text-white tracking-tight leading-tight truncate">
                        {popupDetails.member.name}
                      </h4>
                      <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest mt-1">
                        {popupDetails.member.role}
                      </p>
                    </div>
                  </div>

                  {/* Bio section (max 2-3 lines with gradient fade-out) */}
                  <div className="mt-4 relative">
                    <p className="text-xs text-slate-350 leading-relaxed max-h-[50px] overflow-hidden text-ellipsis line-clamp-2">
                      {popupDetails.member.bio}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#080a16] to-transparent pointer-events-none" />
                  </div>

                  {/* Focus Areas (Skills pills) */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {popupDetails.member.focusAreas.slice(0, 4).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/5 border border-orange-500/15 text-orange-300/95 shadow-[0_0_6px_rgba(255,140,0,0.04)]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 mt-5">
                    {popupDetails.member.linkedin && popupDetails.member.linkedin !== "javascript:void(0)" ? (
                      <a
                        href={popupDetails.member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-[42px] rounded-xl border border-orange-500/40 hover:border-orange-500 hover:bg-orange-500/5 text-[11px] font-bold text-orange-400 hover:text-white hover:shadow-[0_0_12px_rgba(255,145,0,0.15)] transition-all cursor-pointer pointer-events-auto text-center"
                      >
                        LinkedIn
                      </a>
                    ) : (
                      <div className="flex items-center justify-center h-[42px] rounded-xl border border-slate-800 text-[11px] font-bold text-slate-600 select-none text-center">
                        No LinkedIn
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredMemberId(null);
                        setHoveredAvatarEl(null);
                        onSelect(popupDetails!.member);
                      }}
                      className="flex items-center justify-center h-[42px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-[11px] font-extrabold text-white uppercase tracking-wider shadow-md hover:shadow-[0_0_15px_rgba(255,145,0,0.3)] transition-all cursor-pointer pointer-events-auto active:scale-95 text-center"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          , document.body)}
        </AnimatePresence>
      </div>
    </div>
  );
}
