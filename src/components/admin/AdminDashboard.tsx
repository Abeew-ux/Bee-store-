import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  Plus,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface AdminDashboardProps {
  onAddNewProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onAddNewProduct }) => {
  const { products, orders, setAdminSubTab, updateStock, resetToDefaultData } = useStore();

  // KPIs
  const totalRevenue = orders.reduce((sum, order) => {
    return order.paymentStatus === 'reussi' ? sum + order.total : sum;
  }, 0);

  const totalOrdersCount = orders.length;

  const totalInventoryUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tableau de Bord & Ventes My Nita
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Suivi des flux financiers, commandes clients et alertes de stocks en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Chiffre d'Affaires */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Chiffre d'Affaires
            </span>
            <div className="text-xl font-black text-slate-900">
              {totalRevenue.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-bold text-emerald-600">FCFA</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% collecté via My Nita
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Commandes Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Commandes Passées
            </span>
            <div className="text-xl font-black text-slate-900">
              {totalOrdersCount} <span className="text-xs font-normal text-slate-500">commandes</span>
            </div>
            <button
              onClick={() => setAdminSubTab('orders')}
              className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              Gérer les expéditions <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Valeur du Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valeur du Stock
            </span>
            <div className="text-xl font-black text-slate-900">
              {totalInventoryUnits} <span className="text-xs font-normal text-slate-500">unités</span>
            </div>
            <span className="text-[11px] text-slate-500">
              ~ {totalInventoryValue.toLocaleString('fr-FR')} FCFA en stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Alertes Stocks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alertes Stocks
            </span>
            <div className="text-xl font-black text-amber-700">
              {outOfStockProducts.length + lowStockProducts.length}{' '}
              <span className="text-xs font-normal text-slate-500">critiques</span>
            </div>
            <button
              onClick={() => setAdminSubTab('inventory')}
              className="text-[11px] text-amber-800 font-semibold hover:underline flex items-center gap-0.5"
            >
              Voir le réapprovisionnement <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Real-time Critical Stock Alert Banner if any */}
      {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Articles nécessitant un réapprovisionnement immédiat</span>
            </div>
            <button
              onClick={() => setAdminSubTab('inventory')}
              className="text-xs font-bold text-amber-900 underline"
            >
              Gérer les stocks
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...outOfStockProducts, ...lowStockProducts].slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <img
                    src={item.image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p
                      className={`text-[11px] font-semibold ${
                        item.stock === 0 ? 'text-rose-600' : 'text-amber-700'
                      }`}
                    >
                      {item.stock === 0 ? 'Épuisé (0 unité)' : `Plus que ${item.stock} en stock`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => updateStock(item.id, item.stock + 10)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shrink-0"
                  title="Ajouter 10 unités au stock"
                >
                  +10 unités
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Dernières commandes enregistrées</h3>
            <p className="text-xs text-slate-500">Mises à jour automatiques après paiement My Nita</p>
          </div>
          <button
            onClick={() => setAdminSubTab('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Voir toutes les commandes ({orders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="p-3 font-semibold">N° Commande</th>
                <th className="p-3 font-semibold">Client</th>
                <th className="p-3 font-semibold">Destination</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Réf My Nita</th>
                <th className="p-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => {
                let badgeClass = 'bg-slate-100 text-slate-800';
                let statusLabel = 'En attente';

                if (order.orderStatus === 'payee_nita') {
                  badgeClass = 'bg-emerald-100 text-emerald-800';
                  statusLabel = 'Payée My Nita';
                } else if (order.orderStatus === 'en_preparation') {
                  badgeClass = 'bg-blue-100 text-blue-800';
                  statusLabel = 'En préparation';
                } else if (order.orderStatus === 'en_livraison') {
                  badgeClass = 'bg-amber-100 text-amber-800';
                  statusLabel = 'En livraison';
                } else if (order.orderStatus === 'livree') {
                  badgeClass = 'bg-purple-100 text-purple-800';
                  statusLabel = 'Livrée';
                }

                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{order.customer.fullName}</div>
                      <div className="text-slate-400 text-[11px]">{order.customer.phone}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {order.customer.city}
                      {order.customer.neighborhood ? `, ${order.customer.neighborhood}` : ''}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {order.total.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="p-3 font-mono text-slate-500">{order.paymentReference}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
