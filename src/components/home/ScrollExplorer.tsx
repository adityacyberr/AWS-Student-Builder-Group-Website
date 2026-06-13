"use client";

import { ChevronDown } from "lucide-react";

export function ScrollExplorer() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Scroll to Explore
      </span>
      <div className="relative w-6 h-10 rounded-full border border-slate-700/50 flex items-start justify-center pt-2">
        <div
          className="w-1 h-2 rounded-full bg-orange-500/60"
          style={{
            animation: "scroll-bounce 2s ease-in-out infinite",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes scroll-bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
