import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePWA } from '../../hooks/usePWA';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import {
  Settings,
  Bell,
  Volume2,
  Sun,
  Moon,
  Clock,
  Lock,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  Play,
  Smartphone,
  Download,
  Database,
  Wifi,
  WifiOff,
  CheckCircle2,
  Crown,
  HelpCircle,
} from 'lucide-react';

interface ProfileSettingsTabProps {
  onClose: () => void;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({ onClose }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    localNotificationsEnabled,
    toggleLocalNotifications,
    testOrderNotification,
    cleanupExpiredChatMessages,
    isAdminAuthenticated,
    logoutAdmin,
    setActiveTab,
    currentUser,
    showToast,
    products,
    shops,
    openOnboardingTutorial,
  } = useStore();

  const pwaState = usePWA();
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  const handleToggleNotifications = async () => {
    setIsTogglingNotifications(true);
    await toggleLocalNotifications();
    setIsTogglingNotifications(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. APPLICATION PWA & MODE HORS-LIGNE */}
      <div
        className={`p-4 rounded-2xl border-2 space-y-3 ${
          isDarkMode
            ? 'bg-slate-900/80 border-amber-500/30'
            : 'bg-amber-50/70 border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Application Mobile & Hors-Ligne (PWA)
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                {pwaState.isInstalled
                  ? 'Application installée sur l\'appareil'
                  : 'Installer sur l\'écran d\'accueil sans store'}
              </p>
            </div>
          </div>

          {pwaState.isInstalled ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Installée
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsPWAModalOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] rounded-lg shadow-xs active:scale-95 transition-transform"
            >
              Installer
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            {pwaState.isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-[9px] text-slate-500 block">Réseau</span>
              <span className="font-bold truncate text-[11px]">
                {pwaState.isOnline ? `En Ligne (${pwaState.effectiveType.toUpperCase()})` : 'Hors-Ligne'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-slate-500 block">Cache Catalogue</span>
              <span className="font-bold truncate text-[11px]">
                {pwaState.cachedProductsCount > 0 ? `${pwaState.cachedProductsCount} articles` : `${products.length} articles`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPWAModalOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-between transition-colors"
        >
          <span>Gérer le cache hors-ligne & l'installation</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 2. NOTIFICATIONS LOCALES & SUIVI EN TEMPS RÉEL */}
      <div
        className={`p-4 rounded-2xl border space-y-3.5 ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Alertes Suivi en Temps Réel
              </h4>
              <p className="text-[10px] text-slate-500">
                Sons, vibrations et notifications navigateur
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleNotifications}
            disabled={isTogglingNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              localNotificationsEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                localNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Recevez une alerte sonore et visuelle dès que le statut de votre commande évolue (Paiement vérifié, En préparation, En cours de livraison, Remis en main propre).
        </p>

        {/* Bouton de Test de l'Alerte */}
        <button
          type="button"
          onClick={() => testOrderNotification()}
          className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
          <span>Tester le Carillon & Alerte de Suivi</span>
        </button>
      </div>

      {/* 3. THÈME DE L'APPLICATION (MODE SOMBRE / CLAIR) */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              Apparence de l'Application
            </h4>
            <p className="text-[10px] text-slate-500">
              Actuellement : {isDarkMode ? 'Mode Sombre' : 'Mode Clair'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
            isDarkMode
              ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
              : 'bg-white text-slate-800 border border-slate-300 shadow-2xs'
          }`}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span>Basculer</span>
        </button>
      </div>

      {/* 4. OPTIMISATION DU STOCKAGE LOCAL (AUTO-PURGE CHAT 7 JOURS) */}
      <div
        className={`p-4 rounded-2xl border space-y-2.5 ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Nettoyage Automatique (7 jours)
              </h4>
              <p className="text-[10px] text-slate-500">
                Purger les messages WhatsApp/Chat expirés
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              cleanupExpiredChatMessages();
              showToast('Cache nettoyé', 'info', 'Les messages de plus de 7 jours ont été purgés.');
            }}
            className="px-2.5 py-1 bg-orange-500/15 hover:bg-orange-500/25 text-orange-500 font-bold text-[10px] rounded-lg transition-colors"
          >
            Purger
          </button>
        </div>
      </div>

      {/* 5. GUIDE & TUTORIEL D'ACCUEIL (ONBOARDING) */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Tutoriel & Guide de démarrage
              </h4>
              <p className="text-[10px] text-slate-500">
                Panier 1-par-1, suivi de commande & boutiques
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              openOnboardingTutorial();
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition-all shadow-xs active:scale-95"
          >
            Revoir
          </button>
        </div>
      </div>

      {/* 6. ACCÈS ADMINISTRATEUR (Visible UNIQUEMENT pour le compte administrateur authentifié) */}
      {isAdminAuthenticated && (
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode
              ? 'bg-slate-900/80 border-amber-500/30 ring-1 ring-amber-500/20'
              : 'bg-amber-50/50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Espace Direction & Administration</span>
                  <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">Actif</span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Validation des paiements, boutiques et annonces
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-400">
              v2.5 Niger PWA
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('admin');
              }}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-between transition-all active:scale-98"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-950" />
                <span>Ouvrir le Panneau Administrateur</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              type="button"
              onClick={logoutAdmin}
              className="w-full py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              <span>Verrouiller la session Administrateur</span>
            </button>
          </div>
        </div>
      )}

      {/* PWA Details & Cache Management Modal */}
      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
        pwaState={pwaState}
      />
    </div>
  );
};
