import React from "react";

export function SkeletonCard() {
  return (
    <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 flex flex-col justify-between gap-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-zinc-900 rounded border border-zinc-850" />
          <div className="h-4 w-20 bg-zinc-900 rounded border border-zinc-850" />
        </div>
        <div className="h-6 w-3/4 bg-zinc-900 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-zinc-900/60 rounded" />
          <div className="h-3 w-5/6 bg-zinc-900/60 rounded" />
        </div>
      </div>
      <div className="h-8 bg-zinc-900 rounded-lg border border-zinc-850" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-zinc-900 rounded" />
        <div className="h-7 w-12 bg-zinc-900 rounded" />
      </div>
      <div className="h-10 w-10 bg-zinc-900 rounded-lg border border-zinc-850" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-zinc-900 rounded" />
        <div className="h-3 w-1/2 bg-zinc-900/60 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 bg-zinc-900 rounded-lg border border-zinc-850" />
        <div className="h-8 w-16 bg-zinc-900 rounded-lg border border-zinc-850" />
      </div>
    </div>
  );
}
