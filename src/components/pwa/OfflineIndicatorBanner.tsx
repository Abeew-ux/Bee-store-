import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineIndicatorBannerProps {
  isOnline: boolean;
  connectionQuality: 'optimal' | 'low_bandwidth' | 'offline';
  cachedProductsCount: number;
  lastCachedDate: string | null;
}

export const OfflineIndicatorBanner: React.FC<OfflineIndicatorBannerProps> = ({
  isOnline,
  connectionQuality,
  cachedProductsCount,
  lastCachedDate,
}) => {
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <div className="w-full z-40 px-3 py-1 shrink-0 select-none">
      <AnimatePresence>
        {/* Offline Alert Bar */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="p-2.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2.5 shadow-md shadow-amber-950/20"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
                <WifiOff className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                    Mode Hors-Ligne Actif
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                    Cache Local
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-700 dark:text-slate-300 truncate font-semibold">
                  {cachedProductsCount > 0
                    ? `Catalogue disponible (${cachedProductsCount} articles sauvegardés)`
                    : 'Consultation disponible depuis la mémoire'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <Database className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </motion.div>
        )}

        {/* Low Bandwidth Notice */}
        {isOnline && connectionQuality === 'low_bandwidth' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[11px]">Connexion lente détectée • Mode allégé activé</span>
            </div>
            <span className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400 font-black">2G/3G</span>
          </motion.div>
        )}

        {/* Reconnected Green Toast */}
        {showReconnectedToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="p-2.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-md shadow-emerald-950/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                  Connexion Rétablie !
                </span>
                <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Toutes les données sont à nouveau synchronisées en temps réel.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
