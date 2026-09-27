import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  MessageCircle,
  CreditCard,
  Building,
  Smartphone,
  ExternalLink,
  Package,
} from 'lucide-react';

export const ProfilePaymentsTab: React.FC = () => {
  const { isDarkMode, showToast, setActiveTab } = useStore();
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAdminAccount = () => {
    navigator.clipboard.writeText('97470831');
    setCopiedAccount(true);
    showToast('Numéro copié !', 'info', 'Compte central 97470831');
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleContactAdminWhatsApp = () => {
    const message = encodeURIComponent(
      'Bonjour Administrateur Golden Bee Store, je vous contacte concernant mes transactions et paiements (Compte 97470831).'
    );
    window.open(`https://wa.me/22797470831?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* 1. COMPTE CENTRAL OFFICIEL DE SÉQUESTRE */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white border border-amber-500/30 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            COMPTE CENTRAL OFFICIEL
          </span>
          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Séquestre 100% Garanti
          </span>
        </div>

        <div>
          <p className="text-xs text-slate-300 mb-1">
            Numéro de dépôt & transfert pour toutes les commandes :
          </p>
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-amber-500/40">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                97470831
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                (My Nita & Amana Ta)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyAdminAccount}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAccount ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          💡 <strong className="text-amber-300">Important :</strong> Ce compte conserve vos fonds jusqu'à ce que vous receviez votre colis. La boutique partenaire n'est payée qu'après confirmation.
        </p>
      </div>

      {/* 2. MOYENS DE RÈGLEMENT AUTORISÉS */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Moyens de Paiement Disponibles au Niger
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Mobile & Guichet
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base font-black shrink-0">
              📲
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black block text-slate-900 dark:text-white">
                My Nita
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                Paiement instantané
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base font-black shrink-0">
              💳
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black block text-slate-900 dark:text-white">
                Amana Ta
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                Transfert sécurisé
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center text-base font-black shrink-0">
              📱
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black block text-slate-900 dark:text-white">
                Airtel Money
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                Portefeuille mobile
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base font-black shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black block text-slate-900 dark:text-white">
                Al Izza
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                Transfert national
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSISTANCE WHATSAPP CLIENT DIRECT */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
          <MessageCircle className="w-4 h-4" />
          <span>Une question sur votre paiement ou votre reçu ?</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          Notre service client vous répond en direct pour valider vos captures d'écran et débloquer vos commandes rapidement.
        </p>
        <button
          type="button"
          onClick={handleContactAdminWhatsApp}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Contacter le Support WhatsApp (97470831)</span>
        </button>
      </div>
    </div>
  );
};
