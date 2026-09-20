"use client";

import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="relative flex flex-col w-full text-left select-none animate-pulse">
      {/* 1. Image Frame Skeleton with Moving Shimmer Reflection */}
      <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
        {/* Shimmer reflection overlay */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-shine pointer-events-none" />

        {/* Floating placeholder icon/badge */}
        <div className="absolute top-3 left-3 w-14 h-4 bg-slate-200/80 rounded-sm" />
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-200/80" />
      </div>

      {/* 2. Text Skeleton Body */}
      <div className="mt-3 flex flex-col space-y-2">
        {/* Title placeholder */}
        <div className="relative h-3.5 bg-slate-200/80 rounded w-3/4 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-shine" />
        </div>

        {/* Price placeholder */}
        <div className="relative h-3 bg-slate-200/60 rounded w-1/3 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-shine" />
        </div>

        {/* Color swatches placeholder */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
          <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
          <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
