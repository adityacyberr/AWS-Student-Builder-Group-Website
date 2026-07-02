"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { TeamMember } from "@/data/team";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  GitPullRequest,
  DollarSign,
  Megaphone,
  Calendar,
  Camera,
  User,
  Quote,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const getRoleIcon = (role: string, className = "h-5 w-5") => {
  switch (role) {
    case "Group Leader": return <Terminal className={className} />;
    case "Technical Head": return <GitPullRequest className={className} />;
    case "Treasurer": return <DollarSign className={className} />;
    case "Marketing Head": return <Megaphone className={className} />;
    case "Event Head": return <Calendar className={className} />;
    case "Director of Photography": return <Camera className={className} />;
    default: return <User className={className} />;
  }
};

const getRoleShortName = (role: string) => {
  switch (role) {
    case "Director of Photography": return "Photography Head";
    default: return role;
  }
};

const getRoleSubtitle = (role: string) => {
  switch (role) {
    case "Group Leader": return "Vision & Direction";
    case "Technical Head": return "Tech & Innovation";
    case "Marketing Head": return "Outreach & Branding";
    case "Event Head": return "Events & Engagement";
    case "Director of Photography": return "Moments & Stories";
    case "Treasurer": return "Finance & Resources";
    default: return "";
  }
};

interface OrbitStrengthSectionProps {
  members: TeamMember[];
  reducedMotion: boolean;
}

