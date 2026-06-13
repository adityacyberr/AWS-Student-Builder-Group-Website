import { useEffect, useState } from "react";

export function CircuitConnector() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (isMobile) return null;

  return (
    <div className="absolute left-6 top-0 bottom-0 w-24 -translate-x-14 pointer-events-none z-0">
      <svg className="w-full h-full" fill="none" viewBox="0 0 100 600" preserveAspectRatio="none">
        {/* Connection circuit paths */}
        <path
          d="M 80,105 L 35,105 L 35,305 L 80,305 M 35,305 L 35,505 L 80,505"
          stroke="rgba(255, 140, 0, 0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Nodes branching to cards */}
        <circle cx="80" cy="105" r="4.5" fill="#ff8c00" className="shadow-[0_0_8px_#ff8c00]" />
        <circle cx="80" cy="305" r="4.5" fill="#ff8c00" className="shadow-[0_0_8px_#ff8c00]" />
        <circle cx="80" cy="505" r="4.5" fill="#ff8c00" className="shadow-[0_0_8px_#ff8c00]" />
        
        {/* Nodes on spine */}
        <circle cx="35" cy="105" r="5" fill="#ff8c00" className="shadow-[0_0_10px_#ff8c00]" />
        <circle cx="35" cy="305" r="5" fill="#ff8c00" className="shadow-[0_0_10px_#ff8c00]" />
        <circle cx="35" cy="505" r="5" fill="#ff8c00" className="shadow-[0_0_10px_#ff8c00]" />

        {/* Animated signal pulse dot */}
        <circle r="4.5" fill="#ffffff">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M 80,105 L 35,105 L 35,305 L 80,305 L 35,305 L 35,505 L 80,505"
          />
        </circle>
      </svg>
    </div>
  );
}
