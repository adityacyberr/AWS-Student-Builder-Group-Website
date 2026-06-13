import { useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sprout, ShieldAlert, Compass } from "lucide-react";

interface JourneyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  variants?: Variants;
}

function JourneyCard({ icon, title, description, ctaText, href, variants }: JourneyCardProps) {
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
        className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm transition-all duration-300 ease-out hover:border-orange-500/35 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(255,140,0,0.08),inset_0_0_12px_rgba(255,140,0,0.02)] w-full text-left"
      >
        {/* Cursor spotlight (Desktop Only) */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
          style={{
            background: "radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.06), transparent 45%)",
          }}
        />

        <div className="space-y-4 relative z-10">
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform duration-300 inline-block">
            {icon}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* CTA link */}
        <div className="pt-6 relative z-10">
          <a
            href={href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-all text-xs font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function BottomJourney({ containerVariants, itemVariants }: { containerVariants?: Variants; itemVariants?: Variants }) {
  return (
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <JourneyCard
        variants={itemVariants}
        icon={<Sprout className="h-5 w-5" />}
        title="Community Growth"
        description="Building cloud learning opportunities for every student on campus through peer mentoring."
        ctaText="Explore"
        href="/about"
      />
      <JourneyCard
        variants={itemVariants}
        icon={<Compass className="h-5 w-5" />}
        title="Events & Workshops"
        description="Get hands-on cloud learning experiences with our practical syllabus-led bootcamps."
        ctaText="Learn More"
        href="/events"
      />
      <JourneyCard
        variants={itemVariants}
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Future Vision"
        description="Creating a highly integrated student chapter sandbox for modern cloud engineering."
        ctaText="Join Us"
        href="/contact"
      />
    </motion.div>
  );
}