export function OrbitStrengthSection({ members, reducedMotion }: OrbitStrengthSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isStickyEnabled = false;

  const handleCardClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % members.length);
  }, [members.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + members.length) % members.length);
  }, [members.length]);

  useEffect(() => {
    if (buttonRefs.current[activeIndex]) {
      buttonRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  if (members.length === 0) return null;

  const activeMember = members[activeIndex];

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      style={{ height: isStickyEnabled ? "320vh" : "auto" }}
    >
      <div className={isStickyEnabled ? "sticky top-20 min-h-[calc(100vh-80px)] flex flex-col justify-center py-6 overflow-hidden" : "relative py-12 md:py-24"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mb-8 items-end">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4">
              {"// OUR ORBIT. OUR STRENGTH"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Different Orbits.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_15px_rgba(255,140,0,0.2)]">
                One Solar Core.
              </span>
            </h2>
          </div>
          <div>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Each member brings unique strengths, ideas, and energy to fuel our mission and community.
            </p>
          </div>
        </div>

        <div className="relative mb-10">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent -translate-y-1/2 pointer-events-none" />
          <div className="flex overflow-x-auto md:grid md:grid-cols-6 gap-3 md:gap-4 relative z-10 scrollbar-none pb-3 pt-1 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
            {members.map((member, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={member.id}
                  ref={(el) => { buttonRefs.current[i] = el; }}
                  onClick={() => handleCardClick(i)}
                  className={`group relative flex flex-col items-center gap-2 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0 w-[140px] md:w-auto snap-center ${
                    isActive
                      ? "bg-orange-500/10 border-orange-500 shadow-[0_0_25px_rgba(255,140,0,0.25)] -translate-y-1 scale-[1.02]"
                      : "bg-slate-950/60 border-slate-800/60 hover:border-orange-500/20 hover:bg-slate-900/40 hover:-translate-y-0.5"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(255,140,0,0.15)]"
                        : "bg-slate-900/60 text-slate-500 group-hover:text-orange-400/60"
                    }`}
                  >
                    {getRoleIcon(member.role)}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight transition-colors ${
                      isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {getRoleShortName(member.role)}
                  </span>
                  <span
                    className={`text-[8px] sm:text-[9px] text-center leading-tight transition-colors ${
                      isActive ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {getRoleSubtitle(member.role)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="orbit-active-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,140,0,0.5)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMember.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl border border-slate-800/70 bg-[#0a0f1e]/85 backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,140,0,0.06),0_20px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[150, 250, 350].map((size, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-orange-500/[0.03]"
                    style={{
                      width: size,
                      height: size,
                      right: -size / 3,
                      top: "50%",
                      marginTop: -size / 2,
                      animation: reducedMotion ? "none" : `orbit-bg ${25 + i * 12}s linear infinite`,
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 p-5 sm:p-8 lg:p-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div
                      key={`orbit-pulse-${activeMember.id}`}
                      className="absolute -inset-4 rounded-full pointer-events-none"
                      style={{
                        animation: "orbit-pulse-once 0.8s ease-out forwards"
                      }}
                    >
                      {!reducedMotion && (
                        <div
                          className="w-full h-full rounded-full border border-orange-500/15"
                          style={{ animation: "orbit-bg 10s linear infinite" }}
                        >
                          <div
                            className="absolute rounded-full bg-orange-400"
                            style={{
                              width: 5,
                              height: 5,
                              top: -2.5,
                              left: "50%",
                              marginLeft: -2.5,
                              boxShadow: "0 0 8px rgba(255,140,0,0.5)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-[-10px] rounded-full bg-orange-500/10 blur-2xl pointer-events-none animate-pulse" />
                    {!reducedMotion && [1, 2, 3, 4].map((id) => (
                      <div
                        key={`particle-${activeMember.id}-${id}`}
                        className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 pointer-events-none"
                        style={{
                          left: "50%",
                          top: "50%",
                          boxShadow: "0 0 8px rgba(255, 140, 0, 0.8)",
                          animation: `particle-orbit-${id} ${4 + id * 1.5}s linear infinite`,
                          animationDelay: `${id * -0.7}s`,
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 rounded-full bg-orange-500/8 blur-xl pointer-events-none" />
                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-orange-500/25 shadow-[0_0_25px_rgba(255,140,0,0.12)]">
                      {activeMember.photo ? (
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: 1.05 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="relative w-full h-full"
                        >
                          <Image
                            src={activeMember.photo}
                            alt={activeMember.name}
                            fill
                            sizes="(max-width: 640px) 112px, 160px"
                            priority
                            className="object-cover"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <span className="text-3xl font-black text-orange-400/80">
                            {activeMember.initials}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={goPrev}
                        className="p-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        aria-label="Previous member"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                        {String(activeIndex + 1).padStart(2, '0')} / {String(members.length).padStart(2, '0')}
                      </span>
                      <button
                        onClick={goNext}
                        className="p-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        aria-label="Next member"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {members.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            idx <= activeIndex
                              ? "bg-orange-500 shadow-[0_0_8px_rgba(255,140,0,0.6)]"
                              : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {getRoleIcon(activeMember.role, "h-3 w-3")}
                      {activeMember.role}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {activeMember.name}
                  </h3>
                  <div className="relative bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-4">
                    <Quote className="absolute top-3 left-3 h-4 w-4 text-orange-500/30" />
                    <motion.p
                      key={`quote-anim-${activeMember.id}`}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.03,
                          },
                        },
                      }}
                      className="text-sm text-slate-200 italic leading-relaxed pl-6"
                    >
                      &ldquo;
                      {activeMember.quote.split(" ").map((word, wordIdx) => (
                        <motion.span
                          key={wordIdx}
                          variants={{
                            hidden: { opacity: 0, y: 5 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
                          }}
                          className="inline-block mr-1.5"
                        >
                          {word}
                        </motion.span>
                      ))}
                      &rdquo;
                    </motion.p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {activeMember.bio}
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-400/70">
                      Focus Areas
                    </h4>
                    <motion.div
                      key={`focus-anim-${activeMember.id}`}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.06,
                            delayChildren: 0.15,
                          },
                        },
                      }}
                      className="flex flex-wrap gap-2"
                    >
                      {activeMember.focusAreas.map((area) => (
                        <motion.span
                          key={area}
                          variants={{
                            hidden: { opacity: 0, scale: 0.85, x: -10 },
                            visible: {
                              opacity: 1,
                              scale: 1,
                              x: 0,
                              transition: {
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              },
                            },
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-300 transition-all cursor-default"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                          {area}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mr-1">Connect</span>
                    {activeMember.linkedin && activeMember.linkedin !== "javascript:void(0)" && (
                      <a
                        href={activeMember.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                      >
                        <LinkedInIcon className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                        <span className="text-xs">LinkedIn</span>
                      </a>
                    )}
                    {activeMember.github && activeMember.github !== "javascript:void(0)" && (
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                      >
                        <GitHubIcon className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                        <span className="text-xs">GitHub</span>
                      </a>
                    )}
                    <a
                      href={`mailto:awsbuild@rimt.ac.in?subject=Reaching%20out%20to%20${encodeURIComponent(activeMember.name)}`}
                      className="group/link inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/35 transition-all"
                    >
                      <Mail className="h-4 w-4 text-orange-400 group-hover/link:text-orange-300 transition-colors" />
                      <span className="text-xs">Email</span>
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-[9px] font-mono text-slate-700 text-center pb-4 uppercase tracking-widest">
                {isStickyEnabled ? "Scroll page or click cards to explore" : "Click cards to explore"}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit-bg {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-pulse-once {
          0% {
            transform: scale(1);
            border-color: rgba(255, 140, 0, 0.15);
            box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
          }
          50% {
            transform: scale(1.08);
            border-color: rgba(255, 140, 0, 0.6);
            box-shadow: 0 0 15px 2px rgba(255, 140, 0, 0.25);
          }
          100% {
            transform: scale(1);
            border-color: rgba(255, 140, 0, 0.15);
            box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
          }
        }
        @keyframes particle-orbit-1 {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(70px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(70px) rotate(-360deg); opacity: 0; }
        }
        @keyframes particle-orbit-2 {
          0% { transform: translate(-50%, -50%) rotate(120deg) translateY(85px) rotate(-120deg); opacity: 0; }
          15% { opacity: 0.7; }
          85% { opacity: 0.7; }
          100% { transform: translate(-50%, -50%) rotate(480deg) translateY(85px) rotate(-480deg); opacity: 0; }
        }
        @keyframes particle-orbit-3 {
          0% { transform: translate(-50%, -50%) rotate(240deg) translateX(80px) rotate(-240deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translate(-50%, -50%) rotate(600deg) translateX(80px) rotate(-600deg); opacity: 0; }
        }
        @keyframes particle-orbit-4 {
          0% { transform: translate(-50%, -50%) rotate(60deg) translateY(-75px) rotate(-60deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) rotate(420deg) translateY(-75px) rotate(-420deg); opacity: 0; }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
