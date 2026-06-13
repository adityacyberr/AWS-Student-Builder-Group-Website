"use client";

import { motion } from "framer-motion";
import { ShieldCheck, GraduationCap, Layers, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AcademicIntegration({ reducedMotion }: { reducedMotion: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
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
      {/* Title */}
      <div className="max-w-4xl mx-auto mb-16 text-center md:text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-4">
          {"// ACADEMIC SYSTEM"}
        </span>
        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Sponsorship & Institutional{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
            Orbit.
          </span>
        </h3>
        <p className="text-slate-400 text-sm mt-3 max-w-xl">
          The AWS Student Builder Group operates as an approved academic entity, drawing support from 
          leading curriculum resources and department mentors.
        </p>
      </div>

      {/* Main CSE Sponsor Highlight */}
      <motion.div
        variants={itemVariants}
        whileHover={reducedMotion ? {} : { scale: 1.005 }}
        className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#070b19]/65 p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-12"
        style={{
          boxShadow: "0 0 0 1px rgba(255,140,0,0.02), 0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        {/* Subtle orange mesh highlight on hover */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/[0.01] rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/[0.02] transition-colors duration-500" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <ShieldCheck className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">
                Department of Computer Science & Engineering (CSE)
              </h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              We operate officially under the guidance of the **Department of CSE** at RIMT University. 
              This official endorsement allows our student community to secure exclusive access to technical seminars, 
              institutional classrooms, academic credits mapping, and sponsored sandbox platforms.
            </p>
          </div>
          
          <div className="pt-2 md:pt-0 self-stretch md:self-auto flex items-center">
            <Link 
              href="/team" 
              className="w-full md:w-auto text-center justify-center inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-orange-500/30 bg-orange-500/5 text-xs text-orange-400 font-bold uppercase tracking-wider hover:bg-orange-500/15 hover:text-white hover:border-orange-500/50 transition-all duration-300"
            >
              Meet Our Leadership
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 3 Pillars of Academic Integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "AWS Academy Curriculum",
            icon: GraduationCap,
            description: "Our training modules, study circles, and bootcamps are structured to align directly with official AWS Academy frameworks, preparing students to take CCP and SAA certifications.",
          },
          {
            title: "Hands-on Sandbox Labs",
            icon: Layers,
            description: "We configure learning instances in restricted sandbox platforms. Students practice with live EC2, S3, and RDS setups in a structured environment without bill shocks.",
          },
          {
            title: "GenAI Innovation Hub",
            icon: Cpu,
            description: "We explore the frontier of AI application development. Leveraging Amazon Bedrock API tokens and PartyRock sandboxes, students assemble custom AI models and playground bots.",
          },
        ].map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
              className="group relative rounded-2xl border border-slate-800/80 bg-[#070b19]/60 p-6 overflow-hidden transition-all duration-300"
              style={{
                boxShadow: "0 0 0 1px rgba(255,140,0,0.01), 0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent" />
              
              <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15 text-orange-500/80 w-fit mb-4 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 group-hover:text-orange-400 transition-all duration-300">
                <ItemIcon className="h-5 w-5" />
              </div>
              
              <h5 className="text-sm font-bold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors duration-300">
                {index + 1}. {item.title}
              </h5>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
