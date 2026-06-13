"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";

export interface PlanetDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stats: string[];
  href: string;
  icon: LucideIcon;
  orbitRadius: number;
  orbitSpeed: number;
  orbitDelay: number;
}

interface OrbitPlanetProps {
  planet: PlanetDef;
  reducedMotion: boolean;
  isDimmed: boolean;
  isSelected: boolean;
  sunHovered: boolean;
  onSelect: (planet: PlanetDef) => void;
  scaleFactor?: number;
}

export function OrbitPlanet({
  planet,
  reducedMotion,
  isDimmed,
  isSelected,
  sunHovered,
  onSelect,
  scaleFactor = 1,
}: OrbitPlanetProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = planet.icon;

  const planetSize = scaleFactor < 0.7 ? 34 : 48;
  const iconSize = scaleFactor < 0.7 ? 15 : 20;

  return (
    <>
      {/* Orbit path ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: planet.orbitRadius * 2,
          height: planet.orbitRadius * 2,
          top: `calc(50% - ${planet.orbitRadius}px)`,
          left: `calc(50% - ${planet.orbitRadius}px)`,
          border: `1px ${hovered || isSelected ? "solid" : "dashed"} rgba(255,140,0,${hovered || isSelected ? 0.2 : isDimmed ? 0.02 : 0.06})`,
          transition: "border-color 0.5s ease, opacity 0.5s ease",
          opacity: isDimmed ? 0.3 : 1,
        }}
      />

      {/* Orbiting container */}
      <div
        className="absolute"
        style={{
          width: planet.orbitRadius * 2,
          height: planet.orbitRadius * 2,
          top: `calc(50% - ${planet.orbitRadius}px)`,
          left: `calc(50% - ${planet.orbitRadius}px)`,
          animation: reducedMotion
            ? "none"
            : `planet-orbit ${planet.orbitSpeed}s linear infinite`,
          animationDelay: `${planet.orbitDelay}s`,
          opacity: isDimmed ? 0.25 : 1,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }}
      >
        {/* Planet node — positioned at top center of orbit circle */}
        <div
          className="absolute"
          style={{
            top: -planetSize / 2,
            left: `calc(50% - ${planetSize / 2}px)`,
            // Counter-rotate to keep planet upright
            animation: reducedMotion
              ? "none"
              : `planet-counter-orbit ${planet.orbitSpeed}s linear infinite`,
            animationDelay: `${planet.orbitDelay}s`,
            pointerEvents: "auto",
          }}
        >
          <button
            className="group relative flex flex-col items-center cursor-pointer outline-none"
            onClick={() => onSelect(planet)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label={`Explore ${planet.name}`}
          >
            {/* Planet body */}
            <div
              className="relative flex items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300"
              style={{
                width: planetSize,
                height: planetSize,
                background: hovered || isSelected
                  ? "rgba(255,140,0,0.15)"
                  : "rgba(10,15,30,0.8)",
                borderColor: hovered || isSelected
                  ? "rgba(255,140,0,0.5)"
                  : "rgba(255,140,0,0.15)",
                boxShadow: hovered || isSelected
                  ? "0 0 24px rgba(255,140,0,0.3), inset 0 0 12px rgba(255,140,0,0.08)"
                  : "0 0 8px rgba(255,140,0,0.08)",
                transform: hovered
                  ? "scale(1.15)"
                  : sunHovered
                    ? "scale(1.05)"
                    : "scale(1)",
              }}
            >
              <Icon
                className="transition-all duration-300"
                style={{
                  width: iconSize,
                  height: iconSize,
                  color: hovered || isSelected
                    ? "rgba(255,180,60,1)"
                    : "rgba(255,140,0,0.6)",
                  filter: hovered || isSelected
                    ? "drop-shadow(0 0 6px rgba(255,140,0,0.5))"
                    : "none",
                }}
              />
            </div>

            {/* Planet label */}
            <div
              className="mt-2 text-center whitespace-nowrap transition-all duration-300"
              style={{
                opacity: hovered || isSelected ? 1 : 0.7,
              }}
            >
              <span
                className="block text-[10px] font-black uppercase tracking-wider transition-colors duration-300"
                style={{
                  color: hovered || isSelected ? "#FF8C00" : "rgba(255,255,255,0.7)",
                }}
              >
                {planet.name}
              </span>
              <span className="block text-[8px] text-slate-500 font-medium tracking-wide mt-0.5">
                {planet.tagline}
              </span>
            </div>

            {/* Hover tooltip preview */}
            {hovered && !isSelected && (
              <div
                className="absolute top-full mt-6 w-48 p-3 rounded-xl border border-orange-500/20 bg-[#070b19]/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-50 pointer-events-none"
                style={{
                  animation: "tooltip-in 0.2s ease-out forwards",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {planet.description}
                </p>
                <span className="block text-[9px] text-orange-400 font-bold mt-2 uppercase tracking-wider">
                  Click to Explore →
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes planet-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes planet-counter-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes tooltip-in {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
