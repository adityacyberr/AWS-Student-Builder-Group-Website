import { useState, useEffect } from "react";

export function FloatingParticles({ count = 12 }: { count?: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const list = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.8 + 0.8, // 0.8px to 2.6px
        duration: Math.random() * 15 + 12, // 12s to 27s
        delay: Math.random() * -20,
      }));
      setParticles(list);
    }, 0);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-orange-500/10 blur-[0.3px] will-change-transform"
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
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(20px, -60px, 0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
