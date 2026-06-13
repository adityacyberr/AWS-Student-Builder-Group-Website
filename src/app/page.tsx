"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Cloud, Cpu, Shield, Award, Calendar, Trophy, ChevronRight } from "lucide-react";
import { getLocalEvents, EventItem } from "@/data/events";
import { getLocalAchievements, AchievementItem } from "@/data/achievements";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface DBEventRow {
  id: string;
  title: string;
  slug: string;
  date: string;
  time?: string;
  type: 'Workshop' | 'Hackathon' | 'Meetup' | 'Webinar';
  location: string;
  description: string;
  long_description?: string;
  registration_link: string;
  status: 'upcoming' | 'completed';
  cover_placeholder_color: 'orange' | 'blue' | 'purple' | 'mint' | 'amber';
}

interface DBAchievementRow {
  id: string;
  title: string;
  date: string;
  description: string;
  badge_type: "charter" | "team" | "milestone";
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export default function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [milestones, setMilestones] = useState<AchievementItem[]>([]);
  const [stats, setStats] = useState<{ label: string; value: string }[]>([
    { label: "Members", value: "150+" },
    { label: "Bootcamps", value: "3+" },
    { label: "Hands-On", value: "100%" },
  ]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    async function loadData() {
      // 1. Load events
      let eventsList = getLocalEvents();
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data) {
            eventsList = (data as DBEventRow[]).map((d) => ({
              id: d.id,
              title: d.title,
              slug: d.slug,
              date: d.date,
              time: d.time || "",
              type: d.type,
              location: d.location,
              description: d.description,
              longDescription: d.long_description || "",
              registrationLink: d.registration_link,
              status: d.status,
              coverPlaceholderColor: d.cover_placeholder_color,
            }));
          }
        } catch (err) {
          console.error("Error loading events from Supabase:", err);
        }
      }
      setUpcomingEvents(eventsList.filter(e => e.status === "upcoming").slice(0, 2));

      // 2. Load achievements
      let achievementsList = getLocalAchievements();
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("achievements")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data) {
            achievementsList = (data as DBAchievementRow[]).map((d) => ({
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
      setMilestones(achievementsList.slice(0, 3));

      // 3. Load stats
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("homepage_stats")
            .select("label, value")
            .order("display_order", { ascending: true });
          if (!error && data && data.length > 0) {
            setStats(data);
          }
        } catch (err) {
          console.error("Error loading stats from Supabase:", err);
        }
      }

      // 4. Load announcements
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("announcements")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false });
          if (!error && data) {
            setAnnouncements(data);
          }
        } catch (err) {
          console.error("Error loading announcements from Supabase:", err);
        }
      }
    }

    loadData();
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 py-3 text-center text-xs relative z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white uppercase tracking-wider">
              Announcement
            </span>
            <span className="font-bold text-white">{announcements[0].title}:</span>
            <span className="text-slate-350">{announcements[0].content}</span>
            <span className="text-[10px] text-slate-500 font-mono">({announcements[0].date})</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 bg-grid-pattern overflow-hidden">
        {/* Animated gradients */}
        <div className="absolute top-1/4 right-0 w-[40rem] h-[40rem] rounded-full bg-orange-500/10 blur-[150px] animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 blur-[120px] animate-pulse-slow pointer-events-none"></div>
        
        {/* AWS Smile overlay design in the background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-gradient opacity-40 pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                Official Student Chapter
              </div>

              {/* Headings */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Learn. Build. Lead.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500">
                  The Cloud is Yours.
                </span>
              </h1>

              <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Welcome to the official AWS Student Builder Group at RIMT University. 
                We are a student-led engineering community mastering Cloud Infrastructure, 
                Generative AI, and Serverless Architecture.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-6 py-3.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all hover:-translate-y-0.5 active:scale-95 text-center"
                >
                  Join Our Club
                  <ArrowRight className="h-5 w-5" />
                </a>
                <Link
                  href="/events"
                  className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-6 py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all text-center"
                >
                  Explore Events
                </Link>
              </div>

              {/* Stats Preview */}
              <div className="pt-8 border-t border-slate-900/60 max-w-lg mx-auto lg:mx-0">
                <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
                  {stats.map((s, idx) => (
                    <div key={idx}>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{s.value}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-5 relative hidden md:block">
              <div className="relative mx-auto w-80 h-80 lg:w-96 lg:h-96 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden animate-float">
                {/* Embedded Program Icon Logo */}
                <div className="relative w-48 h-48 lg:w-56 lg:h-56 z-10">
                  <Image
                    src="/brand/icon-white.svg"
                    alt="AWS Student Builder Group Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                {/* Floating AWS Nodes */}
                <div className="absolute top-8 left-8 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Cloud className="h-6 w-6" />
                </div>
                <div className="absolute bottom-12 right-8 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Cpu className="h-6 w-6" />
                </div>
                <div className="absolute bottom-8 left-12 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Shield className="h-6 w-6" />
                </div>
                {/* Background circular glowing rings */}
                <div className="absolute inset-4 rounded-full border border-slate-900/60 ring-8 ring-slate-950/20 pointer-events-none"></div>
                <div className="absolute inset-16 rounded-full border border-orange-500/5 ring-8 ring-orange-500/[0.01] pointer-events-none"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 border-t border-slate-900 bg-slate-980/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Why Join the AWS Student Builder Group?
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              We focus on practical engineering. No boring lectures—only code repositories, sandbox setups, and deployment configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-8 shadow-sm hover:border-orange-500/30 hover:shadow-orange-500/[0.02] transition-all group">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 w-fit mb-6">
                <Cloud className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-orange-400 transition-colors">Cloud Excellence</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Understand architecture patterns, learn core operations, and implement cost-effective, scalable services using AWS.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-8 shadow-sm hover:border-blue-500/30 hover:shadow-blue-500/[0.02] transition-all group">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-6">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">Generative AI</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dive deep into foundation models, configure vector embeddings, and construct real applications using Amazon Bedrock and PartyRock.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-8 shadow-sm hover:border-purple-500/30 hover:shadow-purple-500/[0.02] transition-all group">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-purple-400 transition-colors">Career Acceleration</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Unlock training pathways, prepare for industry certifications, attend bootcamps, and build high-quality portfolio projects.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Events & Milestones Highlight */}
      <section className="py-20 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left side: Upcoming Events */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">Next Up</h2>
                </div>
                <Link href="/events" className="text-xs text-orange-400 hover:text-orange-300 font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-slate-950/50 p-8 text-center shadow-md shadow-orange-500/[0.02] flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <span className="text-xl animate-bounce">🚀</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white tracking-tight">New events dropping soon 🚀</h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                      Join the community to be the first to know.
                    </p>
                  </div>
                  <a
                    href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-600 shadow-md transition-all active:scale-95"
                  >
                    Join the Community
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-950/50 p-6 shadow-sm hover:border-slate-800 transition-all">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider mb-2">
                            {event.type}
                          </span>
                          <h3 className="text-lg font-bold text-white tracking-tight">{event.title}</h3>
                        </div>
                        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{event.date}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed mb-4">{event.description}</p>
                      <Link href={`/events/${event.slug}`} className="text-xs text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1">
                        Learn More
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Milestones / Achievements */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">Milestones</h2>
                </div>
                <Link href="/achievements" className="text-xs text-amber-400 hover:text-amber-300 font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                  Read More
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {milestones.length === 0 ? (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-slate-950/50 p-8 text-center shadow-md shadow-amber-500/[0.02] flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white tracking-tight">Our legacy is being built 🏆</h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
                      Milestones coming soon.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {milestones.map((item) => (
                    <div key={item.id} className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-950/50 p-6 shadow-sm hover:border-slate-800 transition-all flex gap-4">
                      <div className="flex-shrink-0 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 h-fit">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{item.date}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Block Banner */}
      <section className="py-16 border-t border-slate-900 bg-slate-980">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-8 md:p-12 rounded-2xl border border-orange-500/20 bg-slate-950 shadow-xl overflow-hidden relative glow-orange">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to build on AWS?</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Connect with our local dev community, unlock certified cloud training pathways, and gain access to collaborative GenAI innovation labs.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 shadow-md transition-all active:scale-95"
                >
                  Join the Builder Group
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
