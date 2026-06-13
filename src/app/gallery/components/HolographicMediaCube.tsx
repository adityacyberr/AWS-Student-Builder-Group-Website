import { useState, useRef } from "react";

export function HolographicMediaCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    const angleX = -(mouseY / (height / 2)) * 12;
    const angleY = (mouseX / (width / 2)) * 12;

    setRotate({ x: angleX, y: angleY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center justify-center py-6 select-none relative z-10 w-full max-w-md mx-auto">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="relative w-80 h-80 flex items-center justify-center cursor-pointer group"
      >
        {/* Soft background glow */}
        <div className="absolute inset-8 rounded-full bg-orange-500/5 blur-[45px] group-hover:bg-orange-500/10 transition-all duration-700 animate-pulse" />

        {/* Orbiting Ring (Vertical tilt) */}
        <div 
          className="absolute inset-0 rounded-full border border-dashed border-orange-500/15 animate-[spin_24s_linear_infinite]"
          style={{ transform: "rotateX(60deg) rotateY(15deg)" }}
        />
        
        {/* Orbiting Ring 2 (Opposite spin) */}
        <div 
          className="absolute inset-6 rounded-full border border-orange-500/10 animate-[spin_18s_linear_infinite_reverse]"
          style={{ transform: "rotateX(-35deg) rotateY(-45deg)" }}
        />

        {/* Holographic Media Cube Container */}
        <div className="absolute w-44 h-44 flex items-center justify-center animate-[pulse_3.5s_ease-in-out_infinite]">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-orange-500 animate-[spin_35s_linear_infinite]"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <defs>
              <filter id="cube-glow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Inner rotating server block */}
            <g transform="scale(0.85) translate(8, 8)">
              {/* Back Face */}
              <polygon points="45,20 75,20 75,50 45,50" strokeOpacity="0.3" strokeDasharray="1 2" />
              {/* Connecting Lines */}
              <line x1="25" y1="40" x2="45" y2="20" strokeOpacity="0.4" />
              <line x1="55" y1="40" x2="75" y2="20" strokeOpacity="0.4" />
              <line x1="55" y1="70" x2="75" y2="50" strokeOpacity="0.4" strokeDasharray="1 2" />
              <line x1="25" y1="70" x2="45" y2="50" strokeOpacity="0.4" strokeDasharray="1 2" />
              {/* Front Face */}
              <polygon points="25,40 55,40 55,70 25,70" strokeOpacity="0.6" />
            </g>

            {/* Outer main holographic cube frame */}
            <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" filter="url(#cube-glow)" strokeOpacity="0.85" />
            
            {/* Center spine connector lines */}
            <line x1="50" y1="15" x2="50" y2="85" strokeOpacity="0.6" />
            <line x1="50" y1="50" x2="20" y2="32" strokeOpacity="0.6" />
            <line x1="50" y1="50" x2="80" y2="32" strokeOpacity="0.6" />
            <line x1="50" y1="50" x2="50" y2="85" strokeOpacity="0.6" />

            {/* Vertices indicator dots */}
            <circle cx="50" cy="15" r="2.5" fill="#ff8c00" className="animate-pulse" />
            <circle cx="80" cy="32" r="2" fill="#ff8c00" />
            <circle cx="80" cy="68" r="2" fill="#ff8c00" />
            <circle cx="50" cy="85" r="2.5" fill="#ff8c00" className="animate-pulse" />
            <circle cx="20" cy="68" r="2" fill="#ff8c00" />
            <circle cx="20" cy="32" r="2" fill="#ff8c00" />
            <circle cx="50" cy="50" r="3" fill="#ffffff" className="animate-ping" style={{ animationDuration: "3s" }} />
          </svg>
        </div>

        {/* Rotating technical tags */}
        <div className="absolute text-[8px] font-mono tracking-widest text-orange-400/60 uppercase animate-pulse select-none text-center">
          MEDIA_VAULT // ONLINE
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,140,0,0.1)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 25px rgba(255,140,0,0.25)); }
        }
      `}</style>
    </div>
  );
}
