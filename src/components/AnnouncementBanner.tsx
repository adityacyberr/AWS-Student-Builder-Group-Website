"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
  button_text?: string | null;
  destination_url?: string | null;
}

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [visible, setVisible] = useState(false);

  // Hide the banner on admin, login, and reset flow paths
  const isAuthOrPanelPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  useEffect(() => {
    async function loadAnnouncements() {
      if (isAuthOrPanelPath) {
        setVisible(false);
        return;
      }

      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from("announcements")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false });

          if (!error && data) {
            const valid = (data as AnnouncementItem[]).filter((ann) => {
              const titleLower = (ann.title || "").toLowerCase().trim();
              const contentLower = (ann.content || "").toLowerCase().trim();
              return (
                titleLower !== "" &&
                contentLower !== "" &&
                titleLower !== "test" &&
                contentLower !== "test" &&
                titleLower !== "testing" &&
                contentLower !== "testing" &&
                !titleLower.includes("test") &&
                !contentLower.includes("test")
              );
            });
            setAnnouncements(valid);
            setVisible(valid.length > 0);
          }
        } else {
          // Sandbox Fallback
          const stored = localStorage.getItem("aws_sbg_announcements");
          if (stored) {
            const parsed = JSON.parse(stored) as AnnouncementItem[];
            const activeList = parsed.filter((ann) => ann.active);
            setAnnouncements(activeList);
            setVisible(activeList.length > 0);
          } else {
            // Default seed announcement in sandbox
            const defaultAnns: AnnouncementItem[] = [
              {
                id: "1",
                title: "AWS Cloud Bootcamp registrations are now open.",
                content: "Register today for our structured study track and get access to cloud sandbox environments.",
                date: "June 22, 2025",
                active: true,
                button_text: "Learn More",
                destination_url: "https://www.meetup.com/aws-sbg-at-rimt-university/",
              },
            ];
            localStorage.setItem("aws_sbg_announcements", JSON.stringify(defaultAnns));
            setAnnouncements(defaultAnns);
            setVisible(true);
          }
        }
      } catch (err) {
        console.warn("Error loading announcements in banner:", err);
      }
    }

    loadAnnouncements();
  }, [pathname, isAuthOrPanelPath]);

  // If path is auth/admin or there are no announcements, do not render
  if (isAuthOrPanelPath || !visible || announcements.length === 0) {
    return null;
  }

  const activeAnn = announcements[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0, y: -20 }}
        animate={{ height: "auto", opacity: 1, y: 0 }}
        exit={{ height: 0, opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-40 bg-[#14141e]/85 backdrop-blur-[12px] border-b border-orange-500/25 flex-shrink-0 overflow-hidden shadow-md banner-pulse-glow"
      >
        <div className="mx-auto max-w-7xl h-12 md:h-14 px-4 flex items-center justify-center">
          <div className="flex items-center gap-3 w-full overflow-x-auto scrollbar-none whitespace-nowrap justify-start md:justify-center py-1">
            <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-orange-500 text-white uppercase tracking-wider select-none">
              📢 Announcement
            </span>
            <span className="font-semibold text-white text-[15px] md:text-[16px] truncate max-w-[220px] sm:max-w-md md:max-w-2xl flex-shrink-0">
              {activeAnn.title}
            </span>
            <span className="text-slate-400 text-[13px] flex-shrink-0">
              {activeAnn.date}
            </span>
            {activeAnn.destination_url && (
              <>
                <span className="text-slate-600 flex-shrink-0 select-none">&bull;</span>
                <a
                  href={activeAnn.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-350 font-semibold text-[13px] hover:underline flex-shrink-0 cursor-pointer flex items-center gap-0.5"
                >
                  {activeAnn.button_text || "Learn More"} →
                </a>
              </>
            )}
          </div>
        </div>

        <style jsx global>{`
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @keyframes subtle-orange-glow {
            0%, 100% {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 -1px 0 rgba(255, 165, 0, 0.15);
            }
            50% {
              box-shadow: 0 4px 30px rgba(255, 140, 0, 0.08), inset 0 -1px 0 rgba(255, 165, 0, 0.35);
            }
          }
          .banner-pulse-glow {
            animation: subtle-orange-glow 3s infinite ease-in-out;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
