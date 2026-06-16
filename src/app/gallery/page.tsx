"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid, LayoutTemplate, ArrowUpDown, CalendarDays, SearchCode, Settings, ChevronUp, Image as ImageIcon, Heart, Eye, Share2, ArrowRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { getLocalEvents } from "@/data/events";
import { useReducedMotion } from "@/app/team/hooks/useReducedMotion";
import { FloatingBackground } from "@/app/achievements/components/FloatingBackground";
import { WireframeCube } from "@/app/achievements/components/WireframeCube";
import { WireframeGlobe } from "@/app/achievements/components/WireframeGlobe";
import { MemoriesOrbitShowcase } from "./components/MemoriesOrbitShowcase";
import { QuickStats } from "./components/QuickStats";
import { MediaInspector } from "./components/MediaInspector";

interface DBGalleryRow {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "workshops" | "events" | "community" | "celebrations";
  image_url?: string;
  participants?: number;
  location?: string;
  photo_count?: number;
}

const scrollContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const scrollItemVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface CardContainerProps {
  item: GalleryItem;
  resolvedCategory: string;
}

const CardContainer = ({
  item,
  resolvedCategory,
}: CardContainerProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const card = cardRef.current;
    if (!card) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    const instagramUrl = item.instagramUrl || "https://www.instagram.com/aws_sbg_rimt";
    window.open(instagramUrl, "_blank");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/60 p-4 shadow-[inset_0_0_12px_rgba(255,140,0,0.01)] transition-all duration-300 hover:border-orange-500/35 hover:-translate-y-2 hover:shadow-[0_12px_36px_rgba(255,140,0,0.1),inset_0_0_12px_rgba(255,140,0,0.02)] cursor-pointer select-none text-left"
    >
      {/* Cursor spotlight layer */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
        style={{
          background: "radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.08), transparent 45%)",
        }}
      />

      {/* Linear light sweep overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-750 ease-out translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none z-0" />

      <div className="space-y-4 relative z-10 flex-grow flex flex-col justify-between">
        {/* Cover Media container */}
        <div className="h-48 rounded-xl relative overflow-hidden border border-slate-900/60 flex items-center justify-center bg-slate-950 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/gallery/welcome-team.jpg";
            }}
          />
          {/* Dark grid mask */}
          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/35 transition-colors duration-300" />
          
          {/* Action overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 translate-y-2 group-hover:translate-y-0 transform transition-transform duration-300">
            <span className="px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,140,0,0.4)] transition-all">
              View on Instagram
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/85 border border-slate-800 text-orange-400 uppercase tracking-wider">
              {resolvedCategory}
            </span>
          </div>
        </div>

        {/* Text block */}
        <div className="space-y-1.5 mt-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate group-hover:text-orange-400 transition-colors">
              {item.title}
            </h4>
            <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
              {item.date}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* View on Social Media Button */}
      <div className="relative z-10 pt-3.5 mt-3 border-t border-slate-900/60 flex justify-center">
        <button className="w-full text-center py-2 px-4 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border border-orange-500/30 bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center gap-1.5 h-9">
          <span>View on Social Media</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [completedEventsCount, setCompletedEventsCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<"all" | "events" | "workshops" | "labs" | "celebrations" | "community" | "achievements">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "viewed" | "liked">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [inspectorItem, setInspectorItem] = useState<GalleryItem | null>(null);

  // Floating button state tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Social likes and views tracking parameters
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [views, setViews] = useState<Record<string, number>>({});
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const reducedMotion = useReducedMotion();

  // Scroll listener for sticky buttons
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Supabase gallery items dynamically
  useEffect(() => {
    async function fetchGalleryAndEvents() {
      if (isSupabaseConfigured && supabase) {
        try {
          const [galleryRes, eventsRes] = await Promise.all([
            supabase
              .from("gallery_images")
              .select("*")
              .order("created_at", { ascending: false }),
            supabase
              .from("events")
              .select("*")
          ]);

          if (galleryRes.data) {
            const dbItems: GalleryItem[] = galleryRes.data.map((d: any) => ({
              id: d.id,
              title: d.title,
              date: d.date,
              description: d.description,
              category: d.category,
              imageUrl: d.image_url || "/gallery/welcome-team.jpg",
              participants: 80,
              location: "RIMT University",
              photoCount: 1,
              eventId: d.event_id || undefined,
              instagramUrl: d.instagram_url || undefined,
            }));
            setItems(dbItems);
          }

          if (eventsRes.data) {
            setEvents(eventsRes.data);
            setCompletedEventsCount(eventsRes.data.filter((e: any) => e.status === "completed").length);
          }
        } catch (err) {
          console.warn("Supabase load failed, falling back to local files:", err);
        }
      } else {
        // Sandbox mode
        const storedGallery = localStorage.getItem("aws_sbg_gallery");
        if (storedGallery) {
          const storedItems = JSON.parse(storedGallery).map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.date,
            description: item.description,
            category: item.category,
            imageUrl: item.imageUrl || "/gallery/welcome-team.jpg",
            participants: 80,
            location: "RIMT University",
            photoCount: 1,
            eventId: item.eventId || undefined,
            instagramUrl: item.instagramUrl || undefined,
          }));
          setItems(storedItems);
        } else {
          setItems([]);
        }

        const localEvents = getLocalEvents();
        setEvents(localEvents);
        setCompletedEventsCount(localEvents.filter((e: any) => e.status === "completed").length);
      }
    }
    fetchGalleryAndEvents();
  }, []);

  // Likes/Views initialization
  useEffect(() => {
    if (items.length === 0) return;
    const initialLikes: Record<string, number> = {};
    const initialViews: Record<string, number> = {};
    items.forEach((item) => {
      initialLikes[item.id] = Math.floor(Math.random() * 25) + 10;
      initialViews[item.id] = Math.floor(Math.random() * 120) + 40;
    });
    setLikes(initialLikes);
    setViews(initialViews);
  }, [items]);

  // Handle like toggle
  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedItems((prev) => {
      const isLiked = !prev[id];
      setLikes((curr) => ({
        ...curr,
        [id]: isLiked ? (curr[id] || 0) + 1 : Math.max((curr[id] || 0) - 1, 0),
      }));
      return { ...prev, [id]: isLiked };
    });
  };

  // Inspect selection tracking
  const handleInspect = (item: GalleryItem) => {
    setViews((curr) => ({
      ...curr,
      [item.id]: (curr[item.id] || 0) + 1,
    }));
    setInspectorItem(item);
  };

  // Pagination navigation helpers
  const handlePrevInspector = () => {
    if (!inspectorItem) return;
    const idx = filteredItems.findIndex((i) => i.id === inspectorItem.id);
    if (idx > 0) {
      handleInspect(filteredItems[idx - 1]);
    } else {
      handleInspect(filteredItems[filteredItems.length - 1]);
    }
  };

  const handleNextInspector = () => {
    if (!inspectorItem) return;
    const idx = filteredItems.findIndex((i) => i.id === inspectorItem.id);
    if (idx < filteredItems.length - 1) {
      handleInspect(filteredItems[idx + 1]);
    } else {
      handleInspect(filteredItems[0]);
    }
  };

  // Filter & Search & Sorting Logic mapping
  const filteredItems = items
    .filter((item) => {
      // Category Filter
      if (activeCategory !== "all" && item.category !== activeCategory) return false;

      // Search Queries
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchLoc = item.location.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      // Timeline sorting: Year dropdown
      if (selectedYear !== "all") {
        const matchYear = item.date.includes(selectedYear);
        if (!matchYear) return false;
      }

      // Timeline sorting: Month dropdown
      if (selectedMonth !== "all") {
        const matchMonth = item.date.toLowerCase().includes(selectedMonth.toLowerCase());
        if (!matchMonth) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "viewed") {
        return (views[b.id] || 0) - (views[a.id] || 0);
      }
      if (sortBy === "liked") {
        return (likes[b.id] || 0) - (likes[a.id] || 0);
      }
      return 0;
    });

  return (
    <div className="relative min-h-screen bg-[#050816] bg-grid-pattern overflow-hidden py-16 md:py-24 text-slate-300">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Atmospheric shapes */}
      {!reducedMotion && <FloatingBackground count={10} />}
      <WireframeCube />
      <WireframeGlobe />

      <motion.div
        variants={scrollContainerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10 space-y-16"
      >
        {/* ================================================= */}
        {/* HERO SECTION                                      */}
        {/* ================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Heading */}
          <motion.div 
            variants={scrollItemVariants}
            className="lg:col-span-7 text-left space-y-4"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block">
              {"// MOMENTS CAPTURED"}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
              Captured Moments<br />
              at <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 filter drop-shadow-[0_0_20px_rgba(255,140,0,0.25)]">RIMT</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
              Memories from workshops, meetups, collaborations, and community milestones.
            </p>
          </motion.div>

          {/* Right Column: Memories Orbit Showcase */}
          <motion.div 
            variants={scrollItemVariants}
            className="lg:col-span-5 flex justify-center w-full"
          >
            <MemoriesOrbitShowcase />
          </motion.div>
        </div>

        {/* ================================================= */}
        {/* QUICK STATS                                       */}
        {/* ================================================= */}
        <motion.div variants={scrollItemVariants} className="w-full">
          <QuickStats
            items={items}
            completedEventsCount={completedEventsCount}
            containerVariants={scrollContainerVariants}
            itemVariants={scrollItemVariants}
          />
        </motion.div>

        {/* ================================================= */}
        {/* CONTROL CENTER BAR                                */}
        {/* ================================================= */}
        <motion.div 
          variants={scrollItemVariants}
          className="sticky top-6 z-30 w-full"
        >
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-md p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_0_12px_rgba(255,140,0,0.01)]">
            
            {/* Left: Filter categories */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "events", "workshops", "labs", "celebrations", "community", "achievements"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/35 shadow-[0_0_10px_rgba(255,140,0,0.12)]"
                      : "bg-slate-950/40 text-slate-400 border-slate-900 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Middle: Search Field */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search moments, workshops, events..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-900 bg-slate-950/90 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
              />
            </div>

            {/* Right: sorting & toggles */}
            <div className="flex items-center gap-2 justify-end">
              {/* Sort dropdown */}
              <div className="relative flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-950/80 px-3 py-2 text-xs text-slate-400">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-550" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "viewed" | "liked")}
                  className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest" className="bg-slate-950 text-white">Newest</option>
                  <option value="oldest" className="bg-slate-950 text-white">Oldest</option>
                  <option value="viewed" className="bg-slate-950 text-white">Most Viewed</option>
                  <option value="liked" className="bg-slate-950 text-white">Most Liked</option>
                </select>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center gap-0.5 rounded-xl border border-slate-900 bg-slate-950/80 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-orange-500/10 text-orange-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("masonry")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "masonry" ? "bg-orange-500/10 text-orange-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Masonry View"
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Future proof parameters (Settings modal trigger on mobile or advanced parameters) */}
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  showMobileFilters || selectedYear !== "all" || selectedMonth !== "all"
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                    : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-white"
                }`}
                title="Timeline Filters"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Timeline Filter Panel */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden mt-2 z-25"
              >
                <div className="rounded-xl border border-slate-900 bg-slate-950/95 backdrop-blur-md p-4 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <CalendarDays className="h-4 w-4 text-orange-400" /> TIMELINE_INDEX:
                  </div>

                  {/* Year Dropdown */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/60 px-2 py-1 text-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Year:</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-slate-950 text-white">All Years</option>
                      <option value="2026" className="bg-slate-950 text-white">2026</option>
                      <option value="2025" className="bg-slate-950 text-white">2025</option>
                    </select>
                  </div>

                  {/* Month Dropdown */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/60 px-2 py-1 text-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Month:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-slate-950 text-white">All Months</option>
                      <option value="may" className="bg-slate-950 text-white">May</option>
                      <option value="apr" className="bg-slate-950 text-white">April</option>
                      <option value="mar" className="bg-slate-950 text-white">March</option>
                    </select>
                  </div>

                  {/* Clear filter triggers */}
                  {(selectedYear !== "all" || selectedMonth !== "all") && (
                    <button
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedMonth("all");
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/5 px-2.5 py-1 rounded border border-orange-500/10 hover:bg-orange-500/15 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ================================================= */}
        {/* IMAGE GRID                                        */}
        {/* ================================================= */}
        {items.length === 0 ? (
          <motion.div 
            variants={scrollItemVariants}
            className="text-center py-24 border border-dashed border-slate-900/60 rounded-3xl bg-slate-950/30 max-w-md mx-auto relative z-10"
          >
            <ImageIcon className="h-10 w-10 text-orange-500/80 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">No Memories Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              No memories have been added yet. Check back after our upcoming events.
            </p>
          </motion.div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            variants={scrollItemVariants}
            className="text-center py-24 border border-dashed border-slate-900 rounded-3xl bg-slate-950/30 max-w-md mx-auto"
          >
            <SearchCode className="h-10 w-10 text-slate-650 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">No Matches Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              We couldn&apos;t find any media logs matching your search parameters or sorting filters. Try adjusting your timeline indexes.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={scrollContainerVariants}
            className={
              viewMode === "masonry"
                ? "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:balance]"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            }
          >
            {filteredItems.map((item) => {
              const linkedEvent = events.find((e) => e.id === item.eventId);
              const resolvedCategory = linkedEvent ? linkedEvent.type : item.category;

              return (
                <div key={item.id} className={viewMode === "masonry" ? "break-inside-avoid" : ""}>
                  <CardContainer 
                    item={item}
                    resolvedCategory={resolvedCategory}
                  />
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ================================================= */}
        {/* BOTTOM SECTION                                    */}
        {/* ================================================= */}
        <motion.div 
          variants={scrollItemVariants}
          className="space-y-6 pt-12 border-t border-slate-900/60 max-w-3xl mx-auto text-center"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block">
            {"// MEMORY_CELL"}
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            BUILDING MEMORIES TOGETHER
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            Every workshop, meetup, and event leaves behind stories, friendships, and learning experiences that continue shaping our builder community.
          </p>
          
          <div className="pt-4">
            <a
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(255,140,0,0.25)] hover:shadow-[0_0_36px_rgba(255,140,0,0.45)] transition-all transform hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <span>Join Our Events</span>
              <ChevronUp className="h-4 w-4 rotate-90 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Action Buttons bottom-right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        {/* Search focus */}
        <button
          onClick={() => {
            window.scrollTo({ top: 400, behavior: "smooth" });
          }}
          className="p-3 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-all hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(255,140,0,0.15)] shadow-lg cursor-pointer"
          title="Jump to search bar"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Filters panel toggle */}
        <button
          onClick={() => {
            setShowMobileFilters(!showMobileFilters);
            window.scrollTo({ top: 400, behavior: "smooth" });
          }}
          className="p-3 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-all hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(255,140,0,0.15)] shadow-lg cursor-pointer"
          title="Toggle timeline filter options"
        >
          <Settings className="h-4.5 w-4.5" />
        </button>

        {/* Scroll back to top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-3 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-all hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(255,140,0,0.15)] shadow-lg cursor-pointer"
              title="Scroll back to top"
            >
              <ChevronUp className="h-4.5 w-4.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Media detail inspector portal */}
      <AnimatePresence>
        {inspectorItem && (
          <MediaInspector
            item={inspectorItem}
            onClose={() => setInspectorItem(null)}
            onPrev={handlePrevInspector}
            onNext={handleNextInspector}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
