"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getLocalEvents, EventItem } from "@/data/events";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, ShieldAlert, ArrowRight, CheckCircle2, ChevronDown, Share2, Cpu, Laptop, Video, Sparkles, Trophy, Users, Globe } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { enrichEvent } from "@/lib/eventEnricher";

interface Speaker {
  name: string;
  role: string;
  company: string;
  bio: string;
  image?: string;
  linkedin?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface StructuredEventDetails {
  description: string;
  whatYouWillLearn?: string[];
  speakers?: Speaker[];
  faqs?: FAQ[];
}

function parseEventDateTime(dateStr: string, timeStr: string): { startDate: Date; endDate: Date } | null {
  try {
    let normalizedDate = dateStr.trim();
    let startTime = "11:00";
    let isPM = false;
    let durationHours = 3; // default duration is 3 hours
    
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
      
      const rangeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)\s*[-–—]\s*(\d+):(\d+)\s*(AM|PM)/i);
      if (rangeMatch) {
        let startH = parseInt(rangeMatch[1]);
        const startM = parseInt(rangeMatch[2]);
        const startPM = rangeMatch[3].toUpperCase() === "PM";
        if (startPM && startH < 12) startH += 12;
        if (!startPM && startH === 12) startH = 0;
        
        let endH = parseInt(rangeMatch[4]);
        const endM = parseInt(rangeMatch[5]);
        const endPM = rangeMatch[6].toUpperCase() === "PM";
        if (endPM && endH < 12) endH += 12;
        if (!endPM && endH === 12) endH = 0;
        
        const startMs = (startH * 60 + startM) * 60 * 1000;
        const endMs = (endH * 60 + endM) * 60 * 1000;
        if (endMs > startMs) {
          durationHours = (endMs - startMs) / (1000 * 60 * 60);
        }
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
    baseDate.setHours(h, m, 0, 0);
    
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
      const istDate = new Date(utcTime);
      const endDate = new Date(istDate.getTime() + durationHours * 60 * 60 * 1000);
      return { startDate: istDate, endDate };
    }
    
    const endDate = new Date(targetDate.getTime() + durationHours * 60 * 60 * 1000);
    return { startDate: targetDate, endDate };
  } catch (e) {
    return null;
  }
}

function formatGCalDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

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

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; totalMs: number } | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      let foundEvent: EventItem | null = null;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (!error && data) {
            foundEvent = enrichEvent({
              id: data.id,
              title: data.title,
              slug: data.slug,
              date: data.date,
              time: data.time,
              type: data.type,
              location: data.location,
              description: data.description,
              longDescription: data.long_description,
              registrationLink: data.registration_link,
              status: calculateEventStatus(data.date, data.status),
              coverPlaceholderColor: data.cover_placeholder_color,
              imageUrl: data.image_url,
            });
          }
        } catch (err) {
          console.warn("Error loading event from Supabase:", err);
        }
      }
      if (!foundEvent) {
        const local = getLocalEvents().find((e) => e.slug === slug);
        if (local) {
          foundEvent = enrichEvent({
            ...local,
            status: calculateEventStatus(local.date, local.status),
          });
        }
      }
      setEvent(foundEvent);
      setLoading(false);
    }

    loadEvent();
  }, [slug]);

  // Countdown timer hook
  useEffect(() => {
    if (!event || event.status !== "upcoming") return;

    const eventDateInfo = parseEventDateTime(event.date, event.time || "");
    if (!eventDateInfo) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = eventDateInfo.startDate.getTime() - now.getTime();

      if (diff <= 0) {
        const endDiff = eventDateInfo.endDate.getTime() - now.getTime();
        if (endDiff > 0) {
          // Event is live!
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: diff });
        } else {
          // Event has ended
          setTimeLeft(null);
        }
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <span className="text-sm font-bold uppercase tracking-widest animate-pulse text-orange-400">Loading mission details...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <ShieldAlert className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-sm mb-6 text-slate-500">The requested event page could not be located.</p>
        <Link href="/events" className="text-xs text-orange-400 hover:underline uppercase tracking-wider font-bold">
          Back to Events
        </Link>
      </div>
    );
  }

  // Parse structured data from longDescription if it's JSON
  let structured: StructuredEventDetails | null = null;
  if (event.longDescription) {
    const trimmed = event.longDescription.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        structured = JSON.parse(trimmed);
      } catch (e) {
        console.warn("Failed to parse JSON longDescription", e);
      }
    }
  }

  const getPlaceholderBg = (color: string) => {
    switch (color) {
      case "orange":
        return "from-orange-500/20 via-amber-500/10 to-slate-950";
      case "purple":
        return "from-purple-500/20 via-pink-500/10 to-slate-950";
      case "blue":
        return "from-blue-500/20 via-cyan-500/10 to-slate-950";
      default:
        return "from-slate-900 to-slate-950";
    }
  };

  // Google Calendar URL construction
  const dateInfo = parseEventDateTime(event.date, event.time || "");
  let gCalUrl = "#";
  if (dateInfo) {
    const dates = `${formatGCalDate(dateInfo.startDate)}/${formatGCalDate(dateInfo.endDate)}`;
    const detailsText = structured?.description || event.longDescription || event.description;
    gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dates}&details=${encodeURIComponent(detailsText)}&location=${encodeURIComponent(event.location)}`;
  }

  // Share links
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out "${event.title}" organized by AWS Student Builder Group at RIMT University! Join here:`;

  const titleParts = event.title.split("–").map(s => s.trim());
  const mainTitle = titleParts[0];
  const subtitle = titleParts[1] || event.type;
  const shortDesc = event.description;

  const diffMs = timeLeft ? timeLeft.totalMs : -1;
  const isUpcoming = event.status === "upcoming";
  const showTimer = isUpcoming && diffMs > 0;

  const now = new Date();
  const showLiveBanner = isUpcoming && dateInfo && (now.getTime() >= dateInfo.startDate.getTime() && now.getTime() < dateInfo.endDate.getTime());

  let accent = {
    text: "text-purple-500",
    border: "border-purple-500/20",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)] border-purple-500/30",
    bg: "bg-purple-600 hover:bg-purple-700",
    pulse: "",
    pillBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };

  if (diffMs > 0) {
    if (diffMs < 1000 * 60 * 60) {
      accent = {
        text: "text-red-500",
        border: "border-red-500/40",
        glow: "shadow-[0_0_25px_rgba(239,68,68,0.25)] border-red-500/30",
        bg: "bg-red-600 hover:bg-red-700",
        pulse: "animate-pulse duration-500",
        pillBg: "bg-red-500/10 border-red-500/20 text-red-400",
      };
    } else if (diffMs < 1000 * 60 * 60 * 24) {
      accent = {
        text: "text-amber-500",
        border: "border-amber-500/40",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/30",
        bg: "bg-amber-600 hover:bg-amber-700",
        pulse: "animate-pulse duration-1000",
        pillBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      };
    }
  }

  const timerTitle = showTimer 
    ? "Countdown to Launch!" 
    : showLiveBanner 
      ? "Event is Live!" 
      : "Event Concluded";
  const timerSubtitle = showTimer 
    ? "Are you ready?" 
    : showLiveBanner 
      ? "Join the live session now!" 
      : "This session has concluded.";

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "Workshop":
        return <Laptop className="h-5 w-5" />;
      case "Webinar":
        return <Video className="h-5 w-5" />;
      case "Bootcamp":
        return <Sparkles className="h-5 w-5" />;
      case "Meetup":
        return <Users className="h-5 w-5" />;
      case "Hackathon":
        return <Trophy className="h-5 w-5" />;
      case "Community Event":
        return <Globe className="h-5 w-5" />;
      default:
        return <Cpu className="h-5 w-5" />;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Mission Countdown Widescreen Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-900 bg-[#080c16]/95 shadow-2xl p-6 sm:p-10 flex flex-col lg:grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 min-h-[460px]">
          {/* Background image & gradient overlay */}
          {event.imageUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.07] pointer-events-none"
              style={{ backgroundImage: `url(${event.imageUrl})` }}
            />
          )}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-slate-950/40 via-purple-950/5 to-slate-950/40" />

          {/* Left Column: Event details & meta */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6 lg:space-y-0">
            <div className="space-y-6">
              {/* Logos row */}
              <div className="flex items-center gap-4">
                <div className="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center max-w-[125px] shadow-sm select-none">
                  <img src="/brand/rimt-university.jpg" alt="RIMT University" className="h-6 object-contain" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-600/90 flex items-center justify-center text-white shadow-lg border border-purple-400/20">
                  {getCategoryIcon(event.type)}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
                  {mainTitle}
                </h1>
                {subtitle && (
                  <p className="text-xs font-bold tracking-[0.2em] text-purple-400 uppercase font-mono">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                {shortDesc}
              </p>
            </div>

            {/* Metadata (Date, Time, Venue) list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 lg:pt-8 border-t border-slate-900/60 mt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400">
                  <Calendar className="h-4.5 w-4.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Date</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">{event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400">
                  <Clock className="h-4.5 w-4.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Time</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">{event.time || "TBD"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400">
                  <MapPin className="h-4.5 w-4.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Venue</p>
                  <p className="text-xs font-bold text-slate-200 mt-1 truncate max-w-[130px]" title={event.location}>{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Countdown Area */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/45 border border-purple-500/10 backdrop-blur-md shadow-inner shadow-purple-500/5 min-h-[320px] relative overflow-hidden">
            {/* AWS Logo inside background */}
            <div className="absolute top-4 right-6 text-slate-400 select-none flex flex-col items-end">
              <span className="text-sm font-bold tracking-tight text-slate-200 leading-none">aws</span>
              <svg width="20" height="6" viewBox="0 0 24 8" fill="none" className="text-orange-500 mt-[-1px]">
                <path d="M2 2C6 5.5 12 7 22 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M22 2L20.5 4.5M22 2L19.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Core countdown components */}
            <div className="w-full flex flex-col items-center space-y-6 text-center">
              <h3 className="text-[11px] font-extrabold text-slate-400 tracking-[0.2em] uppercase">
                {timerTitle}
              </h3>

              {showTimer && timeLeft ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Days */}
                  <div className={`flex flex-col items-center justify-center px-4 py-3 bg-slate-950/80 border ${accent.border} rounded-2xl min-w-[65px] sm:min-w-[70px] ${accent.glow} ${accent.pulse}`}>
                    <span className="text-2xl font-black text-white leading-none font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1.5">Days</span>
                  </div>
                  {/* Hours */}
                  <div className={`flex flex-col items-center justify-center px-4 py-3 bg-slate-950/80 border ${accent.border} rounded-2xl min-w-[65px] sm:min-w-[70px] ${accent.glow} ${accent.pulse}`}>
                    <span className="text-2xl font-black text-white leading-none font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1.5">Hrs</span>
                  </div>
                  {/* Minutes */}
                  <div className={`flex flex-col items-center justify-center px-4 py-3 bg-slate-950/80 border ${accent.border} rounded-2xl min-w-[65px] sm:min-w-[70px] ${accent.glow} ${accent.pulse}`}>
                    <span className="text-2xl font-black text-white leading-none font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1.5">Min</span>
                  </div>
                  {/* Seconds */}
                  <div className={`flex flex-col items-center justify-center px-4 py-3 bg-slate-950/80 border ${accent.border} rounded-2xl min-w-[65px] sm:min-w-[70px] ${accent.glow} ${accent.pulse}`}>
                    <span className="text-2xl font-black text-white leading-none font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1.5">Sec</span>
                  </div>
                </div>
              ) : showLiveBanner ? (
                <div className="px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold tracking-widest uppercase animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2">
                  <span>🚀 Event is Live</span>
                </div>
              ) : (
                <div className="px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-extrabold tracking-widest uppercase shadow-sm flex items-center gap-2">
                  <span>Event Ended</span>
                </div>
              )}

              <p className="text-xs font-semibold text-slate-400">
                {timerSubtitle}
              </p>

              {/* Action Button */}
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full max-w-[220px] py-3.5 rounded-xl text-center font-extrabold text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-98 ${
                  isUpcoming 
                    ? `${accent.bg} text-white shadow-lg` 
                    : 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed pointer-events-none'
                }`}
              >
                {isUpcoming ? 'Find your launch event' : 'Registration Closed'}
              </a>
            </div>

            {/* Bottom branding (bottom-right text) */}
            <div className="absolute bottom-4 right-6 flex items-center gap-1.5 text-slate-600">
              <Cpu className="h-3 w-3 text-purple-500/50" />
              <span className="text-[8px] font-bold uppercase tracking-wider">AWS SBG RIMT</span>
            </div>
          </div>
        </div>

        {/* Event Overview Section */}
        <div className="p-8 rounded-3xl border border-slate-900 bg-[#0a0f1e]/50 backdrop-blur-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight font-display">Event Overview</h2>
            <p className="text-slate-400 text-sm whitespace-pre-line leading-relaxed">
              {structured?.description || event.longDescription || event.description}
            </p>
          </div>

          {/* Calendar integration for upcoming events */}
          {isUpcoming && dateInfo && (
            <div className="pt-6 border-t border-slate-900/60 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">Registrations are currently open:</span>
              <a
                href={gCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-white transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Add to Google Calendar
              </a>
            </div>
          )}
        </div>

        {/* Structured details: What you will learn */}
        {structured?.whatYouWillLearn && structured.whatYouWillLearn.length > 0 && (
          <div className="p-8 rounded-2xl border border-slate-900 bg-[#0a0f1e]/50 backdrop-blur-sm space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">What You&apos;ll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {structured.whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-400 leading-relaxed">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured details: Speakers */}
        {structured?.speakers && structured.speakers.length > 0 && (
          <div className="p-8 rounded-2xl border border-slate-900 bg-[#0a0f1e]/50 backdrop-blur-sm space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Speakers & Facilitators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {structured.speakers.map((speaker, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/60 items-start">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                    {speaker.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white leading-none">{speaker.name}</h4>
                      {speaker.linkedin && (
                        <a 
                          href={speaker.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-blue-400 transition-colors"
                          title={`${speaker.name}'s LinkedIn`}
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-orange-400 font-semibold">{speaker.role}</p>
                    <p className="text-[10px] text-slate-500">{speaker.company}</p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1.5">{speaker.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organizer info block */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-[#0a0f1e]/50 backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Host Community</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm select-none">
                AWS
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">AWS Student Builder Group</p>
                <p className="text-xs text-slate-500">RIMT University Chapter</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs text-slate-400 md:items-end">
            <p>Questions? Contact the organizer at:</p>
            <a href="mailto:sbg.rimt@gmail.com" className="text-orange-400 hover:text-white font-bold transition-colors">
              sbg.rimt@gmail.com
            </a>
          </div>
        </div>

        {/* Structured details: FAQs */}
        {structured?.faqs && structured.faqs.length > 0 && (
          <div className="p-8 rounded-2xl border border-slate-900 bg-[#0a0f1e]/50 backdrop-blur-sm space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-3 pt-2">
              {structured.faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="rounded-xl border border-slate-900 bg-slate-950/60 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-200 hover:text-white transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-400" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Share & Copy Link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900/60 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-orange-400/80" />
            <span className="font-bold uppercase tracking-wider">Share event:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all font-semibold"
            >
              WhatsApp
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all font-semibold"
            >
              X / Twitter
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all font-semibold"
            >
              LinkedIn
            </a>
            <button 
              onClick={handleCopyLink} 
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-semibold cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
