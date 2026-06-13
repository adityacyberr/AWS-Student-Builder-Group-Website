import { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function CollabCard({
  icon,
  title,
  description,
  ctaText,
  href,
  variants,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  variants?: Variants;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const card = cardRef.current;
    if (!card) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <motion.div 
      variants={variants}
      className="flex"
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm transition-all duration-300 ease-out hover:border-orange-500/40 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-12px_rgba(255,140,0,0.2),inset_0_0_12px_rgba(255,140,0,0.03)] w-full text-left"
      >
        {/* Cursor Follow Light Overlay (Desktop Only) */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
          style={{
            background: "radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.08), transparent 40%)",
          }}
        />

        {/* Hover glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

        <div className="relative z-10 space-y-4">
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform duration-300 inline-block">
            {icon}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">
              {title}
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 pt-6 mt-4">
          <a
            href={href}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
