"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left shadow-2xl transition-all select-none">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-md text-zinc-500 hover:text-zinc-350 p-1 hover:bg-zinc-800 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isDestructive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-grow space-y-1">
            <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 transition-all select-none"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg text-white shadow-sm transition-all select-none ${
              isDestructive
                ? "bg-red-650 hover:bg-red-700 active:scale-98"
                : "bg-orange-550 hover:bg-orange-600 active:scale-98"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
