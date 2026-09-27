import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePWA } from '../../hooks/usePWA';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { NotificationModal } from '../NotificationModal';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Sun,
  Moon,
  User,
  ShieldCheck,
  Bell,
  Heart,
  Crown,
  Lock,
  Store,
  Download,
  Smartphone,
  WifiOff,
  HelpCircle,
} from 'lucide-react';

interface MobileHeaderProps {
  onSearchClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = () => {
  const {
    activeTab,
    setActiveTab,
    cartCount,
    unreadChatCount,
    favoritesCount,
    isLoadingProducts,
    isDarkMode,
    toggleDarkMode,
    setIsUserProfileModalOpen,
    openAuthModal,
    currentUser,
    unreadNotificationsCount,
    shops,
    currentVendorShop,
    isAdminAuthenticated,
    openOnboardingTutorial,
  } = useStore();

  const pwaState = usePWA();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);

  // Tab titles for non-shop screens
  const getTabTitle = () => {
    switch (activeTab) {
      case 'favorites':
        return 'Mes Favoris';
      case 'chat':
        return 'Discussions Vendeurs';
      case 'cart':
        return 'Mon Panier';
      case 'vendor':
        return 'Ma Boutique';
      case 'search':
        return 'Rechercher';
      case 'tracking':
        return 'Suivi Colis';
      case 'admin':
        return 'Espace Gérant';
      default:
        return 'Bee Store';
    }
  };

  // Active store title
  const activeHeaderTitle = currentVendorShop ? currentVendorShop.name : 'Bee Store';
  const activeHeaderSubtitle = currentVendorShop ? (currentVendorShop.category || 'BOUTIQUE OFFICIELLE') : 'STORE OFFICIEL';

