export function RadarCircles() {
  return (
    <div className="absolute left-0 top-0 w-96 h-96 -translate-x-[35%] -translate-y-[35%] opacity-15 pointer-events-none select-none z-0 hidden lg:block">
      <div className="absolute inset-0 rounded-full border border-orange-500/10 animate-[pulse-ring_8s_cubic-bezier(0.215,0.61,0.355,1)_infinite]" />
      <div className="absolute inset-12 rounded-full border border-orange-500/10 animate-[pulse-ring_8s_cubic-bezier(0.215,0.61,0.355,1)_infinite_2s]" />
      <div className="absolute inset-24 rounded-full border border-orange-500/10 animate-[pulse-ring_8s_cubic-bezier(0.215,0.61,0.355,1)_infinite_4s]" />
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.65);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
