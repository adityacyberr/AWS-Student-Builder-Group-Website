"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getLocalEvents, EventItem } from "@/data/events";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

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
            foundEvent = {
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
              status: data.status,
              coverPlaceholderColor: data.cover_placeholder_color,
            };
          }
        } catch (err) {
          console.error("Error loading event from Supabase:", err);
        }
      }
      if (!foundEvent) {
        const local = getLocalEvents().find((e) => e.slug === slug);
        foundEvent = local || null;
      }
      setEvent(foundEvent);
      setLoading(false);
    }

    loadEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <span>Loading event details...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <ShieldAlert className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-sm mb-6">The requested event page could not be located.</p>
        <Link href="/events" className="text-xs text-orange-400 hover:underline uppercase tracking-wider font-bold">
          Back to Events
        </Link>
      </div>
    );
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

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/80 shadow-xl mb-8">
          <div className={`h-60 bg-gradient-to-br ${getPlaceholderBg(event.coverPlaceholderColor)} relative flex items-center justify-center p-8 text-center border-b border-slate-900`}>
            <div className="absolute top-6 left-6 bg-slate-950/80 px-2.5 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {event.type}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Metadata bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/50 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-500/80" />
                <div>
                  <p className="font-semibold text-slate-300">Date</p>
                  <p className="text-[11px] text-slate-500">{event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500/80" />
                <div>
                  <p className="font-semibold text-slate-300">Time</p>
                  <p className="text-[11px] text-slate-500">{event.time || "TBD"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-orange-500/80" />
                <div>
                  <p className="font-semibold text-slate-300">Location</p>
                  <p className="text-[11px] text-slate-500 truncate">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 leading-relaxed">
              <h2 className="text-xl font-bold text-white tracking-tight">Event Overview</h2>
              <p className="text-slate-300 text-sm">
                {event.longDescription || event.description}
              </p>
            </div>

            {/* Action buttons */}
            {event.status === "upcoming" ? (
              <div className="pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Registrations are open for RIMT students</span>
                </div>
                <a
                  href={event.registrationLink}
                  className="w-full sm:w-auto text-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/10 transition-all cursor-not-allowed"
                  title="Registrations Coming Soon"
                >
                  Register Now (Coming Soon)
                </a>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-900/60 text-center sm:text-left">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-500 border border-slate-850">
                  This event has concluded
                </span>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
