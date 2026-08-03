"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Share2, Sparkles, CheckCircle2 } from "lucide-react";

interface MemeRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName?: string;
}

// Multi-type Card Pool (😂 Funny, 🎯 Motivation, 💡 Fun Fact, ✨ Inspiring Quote)
const REWARD_CARDS = [
  "😂 Your Downloads folder just got promoted.",
  "😂 One more certificate. Zero regrets.",
  "😂 Parents: \"Phone hi chalata rehta hai.\" Me: Certificate dekho 😎",
  "😂 Time to pretend this was easy.",
  "😂 Certificate downloaded. Now go show your parents 😂",
  "😂 One more PDF. Infinite happiness.",
  "😂 This certificate deserves a LinkedIn post.",
  "😂 Attendance finally paid off.",
  "😂 Bro came. Bro learned. Bro got the certificate.",
  "😂 The workshop is over. The flex begins.",
  "😂 Bro actually finished the workshop.",
  "😂 Grandparents won't understand, but they'll still be proud.",
  "😂 Go celebrate. Even if it's with Maggi.",
  "😂 Nobody can say 'tu kuch karta hi nahi.'",
  "😂 Save it somewhere safe 😭",
  "😂 Don't rename it 'New Document (2).pdf'",
  "😂 Mom's WhatsApp status material right here.",
  "😂 Folder name: 'Important Certificates (Do Not Delete)'",
  "😂 Tea & samosa well earned today.",
  "🎯 Achievement Unlocked: Workshop Survivor",
  "🎯 +100 Confidence",
  "🎯 Resume upgraded.",
  "🎯 Core memory unlocked.",
  "🎯 Today's mission completed.",
  "🎯 One step closer to your dreams.",
  "🎯 Clean win for the day.",
  "🎯 Bragging rights successfully downloaded.",
  "🎯 Proof of attendance level: Master.",
  "🎯 Another milestone unlocked.",
  "🎯 Victory Royale!",
  "💡 Fun fact: You'll probably forget where you saved this PDF.",
  "💡 Your future self says thanks.",
  "💡 Hard work looks good in PDF format.",
  "💡 This PDF carries emotional value.",
  "💡 Proof that 2 hours were well spent.",
  "💡 Your attendance record is glowing.",
  "💡 You showed up and you conquered.",
  "✨ Small wins become big careers.",
  "✨ Today's certificate. Tomorrow's opportunity.",
  "✨ Hard work looks good on you.",
  "✨ Small win. Big feeling.",
  "✨ Every small step counts.",
  "✨ The effort was real, the result is here.",
  "✨ Keep this energy going forever.",
  "✨ Pure happiness in PDF format."
];

// Playful, light text loading messages (No spinners!)
const PLAYFUL_LOADING_MESSAGES = [
  "Choosing another one...",
  "Hold up 😂",
  "This one's better...",
  "Finding peak comedy...",
  "Trust the process...",
  "One sec...",
  "Rolling the meme dice...",
  "Loading happiness...",
  "Picking today's winner...",
  "Searching the vault...",
  "Hold tight...",
  "Worth the wait..."
];

