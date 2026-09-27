import React, { useState } from 'react';
import {
  Download,
  X,
  Crown,
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Share,
  PlusSquare,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PWAState } from '../../hooks/usePWA';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  pwaState: PWAState;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  pwaState,
}) => {
  const { isDarkMode, products, shops, showToast } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (!isOpen) return null;

  const {
    isOnline,
    isInstalled,
    isIOS,
    effectiveType,
    cachedProductsCount,
    cachedShopsCount,
    lastCachedDate,
    installPWA,
    saveCatalogOffline,
    clearOfflineCache,
  } = pwaState;

  const handleManualSync = () => {
    setIsRefreshing(true);
    saveCatalogOffline(products, shops);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Cache hors-ligne mis à jour', 'success', `${products.length} articles et ${shops.length} boutiques sauvegardés localement.`);
    }, 600);
  };

  const handleClearCache = () => {
    clearOfflineCache();
    showToast('Cache vidé', 'info', 'La mémoire hors-ligne a été réinitialisée.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md rounded-3xl shadow-2xl border-2 z-10 overflow-hidden flex flex-col transition-all ${
          isDarkMode
            ? 'bg-[#070D1E] border-amber-500/30 text-white'
            : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
              <Crown className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">
                Application & Mode Hors-Ligne
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                Gestion PWA & Cache Intelligent
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75dvh] overflow-y-auto scrollbar-none">
          {/* 1. Network & Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                  isOnline ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-black block">
                  {isOnline ? '🟢 Connecté à Internet' : '🟠 Mode Hors-Ligne Actif'}
                </span>
                <span className="text-[11px] font-semibold opacity-85">
                  {isOnline ? `Qualité réseau : ${effectiveType.toUpperCase()}` : 'Données locales prêtes'}
                </span>
              </div>
            </div>

            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10 font-mono">
              {isOnline ? 'SYNC OK' : 'LOCAL'}
            </span>
          </div>

          {/* 2. PWA Installation Status / Action */}
          <div
            className={`p-4 rounded-2xl border-2 space-y-3 ${
              isDarkMode ? 'bg-[#0E1A38] border-[#1E335C]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Statut Installation
                </span>
              </div>
              {isInstalled ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-500 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Installée (PWA)
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Disponible
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Installez Bee Store directement sur votre écran d’accueil pour un lancement instantané en 1 clic et une navigation fluide sans barre d'adresse de navigateur.
            </p>

            {!isInstalled && (
              <>
                {isIOS ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowIOSGuide(!showIOSGuide)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Share className="w-4 h-4" />
                      <span>Guide d'installation iPhone / iPad</span>
                    </button>

                    {showIOSGuide && (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs space-y-1.5">
                        <p className="font-bold text-amber-400">Pour Safari sur iOS :</p>
                        <p className="text-[11px] text-slate-300">
                          1. Cliquez sur l'icône <strong>Partager</strong> en bas de Safari.<br />
                          2. Choisissez <strong>Sur l'écran d'accueil</strong>.<br />
                          3. Validez avec <strong>Ajouter</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await installPWA();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Installer sur mon Téléphone</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* 3. Offline Cache Storage Stats & Sync Controls */}
          <div
            className={`p-4 rounded-2xl border-2 space-y-3 ${
              isDarkMode ? 'bg-[#0E1A38] border-[#1E335C]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Mémoire & Cache Hors-Ligne
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">Articles en Cache</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  {cachedProductsCount > 0 ? cachedProductsCount : products.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">Boutiques</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  {cachedShopsCount > 0 ? cachedShopsCount : shops.length}
                </span>
              </div>
            </div>

            {lastCachedDate && (
              <p className="text-[10.5px] text-slate-500 text-center font-medium">
                Dernière synchronisation locale : {lastCachedDate}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isRefreshing}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-[#15244A] hover:bg-slate-300 dark:hover:bg-[#1B2F5E] text-slate-900 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Synchroniser le cache</span>
              </button>

              <button
                type="button"
                onClick={handleClearCache}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                title="Vider le cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 dark:bg-[#050A18] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
