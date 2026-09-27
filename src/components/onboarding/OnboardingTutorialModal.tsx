import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Truck,
  Store,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Gift,
  Search,
  Camera,
  Check,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BeePushingCart } from '../BeePushingCart';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDarkMode, setActiveTab } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step whenever reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentStep < 3) {
        setCurrentStep((s) => s + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((s) => s - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, onClose]);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToTab = (tab: 'shop' | 'cart' | 'tracking' | 'vendor') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200 select-none">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md rounded-3xl shadow-2xl border z-10 overflow-hidden flex flex-col transition-all max-h-[92dvh] ${
          isDarkMode
            ? 'bg-[#0A1224] border-amber-500/30 text-slate-100 shadow-amber-950/30'
            : 'bg-white border-amber-500/30 text-slate-900 shadow-xl'
        }`}
      >
        {/* Top Header Bar with Progress and Skip */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs">
              {currentStep + 1}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                Guide de bienvenue
              </span>
              <span className="text-[10px] text-slate-400">
                Étape {currentStep + 1} sur {totalSteps}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <span>Passer</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar track */}
        <div className="w-full bg-slate-800/60 h-1 shrink-0 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Interactive Step Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 scrollbar-none">
          <AnimatePresence mode="wait">
            {/* ================= STEP 1: GENERAL DISCOVERY ================= */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="flex justify-center py-1">
                  <BeePushingCart size="lg" />
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-400 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Marketplace Officielle au Niger
                  </span>
                  <h2 className="text-lg font-black text-slate-100">
                    Bienvenue sur <span className="text-amber-400">Bee Store</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Votre plateforme e-commerce multi-boutiques regroupant les meilleurs vendeurs vérifiés du Niger.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0F1C36] border border-[#1C2F57]">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-100">Boutiques Partenaires Certifiées</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Découvrez des catalogues variés : mode, high-tech, recharges gaming, comptes et abonnements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0F1C36] border border-[#1C2F57]">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-100">Contact Direct WhatsApp</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Discutez directement avec le commerçant officiel pour poser vos questions et négocier en toute simplicité.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: CART & 1-BY-1 CHECKOUT ================= */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/60">
                    <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-400 uppercase tracking-wide">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Fonctionnalité Clé
                  </span>
                  <h2 className="text-lg font-black text-slate-100">
                    Le Panier & Commande 1-par-1
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Chaque boutique étant indépendante, vous commandez chaque article directement auprès de son vendeur attitré.
                  </p>
                </div>

                {/* Interactive visual mockup */}
                <div className="p-3.5 rounded-2xl bg-[#0F1C36] border border-amber-500/30 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800">
                    <span>Aperçu de votre panier</span>
                    <span className="text-amber-400">1 article sélectionné</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#091122] border border-[#1D325E]">
                    {/* Simulated Checkbox */}
                    <div className="w-5 h-5 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">Exemple : Smartphone ou Vêtement</p>
                      <p className="text-[10px] text-amber-400 font-black">25 000 FCFA • Boutique Officielle</p>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      Qté: 1
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-200">
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Génération d'un <strong>message WhatsApp complet</strong> avec vos coordonnées et les détails de l'article !
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cochez l'article que vous souhaitez commander.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Choisissez la livraison à domicile ou le retrait en magasin.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpToTab('cart')}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Ouvrir le Panier en direct</span>
                </button>
              </motion.div>
            )}

            {/* ================= STEP 3: ORDER TRACKING & ESCROW ================= */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 border border-sky-300/40">
                    <Truck className="w-8 h-8 stroke-[2.2]" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-[10px] font-extrabold text-sky-400 uppercase tracking-wide">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    Protection & Traçabilité
                  </span>
                  <h2 className="text-lg font-black text-slate-100">
                    Le Suivi de Commande en Direct
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Ne perdez jamais de vue votre commande grâce à notre système de traçabilité en 4 étapes.
                  </p>
                </div>

                {/* Tracking Step Timeline Simulation */}
                <div className="p-3.5 rounded-2xl bg-[#0F1C36] border border-[#1D325E] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                    <span className="font-mono font-bold text-amber-400">Réf: ORD-78294</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold text-[9.5px]">
                      En cours d'acheminement
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold">
                    <div className="space-y-1">
                      <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-emerald-400">Reçue</span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-emerald-400">Payée</span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-6 h-6 mx-auto rounded-full bg-sky-500 text-slate-950 flex items-center justify-center animate-pulse">
                        <Truck className="w-3 h-3" />
                      </div>
                      <span className="text-sky-300">En route</span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-6 h-6 mx-auto rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                        <Camera className="w-3 h-3" />
                      </div>
                      <span className="text-slate-400">Livrée</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10.5px] text-slate-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Preuve photo de livraison :</strong> Le livreur téléverse une photo du colis remis pour garantir la conformité.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpToTab('tracking')}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Accéder à l'espace de Suivi Colis</span>
                </button>
              </motion.div>
            )}

            {/* ================= STEP 4: VENDORS & REFERRALS ================= */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-300/60">
                    <Store className="w-8 h-8 stroke-[2.2]" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                    <Gift className="w-3 h-3 text-emerald-400" />
                    Opportunités Partenaires
                  </span>
                  <h2 className="text-lg font-black text-slate-100">
                    Vendez & Gagnez avec Bee Store
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Bee Store n'est pas seulement un magasin : c'est un écosystème commercial complet pour développer vos revenus.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-[#0F1C36] border border-amber-500/40 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">
                      🏪
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-300">
                        Ouvrez votre Boutique (1 500 FCFA / mois)
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Ajoutez vos articles, fixez vos prix et recevez des commandes directes avec votre numéro marchand.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0F1C36] border border-emerald-500/40 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-300">
                        Programme Parrainage (500 FCFA cash)
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Invitez d'autres commerçants et encaissez 500 FCFA de prime directement sur votre compte My Nita ou Airtel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 text-center">
                  <p className="text-xs font-bold text-amber-300">
                    Prêt à commencer votre expérience sur Bee Store ?
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Vous pourrez revoir ce tutoriel à tout moment dans Profil &gt; Réglages.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800/40 bg-[#070D1E] flex items-center justify-between gap-3 shrink-0">
          {/* Previous Step Button */}
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>
          ) : (
            <div className="w-20" />
          )}

          {/* Dots Step Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-label={`Étape ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === currentStep
                    ? 'w-6 h-2 bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            <span>{currentStep === totalSteps - 1 ? "C'est parti !" : 'Suivant'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
