"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Toast, ToastType } from "@/components/console/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { 
  User, Camera, Save, RefreshCw, Loader, Link as LinkIcon, Award, Layout, Check, Sparkles, AlertCircle, X
} from "lucide-react";

const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function MemberDashboard() {
  const { profile, updateProfilePhoto, updateProfileDetails } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form States
  const [branch, setBranch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [quote, setQuote] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [initials, setInitials] = useState("");
  const [themeColor, setThemeColor] = useState("orange");

  // Status indicators
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autosave and Draft states
  const [draftBannerOpen, setDraftBannerOpen] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string | null>(null);

  // Card Preview State
  const [previewOpen, setPreviewOpen] = useState(false);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Initial form load from profile
  useEffect(() => {
    if (profile) {
      // Don't overwrite if user is actively typing and we have a draft
      setBranch((profile as any).branch || "");
      setSpecialization((profile as any).specialization || "");
      setBio((profile as any).bio || "");
      setQuote((profile as any).quote || "");
      setFocusAreas((profile as any).focus_areas || []);
      setLinkedin((profile as any).linkedin || "");
      setGithub((profile as any).github || "");
      setInitials((profile as any).initials || "");
      setThemeColor((profile as any).theme_color || "orange");

      // Check if sessionStorage draft exists
      const draft = sessionStorage.getItem(`profile_draft_${profile.id}`);
      if (draft) {
        setDraftBannerOpen(true);
      }
    }
  }, [profile]);

  // 2. Autosave timer (saves every 30 seconds if changes occur)
  useEffect(() => {
    if (!profile) return;

    const timer = setInterval(() => {
      const draftData = {
        branch,
        specialization,
        bio,
        quote,
        focusAreas,
        linkedin,
        github,
        initials,
        themeColor,
      };
      
      sessionStorage.setItem(`profile_draft_${profile.id}`, JSON.stringify(draftData));
      setAutosaveStatus("Draft saved locally");
      setTimeout(() => setAutosaveStatus(null), 2000);
    }, 30000);

    return () => clearInterval(timer);
  }, [profile, branch, specialization, bio, quote, focusAreas, linkedin, github, initials, themeColor]);

  // 3. Calculate Profile Completion Percentage
  const calculateCompletion = () => {
    let completed = 0;
    const totalFields = 8;

    if (branch) completed++;
    if (specialization) completed++;
    if (bio) completed++;
    if (quote) completed++;
    if (focusAreas.length > 0) completed++;
    if (profile?.photo) completed++;
    if (linkedin) completed++;
    if (github) completed++;

    return Math.round((completed / totalFields) * 100);
  };

  const completionPct = calculateCompletion();

  // Draft Actions
  const handleRestoreDraft = () => {
    if (!profile) return;
    const draft = sessionStorage.getItem(`profile_draft_${profile.id}`);
    if (draft) {
      const data = JSON.parse(draft);
      setBranch(data.branch || "");
      setSpecialization(data.specialization || "");
      setBio(data.bio || "");
      setQuote(data.quote || "");
      setFocusAreas(data.focusAreas || []);
      setLinkedin(data.linkedin || "");
      setGithub(data.github || "");
      setInitials(data.initials || "");
      setThemeColor(data.themeColor || "orange");
      showToast("Draft restored successfully!");
    }
    setDraftBannerOpen(false);
  };

  const handleDiscardDraft = () => {
    if (!profile) return;
    sessionStorage.removeItem(`profile_draft_${profile.id}`);
    setDraftBannerOpen(false);
    showToast("Draft discarded.");
  };

  // Submit profile details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateProfileDetails({
      branch,
      specialization,
      bio,
      quote,
      focus_areas: focusAreas,
      linkedin,
      github,
      initials,
      theme_color: themeColor,
    } as any);

    if (result.success) {
      showToast("Profile updated successfully!");
      if (profile) {
        sessionStorage.removeItem(`profile_draft_${profile.id}`);
      }
    } else {
      showToast(result.error || "Failed to save profile details.", "error");
    }
    setSaving(false);
  };

  // Photo Uploader
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await updateProfilePhoto(file);
    if (result.url) {
      showToast("Profile picture uploaded!");
    } else {
      showToast(result.error || "Upload failed.", "error");
    }
    setUploading(false);
  };

  // Focus areas tag managers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!focusAreas.includes(newTag.trim())) {
        setFocusAreas([...focusAreas, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFocusAreas(focusAreas.filter(t => t !== tagToRemove));
  };

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Draft restoration banner */}
      {draftBannerOpen && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
            <span>You have unsaved changes from a previous session. Do you want to restore them?</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRestoreDraft}
              className="px-2.5 py-1 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-colors"
            >
              Restore Draft
            </button>
            <button 
              onClick={handleDiscardDraft}
              className="px-2.5 py-1 border border-zinc-800 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            My Public Profile
          </h1>
          <p className="text-xs text-zinc-550 mt-1">
            Update your public information, bio, social links, and picture for the chapter directory.
          </p>
        </div>
        
        {/* Quick card preview trigger */}
        <button 
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white transition-all text-xs font-semibold select-none bg-zinc-900/10"
        >
          <Layout className="h-3.5 w-3.5 text-orange-500" />
          <span>Preview Profile Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Completion Tracker + Photo Avatar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Completion Card */}
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Profile Strength</span>
              <span className="text-xs font-bold text-orange-400 font-mono">{completionPct}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Complete your profile details (bio, socials, photo) to maximize your card strength in the public roster.
            </p>
          </div>

          {/* Photo Avatar Editor */}
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 flex flex-col items-center text-center space-y-4 relative">
            <div className="relative group select-none">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
                {profile.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-zinc-650" />
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
                    <Loader className="h-5 w-5 animate-spin text-orange-500" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-white shadow-lg transition-all"
                aria-label="Upload photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{profile.name}</h3>
              <p className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider mt-1 text-orange-500/80">{profile.role}</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-1">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Sparkles className="h-4 w-4 text-orange-500" />
            Bio & Academic Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Academic Branch</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="B.Tech CSE"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Specialization / Core Focus</label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Cybersecurity / Cloud Architecture"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Signature Quote / Tagline</label>
            <input
              type="text"
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Secure by design — building cloud skills the right way."
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Full Biography</label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell builders about your journey, what cloud skills you've acquired, and what projects you're interested in..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 resize-none"
            />
          </div>

          {/* Focus Areas interactive tags input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Focus Areas / Expertise</label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-850 min-h-[44px]">
              {focusAreas.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={focusAreas.length === 0 ? "Type a skill (e.g. IAM) and hit Enter" : "+ Add skill"}
                className="bg-transparent text-xs text-white placeholder-zinc-600 focus:outline-none px-1 flex-grow"
              />
            </div>
            <p className="text-[10px] text-zinc-600">Enter skills or technologies and press Enter (e.g. IAM, Lambda, Bedrock, Docker)</p>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pt-4 pb-3">
            <LinkIcon className="h-4 w-4 text-orange-500" />
            Social Profiles & Meta
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-555 uppercase tracking-wider block flex items-center gap-1">
                <LinkedInIcon className="h-3 w-3 text-blue-500" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-555 uppercase tracking-wider block flex items-center gap-1">
                <GitHubIcon className="h-3 w-3 text-zinc-300" />
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Profile Initials</label>
              <input
                type="text"
                maxLength={2}
                required
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                placeholder="AK"
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Portal Accent Color</label>
              <select
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
              >
                <option value="orange">Orange (Default)</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="emerald">Emerald</option>
                <option value="amber">Amber</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 flex justify-between items-center">
            {/* Autosave status pill */}
            <span className="text-[10px] font-mono text-zinc-650">
              {autosaveStatus || ""}
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 select-none"
            >
              {saving ? <Loader className="h-3 w-3 animate-spin text-zinc-950" /> : <Save className="h-3.5 w-3.5" />}
              Save My Profile
            </button>
          </div>
        </form>
      </div>

      {/* Profile Card Preview Dialog */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          
          <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-zinc-850 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 text-left shadow-2xl transition-all select-none">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute right-4 top-4 text-zinc-550 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Simulated Public Card Layout */}
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="h-24 w-24 rounded-full bg-zinc-900 border-2 border-orange-500 overflow-hidden">
                {profile.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-zinc-650 mt-6" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{profile.name}</h3>
                <p className="text-xs text-orange-400 font-bold tracking-wide uppercase mt-0.5">{profile.role}</p>
                <p className="text-[10px] text-zinc-500 font-medium font-mono mt-1">{branch} &bull; {specialization}</p>
              </div>

              {quote && (
                <p className="text-xs italic text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-900/80 w-full max-w-xs">
                  &ldquo;{quote}&rdquo;
                </p>
              )}

              {focusAreas.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 max-w-xs pt-1">
                  {focusAreas.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-zinc-900 border border-zinc-805 text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-zinc-900 w-full justify-center">
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white">
                    <LinkedInIcon className="h-4 w-4" />
                  </a>
                )}
                {github && (
                  <a href={github} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white">
                    <GitHubIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
