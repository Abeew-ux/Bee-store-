import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { REFERRAL_BONUS_PER_SHOP, SHOP_MONTHLY_FEE } from '../../types';
import { getReferralWhatsAppUrl, getShopReferralUrl, copyToClipboard } from '../../utils/shareUtils';
import {
  Gift,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Users,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Store,
  Wallet,
} from 'lucide-react';

interface ReferralGuideBannerProps {
  compact?: boolean;
  className?: string;
}

export const ReferralGuideBanner: React.FC<ReferralGuideBannerProps> = ({
  compact = false,
  className = '',
}) => {
  const {
    currentVendorShop,
    setIsReferralModalOpen,
    setIsCreateShopModalOpen,
    isDarkMode,
    showToast,
  } = useStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFullGuide, setShowFullGuide] = useState(!compact);

  // Active referral code for this vendor or default demo code
  const referralCode =
    currentVendorShop?.referralCode ||
    (currentVendorShop?.phone
      ? `BEE-${currentVendorShop.phone.replace(/\s+/g, '').slice(-4)}`
      : 'BEE-PROMO-227');

  const referralLink = getShopReferralUrl(referralCode);
  const referralsCount = currentVendorShop?.referralsCount || 0;
  const totalEarnings = currentVendorShop?.referralEarnings || referralsCount * REFERRAL_BONUS_PER_SHOP;

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(referralCode);
    if (ok) {
      setCopiedCode(true);
      showToast('Code parrain copié !', 'success', `Code : ${referralCode}`);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(referralLink);
    if (ok) {
      setCopiedLink(true);
      showToast('Lien de parrainage copié !', 'success', 'Collez et partagez ce lien sur WhatsApp ou Facebook.');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = getReferralWhatsAppUrl({
      referralCode,
      shopName: currentVendorShop?.name || 'Golden Bee Store',
    });
    window.open(waUrl, '_blank');
  };

  return (
    <div
      className={`rounded-3xl border transition-all overflow-hidden shadow-lg ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/30 text-slate-100 shadow-amber-950/20'
          : 'bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/70 border-amber-300/80 text-slate-900 shadow-amber-900/10'
      } ${className}`}
    >
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                  Bonus Parrainage
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  +{REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} FCFA / Boutique
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight mt-1">
                Gagnez 500 FCFA en invitant des commerçants
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Partagez votre lien ou code unique. Chaque fois qu'une nouvelle boutique s'ouvre avec votre parrainage (abonnement à 1 500 F/mois), vous touchez <strong>500 FCFA</strong> !
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullGuide(!showFullGuide)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white/50 dark:bg-slate-800/50 transition-colors shrink-0"
            title={showFullGuide ? 'Réduire' : 'Déplier le guide complet'}
          >
            {showFullGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Referral Code & Sharing Action Bar */}
        <div className="mt-3.5 pt-3.5 border-t border-amber-200/80 dark:border-slate-800/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Referral Code Chip */}
            <div className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-500/40 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Votre Code :
                </span>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400 tracking-wider">
                  {referralCode}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                    copiedCode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 hover:bg-amber-200'
                  }`}
                  title="Copier le code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copié' : 'Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                    copiedLink
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                  title="Copier le lien d'inscription"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copié' : 'Lien'}</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Partager sur WhatsApp</span>
            </button>
          </div>

          {/* Quick Stats Pill if Vendor is logged in */}
          {currentVendorShop && (
            <div className="flex items-center justify-between p-2.5 bg-white/70 dark:bg-slate-950/70 rounded-2xl border border-amber-200/60 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Filleuls parrainés :</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">
                  {referralsCount} boutique(s)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Total gains :</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {totalEarnings.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded 4-Step How-It-Works Visual Guide */}
      {showFullGuide && (
        <div className="p-4 sm:p-5 pt-3 bg-white/50 dark:bg-slate-950/40 border-t border-amber-200/80 dark:border-slate-800 space-y-3">
          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Comment fonctionne le parrainage en 4 étapes simples ?
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  1
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Partagez votre Code ou Lien
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Envoyez votre lien d'invitation à des commerçants, artisans ou vendeurs de votre entourage.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Création de la Boutique (1 500 F/mois)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Le nouveau vendeur crée sa boutique en renseignant votre code parrain et envoie sa capture vers le compte <strong>97470831</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  3
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Crédit automatique de 500 FCFA
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Dès l'inscription, votre solde de parrainage est automatiquement crédité de <strong>+500 FCFA</strong> par boutique !
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                  4
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Règlement via My Nita ou Amana Ta
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Vos commissions sont validées et transférées directement par l'administrateur via <strong>My Nita</strong> ou <strong>Amana Ta</strong>.
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Paiements vérifiés et garantis par Golden Bee Store
            </span>

            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Voir l'espace parrainage complet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
