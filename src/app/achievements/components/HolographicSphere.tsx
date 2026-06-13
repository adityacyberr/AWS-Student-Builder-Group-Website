import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["BUILD", "LEARN", "INNOVATE", "IMPACT"];

export function HolographicSphere() {
  const [wordIdx, setWordIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // Rotate text words every 2.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % WORDS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Parallax reaction to mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Constrain angles to 12 degrees max
    const angleX = -(mouseY / (height / 2)) * 12;
    const angleY = (mouseX / (width / 2)) * 12;

    setRotate({ x: angleX, y: angleY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none relative z-10 w-full max-w-lg mx-auto">
      {/* Outer interactive mouse grid wrapper */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center cursor-crosshair group"
      >
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-4 rounded-full bg-orange-500/5 blur-[50px] group-hover:bg-orange-500/10 transition-all duration-700 animate-pulse-slow" />

        {/* Orbiting Ring 1 (Horizontal tilt) */}
        <div 
          className="absolute inset-2 rounded-full border border-dashed border-orange-500/20 animate-[spin_32s_linear_infinite]"
          style={{ transform: "rotateX(75deg) rotateY(10deg)" }}
        />

        {/* Orbiting Ring 2 (Vertical tilt) */}
        <div 
          className="absolute inset-8 rounded-full border border-orange-500/10 animate-[spin_20s_linear_infinite_reverse]"
          style={{ transform: "rotateX(20deg) rotateY(65deg)" }}
        />

        {/* Orbiting Ring 3 (Opposite spin) */}
        <div 
          className="absolute inset-16 rounded-full border border-dashed border-amber-500/15 animate-[spin_15s_linear_infinite]"
          style={{ transform: "rotateX(-45deg) rotateY(-35deg)" }}
        />

        {/* Core Pulsing Sphere */}
        <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-orange-500/20 bg-slate-950/40 backdrop-blur-sm shadow-[0_0_50px_rgba(255,140,0,0.1),inset_0_0_30px_rgba(255,140,0,0.05)] flex items-center justify-center animate-pulse-slow">
          {/* Inner radar grid sweep */}
          <div className="absolute inset-0 rounded-full border border-orange-500/10 [mask-image:linear-gradient(to_bottom,black,transparent)] animate-spin-slow" />
          
          {/* Center Text Projector */}
          <div className="relative text-center z-10 flex flex-col items-center">
            <span className="text-[9px] font-mono tracking-[0.25em] text-orange-400/60 uppercase mb-1.5 animate-pulse">
              SYS_OPERATIONS
            </span>
            <div className="h-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[wordIdx]}
                  initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(4px)", scale: 1.05 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="text-xl sm:text-2xl font-black text-white tracking-wider filter drop-shadow-[0_0_8px_rgba(255,140,0,0.6)]"
                >
                  {WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Orbiting particle ring overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          {/* Milestone nodes (connected with thin dotted lines) */}
          <line x1="50" y1="50" x2="18" y2="22" stroke="rgba(255, 140, 0, 0.2)" strokeWidth="0.5" strokeDasharray="1 2" />
          <line x1="50" y1="50" x2="82" y2="28" stroke="rgba(255, 140, 0, 0.2)" strokeWidth="0.5" strokeDasharray="1 2" />
          <line x1="50" y1="50" x2="20" y2="75" stroke="rgba(255, 140, 0, 0.2)" strokeWidth="0.5" strokeDasharray="1 2" />
          <line x1="50" y1="50" x2="78" y2="78" stroke="rgba(255, 140, 0, 0.2)" strokeWidth="0.5" strokeDasharray="1 2" />

          {/* Node 1: Top Left */}
          <circle cx="18" cy="22" r="3.5" fill="#050816" stroke="#ff8c00" strokeWidth="1" className="animate-pulse" />
          <circle cx="18" cy="22" r="1.5" fill="#ff8c00" />
          <text x="12" y="16" fill="rgba(255,140,0,0.6)" fontSize="3.5" fontFamily="monospace" textAnchor="end">LAUNCH</text>

          {/* Node 2: Top Right */}
          <circle cx="82" cy="28" r="3.5" fill="#050816" stroke="#00d2ff" strokeWidth="1" />
          <circle cx="82" cy="28" r="1.5" fill="#00d2ff" />
          <text x="88" y="24" fill="rgba(0,210,255,0.6)" fontSize="3.5" fontFamily="monospace" textAnchor="start">WORKSHOPS</text>

          {/* Node 3: Bottom Left */}
          <circle cx="20" cy="75" r="3.5" fill="#050816" stroke="#00d2ff" strokeWidth="1" />
          <circle cx="20" cy="75" r="1.5" fill="#00d2ff" />
          <text x="14" y="81" fill="rgba(0,210,255,0.6)" fontSize="3.5" fontFamily="monospace" textAnchor="end">CHAPTER_DEV</text>

          {/* Node 4: Bottom Right */}
          <circle cx="78" cy="78" r="3.5" fill="#050816" stroke="#ff8c00" strokeWidth="1" className="animate-pulse" />
          <circle cx="78" cy="78" r="1.5" fill="#ff8c00" />
          <text x="84" y="84" fill="rgba(255,140,0,0.6)" fontSize="3.5" fontFamily="monospace" textAnchor="start">IMPACT</text>
        </svg>
      </div>

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.45; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
