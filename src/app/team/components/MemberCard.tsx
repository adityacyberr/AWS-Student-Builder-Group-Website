import { useRef, useEffect } from "react";
import { TeamMember } from "@/data/team";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Terminal,
  GitPullRequest,
  DollarSign,
  Megaphone,
  Calendar,
  Camera,
  User,
} from "lucide-react";

const getRoleIcon = (role: string, className = "h-4 w-4") => {
  switch (role) {
    case "Group Leader":
      return <Terminal className={className} />;
    case "Technical Head":
      return <GitPullRequest className={className} />;
    case "Treasurer":
      return <DollarSign className={className} />;
    case "Marketing Head":
      return <Megaphone className={className} />;
    case "Event Head":
      return <Calendar className={className} />;
    case "Director of Photography":
      return <Camera className={className} />;
    default:
      return <User className={className} />;
  }
};

export function MemberCard({
  member,
  onOpen,
  isDimmed,
}: {
  member: TeamMember;
  onOpen: () => void;
  isDimmed: boolean;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Disable on coarse pointer / touch devices
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
    <motion.button
      ref={cardRef}
      onClick={onOpen}
      onMouseMove={handleMouseMove}
      layoutId={`card-container-${member.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`View details for ${member.name}`}
      className={`group relative w-full text-left rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${
        isDimmed 
          ? "border-slate-900 bg-slate-950/20 opacity-30 blur-[2px] pointer-events-none scale-[0.98]" 
          : "border-slate-800/80 bg-slate-950/60 backdrop-blur-sm hover:border-orange-500/40 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_12px_40px_-12px_rgba(255,140,0,0.25),inset_0_0_12px_rgba(255,140,0,0.05)]"
      }`}
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Cursor Follow Light Overlay (Desktop Only) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
        style={{
          background: "radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.08), transparent 40%)",
        }}
      />

      {/* Hover glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none motion-reduce:transition-none z-0" />

      {/* Card Content */}
      <div className="relative p-6 flex flex-col items-center gap-4 z-10">
        {/* Avatar */}
        <motion.div 
          layoutId={`avatar-container-${member.id}`}
          className="relative h-28 w-28 rounded-2xl ring-2 ring-slate-800 group-hover:ring-orange-500/50 group-hover:shadow-[0_0_20px_rgba(255,140,0,0.15)] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-lg motion-reduce:transition-none"
        >
          {member.photo ? (
            <motion.div 
              layoutId={`avatar-img-${member.id}`}
              className="absolute inset-0"
            >
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="112px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </motion.div>
          ) : (
            <motion.span 
              layoutId={`avatar-initials-${member.id}`}
              className="text-2xl font-black text-orange-400/80 tracking-wider"
            >
              {member.initials}
            </motion.span>
          )}
          {/* Photo overlay on hover */}
          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition-colors duration-300 motion-reduce:transition-none" />
        </motion.div>

        {/* Role badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {getRoleIcon(member.role, "h-3 w-3")}
          {member.role}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-white tracking-tight text-center leading-tight">
          {member.name}
        </h3>

        {/* Branch */}
        <p className="text-xs text-slate-400 font-medium -mt-2">
          {member.branch} ({member.specialization})
        </p>

        {/* Bottom CTA */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase group-hover:text-orange-400 transition-colors duration-300 mt-auto pt-4 motion-reduce:transition-none">
          <span>Explore Profile</span>
          <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200 ease-out font-sans text-xs">
            →
          </span>
        </div>
      </div>
    </motion.button>
  );
}
