"use client";

import { Mail, MapPin, ExternalLink, Calendar } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 block mb-2">Connect</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Connect with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500">Builders</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Have questions about upcoming bootcamps, workshops, or sponsorships? Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 flex">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/80 p-6 md:p-8 space-y-6 flex flex-col justify-between w-full">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Contact Information</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Connect with the core leaders directly. We typically reply within 24 hours.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Email Us</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">sbg.rimt@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Our Campus</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        School of Computing, RIMT University<br />
                        Mandi Gobindgarh, Punjab, India (147301)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reply note */}
              <div className="pt-6 border-t border-slate-900 text-xs text-slate-500">
                <p className="leading-relaxed">
                  Looking to register for a specific workshop? Find all dynamic registrations on the official event listings.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Connect With Us Section */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white tracking-tight mb-1">Connect With Us</h3>
              <p className="text-slate-450 text-xs leading-relaxed">
                Join our channels to stay updated, register for events, and follow our stories.
              </p>
            </div>

            {/* Meetup Card (Primary) */}
            <a
              href="https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-start gap-5 p-6 rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/[0.04] to-slate-950/80 transition-all duration-300 hover:border-orange-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {/* Primary accent indicator */}
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-500 text-white shadow-sm">
                Primary Channel
              </span>

              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 min-w-0 pr-20">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5 tracking-tight group-hover:text-orange-400 transition-colors">
                  Meetup
                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join the official chapter. Register for all upcoming bootcamps, workshops, and cloud labs, and track builder events live.
                </p>
              </div>
            </a>

            {/* LinkedIn Card */}
            <a
              href="https://www.linkedin.com/company/awsrimt/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-5 p-6 rounded-2xl border border-slate-900 bg-slate-950/70 transition-all duration-300 hover:border-blue-500/45 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
              <div className="space-y-1.5 min-w-0">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5 tracking-tight group-hover:text-blue-400 transition-colors">
                  LinkedIn
                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-slate-355 leading-relaxed">
                  Follow our official page. Access student builder highlights, cloud learning articles, event schedules, and network with mentors.
                </p>
              </div>
            </a>

            {/* Instagram Card */}
            <a
              href="https://www.instagram.com/aws.rimt/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-5 p-6 rounded-2xl border border-slate-900 bg-slate-950/70 transition-all duration-300 hover:border-pink-500/45 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(236,72,153,0.06)] focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="space-y-1.5 min-w-0">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5 tracking-tight group-hover:text-pink-400 transition-colors">
                  Instagram
                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-slate-355 leading-relaxed">
                  Follow @aws.rimt for micro-learning posts, community stories, sneak peeks of upcoming hackathons, and event highlights.
                </p>
              </div>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
