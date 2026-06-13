"use client";

import { Mail, MapPin, Clock, Zap, Cloud, Users, Calendar, HelpCircle, Handshake } from "lucide-react";
import { motion } from "framer-motion";

import { useReducedMotion } from "./hooks/useReducedMotion";
import { FloatingParticles } from "./components/FloatingParticles";
import { RadarCircles } from "./components/RadarCircles";
import { WireframeGlobe } from "./components/WireframeGlobe";
import { StatCard } from "./components/StatCard";
import { ContactCard } from "./components/ContactCard";
import { SocialHub } from "./components/SocialHub";
import { CollabCard } from "./components/CollabCard";

const scrollContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const scrollItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function ContactPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-hidden py-16 md:py-24 text-slate-300">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px] animate-pulse-slow pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-500/5 blur-[120px] animate-pulse-slow pointer-events-none z-0" />

      {/* Futuristic Background elements */}
      {!reducedMotion && <RadarCircles />}
      {!reducedMotion && <FloatingParticles count={12} />}
      {!reducedMotion && <WireframeGlobe />}

      <motion.div
        variants={scrollContainerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10 space-y-16"
      >
        {/* ================================================= */}
        {/* HERO SECTION                                      */}
        {/* ================================================= */}
        <motion.div 
          variants={scrollItemVariants} 
          className="text-left max-w-4xl space-y-4"
        >
          {/* Small badge */}
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block">
            {"// GET IN TOUCH"}
          </span>
          
          {/* Large heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
            Let&apos;s Build Something<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
              Extraordinary Together.
            </span>
          </h1>
          
          {/* Supporting text */}
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
            Questions, ideas, collaborations, workshops, partnerships, or speaking opportunities — our team is always ready to connect and build.
          </p>

          {/* Staggered Compact Stat Cards */}
          <motion.div 
            variants={scrollContainerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 max-w-3xl"
          >
            <StatCard
              variants={scrollItemVariants}
              icon={<Zap className="h-4 w-4" />}
              label="Response Time"
              value="Usually within 24 hours"
            />
            <StatCard
              variants={scrollItemVariants}
              icon={<Cloud className="h-4 w-4" />}
              label="Builder Community"
              value="Growing every day"
            />
            <StatCard
              variants={scrollItemVariants}
              icon={<Users className="h-4 w-4" />}
              label="Open for Collaboration"
              value="Events • Workshops • Partnerships"
            />
          </motion.div>
        </motion.div>

        {/* ================================================= */}
        {/* MAIN SECTION                                      */}
        {/* ================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column - Contact Info stacked */}
          <motion.div 
            variants={scrollItemVariants}
            className="lg:col-span-5 relative flex flex-col gap-6 w-full"
          >
            {/* Vertically stacked cards */}
            <div className="relative flex flex-col gap-6 z-10 w-full pl-0 lg:pl-20">
              
              {/* Vertical Spine Line */}
              <div className="absolute left-[24px] top-[50px] bottom-[50px] w-[1px] bg-orange-500/20 pointer-events-none z-0 hidden lg:block">
                {/* Animated signal dot */}
                <div className="absolute left-[-2px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-[signal_6s_linear_infinite]" />
              </div>

              {/* Card 1 */}
              <div className="relative flex items-center w-full">
                {/* Horizontal Connector */}
                <div className="absolute left-[24px] w-[56px] h-px bg-orange-500/20 hidden lg:block pointer-events-none z-0">
                  {/* Left node */}
                  <div className="absolute left-[-4px] top-[-4px] w-2 h-2 rounded-full bg-orange-500 border border-[#050816] shadow-[0_0_6px_#ff8c00]" />
                  {/* Right node */}
                  <div className="absolute right-[-4px] top-[-4px] w-2 h-2 rounded-full bg-orange-500 border border-[#050816] shadow-[0_0_6px_#ff8c00]" />
                </div>
                
                <ContactCard
                  icon={<Mail className="h-5 w-5" />}
                  title="Email Us"
                  subtitle="Drop us a message anytime."
                  value="awsbuild@rimt.ac.in"
                  href="mailto:awsbuild@rimt.ac.in"
                />
              </div>

              {/* Card 2 */}
              <div className="relative flex items-center w-full">
                {/* Horizontal Connector */}
                <div className="absolute left-[24px] w-[56px] h-px bg-orange-500/20 hidden lg:block pointer-events-none z-0">
                  {/* Left node */}
                  <div className="absolute left-[-4px] top-[-4px] w-2 h-2 rounded-full bg-orange-500 border border-[#050816] shadow-[0_0_6px_#ff8c00]" />
                  {/* Right node */}
                  <div className="absolute right-[-4px] top-[-4px] w-2 h-2 rounded-full bg-orange-500 border border-[#050816] shadow-[0_0_6px_#ff8c00]" />
                </div>

                <ContactCard
                  icon={<MapPin className="h-5 w-5" />}
                  title="Visit Us"
                  subtitle="Building cloud leaders on campus."
                  value="RIMT University, Punjab, India"
                  href="https://maps.google.com/?q=RIMT+University"
                />
              </div>

              {/* Card 3 */}
              <div className="relative flex items-center w-full">
                {/* Horizontal Connector */}
                <div className="absolute left-[24px] w-[56px] h-px bg-orange-500/20 hidden lg:block pointer-events-none z-0">
                  {/* Left node */}
                  <div className="absolute left-[-4px] top-[-4px] w-2 h-2 rounded-full bg-orange-500 border border-[#050816] shadow-[0_0_6px_#ff8c00]" />
                  {/* Right node */}
                  <div className="absolute right-[-4px] top-[-4px] w-2 h-2 rounded-full bg-orange-500 border border-[#050816] shadow-[0_0_6px_#ff8c00]" />
                </div>

                <ContactCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Response Time"
                  subtitle="We usually respond within"
                  value="24–48 hours"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column - Connect With Us Social Hub */}
          <motion.div 
            variants={scrollItemVariants}
            className="lg:col-span-7 flex w-full"
          >
            <SocialHub />
          </motion.div>

        </div>

        {/* ================================================= */}
        {/* BOTTOM SECTION                                    */}
        {/* ================================================= */}
        <motion.div 
          variants={scrollItemVariants}
          className="space-y-6 pt-8 border-t border-slate-900/60"
        >
          <div className="text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-3">
              {"// COLLABORATE"}
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">Collaboration Channels</h3>
            <p className="text-slate-500 text-xs mt-1">Select a track below to start your builder engagement.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CollabCard
              icon={<Handshake className="h-5 w-5" />}
              title="Partnerships"
              description="Interested in building together? Connect with our team to co-host events or develop academic cloud tracks."
              ctaText="Let's Talk"
              href="mailto:awsbuild@rimt.ac.in?subject=Partnership%20Inquiry"
            />
            <CollabCard
              icon={<Calendar className="h-5 w-5" />}
              title="Events & Workshops"
              description="Want us at your event? Invite our core technical leads or members to hold hands-on cloud learning sessions."
              ctaText="Invite Us"
              href="mailto:awsbuild@rimt.ac.in?subject=Event%20Invitation"
            />
            <CollabCard
              icon={<HelpCircle className="h-5 w-5" />}
              title="General Inquiries"
              description="Have questions? Access general resources, get chapter clarifications, or ask about general student registration rules."
              ctaText="Reach Out"
              href="mailto:awsbuild@rimt.ac.in?subject=General%20Inquiry"
            />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
