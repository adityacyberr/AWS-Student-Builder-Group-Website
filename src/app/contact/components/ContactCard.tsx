import { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function ContactCard({
  icon,
  title,
  subtitle,
  value,
  href,
  variants,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string;
  href?: string;
  variants?: Variants;
  items?: string[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
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

  const CardWrapper = href ? "a" : "div";

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      className="w-full"
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
    >
      <CardWrapper
        href={href}
        {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onMouseMove={handleMouseMove}
        className={`group relative flex items-center justify-between py-7 px-7 sm:py-8 sm:px-8 rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm transition-all duration-300 ease-out hover:border-orange-500/40 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-12px_rgba(255,140,0,0.2),inset_0_0_12px_rgba(255,140,0,0.03)] cursor-default block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500`}
      >
        {/* Cursor Follow Light Overlay (Desktop Only) */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
          style={{
            background:
              "radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.08), transparent 40%)",
          }}
        />

        {/* Hover glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

        {/* Left/Middle Content */}
        <div className="flex gap-5 items-start relative z-10">
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0 group-hover:shadow-[0_0_20px_rgba(255,140,0,0.2)]">
            {icon}
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              {title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {subtitle}
            </p>
            <p className="text-sm font-bold text-white font-mono mt-1.5 group-hover:text-orange-400 transition-colors">
              {value}
            </p>
            {/* Optional items list */}
            {items && items.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold text-slate-400 bg-slate-900/60 border border-slate-800/50 px-2.5 py-1 rounded-md group-hover:border-orange-500/20 group-hover:text-orange-400/80 transition-all duration-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Arrow */}
        {href && (
          <div className="text-slate-600 group-hover:text-orange-400 transition-colors flex-shrink-0 relative z-10 pl-4">
            <ArrowRight className="h-5 w-5 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-200" />
          </div>
        )}
      </CardWrapper>
    </motion.div>
  );
}
