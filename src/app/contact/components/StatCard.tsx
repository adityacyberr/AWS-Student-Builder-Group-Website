import { motion, Variants } from "framer-motion";

export function StatCard({
  icon,
  label,
  value,
  variants,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variants?: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, borderColor: "rgba(255,140,0,0.4)", boxShadow: "0 8px 30px rgba(255,140,0,0.1)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
      className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(255,140,0,0.01)] cursor-default select-none"
    >
      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-400">{label}</h4>
        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
