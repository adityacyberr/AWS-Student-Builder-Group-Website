"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Search, Download, CheckCircle, AlertCircle, Loader, ChevronDown, ShieldCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateCertificatePDF, downloadBlob, CertificateConfig } from "@/lib/certificateGenerator";

interface CertEvent {
  id: string;
  title: string;
}

type Step = "idle" | "loading" | "success" | "notfound" | "error";

export default function CertificatesPage() {
  const [events, setEvents] = useState<CertEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [rollNumber, setRollNumber] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [participantName, setParticipantName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load published events on mount
  useEffect(() => {
    async function loadEvents() {
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
    loadEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = rollNumber.trim().toUpperCase();
    if (!clean || !selectedEvent) return;

    setStep("loading");
    setErrorMessage("");
    setParticipantName("");

    try {
      const res = await fetch("/api/certificates/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEvent, rollNumber: clean }),
      });

      const data = await res.json();

      if (data.found && data.participantName && data.templateUrl && data.config) {
        setParticipantName(data.participantName);
        setStep("success");

        // Generate PDF and trigger download
        const config: CertificateConfig = {
          nameX: data.config.nameX,
          nameY: data.config.nameY,
          fontFamily: data.config.fontFamily,
          fontSize: data.config.fontSize,
          fontWeight: data.config.fontWeight,
          textColor: data.config.textColor,
          textAlign: data.config.textAlign,
        };

        const blob = await generateCertificatePDF(data.templateUrl, data.participantName, config);
        const fileName = `${data.participantName.replace(/\s+/g, "_")}_Certificate.pdf`;
        
        // Small delay for the success animation to play
        setTimeout(() => {
          downloadBlob(blob, fileName);
        }, 1200);
      } else {
        setStep("notfound");
      }
    } catch (err: any) {
      console.error("Certificate lookup failed:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const handleReset = () => {
    setStep("idle");
    setRollNumber("");
    setParticipantName("");
    setErrorMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 h-[30rem] w-[30rem] rounded-full bg-orange-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 h-[30rem] w-[30rem] rounded-full bg-amber-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">
            Download Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500">
              Certificate
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 text-center max-w-sm leading-relaxed">
            Enter your Roll Number to securely download your participation certificate.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* ── IDLE & LOADING ── */}
            {(step === "idle" || step === "loading") && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-8"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Event Selector */}
                  {eventsLoading ? (
                    <div className="h-12 rounded-xl bg-slate-800/60 animate-pulse" />
                  ) : events.length > 1 ? (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Event
                      </label>
                      <div className="relative">
                        <select
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                        >
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  ) : events.length === 1 ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/15">
                      <ShieldCheck className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-xs text-orange-300 font-medium truncate">
                        {events[0].title}
                      </span>
                    </div>
                  ) : null}

                  {/* Roll Number Input */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Roll Number
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 25BCSECBRS001"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 font-mono tracking-wider focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                        disabled={step === "loading" || events.length === 0}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={step === "loading" || !rollNumber.trim() || !selectedEvent || events.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-orange-500/10 transition-all active:scale-[0.98]"
                  >
                    {step === "loading" ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Generating Certificate...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Certificate
                      </>
                    )}
                  </button>

                  {events.length === 0 && !eventsLoading && (
                    <p className="text-xs text-slate-500 text-center">
                      No certificate events are currently available.
                    </p>
                  )}
                </form>
              </motion.div>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 sm:p-10 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-5"
                >
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-1">Certificate Generated!</h3>
                <p className="text-sm text-slate-400 mb-1">
                  Congratulations, <span className="text-orange-400 font-semibold">{participantName}</span>
                </p>
                <p className="text-xs text-slate-500 mb-6">
                  Your certificate PDF is downloading automatically.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-lg border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                >
                  Download Another
                </button>
              </motion.div>
            )}

            {/* ── NOT FOUND ── */}
            {step === "notfound" && (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 sm:p-10 flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Certificate Not Found</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
                  We couldn&apos;t find a certificate associated with this Roll Number. Please verify your Roll Number or contact the event organizers.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-750 transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 sm:p-10 flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                  <AlertCircle className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Something Went Wrong</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
                  {errorMessage || "An unexpected error occurred. Please try again later."}
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-750 transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center gap-1.5 text-[10px] text-slate-600 uppercase tracking-widest font-semibold select-none"
        >
          <ShieldCheck className="h-3 w-3" />
          Verified by AWS Student Builder Group
        </motion.div>
      </div>
    </div>
  );
}
