"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  X,
  Award,
  ChevronRight,
  HelpCircle,
  Lock,
  FileCheck,
} from "lucide-react";
import {
  generateCertificatePDF,
  generateWatermarkedPreviewDataUrl,
  downloadBlob,
  CertificateConfig,
} from "@/lib/certificateGenerator";

export interface EventItemPublic {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  event_type: string;
  description: string;
  location: string;
  template_url: string | null;
  name_x: number;
  name_y: number;
  font_family: string;
  font_size: number;
  font_weight: string;
  text_color: string;
  text_align: "left" | "center" | "right";
  is_published: boolean;
  created_at: string;
  participant_count: number;
}

type VerificationStep = "input" | "loading" | "preview" | "downloading" | "success" | "error";

/* Custom AWS Orange Gradient Certificate SVG Glyph */
function CertificateGlyph() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="awsOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9900" />
          <stop offset="100%" stopColor="#ff7700" />
        </linearGradient>
        <linearGradient id="badgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb84d" />
          <stop offset="100%" stopColor="#ff9900" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="36" height="28" rx="4" fill="url(#awsOrangeGrad)" fillOpacity="0.15" stroke="url(#awsOrangeGrad)" strokeWidth="2.5" />
      <path d="M12 16H36M12 22H26" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      <circle cx="33" cy="28" r="9" fill="url(#awsOrangeGrad)" />
      <path d="M29 28L32 31L37 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 39C20 42.5 28 42.5 34 39" stroke="url(#badgeGlow)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32.5 38L35 39.5L34 37" stroke="url(#badgeGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CertificatesArchivePage() {
  // Events state
  const [events, setEvents] = useState<EventItemPublic[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("All");

  // Selected Event & Verification Modal state
  const [activeModalEvent, setActiveModalEvent] = useState<EventItemPublic | null>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [step, setStep] = useState<VerificationStep>("input");
  const [participantName, setParticipantName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [certConfig, setCertConfig] = useState<CertificateConfig | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Load published events on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/certificates/events");
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to load certificate archive events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  // Compute available years from events
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    events.forEach((ev) => {
      const match = ev.event_date.match(/\b(20\d\d)\b/);
      if (match) {
        yearsSet.add(match[1]);
      }
    });
    const sortedYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    return ["All", ...sortedYears];
  }, [events]);

  // Filter & sort events (newest first)
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Search Query filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Year filter
      let matchesYear = true;
      if (selectedYear !== "All") {
        matchesYear = ev.event_date.includes(selectedYear);
      }

      return matchesSearch && matchesYear;
    });
  }, [events, searchQuery, selectedYear]);

  // Open verification modal for a specific event
  const openVerificationModal = (ev: EventItemPublic) => {
    setActiveModalEvent(ev);
    setRollNumber("");
    setHoneypot("");
    setStep("input");
    setParticipantName("");
    setErrorMessage("");
    setPreviewUrl(null);
    setCertConfig(null);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Close verification modal
  const closeVerificationModal = () => {
    setActiveModalEvent(null);
    setStep("input");
    setErrorMessage("");
  };

  // Submit Mobile / Roll Number Lookup
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = rollNumber.trim();
    if (!clean || !activeModalEvent) return;

    setStep("loading");
    setErrorMessage("");
    setParticipantName("");
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/certificates/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: activeModalEvent.id,
          rollNumber: clean,
          hp: honeypot,
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setErrorMessage(data.error || "Too many requests. Please wait a minute and try again.");
        setStep("error");
        return;
      }

      const data = await res.json();

      if (data.found && data.participantName && data.templateUrl && data.config) {
        setParticipantName(data.participantName);
        setTemplateUrl(data.templateUrl);
        setCertConfig(data.config);

        // Generate watermarked preview canvas image
        const previewData = await generateWatermarkedPreviewDataUrl(
          data.templateUrl,
          data.participantName,
          data.config
        );
        setPreviewUrl(previewData);
        setStep("preview");
      } else {
        setErrorMessage("No eligible certificate found for this event and registered number.");
        setStep("error");
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      setErrorMessage("No eligible certificate found for this event and registered number.");
      setStep("error");
    }
  };

  // Confirm PDF Download (Professional, Clean Flow)
  const handleDownloadPDF = async () => {
    if (!participantName || !certConfig || !templateUrl || !activeModalEvent) return;
    setStep("downloading");

    try {
      const blob = await generateCertificatePDF(templateUrl, participantName, certConfig);
      const cleanRoll = rollNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "CERT";
      const cleanName = participantName.trim().replace(/\s+/g, "_");
      const fileName = `AWS-Basics-Certificate-${cleanRoll}-${cleanName}.pdf`;

      // Download PDF directly
      downloadBlob(blob, fileName);
      setStep("success");
    } catch (err) {
      console.error("PDF download error:", err);
      setErrorMessage("Failed to download PDF. Please try again.");
      setStep("error");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white overflow-hidden pb-24">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[32rem] w-[40rem] rounded-full bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 h-[24rem] w-[24rem] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 mb-4 text-xs font-semibold text-orange-400">
              <CertificateGlyph />
              <span>Official Event Certificate Archive</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Certificates
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Find and download your certificates from AWS Student Builder Group events.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Tamper-proof &amp; Verified Credentials</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Year Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {availableYears.map((year) => {
              const isActive = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {year === "All" ? "All Events" : year}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Cards Grid */}
        {loadingEvents ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse p-6 flex flex-col justify-between"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 my-8"
          >
            <div className="h-16 w-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-4 border border-slate-700/50 text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Events Found</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-6">
              We couldn&apos;t find any published certificate events matching your current search or year filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedYear("All");
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          /* Event Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((ev, index) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="group relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-orange-500/5"
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all pointer-events-none" />

                <div>
                  {/* Category & Location Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <Tag className="h-3 w-3" />
                      {ev.event_type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      <MapPin className="h-3 w-3 text-amber-400" />
                      {ev.location}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors leading-snug">
                    {ev.title}
                  </h3>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{ev.event_date}</span>
                  </div>

                  {/* Description */}
                  {ev.description && (
                    <p className="text-slate-400 text-xs sm:text-sm mt-3 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Footer Section */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>
                      <strong className="text-slate-200">{ev.participant_count}</strong> Certificates Issued
                    </span>
                  </div>

                  <button
                    onClick={() => openVerificationModal(ev)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 group-hover:scale-[1.02]"
                  >
                    <span>Get Certificate</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Support Callout */}
        <div className="mt-16 text-center border-t border-slate-800/60 pt-10">
          <p className="text-slate-400 text-xs sm:text-sm">
            Trouble finding your event certificate?{" "}
            <a
              href={`https://wa.me/919517960225?text=${encodeURIComponent("Hi, I don’t need help finding my AWS certificate.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Contact Support <HelpCircle className="h-3.5 w-3.5 inline" />
            </a>
          </p>
        </div>
      </main>

      {/* ── EVENT-SCOPED CERTIFICATE VERIFICATION MODAL ── */}
      <AnimatePresence>
        {activeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeVerificationModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={closeVerificationModal}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Event Context Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
                  <Award className="h-3 w-3" />
                  {activeModalEvent.event_type}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activeModalEvent.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-medium">
                  <span className="text-amber-400">{activeModalEvent.event_date}</span>
                  <span>•</span>
                  <span>{activeModalEvent.location}</span>
                </div>
              </div>

              {/* Honeypot field */}
              <input
                type="text"
                name="hp_website_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="sr-only opacity-0 pointer-events-none absolute left-[-9999px]"
              />

              {/* ── STEP 1: Enter Mobile Number / Roll Number ── */}
              {(step === "input" || step === "loading" || step === "error") && (
                <form onSubmit={handleLookup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Enter Registered Mobile Number or Roll Number
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={rollNumber}
                        onChange={(e) => {
                          setRollNumber(e.target.value);
                          if (step === "error") setStep("input");
                        }}
                        placeholder="e.g. 9517960225 or 25BCSE014"
                        disabled={step === "loading"}
                        className={`w-full px-4 py-3.5 rounded-xl bg-slate-950 border ${
                          step === "error"
                            ? "border-red-500/60 focus:ring-red-500/20"
                            : "border-slate-800 focus:border-orange-500/60 focus:ring-orange-500/20"
                        } text-sm font-mono tracking-wider text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all uppercase`}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {step === "error" && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{errorMessage}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={!rollNumber.trim() || step === "loading"}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {step === "loading" ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin text-white" />
                        <span>Verifying Eligibility...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Generate Certificate</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── STEP 2: Preview Certificate & Download ── */}
              {(step === "preview" || step === "downloading" || step === "success") && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Eligible Participant Verified
                      </span>
                      <h4 className="text-base font-black text-white">{participantName}</h4>
                    </div>
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>

                  {/* Clean Professional Download Success Banner */}
                  {step === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 font-medium"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Certificate downloaded successfully! Official PDF saved to your device.</span>
                    </motion.div>
                  )}

                  {/* Live Canvas Preview */}
                  {previewUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[10px] font-bold text-amber-400 shadow">
                        Preview Watermarked
                      </div>
                      {/* eslint-disable-next-html-next-image */}
                      <img
                        src={previewUrl}
                        alt="Certificate Preview"
                        className="w-full h-auto object-contain rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={step === "downloading"}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      {step === "downloading" ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Generating Official PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>{step === "success" ? "Download PDF Again" : "Download High-Res PDF"}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setStep("input")}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Search Another Number
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
