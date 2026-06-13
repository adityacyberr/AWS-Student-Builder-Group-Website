"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { TeamMember } from "@/data/team";

interface OrbitConfig {
  radius: number;
  speed: number;
  startAngle: number;
}

// Predefined orbit configurations for 6 team members
const ORBIT_CONFIGS: OrbitConfig[] = [
  { radius: 200, speed: 0.08, startAngle: 30 },
  { radius: 215, speed: 0.065, startAngle: 90 },
  { radius: 230, speed: 0.055, startAngle: 150 },
  { radius: 200, speed: 0.075, startAngle: 210 },
  { radius: 220, speed: 0.06, startAngle: 270 },
  { radius: 210, speed: 0.07, startAngle: 330 },
];

interface PlanetMemberProps {
  member: TeamMember;
  orbitConfig: OrbitConfig;
  index: number;
  sunHovered: boolean;
  selectedId: string | null;
  onSelect: (member: TeamMember) => void;
  reducedMotion: boolean;
  containerCenter: { x: number; y: number };
}

function PlanetMember({
  member,
  orbitConfig,
  index,
  sunHovered,
  selectedId,
  onSelect,
  reducedMotion,
  containerCenter,
}: PlanetMemberProps) {
  const planetRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(orbitConfig.startAngle * (Math.PI / 180));
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const isDimmed = selectedId !== null && selectedId !== member.id;

  // Animate orbit
  useEffect(() => {
    if (reducedMotion) {
      // Just place at start angle
      const x = Math.cos(angleRef.current) * orbitConfig.radius;
      const y = Math.sin(angleRef.current) * orbitConfig.radius * 0.45;
      setPos({ x, y });
      return;
    }

    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!pausedRef.current) {
        angleRef.current += (orbitConfig.speed * delta) / 1000;
      }

      const x = Math.cos(angleRef.current) * orbitConfig.radius;
      const y = Math.sin(angleRef.current) * orbitConfig.radius * 0.45;
      setPos({ x, y });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [orbitConfig.radius, orbitConfig.speed, reducedMotion]);

  useEffect(() => {
    pausedRef.current = hovered;
  }, [hovered]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(() => onSelect(member), [member, onSelect]);

  // Determine z-index based on Y position (lower Y = behind = lower z)
  const zIndex = Math.round(pos.y + 300);

  return (
    <>
      {/* Orbit path ellipse */}
      <div
        className="absolute pointer-events-none transition-opacity duration-500"
        style={{
          width: orbitConfig.radius * 2,
          height: orbitConfig.radius * 0.9,
          left: containerCenter.x - orbitConfig.radius,
          top: containerCenter.y - orbitConfig.radius * 0.45,
          borderRadius: "50%",
          border: `1px solid rgba(255,140,0,${sunHovered ? 0.15 : hovered ? 0.12 : 0.05})`,
          opacity: isDimmed ? 0.2 : 1,
          transition: "border-color 0.5s ease, opacity 0.5s ease",
        }}
      />

      {/* Planet */}
      <div
        ref={planetRef}
        className="absolute cursor-pointer group"
        style={{
          left: containerCenter.x + pos.x - 32,
          top: containerCenter.y + pos.y - 32,
          zIndex,
          opacity: isDimmed ? 0.25 : 1,
          transition: "opacity 0.5s ease",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Planet glow aura */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-400"
          style={{
            inset: -8,
            background: `radial-gradient(circle, rgba(255,140,0,${hovered ? 0.35 : sunHovered ? 0.15 : 0.08}) 0%, transparent 70%)`,
            filter: `blur(${hovered ? 10 : 5}px)`,
          }}
        />

        {/* Rotating glowing ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -3,
            border: `1.5px solid rgba(255,140,0,${hovered ? 0.6 : 0.2})`,
            boxShadow: `0 0 ${hovered ? 12 : 4}px rgba(255,140,0,${hovered ? 0.4 : 0.1})`,
            animation: reducedMotion ? "none" : `spin ${hovered ? 3 : 8}s linear infinite`,
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <div
            className="absolute rounded-full bg-orange-400"
            style={{ width: 4, height: 4, top: -2, left: "50%", marginLeft: -2, boxShadow: "0 0 6px rgba(255,140,0,0.6)" }}
          />
        </div>

        {/* Avatar container */}
        <div
          className="relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300"
          style={{
            borderColor: hovered ? "rgba(255,140,0,0.6)" : "rgba(255,140,0,0.2)",
            transform: `scale(${hovered ? 1.12 : 1})`,
            boxShadow: hovered
              ? "0 0 20px rgba(255,140,0,0.3), 0 8px 32px rgba(0,0,0,0.5)"
              : "0 0 8px rgba(255,140,0,0.1), 0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <span className="text-sm font-bold text-orange-400">{member.initials}</span>
            </div>
          )}
        </div>

        {/* Connection line to center (sun) */}
        {hovered && !reducedMotion && (
          <svg
            className="absolute pointer-events-none"
            style={{
              left: 32,
              top: 32,
              width: 1,
              height: 1,
              overflow: "visible",
              zIndex: -1,
            }}
          >
            <line
              x1="0"
              y1="0"
              x2={-pos.x}
              y2={-pos.y}
              stroke="rgba(255,140,0,0.15)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Traveling energy particle */}
            <circle r="2" fill="rgba(255,140,0,0.6)">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={`M0,0 L${-pos.x},${-pos.y}`}
              />
            </circle>
          </svg>
        )}

        {/* Name + Role label */}
        {(() => {
          const isLabelAbove = pos.y < 0;
          return (
            <div
              className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none transition-all duration-300 whitespace-nowrap"
              style={{
                top: isLabelAbove ? "auto" : "100%",
                bottom: isLabelAbove ? "100%" : "auto",
                marginTop: isLabelAbove ? 0 : 8,
                marginBottom: isLabelAbove ? 8 : 0,
                opacity: hovered ? 1 : 0.65,
                transform: `translateX(-50%) translateY(${hovered ? 0 : isLabelAbove ? -2 : 2}px)`,
              }}
            >
              <p
                className="text-[11px] font-bold text-white leading-tight"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                {member.name.split(" ")[0]}
              </p>
              <p
                className="text-[9px] text-orange-400/80 font-medium mt-0.5"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                {member.role}
              </p>
            </div>
          );
        })()}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export interface OrbitingPlanetsProps {
  members: TeamMember[];
  sunHovered: boolean;
  selectedId: string | null;
  onSelect: (member: TeamMember) => void;
  reducedMotion: boolean;
  containerCenter: { x: number; y: number };
}

export function OrbitingPlanets({
  members,
  sunHovered,
  selectedId,
  onSelect,
  reducedMotion,
  containerCenter,
}: OrbitingPlanetsProps) {
  return (
    <>
      {members.slice(0, 6).map((member, i) => (
        <PlanetMember
          key={member.id}
          member={member}
          orbitConfig={ORBIT_CONFIGS[i]}
          index={i}
          sunHovered={sunHovered}
          selectedId={selectedId}
          onSelect={onSelect}
          reducedMotion={reducedMotion}
          containerCenter={containerCenter}
        />
      ))}
    </>
  );
}
