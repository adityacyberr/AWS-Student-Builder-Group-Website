"use client";

import React from "react";

export type StatusType = "draft" | "published" | "archived" | "active" | "inactive" | "upcoming" | "completed";

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case "published":
      case "active":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "draft":
      case "upcoming":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "archived":
      case "completed":
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
      case "inactive":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase select-none ${getStyles()}`}>
      {status}
    </span>
  );
}
