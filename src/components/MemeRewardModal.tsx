"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Share2, Sparkles, Loader } from "lucide-react";

interface MemeRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName?: string;
}

// 150+ Simple, Relatable, Wholesome College Captions
const CAPTIONS = [
  "Certificate downloaded. Now go show your parents 😂",
  "One more PDF. Infinite happiness.",
  "This certificate deserves a LinkedIn post.",
  "Your Downloads folder is getting stronger.",
  "Mom: Phone pe hi rehta hai. Me: Certificate dekho 😎",
  "Today's mission completed.",
  "Attendance finally paid off.",
  "Congratulations. You officially have proof you were there.",
  "Now nobody can say you skipped it.",
  "Bro came. Bro learned. Bro got the certificate.",
  "The workshop is over. The flex begins.",
  "Screenshot this before closing.",
  "LinkedIn is calling...",
  "Achievement unlocked: Certificate Collector.",
  "One more reason to update your resume.",
  "Today's productivity: 100%.",
  "This PDF carries emotional value.",
  "One click. Lifetime memories.",
  "Now don't lose this file.",
  "That smile was worth it.",
  "You've earned this.",
  "Bro actually finished the workshop.",
  "Small win. Big feeling.",
  "The certificate looks good on you.",
  "Time to send this to the family group.",
  "Grandparents won't understand, but they'll still be proud.",
  "Your future self approves.",
  "Another day. Another achievement.",
  "Go celebrate. Even if it's with Maggi.",
  "Your hard work just became a PDF.",
  "This deserves a screenshot.",
  "Core memory unlocked.",
  "One more achievement. Many more to come.",
  "You survived. Respect.",
  "This wasn't just attendance. It was commitment.",
  "This one's staying forever in Downloads.",
  "You did the work. Now enjoy the reward.",
  "Today's main character moment.",
  "Nobody can say 'tu kuch karta hi nahi.'",
  "Now post it before your friends do.",
  "This certificate has +100 confidence.",
  "Proof that you showed up.",
  "Not bad. Not bad at all.",
  "You've unlocked bragging rights.",
  "Future you says thank you.",
  "You earned this one.",
  "Today's W.",
  "Another achievement. Keep collecting them.",
  "This is just the beginning.",
  "Go make your parents smile.",
  "Tiny win. Huge motivation.",
  "Save it somewhere safe 😭",
  "Don't rename it 'New Document (2).pdf'",
  "Please don't lose this in Downloads.",
  "One more memory unlocked.",
  "Certified workshop survivor.",
  "This PDF hits different.",
  "Well deserved.",
  "Good job. Seriously.",
  "Now go touch some grass 🌱",
  "Coffee tastes better after achievements.",
  "One step closer.",
  "Keep going.",
  "We're proud of you.",
  "Now chase the next one.",
  "Tea & samosa well earned today.",
  "Hard work looks good in PDF format.",
  "Your attendance record is glowing.",
  "Mom's WhatsApp status material right here.",
  "Folder name: 'Important Certificates (Do Not Delete)'",
  "First step to the dream job.",
  "Aura jumped +1000 points today.",
  "College memories +1.",
  "Certificate secured. Smile activated.",
  "Another proof that you're built different.",
  "Family WhatsApp group is about to be so proud.",
  "From sitting in class to collecting wins.",
  "One more badge for your journey.",
  "You showed up and you conquered.",
  "This moment is officially documented.",
  "Clean win for the day.",
  "Bragging rights successfully downloaded.",
  "Proof that 2 hours were well spent.",
  "Your efforts just paid off.",
  "Another milestone unlocked.",
  "Frame it or post it, you earned it.",
  "One PDF, endless pride.",
  "Future HR is going to love this.",
  "Proof of attendance level: Master.",
  "Bro turned up and won.",
  "This hits the happiness spot.",
  "Smiles all around today.",
  "College life peak moment.",
  "You're making progress every single day.",
  "Hard work + time = this moment.",
  "Screenshot saved to camera roll.",
  "Big proud moment.",
  "Keep this energy going forever.",
  "Zero regrets, full certificate.",
  "Every small step counts.",
  "The effort was real, the result is here.",
  "One more reason to smile today.",
  "You didn't give up. Respect.",
  "Your resume just got prettier.",
  "That feeling when the PDF opens perfectly.",
  "Another victory for the books.",
  "You're building your future step by step.",
  "Class of legends.",
  "One certificate, infinite vibes.",
  "Proof that you're leveling up.",
  "Your dedication paid off.",
  "Saved straight to the heart.",
  "High five! You did it.",
  "One more golden memory.",
  "Nothing beats a fresh certificate.",
  "Confidence level: Maximum.",
  "You make this look easy.",
  "One step closer to your dreams.",
  "This is what hard work looks like.",
  "PDF saved. Mood boosted.",
  "Shining bright today.",
  "Another chapter of success.",
  "Today was a good day.",
  "Proud of your commitment.",
  "That feeling of accomplishment.",
  "Keep collecting these moments.",
  "Your story is just getting started.",
  "W after W.",
  "Respect the hustle.",
  "Greatness in progress.",
  "You're doing amazing.",
  "Celebration time!",
  "Always keep growing.",
  "Your future is bright.",
  "Keep shining!",
  "Unstoppable energy.",
  "Victory is sweet.",
  "One more step forward.",
  "Mastery unlocked.",
  "You're on the right path.",
  "Cherish this moment.",
  "Never stop learning.",
  "Built with dedication.",
  "Keep believing in yourself.",
  "Success looks good on you.",
  "Another goal crushed.",
  "Every effort matters.",
  "Keep rising!",
  "Proud moment secured.",
  "Shine on!",
  "Pure happiness in PDF format."
];

