"use client";

import { useState, useEffect } from "react";
import { getLocalEvents, EventItem } from "@/data/events";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function EventsPage() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function loadEvents() {
      let eventsList = getLocalEvents();
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data) {
            eventsList = data.map((d: any) => ({
              id: d.id,
              title: d.title,
              slug: d.slug,
              date: d.date,
              time: d.time,
              type: d.type,
              location: d.location,
              description: d.description,
              longDescription: d.long_description,
              registrationLink: d.registration_link,
              status: d.status,
              coverPlaceholderColor: d.cover_placeholder_color,
            }));
          }
        } catch (err) {
          console.error("Error loading events from Supabase:", err);
        }
      }
      setEvents(eventsList);
    }

    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });


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

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 block mb-2">Community Events</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Bootcamps & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Tech Sessions</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Register for upcoming cloud practitioner workshops, design sprints, serverless bootcamps, and hackathons.
          </p>

          {/* Filter tabs */}
          <div className="flex justify-center gap-2 mt-8">
            {(["all", "upcoming", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  filter === status
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-md shadow-orange-500/5"
                    : "bg-slate-900/60 text-slate-400 border-slate-900 hover:text-white"
                }`}
              >
                {status} Events
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/80 hover:border-slate-800 transition-all flex flex-col group"
            >
              {/* Event Cover Styled Placeholder */}
              <div className={`h-40 bg-gradient-to-br ${getPlaceholderBg(event.coverPlaceholderColor)} border-b border-slate-900 relative flex items-center justify-center p-6 text-center`}>
                <div className="absolute top-4 left-4 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {event.type}
                </div>
                <span className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug drop-shadow-md group-hover:scale-[1.02] transition-transform duration-300">
                  {event.title}
                </span>
              </div>

              {/* Event content */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                  {event.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 pt-2 border-t border-slate-900/60 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500/70" />
                    <span>{event.date}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500/70" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500/70" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* CTA Link */}
                <div className="pt-2">
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-wider"
                  >
                    Event details
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-16 px-6 rounded-2xl border border-orange-500/20 bg-slate-950/80 backdrop-blur-sm glow-orange shadow-xl space-y-6">
            <div className="h-14 w-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto text-orange-400">
              <span className="text-2xl animate-bounce">🚀</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">New events dropping soon 🚀</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Join the community to be the first to know.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-600 shadow-md transition-all active:scale-95"
              >
                Join Our Community
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-slate-900 bg-slate-950/40">
            <p className="text-slate-500 text-sm italic">No events found in this category.</p>
          </div>
        ) : null}

      </div>
    </div>
  );
}
