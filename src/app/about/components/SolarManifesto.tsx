"use client";

import { motion } from "framer-motion";
import { Target, Compass } from "lucide-react";

export function SolarManifesto({ reducedMotion }: { reducedMotion: boolean }) {
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
    hidden: { opacity: 0, y: 30 },
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
      className="relative py-16 md:py-24 z-10"
    >
      {/* Background radial accent behind the section */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[500px] h-[500px] opacity-[0.03] blur-[60px]"
        style={{
          background: "radial-gradient(circle, #FF8C00 0%, transparent 70%)"
        }}
      />

      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.span 
          variants={itemVariants}
          className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4"
        >
          {"// THE MANIFESTO"}
        </motion.span>
        
        <motion.h2 
          variants={itemVariants}
          className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6"
        >
          Demystifying Cloud.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
            Igniting Builders.
          </span>
        </motion.h2>

        <motion.p 
          variants={itemVariants}
          className="text-slate-400 text-fluid-body leading-relaxed max-w-[65ch] mx-auto"
        >
          We are the AWS Student Builder Group at RIMT University. We believe that true learning 
          begins when you stop reading documentation and start deploying. We are a living 
          ecosystem where student builders assemble to shape the next era of cloud computing.
        </motion.p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Mission Card */}
        <motion.div
          variants={itemVariants}
          whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
          className="group relative rounded-2xl border border-slate-800/80 bg-[#070b19]/60 backdrop-blur-md p-8 overflow-hidden transition-all duration-300"
          style={{
            boxShadow: "0 0 0 1px rgba(255,140,0,0.02), 0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
          
          <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Our Mission</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-[65ch]">
                To bridge the gap between academic theory and modern cloud engineering. We supply the 
                resources, sandbox workshops, and mentorship needed to build production-grade web 
                infrastructures, Generative AI pipelines, and secure cloud endpoints.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vision Card */}
        <motion.div
          variants={itemVariants}
          whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
          className="group relative rounded-2xl border border-slate-800/80 bg-[#070b19]/60 backdrop-blur-md p-8 overflow-hidden transition-all duration-300"
          style={{
            boxShadow: "0 0 0 1px rgba(255,140,0,0.02), 0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
          
          <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Our Vision</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-[65ch]">
                To establish RIMT University as a central hub of cloud technology excellence in Punjab. 
                We nurture a collaborative network of certified practitioners, serverless developers, 
                and ML researchers who leverage cloud architectures to resolve critical real-world challenges.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
