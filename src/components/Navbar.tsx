import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BeePushingCart } from './BeePushingCart';
import {
  ShoppingBag,
  Package,
  Search,
  ShieldCheck,
  LayoutDashboard,
  Store,
  PhoneCall,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Gift,
  Award,
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenTracking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenTracking,
}) => {
  const {
    activeTab,
    setActiveTab,
    cartCount,
    setIsCartOpen,
    products,
    orders,
    resetToDefaultData,
    setIsReferralModalOpen,
    setIsCreateShopModalOpen,
    isAdminAuthenticated,
    currentUser,
  } = useStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate stock alert count for admin indicator
  const lowStockCount = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  ).length;

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'payee_nita' || o.orderStatus === 'en_preparation'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Utility & Trade Assurance Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 font-medium flex items-center justify-between gap-4 flex-wrap border-b border-slate-800">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-orange-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            Trade Assurance • Protection Acheteur 100%
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Fournisseurs Vérifiés & Boutiques Certifiées
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-300">
            Paiement Sécurisé My Nita & Amana Ta vers <strong>97470831</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] ml-auto">
          <button
            onClick={() => setIsReferralModalOpen(true)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
          >
            <Gift className="w-3 h-3 text-amber-400" />
            <span>Parrainage (500 F/boutique)</span>
          </button>
          <span className="text-slate-600">|</span>
          <a
            href="https://wa.me/22797470831"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <PhoneCall className="w-3 h-3" /> WhatsApp: +227 97 47 08 31
          </a>
        </div>
      </div>

      {/* Main Brand & Search Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Brand Golden Bee Store */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="group-hover:scale-105 transition-transform">
                <BeePushingCart size="md" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
                    Golden <span className="text-orange-500">Bee</span>
                  </span>
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                    Store
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  B2B & B2C Niger
                </p>
              </div>
            </button>
          </div>

          {/* 3-Segment Search Bar */}
          {activeTab === 'shop' && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="flex items-center w-full rounded-full border-2 border-orange-500 overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-orange-500/20">
                {/* Category Pill Selector */}
                <div className="flex items-center gap-1 px-3.5 py-2.5 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100 shrink-0">
                  <span>Produits</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>

                {/* Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que cherchez-vous ? Smartphone, mode, parfum, boutique..."
                    className="w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Signature Orange Search Button */}
                <button
                  onClick={() => {}}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Rechercher</span>
                </button>
              </div>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (showResetConfirm) {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                } else {
                  setShowResetConfirm(true);
                  setTimeout(() => setShowResetConfirm(false), 3500);
                }
              }}
              title="Réinitialiser les données de démo"
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                showResetConfirm
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${showResetConfirm ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">
                {showResetConfirm ? 'Confirmer ?' : 'Données démo'}
              </span>
            </button>

            {/* Suivi de Commande */}
            <button
              onClick={onOpenTracking}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
            >
              <Package className="w-4 h-4 text-orange-500" />
              <span className="hidden md:inline">Commandes & Suivi</span>
            </button>

            {/* Admin only or Vendor button */}
            {isAdminAuthenticated ? (
              <button
                onClick={() => setActiveTab(activeTab === 'admin' ? 'shop' : 'admin')}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-500" />
                <span>{activeTab === 'admin' ? 'Voir la Boutique' : '👑 Espace Administrateur'}</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab(activeTab === 'vendor' ? 'shop' : 'vendor')}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs ${
                  activeTab === 'vendor'
                    ? 'bg-slate-900 text-white shadow-slate-900/20'
                    : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                {activeTab === 'vendor' ? (
                  <>
                    <Store className="w-4 h-4 text-orange-400" />
                    <span>Voir le Catalogue</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 text-orange-600" />
                    <span>Espace Vendeur</span>
                    {(lowStockCount > 0 || pendingOrdersCount > 0) && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md shadow-orange-500/25 transition-all transform active:scale-95 text-xs sm:text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="bg-slate-950 text-orange-400 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar if in shop */}
        {activeTab === 'shop' && (
          <div className="md:hidden pb-3">
            <div className="flex items-center w-full rounded-full border-2 border-orange-500 overflow-hidden bg-white shadow-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher sur Golden Bee Store..."
                className="w-full pl-3.5 pr-2 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button
                onClick={() => {}}
                className="p-2 bg-orange-500 text-white font-bold"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
