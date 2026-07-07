"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight, Star, Zap } from "lucide-react";

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
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

    if (timeStr) {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const isPM = timeMatch[3].toUpperCase() === "PM";
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

/* ─── Countdown Digit Component ─── */
function CountdownDigit({ value, label }: { value: number; label: string }) {
  const displayVal = String(value).padStart(2, "0");
  const prevRef = useRef(displayVal);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (prevRef.current !== displayVal) {
      setFlip(true);
      prevRef.current = displayVal;
      const t = setTimeout(() => setFlip(false), 400);
      return () => clearTimeout(t);
    }
  }, [displayVal]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="countdown-digit-wrapper">
        <div className={`countdown-digit ${flip ? "countdown-flip" : ""}`}>
          <span className="countdown-digit-value">{displayVal}</span>
          {/* Reflection line */}
          <div className="countdown-digit-divider" />
        </div>
        {/* Glow effect underneath */}
        <div className="countdown-digit-glow" />
      </div>
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
    </div>
  );
}

/* ─── Colon Separator ─── */
function CountdownSeparator() {
  return (
    <div className="flex flex-col items-center gap-1.5 self-start mt-3 sm:mt-4">
      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.6)]" style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

export function UpcomingEventSection() {
  const [nearestEvent, setNearestEvent] = useState<EventItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [speakerVisible, setSpeakerVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const speakerRef = useRef<HTMLDivElement>(null);

  // Animate in immediately when the site opens so it "pops up" as requested
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animate speaker section in immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeakerVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [nearestEvent]);

  useEffect(() => {
    // Helper to set the nearest upcoming event from a list
    function setFromList(eventsList: EventItem[]) {
      const upcoming = eventsList.filter((e) => e.status === "upcoming");
      const sorted = upcoming.sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
      if (sorted.length > 0) {
        setNearestEvent(sorted[0]);
      } else {
        setNearestEvent(null);
      }
    }

    // Load local data IMMEDIATELY so it never shows empty
    const localEvents = getLocalEvents().map((ev) => enrichEvent({
      ...ev,
      status: calculateEventStatus(ev.date, ev.status),
    }));
    setFromList(localEvents);

    // Then try Supabase in background with a timeout
    async function trySupabase() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const fetchPromise = supabase
          .from("events")
          .select("*");

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Event fetch timeout")), 5000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (!error && data && data.length > 0) {
          const eventsList = data.map((d: any) => enrichEvent({
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
          setFromList(eventsList);
        }
      } catch (err) {
        console.warn("Error fetching events (using local fallback):", err);
      }
    }

    trySupabase();

    if (typeof window !== "undefined") {
      window.addEventListener("cms-data-updated", trySupabase);
      window.addEventListener("storage", trySupabase);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cms-data-updated", trySupabase);
        window.removeEventListener("storage", trySupabase);
      }
    };
  }, []);

  // Countdown timer
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
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#050816] overflow-hidden"
    >
      {/* Animated background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/[0.04] rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/[0.03] rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Top Divider with shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        <div className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent countdown-shimmer" />
      </div>

      {/* Grid dots */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* ─── Section Header ─── */}
        <div
          className={`text-center lg:text-left space-y-3 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(251,146,60,0.1)]">
            <Zap className="h-3 w-3" />
            Next Mission
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Upcoming{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.3)]">
              Event
            </span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Level up your developer skillset and build the future on AWS at our next upcoming meetup.
          </p>
        </div>

        {/* ─── Countdown Timer ─── */}
        {timeLeft && (
          <div
            className={`mt-10 sm:mt-14 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative max-w-xl mx-auto lg:mx-0">
              {/* Glow behind countdown */}
              <div className="absolute inset-0 -m-4 bg-gradient-to-r from-orange-500/5 via-amber-500/10 to-orange-500/5 rounded-3xl blur-2xl pointer-events-none" />

              <div className="relative bg-[#080c18]/80 backdrop-blur-xl border border-orange-500/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-orange-400/80 font-bold">
                    Mission Countdown
                  </p>
                </div>

                <div className="flex items-start justify-center gap-3 sm:gap-5">
                  <CountdownDigit value={timeLeft.days} label="Days" />
                  <CountdownSeparator />
                  <CountdownDigit value={timeLeft.hours} label="Hours" />
                  <CountdownSeparator />
                  <CountdownDigit value={timeLeft.minutes} label="Minutes" />
                  <CountdownSeparator />
                  <CountdownDigit value={timeLeft.seconds} label="Seconds" />
                </div>

                {/* Progress bar */}
                <div className="mt-6 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full countdown-progress"
                    style={{ width: `${Math.max(5, 100 - (timeLeft.days / 30) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!timeLeft && (
          <div
            className={`mt-10 sm:mt-14 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 shadow-[0_0_40px_rgba(251,146,60,0.15)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-sm font-bold text-orange-300 tracking-wide">🚀 Event is LIVE — Join now!</span>
            </div>
          </div>
        )}

        {/* ─── Event Card ─── */}
        <div
          className={`mt-10 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
          <Link
            href={`/events/${nearestEvent.slug}`}
            className="group relative block rounded-3xl border overflow-hidden transition-all duration-500 cursor-pointer"
            style={{
              background: "linear-gradient(145deg, rgba(10,15,30,0.95), rgba(8,12,24,0.85))",
              borderColor: hovered ? "rgba(255,140,0,0.35)" : "rgba(30,41,59,0.5)",
              boxShadow: hovered
                ? "0 0 0 1px rgba(255,140,0,0.15), 0 30px 70px rgba(0,0,0,0.5), 0 0 60px rgba(255,140,0,0.08)"
                : "0 0 0 1px rgba(255,140,0,0.03), 0 10px 40px rgba(0,0,0,0.3)",
              transform: hovered ? "translateY(-6px) scale(1.005)" : "translateY(0) scale(1)",
              transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s ease, border-color 0.5s ease",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none z-10" />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-orange-500/20 rounded-tl-3xl pointer-events-none opacity-50" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-orange-500/20 rounded-br-3xl pointer-events-none opacity-50" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Left content */}
              <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 space-y-6 flex flex-col justify-between relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {nearestEvent.type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </span>
                      Open
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-orange-400 transition-colors duration-300">
                    {nearestEvent.title}
                  </h3>

                  {/* Meta details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-400 pt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-orange-400" />
                      </div>
                      <span className="font-medium">{nearestEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                        <MapPin className="h-3.5 w-3.5 text-orange-400" />
                      </div>
                      <span className="truncate font-medium">{nearestEvent.location}</span>
                    </div>
                    {nearestEvent.time && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <span className="font-medium">{nearestEvent.time}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed pt-2">
                    {nearestEvent.description}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <div
                    className="w-full sm:w-auto inline-flex text-center py-3.5 px-8 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border border-orange-500/30 bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-400 group-hover:from-orange-500/25 group-hover:to-amber-500/25 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(251,146,60,0.15)] items-center justify-center gap-2"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Right cover image */}
              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full overflow-hidden flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-800/30 bg-[#0a0f1e]/60">
                {nearestEvent.imageUrl ? (
                  <img
                    src={nearestEvent.imageUrl}
                    alt={nearestEvent.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                {/* Image gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#080c18]/50 to-transparent pointer-events-none lg:block hidden" />
              </div>
            </div>
          </Link>
        </div>

        {/* ─── Guest Speaker Section ─── */}
        {nearestEvent.slug === "kiroverse" && (
          <div
            ref={speakerRef}
            className={`mt-20 pt-16 border-t border-slate-900/60 max-w-[800px] mx-auto space-y-8 transition-all duration-700 ${
              speakerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <Star className="h-3 w-3 animate-pulse" />
                Featured Speaker
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Meet Our First Event Guest
              </h3>
            </div>

            <div
              className={`relative overflow-hidden rounded-2xl border bg-[#080c18]/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-2xl mx-auto transition-all duration-500 delay-200 ${
                speakerVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{
                borderColor: "rgba(168,85,247,0.15)",
                boxShadow: "0 0 40px rgba(168,85,247,0.04), 0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-purple-500/20 rounded-tl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-purple-500/20 rounded-br-2xl pointer-events-none" />

              {/* Volumetric glow */}
              <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />

              <div className="relative group">
                {/* Glow ring behind image */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-500 opacity-50 blur-[4px] group-hover:opacity-80 transition duration-300" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-slate-950 bg-purple-500/10 shadow-xl">
                  <img
                    src="/events/bhoomi-raut.png"
                    alt="Bhoomi Raut"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-3 text-center md:text-left flex-grow">
                <div>
                  <h4 className="text-lg font-bold text-white leading-tight">Bhoomi Raut</h4>
                  <p className="text-xs text-purple-400 font-semibold mt-1 font-mono">
                    AWS Community Builder & Former AWS Cloud Club Captain
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  AWS Community Builder (AI Engineering), AWS 3x Certified, Udemy Instructor. Founder & Former AWS Cloud Club Captain at Sanjivani College of Engineering.
                </p>

                <div className="pt-1">
                  <a
                    href="https://www.linkedin.com/in/bhoomi-ganesh-raut"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all bg-slate-900 border border-slate-800 hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  >
                    <LinkedInIcon className="h-3.5 w-3.5 text-purple-400" />
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
