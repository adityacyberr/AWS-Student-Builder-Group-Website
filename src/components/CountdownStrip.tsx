"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getLocalEvents, EventItem } from "@/data/events";
import { enrichEvent } from "@/lib/eventEnricher";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Rocket } from "lucide-react";

function calculateEventStatus(dateStr: string, dbStatus: string): "upcoming" | "completed" {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let parsed = Date.parse(dateStr);
    if (isNaN(parsed)) {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length === 3 && !isNaN(parseInt(parts[0])) && isNaN(parseInt(parts[1]))) {
        const reParsed = Date.parse(`${parts[1]} ${parts[0]}, ${parts[2]}`);
        if (!isNaN(reParsed)) {
          const eventDate = new Date(reParsed);
          eventDate.setHours(23, 59, 59, 999);
          return eventDate.getTime() < today.getTime() ? "completed" : "upcoming";
        }
      }
      return dbStatus as "upcoming" | "completed";
    }
    const eventDate = new Date(parsed);
    eventDate.setHours(23, 59, 59, 999);
    return eventDate.getTime() < today.getTime() ? "completed" : "upcoming";
  } catch {
    return dbStatus as "upcoming" | "completed";
  }
}

function parseDateString(dateStr: string): number {
  let parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length === 3 && !isNaN(parseInt(parts[0])) && isNaN(parseInt(parts[1]))) {
      const reParsed = Date.parse(`${parts[1]} ${parts[0]}, ${parts[2]}`);
      if (!isNaN(reParsed)) return reParsed;
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
        startTime = `${String(hours).padStart(2, "0")}:${minutes}`;
      }
    }
    let parsedDate = Date.parse(normalizedDate);
    if (isNaN(parsedDate)) {
      const parts = normalizedDate.split(/\s+/);
      if (parts.length === 3 && !isNaN(parseInt(parts[0])) && isNaN(parseInt(parts[1]))) {
        normalizedDate = `${parts[1]} ${parts[0]}, ${parts[2]}`;
      }
      parsedDate = Date.parse(normalizedDate);
    }
    if (isNaN(parsedDate)) return null;
    const baseDate = new Date(parsedDate);
    const [h, m] = startTime.split(":").map(Number);
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h, m, 0);
  } catch {
    return null;
  }
}

function Digit({ value }: { value: string }) {
  return (
    <span className="inline-block min-w-[1.15em] text-center font-black tabular-nums text-orange-400">
      {value}
    </span>
  );
}

export default function CountdownStrip() {
  const pathname = usePathname();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  const isHidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/reset-password");

  useEffect(() => {
    // Load local data immediately
    const localEvents = getLocalEvents().map((ev) =>
      enrichEvent({ ...ev, status: calculateEventStatus(ev.date, ev.status) })
    );
    const upcoming = localEvents
      .filter((e) => e.status === "upcoming")
      .sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
    if (upcoming.length > 0) setEvent(upcoming[0]);

    // Try Supabase in background
    async function trySupabase() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const fetchPromise = supabase.from("events").select("*");
        const timeout = new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), 5000)
        );
        const { data, error } = (await Promise.race([fetchPromise, timeout])) as any;
        if (!error && data && data.length > 0) {
          const mapped: EventItem[] = data.map((d: any) =>
            enrichEvent({
              id: d.id, title: d.title, slug: d.slug, date: d.date, time: d.time || "",
              type: d.type, location: d.location, description: d.description,
              longDescription: d.long_description || "", registrationLink: d.registration_link,
              status: calculateEventStatus(d.date, d.status),
              coverPlaceholderColor: d.cover_placeholder_color, imageUrl: d.image_url || "",
            })
          );
          const up = mapped
            .filter((e) => e.status === "upcoming")
            .sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
          if (up.length > 0) setEvent(up[0]);
        }
      } catch {}
    }
    trySupabase();
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!event) return;
    const eventDate = parseEventDateTime(event.date, event.time || "");
    if (!eventDate) return;

    const tick = () => {
      const diff = eventDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [event]);

  if (isHidden || !event || !timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-full bg-[#0a0e1a]/90 backdrop-blur-md border-b border-orange-500/10 relative z-30 overflow-hidden">
      {/* Subtle shimmer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-orange-500/[0.04] to-transparent countdown-strip-shimmer" />
      </div>

      <Link
        href={`/events/${event.slug}`}
        className="mx-auto max-w-7xl h-10 px-4 flex items-center justify-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Rocket className="h-3.5 w-3.5 text-orange-500/70" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold text-slate-400">
            Countdown to our first event
          </span>
        </div>

        <span className="text-slate-700 select-none">|</span>

        <div className="flex items-center gap-1 text-sm sm:text-base font-mono tracking-wider">
          <Digit value={pad(timeLeft.d)} />
          <span className="text-orange-500/40 text-xs">d</span>
          <span className="text-slate-600 mx-0.5">:</span>
          <Digit value={pad(timeLeft.h)} />
          <span className="text-orange-500/40 text-xs">h</span>
          <span className="text-slate-600 mx-0.5">:</span>
          <Digit value={pad(timeLeft.m)} />
          <span className="text-orange-500/40 text-xs">m</span>
          <span className="text-slate-600 mx-0.5">:</span>
          <Digit value={pad(timeLeft.s)} />
          <span className="text-orange-500/40 text-xs">s</span>
        </div>
      </Link>

      <style jsx>{`
        .countdown-strip-shimmer {
          animation: stripShimmer 4s ease-in-out infinite;
        }
        @keyframes stripShimmer {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
