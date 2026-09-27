import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Announcement } from '../../types';
import {
  Sparkles,
  Zap,
  Tag,
  Truck,
  Info,
  AlertTriangle,
  ChevronRight,
  X,
  Volume2,
} from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const { announcements, isDarkMode, setActiveTab } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(
    (a) => a.isActive && !dismissedIds.includes(a.id)
  );

  // Auto rotate if multiple announcements
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentIndex % activeAnnouncements.length];
  if (!current) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, current.id]);
  };

  const handleAction = () => {
    if (current.ctaLinkTab) {
      setActiveTab(current.ctaLinkTab);
    }
  };

  const getCategoryStyles = () => {
    switch (current.category) {
      case 'flash':
        return {
          bg: isDarkMode
            ? 'bg-rose-950/60 border-rose-500/40 text-rose-100'
            : 'bg-rose-50 border-rose-200 text-rose-950',
          badge: 'bg-rose-500 text-white',
          icon: <Zap className="w-3.5 h-3.5 fill-current" />,
          defaultBadge: 'FLASH INFO',
        };
      case 'promo':
        return {
          bg: isDarkMode
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-500 text-slate-950',
          icon: <Tag className="w-3.5 h-3.5" />,
          defaultBadge: 'PROMOTION',
        };
      case 'livraison':
        return {
          bg: isDarkMode
            ? 'bg-amber-950/60 border-amber-500/40 text-amber-100'
            : 'bg-amber-50 border-amber-200 text-amber-950',
          badge: 'bg-amber-500 text-slate-950',
          icon: <Truck className="w-3.5 h-3.5" />,
          defaultBadge: 'LIVRAISON NIGER',
        };
      case 'maintenance':
        return {
          bg: isDarkMode
            ? 'bg-purple-950/60 border-purple-500/40 text-purple-100'
            : 'bg-purple-50 border-purple-200 text-purple-950',
          badge: 'bg-purple-500 text-white',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          defaultBadge: 'INFO SYSTÈME',
        };
      default:
        return {
          bg: isDarkMode
            ? 'bg-blue-950/60 border-blue-500/40 text-blue-100'
            : 'bg-blue-50 border-blue-200 text-blue-950',
          badge: 'bg-blue-600 text-white',
          icon: <Info className="w-3.5 h-3.5" />,
          defaultBadge: 'COMMUNIQUÉ',
        };
    }
  };

  const styles = getCategoryStyles();

  return (
    <div className="px-3 pt-2.5 pb-1">
      <div
        onClick={handleAction}
        className={`relative overflow-hidden rounded-2xl border p-2.5 sm:p-3 shadow-xs transition-all cursor-pointer ${styles.bg}`}
      >
        <div className="flex items-center gap-2.5">
          {/* Badge icon */}
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${styles.badge}`}
          >
            {styles.icon}
            <span>{current.badgeText || styles.defaultBadge}</span>
          </span>

          {/* Title & snippet */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black truncate">{current.title}</h4>
              {activeAnnouncements.length > 1 && (
                <span className="text-[9px] opacity-70 font-mono">
                  ({(currentIndex % activeAnnouncements.length) + 1}/{activeAnnouncements.length})
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-90 truncate">{current.content}</p>
          </div>

          {/* CTA Button or Chevron */}
          {current.ctaText ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg shrink-0 shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>{current.ctaText}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <ChevronRight className="w-4 h-4 opacity-70 shrink-0" />
          )}

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            title="Masquer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
