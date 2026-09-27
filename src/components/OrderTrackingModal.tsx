import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
}) => {
  const { searchOrder, orders } = useStore();
  const [searchQuery, setSearchQuery] = useState(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      return searchOrder(initialOrderNumber) || null;
    }
    return orders.length > 0 ? orders[0] : null;
  });

  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = searchOrder(searchQuery.trim());
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente':
        return 0;
      case 'payee_nita':
        return 1;
      case 'en_preparation':
        return 2;
      case 'en_livraison':
        return 3;
      case 'livree':
        return 4;
      case 'annulee':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = searchedOrder ? getStatusStepIndex(searchedOrder.orderStatus) : 0;

  const stages = [
    { title: 'Reçue', label: 'Commande enregistrée' },
    { title: 'Payée', label: 'Validée My Nita' },
    { title: 'Préparation', label: 'Emballage au dépôt' },
    { title: 'En livraison', label: 'Coursier en route' },
    { title: 'Livrée', label: 'Colis réceptionné' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Suivi de Commande en Temps Réel</h2>
              <p className="text-xs text-slate-300">
                Entrez votre numéro de commande pour connaître l'état d'acheminement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: CMD-2026-8941 ou NIT-98421074"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-mono font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all"
            >
              Rechercher
            </button>
          </form>

          {/* Quick list of sample order IDs for demo testing */}
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
            <span className="shrink-0 font-semibold">Exemples :</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchQuery(o.orderNumber);
                  setSearchedOrder(o);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] shrink-0"
              >
                {o.orderNumber}
              </button>
            ))}
          </div>

          {/* Result view */}
          {searchedOrder ? (
            <div className="space-y-6">
              {/* Order summary card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {searchedOrder.orderNumber}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Payé My Nita
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Destinataire : <strong>{searchedOrder.customer.fullName}</strong> • {searchedOrder.customer.city}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-700">
                    Mode : {searchedOrder.deliveryMethod.name}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold">
                    Délai : {searchedOrder.deliveryMethod.delay}
                  </div>
                </div>
              </div>

              {/* Visual Timeline Pipeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Progression de la livraison
                </h4>

                <div className="grid grid-cols-5 gap-1 text-center">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-2 ${
                            isCurrent
                              ? 'text-emerald-800 font-extrabold'
                              : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.title}
                        </span>
                        <span className="text-[9px] text-slate-400 hidden sm:block">
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Event Logs */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Journal des étapes
                </h4>

                <div className="space-y-3 border-l-2 border-emerald-500 ml-3 pl-4">
                  {searchedOrder.timeline.map((event, idx) => {
                    const formatted = new Date(event.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    });

                    return (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {event.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatted}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery info & Hotline */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950">Besoin d'aide sur votre livraison ?</p>
                  <p className="text-emerald-800">
                    Contactez directement notre service logistique ou votre agence My Nita.
                  </p>
                </div>
                <a
                  href="tel:+22720730000"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Aucune commande trouvée</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Vérifiez la référence de commande saisie (ex: <code>CMD-2026-8941</code>) ou votre reçu My Nita.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
