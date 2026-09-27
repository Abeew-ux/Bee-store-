import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  Sparkles,
  Store as StoreIcon,
  Zap,
  MessageCircle,
  Check,
  Circle,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartCount,
    selectedCartItemIds,
    toggleCartItemSelection,
    startSingleItemCheckout,
    appliedPromo,
    discountAmount,
    applyPromoCode,
    removePromoCode,
    clearCart,
    shops,
  } = useStore();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const activeCartItem = useMemo(() => {
    if (cart.length === 0) return null;
    const match = cart.find((it) => selectedCartItemIds.includes(it.product.id));
    return match || cart[0];
  }, [cart, selectedCartItemIds]);

  if (!isCartOpen) return null;

  const activeSubtotal = activeCartItem
    ? activeCartItem.product.price * activeCartItem.quantity
    : 0;

  const finalTotal = Math.max(0, activeSubtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!inputCode.trim()) return;

    const result = applyPromoCode(inputCode);
    if (!result.success) {
      setPromoError(result.message);
    } else {
      setInputCode('');
    }
  };

  const handleProceedToCheckout = () => {
    if (!activeCartItem) return;
    setIsCartOpen(false);
    startSingleItemCheckout(activeCartItem);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Mon Panier</h2>
                <p className="text-xs text-slate-500 font-mono">
                  {cartCount} article{cartCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 font-bold hover:underline px-2 py-1"
              >
                Vider
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Helper banner */}
          {cart.length > 0 && (
            <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 text-xs flex items-center gap-2 text-amber-950">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] leading-tight">
                <strong>Achat 1 par 1 :</strong> Sélectionnez un article pour commander directement auprès de sa boutique sur WhatsApp avec le lien du produit.
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Votre panier est vide</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Explorez le catalogue et réglez vos achats un par un sur WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Commencer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((cartItem) => {
                  const { product, quantity, selectedSize, selectedColor } = cartItem;
                  const isSelected = activeCartItem?.product.id === product.id;
                  const sShop = shops.find((s) => s.id === product.shopId);
                  const shopName = sShop?.name || product.shopName || 'Boutique Bee_store';

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleCartItemSelection(product.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                          : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Selection header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'border border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-[11px] font-bold ${
                              isSelected ? 'text-amber-800' : 'text-slate-500'
                            }`}
                          >
                            {isSelected ? 'Article actif' : 'Choisir cet article'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <StoreIcon className="w-3 h-3" />
                          <span className="font-semibold">{shopName}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {product.name}
                          </h4>

                          {(selectedSize || selectedColor) && (
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {[selectedSize ? `Taille: ${selectedSize}` : '', selectedColor ? `Couleur: ${selectedColor}` : ''].filter(Boolean).join(' • ')}
                            </span>
                          )}

                          <p className="text-xs font-black text-amber-600 mt-1 font-mono">
                            {(product.price * quantity).toLocaleString('fr-FR')} FCFA
                          </p>

                          {/* Quantity & Actions */}
                          <div
                            className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-slate-900 font-mono">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                                disabled={quantity >= product.stock}
                                className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCartOpen(false);
                                  startSingleItemCheckout(cartItem);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1 shadow-xs"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Commander</span>
                              </button>

                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Retirer"
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
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 space-y-3">
              {/* Promo Code Form */}
              <div className="space-y-1">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-amber-100 text-amber-900 px-3 py-2 rounded-xl text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      Code: <strong>{appliedPromo}</strong>
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-amber-700 hover:text-rose-700 underline text-xs"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Code promo"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl uppercase outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Appliquer
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
                )}
              </div>

              {/* Summary Calculations */}
              <div className="space-y-1 text-xs text-slate-600">
                {activeCartItem && (
                  <div className="flex justify-between text-slate-900 font-medium">
                    <span className="truncate max-w-[200px]">{activeCartItem.product.name} (x{activeCartItem.quantity})</span>
                    <span className="font-mono font-bold">
                      {activeSubtotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Remise promo</span>
                    <span>-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}

                <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total article</span>
                  <span className="text-base text-amber-600 font-black font-mono">
                    {finalTotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={!activeCartItem}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl shadow-lg transition-all text-xs sm:text-sm active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Commander cet article ({finalTotal.toLocaleString('fr-FR')} FCFA)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Lien du produit transmis directement au vendeur
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
