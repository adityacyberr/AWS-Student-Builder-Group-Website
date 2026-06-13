import { TeamMember } from "@/data/team";

export function OrgHierarchy({
  members,
  onOpenMember,
}: {
  members: TeamMember[];
  onOpenMember: (m: TeamMember) => void;
}) {
  const leader = members.find((m) => m.role === "Group Leader");
  const others = members.filter((m) => m.role !== "Group Leader");

  if (!leader) {
    return (
      <div className="relative max-w-5xl mx-auto border border-slate-900 rounded-2xl bg-slate-950/60 p-12 text-center text-slate-500 shadow-2xl">
        No hierarchy data loaded.
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto border border-slate-900 rounded-2xl bg-slate-950/60 p-6 sm:p-8 md:p-12 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-0">
        {/* Group Leader Node */}
        <div className="flex flex-col items-center w-full">
          <button
            onClick={() => onOpenMember(leader)}
            className="px-8 py-5 rounded-xl border border-orange-500/40 bg-orange-500/[0.03] text-center shadow-xl hover:border-orange-500 transition-all relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Chapter Head
            </div>
            <h4 className="text-xl font-extrabold text-white tracking-tight">
              {leader.name}
            </h4>
            <p className="text-xs text-orange-400 font-semibold">
              {leader.role}
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              {leader.branch} ({leader.specialization})
            </p>
          </button>

          {/* Connector tree - Desktop Only */}
          <div className="hidden lg:flex w-full flex-col items-center mt-0">
            <div className="h-10 w-0.5 bg-slate-700" />
            <div className="h-0.5 w-[82%] bg-slate-700" />
            <div className="w-[82%] flex justify-between">
              {others.map((_, i) => (
                <div key={i} className="h-8 w-0.5 bg-slate-700" />
              ))}
            </div>
          </div>
          {/* Mobile Connector - Simple Line */}
          <div className="flex lg:hidden h-8 w-0.5 bg-slate-700" />
        </div>

        {/* Core Team Nodes */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {others.map((member) => (
            <button
              key={member.id}
              onClick={() => onOpenMember(member)}
              className="px-2 py-4 rounded-lg border border-slate-800 hover:border-orange-500/50 bg-slate-950 text-center shadow-md hover:-translate-y-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 motion-reduce:hover:translate-y-0"
            >
              <h5 className="text-xs font-bold text-white truncate">
                {member.name}
              </h5>
              <p className="text-[9px] font-semibold text-orange-400">
                {member.role}
              </p>
              <p className="text-[8px] text-slate-300">{member.branch}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
