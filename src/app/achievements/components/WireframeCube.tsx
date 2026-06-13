export function WireframeCube() {
  return (
    <div className="absolute bottom-16 left-6 w-36 h-36 opacity-10 pointer-events-none z-0 hidden lg:block select-none">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-orange-500 animate-[spin_25s_linear_infinite]"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      >
        <defs>
          <filter id="orange-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Back Face */}
        <polygon points="45,20 75,20 75,50 45,50" strokeOpacity="0.4" strokeDasharray="2 2" />
        
        {/* Connecting Lines */}
        <line x1="25" y1="40" x2="45" y2="20" strokeOpacity="0.5" />
        <line x1="55" y1="40" x2="75" y2="20" strokeOpacity="0.5" />
        <line x1="55" y1="70" x2="75" y2="50" strokeOpacity="0.5" strokeDasharray="2 2" />
        <line x1="25" y1="70" x2="45" y2="50" strokeOpacity="0.5" strokeDasharray="2 2" />

        {/* Front Face */}
        <polygon points="25,40 55,40 55,70 25,70" filter="url(#orange-glow)" />

        {/* Vertex points */}
        <circle cx="25" cy="40" r="1.5" fill="#ff8c00" />
        <circle cx="55" cy="40" r="1.5" fill="#ff8c00" />
        <circle cx="55" cy="70" r="1.5" fill="#ff8c00" />
        <circle cx="25" cy="70" r="1.5" fill="#ff8c00" />
        <circle cx="45" cy="20" r="1" fill="#ff8c00" fillOpacity="0.6" />
        <circle cx="75" cy="20" r="1" fill="#ff8c00" fillOpacity="0.6" />
        <circle cx="75" cy="50" r="1" fill="#ff8c00" fillOpacity="0.6" />
        <circle cx="45" cy="50" r="1" fill="#ff8c00" fillOpacity="0.6" />

        {/* Inner network center dot */}
        <circle cx="50" cy="45" r="2" fill="#ffffff" className="animate-pulse" />
      </svg>
      <div className="text-[8px] font-mono tracking-widest text-orange-400 mt-2 text-center select-none uppercase">
        BUILDING THE FUTURE TOGETHER
      </div>
    </div>
  );
}
