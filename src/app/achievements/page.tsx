"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

import { useReducedMotion } from "@/app/team/hooks/useReducedMotion";
import { FloatingBackground } from "./components/FloatingBackground";
import { WireframeCube } from "./components/WireframeCube";
import { WireframeGlobe } from "./components/WireframeGlobe";
import { HolographicSphere } from "./components/HolographicSphere";
import { ImpactStats } from "./components/ImpactStats";
import { MilestoneCard, Milestone } from "./components/MilestoneCard";
import { MilestoneModal } from "./components/MilestoneModal";
import { BottomJourney } from "./components/BottomJourney";

interface DBAchievementRow {
  id: string;
  title: string;
  date: string;
  description: string;
  badge_type: "charter" | "team" | "milestone";
}

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: "chapter-established",
    title: "Chapter Established",
    description: "AWS Student Builder Group officially launched at RIMT University, setting up the framework to guide builders.",
    date: "June 2026",
    status: "Completed",
    impactStatement: "Established a dedicated student learning workspace, introducing official AWS resources to campus.",
    relatedInitiatives: ["Core Chapter Launch", "Academic Alignment", "AWS Student Hub"],
    iconType: "rocket",
  },
  {
    id: "team-assembled",
    title: "Founding Team Assembled",
    description: "Built a multidisciplinary leadership team across technical tracks, event management, marketing, media, and campus operations.",
    date: "June 2026",
    status: "Completed",
    impactStatement: "Organized a 6-member foundational committee of core student leaders to manage community development.",
    relatedInitiatives: ["Leader Onboarding", "Operations Setup", "Role Allocation"],
    iconType: "team",
  },
  {
    id: "ecosystem-initiated",
    title: "Learning Ecosystem Initiated",
    description: "Established comprehensive plans for cloud sandboxes, structured learning labs, and hands-on peer coding workshops.",
    date: "Coming Soon",
    status: "In Progress",
    impactStatement: "Formulated the foundational syllabus mapping to the AWS Certified Cloud Practitioner domain.",
    relatedInitiatives: ["Curriculum Blueprint", "AWS Academy Prep", "Cloud Lab Guides"],
    iconType: "graduation",
  },
  {
    id: "partnerships-building",
    title: "Community Partnerships",
    description: "Building strong collaborative relationships with student builders, academic mentors, and external cloud groups.",
    date: "Coming Soon",
    status: "In Progress",
    impactStatement: "Initiating communication tracks to invite AWS community leaders for virtual guest panels.",
    relatedInitiatives: ["Mentor Networks", "Student Outreach", "Cross-Chapter Sync"],
    iconType: "handshake",
  },
  {
    id: "first-workshop",
    title: "First Cloud Workshop",
    description: "Foundational cloud workshop designed to demystify AWS services and help students deploy their first static websites.",
    date: "To Be Announced",
    status: "Upcoming",
    impactStatement: "Targeting 50+ students for real-time console deployments and basic S3 storage setup.",
    relatedInitiatives: ["Cloud Fundamentals", "S3 Web Deployment", "Hands-on Sandbox"],
    iconType: "cloud",
  },
  {
    id: "future-roadmap",
    title: "Future Milestones",
    description: "Roadmap targeting collegiate hackathons, live sandbox projects, certification drives, and regional AWS meetups.",
    date: "Future Roadmap",
    status: "Upcoming",
    impactStatement: "Focusing on building a sustainable campus tech chapter that translates learning into active builds.",
    relatedInitiatives: ["AWS Hackathons", "Live Capstones", "Bootcamp Certs"],
    iconType: "trophy",
  },
];

const scrollContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const scrollItemVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
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

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    async function loadAchievements() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("achievements")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data && data.length > 0) {
            const dbMilestones: Milestone[] = (data as DBAchievementRow[]).map((d) => ({
              id: d.id,
              title: d.title,
              date: d.date,
              description: d.description,
              status: "Completed",
              impactStatement: "Verified milestone achievement logged in chapter database records.",
              relatedInitiatives: [d.badge_type === "charter" ? "Chapter Foundation" : d.badge_type === "team" ? "Team Development" : "Milestone Update"],
              iconType: d.badge_type === "charter" ? "rocket" : d.badge_type === "team" ? "team" : "trophy",
            }));
            
            const merged = [...dbMilestones];
            INITIAL_MILESTONES.forEach((m) => {
              if (!merged.some((dbM) => dbM.id === m.id)) {
                merged.push(m);
              }
            });
            setAchievements(merged);
          }
        } catch (err) {
          console.error("Error loading achievements from Supabase:", err);
        }
      }
    }

    loadAchievements();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-hidden py-16 md:py-24 text-slate-300">
      {/* Background glow elements */}
      <div className="absolute top-1/3 left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 h-[30rem] w-[30rem] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* Decorative cyber wireframes */}
      {!reducedMotion && <FloatingBackground count={10} />}
      <WireframeCube />
      <WireframeGlobe />

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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block">
            {"// MILESTONES & IMPACT"}
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
            Building. Learning.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">
              Growing Together.
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
            Every milestone represents the builders, workshops, collaborations, and ideas that continue shaping our community.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* CENTERPIECE                                       */}
        {/* ================================================= */}
        <motion.div variants={scrollItemVariants} className="w-full flex justify-center py-6">
          <HolographicSphere />
        </motion.div>

        {/* ================================================= */}
        {/* IMPACT STATS                                      */}
        {/* ================================================= */}
        <motion.div variants={scrollItemVariants} className="w-full">
          <ImpactStats containerVariants={scrollContainerVariants} itemVariants={scrollItemVariants} />
        </motion.div>

        {/* ================================================= */}
        {/* MILESTONES SECTION (MISSION LOGS)                 */}
        {/* ================================================= */}
        <motion.div 
          variants={scrollItemVariants}
          className="space-y-8 max-w-4xl mx-auto pt-8"
        >
          <div className="text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-3">
              {"// MISSION LOGS"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Operation Index</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Chronological catalog of foundational achievements and future mission parameters.</p>
          </div>

          {/* Connected timeline list */}
          <div className="relative pl-0 md:pl-16 flex flex-col gap-6">
            {/* SVG Spine Line (Desktop Only) */}
            <div className="absolute left-6 top-3 bottom-3 w-[1.5px] bg-slate-900/60 hidden md:block pointer-events-none z-0">
              <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-b from-orange-500/30 via-blue-500/30 to-slate-900/10" />
              {/* Spine pulse node */}
              <div className="absolute top-0 left-[-2px] w-[5px] h-[5px] rounded-full bg-orange-400 animate-[ping_4s_linear_infinite]" />
            </div>

            {achievements.map((item) => (
              <div key={item.id} className="relative flex gap-6 items-start group z-10">
                {/* Timeline status node element on left */}
                <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-xl border border-slate-900 bg-slate-950/90 items-center justify-center relative z-10 transition-all duration-300 group-hover:border-orange-500/30 group-hover:scale-105">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    item.status === "Completed"
                      ? "bg-orange-500 shadow-[0_0_8px_#ff8c00] animate-pulse"
                      : item.status === "In Progress"
                      ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                      : "bg-slate-800"
                  }`} />
                </div>
                
                <div className="flex-grow w-full">
                  <MilestoneCard
                    milestone={item}
                    onOpen={() => setSelectedMilestone(item)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* BOTTOM SECTION                                    */}
        {/* ================================================= */}
        <motion.div 
          variants={scrollItemVariants}
          className="space-y-6 pt-12 border-t border-slate-900/60"
        >
          <div className="text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-3">
              {"// JOURNEY"}
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">Our Journey Continues</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Select a route below to explore active community channels.</p>
          </div>

          <BottomJourney containerVariants={scrollContainerVariants} itemVariants={scrollItemVariants} />
        </motion.div>

      </motion.div>

      {/* Holographic Detail Inspector Portal */}
      <AnimatePresence>
        {selectedMilestone && (
          <MilestoneModal
            milestone={selectedMilestone}
            onClose={() => setSelectedMilestone(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
