import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { getProductShareUrl } from '../../utils/shareUtils';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Package,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const MobileTrackingView: React.FC = () => {
  const { orders, searchOrder, isDarkMode } = useStore();

  const [inputOrderNumber, setInputOrderNumber] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!inputOrderNumber.trim()) return;

    const found = searchOrder(inputOrderNumber.trim());
    if (found) {
      setSelectedOrder(found);
    } else {
      setErrorMessage('Numéro de commande introuvable. Vérifiez votre référence.');
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente':
        return 1;
      case 'payee_nita':
        return 2;
      case 'en_preparation':
        return 3;
      case 'en_livraison':
        return 4;
      case 'livree':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = selectedOrder ? getStepProgress(selectedOrder.orderStatus) : 1;

  const steps = [
    { num: 1, label: 'Enregistrée', desc: 'Commande créée' },
    { num: 2, label: 'Payée My Nita', desc: 'Paiement confirmé' },
    { num: 3, label: 'Préparation', desc: 'Au dépôt Nita' },
    { num: 4, label: 'En livraison', desc: 'Coursier en route' },
    { num: 5, label: 'Livrée', desc: 'Remise au client' },
  ];

  return (
    <div
      className={`flex-1 overflow-y-auto overscroll-contain p-3 space-y-3.5 scrollbar-none pb-4 transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <h3
          className={`text-sm font-extrabold flex items-center gap-1.5 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-amber-500" />
          <span>Suivi de Colis en Temps Réel</span>
        </h3>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isDarkMode
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          GPS Actif
        </span>
      </div>

      {/* Search Order Bar */}
      <form onSubmit={handleSearch} className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputOrderNumber}
            onChange={(e) => setInputOrderNumber(e.target.value.toUpperCase())}
            placeholder="Ex: CMD-84920..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono font-bold outline-none uppercase transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border border-slate-800 text-white focus:border-amber-500'
                : 'bg-slate-100 border border-slate-200 text-slate-900 focus:bg-white focus:border-amber-500'
            }`}
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
        >
          Chercher
        </button>
      </form>

      {errorMessage && (
        <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Select Recent Orders Pills */}
      {orders.length > 0 && (
        <div className="space-y-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-400'
            }`}
          >
            Commandes récentes
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSelectedOrder(o);
                  setInputOrderNumber(o.orderNumber);
                  setErrorMessage('');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedOrder?.id === o.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : isDarkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-300'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <span>{o.orderNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Order Details & Timeline */}
      {selectedOrder ? (
        <div className="space-y-3">
          {/* Order Header Card */}
          <div
            className={`rounded-2xl border p-3.5 space-y-2 shadow-2xs transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200/90 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">N° COMMANDE</span>
                <span
                  className={`text-sm font-black font-mono ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {selectedOrder.orderNumber}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  selectedOrder.orderStatus === 'livree'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : selectedOrder.orderStatus === 'en_livraison'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedOrder.orderStatus.replace('_', ' ')}
              </span>
            </div>

            <div
              className={`grid grid-cols-2 gap-2 pt-2 border-t text-[11px] ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div>
                <span className="text-slate-400 block text-[9px]">Paiement My Nita</span>
                <span
                  className={`font-bold font-mono ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  {selectedOrder.paymentReference}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">Total réglé</span>
                <span className="font-black text-amber-500 font-mono">
                  {selectedOrder.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div
            className={`rounded-2xl border p-3.5 space-y-3 shadow-2xs transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200/90 text-slate-900'
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-slate-300' : 'text-slate-800'
              }`}
            >
              Acheminement du colis
            </span>

            <div
              className={`relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 ${
                isDarkMode ? 'before:bg-slate-800' : 'before:bg-slate-200'
              }`}
            >
              {steps.map((s) => {
                const isPassed = currentStep >= s.num;
                const isCurrent = currentStep === s.num;

                return (
                  <div key={s.num} className="relative flex items-start justify-between">
                    {/* Step circle indicator */}
                    <div
                      className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                        isPassed
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                    </div>

                    <div className="pl-1">
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-amber-500 font-black'
                            : isPassed
                            ? isDarkMode
                              ? 'text-slate-100'
                              : 'text-slate-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {s.label}
                      </h4>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {s.desc}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        En cours
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered items with direct product link */}
          <div
            className={`rounded-2xl border p-3.5 space-y-2.5 shadow-2xs transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200/90 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                Articles commandés ({selectedOrder.items.length})
              </span>
            </div>

            <div className="space-y-2">
              {selectedOrder.items.map((item) => {
                const productUrl = getProductShareUrl(item.product.id);
                return (
                  <div
                    key={item.product.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{item.product.name}</p>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-[10px] text-slate-400">
                          {[item.selectedSize ? `Taille: ${item.selectedSize}` : '', item.selectedColor ? `Couleur: ${item.selectedColor}` : ''].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-amber-500 hover:underline font-bold mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Lien fiche produit</span>
                      </a>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Qté : {item.quantity}</span>
                      <span className="font-mono font-bold text-amber-500">
                        {(item.product.price * item.quantity).toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery destination card */}
          <div
            className={`rounded-2xl p-3 border space-y-1.5 text-xs transition-colors ${
              isDarkMode
                ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Adresse & Contact de livraison</span>
            </div>
            <p className={`text-[11px] ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              <strong>{selectedOrder.customer.fullName}</strong> — {selectedOrder.customer.phone}
            </p>
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedOrder.customer.city}, {selectedOrder.customer.neighborhood}{' '}
              {selectedOrder.customer.addressDetails}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-2xl p-8 text-center border space-y-2 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <Package className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs">Aucune commande sélectionnée.</p>
        </div>
      )}
    </div>
  );
};
