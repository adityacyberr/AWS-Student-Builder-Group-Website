"use client";

import { useState, useEffect } from "react";
import { getLocalAchievements, AchievementItem } from "@/data/achievements";
import { Trophy, Award, CheckCircle, ArrowRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  useEffect(() => {
    async function loadAchievements() {
      let achievementsList = getLocalAchievements();
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("achievements")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data) {
            achievementsList = data.map((d: any) => ({
              id: d.id,
              title: d.title,
              date: d.date,
              description: d.description,
              badgeType: d.badge_type,
            }));
          }
        } catch (err) {
          console.error("Error loading achievements from Supabase:", err);
        }
      }
      setAchievements(achievementsList);
    }

    loadAchievements();
  }, []);

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "charter":
        return <Award className="h-6 w-6" />;
      case "team":
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "charter":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "team":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 block mb-2">Milestones</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Achievements</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Celebrating the milestones of our growing cloud developer community at RIMT University.
          </p>
        </div>

        {/* Timeline List */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-slate-900 before:pointer-events-none">
          {achievements.length === 0 ? (
            <div className="relative flex gap-6 md:gap-8 items-start group">
              
              {/* Timeline Icon node */}
              <div className="flex-shrink-0 z-10 p-3 rounded-xl border flex items-center justify-center text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse">
                <Trophy className="h-6 w-6" />
              </div>

              {/* Box Details */}
              <div className="flex-grow p-6 rounded-2xl border border-amber-500/20 bg-slate-950/70 shadow-lg glow-amber space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Our legacy is being built 🏆</h3>
                  <span className="text-xs font-mono text-slate-500">Milestones Coming Soon</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We are setting up our official student chapter workspace, core team organization, and bootcamp syllabus. Stay tuned as we build the foundations of AWS SBG at RIMT University!
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:text-white hover:bg-slate-850 transition-all"
                  >
                    Join the Journey
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

            </div>
          ) : (
            achievements.map((item) => (
              <div key={item.id} className="relative flex gap-6 md:gap-8 items-start group">
                
                {/* Timeline Icon node */}
                <div className={`flex-shrink-0 z-10 p-3 rounded-xl border flex items-center justify-center transition-all ${getBadgeColor(item.badgeType)} group-hover:scale-105`}>
                  {getBadgeIcon(item.badgeType)}
                </div>

                {/* Box Details */}
                <div className="flex-grow p-6 rounded-2xl border border-slate-900 bg-slate-950/70 shadow-sm hover:border-slate-800 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
                    <span className="text-xs font-mono text-slate-500">{item.date}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