export function MemeRewardModal({ isOpen, onClose, participantName }: MemeRewardModalProps) {
  const [cardText, setCardText] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [headerStep, setHeaderStep] = useState<number>(0);
  
  // Playful transition state (no spinner)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMsg, setTransitionMsg] = useState<string>("");

  const previousCardRef = useRef<string>("");
  const previousMsgRef = useRef<string>("");

  // Handle sequence animation on modal initial open
  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      setIsTransitioning(false);
      setHeaderStep(0);
      return;
    }

    // 1. Header line-by-line reveal
    const h1Timer = setTimeout(() => setHeaderStep(1), 120);
    const h2Timer = setTimeout(() => setHeaderStep(2), 480);
    const revealTimer = setTimeout(() => setIsRevealed(true), 600);

    // Select initial card
    pickRandomCard();

    return () => {
      clearTimeout(h1Timer);
      clearTimeout(h2Timer);
      clearTimeout(revealTimer);
    };
  }, [isOpen]);

  // Pick random card avoiding consecutive duplicate
  const getRandomCard = (): string => {
    let next = REWARD_CARDS[Math.floor(Math.random() * REWARD_CARDS.length)];
    if (REWARD_CARDS.length > 1 && next === previousCardRef.current) {
      const filtered = REWARD_CARDS.filter((c) => c !== previousCardRef.current);
      next = filtered[Math.floor(Math.random() * filtered.length)];
    }
    previousCardRef.current = next;
    return next;
  };

  // Pick random transition message avoiding consecutive duplicate
  const getRandomTransitionMessage = (): string => {
    let next = PLAYFUL_LOADING_MESSAGES[Math.floor(Math.random() * PLAYFUL_LOADING_MESSAGES.length)];
    if (PLAYFUL_LOADING_MESSAGES.length > 1 && next === previousMsgRef.current) {
      const filtered = PLAYFUL_LOADING_MESSAGES.filter((m) => m !== previousMsgRef.current);
      next = filtered[Math.floor(Math.random() * filtered.length)];
    }
    previousMsgRef.current = next;
    return next;
  };

  const pickRandomCard = () => {
    setCardText(getRandomCard());
  };

  // 😂 Another Meme playful transition handler (No spinners)
  const handleAnotherMeme = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTransitionMsg(getRandomTransitionMessage());

    // 550ms - 700ms smooth playful delay
    const delay = Math.floor(Math.random() * 150) + 550;

    setTimeout(() => {
      pickRandomCard();
      setIsTransitioning(false);
    }, delay);
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

        {/* Premium Centered Glassmorphism Modal (Linear + Apple + Discord Easter Egg Aesthetic) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-orange-500/30 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-orange-500/10 overflow-hidden my-auto"
        >
          {/* Soft ambient orange & amber background radial glow */}
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Close Button with Subtle Border Glow */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── HEADER (Line-by-Line Satisfying Reveal) ── */}
          <div className="flex flex-col items-center text-center space-y-2 mb-5">
            {/* Glowing Badge with Sparkle Animation */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-[11px] font-extrabold tracking-wider text-orange-400 uppercase shadow-sm shadow-orange-500/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
              <span>🎁 ONE LAST THING...</span>
            </motion.div>

            {/* Line 1 Reveal */}
            {headerStep >= 1 && (
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg sm:text-xl font-extrabold text-white tracking-tight"
              >
                Since you survived the workshop...
              </motion.h2>
            )}

            {/* Line 2 Reveal */}
            {headerStep >= 2 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400"
              >
                ...here&apos;s your reward ✊
              </motion.p>
            )}
          </div>

          {/* ── SUCCESS INDICATOR ROW ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-1.5 mb-4 text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-full w-max mx-auto"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Certificate Downloaded Successfully</span>
          </motion.div>

          {/* ── CONTENT MEME CARD AREA (Breathing Room + Glass Effect) ── */}
          <div className="relative min-h-[220px] flex flex-col items-center justify-center">
            {isRevealed && (
              <div className="w-full flex flex-col items-center space-y-4">
                <AnimatePresence mode="wait">
                  {/* Humorous Dashed Box + Randomized Card Pill */}
                  <motion.div
                    key={cardText}
                    initial={{ opacity: isTransitioning ? 0.4 : 0, scale: 0.97 }}
                    animate={{ opacity: isTransitioning ? 0.4 : 1, scale: 1 }}
                    exit={{ opacity: 0.4, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="w-full flex flex-col items-center space-y-4"
                  >
                    {/* Humorous Glass Box */}
                    <div className="w-full rounded-2xl border border-dashed border-orange-500/30 bg-slate-950/70 backdrop-blur-xl p-6 text-center space-y-2 shadow-inner shadow-orange-500/5 relative overflow-hidden">
                      <span className="text-4xl block leading-none">😂</span>
                      <p className="text-sm font-bold text-white tracking-tight">
                        Looks like someone forgot to upload the memes.
                      </p>
                      <p className="text-xs text-slate-400">
                        (Probably the Technical Head.)
                      </p>

                      {/* Playful text loading overlay when swapping (No spinner) */}
                      {isTransitioning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
                        >
                          <span className="text-xs sm:text-sm font-extrabold text-orange-400 tracking-wide animate-pulse">
                            {transitionMsg}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Randomized Fun Fact / Quote / Motivation Card Pill */}
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full px-5 py-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-center shadow-lg shadow-orange-500/5 backdrop-blur-sm"
                    >
                      <p className="text-xs sm:text-sm font-bold text-orange-300">
                        &ldquo;{cardText}&rdquo;
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── FOOTER BUTTONS WITH MICRO-INTERACTIONS ── */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-slate-800/80"
            >
              {/* Another Meme Button with Lift + Glow + Icon Rotation */}
              <button
                onClick={handleAnotherMeme}
                disabled={isTransitioning}
                className="group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-orange-400 transition-transform duration-300 group-hover:rotate-45 ${isTransitioning ? 'animate-spin' : ''}`} />
                <span>{isTransitioning ? "Unlocking..." : "😂 Another Meme"}</span>
              </button>

              {/* Share on LinkedIn Button with Blue Glow + Lift */}
              <button
                onClick={handleShareLinkedIn}
                className="group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Share2 className="h-3.5 w-3.5 text-white transition-transform duration-200 group-hover:scale-110" />
                <span>💼 Share</span>
              </button>

              {/* Close Button with Subtle Border Glow */}
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
