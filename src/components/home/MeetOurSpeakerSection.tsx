"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSpeakers, CMSSpeaker } from "@/lib/cms";
import { Calendar, MapPin, Sparkles, ChevronLeft, ChevronRight, Globe, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const AWSLogo = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v1zm1.53-3.77c-.36.27-.53.53-.53 1.02 0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5 0-1.14.51-1.66 1.03-2.05.35-.26.54-.42.54-.68 0-.39-.31-.7-.7-.7-.34 0-.61.24-.68.56-.06.27-.3.44-.57.44h-1c-.32 0-.57-.29-.51-.6C10.02 9.07 10.93 8.5 12 8.5c1.38 0 2.5 1.12 2.5 2.5 0 .82-.41 1.25-.97 1.73z" />
  </svg>
);

export function MeetOurSpeakerSection() {
  const [speakers, setSpeakers] = useState<CMSSpeaker[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        const data = await getSpeakers();
        // Only show featured speakers
        const featured = data.filter((s) => s.isFeatured);
        setSpeakers(featured);
      } catch (err) {
        console.warn("Failed to load speakers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSpeakers();
  }, []);

  if (loading || speakers.length === 0) return null;

  const currentSpeaker = speakers[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % speakers.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + speakers.length) % speakers.length);
  };

  // Maps badge text to custom premium icons
  const getBadgeIcon = (badgeText: string) => {
    const text = badgeText.toLowerCase();
    if (text.includes("community builder")) {
      return <AWSLogo className="h-3.5 w-3.5 text-orange-400" />;
    }
    if (text.includes("certified")) {
      return <Sparkles className="h-3.5 w-3.5 text-purple-400" />;
    }
    if (text.includes("voices")) {
      return (
        <svg className="h-3.5 w-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      );
    }
    // Default graduation/learning hat
    return (
      <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    );
  };

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#050816] overflow-hidden">
      {/* Dynamic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto space-y-10 relative z-10">
        {/* Header Block */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Our First Guest
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Meet Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              Speaker
            </span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            We are honored to welcome an inspiring builder and AWS expert.
          </p>
        </div>

        {/* Carousel Content */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSpeaker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-[#080c16]/85 backdrop-blur-md p-8 sm:p-10 shadow-2xl flex flex-col md:grid md:grid-cols-[1.1fr_1.9fr] gap-8 sm:gap-12 min-h-[460px]"
            >
              {/* Left Column: Image, Quote */}
              <div className="flex flex-col items-center justify-between space-y-6 md:space-y-0 h-full border-b md:border-b-0 md:border-r border-slate-800/50 pb-8 md:pb-0 md:pr-8">
                <div className="relative group">
                  {/* Glowing accent ring */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-500 opacity-60 blur-[6px] group-hover:opacity-90 transition duration-300 animate-pulse" />
                  
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-slate-950 bg-slate-900 shadow-xl">
                    <img
                      src={currentSpeaker.imageUrl || "/events/bhoomi-raut.png"}
                      alt={currentSpeaker.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {currentSpeaker.quote && (
                  <div className="space-y-2 text-center max-w-[240px]">
                    <span className="text-3xl text-purple-500/50 font-serif leading-none block">“</span>
                    <p className="text-xs sm:text-sm italic font-medium text-slate-300 leading-relaxed mt-[-8px]">
                      {currentSpeaker.quote}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Speaker info & badge */}
              <div className="flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  {/* Name and sparkly indicator */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-1.5">
                      {currentSpeaker.name}
                      <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                    </h3>
                  </div>

                  {/* Role / Title */}
                  <p className="text-xs sm:text-sm font-bold tracking-wide text-orange-400 uppercase leading-none font-mono">
                    {currentSpeaker.title}
                  </p>

                  {/* Badges Grid */}
                  {currentSpeaker.achievements && currentSpeaker.achievements.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {currentSpeaker.achievements.map((badge, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300 shadow-sm"
                        >
                          {getBadgeIcon(badge)}
                          <span>{badge}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pt-2">
                    {currentSpeaker.bio}
                  </p>

                  {/* Associated Event Card */}
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 space-y-3.5 max-w-md mt-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none block">
                      Featured Event
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5">
                        <Calendar className="h-4 w-4 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            KIROverse — Build Smarter. Ship Faster.
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            31 July 2026
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <span className="text-[10px] font-medium text-slate-400">
                          AWS Student Builder Group at RIMT University
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Connect Links */}
                {currentSpeaker.socialLinks && (
                  <div className="pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Connect with {currentSpeaker.name.split(" ")[0]}
                      </span>
                      <div className="flex items-center gap-2.5">
                        {currentSpeaker.socialLinks.linkedin && (
                          <a
                            href={currentSpeaker.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/40 hover:shadow-[0_0_10px_rgba(168,85,247,0.15)] transition-all cursor-pointer"
                          >
                            <LinkedInIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {currentSpeaker.socialLinks.twitter && (
                          <a
                            href={currentSpeaker.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/40 hover:shadow-[0_0_10px_rgba(168,85,247,0.15)] transition-all cursor-pointer"
                          >
                            <TwitterIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {currentSpeaker.socialLinks.website && (
                          <a
                            href={currentSpeaker.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/40 hover:shadow-[0_0_10px_rgba(168,85,247,0.15)] transition-all cursor-pointer"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation Buttons */}
          {speakers.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 select-none">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-slate-800 bg-[#080c16]/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Pagination Dots */}
              <div className="flex gap-1.5">
                {speakers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIndex === idx ? "w-6 bg-purple-500" : "w-1.5 bg-slate-800 hover:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-slate-800 bg-[#080c16]/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        {currentSpeaker.socialLinks?.linkedin && (
          <div className="text-center pt-4">
            <a
              href={currentSpeaker.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-purple-500/35 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider text-xs shadow-lg hover:shadow-purple-500/[0.08] transition-all duration-300"
            >
              <span>View Speaker Profile</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
