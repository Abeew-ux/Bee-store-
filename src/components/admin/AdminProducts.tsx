import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/initialProducts';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Eye,
  Minus,
} from 'lucide-react';

interface AdminProductsProps {
  onAddNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onAddNewProduct,
  onEditProduct,
}) => {
  const { products, deleteProduct, updateStock, setSelectedProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous les produits');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === 'Tous les produits' || product.category === selectedCategory;

    let matchStock = true;
    if (stockFilter === 'out') {
      matchStock = product.stock === 0;
    } else if (stockFilter === 'low') {
      matchStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
    } else if (stockFilter === 'in_stock') {
      matchStock = product.stock > product.lowStockThreshold;
    }

    return matchSearch && matchCategory && matchStock;
  });

  const handleDeleteConfirm = (id: string) => {
    deleteProduct(id);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Gestion des Produits & Stocks en Temps Réel
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ajoutez, modifiez, ajustez les prix et le niveau de stock en direct.
          </p>
        </div>

        <button
          onClick={onAddNewProduct}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Produit
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou catégorie..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        {/* Category Select */}
        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter Pills */}
        <div className="sm:col-span-3">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-medium text-slate-700"
          >
            <option value="all">Tous les stocks ({products.length})</option>
            <option value="in_stock">En stock suffisant</option>
            <option value="low">Stock faible (alerte)</option>
            <option value="out">Ruptures (0 unité)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">Produit</th>
                <th className="p-3.5 font-semibold">Catégorie</th>
                <th className="p-3.5 font-semibold">Prix de vente</th>
                <th className="p-3.5 font-semibold">Stock en Direct</th>
                <th className="p-3.5 font-semibold">État</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Aucun produit ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock =
                    product.stock > 0 && product.stock <= product.lowStockThreshold;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      {/* Product details */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate max-w-[200px]">
                              {product.name}
                            </h4>
                            {product.badge && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-slate-600 font-medium">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="p-3.5">
                        <div className="font-black text-slate-900">
                          {product.price.toLocaleString('fr-FR')} FCFA
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {product.originalPrice.toLocaleString('fr-FR')} FCFA
                          </div>
                        )}
                      </td>

                      {/* Real-time stock direct inline adjustment */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateStock(product.id, product.stock - 1)}
                            disabled={product.stock <= 0}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
                            title="Diminuer stock"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) =>
                              updateStock(product.id, parseInt(e.target.value) || 0)
                            }
                            className="w-14 text-center py-1 px-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white focus:border-emerald-600 outline-none"
                          />

                          <button
                            onClick={() => updateStock(product.id, product.stock + 1)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Augmenter stock"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* State badge */}
                      <td className="p-3.5">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Rupture (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Faible ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Bon ({product.stock})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Voir la fiche client"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-2 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setProductToDelete(product.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Confirmer la suppression ?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir retirer cet article de votre boutique ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteConfirm(productToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
