"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronDown,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Eye,
  Lock,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateCertificatePDF,
  generateWatermarkedPreviewDataUrl,
  downloadBlob,
  CertificateConfig,
} from "@/lib/certificateGenerator";

interface CertEvent {
  id: string;
  title: string;
}

type Step = "idle" | "loading" | "preview" | "downloading" | "success" | "error";

/* Custom AWS Orange Gradient Certificate SVG Glyph */
function CertificateGlyph() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      {/* Certificate Frame */}
      <rect x="6" y="8" width="36" height="28" rx="4" fill="url(#awsOrangeGrad)" fillOpacity="0.15" stroke="url(#awsOrangeGrad)" strokeWidth="2.5" />
      {/* Internal Ribbon lines */}
      <path d="M12 16H36M12 22H26" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      {/* Verified Checkmark Ribbon Badge */}
      <circle cx="33" cy="28" r="9" fill="url(#awsOrangeGrad)" />
      <path d="M29 28L32 31L37 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* AWS Smile Curve at bottom */}
      <path d="M14 39C20 42.5 28 42.5 34 39" stroke="url(#badgeGlow)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32.5 38L35 39.5L34 37" stroke="url(#badgeGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CertificatesPage() {
  const [events, setEvents] = useState<CertEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [rollNumber, setRollNumber] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot check honeypot
  const [step, setStep] = useState<Step>("idle");
  const [participantName, setParticipantName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [issuedCount, setIssuedCount] = useState<string>("50+");
  
  // Preview Data
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [certConfig, setCertConfig] = useState<CertificateConfig | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Load live stat counter + events on mount
  useEffect(() => {
    async function loadData() {
      // 1. Fetch credibility stat
      try {
        const res = await fetch("/api/certificates/stats");
        const data = await res.json();
        if (data.displayStat) {
          setIssuedCount(data.displayStat);
        }
      } catch (err) {
        console.warn("Failed to load cert stats:", err);
      }

      // 2. Fetch published events
      const defaultEventList: CertEvent[] = [
        { id: "default-kiroverse", title: "KIROverse — AWS Student Builder Group" }
      ];

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("certificate_events")
            .select("id, title")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            setEvents(data);
            setSelectedEvent(data[0].id);
            setEventsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load certificate events:", err);
        }
      }

      setEvents(defaultEventList);
      setSelectedEvent(defaultEventList[0].id);
      setEventsLoading(false);
    }
    loadData();
  }, []);

  // Step 1: Submit Roll Number -> Lookup Certificate
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = rollNumber.trim();
    if (!clean || !selectedEvent) return;

    setStep("loading");
    setErrorMessage("");
    setParticipantName("");
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/certificates/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent,
          rollNumber: clean,
          hp: honeypot, // Honeypot field
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
        // Generic non-technical error under input
        setErrorMessage("No certificate found for this Roll Number. Please verify and try again.");
        setStep("error");
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      setErrorMessage("No certificate found for this Roll Number. Please verify and try again.");
      setStep("error");
    }
  };

  // Step 2: Confirm Download PDF
  const handleDownloadPDF = async () => {
    if (!participantName || !certConfig || !templateUrl) return;
    setStep("downloading");

    try {
      const blob = await generateCertificatePDF(templateUrl, participantName, certConfig);
      const fileName = `${participantName.replace(/\s+/g, "_")}_AWS_Certificate.pdf`;
      downloadBlob(blob, fileName);
      setStep("success");
    } catch (err) {
      console.error("PDF download error:", err);
      setErrorMessage("Failed to download PDF. Please try again.");
      setStep("error");
    }
  };

  const handleReset = () => {
    setStep("idle");
    setRollNumber("");
    setParticipantName("");
    setErrorMessage("");
    setPreviewUrl(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-16 overflow-hidden">
      {/* Background dot-grid & ambient glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-orange-500/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-500/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Credibility Stat Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 mb-6 text-xs font-semibold text-orange-400 shadow-sm"
        >
          <ShieldCheck className="h-4 w-4 text-orange-400" />
          <span>{issuedCount} Official Certificates Issued</span>
        </motion.div>

        {/* Heading & SVG Glyph */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-6 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30 flex items-center justify-center mb-3 shadow-lg shadow-orange-500/5">
            <CertificateGlyph />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Download Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              Certificate
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-sm leading-relaxed">
            Enter your official Roll Number to preview and download your verified AWS certificate.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-black/30 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* ── STEP 1: IDLE / LOADING / ERROR FORM ── */}
            {(step === "idle" || step === "loading" || step === "error") && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-7"
              >
                <form onSubmit={handleLookup} className="space-y-4">
                  {/* Honeypot hidden field for bot protection */}
                  <input
                    type="text"
                    name="hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Restyled Event Selector Dropdown */}
                  {eventsLoading ? (
                    <div className="h-11 rounded-xl bg-slate-800/50 animate-pulse" />
                  ) : events.length > 1 ? (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Select Event
                      </label>
                      <div className="relative">
                        <select
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 hover:border-slate-700 transition-all cursor-pointer"
                        >
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  ) : events.length === 1 ? (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <ShieldCheck className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-xs text-orange-300 font-semibold truncate">
                        {events[0].title}
                      </span>
                    </div>
                  ) : null}

                  {/* Roll Number Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Roll Number
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={rollNumber}
                        onChange={(e) => {
                          setRollNumber(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="e.g. 25BCSE014"
                        className={`w-full rounded-xl border bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 font-mono tracking-wider focus:outline-none transition-all ${
                          errorMessage
                            ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                            : "border-slate-800 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                        }`}
                        disabled={step === "loading"}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>

                    {/* Generic Inline Error Message */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 mt-2 text-xs text-red-400"
                      >
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Search / Submit Button */}
                  <button
                    type="submit"
                    disabled={step === "loading" || !rollNumber.trim() || !selectedEvent}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-orange-500/15 hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                  >
                    {step === "loading" ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Generating Preview...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Find My Certificate
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: WATERMARKED PREVIEW CARD & CONFIRM DOWNLOAD ── */}
            {step === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-7 flex flex-col items-center space-y-4"
              >
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Search
                  </button>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                    <Eye className="h-3 w-3" /> Preview Ready
                  </span>
                </div>

                {/* Watermarked Preview Canvas Box */}
                {previewUrl && (
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Certificate Preview"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-base font-bold text-white">
                    Certificate for <span className="text-orange-400">{participantName}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified Roll Number: <span className="font-mono text-slate-300">{rollNumber.toUpperCase()}</span>
                  </p>
                </div>

                {/* Confirm Download Button */}
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Certificate
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: DOWNLOADING / SUCCESS STATE ── */}
            {(step === "downloading" || step === "success") && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 flex flex-col items-center text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 15 }}
                  className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <div>
                  <h3 className="text-base font-bold text-white">Download Complete!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Certificate for <span className="text-orange-400 font-semibold">{participantName}</span> has been saved.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                >
                  Download Another Certificate
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trouble finding certificate support link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col items-center gap-2 text-center"
        >
          <a
            href="https://wa.me/919517960225?text=Hi%2C%20I%20need%20help%20finding%20my%20AWS%20certificate."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <HelpCircle className="h-3.5 w-3.5 group-hover:text-emerald-400 transition-colors" />
            Trouble finding your certificate? <span className="underline decoration-emerald-500/40 text-emerald-400 font-medium">Contact Support on WhatsApp</span>
          </a>
          <span className="flex items-center gap-1 text-[10px] text-slate-600 uppercase tracking-widest font-semibold select-none">
            <Lock className="h-3 w-3" /> Secure Verification &bull; AWS Student Builder Group
          </span>
        </motion.div>
      </div>
    </div>
  );
}
