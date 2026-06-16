"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { SolarSystemHero } from "@/components/home/SolarSystemHero";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    async function loadAnnouncements() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("announcements")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false });
          if (!error && data) {
            const valid = (data as AnnouncementItem[]).filter((ann) => {
              const titleLower = (ann.title || "").toLowerCase().trim();
              const contentLower = (ann.content || "").toLowerCase().trim();
              return (
                titleLower !== "" &&
                contentLower !== "" &&
                titleLower !== "test" &&
                contentLower !== "test" &&
                titleLower !== "testing" &&
                contentLower !== "testing" &&
                !titleLower.includes("test") &&
                !contentLower.includes("test")
              );
            });
            setAnnouncements(valid);
          }
        } catch (err) {
          console.error("Error loading announcements from Supabase:", err);
        }
      }
    }

    loadAnnouncements();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050816] overflow-hidden">
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 py-3 text-center text-xs relative z-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white uppercase tracking-wider">
              Announcement
            </span>
            <span className="font-bold text-white">
              {announcements[0].title}:
            </span>
            <span className="text-slate-350">
              {announcements[0].content}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({announcements[0].date})
            </span>
          </div>
        </div>
      )}

      {/* Solar System Hero — Full Viewport */}
      <SolarSystemHero />
    </div>
  );
}
