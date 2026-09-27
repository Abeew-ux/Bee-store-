import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, MessageSquare, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { BeePushingCart } from '../BeePushingCart';

export const MobileFavoritesView: React.FC = () => {
  const {
    favorites,
    products,
    toggleFavorite,
    addToCart,
    startOrOpenConversation,
    setSelectedProduct,
    setActiveTab,
    isDarkMode,
  } = useStore();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div
      id="mobile-favorites-view"
      className={`h-full flex flex-col overflow-y-auto pb-24 select-none ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Banner Header */}
      <div
        className={`px-4 pt-4 pb-3 border-b flex items-center justify-between sticky top-0 z-20 backdrop-blur-md ${
          isDarkMode
            ? 'bg-slate-950/90 border-slate-800'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight">Mes Favoris</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {favoriteProducts.length} article{favoriteProducts.length > 1 ? 's' : ''} sauvegardé{favoriteProducts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('shop')}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
        >
          <span>Boutique</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <BeePushingCart className="w-12 h-12" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Aucun coup de cœur pour l'instant
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5">
            Appuyez sur l'icône cœur des articles du catalogue pour les retrouver facilement ici.
          </p>
          <button
            onClick={() => setActiveTab('shop')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-transform flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Découvrir le catalogue</span>
          </button>
        </div>
      ) : (
        <div className="p-3 grid grid-cols-2 gap-3">
          {favoriteProducts.map((prod) => (
            <div
              key={prod.id}
              className={`rounded-2xl border overflow-hidden flex flex-col transition-all shadow-sm relative group ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              {/* Image & Favorite Toggle */}
              <div
                className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                onClick={() => setSelectedProduct(prod)}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(prod.id);
                  }}
                  title="Retirer des favoris"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-sm flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    {prod.badge}
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setSelectedProduct(prod)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 cursor-pointer hover:text-amber-600 leading-snug mb-1"
                  >
                    {prod.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {prod.price.toLocaleString('fr-FR')} FCFA
                    </span>
                    {prod.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {prod.originalPrice.toLocaleString('fr-FR')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Min. 1 pièce
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => startOrOpenConversation(prod.shopId || 'shop-bee-agadez', prod)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Discuter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(prod, 1)}
                    className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                    title="Ajouter au panier"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
