"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function Footer() {
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
            data.forEach((row: any) => {
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
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-10 w-48">
              <Image
                src="/brand/brandmark-white.png"
                alt="AWS Student Builder Group"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
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
          <p>&copy; {new Date().getFullYear()} AWS Student Builder Group, RIMT University. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Student-Led Chapter</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">Mandi Gobindgarh, Punjab</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
