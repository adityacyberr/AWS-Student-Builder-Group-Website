"use client";

import { SolarSystemHero } from "@/components/home/SolarSystemHero";
import { UpcomingEventSection } from "@/components/home/UpcomingEventSection";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#050816] overflow-hidden">
      <SolarSystemHero />
      <UpcomingEventSection />
    </div>
  );
}
