"use client";

import { useState, useEffect } from "react";
import { GALLERY_ITEMS, GalleryItem } from "@/data/achievements";
import { Image as ImageIcon, PlusCircle } from "lucide-react";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function GalleryPage() {
  const [filter, setFilter] = useState<"all" | "events" | "workshops" | "labs">("all");
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    async function loadGallery() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("gallery_images")
            .select("*")
            .order("created_at", { ascending: false });
          if (!error && data && data.length > 0) {
            setItems(data.map((d: any) => ({
              id: d.id,
              title: d.title,
              date: d.date,
              description: d.description,
              category: d.category,
              placeholderColor: d.placeholder_color,
              imageUrl: d.image_url,
            })));
          } else {
            setItems([...GALLERY_ITEMS]);
          }
        } catch (err) {
          console.error("Error loading gallery from Supabase:", err);
          setItems([...GALLERY_ITEMS]);
        }
      } else {
        setItems([...GALLERY_ITEMS]);
      }
    }

    loadGallery();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const getPlaceholderBg = (color: string) => {
    switch (color) {
      case "orange":
        return "from-orange-500/10 to-amber-500/5";
      case "blue":
        return "from-blue-500/10 to-indigo-500/5";
      case "purple":
        return "from-purple-500/10 to-pink-500/5";
      case "mint":
        return "from-emerald-500/10 to-teal-500/5";
      default:
        return "from-slate-900 to-slate-950";
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 block mb-2">Memory Lane</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Builder <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Gallery</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Snapshots of our workshops, bootcamps, and hackathons. Upload real photos easily via the admin panel.
          </p>

          {/* Filter tabs */}
          <div className="flex justify-center gap-2 mt-8">
            {(["all", "events", "workshops", "labs"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  filter === cat
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    : "bg-slate-900/60 text-slate-400 border-slate-900 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-900 rounded-3xl bg-slate-950/40 max-w-md mx-auto">
            <ImageIcon className="h-10 w-10 text-slate-650 mx-auto mb-4 animate-pulse-slow" />
            <h3 className="text-lg font-bold text-white mb-2">No Gallery Uploads Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              We haven't uploaded any event snapshots yet. Check back soon or upload them via the admin dashboard!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/80 p-4 shadow-sm hover:border-slate-800 transition-all flex flex-col space-y-4"
              >
                {/* Premium Image Box or Placeholder */}
                <div className="h-48 rounded-xl relative overflow-hidden border border-slate-900/50 flex flex-col items-center justify-center text-center group-hover:border-orange-500/30 transition-all duration-300">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderBg(item.placeholderColor)} flex flex-col items-center justify-center p-4`}>
                      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                      <ImageIcon className="h-8 w-8 text-slate-650 group-hover:scale-105 transition-transform duration-300 mb-2" />
                      <span className="text-xs text-slate-500 font-medium tracking-wide">Photo Slot TBD</span>
                      <span className="text-[10px] text-slate-650 font-mono mt-1">Upload via Supabase Admin Panel</span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-500 border border-slate-850 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
