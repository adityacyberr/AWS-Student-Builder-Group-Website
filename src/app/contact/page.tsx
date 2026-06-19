"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowUpRight, Users, Wrench, Rocket } from "lucide-react";

// Animation Variants
const fadinVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden text-slate-350 select-none pb-24">
      {/* ── BACKGROUND GLOWS AND CONCENTRIC ORBITS ───────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-full w-full bg-grid-pattern opacity-[0.05] pointer-events-none z-0" />
      
      {/* Background Orbits */}
      <svg className="absolute -top-40 -left-40 w-[600px] h-[600px] text-zinc-900/10 pointer-events-none z-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 1" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" />
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 1" />
      </svg>
      <svg className="absolute top-1/2 -right-40 w-[800px] h-[800px] text-zinc-900/10 pointer-events-none z-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.08" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.08" strokeDasharray="1 1" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.08" />
      </svg>

      {/* Radial Orange Accent Glows */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-[35rem] w-[35rem] rounded-full bg-orange-500/[0.03] blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[50%] left-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-500/[0.02] blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-10 h-[30rem] w-[30rem] rounded-full bg-orange-500/[0.03] blur-[120px] pointer-events-none z-0" />

      {/* Faint Stars / Particles */}
      <div className="absolute top-24 left-[15%] w-1.5 h-1.5 bg-orange-400/30 rounded-full blur-[1px] animate-pulse" />
      <div className="absolute top-[35%] right-[20%] w-1 h-1 bg-white/20 rounded-full animate-pulse" />
      <div className="absolute bottom-[40%] left-[8%] w-1 h-1 bg-orange-300/40 rounded-full animate-pulse" />
      <div className="absolute bottom-[25%] right-[15%] w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse" />

      {/* ── CONTENT CONTAINER ────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 space-y-16">
        
        {/* ── SECTION 1: HERO SECTION ───────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadinVariants}
          className="text-center space-y-5 max-w-3xl mx-auto"
        >
          {/* Badge */}
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3.5 py-1.5 rounded-full inline-block">
            {"// GET IN TOUCH"}
          </span>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black text-white leading-[1.08] tracking-tight">
            Let's Build Something<br />
            Amazing <span className="text-[#FF9900] filter drop-shadow-[0_0_25px_rgba(255,153,0,0.2)]">Together</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
            Have questions, ideas, or want to collaborate?<br />
            We're always excited to connect with fellow builders, innovators, and cloud enthusiasts.
          </p>
        </motion.div>

        {/* ── SECTION 2: INFORMATION CARDS ROW ──────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Card 1 — Email */}
          <motion.div
            variants={fadinVariants}
            className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-6 flex flex-col justify-between hover:border-orange-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_30px_rgba(255,153,0,0.04)] backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_15px_rgba(255,153,0,0.08)]">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Email Us</h3>
                <p className="text-[11px] text-zinc-555 font-medium">Drop us a message</p>
              </div>
            </div>
            <a
              href="mailto:sbg.rimt@gmail.com"
              className="text-[11px] sm:text-xs font-bold text-[#FF9900] hover:underline mt-4 break-words"
            >
              sbg.rimt@gmail.com
            </a>
          </motion.div>

          {/* Card 2 — Phone */}
          <motion.div
            variants={fadinVariants}
            className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-6 flex flex-col justify-between hover:border-orange-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_30px_rgba(255,153,0,0.04)] backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_15px_rgba(255,153,0,0.08)]">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Call Us</h3>
                <p className="text-[11px] text-zinc-555 font-medium">Mon – Sat, 10AM – 6PM</p>
              </div>
            </div>
            <a
              href="tel:+919416773013"
              className="text-[11px] sm:text-xs font-bold text-[#FF9900] hover:underline mt-4"
            >
              +91 94167 73013
            </a>
          </motion.div>

          {/* Card 3 — Visit */}
          <motion.div
            variants={fadinVariants}
            className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-6 flex flex-col justify-between hover:border-orange-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_30px_rgba(255,153,0,0.04)] backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_15px_rgba(255,153,0,0.08)]">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Visit Us</h3>
                <p className="text-[11px] text-zinc-555 font-medium">RIMT University, Punjab</p>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#FF9900] mt-4">
              Mandi Gobindgarh, 147301
            </span>
          </motion.div>

          {/* Card 4 — Response Time */}
          <motion.div
            variants={fadinVariants}
            className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-6 flex flex-col justify-between hover:border-orange-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_30px_rgba(255,153,0,0.04)] backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_15px_rgba(255,153,0,0.08)]">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Response Time</h3>
                <p className="text-[11px] text-zinc-555 font-medium">We usually respond within</p>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#FF9900] mt-4">
              24 – 48 Hours
            </span>
          </motion.div>
        </motion.div>

        {/* ── SECTION 3: TWO COLUMN SHOWCASE SECTION ────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadinVariants}
          className="rounded-3xl border border-zinc-900 bg-zinc-950/25 p-6 md:p-8 lg:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
        >
          {/* Left Column — Find Us Here / Google Map */}
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#FF9900]">
                <MapPin className="h-4.5 w-4.5" />
                <h2 className="text-base sm:text-lg font-black text-white">Find Us Here</h2>
              </div>
              <p className="text-zinc-555 text-[11px] sm:text-xs font-medium">RIMT University, Punjab, India</p>
            </div>
            
            {/* Interactive Map Image */}
            <div className="w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden border border-zinc-900/60 shadow-[0_4px_25px_rgba(0,0,0,0.3)] bg-zinc-900 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/map.png"
                alt="RIMT University Campus Map"
                className="w-full h-full object-cover"
                style={{
                  filter: "invert(90%) hue-rotate(180deg) brightness(90%) contrast(90%) opacity(0.85)",
                }}
              />
            </div>

            {/* Google Maps link button */}
            <a
              href="https://maps.google.com/?q=RIMT+University"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-zinc-800 text-[10px] sm:text-xs font-black text-zinc-100 bg-zinc-950/80 hover:bg-zinc-900 hover:border-orange-500/20 hover:text-[#FF9900] hover:shadow-[0_0_15px_rgba(255,153,0,0.08)] transition-all cursor-pointer"
            >
              📍 Open in Google Maps
            </a>
          </div>

          {/* Right Column — Visit Our Campus */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-white">Visit Our Campus</h2>
              <p className="text-zinc-555 text-[11px] sm:text-xs font-medium">We'd love to meet you!</p>
            </div>

            {/* Campus Image */}
            <div className="relative w-full h-[160px] sm:h-[200px] rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950 shadow-[0_0_20px_rgba(255,153,0,0.05)] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/campus.png"
                alt="RIMT University Campus"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Feature Rows */}
            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex gap-4 items-start group">
                <div className="w-8 h-8 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_10px_rgba(255,153,0,0.05)] flex-shrink-0">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 border-b border-zinc-900/60 pb-3 flex-grow transition-colors group-hover:border-zinc-800">
                  <h4 className="text-xs font-bold text-white">Vibrant Community</h4>
                  <p className="text-[10px] text-zinc-555 font-medium">Be part of a passionate cloud community.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 items-start group">
                <div className="w-8 h-8 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_10px_rgba(255,153,0,0.05)] flex-shrink-0">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 border-b border-zinc-900/60 pb-3 flex-grow transition-colors group-hover:border-zinc-800">
                  <h4 className="text-xs font-bold text-white">Hands-on Learning</h4>
                  <p className="text-[10px] text-zinc-555 font-medium">Workshops, events & real-world projects.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 items-start group">
                <div className="w-8 h-8 rounded-full bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all shadow-[0_0_10px_rgba(255,153,0,0.05)] flex-shrink-0">
                  <Rocket className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 pb-1 flex-grow">
                  <h4 className="text-xs font-bold text-white">Endless Opportunities</h4>
                  <p className="text-[10px] text-zinc-555 font-medium">Collaborate, innovate and grow together.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 4: SOCIAL CONNECT SECTION ─────────────────────────── */}
        <div className="space-y-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadinVariants}
            className="space-y-2"
          >
            <h2 className="text-xl sm:text-2xl font-black text-white">Connect With Us</h2>
            <p className="text-zinc-500 text-xs font-medium">Follow our journey and stay updated on events, workshops, and more.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/aws-sbg-rimt-university"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-5 flex items-center justify-between hover:border-orange-500/35 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_rgba(255,153,0,0.03)] backdrop-blur-md cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] shadow-[0_0_12px_rgba(10,102,194,0.15)] group-hover:shadow-[0_0_22px_rgba(10,102,194,0.45)] group-hover:border-[#0A66C2]/45 flex items-center justify-center transition-all duration-300 backdrop-blur-md">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-[1.08]" viewBox="0 0 24 24">
                    {/* Official Blue Background Square */}
                    <rect width="24" height="24" rx="4" fill="#0A66C2" />
                    {/* Official White 'in' Text */}
                    <path fill="#FFFFFF" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                  </svg>
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-bold text-white">LinkedIn</h4>
                  <p className="text-[10px] text-zinc-550 font-medium">Connect with us</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-zinc-650 group-hover:text-[#FF9900] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/aws.sbg.rimt"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-5 flex items-center justify-between hover:border-orange-500/35 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_rgba(255,153,0,0.03)] backdrop-blur-md cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 shadow-[0_0_12px_rgba(225,48,108,0.15)] group-hover:shadow-[0_0_22px_rgba(225,48,108,0.45)] group-hover:border-[#E1306C]/45 flex items-center justify-center transition-all duration-300 backdrop-blur-md">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-[1.08]" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Instagram</h4>
                  <p className="text-[10px] text-zinc-550 font-medium">Follow updates & stories</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-zinc-650 group-hover:text-[#FF9900] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>

            {/* Meetup */}
            <a
              href="https://www.meetup.com/aws-sbg-at-rimt-university"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-5 flex items-center justify-between hover:border-orange-500/35 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_rgba(255,153,0,0.03)] backdrop-blur-md cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#F64060]/10 border border-[#F64060]/20 text-[#F64060] shadow-[0_0_12px_rgba(246,64,96,0.15)] group-hover:shadow-[0_0_22px_rgba(246,64,96,0.45)] group-hover:border-[#F64060]/45 flex items-center justify-center transition-all duration-300 backdrop-blur-md">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-[1.08]" viewBox="0 0 24 24">
                    {/* White backing for the lowercase 'm' cutout */}
                    <rect x="7" y="7.5" width="10" height="9" rx="2" fill="#FFFFFF" />
                    {/* Official Red Swarm/Cloud SVG path */}
                    <path fill="#F64060" d="M6.98.555a.518.518 0 0 0-.105.011.53.53 0 1 0 .222 1.04.533.533 0 0 0 .409-.633.531.531 0 0 0-.526-.418zm6.455.638a.984.984 0 0 0-.514.143.99.99 0 1 0 1.02 1.699.99.99 0 0 0 .34-1.36.992.992 0 0 0-.846-.482zm-3.03 2.236a5.029 5.029 0 0 0-4.668 3.248 3.33 3.33 0 0 0-1.46.551 3.374 3.374 0 0 0-.94 4.562 3.634 3.634 0 0 0-.605 4.649 3.603 3.603 0 0 0 2.465 1.597c.018.732.238 1.466.686 2.114a3.9 3.9 0 0 0 5.423.992c.068-.047.12-.106.184-.157.987.881 2.47 1.026 3.607.24a2.91 2.91 0 0 0 1.162-1.69 4.238 4.238 0 0 0 2.584-.739 4.274 4.274 0 0 0 1.19-5.789 2.466 2.466 0 0 0 .433-3.308 2.448 2.448 0 0 0-1.316-.934 4.436 4.436 0 0 0-.776-2.873 4.467 4.467 0 0 0-5.195-1.656 5.106 5.106 0 0 0-2.773-.807zm-5.603.817a.759.759 0 0 0-.423.135.758.758 0 1 0 .863 1.248.757.757 0 0 0 .193-1.055.758.758 0 0 0-.633-.328zm15.994 2.37a.842.842 0 0 0-.47.151.845.845 0 1 0 1.175.215.845.845 0 0 0-.705-.365zm-8.15 1.028c.063 0 .124.005.182.014a.901.901 0 0 1 .45.187c.169.134.273.241.432.393.24.227.414.089.534.02.208-.122.369-.219.984-.208.633.011 1.363.237 1.514 1.317.168 1.199-1.966 4.289-1.817 5.722.106 1.01 1.815.299 1.96 1.22.186 1.198-2.136.753-2.667.493-.832-.408-1.337-1.34-1.12-2.26.16-.688 1.7-3.498 1.757-3.93.059-.44-.177-.476-.324-.484-.19-.01-.34.081-.526.362-.169.255-2.082 4.085-2.248 4.398-.296.56-.67.694-1.044.674-.548-.029-.798-.32-.72-.848.047-.31 1.26-3.049 1.323-3.476.039-.265-.013-.546-.275-.68-.263-.135-.572.07-.664.227-.128.215-1.848 4.706-2.032 5.038-.316.576-.65.76-1.152.784-1.186.056-2.065-.92-1.678-2.116.173-.532 1.316-4.571 1.895-5.599.389-.69 1.468-1.216 2.217-.892.387.167.925.437 1.084.507.366.163.759-.277.913-.412.155-.134.302-.276.49-.357.142-.06.343-.095.532-.094zm10.88 2.057a.468.468 0 0 0-.093.011.467.467 0 0 0-.36.555.47.47 0 0 0 .557.36.47.47 0 0 0 .36-.557.47.47 0 0 0-.464-.37zm-22.518.81a.997.997 0 0 0-.832.434 1 1 0 1 0 1.39-.258 1 1 0 0 0-.558-.176zm21.294 2.094a.635.635 0 0 0-.127.013.627.627 0 0 0-.48.746.628.628 0 0 0 .746.483.628.628 0 0 0 .482-.746.63.63 0 0 0-.621-.496zm-18.24 6.097a.453.453 0 0 0-.092.012.464.464 0 1 0 .195.908.464.464 0 0 0 .356-.553.465.465 0 0 0-.459-.367zm13.675 1.55a1.044 1.044 0 0 0-.583.187 1.047 1.047 0 1 0 1.456.265 1.044 1.044 0 0 0-.873-.451zM11.4 22.154a.643.643 0 0 0-.36.115.646.646 0 0 0-.164.899.646.646 0 0 0 .899.164.646.646 0 0 0 .164-.898.646.646 0 0 0-.54-.28z"/>
                  </svg>
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Meetup</h4>
                  <p className="text-[10px] text-zinc-550 font-medium">Join our community</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-zinc-650 group-hover:text-[#FF9900] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>

            {/* Email Us */}
            <a
              href="mailto:sbg.rimt@gmail.com"
              className="group relative rounded-2xl bg-zinc-950/40 border border-zinc-900 p-5 flex items-center justify-between hover:border-orange-500/35 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_rgba(255,153,0,0.03)] backdrop-blur-md cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] shadow-[0_0_12px_rgba(255,153,0,0.15)] group-hover:shadow-[0_0_22px_rgba(255,153,0,0.45)] group-hover:border-[#FF9900]/45 flex items-center justify-center transition-all duration-300 backdrop-blur-md">
                  <Mail className="w-5 h-5 transition-transform duration-300 group-hover:scale-[1.08]" />
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Email Us</h4>
                  <p className="text-[10px] text-zinc-550 font-medium">Reach us directly anytime</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-zinc-650 group-hover:text-[#FF9900] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </motion.div>
        </div>

        {/* ── SECTION 5: COLLABORATION BANNER ───────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadinVariants}
          className="rounded-3xl border border-zinc-900 bg-zinc-950/25 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md relative overflow-hidden"
        >
          {/* Subtle Orange Glow behind CTA */}
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-orange-500/5 blur-[50px] pointer-events-none" />

          {/* Left Side: Cloud connection illustration */}
          <div className="flex-shrink-0 w-[120px] h-[70px] relative">
            <svg viewBox="0 0 120 70" className="w-full h-full text-[#FF9900]">
              {/* Central Cloud */}
              <path
                d="M50,32 a10,10 0 0,1 20,0 a8,8 0 0,1 12,8 a7,7 0 0,1 -7,7 h-30 a7,7 0 0,1 -7,-7 a8,8 0 0,1 12,-8 z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(255,153,0,0.4)]"
              />
              {/* Connector dots */}
              <circle cx="60" cy="40" r="1" fill="#fff" />
              
              {/* Connection paths */}
              <path d="M42,43 d-3,12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
              <path d="M60,45 d0,13" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
              <path d="M78,43 d3,12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />

              {/* Node outlines / connections at bottom */}
              <circle cx="28" cy="55" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
              <path d="M24,63 c1,-2.5 7,-2.5 8,0" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
              
              <circle cx="60" cy="58" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
              <path d="M56,66 c1,-2.5 7,-2.5 8,0" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />

              <circle cx="92" cy="55" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
              <path d="M88,63 c1,-2.5 7,-2.5 8,0" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
            </svg>
          </div>

          {/* Center: Badge & Copy */}
          <div className="flex-grow max-w-2xl text-center md:text-left space-y-2.5">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FF9900] bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block">
              {"// COLLABORATE"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Open to <span className="text-[#FF9900]">Collaborations</span>
            </h3>
            <p className="text-zinc-550 text-[11px] sm:text-xs leading-relaxed font-medium">
              We're always open to partnering with universities, communities, organizations, and industry professionals to empower the next generation of cloud builders.
            </p>
          </div>

          {/* Right Side: Partnership Action button */}
          <a
            href="mailto:sbg.rimt@gmail.com?subject=Collaboration%20Proposal"
            className="flex-shrink-0 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#FF9900] text-zinc-950 text-xs font-black shadow-lg shadow-orange-500/15 hover:shadow-[0_0_25px_rgba(255,153,0,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
          >
            Explore Partnerships →
          </a>
        </motion.div>

      </div>
    </div>
  );
}
