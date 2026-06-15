"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { 
  Search, Calendar, Users, Megaphone, Trophy, Image as ImageIcon, Sparkles, X, CornerDownLeft
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "event" | "team" | "announcement" | "achievement" | "gallery";
  url: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Search Queries (Debounced or directly handled on change)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (!isSupabaseConfigured || !supabase) {
          // Mock search results for local sandbox testing
          const mockItems: SearchResult[] = ([
            { id: "e1", title: "Cloud Development Boot Camp", subtitle: "Event", type: "event", url: "/admin/events" },
            { id: "t1", title: "Aditya (Technical Head)", subtitle: "Team Member", type: "team", url: "/admin/team" },
            { id: "a1", title: "AWS Community Days Announcement", subtitle: "Announcement", type: "announcement", url: "/admin/announcements" },
            { id: "ac1", title: "First Chapter Founded", subtitle: "Achievement", type: "achievement", url: "/admin/achievements" },
          ] as SearchResult[]).filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
          
          setResults(mockItems);
          setLoading(false);
          return;
        }

        const searchQueryStr = `%${query}%`;
        const [
          { data: events },
          { data: team },
          { data: announcements },
          { data: achievements },
          { data: gallery },
        ] = await Promise.all([
          supabase.from("events").select("id, title, slug").ilike("title", searchQueryStr).limit(3),
          supabase.from("team_members").select("id, name, role").ilike("name", searchQueryStr).limit(3),
          supabase.from("announcements").select("id, title").ilike("title", searchQueryStr).limit(3),
          supabase.from("achievements").select("id, title").ilike("title", searchQueryStr).limit(3),
          supabase.from("gallery_images").select("id, title").ilike("title", searchQueryStr).limit(3),
        ]);

        const combinedResults: SearchResult[] = [];

        if (events) {
          events.forEach(e => {
            combinedResults.push({ id: e.id, title: e.title, subtitle: "Event", type: "event", url: "/admin/events" });
          });
        }
        if (team) {
          team.forEach(t => {
            combinedResults.push({ id: t.id, title: `${t.name} (${t.role})`, subtitle: "Team Member", type: "team", url: "/admin/team" });
          });
        }
        if (announcements) {
          announcements.forEach(a => {
            combinedResults.push({ id: a.id, title: a.title, subtitle: "Announcement", type: "announcement", url: "/admin/announcements" });
          });
        }
        if (achievements) {
          achievements.forEach(a => {
            combinedResults.push({ id: a.id, title: a.title, subtitle: "Achievement", type: "achievement", url: "/admin/achievements" });
          });
        }
        if (gallery) {
          gallery.forEach(g => {
            combinedResults.push({ id: g.id, title: g.title, subtitle: "Gallery Image", type: "gallery", url: "/admin/gallery" });
          });
        }

        setResults(combinedResults);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation inside result list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[activeIndex]) {
          router.push(results[activeIndex].url);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, activeIndex, router, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "event": return <Calendar className="h-4 w-4 text-orange-500" />;
      case "team": return <Users className="h-4 w-4 text-orange-500" />;
      case "announcement": return <Megaphone className="h-4 w-4 text-orange-500" />;
      case "achievement": return <Trophy className="h-4 w-4 text-orange-500" />;
      case "gallery": return <ImageIcon className="h-4 w-4 text-orange-500" />;
      default: return <Sparkles className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-xl transform overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl transition-all flex flex-col">
        {/* Input Field */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="h-4.5 w-4.5 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, team members, announcements..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-750 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
          >
            Esc
          </button>
        </div>

        {/* Results / Empty View */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Searching records...
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
              <Search className="h-6 w-6 text-zinc-650" />
              <span>No results found for &quot;{query}&quot;</span>
            </div>
          ) : !query.trim() ? (
            <div className="py-6 px-4 text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Suggestions</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: "Manage Events", url: "/admin/events", icon: <Calendar className="h-3.5 w-3.5" /> },
                  { name: "Team Roster", url: "/admin/team", icon: <Users className="h-3.5 w-3.5" /> },
                  { name: "Announcements", url: "/admin/announcements", icon: <Megaphone className="h-3.5 w-3.5" /> },
                  { name: "Site Settings", url: "/admin/settings", icon: <ImageIcon className="h-3.5 w-3.5" /> },
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.url);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white border border-transparent hover:border-zinc-750 transition-all"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1">Search Results</p>
              {results.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.url);
                      onClose();
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all ${
                      isActive 
                        ? "bg-zinc-800 text-white border border-zinc-700" 
                        : "text-zinc-400 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-md ${isActive ? 'bg-zinc-900 text-orange-500' : 'bg-zinc-900/50 text-zinc-500'}`}>
                        {getIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.title}</p>
                        <p className="text-[9px] text-zinc-500 font-mono">{item.subtitle}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                        <span>Go</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
