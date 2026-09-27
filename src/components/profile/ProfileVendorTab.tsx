import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ReferralGuideBanner } from '../vendor/ReferralGuideBanner';
import { SHOP_MONTHLY_FEE, REFERRAL_BONUS_PER_SHOP } from '../../types';
import {
  Store,
  Building2,
  Gift,
  ChevronRight,
  Sparkles,
  Share2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ProfileVendorTabProps {
  onClose: () => void;
}

export const ProfileVendorTab: React.FC<ProfileVendorTabProps> = ({ onClose }) => {
  const {
    currentVendorShop,
    setIsCreateShopModalOpen,
    setIsReferralModalOpen,
    setActiveTab,
    isDarkMode,
  } = useStore();

  return (
    <div className="space-y-4">
      {/* 1. MA BOUTIQUE OU DEVENIR VENDEUR */}
      {currentVendorShop ? (
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-500" />
              Ma Boutique Partenaire
            </span>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                currentVendorShop.status === 'approuvee'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              }`}
            >
              {currentVendorShop.status === 'approuvee'
                ? 'Boutique Ouverte'
                : 'En attente de validation'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={currentVendorShop.logoUrl}
              alt={currentVendorShop.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                {currentVendorShop.name}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {currentVendorShop.city}, {currentVendorShop.region} • {currentVendorShop.phone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveTab('vendor');
            }}
            className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>Accéder à mon Espace Vendeur</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Store className="w-4 h-4" /> Devenez Vendeur Agréé
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
              {SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} F/mois
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Exposez vos articles sur la marketplace n°1 au Niger, encaissez via WhatsApp et My Nita avec la garantie Trade Assurance.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsCreateShopModalOpen(true);
            }}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Ouvrir ma Boutique ({SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. GUIDE DU PARRAINAGE (Gagnez 500 F par boutique) */}
      <div className="space-y-2">
        <ReferralGuideBanner compact={false} />
      </div>

      {/* 3. ACCÈS MODAL PARRAINAGE DÉTAILLÉ */}
      <button
        type="button"
        onClick={() => {
          onClose();
          setIsReferralModalOpen(true);
        }}
        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 text-slate-200'
            : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold">
            <Gift className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black">Mon Code & Programme Parrainage</h4>
            <p className="text-[11px] text-slate-500">
              Gagnez {REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} FCFA par boutique affiliée
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
};
