"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-amber-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-emerald-500/20 bg-zinc-900/95 shadow-emerald-950/20";
      case "error":
        return "border-rose-500/20 bg-zinc-900/95 shadow-rose-950/20";
      case "info":
      default:
        return "border-amber-500/20 bg-zinc-900/95 shadow-amber-950/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md max-w-sm ${getBorderColor()}`}
    >
      {getIcon()}
      <span className="text-xs font-medium text-zinc-100 leading-tight">{message}</span>
      <button
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded-lg hover:bg-zinc-800"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
