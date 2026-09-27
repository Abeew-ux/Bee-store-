import React from 'react';
import { ShieldCheck, Truck, Smartphone, QrCode, ArrowRight, Award, Zap, Store, Gift } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  const { setIsCreateShopModalOpen, setIsReferralModalOpen } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-500/30 my-6">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & CTA */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Golden Bee Niger • Trade Assurance 100%</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-sans">
            Achetez en gros et au détail, <br />
            directement auprès des <span className="text-orange-500">Fournisseurs Vérifiés</span>.
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Commandez vos smartphones, vêtements, cosmétiques et équipements aux meilleurs prix avec paiement sécurisé <strong>My Nita</strong> & <strong>Amana Ta</strong> (97470831).
          </p>

          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Fournisseurs Certifiés</p>
                <p className="text-slate-400 text-[11px]">Boutiques auditées</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Expédition Directe</p>
                <p className="text-slate-400 text-[11px]">Livraison express Niger</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Trade Assurance</p>
                <p className="text-slate-400 text-[11px]">Protection commande</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 text-xs sm:text-sm"
            >
              Explorer les Produits
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCreateShopModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 text-xs sm:text-sm"
            >
              <Store className="w-4 h-4 text-orange-400" />
              <span>Devenir Fournisseur</span>
            </button>
          </div>
        </div>

        {/* Right Column: Golden Bee Trade Assurance Guarantee Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-orange-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative">
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  GB
                </div>
                <span className="font-black text-sm tracking-wide text-orange-400">
                  Trade Assurance
                </span>
              </div>
              <span className="text-[10px] font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
                100% Garanti
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Paiements Protégés :</span>
                  <span className="text-orange-400 font-bold">Actifs</span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5 font-bold text-slate-200">
                  <span className="bg-orange-950/60 text-orange-300 border border-orange-800/40 px-2 py-0.5 rounded text-[10px]">My Nita Direct</span>
                  <span className="bg-orange-950/60 text-orange-300 border border-orange-800/40 px-2 py-0.5 rounded text-[10px]">Amana Ta</span>
                  <span className="bg-orange-950/60 text-orange-300 border border-orange-800/40 px-2 py-0.5 rounded text-[10px]">QR Code</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-xl">
                <ShieldCheck className="w-7 h-7 text-orange-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-100 text-xs">Garantie Acheteur & Vendeur</p>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Fonds sécurisés vers le compte officiel 97470831 jusqu'à réception de vos colis.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsReferralModalOpen(true)}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Gagner 500 F par boutique parrainée</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
