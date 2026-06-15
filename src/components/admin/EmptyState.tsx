"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 transition-all select-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
