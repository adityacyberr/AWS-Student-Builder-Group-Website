import { useState } from "react";

export function FloatingParticles({ count = 8, active = true }: { count?: number; active?: boolean }) {
  const [particles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>(() => {
    if (!active) return [];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1, // 1px to 3px
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * -20, // Pre-animated offsets
    }));
  });

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-orange-500/10 blur-[0.5px] will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float-particle ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            transform: "translate3d(0,0,0)",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-particle {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(15px, -80px, 0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
