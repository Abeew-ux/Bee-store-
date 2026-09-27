import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  User,
  X,
  ShieldCheck,
  Package,
  Settings,
  CreditCard,
  Store,
  SlidersHorizontal,
} from 'lucide-react';
import bannerImg from '../../assets/images/golden_bee_banner_1787874156044.jpg';

export type ProfileTab = 'compte' | 'paiements' | 'boutique' | 'reglages';

interface ProfileHeaderProps {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  onClose: () => void;
  ordersCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  activeTab,
  setActiveTab,
  onClose,
  ordersCount,
}) => {
  const { currentUser, currentVendorShop, isDarkMode, localNotificationsEnabled } = useStore();

  return (
    <div className="relative shrink-0 overflow-hidden select-none">
      {/* 🖼️ BANNER PHOTO TOUT EN HAUT */}
      <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-slate-900">
        <img
          src={bannerImg}
          alt="Golden Bee Store Banner"
          className="w-full h-full object-cover object-center transform scale-105"
        />
        {/* Elegant Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-radial-at-t from-amber-500/20 via-transparent to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-md transition-all shadow-md active:scale-95 z-10"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Tag Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[10px] font-black text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>PARAMÈTRES & PROFIL</span>
        </div>

        {/* User Identity & Avatar anchored to banner */}
        <div className="absolute bottom-2.5 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white/90">
                {currentUser ? (
                  currentUser.fullName.charAt(0).toUpperCase()
                ) : (
                  <User className="w-7 h-7 text-slate-950" />
                )}
              </div>
              {currentUser && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              )}
            </div>

            <div className="text-white drop-shadow-sm min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black truncate max-w-[200px]">
                  {currentUser ? currentUser.fullName : 'Visiteur Golden Bee'}
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shrink-0">
                  {currentUser?.role === 'admin'
                    ? 'Admin'
                    : currentVendorShop
                    ? 'Vendeur'
                    : 'Client'}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 truncate">
                {currentUser
                  ? `${currentUser.phone} • ${currentUser.city}`
                  : 'Compte invité non connecté'}
              </p>
            </div>
          </div>

          {currentUser && ordersCount > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-md text-[11px] font-bold text-white">
              <Package className="w-3 h-3 text-amber-400" />
              <span>{ordersCount} commande{ordersCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🧭 STRUCTURED SECTION NAVIGATION TABS */}
      <div
        className={`px-3 py-2 border-b flex items-center gap-1 overflow-x-auto scrollbar-none ${
          isDarkMode
            ? 'bg-slate-900/95 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('compte')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'compte'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Mon Profil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paiements')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'paiements'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Paiements & Reçus</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('boutique')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'boutique'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Boutique & Parrainage</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reglages')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'reglages'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Paramètres</span>
        </button>
      </div>
    </div>
  );
};
