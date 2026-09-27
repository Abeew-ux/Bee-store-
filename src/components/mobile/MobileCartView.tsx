import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { DELIVERY_METHODS } from '../../data/initialProducts';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
  Store as StoreIcon,
  Zap,
  MessageCircle,
  Check,
  Circle,
} from 'lucide-react';

export const MobileCartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartCount,
    selectedCartItemIds,
    toggleCartItemSelection,
    startSingleItemCheckout,
    effectiveCheckoutItems,
    selectedCartSubtotal,
    promoCode,
    discountAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    selectedDeliveryMethod,
    setSelectedDeliveryMethod,
    setIsCheckoutOpen,
    setActiveTab,
    isDarkMode,
    shops,
  } = useStore();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState('');

  // The active single item being ordered
  const activeCartItem = useMemo(() => {
    if (cart.length === 0) return null;
    const match = cart.find((it) => selectedCartItemIds.includes(it.product.id));
    return match || cart[0];
  }, [cart, selectedCartItemIds]);

  const activeSubtotal = activeCartItem
    ? activeCartItem.product.price * activeCartItem.quantity
    : 0;

  const deliveryPrice =
    activeSubtotal >= 100000 && selectedDeliveryMethod.id === 'standard'
      ? 0
      : selectedDeliveryMethod.price;

  const totalAmount = Math.max(0, activeSubtotal + deliveryPrice - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!inputCode.trim()) return;

    const res = applyPromoCode(inputCode);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setInputCode('');
    }
  };

  const handleProceedCheckout = () => {
    if (!activeCartItem) return;
    startSingleItemCheckout(activeCartItem);
  };

  if (cart.length === 0) {
    return (
      <div
        className={`flex-1 h-full overflow-y-auto flex flex-col items-center justify-center p-6 text-center space-y-4 ${
          isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
            isDarkMode
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3
            className={`text-base font-extrabold ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Votre panier est vide
          </h3>
          <p className="text-xs text-slate-500 max-w-[260px]">
            Ajoutez des articles puis commandez-les directement auprès des vendeurs sur WhatsApp.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('shop')}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          Découvrir les boutiques
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 h-full overflow-y-auto overscroll-contain p-3.5 space-y-3.5 pb-32 transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            className={`text-sm font-black uppercase tracking-wider ${
              isDarkMode ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            Mon Panier
          </h3>
          <span className="text-[10px] font-black px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded-full border border-amber-500/30 font-mono">
            {cartCount} article{cartCount > 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-500 font-bold hover:underline"
        >
          Tout vider
        </button>
      </div>

      {/* Simplified Helper Banner */}
      <div
        className={`p-3 rounded-2xl border flex items-start gap-2.5 shadow-2xs ${
          isDarkMode
            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5 text-xs">
          <h4 className="font-extrabold text-emerald-600 dark:text-emerald-400">
            Achat direct 1 par 1 sur WhatsApp
          </h4>
          <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Choisissez ci-dessous l'article que vous souhaitez commander. Le vendeur recevra la commande complète avec le lien direct du produit.
          </p>
        </div>
      </div>

      {/* Cart Items List (Single selection mode) */}
      <div className="space-y-2.5">
        {cart.map((cartItem) => {
          const { product, quantity, selectedSize, selectedColor } = cartItem;
          const isSelected = activeCartItem?.product.id === product.id;
          const sShop = shops.find((s) => s.id === product.shopId);
          const shopName = sShop?.name || product.shopName || 'Boutique Bee_store';

          return (
            <div
              key={product.id}
              onClick={() => toggleCartItemSelection(product.id)}
              className={`rounded-2xl border p-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? isDarkMode
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                    : 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-80'
                  : 'bg-white border-slate-200 hover:border-slate-300 opacity-80'
              }`}
            >
              {/* Boutique tag & Radio Indicator */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : isDarkMode
                        ? 'border border-slate-700 bg-slate-800'
                        : 'border border-slate-300 bg-slate-100'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Circle className="w-2.5 h-2.5 text-slate-400" />}
                  </div>

                  <span
                    className={`text-[11px] font-bold ${
                      isSelected
                        ? isDarkMode
                          ? 'text-amber-400'
                          : 'text-amber-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {isSelected ? 'Article sélectionné pour achat' : 'Cliquer pour sélectionner'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <StoreIcon className="w-3 h-3" />
                  <span className="font-semibold truncate max-w-[120px]">{shopName}</span>
                </div>
              </div>

              {/* Product Info Row */}
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-200/50 dark:border-slate-700"
                />

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-xs font-black truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {product.name}
                  </h4>

                  {(selectedSize || selectedColor) && (
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {[selectedSize ? `Taille: ${selectedSize}` : '', selectedColor ? `Couleur: ${selectedColor}` : ''].filter(Boolean).join(' • ')}
                    </span>
                  )}

                  <div className="text-xs font-black text-amber-500 font-mono mt-1">
                    {(product.price * quantity).toLocaleString('fr-FR')} FCFA
                    {quantity > 1 && (
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({product.price.toLocaleString('fr-FR')} F / u)
                      </span>
                    )}
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div
                    className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className={`flex items-center gap-1 rounded-lg p-0.5 border ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className={`p-1 rounded-md ${
                          isDarkMode
                            ? 'hover:bg-slate-800 text-slate-300'
                            : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className={`p-1 rounded-md disabled:opacity-30 ${
                          isDarkMode
                            ? 'hover:bg-slate-800 text-slate-300'
                            : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startSingleItemCheckout(cartItem)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-[11px] rounded-lg flex items-center gap-1 shadow-xs transition-all"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Commander</span>
                      </button>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Selector */}
      <div
        className={`rounded-2xl border p-3 space-y-2 shadow-2xs transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <span
          className={`text-[11px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-300' : 'text-slate-800'
          }`}
        >
          Mode de réception
        </span>
        <div className="space-y-1.5">
          {DELIVERY_METHODS.map((method) => {
            const isSelected = selectedDeliveryMethod.id === method.id;
            const isFree = method.id === 'standard' && activeSubtotal >= 100000;

            return (
              <div
                key={method.id}
                onClick={() => setSelectedDeliveryMethod(method)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? isDarkMode
                      ? 'border-amber-500 bg-amber-500/10 text-slate-100'
                      : 'border-amber-500 bg-amber-50/60 text-slate-900'
                    : isDarkMode
                    ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800/60'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <div>
                  <div
                    className={`font-bold flex items-center gap-1.5 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <span>{method.name}</span>
                    {isFree && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                        Offert
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {method.delay}
                  </div>
                </div>

                <span
                  className={`font-bold font-mono text-xs ${
                    isDarkMode ? 'text-amber-400' : 'text-slate-900'
                  }`}
                >
                  {isFree ? '0 FCFA' : `${method.price.toLocaleString('fr-FR')} FCFA`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Code */}
      <div
        className={`rounded-2xl border p-3 space-y-2 shadow-2xs transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <span
          className={`text-[11px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-300' : 'text-slate-800'
          }`}
        >
          Code promo
        </span>
        {appliedPromo ? (
          <div
            className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
              isDarkMode
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>{appliedPromo} (-{discountAmount.toLocaleString('fr-FR')} FCFA)</span>
            </div>
            <button
              onClick={removePromoCode}
              className="text-emerald-500 hover:text-rose-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex gap-1.5">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Ex: BEE10"
              className={`flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono font-bold outline-none uppercase transition-colors ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-amber-500'
              }`}
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
            >
              Appliquer
            </button>
          </form>
        )}
        {promoError && <p className="text-[10px] text-rose-500 font-bold">{promoError}</p>}
      </div>

      {/* Order Summary & Primary WhatsApp Order Button */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 shadow-xl border border-slate-800">
        {activeCartItem && (
          <div className="pb-2 border-b border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 block">Article en cours :</span>
            <div className="font-bold text-white flex items-center justify-between mt-0.5">
              <span className="truncate max-w-[200px]">{activeCartItem.product.name} (x{activeCartItem.quantity})</span>
              <span className="text-amber-400 font-mono">{activeSubtotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        )}

        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex justify-between">
            <span>Frais de réception :</span>
            <span className="font-mono">{deliveryPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-amber-400 font-bold">
              <span>Remise promo :</span>
              <span className="font-mono">-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
          <div className="h-px bg-slate-800 my-1" />
          <div className="flex justify-between text-sm font-black text-white">
            <span>Total à régler :</span>
            <span className="text-amber-400 font-mono text-base">
              {totalAmount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* Big Checkout Button */}
        <button
          onClick={handleProceedCheckout}
          disabled={!activeCartItem}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all mt-2"
        >
          <MessageCircle className="w-4 h-4 text-slate-950" />
          <span>Commander cet article ({totalAmount.toLocaleString('fr-FR')} FCFA)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Transmission sécurisée avec lien direct de l'article sur WhatsApp</span>
        </div>
      </div>
    </div>
  );
};
