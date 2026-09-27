import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { compressImageFile, formatBytes } from '../../utils/imageCompressor';
import { CATEGORIES } from '../../data/initialProducts';
import { X, Plus, Trash2, Image, Sparkles, Store, Upload } from 'lucide-react';

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_IMAGE_PRESETS = [
  {
    name: 'Smartphone / Tablette',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Casque Audio / High-Tech',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mode / Vêtement Homme',
    url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Robe / Mode Femme',
    url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Parfum / Beauté',
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chaussures / Sneakers',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Électroménager / Cuisine',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  },
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addProduct, updateProduct, currentVendorShop, shops, showToast } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[1] || 'Téléphones & Tablettes',
    price: 50000,
    originalPrice: 0,
    stock: 10,
    lowStockThreshold: 3,
    description: '',
    image: SAMPLE_IMAGE_PRESETS[0].url,
    badge: '' as '' | 'Nouveau' | 'Promo' | 'Top Vente' | 'Coup de Cœur',
    rating: 4.8,
    reviewsCount: 12,
    features: ['Garantie 12 mois', 'Authenticité garantie'],
    shopId: '',
    shopName: '',
  });

  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold || 3,
        description: product.description,
        image: product.image,
        badge: (product.badge as any) || '',
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        features: product.features || [],
        shopId: product.shopId || '',
        shopName: product.shopName || '',
      });
    } else {
      setFormData({
        name: '',
        category: CATEGORIES[1] || 'Téléphones & Tablettes',
        price: 35000,
        originalPrice: 45000,
        stock: 15,
        lowStockThreshold: 4,
        description: '',
        image: SAMPLE_IMAGE_PRESETS[0].url,
        badge: 'Nouveau',
        rating: 5.0,
        reviewsCount: 1,
        features: ['Livraison rapide Bee Store', 'Produit 100% Conforme'],
        shopId: currentVendorShop?.id || '',
        shopName: currentVendorShop?.name || 'Bee Store Officielle',
      });
    }
  }, [product, isOpen, currentVendorShop]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeatureText.trim()],
      });
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Fichier trop lourd', 'error', 'Image maximum 15 Mo.');
        return;
      }
      try {
        const compressed = await compressImageFile(file, { maxWidth: 800, quality: 0.75 });
        setFormData({ ...formData, image: compressed.dataUrl });
        showToast(
          'Photo optimisée !',
          'success',
          `Compressée à ${formatBytes(compressed.compressedSize)} (-${compressed.ratio}%)`
        );
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, image: reader.result as string });
          showToast('Photo chargée !', 'success');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const assignedShopName =
      formData.shopName || currentVendorShop?.name || 'Bee Store Officielle';
    const assignedShopId =
      formData.shopId || currentVendorShop?.id || 'shop-bee-officielle';

    if (product) {
      updateProduct(product.id, {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        description: formData.description,
        image: formData.image,
        badge: formData.badge || undefined,
        features: formData.features,
        shopId: assignedShopId,
        shopName: assignedShopName,
      });
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        description: formData.description,
        image: formData.image,
        badge: formData.badge || undefined,
        rating: 4.9,
        reviewsCount: 1,
        features: formData.features,
        shopId: assignedShopId,
        shopName: assignedShopName,
        isVerifiedShop: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0b1329] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{product ? 'Modifier le Produit' : 'Publier un Nouveau Produit'}</span>
            </h3>
            <p className="text-xs text-amber-300 font-bold mt-0.5">
              {currentVendorShop
                ? `Boutique : ${currentVendorShop.name}`
                : 'Publication sur le catalogue public Bee Store'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 scrollbar-none">
          {/* Shop Tag Notice / Selection */}
          {currentVendorShop ? (
            <div className="flex items-center gap-2 p-3 bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl text-xs font-bold text-amber-950 dark:text-amber-200">
              <Store className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Cet article sera publié sous votre boutique : <strong className="underline decoration-amber-500">{currentVendorShop.name}</strong>
              </span>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                Boutique vendeuse associée :
              </label>
              <select
                value={formData.shopId || 'shop-bee-officielle'}
                onChange={(e) => {
                  const sId = e.target.value;
                  const found = shops.find((s) => s.id === sId);
                  setFormData({
                    ...formData,
                    shopId: sId,
                    shopName: found?.name || 'Golden Bee Officielle',
                  });
                }}
                className="w-full p-2.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="shop-bee-officielle">Golden Bee Officielle (Plateforme)</option>
                {shops
                  .filter((s) => s.status === 'approuvee' && s.id !== 'shop-bee-officielle')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.ownerName} - {s.phone})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Nom du produit *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Robe Bazin Brodé / iPhone 15 Pro / Compte Free Fire VIP"
                className="w-full p-3 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              >
                {CATEGORIES.filter(
                  (c) => c !== 'Tous' && c !== 'Tous les produits' && c !== 'Tendances'
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Badge promotionnel (optionnel)
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value as any })}
                className="w-full p-3 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              >
                <option value="">Aucun badge</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Promo">Promo</option>
                <option value="Top Vente">Top Vente</option>
                <option value="Coup de Cœur">Coup de Cœur</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Prix de vente (FCFA) *
              </label>
              <input
                type="number"
                min="100"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-full p-3 text-sm font-mono font-black bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Ancien prix barré (FCFA)
              </label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                placeholder="Facultatif (ex: 45000)"
                className="w-full p-3 text-sm font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Quantité en stock disponible *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-full p-3 text-sm font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Seuil d'alerte stock bas
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: Math.max(1, parseInt(e.target.value) || 3),
                  })
                }
                className="w-full p-3 text-sm font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
                Description détaillée du produit *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez les détails, fonctionnalités, options et avantages du produit..."
                className="w-full p-3 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 resize-none transition-colors"
              />
            </div>

            {/* Image Preview & Upload */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                Photo du produit *
              </label>

              <div className="flex items-center gap-3">
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shrink-0 bg-slate-100 dark:bg-slate-800 shadow-sm"
                />

                <div className="space-y-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-sm transition-transform active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>Téléverser une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Ou choisissez une image prédéfinie :</p>
                </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className={`text-xs p-2.5 rounded-xl border-2 text-left truncate font-bold transition-all ${
                      formData.image === preset.url
                        ? 'border-amber-500 bg-amber-500/20 text-amber-900 dark:text-amber-300'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-amber-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{product ? 'Enregistrer les Modifications' : 'Publier sur Bee Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
