"use client";

import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, Heart } from "lucide-react";

interface ShowcaseCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  className: string;
  rotation: string;
  floatDelay: number;
  isCenter?: boolean;
}

function ShowcaseCard({
  imageSrc,
  title,
  subtitle,
  className,
  rotation,
  floatDelay,
  isCenter = false,
}: ShowcaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -6, 0],
      }}
      transition={{
        scale: { duration: 0.5 },
        opacity: { duration: 0.5 },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        },
      }}
      whileHover={{
        scale: 1.03,
        y: -4,
        transition: { duration: 0.3 },
      }}
      className={`absolute select-none pointer-events-auto group cursor-pointer overflow-hidden border border-orange-500/20 bg-slate-950/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 hover:border-orange-500/60 hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] ${className}`}
      style={{
        transform: `${rotation}`,
      }}
    >
      {/* Glossy sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

      {/* Card Image */}
      <div className="w-full h-full relative overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Shadow Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
      </div>

      {/* Card Info Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-20 text-left">
        <h4 className={`font-black text-white leading-tight ${isCenter ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm'}`}>
          {title}
        </h4>
        <p className={`font-bold text-orange-400 mt-0.5 tracking-wide ${isCenter ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}

export function MemoriesOrbitShowcase() {
  const images = {
    center: "/gallery/welcome-team.jpg",
    launch: "/gallery/launch-agenda.jpg",
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[450px] md:h-[520px] lg:h-[600px] max-w-[620px] flex items-center justify-center overflow-hidden z-10 select-none">
      {/* 1. Soft radial orange glow behind the composition */}
      <div className="absolute w-[220px] h-[220px] sm:w-[350px] sm:h-[350px] rounded-full bg-orange-600/10 blur-[80px] sm:blur-[120px] pointer-events-none z-0" />

      {/* 2. Floating Orange Star Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[
          { top: "12%", left: "85%", delay: 0.1, duration: 2.5 },
          { top: "25%", left: "15%", delay: 0.4, duration: 3.2 },
          { top: "45%", left: "78%", delay: 0.7, duration: 2.8 },
          { top: "68%", left: "22%", delay: 1.1, duration: 4.1 },
          { top: "85%", left: "60%", delay: 0.2, duration: 3.5 },
          { top: "18%", left: "40%", delay: 0.9, duration: 2.2 },
          { top: "55%", left: "88%", delay: 1.5, duration: 3.8 },
          { top: "72%", left: "9%",  delay: 0.5, duration: 2.9 },
          { top: "32%", left: "65%", delay: 1.2, duration: 3.3 },
          { top: "89%", left: "30%", delay: 0.8, duration: 4.5 },
          { top: "5%",  left: "50%", delay: 0.3, duration: 2.7 },
          { top: "94%", left: "80%", delay: 1.4, duration: 3.1 },
          { top: "40%", left: "5%",  delay: 0.6, duration: 2.4 },
          { top: "60%", left: "50%", delay: 1.0, duration: 3.6 },
          { top: "78%", left: "70%", delay: 1.3, duration: 3.9 }
        ].map((pt, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-orange-500/40 rounded-full"
            style={{
              top: pt.top,
              left: pt.left,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: pt.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pt.delay,
            }}
          />
        ))}
      </div>

      {/* 3. Outer Interactive / Animation Orbit Wrapper */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        
        {/* Orbit Path 1 (Inner Ellipse) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute border border-orange-500/15 rounded-full w-[260px] h-[140px] sm:w-[380px] sm:h-[180px] md:w-[480px] md:h-[220px]"
          style={{ transform: "rotate(-12deg)" }}
        />

        {/* Orbit Path 2 (Outer Ellipse) - Hidden on Mobile */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute border border-orange-500/10 rounded-full w-[360px] h-[180px] sm:w-[480px] sm:h-[240px] md:w-[580px] md:h-[280px] hidden sm:block"
          style={{ transform: "rotate(15deg)" }}
        />

        {/* 4. Glowing Floating Icons placed on path positions */}
        {/* Camera Icon - Top placement */}
        <motion.div
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] sm:top-[12%] md:top-[15%] left-[62%] -translate-x-1/2 p-2 sm:p-2.5 rounded-full border border-orange-500/30 bg-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.2)] pointer-events-auto"
        >
          <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 filter drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
        </motion.div>

        {/* ImageIcon - Right side placement - Hidden on Mobile */}
        <motion.div
          animate={{
            x: [0, 3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute right-[5%] sm:right-[7%] md:right-[10%] top-[40%] -translate-y-1/2 p-2 sm:p-2.5 rounded-full border border-orange-500/30 bg-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.2)] pointer-events-auto hidden sm:flex"
        >
          <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 filter drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
        </motion.div>

        {/* Heart Icon - Bottom center placement */}
        <motion.div
          animate={{
            y: [0, 3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[10%] sm:bottom-[12%] md:bottom-[15%] left-[45%] -translate-x-1/2 p-2 sm:p-2.5 rounded-full border border-orange-500/30 bg-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.2)] pointer-events-auto"
        >
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 filter drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
        </motion.div>

        {/* 5. Image Cards composition */}
        
        {/* CENTER CARD (Large Featured Card) */}
        <ShowcaseCard
          imageSrc={images.center}
          title="AWS Community Day"
          subtitle="RIMT University"
          className="w-[180px] h-[130px] sm:w-[260px] sm:h-[180px] md:w-[310px] md:h-[210px] z-30 rounded-[20px] sm:rounded-[24px] border-orange-500/30 shadow-[0_12px_48px_rgba(0,0,0,0.6)]"
          rotation="rotate(1.5deg)"
          floatDelay={0}
          isCenter={true}
        />

        {/* FLOATING CARD 1: TOP LEFT */}
        <ShowcaseCard
          imageSrc={images.launch}
          title="Workshop"
          subtitle="Hands-on Learning"
          className="top-[8%] left-[2%] sm:top-[12%] sm:left-[8%] md:top-[14%] md:left-[10%] w-[110px] h-[80px] sm:w-[160px] sm:h-[110px] md:w-[190px] md:h-[130px] z-20 rounded-xl sm:rounded-2xl"
          rotation="rotate(-6deg)"
          floatDelay={0.8}
        />

        {/* FLOATING CARD 2: TOP RIGHT - Hidden on Mobile */}
        <ShowcaseCard
          imageSrc={images.center}
          title="Meetup"
          subtitle="Growing Together"
          className="top-[6%] right-[2%] sm:top-[10%] sm:right-[6%] md:top-[12%] md:right-[8%] w-[110px] h-[80px] sm:w-[160px] sm:h-[110px] md:w-[190px] md:h-[130px] z-20 rounded-xl sm:rounded-2xl hidden sm:block"
          rotation="rotate(5deg)"
          floatDelay={1.4}
        />

        {/* FLOATING CARD 3: BOTTOM LEFT - Hidden on Mobile */}
        <ShowcaseCard
          imageSrc={images.launch}
          title="Tech Talk"
          subtitle="Expert Sessions"
          className="bottom-[8%] left-[4%] sm:bottom-[12%] sm:left-[10%] md:bottom-[14%] md:left-[12%] w-[110px] h-[80px] sm:w-[160px] sm:h-[110px] md:w-[190px] md:h-[130px] z-20 rounded-xl sm:rounded-2xl hidden sm:block"
          rotation="rotate(4deg)"
          floatDelay={2.2}
        />

        {/* FLOATING CARD 4: BOTTOM RIGHT */}
        <ShowcaseCard
          imageSrc={images.center}
          title="Achievements"
          subtitle="Milestones Earned"
          className="bottom-[6%] right-[4%] sm:bottom-[10%] sm:right-[8%] md:bottom-[12%] md:right-[10%] w-[110px] h-[80px] sm:w-[160px] sm:h-[110px] md:w-[190px] md:h-[130px] z-20 rounded-xl sm:rounded-2xl"
          rotation="rotate(-5deg)"
          floatDelay={2.8}
        />
      </div>
    </div>
  );
}
