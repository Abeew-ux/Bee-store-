import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  AlertTriangle,
  Package,
  Plus,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { products, updateStock, showToast } = useStore();

  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const healthyStock = products.filter((p) => p.stock > p.lowStockThreshold);

  const handleBatchRestock = (amount: number) => {
    // Restock all products currently low or out of stock
    const needed = [...outOfStock, ...lowStock];
    needed.forEach((p) => {
      updateStock(p.id, p.stock + amount);
    });
    showToast(
      'Réapprovisionnement par lot effectué',
      'success',
      `+${amount} unités ajoutées à tous les articles en alerte.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Gestionnaire des Stocks & Réapprovisionnement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surveillez le niveau de vos réserves et effectuez des réassorts en un clic.
          </p>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Réassort rapide :
          </span>
          <button
            onClick={() => handleBatchRestock(5)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 transition-colors"
          >
            +5 aux alertes
          </button>
          <button
            onClick={() => handleBatchRestock(15)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            +15 aux alertes
          </button>
        </div>
      </div>

      {/* Stock Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            Rupture de Stock
          </span>
          <div className="text-2xl font-black text-rose-950">{outOfStock.length} articles</div>
          <p className="text-[11px] text-rose-700">Ces produits sont indisponibles à la vente.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Stock Faible (&le; seuil)
          </span>
          <div className="text-2xl font-black text-amber-950">{lowStock.length} articles</div>
          <p className="text-[11px] text-amber-700">Réapprovisionnement conseillé prochainement.</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            Stock Optimal
          </span>
          <div className="text-2xl font-black text-emerald-950">
            {healthyStock.length} articles
          </div>
          <p className="text-[11px] text-emerald-700">Quantités suffisantes pour les ventes.</p>
        </div>
      </div>

      {/* Detailed Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <h3 className="text-base font-bold text-slate-900">
          État détaillé de tous les articles
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">Produit</th>
                <th className="p-3.5 font-semibold">Catégorie</th>
                <th className="p-3.5 font-semibold text-center">Seuil d'alerte</th>
                <th className="p-3.5 font-semibold text-center">Stock actuel</th>
                <th className="p-3.5 font-semibold">Statut</th>
                <th className="p-3.5 font-semibold text-right">Réapprovisionnement rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isOut = product.stock === 0;
                const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;

                return (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <span className="font-bold text-slate-900">{product.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">{product.category}</td>

                    <td className="p-3.5 text-center font-mono text-slate-500">
                      {product.lowStockThreshold} unités
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`font-black font-mono text-sm ${
                          isOut
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Rupture
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Stock Faible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          En Stock
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateStock(product.id, product.stock + 5)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateStock(product.id, product.stock + 10)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => updateStock(product.id, product.stock + 25)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                        >
                          +25
                        </button>
                      </div>
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
