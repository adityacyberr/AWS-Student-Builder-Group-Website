import { Compass, Sparkles, Terminal, Award } from "lucide-react";

interface RadarBlip {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  angle: number; // Angle in degrees to position on radar
  distance: number; // Radius percent from center (30 to 90)
}

const BLIPS_DATA: RadarBlip[] = [
  {
    id: "hackathons",
    icon: <Terminal className="h-4.5 w-4.5" />,
    title: "AWS Hackathons",
    desc: "Collegiate building competitions.",
    angle: 35,
    distance: 75,
  },
  {
    id: "capstones",
    icon: <Sparkles className="h-4.5 w-4.5" />,
    title: "Capstone Projects",
    desc: "Deploying multi-tier cloud applications.",
    angle: 120,
    distance: 55,
  },
  {
    id: "certs",
    icon: <Award className="h-4.5 w-4.5" />,
    title: "Certification Drives",
    desc: "Cloud Practitioner & SysOps prep paths.",
    angle: 210,
    distance: 80,
  },
  {
    id: "meetups",
    icon: <Compass className="h-4.5 w-4.5" />,
    title: "Regional Meetups",
    desc: "Connecting with global user groups.",
    angle: 290,
    distance: 65,
  },
];

export function RoadmapRadar() {
  return (
    <div className="w-full py-8 text-left max-w-4xl mx-auto space-y-6 select-none relative z-10">
      <div>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full inline-block mb-3">
          {"// MISSION_FUTURE"}
        </span>
        <h3 className="text-2xl font-bold text-white tracking-tight">Roadmap Radar Scans</h3>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          Tactical indexing of upcoming chapter operations, bootcamps, and technical goals mapped on the horizon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
        {/* Left: Dynamic Radar Sweep Display */}
        <div className="md:col-span-6 flex justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-orange-500/10 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            {/* Concentric rings */}
            <div className="absolute inset-8 rounded-full border border-orange-500/5" />
            <div className="absolute inset-20 rounded-full border border-orange-500/5" />
            <div className="absolute inset-32 rounded-full border border-dashed border-orange-500/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-44 rounded-full border border-orange-500/5" />

            {/* Radar crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-orange-500/10" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-orange-500/10" />

            {/* Rotating radar sweep scanner */}
            <div className="absolute inset-0 origin-center animate-[sweep_6s_linear_infinite] pointer-events-none z-10">
              <div 
                className="w-1/2 h-full absolute right-0 top-0"
                style={{
                  background: "linear-gradient(90deg, rgba(255, 140, 0, 0.18) 0%, rgba(255, 140, 0, 0.0) 70%)",
                  transform: "rotate(90deg)",
                  transformOrigin: "left center",
                }}
              />
            </div>

            {/* Plot blips dynamically */}
            {BLIPS_DATA.map((blip) => {
              const rad = (blip.angle * Math.PI) / 180;
              const percent = blip.distance;
              // Center is 50%, offset is based on sine/cosine of angle
              const left = 50 + (percent / 2) * Math.cos(rad);
              const top = 50 + (percent / 2) * Math.sin(rad);

              return (
                <div
                  key={blip.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {/* Blip dot */}
                  <div className="relative cursor-pointer">
                    <span className="absolute -inset-2 rounded-full bg-orange-500/20 animate-ping [animation-duration:3s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white block shadow-[0_0_8px_#ff8c00] group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Tiny label showing over blip on hover */}
                  <div className="absolute left-4 top-0 -translate-y-1/2 bg-slate-950/90 border border-slate-800 text-[9px] font-mono font-bold text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-30">
                    {blip.title}
                  </div>
                </div>
              );
            })}

            {/* Center target dot */}
            <div className="w-4 h-4 rounded-full border border-orange-500 bg-orange-500/10 flex items-center justify-center animate-pulse z-15">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Right: Listed blip index detail cards */}
        <div className="md:col-span-6 space-y-3">
          {BLIPS_DATA.map((blip) => (
            <div
              key={blip.id}
              className="group flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-orange-500/25 transition-colors cursor-default"
            >
              <div className="p-2 rounded-lg bg-orange-500/5 border border-orange-500/10 text-orange-400/80 group-hover:scale-105 group-hover:text-orange-400 transition-all flex-shrink-0 self-start">
                {blip.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                  {blip.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {blip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
