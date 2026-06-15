"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { TeamMember } from "@/data/team";
import Image from "next/image";

interface BottomSheetProps {
  member: TeamMember | null;
  onClose: () => void;
  onViewProfile: (member: TeamMember) => void;
}

export function BottomSheet({ member, onClose, onViewProfile }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {member && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden pointer-events-auto"
          />

          {/* Bottom sheet panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-[28px] border-t border-orange-500/25 bg-[#080a16]/96 backdrop-blur-xl p-6 pb-8 z-50 md:hidden pointer-events-auto shadow-[0_-8px_40px_rgba(255,145,0,0.12)]"
            style={{ touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative bar */}
            <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-800/80 mb-5" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-4">
              {/* Avatar frame */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500/30 flex-shrink-0 shadow-[0_0_15px_rgba(255,145,0,0.25)] bg-slate-950">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center font-bold text-orange-400 text-lg">
                    {member.initials}
                  </div>
                )}
              </div>

              {/* Title info */}
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold text-white truncate leading-tight">
                  {member.name}
                </h3>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block mt-0.5">
                  {member.role}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {member.branch} • {member.specialization}
                </span>
              </div>
            </div>

            {/* Bio section */}
            <div className="mt-4 relative">
              <p className="text-xs text-slate-350 leading-relaxed max-h-[50px] overflow-hidden text-ellipsis line-clamp-2">
                {member.bio}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-[#080a16] to-transparent pointer-events-none" />
            </div>

            {/* Skills pills */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {member.focusAreas.slice(0, 4).map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-500/5 border border-orange-500/15 text-orange-300 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-orange-400" />
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {member.linkedin && member.linkedin !== "javascript:void(0)" ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 px-4 rounded-xl border border-orange-500/40 hover:border-orange-500 hover:bg-orange-500/5 text-xs font-bold text-orange-400 hover:text-white transition-all text-center"
                >
                  LinkedIn
                </a>
              ) : (
                <div className="flex items-center justify-center h-10 px-4 rounded-xl border border-slate-800 text-xs font-bold text-slate-500 text-center select-none">
                  No LinkedIn
                </div>
              )}

              <button
                onClick={() => {
                  onClose();
                  onViewProfile(member);
                }}
                className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-orange-500/10 transition-all cursor-pointer"
              >
                <span>View Profile</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
