"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Share2, Sparkles, AlertCircle, Award } from "lucide-react";

interface MemeRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName?: string;
}

const CAPTIONS = [
  "Bro attended for the certificate 💀",
  "Downloads folder getting stronger every semester.",
  "Professional PDF Collector unlocked.",
  "Character development +100.",
  "Career upgraded. Salary still loading...",
  "Time to update LinkedIn before anyone else.",
  "Mission Complete. Certificate Secured.",
  "Bro survived. Respect.",
  "Achievement Unlocked: Workshop Survivor.",
  "Parents: Proud. Downloads Folder: Exhausted.",
  "One more PDF. Infinite Aura.",
  "Another certificate. Another excuse to flex.",
];

const LOADING_MESSAGES = [
  "Finding today's reward...",
  "Choosing the perfect meme...",
  "Consulting the Meme Gods...",
  "Almost there...",
  "Found one 😂",
];

export function MemeRewardModal({ isOpen, onClose, participantName }: MemeRewardModalProps) {
  const [memes, setMemes] = useState<string[]>([]);
  const [currentMemeIndex, setCurrentMemeIndex] = useState<number>(-1);
  const [caption, setCaption] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [headerStep, setHeaderStep] = useState<number>(0);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const previousIndexRef = useRef<number>(-1);

  // Fetch memes list from /api/memes
  useEffect(() => {
    async function fetchMemes() {
      try {
        const res = await fetch("/api/memes");
        const data = await res.json();
        if (data.memes && Array.isArray(data.memes)) {
          setMemes(data.memes);
        }
      } catch (err) {
        console.error("Failed to load memes:", err);
      }
    }
    fetchMemes();
  }, []);

  // Handle sequence animation on modal open
  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      setLoadingStep(0);
      setHeaderStep(0);
      return;
    }

    // 1. Header sequence
    const h1Timer = setTimeout(() => setHeaderStep(1), 100);
    const h2Timer = setTimeout(() => setHeaderStep(2), 500);

    // 2. Loading messages cycle (500ms intervals)
    let stepCount = 0;
    const loadingInterval = setInterval(() => {
      stepCount++;
      if (stepCount < LOADING_MESSAGES.length) {
        setLoadingStep(stepCount);
      } else {
        clearInterval(loadingInterval);
        setIsRevealed(true);
      }
    }, 450);

    // Select initial meme and caption
    selectRandomMemeAndCaption();

    return () => {
      clearTimeout(h1Timer);
      clearTimeout(h2Timer);
      clearInterval(loadingInterval);
    };
  }, [isOpen]);

  const selectRandomMemeAndCaption = () => {
    // Pick caption
    const randCaption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
    setCaption(randCaption);

    if (memes.length === 0) return;

    // Select meme without immediate consecutive duplicate
    let nextIndex = Math.floor(Math.random() * memes.length);
    if (memes.length > 1 && nextIndex === previousIndexRef.current) {
      nextIndex = (nextIndex + 1) % memes.length;
    }
    previousIndexRef.current = nextIndex;
    setCurrentMemeIndex(nextIndex);
    setImageLoading(true);
  };

  const handleAnotherMeme = () => {
    selectRandomMemeAndCaption();
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `Excited to have completed the KIROverse Workshop organized by AWS Student Builder Group at RIMT University! 🚀`
    );
    const url = encodeURIComponent("https://aws.adityacyber.in/certificates");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank", "width=600,height=600");
  };

  if (!isOpen) return null;

  const currentMemeSrc = currentMemeIndex >= 0 && memes[currentMemeIndex] ? memes[currentMemeIndex] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Premium Centered Glassmorphism Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-orange-500/30 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-orange-500/10 overflow-hidden my-auto"
        >
          {/* Ambient Glow background elements */}
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all z-20"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* ── HEADER ── */}
          <div className="flex flex-col items-center text-center space-y-2 mb-5">
            {/* Glowing Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-[11px] font-extrabold tracking-wider text-orange-400 uppercase shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
              <span>🎁 ONE LAST THING...</span>
            </motion.div>

            {/* Headline 1 */}
            {headerStep >= 1 && (
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg sm:text-xl font-extrabold text-white tracking-tight"
              >
                Since you survived the workshop...
              </motion.h2>
            )}

            {/* Headline 2 */}
            {headerStep >= 2 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400"
              >
                ...here&apos;s your reward 😂
              </motion.p>
            )}
          </div>

          {/* ── CONTENT AREA ── */}
          <div className="relative min-h-[220px] flex flex-col items-center justify-center">
            {/* 1. Loading sequence state */}
            {!isRevealed && (
              <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                <div className="h-10 w-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                <motion.p
                  key={loadingStep}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs font-semibold text-slate-300"
                >
                  {LOADING_MESSAGES[loadingStep]}
                </motion.p>
              </div>
            )}

            {/* 2. Revealed Meme State */}
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full flex flex-col items-center space-y-4"
              >
                {/* Meme Display Box or Empty State */}
                {memes.length > 0 && currentMemeSrc ? (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-orange-500/20 bg-slate-950 shadow-xl shadow-orange-500/5 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentMemeSrc}
                      alt="Secret Reward Meme"
                      onLoad={() => setImageLoading(false)}
                      className={`w-full h-auto max-h-[300px] object-contain mx-auto transition-opacity duration-300 ${
                        imageLoading ? "opacity-30 blur-sm" : "opacity-100 blur-0"
                      }`}
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Humorous Empty State */
                  <div className="w-full rounded-2xl border border-dashed border-orange-500/30 bg-slate-950/60 p-6 text-center space-y-2">
                    <span className="text-4xl">😂</span>
                    <p className="text-sm font-bold text-white">
                      Looks like someone forgot to upload the memes.
                    </p>
                    <p className="text-xs text-slate-400">
                      (Probably the Technical Head.)
                    </p>
                  </div>
                )}

                {/* Randomized Funny Caption */}
                <motion.div
                  key={caption}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center"
                >
                  <p className="text-xs sm:text-sm font-bold text-orange-300">
                    &ldquo;{caption}&rdquo;
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* ── FOOTER BUTTONS ── */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-slate-800/80"
            >
              {/* Another Meme Button */}
              <button
                onClick={handleAnotherMeme}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
                <span>😂 Another Meme</span>
              </button>

              {/* Share on LinkedIn Button */}
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Share2 className="h-3.5 w-3.5 text-white" />
                <span>💼 Share</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-300 hover:text-white transition-all"
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
