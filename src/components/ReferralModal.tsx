import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { REFERRAL_BONUS_PER_SHOP, SHOP_MONTHLY_FEE } from '../types';
import { copyToClipboard, getClaimReferralEarningsWhatsAppUrl } from '../utils/shareUtils';
import {
  Gift,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Users,
  Coins,
  Sparkles,
  Store,
  X,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Phone,
} from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentVendorShop,
    setIsCreateShopModalOpen,
    sponsorNotifications,
    markSponsorNotificationAsRead,
    isDarkMode,
    showToast,
  } = useStore();
  const [copied, setCopied] = useState(false);
  const [claimPhone, setClaimPhone] = useState(
    currentUser?.phone || currentVendorShop?.phone || ''
  );
  const [sponsorNameInput, setSponsorNameInput] = useState(
    currentUser?.fullName || currentVendorShop?.ownerName || ''
  );

  if (!isOpen) return null;

  // Use vendor shop referral code or user referral code or fallback
  const referralCode =
    currentVendorShop?.referralCode ||
    currentUser?.referralCode ||
    (currentVendorShop?.name
      ? `BEE-${currentVendorShop.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()}`
      : 'BEE-PROMO-227');

  const targetCode = referralCode.toUpperCase();
  const userPhone = (currentUser?.phone || currentVendorShop?.phone || '').replace(/\s+/g, '');
  const mySponsorAlerts = sponsorNotifications.filter(
    (n) =>
      (n.sponsorReferralCode && n.sponsorReferralCode.toUpperCase() === targetCode) ||
      (userPhone && n.sponsorPhone && n.sponsorPhone.replace(/\s+/g, '').includes(userPhone))
  );

  const referralsCount =
    (currentVendorShop?.referralsCount || 0) +
    (mySponsorAlerts.length > 0 ? mySponsorAlerts.length : 0);
  const totalEarnings =
    currentVendorShop?.referralEarnings ||
    currentUser?.cagnotteFCFA ||
    referralsCount * REFERRAL_BONUS_PER_SHOP;

  const shareText = `🚀 Ouvre ta boutique officielle sur Bee Store pour seulement ${SHOP_MONTHLY_FEE.toLocaleString(
    'fr-FR'
  )} FCFA/mois ! Utilise mon code parrain : ${referralCode} lors de la création de ta boutique.`;

  const shareUrl = `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}`;

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(referralCode);
    if (ok) {
      setCopied(true);
      showToast('Code parrain copié !', 'success', referralCode);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const fullMessage = `${shareText}\n\nLien direct d'inscription : ${shareUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Programme de Parrainage Bee Store',
          text: shareText,
          url: shareUrl,
        });
        showToast('Invitation partagée !', 'success');
        return;
      } catch {
        // Fallback
      }
    }
    handleCopyCode();
  };

  const handleClaimEarningsWhatsApp = () => {
    const phoneToUse = claimPhone.trim() || userPhone || '97470831';
    const nameToUse = sponsorNameInput.trim() || currentUser?.fullName || currentVendorShop?.ownerName || 'Parrain Bee Store';

    const claimUrl = getClaimReferralEarningsWhatsAppUrl({
      adminPhone: '97470831',
      sponsorName: nameToUse,
      sponsorPhone: phoneToUse,
      sponsorCode: referralCode,
      referralsCount,
      totalEarnings: totalEarnings > 0 ? totalEarnings : REFERRAL_BONUS_PER_SHOP,
    });

    window.open(claimUrl, '_blank');
    showToast(
      'Réclamation ouverte sur WhatsApp !',
      'success',
      'L\'administrateur traitera votre versement rapidement.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border z-10 overflow-hidden max-h-[92dvh] flex flex-col transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-4 sm:p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl shadow-md">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                Programme Partenaire
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight mt-0.5">
                Parrainage & Récompenses
              </h2>
              <p className="text-xs font-bold text-slate-900">
                Gagnez <span className="underline">{REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} FCFA</span> par boutique invitée
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 scrollbar-none text-sm">
          {/* Stats Bar if logged in as vendor */}
          {currentVendorShop && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Boutiques parrainées</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {referralsCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Total gains</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {totalEarnings.toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Referral Code Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">
              Votre Code Parrain Exclusif :
            </label>
            <div
              className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2 ${
                isDarkMode
                  ? 'bg-slate-950 border-amber-500/40 text-slate-100'
                  : 'bg-amber-50/60 border-amber-300 text-slate-900'
              }`}
            >
              <div className="min-w-0">
                <span className="font-mono font-black text-lg sm:text-xl tracking-wider text-amber-500">
                  {referralCode}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  À saisir lors de la création de la boutique
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1-Click WhatsApp Share Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600 shrink-0" />
              <span>Inviter des Vendeurs sur WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <Share2 className="w-4 h-4 text-amber-500" />
              <span>Partager sur les Réseaux Sociaux</span>
            </button>
          </div>

          {/* Section: Réclamer mon gain sur WhatsApp */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode
                ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-100'
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    Réclamer mes Gains de Parrainage
                  </h4>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-400">
                    Contact direct de l'administrateur WhatsApp (97470831)
                  </span>
                </div>
              </div>
              <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                {totalEarnings > 0 ? `${totalEarnings.toLocaleString('fr-FR')} F` : '500 F / shop'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Votre Nom ou Pseudo :
                </label>
                <input
                  type="text"
                  value={sponsorNameInput}
                  onChange={(e) => setSponsorNameInput(e.target.value)}
                  placeholder="Ex: Abdourahamane"
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-medium ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Votre Numéro Récepteur (NITA / WhatsApp) :
                </label>
                <input
                  type="tel"
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(e.target.value)}
                  placeholder="Ex: 90 12 34 56"
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-medium font-mono ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleClaimEarningsWhatsApp}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-700" />
              <span>Contacter sur WhatsApp pour Réclamer mon Gain</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Live Sponsor Alerts from Firestore */}
          {mySponsorAlerts.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDarkMode ? 'bg-slate-950 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  <span>Vos Filleuls Enregistrés ({mySponsorAlerts.length})</span>
                </h4>
                <span className="text-[10px] font-black font-mono text-emerald-700 dark:text-emerald-300">
                  +{(mySponsorAlerts.length * 500).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {mySponsorAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markSponsorNotificationAsRead(alert.id)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        🏪 {alert.newShopName} ({alert.newShopCity})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">
                        Parrainé : <strong>{alert.newOwnerName}</strong>
                      </span>
                      <a
                        href={`https://wa.me/${alert.newShopPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Félicitations pour l'ouverture de votre boutique "${alert.newShopName}" sur Golden Bee Store !`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How It Works Explanation */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              isDarkMode
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Comment ça fonctionne ?
            </h4>

            <ol className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Partagez votre <strong>code de parrainage</strong> à vos amis, commerçants ou vendeurs.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-black text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Ils créent leur boutique pour <strong>{SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA/mois</strong> et renseignent votre code.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Dès l'ouverture validée, vous recevez automatiquement <strong>{REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} FCFA</strong> de commission !
                </span>
              </li>
            </ol>
          </div>

          {/* Quick Shop Open CTA if not vendor */}
          {!currentVendorShop && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsCreateShopModalOpen(true);
                }}
                className="text-xs font-bold text-amber-500 hover:text-amber-400 underline inline-flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vous n'avez pas encore de boutique ? Ouvrez-en une pour 1 500 F/mois</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
