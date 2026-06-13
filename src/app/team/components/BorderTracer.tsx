import { motion } from "framer-motion";

export function BorderTracer() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" fill="none">
      <motion.rect
        x="0.5"
        y="0.5"
        width="99.7%"
        height="99.7%"
        rx="24"
        stroke="rgba(249,115,22,0.4)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        className="will-change-[stroke-dasharray]"
      />
    </svg>
  );
}
