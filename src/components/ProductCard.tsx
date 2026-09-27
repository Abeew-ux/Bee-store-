import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getProductShareUrl, getVendorWhatsAppUrl, copyToClipboard } from '../utils/shareUtils';
import {
  ShoppingBag,
  Star,
  Eye,
  AlertCircle,
  Store,
  Share2,
  MessageCircle,
  MessageSquare,
  Check,
  ShieldCheck,
  Zap,
  Award,
  Heart,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const {
    addToCart,
    cart,
    isDarkMode,
    shops,
    showToast,
    startOrOpenConversation,
    toggleFavorite,
    isFavorite,
  } = useStore();
  const [copied, setCopied] = useState(false);
  const isFav = isFavorite(product.id);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  // Find vendor details
  const vendorShop = shops.find((s) => s.id === product.shopId);
  const vendorPhone = vendorShop?.phone || '97470831';
  const vendorCountryCode = vendorShop?.countryCode || '+227';
  const vendorShopName = vendorShop?.name || product.shopName || 'Boutique Partenaire';
  const vendorCity = vendorShop?.city || 'Niamey';

  const vendorWhatsAppUrl = getVendorWhatsAppUrl({
    phone: vendorPhone,
    countryCode: vendorCountryCode,
    product,
    shopName: vendorShopName,
  });

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getProductShareUrl(product.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Golden Bee Store`,
          text: `Découvrez "${product.name}" sur ${vendorShopName} (${product.price.toLocaleString('fr-FR')} FCFA) !`,
          url,
        });
        showToast('Lien partagé !', 'success');
        return;
      } catch {
        // fallback
      }
    }
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      showToast('Lien du produit copié !', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Check how many already in cart
  const inCart = cart.find((item) => item.product.id === product.id)?.quantity || 0;
  const canAddMore = inCart < product.stock;

  return (
    <div
      className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-orange-500/60 hover:shadow-[0_12px_32px_rgba(249,115,22,0.15)] hover:-translate-y-1'
          : 'bg-white border-slate-200/90 shadow-sm hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1'
      }`}
    >
      {/* Image Container with Golden Bee Style Badges */}
      <div
        className={`relative aspect-[4/3.8] m-2 rounded-xl overflow-hidden cursor-pointer ${
          isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
        }`}
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />

        {/* Top Badges (Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span
              className={`text-[9.5px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1 border ${
                product.badge === 'Promo'
                  ? 'bg-red-600 text-white border-red-400/40'
                  : product.badge === 'Top Vente'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border-orange-300/40 font-black'
                  : product.badge === 'Coup de Cœur'
                  ? 'bg-purple-600 text-white border-purple-400/40'
                  : 'bg-emerald-600 text-white border-emerald-400/40'
              }`}
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              {product.badge}
            </span>
          )}

          {isOutOfStock && (
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-950/90 text-rose-300 uppercase tracking-wider shadow-sm flex items-center gap-1 border border-rose-500/30 backdrop-blur-xs">
              <AlertCircle className="w-2.5 h-2.5" /> Épuisé
            </span>
          )}
        </div>

        {/* Top-Right Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full shadow-sm flex items-center justify-center transition-all z-10 active:scale-90 ${
            isFav
              ? 'bg-white text-rose-500'
              : 'bg-black/40 hover:bg-black/60 text-white'
          }`}
          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
        </button>

        {/* Quick Floating Actions */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleShare}
            className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg shadow-md backdrop-blur-xs transition-all border border-white/10 hover:scale-105"
            title="Partager le produit"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-orange-400" />}
          </button>

          <a
            href={vendorWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md backdrop-blur-xs transition-all border border-white/10 hover:scale-105"
            title={`Discuter avec le fournisseur (${vendorShopName})`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
          </a>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg shadow-md backdrop-blur-xs transition-all border border-white/10 hover:scale-105"
            title="Aperçu rapide"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Price formatted in signature Golden Bee Style */}
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-base sm:text-lg font-black tracking-tight font-sans ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}
              >
                {product.price.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-[10px] font-bold text-slate-400">/ pièce</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through">
                {product.originalPrice.toLocaleString('fr-FR')} F
              </span>
            )}
          </div>

          {/* MOQ / Min Order */}
          <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
            <span>1 pièce (Min. Commande)</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[9.5px] text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className={`font-medium text-xs sm:text-sm leading-snug line-clamp-2 cursor-pointer transition-colors duration-200 ${
              isDarkMode
                ? 'text-slate-200 group-hover:text-orange-400'
                : 'text-slate-800 group-hover:text-orange-600'
            }`}
          >
            {product.name}
          </h3>

          {/* Verified Supplier / Boutique info line */}
          <div className="pt-1 flex items-center justify-between gap-1 text-[10.5px] truncate">
            <div className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 shrink-0 text-[9px]">
                <Award className="w-2.5 h-2.5 text-amber-500" />
                Vérifié
              </span>
              <span className="truncate font-medium hover:underline cursor-pointer" title={vendorShopName}>
                {vendorShopName}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 shrink-0">{vendorCity}</span>
          </div>

          {/* Trade Assurance Micro Guarantee */}
          <div className="flex items-center gap-1 text-[9.5px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">Garantie & Paiement Sécurisé</span>
          </div>
        </div>

        {/* Action Bar: Chat / WhatsApp + Fast Add */}
        <div
          className={`pt-2 border-t space-y-1.5 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startOrOpenConversation(product.shopId, product);
              }}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
              title="Discuter directement avec le fournisseur (Golden Bee Trade)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Discuter</span>
            </button>

            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock || !canAddMore}
              className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : !canAddMore
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-xs'
              }`}
              title="Ajouter au panier"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Épuisé' : inCart > 0 ? `(${inCart})` : 'Panier'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