  return (
    <>
      <header className="shrink-0 z-30 select-none bg-[#070D1E] text-white border-b border-[#18284B] transition-colors duration-200">
        {/* If on Shop tab -> Royal Dark Navy & Gold Header from Screenshot */}
        {activeTab === 'shop' ? (
          <div className="px-3.5 pt-3.5 pb-2.5 flex flex-col gap-2.5">
            {/* Top Row: Brand Profile Left + Lock & Cart Actions Right */}
            <div className="flex items-center justify-between">
              {/* Left: Round Gold Emblem + Brand Name + Subtitle */}
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className="flex items-center gap-2.5 text-left focus:outline-none group active:scale-98 transition-transform"
              >
                {/* Round Yellow-Gold Crown Emblem */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-amber-300/60 group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5 fill-slate-950 text-slate-950 stroke-[2.2]" />
                </div>

                <div className="flex flex-col">
                  <h1 className="text-base font-black tracking-wide text-amber-400 uppercase leading-none group-hover:text-amber-300 transition-colors">
                    {activeHeaderTitle}
                  </h1>
                  <span className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                    {activeHeaderSubtitle}
                  </span>
                </div>
              </button>

              {/* Right: Round Action Buttons (PWA, Notifications, User & Cart) */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* PWA Direct Install or Offline Badge */}
                {!pwaState.isInstalled ? (
                  <button
                    type="button"
                    onClick={() => setIsPWAModalOpen(true)}
                    className="relative px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center gap-1 text-[10.5px] font-black shadow-md shadow-amber-500/30 active:scale-95 transition-all"
                    title="Installer l'application"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">App</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPWAModalOpen(true)}
                    className="w-9 h-9 rounded-full bg-[#101C38] border border-[#1E325A] text-amber-400 flex items-center justify-center shadow-md active:scale-95 transition-all"
                    title="Gestion PWA & Cache"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                )}

                {/* Notification Bell with Badge */}
                <button
                  type="button"
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="relative w-9 h-9 rounded-full bg-[#101C38] border border-[#1E325A] text-slate-300 hover:text-white hover:bg-[#16264C] flex items-center justify-center shadow-md active:scale-95 transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Crown Admin Mode Access Button (Visible ONLY when admin is authenticated) */}
                {isAdminAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all bg-[#101C38] border border-amber-500/60 text-amber-400 hover:bg-[#16264C]"
                    title="Espace Administrateur"
                  >
                    <Crown className="w-4 h-4 fill-current stroke-[1.8]" />
                  </button>
                )}

                {/* Guide & Onboarding Tutorial Button */}
                <button
                  type="button"
                  onClick={openOnboardingTutorial}
                  className="w-9 h-9 rounded-full bg-[#101C38] border border-[#1E325A] text-amber-400 hover:text-amber-300 hover:bg-[#16264C] flex items-center justify-center shadow-md active:scale-95 transition-all"
                  title="Guide & Tutoriel de l'application"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Lock / Auth / Admin / Vendor Portal Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      setIsUserProfileModalOpen(true);
                    } else {
                      openAuthModal('login');
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-[#101C38] border border-[#1E325A] text-slate-300 hover:text-amber-400 hover:bg-[#16264C] flex items-center justify-center shadow-md active:scale-95 transition-all"
                  title={currentUser ? `Compte (${currentUser.fullName})` : 'Connexion / Espace Vendeur & Gérant'}
                >
                  {currentUser ? <User className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4" />}
                </button>

                {/* Cart Action Button */}
                <button
                  id="mobile-header-cart-btn"
                  type="button"
                  onClick={() => setActiveTab('cart')}
                  className="relative w-9 h-9 rounded-full bg-[#101C38] border border-[#1E325A] text-slate-300 hover:text-amber-400 hover:bg-[#16264C] flex items-center justify-center shadow-md active:scale-95 transition-all"
                  title="Mon Panier"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm shadow-amber-500/40">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Header for Other Tabs (Favoris, Chat, Panier, Boutique, Admin, Suivi) */
          <div className="px-3.5 py-3 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
                <Crown className="w-4 h-4 fill-slate-950 text-slate-950 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white leading-none">
                  {getTabTitle()}
                </h2>
                <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                  BEE STORE • BOUTIQUE
                </p>
              </div>
            </button>

            {/* Right micro actions */}
            <div className="flex items-center gap-1.5">
              {/* PWA quick icon if not installed */}
              {!pwaState.isInstalled && (
                <button
                  type="button"
                  onClick={() => setIsPWAModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black active:scale-95 transition-all shadow-xs"
                  title="Installer l'application"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {isLoadingProducts && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-medium animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                </div>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="relative w-8 h-8 rounded-full bg-[#101C38] border border-[#1E325A] text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Admin Crown Shortcut on other tabs */}
              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'admin' ? 'shop' : 'admin')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs active:scale-95 transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                      : 'bg-[#101C38] border border-amber-500/60 text-amber-400 hover:bg-[#16264C]'
                  }`}
                  title={activeTab === 'admin' ? 'Retour Boutique' : 'Espace Administrateur'}
                >
                  <Crown className="w-3.5 h-3.5 fill-current stroke-[1.8]" />
                </button>
              )}

              {/* Guide Button */}
              <button
                type="button"
                onClick={openOnboardingTutorial}
                className="w-8 h-8 rounded-full bg-[#101C38] border border-[#1E325A] text-amber-400 hover:text-amber-300 flex items-center justify-center active:scale-95 transition-all"
                title="Guide de l'application"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* User Profile */}
              {currentUser ? (
                <button
                  onClick={() => setIsUserProfileModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101C38] text-amber-400 border border-amber-500/40 text-xs font-bold active:scale-95 transition-all"
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[9px]">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10.5px] truncate max-w-[55px]">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-8 h-8 rounded-full bg-[#101C38] border border-[#1E325A] text-slate-300 hover:text-amber-400 flex items-center justify-center active:scale-95 transition-all"
                  title="Connexion"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* PWA Modal */}
      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
        pwaState={pwaState}
      />
    </>
  );
};



