import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  Gamepad2,
  Tv,
  ShoppingBag,
  Sparkles,
  Star,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Filter,
} from 'lucide-react';

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export type PriceRangeOption =
  | 'all'
  | 'under_2000'
  | '2000_5000'
  | '5000_15000'
  | 'above_15000'
  | 'custom';

interface ShopFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: SortOption;
  onSelectSort: (sort: SortOption) => void;
  priceRange: PriceRangeOption;
  onSelectPriceRange: (range: PriceRangeOption) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
  totalCount: number;
  onResetAll: () => void;
  isDarkMode?: boolean;
}

const SORT_LABELS: Record<SortOption, { label: string; short: string }> = {
  default: { label: 'Recommandés', short: 'Recommandés' },
  price_asc: { label: 'Prix croissant (Moins cher)', short: 'Prix ↗' },
  price_desc: { label: 'Prix décroissant (Plus cher)', short: 'Prix ↘' },
  rating: { label: 'Mieux notés (★)', short: 'Mieux notés' },
  newest: { label: 'Nouveautés', short: 'Nouveautés' },
};

const PRICE_PRESETS: { id: PriceRangeOption; label: string; description: string }[] = [
  { id: 'all', label: 'Tous les prix', description: 'Sans restriction' },
  { id: 'under_2000', label: '< 2 000 FCFA', description: 'Petits budgets' },
  { id: '2000_5000', label: '2 000 - 5 000 FCFA', description: 'Très populaire' },
  { id: '5000_15000', label: '5 000 - 15 000 FCFA', description: 'Milieu de gamme' },
  { id: 'above_15000', label: '> 15 000 FCFA', description: 'Articles premium' },
];

