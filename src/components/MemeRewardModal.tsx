"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Share2, Newspaper, CheckCircle2 } from "lucide-react";

interface MemeRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName?: string;
}

const BOTTOM_STORIES = [
  "• Parents have been informed.",
  "• Downloads folder just got stronger.",
  "• Resume updated successfully.",
  "• Confidence increased by 100%.",
  "• One more achievement unlocked.",
  "• Sources say the student smiled after downloading.",
  "• Career XP increased.",
  "• Mission accomplished.",
  "• The certificate is now safely stored... hopefully.",
  "• Friends are expected to ask for the PDF.",
  "• Motivation levels temporarily increased.",
  "• Witnesses report excessive happiness.",
  "• Another workshop successfully survived.",
  "• Resume has received a minor buff.",
  "• LinkedIn post detected.",
  "• Coffee tastes better after achievements.",
  "• HR still doesn't know... yet.",
  "• Today's achievement has been archived.",
  "• Future self approves this decision.",
  "• Student status upgraded.",
  "• Progress saved successfully."
];

export function MemeRewardModal({ isOpen, onClose, participantName }: MemeRewardModalProps) {
  const [currentStory, setCurrentStory] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [headerStep, setHeaderStep] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const previousStoryRef = useRef<string>("");

  const nameToDisplay = participantName && participantName.trim().length > 0
    ? participantName.trim().toUpperCase()
    : "PARTICIPANT";

  // Handle sequence animation on modal initial open
  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      setIsTransitioning(false);
      setHeaderStep(0);
      return;
    }

    // 1. Header line-by-line reveal sequence
    const h1Timer = setTimeout(() => setHeaderStep(1), 100);
    const h2Timer = setTimeout(() => setHeaderStep(2), 350);
    const revealTimer = setTimeout(() => setIsRevealed(true), 500);

    // Select initial random story
    pickRandomStory();

    return () => {
      clearTimeout(h1Timer);
      clearTimeout(h2Timer);
      clearTimeout(revealTimer);
    };
  }, [isOpen]);

  const getRandomStory = (): string => {
    let next = BOTTOM_STORIES[Math.floor(Math.random() * BOTTOM_STORIES.length)];
    if (BOTTOM_STORIES.length > 1 && next === previousStoryRef.current) {
      const filtered = BOTTOM_STORIES.filter((s) => s !== previousStoryRef.current);
      next = filtered[Math.floor(Math.random() * filtered.length)];
    }
    previousStoryRef.current = next;
    return next;
  };

  const pickRandomStory = () => {
    setCurrentStory(getRandomStory());
  };

  // Next Story button handler
  const handleAnotherStory = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      pickRandomStory();
      setIsTransitioning(false);
    }, 350);
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `Excited to have completed the KIROverse Workshop organized by AWS Student Builder Group at RIMT University! 🚀`
    );
    const url = encodeURIComponent("https://aws.adityacyber.in/certificates");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank", "width=600,height=600");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Subtle Backdrop Blur & Dark Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        />

        {/* Premium Centered Glassmorphism Breaking News Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-orange-500/30 bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-orange-500/10 overflow-hidden my-auto"
        >
          {/* Soft ambient orange & amber background radial glow */}
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── TOP BADGE: BREAKING NEWS ── */}
          <div className="flex flex-col items-center text-center space-y-2 mb-4">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-[11px] font-extrabold tracking-wider text-red-400 uppercase shadow-sm shadow-red-500/10 animate-pulse"
            >
              <Newspaper className="h-3.5 w-3.5 text-red-400" />
              <span>🚨 BREAKING NEWS</span>
            </motion.div>
          </div>

          {/* ── SUCCESS INDICATOR ROW ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-1.5 mb-4 text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full w-max mx-auto"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Certificate Downloaded Successfully</span>
          </motion.div>

          {/* ── BREAKING NEWS CARD AREA ── */}
          <div className="relative min-h-[200px] flex flex-col items-center justify-center">
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full flex flex-col items-center space-y-4"
              >
                {/* News Article Box */}
                <div className="w-full rounded-2xl border border-orange-500/25 bg-slate-950/80 backdrop-blur-xl p-5 sm:p-6 text-left space-y-3.5 shadow-xl shadow-orange-500/5 relative overflow-hidden">
                  
                  {/* Headline */}
                  {headerStep >= 1 && (
                    <motion.h2
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg sm:text-xl font-extrabold text-white tracking-tight border-b border-slate-800/80 pb-2 flex items-center justify-between"
                    >
                      <span>Breaking News</span>
                      <span className="text-[10px] font-mono font-normal text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                        LIVE REPORT
                      </span>
                    </motion.h2>
                  )}

                  {/* Subheadline & Body */}
                  {headerStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2.5"
                    >
                      <p className="text-xs sm:text-sm font-bold text-orange-300 leading-relaxed">
                        Breaking News: <span className="text-white underline decoration-orange-500/50">{nameToDisplay}</span> has successfully escaped KIROverse with a certificate.
                      </p>
                      
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Our reporters confirm that the certificate has been safely downloaded. Eyewitnesses say LinkedIn activity is expected within the next few hours. 😂
                      </p>
                    </motion.div>
                  )}

                  {/* Bottom Story Pill */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStory}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2"
                    >
                      <span className="text-xs font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-full">
                        {currentStory}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Small Footer Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center space-y-0.5"
                >
                  <p className="text-xs font-medium text-slate-300">
                    Thank you, <span className="text-orange-400 font-semibold">{nameToDisplay}</span>, for being a part of KIROverse.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    We can&apos;t wait to see you at our next event ❤️
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold pt-1">
                    AWS Student Builder Group &bull; RIMT University
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* ── FOOTER BUTTONS WITH MICRO-INTERACTIONS ── */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-800/80"
            >
              {/* Next Story Button */}
              <button
                onClick={handleAnotherStory}
                disabled={isTransitioning}
                className="group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-orange-400 transition-transform duration-300 group-hover:rotate-45 ${isTransitioning ? 'animate-spin' : ''}`} />
                <span>{isTransitioning ? "Next Story..." : "😂 Next Story"}</span>
              </button>

              {/* Share on LinkedIn Button */}
              <button
                onClick={handleShareLinkedIn}
                className="group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Share2 className="h-3.5 w-3.5 text-white transition-transform duration-200 group-hover:scale-110" />
                <span>💼 Share</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all duration-200 hover:shadow-sm"
              >
                <span>✕ Close</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
