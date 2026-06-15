"use client";

import { motion } from "framer-motion";

export function InstitutionalSupport({ reducedMotion }: { reducedMotion: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative py-16 md:py-24 z-10 border-t border-slate-900/60 pb-12"
    >
      {/* Section Header */}
      <div className="max-w-4xl mx-auto mb-16 text-center md:text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4 animate-pulse">
          {"// BACKBONE OF INNOVATION"}
        </span>
        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Institutional{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
            Support.
          </span>
        </h3>
        <p className="text-slate-400 text-sm mt-3 max-w-xl">
          The AWS Student Builder Group is proudly supported by RIMT University and the Department of Research & Innovation (DRI) Lab, providing students with official sponsorship, infrastructure, and technical guidance.
        </p>
      </div>

      {/* Two Column Layout on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: RIMT University */}
        <motion.div
          variants={itemVariants}
          whileHover={reducedMotion ? {} : { y: -4, scale: 1.008 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#070b19]/65 p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
          style={{
            boxShadow: "0 0 0 1px rgba(255,140,0,0.02), 0 8px 30px rgba(0,0,0,0.3)",
          }}
        >
          {/* Subtle gradient highlights */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/[0.01] rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/[0.02] transition-colors duration-500" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none" />

          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors duration-300">
                RIMT University
              </h4>
              <div className="bg-white px-3 py-1.5 rounded shadow-sm border border-slate-800/10 flex-shrink-0">
                <img
                  src="/brand/rimt-university.jpg"
                  alt="RIMT University Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              RIMT University provides the core academic infrastructure, facilities support, and institutional backing for the AWS Student Builder Group. Operating under the university's support system allows our student leaders to utilize state-of-the-art computer centers, lecture theatres, and sandbox services, providing a platform to master cloud capabilities alongside their degree.
            </p>
          </div>
        </motion.div>

        {/* Card 2: DRI Lab */}
        <motion.div
          variants={itemVariants}
          whileHover={reducedMotion ? {} : { y: -4, scale: 1.008 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#070b19]/65 p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
          style={{
            boxShadow: "0 0 0 1px rgba(255,140,0,0.02), 0 8px 30px rgba(0,0,0,0.3)",
          }}
        >
          {/* Subtle gradient highlights */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/[0.01] rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/[0.02] transition-colors duration-500" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none" />

          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors duration-300">
                DRI Lab
              </h4>
              <div className="bg-[#0e1726]/85 border border-slate-800/60 p-1 rounded shadow-sm flex-shrink-0">
                <img
                  src="/brand/dri-lab.png"
                  alt="DRI Lab Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              The Department of Research & Innovation (DRI) Lab functions as the innovation hub and research partner of our community. By providing advanced project mentorship, high-performance compute resources, and experimental sandbox sandboxes, the DRI Lab enables our student builders to work on hands-on applications in Cloud Architecture, Internet of Things, and Generative AI.
            </p>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
