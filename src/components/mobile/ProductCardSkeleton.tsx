import React from 'react';
import { ShoppingBag, Store } from 'lucide-react';

interface ProductCardSkeletonProps {
  isDarkMode?: boolean;
}

/**
 * Elegant single product card skeleton matching Golden Bee Store's mobile catalog cards.
 * Includes thumbnail placeholder, category pill, 2-line title, stars rating, price and round action button.
 */
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ isDarkMode = true }) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl relative transition-all duration-300 border ${
        isDarkMode
          ? 'bg-[#0D182E] border-[#1A2C50]'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Thumbnail placeholder with shimmer scanning effect */}
      <div
        className={`relative aspect-square flex items-center justify-center p-2.5 overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#111F3D] to-[#0A1326]'
            : 'bg-gradient-to-b from-slate-100 to-slate-200/80'
        }`}
      >
        {/* Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

        {/* Center icon placeholder */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/40 text-slate-700' : 'bg-slate-300/40 text-slate-400'
          }`}
        >
          <ShoppingBag className="w-6 h-6 opacity-40 animate-pulse" />
        </div>

        {/* Favorite heart placeholder top right */}
        <div
          className={`absolute top-2 right-2 w-7 h-7 rounded-full border flex items-center justify-center backdrop-blur-xs ${
            isDarkMode
              ? 'bg-[#0D182E]/70 border-[#1A2C50]'
              : 'bg-white/80 border-slate-200'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>

      {/* Body Info Skeleton */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Category pill placeholder (Gold glow shimmer) */}
          <div className="h-2.5 w-16 rounded-md bg-amber-500/20 animate-pulse" />

          {/* Title 2-line placeholder */}
          <div className="space-y-1.5 pt-0.5">
            <div
              className={`h-3 w-5/6 rounded-md animate-pulse ${
                isDarkMode ? 'bg-slate-700/60' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-3 w-3/5 rounded-md animate-pulse ${
                isDarkMode ? 'bg-slate-700/40' : 'bg-slate-200/70'
              }`}
            />
          </div>

          {/* 5-Star rating placeholder */}
          <div className="flex items-center gap-1 pt-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-amber-500/25 animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Price & Round Action Button row */}
        <div
          className={`flex items-center justify-between gap-2 pt-1 border-t ${
            isDarkMode ? 'border-[#18284B]' : 'border-slate-100'
          }`}
        >
          {/* Price placeholder */}
          <div className="h-4 w-20 rounded-md bg-amber-500/30 animate-pulse" />

          {/* Round action button placeholder */}
          <div className="w-8 h-8 rounded-full bg-amber-500/35 shrink-0 animate-pulse shadow-sm flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-600/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
  isDarkMode?: boolean;
}

/**
 * 2-Column Product Grid Skeleton matching MobileShopView layout.
 */
export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 6,
  isDarkMode = true,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`skeleton-card-${index}`} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
};

interface ShopChipSkeletonProps {
  count?: number;
  isDarkMode?: boolean;
}

/**
 * Skeleton for the "Fournisseurs Vérifiés" horizontal chip strip.
 */
export const ShopChipSkeleton: React.FC<ShopChipSkeletonProps> = ({
  count = 3,
  isDarkMode = true,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
      <div
        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-amber-500/80 text-slate-950 font-black shadow-xs flex items-center gap-1`}
      >
        <span>Tous les Fournisseurs</span>
      </div>

      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`shop-chip-skeleton-${idx}`}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border animate-pulse shrink-0 ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 shrink-0" />
          <div className="w-16 h-2.5 rounded bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
};