export const ShopFilterBar: React.FC<ShopFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSort,
  priceRange,
  onSelectPriceRange,
  minPrice,
  maxPrice,
  onPriceChange,
  totalCount,
  onResetAll,
  isDarkMode = true,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPricePanelOpen, setIsPricePanelOpen] = useState(false);
  const [tempMin, setTempMin] = useState(minPrice);
  const [tempMax, setTempMax] = useState(maxPrice);

  const hasActiveFilters =
    selectedCategory !== 'Tous' ||
    sortBy !== 'default' ||
    priceRange !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '';

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === 'tous' || c === 'tous les produits') return <ShoppingBag className="w-3.5 h-3.5" />;
    if (c.includes('game') || c.includes('gaming') || c.includes('jeu') || c.includes('jeton'))
      return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (c.includes('abonnement') || c.includes('service') || c.includes('streaming'))
      return <Tv className="w-3.5 h-3.5 text-blue-400" />;
    if (c.includes('high-tech') || c.includes('audio') || c.includes('chargeur'))
      return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    return null;
  };

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPriceRange('custom');
    onPriceChange(tempMin, tempMax);
    setIsPricePanelOpen(false);
  };

  const getPriceRangeBadgeLabel = () => {
    if (priceRange === 'all') return null;
    if (priceRange === 'under_2000') return '< 2 000 FCFA';
    if (priceRange === '2000_5000') return '2 000 - 5 000 FCFA';
    if (priceRange === '5000_15000') return '5 000 - 15 000 FCFA';
    if (priceRange === 'above_15000') return '> 15 000 FCFA';
    if (priceRange === 'custom') {
      if (minPrice && maxPrice) return `${minPrice} - ${maxPrice} F`;
      if (minPrice) return `≥ ${minPrice} F`;
      if (maxPrice) return `≤ ${maxPrice} F`;
      return 'Prix personnalisé';
    }
    return null;
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Horizontal Category Pill Slider with Featured Badges */}
      <div className="-mx-3.5 px-3.5 pb-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const icon = getCategoryIcon(cat);
            const isFeatured =
              cat.toLowerCase().includes('gaming') || cat.toLowerCase().includes('abonnement');

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`py-1.5 px-3 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : isDarkMode
                    ? isFeatured
                      ? 'bg-[#122244] border border-[#233F77] text-amber-300 hover:text-white'
                      : 'bg-[#0D1832] border border-[#1E335E] text-slate-300 hover:text-white'
                    : isFeatured
                    ? 'bg-amber-50 border border-amber-300 text-amber-950'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {icon}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Control Toolbar: Sort by Price / Rating & Filter by Price Range */}
      <div
        className={`p-2 rounded-2xl border flex items-center justify-between gap-2 shadow-xs transition-colors ${
          isDarkMode
            ? 'bg-[#0A1226] border-[#182848] text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {/* Left: Quick Price Sort Toggles */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectSort(sortBy === 'price_asc' ? 'default' : 'price_asc')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
              sortBy === 'price_asc'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                : isDarkMode
                ? 'bg-[#101C38] text-slate-300 border border-[#1E325A] hover:text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Trier du moins cher au plus cher"
          >
            <span>Prix</span>
            <span className="font-mono text-[11px] font-black">↗</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSort(sortBy === 'price_desc' ? 'default' : 'price_desc')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
              sortBy === 'price_desc'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : isDarkMode
                ? 'bg-[#101C38] text-slate-300 border border-[#1E325A] hover:text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Trier du plus cher au moins cher"
          >
            <span>Prix</span>
            <span className="font-mono text-[11px] font-black">↘</span>
          </button>

          {/* More Sort Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsPricePanelOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                sortBy === 'rating' || sortBy === 'newest'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : isDarkMode
                  ? 'bg-[#101C38] text-slate-300 border border-[#1E325A] hover:text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{SORT_LABELS[sortBy].short}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Sort Popover Dropdown */}
            {isSortOpen && (
              <div
                className={`absolute left-0 top-full mt-1.5 w-48 rounded-xl shadow-xl border z-30 py-1.5 space-y-0.5 ${
                  isDarkMode
                    ? 'bg-[#0E1A36] border-[#223966] text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onSelectSort(opt);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-medium text-left flex items-center justify-between transition-colors ${
                      sortBy === opt
                        ? 'bg-amber-500/15 text-amber-400 font-bold'
                        : isDarkMode
                        ? 'hover:bg-slate-800/70'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <span>{SORT_LABELS[opt].label}</span>
                    {sortBy === opt && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Filter by Price Range Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsPricePanelOpen(!isPricePanelOpen);
              setIsSortOpen(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              priceRange !== 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : isDarkMode
                ? 'bg-[#101C38] text-slate-300 border border-[#1E325A] hover:text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{getPriceRangeBadgeLabel() || 'Filtrer Prix'}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isPricePanelOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Price Range Filter Panel Popover */}
          {isPricePanelOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-64 rounded-2xl shadow-2xl border z-30 p-3 space-y-3 ${
                isDarkMode
                  ? 'bg-[#0E1A36] border-[#223966] text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-700/50">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Tranche de Prix (FCFA)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPricePanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price preset options */}
              <div className="space-y-1">
                {PRICE_PRESETS.map((preset) => {
                  const isPresetActive = priceRange === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPriceRange(preset.id);
                        if (preset.id !== 'custom') {
                          onPriceChange('', '');
                          setIsPricePanelOpen(false);
                        }
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between text-left transition-colors ${
                        isPresetActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isDarkMode
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{preset.label}</div>
                        <div
                          className={`text-[9.5px] ${
                            isPresetActive ? 'text-slate-900 opacity-80' : 'text-slate-400'
                          }`}
                        >
                          {preset.description}
                        </div>
                      </div>
                      {isPresetActive && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Price Inputs */}
              <form
                onSubmit={handleApplyCustomPrice}
                className="pt-2 border-t border-slate-700/50 space-y-2"
              >
                <span className="text-[11px] font-bold block text-slate-300">
                  Ou budget sur-mesure (FCFA) :
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <input
                      type="number"
                      placeholder="Min (ex: 1000)"
                      value={tempMin}
                      onChange={(e) => setTempMin(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-xl border outline-none font-mono ${
                        isDarkMode
                          ? 'bg-[#091224] border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max (ex: 15000)"
                      value={tempMax}
                      onChange={(e) => setTempMax(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-xl border outline-none font-mono ${
                        isDarkMode
                          ? 'bg-[#091224] border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  Appliquer le budget
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Filters Strip & Instant Reset */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Actifs :
          </span>

          {/* Category Chip */}
          {selectedCategory !== 'Tous' && (
            <button
              type="button"
              onClick={() => onSelectCategory('Tous')}
              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 shrink-0 hover:bg-amber-500/30 transition-colors"
            >
              <span>{selectedCategory}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Sort Chip */}
          {sortBy !== 'default' && (
            <button
              type="button"
              onClick={() => onSelectSort('default')}
              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 shrink-0 hover:bg-emerald-500/30 transition-colors"
            >
              <span>{SORT_LABELS[sortBy].label}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Price Range Chip */}
          {priceRange !== 'all' && getPriceRangeBadgeLabel() && (
            <button
              type="button"
              onClick={() => {
                onSelectPriceRange('all');
                onPriceChange('', '');
              }}
              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center gap-1 shrink-0 hover:bg-blue-500/30 transition-colors"
            >
              <span>{getPriceRangeBadgeLabel()}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Reset All Button */}
          <button
            type="button"
            onClick={onResetAll}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/60 flex items-center gap-1 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Effacer tout</span>
          </button>
        </div>
      )}
    </div>
  );
};
