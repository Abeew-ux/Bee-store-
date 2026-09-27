import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getVendorWhatsAppUrl, getProductShareUrl, copyToClipboard } from '../utils/shareUtils';
import { getCategoryQuestions } from '../utils/categoryQuestions';
import { motion } from 'motion/react';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Minus,
  Plus,
  Store,
  Phone,
  MessageCircle,
  MessageSquare,
  MessageSquarePlus,
  Send,
  UserCheck,
  Share2,
  Check,
  Award,
  Clock,
  Truck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const {
    addToCart,
    isDarkMode,
    reviews,
    addReview,
    showToast,
    shops,
    startSingleItemCheckout,
    startOrOpenConversation,
  } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCity, setReviewerCity] = useState('Niamey');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isJustAdded, setIsJustAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const categoryQuestions = getCategoryQuestions(product.category);

  // Find the vendor shop
  const vendorShop = shops.find((s) => s.id === product.shopId);
  const vendorPhone = vendorShop?.phone || '97470831';
  const vendorCountryCode = vendorShop?.countryCode || '+227';
  const vendorShopName = vendorShop?.name || product.shopName || 'Boutique Certifiée Bee Store';
  const vendorCity = vendorShop?.city || 'Niamey';

  // Share URL for this specific product
  const productShareUrl = getProductShareUrl(product.id);

  const handleShareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Bee Store`,
          text: `Découvrez "${product.name}" à ${product.price.toLocaleString('fr-FR')} FCFA sur Bee Store !`,
          url: productShareUrl,
        });
        showToast('Produit partagé !', 'success');
        return;
      } catch {
        // user cancelled or share failed
      }
    }

    const copied = await copyToClipboard(productShareUrl);
    if (copied) {
      setCopiedLink(true);
      showToast('Lien du produit copié !', 'success', 'Vous pouvez le partager sur WhatsApp.');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor, customAnswers);
    setIsJustAdded(true);
    setTimeout(() => {
      setIsJustAdded(false);
      onClose();
    }, 450);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Formulaire incomplet', 'error', 'Veuillez renseigner votre nom et votre avis.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview({
        productId: product.id,
        authorName: reviewerName.trim(),
        city: reviewerCity.trim() || 'Agadez',
        rating: reviewRating,
        comment: reviewComment.trim(),
        verifiedBuyer: true,
      });

      setReviewComment('');
      setReviewerName('');
      setShowReviewForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const vendorWhatsAppUrl = getVendorWhatsAppUrl({
    phone: vendorPhone,
    countryCode: vendorCountryCode,
    product,
    shopName: vendorShopName,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-xl rounded-t-[28px] sm:rounded-[28px] border overflow-hidden z-10 max-h-[92dvh] flex flex-col transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#0B1528] border-[#1E335C] text-white shadow-2xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Mobile drag handle */}
        <div
          className={`w-12 h-1.5 rounded-full mx-auto mt-2.5 sm:hidden ${
            isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
          }`}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3.5 right-3.5 z-20 p-2 rounded-full shadow-xs backdrop-blur-md transition-colors ${
            isDarkMode
              ? 'bg-[#152542]/90 hover:bg-[#1E335C] text-white border border-[#223963]'
              : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 scrollbar-none flex-1">
          {/* Product Image with Bee Verified Badge */}
          <div
            className={`relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center border ${
              isDarkMode ? 'bg-[#070D1E] border-[#1E335C]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover ${
                isOutOfStock ? 'grayscale opacity-75' : ''
              }`}
            />
            {product.badge && (
              <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 uppercase tracking-wider shadow-md border border-amber-300/60">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/85 text-amber-400 text-[10.5px] font-bold flex items-center gap-1 border border-amber-500/40">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Garantie Bee Store</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {/* Category and Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-black">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-sm font-black">{product.rating}</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs font-bold">({productReviews.length || product.reviewsCount} avis)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-slate-950 dark:text-white">
              {product.name}
            </h2>

            {/* Clear Single Price Banner */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
              isDarkMode ? 'bg-[#101F3B] border-[#223963]' : 'bg-amber-500/10 border-amber-300'
            }`}>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Prix officiel :
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs sm:text-sm line-through text-slate-500 dark:text-slate-400 font-bold">
                      {product.originalPrice.toLocaleString('fr-FR')} F
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${
                  product.stock > 0
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-700 dark:text-red-300 border-2 border-red-500/40'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  {product.stock > 0 ? `En Stock (${product.stock})` : 'Rupture'}
                </span>
              </div>
            </div>

            {/* Category-Specific Form Questions */}
            {categoryQuestions.length > 0 && (
              <div className={`p-4 rounded-2xl border-2 space-y-3.5 ${
                isDarkMode ? 'bg-[#101F3B] border-[#223963]' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" />
                  <span>Détails & Personnalisation ({product.category})</span>
                </div>

                <div className="space-y-3">
                  {categoryQuestions.map((q) => {
                    const currentVal = customAnswers[q.label] || '';
                    return (
                      <div key={q.id} className="space-y-1">
                        <label className="text-xs font-black text-slate-900 dark:text-white block">
                          {q.label}
                        </label>
                        {q.hint && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-tight font-medium">
                            {q.hint}
                          </p>
                        )}
                        {q.type === 'select' && q.options ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {q.options.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  setCustomAnswers((prev) => ({
                                    ...prev,
                                    [q.label]: opt,
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                                  currentVal === opt
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs scale-102'
                                    : isDarkMode
                                    ? 'bg-[#0B1528] text-white border-[#1E335C] hover:border-amber-400/50'
                                    : 'bg-white text-slate-900 border-slate-300 hover:border-amber-400'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <input
                            type={q.id.includes('phone') || q.id.includes('whatsapp') ? 'tel' : 'text'}
                            value={currentVal}
                            onChange={(e) =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [q.label]: e.target.value,
                              }))
                            }
                            placeholder={q.placeholder || 'Renseignez cette information...'}
                            className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl outline-none border-2 transition-colors ${
                              isDarkMode
                                ? 'bg-[#0B1528] border-[#1E335C] text-white focus:border-amber-400 placeholder:text-slate-500'
                                : 'bg-white border-slate-300 text-slate-950 focus:border-amber-500 placeholder:text-slate-400'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verified Supplier Box */}
            <div className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
              isDarkMode ? 'bg-[#101F3B] border-[#223963]' : 'bg-slate-100 border-slate-300'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                  <Store className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black truncate text-slate-950 dark:text-white">
                      {vendorShopName}
                    </span>
                    <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shrink-0">
                      Vendeur Vérifié
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>{vendorCity}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Clock className="w-3 h-3" /> Réponse rapide
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    startOrOpenConversation(product.shopId, product);
                    onClose();
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  title="Discuter directement avec le fournisseur"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuter</span>
                </button>

                <a
                  href={vendorWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center justify-center shadow-xs"
                  title="WhatsApp direct"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                </a>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {product.description}
            </p>
          </div>

          {/* Product Variants (Sizes & Colors) */}
          {(product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0) ? (
            <div className={`p-3.5 rounded-2xl border-2 space-y-3 ${
              isDarkMode ? 'bg-[#101F3B] border-[#223963]' : 'bg-slate-100 border-slate-300'
            }`}>
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 dark:text-white">Option / Taille :</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">{selectedSize || 'Choisir'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                          selectedSize === sz
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : isDarkMode
                            ? 'bg-[#0B1528] text-white border-[#1E335C] hover:border-amber-400/50'
                            : 'bg-white text-slate-900 border-slate-300 hover:border-amber-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 dark:text-white">Variante / Couleur :</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">{selectedColor || 'Choisir'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                          selectedColor === col
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : isDarkMode
                            ? 'bg-[#0B1528] text-white border-[#1E335C] hover:border-amber-400/50'
                            : 'bg-white text-slate-900 border-slate-300 hover:border-amber-400'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Points forts */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                Spécifications clés
              </span>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 text-xs p-2.5 rounded-xl border-2 ${
                      isDarkMode
                        ? 'bg-[#101F3B] text-white border-[#223963]'
                        : 'bg-slate-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="truncate font-bold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade Assurance & Payment Info */}
          <div className={`p-3.5 border-2 rounded-2xl space-y-1 text-xs ${
            isDarkMode
              ? 'bg-[#101F3B] border-amber-500/40 text-slate-200'
              : 'bg-amber-500/10 border-amber-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-1.5 font-black text-amber-700 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantie Sécurité Bee Store</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              Paiement protégé via My Nita (97470831). Livraison assurée et suivi direct WhatsApp.
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-[#1E335C]">
            {/* In-App Discussion & WhatsApp Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  startOrOpenConversation(product.shopId, product);
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-98"
              >
                <MessageSquare className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Discuter avec le vendeur</span>
              </button>

              <a
                href={vendorWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>WhatsApp Direct</span>
              </a>
            </div>

            {/* Quantity Selector + Add to Cart + Single Item Checkout */}
            <div className="flex items-center gap-2 pt-1">
              <div className={`flex items-center gap-1 rounded-xl p-1 border-2 ${
                isDarkMode
                  ? 'bg-[#101F3B] border-[#223963] text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#1E335C] text-slate-900 dark:text-white font-black"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-black text-xs font-mono text-slate-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="p-1 rounded-lg disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-[#1E335C] text-slate-900 dark:text-white font-black"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                whileTap={{ scale: 0.94 }}
                className={`flex-1 py-2.5 px-3 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:bg-slate-800 disabled:text-slate-500 ${
                  isJustAdded
                    ? 'bg-emerald-500 text-white'
                    : isOutOfStock
                    ? 'bg-slate-800 text-slate-500'
                    : isDarkMode
                    ? 'bg-[#182C52] hover:bg-[#203A6D] text-white border border-[#2B4B8A]'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isJustAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Ajouté !</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Épuisé' : 'Au Panier'}</span>
                  </>
                )}
              </motion.button>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={() => {
                    startSingleItemCheckout({
                      product,
                      quantity,
                      selectedSize,
                      selectedColor,
                      customAnswers,
                    });
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950" />
                  <span>Acheter direct</span>
                </button>
              )}
            </div>

            {/* Share and Shop info */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareProduct}
                className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                  copiedLink
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                    : isDarkMode
                    ? 'bg-[#101F3B] hover:bg-[#182C52] text-slate-200 border-[#223963]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Lien Copié !</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Partager le produit</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 px-2 font-mono font-black">
                <Phone className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{vendorCountryCode} {vendorPhone}</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-[#1E335C] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  Avis Vérifiés ({productReviews.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>{showReviewForm ? 'Fermer' : 'Donner mon avis'}</span>
              </button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className={`p-3.5 rounded-2xl border-2 space-y-3 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">Note :</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setReviewRating(starVal)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starVal <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Votre Nom"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl outline-none text-slate-950 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ville (ex: Niamey, Maradi)"
                    value={reviewerCity}
                    onChange={(e) => setReviewerCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl outline-none text-slate-950 dark:text-white"
                  />
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Votre avis sur la qualité, la conformité et le service..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl outline-none resize-none text-slate-950 dark:text-white"
                />

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publier l'avis vérifié</span>
                </button>
              </form>
            )}

            {/* List of product reviews */}
            <div className="space-y-2 max-h-44 overflow-y-auto scrollbar-none">
              {productReviews.length === 0 ? (
                <div className="text-center py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Aucun avis pour l'instant. Soyez le premier acheteur à donner votre avis !
                </div>
              ) : (
                productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-3 rounded-xl border-2 text-xs space-y-1 ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-950 dark:text-white">
                          {rev.authorName} {rev.city ? `(${rev.city})` : ''}
                        </span>
                        {rev.verifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                            <UserCheck className="w-2.5 h-2.5" /> Achat vérifié
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
