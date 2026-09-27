import React, { useState, useRef, useEffect } from 'react';
import { COUNTRY_CODES, CountryCode } from '../data/countryCodes';
import { ChevronDown, Search, Globe, Check } from 'lucide-react';

interface CountryCodeSelectorProps {
  selectedCode?: string; // e.g. '+227'
  value?: string; // alias for selectedCode
  onChange: (code: string) => void;
  className?: string;
  isDarkMode?: boolean;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCode,
  value,
  onChange,
  className = '',
  isDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCode = selectedCode || value || '+227';
  const currentCountry =
    COUNTRY_CODES.find((c) => c.code === activeCode) || COUNTRY_CODES[0];

  const regions = [
    { id: 'all', label: 'Tous' },
    { id: "Afrique de l'Ouest", label: 'O. Afrique' },
    { id: 'Afrique Centrale', label: 'C. Afrique' },
    { id: 'Afrique du Nord', label: 'N. Afrique' },
    { id: "Afrique de l'Est", label: 'E. Afrique' },
    { id: 'Afrique Australe', label: 'Australe' },
    { id: 'International', label: 'Diaspora' },
  ];

  const filtered = COUNTRY_CODES.filter((c) => {
    const matchSearch =
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      (c.region && c.region.toLowerCase().includes(search.toLowerCase()));

    const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;

    return matchSearch && matchRegion;
  });

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-98 whitespace-nowrap cursor-pointer shadow-xs ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 focus:border-amber-500'
            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 focus:border-amber-500'
        }`}
        title={`Pays sélectionné: ${currentCountry.country} (${currentCountry.code})`}
      >
        <span className="text-base leading-none">{currentCountry.flag}</span>
        <span className="font-mono text-amber-500 font-extrabold">{currentCountry.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div
            className={`absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden text-xs max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/80'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/20'
            }`}
          >
            {/* Header & Search */}
            <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3 text-amber-500" />
                  Indicatifs Pays & Afrique
                </span>
                <span className="text-[10px] text-amber-500 font-semibold font-mono">
                  {COUNTRY_CODES.length} pays
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher pays (ex: Bénin, Côte d'Ivoire, 229...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {/* Regions Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      selectedRegion === reg.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Countries */}
            <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5 scrollbar-none max-h-56">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  Aucun pays trouvé pour "{search}"
                </div>
              ) : (
                filtered.map((item) => {
                  const isSelected = item.code === activeCode;
                  return (
                    <button
                      key={`${item.country}-${item.code}`}
                      type="button"
                      onClick={() => {
                        onChange(item.code);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                          : isDarkMode
                          ? 'hover:bg-slate-800 text-slate-200'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base leading-none shrink-0">{item.flag}</span>
                        <div className="truncate">
                          <div className="truncate font-semibold text-xs flex items-center gap-1.5">
                            <span>{item.country}</span>
                            {item.region && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-500/10 text-slate-400 font-medium">
                                {item.region}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ex: {item.placeholder}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="font-mono text-xs font-bold text-amber-500">
                          {item.code}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
