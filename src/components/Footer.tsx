"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface DBSettingRow {
  key: string;
  value: string;
}

export default function Footer() {
  const pathname = usePathname();
  const isAuthOrPanelPath = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/reset-password");

  if (isAuthOrPanelPath) return null;

  const [meetupUrl, setMeetupUrl] = useState("https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups");
  const [whatsappUrl, setWhatsappUrl] = useState("https://chat.whatsapp.com/aws-sbg-rimt");
  const [contactEmail, setContactEmail] = useState("sbg.rimt@gmail.com");

  useEffect(() => {
    async function loadSettings() {
      if (typeof window !== "undefined") {
        setMeetupUrl(localStorage.getItem("aws_sbg_meetup_url") || "https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups");
        setWhatsappUrl(localStorage.getItem("aws_sbg_whatsapp_url") || "https://chat.whatsapp.com/aws-sbg-rimt");
        setContactEmail(localStorage.getItem("aws_sbg_contact_email") || "sbg.rimt@gmail.com");
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("site_settings")
            .select("*");
          if (!error && data) {
            (data as DBSettingRow[]).forEach((row) => {
              if (row.key === "meetup_url" && row.value) setMeetupUrl(row.value);
              if (row.key === "whatsapp_url" && row.value) setWhatsappUrl(row.value);
              if (row.key === "contact_email" && row.value) setContactEmail(row.value);
            });
          }
        } catch (err) {
          console.error("Error loading settings in footer:", err);
        }
      }
    }

    loadSettings();
  }, []);
  return (
    <footer className="border-t border-slate-900 bg-slate-980 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Disclaimer */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5 select-none py-1 text-left">
              <div className="flex items-center justify-center h-10 px-2.5 rounded-lg bg-[#0e1726] border border-blue-500/30 shadow-inner relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 opacity-90" />
                <div className="flex flex-col leading-[1.1]">
                  <span className="text-xs font-black tracking-widest text-white flex items-center gap-0.5">
                    RIMT<span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block" />
                  </span>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-300">
                    AWS SBG
                  </span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold text-white">
                  RIMT AWS Student Builder Group
                </span>
                <span className="text-[9px] font-medium text-slate-450 mt-0.5">
                  RIMT University, Punjab, India
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-md">
              Building the next generation of cloud builders through learning, collaboration, and innovation.
            </p>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Disclaimer: AWS Student Builder Group (SBG) at RIMT University is a student-led community. 
              This group is run independently of Amazon Web Services (AWS) Inc. The content, opinions, and 
              activities hosted by this group are solely those of its members and do not represent the official 
              positions or endorsement of Amazon Web Services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orange-400 transition-colors">About</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-orange-400 transition-colors">Events</Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-orange-400 transition-colors">Team</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-orange-400 transition-colors">Gallery</Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-orange-400 transition-colors">Achievements</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-400 transition-colors">Admin</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Connect Info */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Connect</h4>
              <div className="flex flex-col text-xs space-y-1.5 pt-1 text-slate-500">
                <span>
                  Meetup:{" "}
                  <a
                    href={meetupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400/90 hover:text-orange-400 hover:underline font-mono"
                  >
                    Join Meetup
                  </a>
                </span>
                <span>
                  LinkedIn:{" "}
                  <a
                    href="https://www.linkedin.com/company/awsrimt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400/90 hover:text-orange-400 hover:underline font-mono"
                  >
                    Follow Page
                  </a>
                </span>
                <span>
                  Instagram:{" "}
                  <a
                    href="https://www.instagram.com/aws.rimt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400/90 hover:text-orange-400 hover:underline font-mono"
                  >
                    Follow @aws.rimt
                  </a>
                </span>
                <span>
                  WhatsApp:{" "}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400/90 hover:text-orange-400 hover:underline font-mono"
                  >
                    Join Group
                  </a>
                </span>
                <span>
                  Email:{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-orange-400/90 hover:text-orange-400 hover:underline font-mono"
                  >
                    {contactEmail}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} RIMT AWS Student Builder Group. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Powered by student builders at RIMT University</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">Mandi Gobindgarh, Punjab, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
