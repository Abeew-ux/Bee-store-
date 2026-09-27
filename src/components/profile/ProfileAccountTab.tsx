import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  User,
  Phone,
  MapPin,
  Package,
  LogOut,
  CheckCircle2,
  Sparkles,
  Save,
  Check,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

interface ProfileAccountTabProps {
  onClose: () => void;
  myOrdersCount: number;
}

export const ProfileAccountTab: React.FC<ProfileAccountTabProps> = ({
  onClose,
  myOrdersCount,
}) => {
  const {
    currentUser,
    logoutUser,
    openAuthModal,
    deliveryAddress,
    setDeliveryAddress,
    setActiveTab,
    isDarkMode,
    showToast,
  } = useStore();

  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: deliveryAddress.fullName || currentUser?.fullName || '',
    phone: deliveryAddress.phone || currentUser?.phone || '',
    city: deliveryAddress.city || currentUser?.city || 'Niamey',
    neighborhood: deliveryAddress.neighborhood || currentUser?.neighborhood || '',
    addressDetails: deliveryAddress.addressDetails || '',
  });

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryAddress({
      ...deliveryAddress,
      fullName: addressForm.fullName,
      phone: addressForm.phone,
      city: addressForm.city,
      neighborhood: addressForm.neighborhood,
      addressDetails: addressForm.addressDetails,
    });
    setIsEditingAddress(false);
    showToast('Adresse de livraison enregistrée', 'success');
  };

  return (
    <div className="space-y-4">
      {/* 1. STATUS CARD (Connecté ou Invitation de Connexion) */}
      {currentUser ? (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Compte Actif & Vérifié
            </span>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
              Session Ouverte
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs mb-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                Numéro Mobile
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currentUser.phone}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                Localisation
              </span>
              <span className="font-bold text-amber-500 truncate block">
                {currentUser.city} {currentUser.neighborhood ? `(${currentUser.neighborhood})` : ''}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('tracking');
              }}
              className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>Suivre mes Commandes ({myOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                onClose();
              }}
              className="py-2.5 px-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Connexion Recommandée
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
              Rapide & Sécurisé
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Connectez-vous pour retrouver automatiquement vos coordonnées, suivre les statuts de livraison de vos colis et bénéficier des garanties Golden Bee Store.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Se Connecter</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal('register');
              }}
              className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Créer un Compte</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ADRESSE DE LIVRAISON PAR DÉFAUT */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-500" />
            Adresse de Livraison Prédéfinie
          </span>
          <button
            type="button"
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditingAddress ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>

        {isEditingAddress ? (
          <form onSubmit={handleSaveAddress} className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 block mb-1">
                  Nom Complet
                </label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="Ex: Ibrahim Boubacar"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 block mb-1">
                  Numéro de Téléphone
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="Ex: 97470831"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 block mb-1">
                  Ville
                </label>
                <select
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Niamey">Niamey</option>
                  <option value="Agadez">Agadez</option>
                  <option value="Maradi">Maradi</option>
                  <option value="Zinder">Zinder</option>
                  <option value="Tahoua">Tahoua</option>
                  <option value="Dosso">Dosso</option>
                  <option value="Diffa">Diffa</option>
                  <option value="Tillabéri">Tillabéri</option>
                </select>
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 block mb-1">
                  Quartier / Repère
                </label>
                <input
                  type="text"
                  value={addressForm.neighborhood}
                  onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                  placeholder="Ex: Plateau, Yantala"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer l'Adresse</span>
            </button>
          </form>
        ) : (
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                {deliveryAddress.fullName || currentUser?.fullName || 'Non renseigné'}
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                {deliveryAddress.phone || currentUser?.phone || 'Pas de numéro'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {deliveryAddress.city || currentUser?.city || 'Niamey'}
              {deliveryAddress.neighborhood ? `, Quartier ${deliveryAddress.neighborhood}` : ''}
              {deliveryAddress.addressDetails ? ` — ${deliveryAddress.addressDetails}` : ''}
            </p>
          </div>
        )}
      </div>

      {/* 3. ASSURANCE & PROTECTION CLIENT */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-amber-700 dark:text-amber-400">
            Protection Trade Assurance 100%
          </h4>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mt-0.5">
            Toutes vos commandes sont protégées jusqu’à la livraison à votre adresse ou la réception en main propre au comptoir.
          </p>
        </div>
      </div>
    </div>
  );
};