// Simple, Fun, Relatable Loading Messages
const ANOTHER_MEME_LOADING_MESSAGES = [
  "Choosing your reward...",
  "Looking for something funny...",
  "Finding today's meme...",
  "Almost there...",
  "Trust us, this one's good.",
  "Stealing from the meme vault...",
  "Cooking something...",
  "One second...",
  "Loading happiness...",
  "This better make you laugh...",
  "Finding peak comedy...",
  "Opening the secret folder...",
  "Hold on...",
  "Worth the wait...",
  "Incoming...",
  "One more second...",
  "Randomizing fun...",
  "Choosing wisely...",
  "Rolling the meme dice...",
  "Done 😎"
];

const INITIAL_LOADING_MESSAGES = [
  "Choosing your reward...",
  "Looking for something funny...",
  "Finding today's meme...",
  "Almost there...",
  "Done 😎",
];

export function MemeRewardModal({ isOpen, onClose, participantName }: MemeRewardModalProps) {
  const [memes, setMemes] = useState<string[]>([]);
  const [currentMemeIndex, setCurrentMemeIndex] = useState<number>(-1);
  const [caption, setCaption] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [headerStep, setHeaderStep] = useState<number>(0);
  
  // Loot box "Another Meme" loading animation state
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapMessage, setSwapMessage] = useState<string>("");

  const previousMemeIndexRef = useRef<number>(-1);
  const previousCaptionRef = useRef<string>("");
  const previousLoadingMsgRef = useRef<string>("");

  // Fetch memes list from /api/memes
  useEffect(() => {
    async function fetchMemes() {
      try {
        const res = await fetch("/api/memes");
        const data = await res.json();
        if (data.memes && Array.isArray(data.memes) && data.memes.length > 0) {
          setMemes(data.memes);
        }
      } catch (err) {
        console.error("Failed to load memes:", err);
      }
    }
    fetchMemes();
  }, []);

  // Handle sequence animation on modal initial open
  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      setIsSwapping(false);
      setLoadingStep(0);
      setHeaderStep(0);
      return;
    }

    // 1. Header sequence
    const h1Timer = setTimeout(() => setHeaderStep(1), 100);
    const h2Timer = setTimeout(() => setHeaderStep(2), 500);

    // 2. Initial loading messages cycle (400ms intervals)
    let stepCount = 0;
    const loadingInterval = setInterval(() => {
      stepCount++;
      if (stepCount < INITIAL_LOADING_MESSAGES.length) {
        setLoadingStep(stepCount);
      } else {
        clearInterval(loadingInterval);
        setIsRevealed(true);
      }
    }, 450);

    // Select initial meme and caption
    pickRandomMemeAndCaption();

    return () => {
      clearTimeout(h1Timer);
      clearTimeout(h2Timer);
      clearInterval(loadingInterval);
    };
  }, [isOpen]);

  // Pick random caption avoiding consecutive duplicate
  const getRandomCaption = (): string => {
    let next = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
    if (CAPTIONS.length > 1 && next === previousCaptionRef.current) {
      const filtered = CAPTIONS.filter((c) => c !== previousCaptionRef.current);
      next = filtered[Math.floor(Math.random() * filtered.length)];
    }
    previousCaptionRef.current = next;
    return next;
  };

  // Pick random loading message avoiding consecutive duplicate
  const getRandomSwapMessage = (): string => {
    let next = ANOTHER_MEME_LOADING_MESSAGES[Math.floor(Math.random() * ANOTHER_MEME_LOADING_MESSAGES.length)];
    if (ANOTHER_MEME_LOADING_MESSAGES.length > 1 && next === previousLoadingMsgRef.current) {
      const filtered = ANOTHER_MEME_LOADING_MESSAGES.filter((m) => m !== previousLoadingMsgRef.current);
      next = filtered[Math.floor(Math.random() * filtered.length)];
    }
    previousLoadingMsgRef.current = next;
    return next;
  };

  const pickRandomMemeAndCaption = () => {
    setCaption(getRandomCaption());

    if (memes.length === 0) return;

    let nextIndex = Math.floor(Math.random() * memes.length);
    if (memes.length > 1 && nextIndex === previousMemeIndexRef.current) {
      nextIndex = (nextIndex + 1) % memes.length;
    }
    previousMemeIndexRef.current = nextIndex;
    setCurrentMemeIndex(nextIndex);
  };

  // 😂 Another Meme loot box reward handler
  const handleAnotherMeme = () => {
    if (isSwapping) return;

    setIsSwapping(true);
    setSwapMessage(getRandomSwapMessage());

    // 600ms - 850ms randomized loot box reward delay
    const delay = Math.floor(Math.random() * 250) + 600;

    setTimeout(() => {
      pickRandomMemeAndCaption();
      setIsSwapping(false);
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

        {/* Premium Centered Glassmorphism Modal (Design & Spacing Untouched) */}
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
          <div className="relative min-h-[240px] flex flex-col items-center justify-center">
            {/* 1. Initial Loading Sequence */}
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
                  {INITIAL_LOADING_MESSAGES[loadingStep]}
                </motion.p>
              </div>
            )}

            {/* 2. Revealed Meme / Swap Loading State */}
            {isRevealed && (
              <div className="w-full flex flex-col items-center space-y-4">
                <AnimatePresence mode="wait">
                  {isSwapping ? (
                    /* Loot Box Reward Animation State */
                    <motion.div
                      key="swapping"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full min-h-[220px] rounded-2xl border border-orange-500/20 bg-slate-950/80 p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xl"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-10 w-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 flex items-center justify-center"
                      >
                        <Loader className="h-5 w-5 text-orange-400" />
                      </motion.div>
                      <motion.p
                        key={swapMessage}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs sm:text-sm font-bold text-orange-300 tracking-wide"
                      >
                        {swapMessage}
                      </motion.p>
                    </motion.div>
                  ) : (
                    /* Revealed Meme Image + Caption */
                    <motion.div
                      key={currentMemeIndex}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-full flex flex-col items-center space-y-4"
                    >
                      {memes.length > 0 && currentMemeSrc ? (
                        <div className="relative w-full rounded-2xl overflow-hidden border border-orange-500/20 bg-slate-950 shadow-xl shadow-orange-500/5 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentMemeSrc}
                            alt="Secret Reward Meme"
                            className="w-full h-auto max-h-[300px] object-contain mx-auto transition-all duration-300"
                          />
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

                      {/* Randomized 150+ Wholesome College Caption */}
                      <motion.div
                        key={caption}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center"
                      >
                        <p className="text-xs sm:text-sm font-bold text-orange-300">
                          &ldquo;{caption}&rdquo;
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── FOOTER BUTTONS (EXACT DESIGN UNTOUCHED) ── */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-slate-800/80"
            >
              {/* Another Meme Button with Loot Box reward animation */}
              <button
                onClick={handleAnotherMeme}
                disabled={isSwapping}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-orange-400 ${isSwapping ? 'animate-spin' : ''}`} />
                <span>{isSwapping ? "Unlocking..." : "😂 Another Meme"}</span>
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
