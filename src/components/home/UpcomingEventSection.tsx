"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight, Star } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getLocalEvents, EventItem } from "@/data/events";
import { enrichEvent } from "@/lib/eventEnricher";

// Helper to calculate status dynamically based on current date
function calculateEventStatus(dateStr: string, dbStatus: string): "upcoming" | "completed" {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let parsed = Date.parse(dateStr);
    if (isNaN(parsed)) {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length === 3) {
        if (!isNaN(parseInt(parts[0])) && isNaN(parseInt(parts[1]))) {
          const rearranged = `${parts[1]} ${parts[0]}, ${parts[2]}`;
          const reParsed = Date.parse(rearranged);
          if (!isNaN(reParsed)) {
            const eventDate = new Date(reParsed);
            eventDate.setHours(23, 59, 59, 999);
            return eventDate.getTime() < today.getTime() ? "completed" : "upcoming";
          }
        }
      }
      return dbStatus as "upcoming" | "completed";
    }
    const eventDate = new Date(parsed);
    eventDate.setHours(23, 59, 59, 999);
    return eventDate.getTime() < today.getTime() ? "completed" : "upcoming";
  } catch (e) {
    return dbStatus as "upcoming" | "completed";
  }
}

function parseDateString(dateStr: string): number {
  let parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length === 3) {
      if (!isNaN(parseInt(parts[0])) && isNaN(parseInt(parts[1]))) {
        const rearranged = `${parts[1]} ${parts[0]}, ${parts[2]}`;
        const reParsed = Date.parse(rearranged);
        if (!isNaN(reParsed)) return reParsed;
      }
    }
    return 0;
  }
  return parsed;
}

function parseEventDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    let normalizedDate = dateStr.trim();
    let startTime = "11:00";
    let isPM = false;
    
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        isPM = timeMatch[3].toUpperCase() === "PM";
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        startTime = `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    }
    
    let parsedDate = Date.parse(normalizedDate);
    if (isNaN(parsedDate)) {
      const parts = normalizedDate.split(/\s+/);
      if (parts.length === 3) {
        if (!isNaN(parseInt(parts[0])) && isNaN(parseInt(parts[1]))) {
          normalizedDate = `${parts[1]} ${parts[0]}, ${parts[2]}`;
        }
      }
      parsedDate = Date.parse(normalizedDate);
    }
    
    if (isNaN(parsedDate)) {
      return null;
    }
    
    const baseDate = new Date(parsedDate);
    const [h, m] = startTime.split(':').map(Number);
    
    const targetDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      h,
      m,
      0
    );
    
    if (timeStr && timeStr.toUpperCase().includes("IST")) {
      const utcTime = Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        h,
        m,
        0
      ) - (5.5 * 60 * 60 * 1000);
      return new Date(utcTime);
    }
    
    return targetDate;
  } catch (e) {
    return null;
  }
}

export function UpcomingEventSection() {
  const [nearestEvent, setNearestEvent] = useState<EventItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    async function loadNearestEvent() {
      let eventsList: EventItem[] = [];
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*");
          if (!error && data) {
            eventsList = data.map((d: any) => enrichEvent({
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
              status: calculateEventStatus(d.date, d.status),
              coverPlaceholderColor: d.cover_placeholder_color,
              imageUrl: d.image_url || "",
            }));
          }
        } catch (err) {
          console.warn("Error fetching events:", err);
        }
      } else {
        eventsList = getLocalEvents().map((ev) => enrichEvent({
          ...ev,
          status: calculateEventStatus(ev.date, ev.status),
        }));
      }

      // Filter only upcoming and sort by date ascending (nearest first)
      const upcoming = eventsList.filter((e) => e.status === "upcoming");
      const sorted = upcoming.sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
      
      if (sorted.length > 0) {
        setNearestEvent(sorted[0]);
      } else {
        setNearestEvent(null);
      }
    }

    loadNearestEvent();

    // Listen for custom updates and storage changes
    if (typeof window !== "undefined") {
      window.addEventListener("cms-data-updated", loadNearestEvent);
      window.addEventListener("storage", loadNearestEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cms-data-updated", loadNearestEvent);
        window.removeEventListener("storage", loadNearestEvent);
      }
    };
  }, []);

  // Countdown timer hook
  useEffect(() => {
    if (!nearestEvent) return;

    const eventDate = parseEventDateTime(nearestEvent.date, nearestEvent.time || "");
    if (!eventDate) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nearestEvent]);

  if (!nearestEvent) return null;

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#050816] overflow-hidden">
      {/* Top Divider with orange accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto space-y-10 relative z-10">
        <div className="text-center lg:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Star className="h-3 w-3 animate-pulse" />
            Next Mission
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Upcoming{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_15px_rgba(255,140,0,0.2)]">
              Event
            </span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Level up your developer skillset and build the future on AWS at our next upcoming meetup or hands-on lab.
          </p>
        </div>

        {/* Feature Event Card */}
        <Link
          href={`/events/${nearestEvent.slug}`}
          className="group relative block rounded-3xl border overflow-hidden transition-all duration-400 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, rgba(10,15,30,0.9), rgba(10,15,30,0.7))",
            borderColor: hovered ? "rgba(255,140,0,0.3)" : "rgba(30,41,59,0.6)",
            boxShadow: hovered
              ? "0 0 0 1px rgba(255,140,0,0.1), 0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(255,140,0,0.05)"
              : "0 0 0 1px rgba(255,140,0,0.03), 0 10px 30px rgba(0,0,0,0.2)",
            transform: hovered ? "translateY(-4px)" : "translateY(0)",
            transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Left content (7 cols) */}
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 space-y-6 flex flex-col justify-between relative z-10">
              <div className="space-y-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {nearestEvent.type}
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-orange-400 transition-colors">
                  {nearestEvent.title}
                </h3>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-400 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-400/80 flex-shrink-0" />
                    <span>{nearestEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-400/80 flex-shrink-0" />
                    <span className="truncate">{nearestEvent.location}</span>
                  </div>
                  {nearestEvent.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400/80 flex-shrink-0" />
                      <span>{nearestEvent.time}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-400 leading-relaxed pt-2">
                  {nearestEvent.description}
                </p>
              </div>

              {/* Countdown & CTA */}
              <div className="pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Countdown */}
                {timeLeft ? (
                  <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Missions Starts In</div>
                    <div className="grid grid-cols-4 gap-2 text-center w-full max-w-[260px] mx-auto sm:mx-0">
                      <div className="px-2 py-1.5 bg-[#0a0f1e]/80 border border-orange-500/15 rounded-lg">
                        <div className="text-base font-extrabold text-orange-400 leading-none">{timeLeft.days}</div>
                        <div className="text-[7px] uppercase tracking-widest text-slate-500 font-bold mt-1">D</div>
                      </div>
                      <div className="px-2 py-1.5 bg-[#0a0f1e]/80 border border-orange-500/15 rounded-lg">
                        <div className="text-base font-extrabold text-orange-400 leading-none">{timeLeft.hours}</div>
                        <div className="text-[7px] uppercase tracking-widest text-slate-500 font-bold mt-1">H</div>
                      </div>
                      <div className="px-2 py-1.5 bg-[#0a0f1e]/80 border border-orange-500/15 rounded-lg">
                        <div className="text-base font-extrabold text-orange-400 animate-bounce leading-none">{timeLeft.minutes}</div>
                        <div className="text-[7px] uppercase tracking-widest text-slate-500 font-bold mt-1">M</div>
                      </div>
                      <div className="px-2 py-1.5 bg-[#0a0f1e]/80 border border-orange-500/15 rounded-lg">
                        <div className="text-base font-extrabold text-orange-400 leading-none">{timeLeft.seconds}</div>
                        <div className="text-[7px] uppercase tracking-widest text-slate-500 font-bold mt-1">S</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-orange-400 animate-pulse">Event is live / starting now!</div>
                )}

                {/* CTA Button */}
                <div
                  className="w-full sm:w-auto text-center py-3 px-6 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border border-orange-500/30 bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/25 group-hover:text-white flex items-center justify-center gap-2"
                >
                  <span>Register Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Right cover image (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full overflow-hidden flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-800/40 bg-[#0a0f1e]/60">
              {nearestEvent.imageUrl ? (
                <img
                  src={nearestEvent.imageUrl}
                  alt={nearestEvent.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-orange-400/30">
                  <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                    <path
                      d="M97 65H28c-11 0-20-9-20-20s9-20 20-20c1-11 10-20 22-20 10 0 19 7 21 17 3-2 6-3 9-3 8 0 15 7 15 15h2c8 0 14 6 14 14s-6 14-14 14v3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xs font-black tracking-widest uppercase">AWS SBG</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
