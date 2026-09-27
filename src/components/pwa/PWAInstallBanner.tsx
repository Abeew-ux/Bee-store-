import React, { useState } from 'react';
import { Download, X, Crown, Smartphone, Zap, ShieldCheck, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallBannerProps {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isBannerDismissed: boolean;
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstalled,
  isInstallable,
  isIOS,
  isBannerDismissed,
  onInstall,
  onDismiss,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // If already installed or dismissed, do not show banner
  if (isInstalled || isBannerDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    setIsInstalling(true);
    await onInstall();
    setIsInstalling(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-16 sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 sm:max-w-md z-45"
      >
        <div className="p-3.5 sm:p-4 rounded-3xl bg-[#091226] text-white border-2 border-amber-500/40 shadow-2xl shadow-amber-950/40 backdrop-blur-md relative overflow-hidden">
          {/* Subtle gold glow in corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close / Dismiss button */}
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
            title="Plus tard"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0 border border-amber-300/60">
              <Crown className="w-6 h-6 fill-slate-950 text-slate-950 stroke-[2]" />
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                Application Officielle
              </span>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                Installer Bee Store
              </h3>
              <p className="text-[11px] text-slate-300">
                Sur votre écran d'accueil sans passer par le store
              </p>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-1.5 my-3 pt-1 border-t border-slate-800">
            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-[#0F1C38] border border-[#1C325F]">
              <Zap className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-[9.5px] font-bold text-slate-200">100% Fluide</span>
            </div>
            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-[#0F1C38] border border-[#1C325F]">
              <Smartphone className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-[9.5px] font-bold text-slate-200">Mode Hors-Ligne</span>
            </div>
            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-[#0F1C38] border border-[#1C325F]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-[9.5px] font-bold text-slate-200">Reçu & Suivi</span>
            </div>
          </div>

          {/* iOS Instructions Card */}
          {showIOSInstructions && (
            <div className="mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs space-y-2">
              <div className="font-black text-amber-400 flex items-center gap-1.5">
                <Share className="w-4 h-4" />
                <span>Pour iPhone / iPad (Safari) :</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-200 space-y-1 font-semibold">
                <li>
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3 h-3 inline mx-0.5 text-amber-400" /> en bas de l'écran
                </li>
                <li>
                  Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="w-3 h-3 inline mx-0.5 text-amber-400" />
                </li>
                <li>
                  Appuyez sur <strong>Ajouter</strong> en haut à droite.
                </li>
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstalling ? 'Installation...' : 'Installer Maintenant'}</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors active:scale-95"
            >
              Plus tard
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
