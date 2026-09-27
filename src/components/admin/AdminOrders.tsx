import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Check,
  Clock,
  Truck,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Calendar,
  X,
  Lock,
  Unlock,
  Bell,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    adminValidateCustomerPayment,
    adminReleaseFundsToVendor,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shopName && order.shopName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente_validation_admi':
        return {
          label: 'Attente Validation Admi',
          className: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'fonds_bloques_sequestre':
        return {
          label: 'Paiement Validé (97470831)',
          className: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'remis_client_attente_liberation':
        return {
          label: 'Preuve Fournie (À transférer)',
          className: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'fonds_liberes_vendeur':
        return {
          label: 'Gains Transférés au Vendeur',
          className: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      case 'payee_nita':
        return {
          label: 'Payée (97470831)',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'en_preparation':
        return {
          label: 'En préparation',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'en_livraison':
        return {
          label: 'En livraison',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'livree':
        return {
          label: 'Livrée avec succès',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'annulee':
        return {
          label: 'Annulée',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      default:
        return {
          label: 'En attente',
          className: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const pendingDeliveryProofs = orders.filter(
    (o) => o.orderStatus === 'remis_client_attente_liberation'
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Gestion des Commandes & Règlements Golden Bee Store
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administration centralisée sur le compte <strong>97470831</strong> : validation des captures de transferts et virement des gains aux boutiques.
          </p>
        </div>

        <div className="text-xs bg-amber-50 text-amber-950 px-3.5 py-2 rounded-xl border border-amber-200 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Compte Central : 97470831</span>
        </div>
      </div>

      {/* 🚨 High Priority Delivery Proof Notification for Admin */}
      {pendingDeliveryProofs.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-2xl border-2 border-blue-400 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-200">
                🔔 {pendingDeliveryProofs.length} Preuve(s) de remise reçue(s) — Action requise
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Les boutiques partenaires ont livré les colis aux clients et téléversé les photos de preuve. Vous pouvez vérifier et débloquer leurs fonds.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('remis_client_attente_liberation')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl shrink-0 transition-colors shadow-xs"
          >
            Filtrer ces commandes &rarr;
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par n° commande, client, tél, boutique..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-medium"
          >
            <option value="all">Tous les statuts ({orders.length})</option>
            <option value="en_attente_validation_admi">Captures clients en attente validation</option>
            <option value="fonds_bloques_sequestre">Paiements validés (en préparation)</option>
            <option value="remis_client_attente_liberation">Preuves de remise à transférer</option>
            <option value="fonds_liberes_vendeur">Gains transférés au vendeur</option>
            <option value="livree">Livrées</option>
            <option value="annulee">Annulées</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">N° Commande</th>
                <th className="p-3.5 font-semibold">Boutique & Date</th>
                <th className="p-3.5 font-semibold">Client & Contact</th>
                <th className="p-3.5 font-semibold">Mode Livraison</th>
                <th className="p-3.5 font-semibold">Montant (97470831)</th>
                <th className="p-3.5 font-semibold">Statut Commande</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Aucune commande ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.orderStatus);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      {/* Order number */}
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>

                      {/* Shop & Date */}
                      <td className="p-3.5">
                        <div className="text-slate-900 font-bold">
                          {order.shopName || 'Boutique Partenaire'}
                        </div>
                        <div className="text-[10px] text-slate-400">{formattedDate}</div>
                      </td>

                      {/* Client */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{order.customer.fullName}</div>
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-slate-500 hover:text-amber-700 text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {order.customer.phone}
                        </a>
                      </td>

                      {/* Mode */}
                      <td className="p-3.5 text-slate-700">
                        <span className="font-medium">{order.deliveryMethod.name}</span>
                        <div className="text-[10px] text-slate-400">
                          {order.customer.city}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-3.5">
                        <span className="font-black text-slate-900">
                          {order.total.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.orderStatus === 'en_attente_validation_admi' && (
                            <button
                              onClick={() => adminValidateCustomerPayment(order.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                              title="Valider la capture client"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Valider paiement</span>
                            </button>
                          )}

                          {order.orderStatus === 'remis_client_attente_liberation' && (
                            <button
                              onClick={() => adminReleaseFundsToVendor(order.id)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                              title="Libérer les fonds au vendeur"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Libérer fonds</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Voir les détails et captures"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Détail Commande {selectedOrderDetails.orderNumber}
                </h3>
                <p className="text-xs text-amber-800 font-semibold">
                  Boutique : {selectedOrderDetails.shopName || 'Boutique Partenaire'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proofs Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client Proof */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">1. Capture Paiement Client</span>
                {selectedOrderDetails.paymentProofImage ? (
                  <img
                    src={selectedOrderDetails.paymentProofImage}
                    alt="Capture client"
                    className="w-full h-36 object-contain rounded-xl bg-slate-900 border border-slate-300"
                  />
                ) : (
                  <p className="text-slate-400 italic">Aucune capture jointe</p>
                )}
                {selectedOrderDetails.orderStatus === 'en_attente_validation_admi' && (
                  <button
                    onClick={() => {
                      adminValidateCustomerPayment(selectedOrderDetails.id);
                      setSelectedOrderDetails(null);
                    }}
                    className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Valider Paiement Client</span>
                  </button>
                )}
              </div>

              {/* Vendor Delivery Proof */}
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2 text-xs">
                <span className="font-bold text-blue-950 block">2. Photo Remise Vendeur</span>
                {selectedOrderDetails.vendorDeliveryProofImage ? (
                  <img
                    src={selectedOrderDetails.vendorDeliveryProofImage}
                    alt="Photo de remise"
                    className="w-full h-36 object-contain rounded-xl bg-slate-900 border border-blue-300"
                  />
                ) : (
                  <p className="text-slate-400 italic">En attente de remise par le vendeur</p>
                )}
                {selectedOrderDetails.vendorHandoverNote && (
                  <p className="text-[11px] text-blue-900">
                    <strong>Note :</strong> {selectedOrderDetails.vendorHandoverNote}
                  </p>
                )}
                {selectedOrderDetails.orderStatus === 'remis_client_attente_liberation' && (
                  <button
                    onClick={() => {
                      adminReleaseFundsToVendor(selectedOrderDetails.id);
                      setSelectedOrderDetails(null);
                    }}
                    className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Libérer les Fonds au Vendeur</span>
                  </button>
                )}
              </div>
            </div>

            {/* Financials */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-1 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span>{selectedOrderDetails.subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison :</span>
                <span>{selectedOrderDetails.deliveryCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Montant Total :</span>
                <span className="text-amber-700">
                  {selectedOrderDetails.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
