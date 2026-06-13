import { useEffect, useState } from "react";

export function FloatingBackground({ count = 10 }: { count?: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const list = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.8,
        duration: Math.random() * 18 + 15,
        delay: Math.random() * -20,
      }));
      setParticles(list);
    }, 0);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Concentration Radar Pulse Rings */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-orange-500/5 animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute inset-[150px] rounded-full border border-orange-500/5 animate-[ping_12s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:2s]" />
        <div className="absolute inset-[300px] rounded-full border border-orange-500/5 animate-[ping_16s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:4s]" />
        
        {/* Subtle grid axis lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500/[0.02]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500/[0.02]" />
      </div>

      {/* Floating Cyber Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-orange-500/20 blur-[0.2px] will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float-slow ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            transform: "translate3d(0,0,0)",
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float-slow {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.45;
          }
          90% {
            opacity: 0.45;
          }
          100% {
            transform: translate3d(30px, -70px, 0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
