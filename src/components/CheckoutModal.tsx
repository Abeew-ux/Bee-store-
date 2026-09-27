import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_METHODS } from '../data/initialProducts';
import { NIGER_REGIONS } from '../data/nigerLocations';
import { getOrderWhatsAppUrl } from '../utils/shareUtils';
import {
  X,
  Truck,
  Store as StoreIcon,
  MapPin,
  Phone,
  User,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Check,
  Package,
} from 'lucide-react';
import { Order, PaymentMethod } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    effectiveCheckoutItems,
    selectedCartSubtotal,
    discountAmount,
    selectedDeliveryMethod,
    setSelectedDeliveryMethod,
    deliveryAddress,
    setDeliveryAddress,
    createOrder,
    setIsReceiptModalOpen,
    showToast,
    shops,
    currentUser,
    openAuthModal,
    lastCompletedOrders,
    setCheckoutTargetItems,
  } = useStore();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('whatsapp_direct');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedOrders, setDispatchedOrders] = useState<Order[] | null>(null);
  const [openedWhatsAppShops, setOpenedWhatsAppShops] = useState<Record<string, boolean>>({});

  // Active items being ordered in this checkout session (single item, selected items, or cart)
  const itemsInOrder = useMemo(() => {
    return effectiveCheckoutItems && effectiveCheckoutItems.length > 0
      ? effectiveCheckoutItems
      : cart;
  }, [effectiveCheckoutItems, cart]);

  // Group cart items by boutique
  const shopGroups = useMemo(() => {
    const map = new Map<
      string,
      { shopId: string; shopName: string; shopPhone: string; items: typeof itemsInOrder }
    >();
    itemsInOrder.forEach((item) => {
      const sId = item.product.shopId || 'shop-bee-agadez';
      const sShop = shops.find((s) => s.id === sId);
      const sName = sShop?.name || item.product.shopName || 'Boutique Golden Bee Store';
      const sPhone = sShop?.phone || item.product.shopPhone || '97470831';

      if (!map.has(sId)) {
        map.set(sId, { shopId: sId, shopName: sName, shopPhone: sPhone, items: [] });
      }
      map.get(sId)!.items.push(item);
    });
    return Array.from(map.values());
  }, [itemsInOrder, shops]);

  const isMultiShop = shopGroups.length > 1;

  if (!isCheckoutOpen) return null;

  const isPickup = selectedDeliveryMethod.id === 'pickup_shop';
  const deliveryPrice = selectedDeliveryMethod.price; // 1000 or 0
  const subtotalToPay = selectedCartSubtotal > 0 ? selectedCartSubtotal : itemsInOrder.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = Math.max(0, subtotalToPay + deliveryPrice - discountAmount);

  // Single shop fallback helpers
  const primaryShopId = shopGroups[0]?.shopId || 'shop-bee-agadez';
  const vendorName = shopGroups[0]?.shopName || 'Boutique Golden Bee Store';
  const vendorPhone = shopGroups[0]?.shopPhone || '97470831';

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!deliveryAddress.fullName.trim()) {
      errors.fullName = 'Le nom complet est obligatoire';
    }
    if (!deliveryAddress.phone.trim()) {
      errors.phone = 'Le numéro de téléphone (WhatsApp) est obligatoire';
    }

    if (!isPickup) {
      if (!deliveryAddress.city.trim()) {
        errors.city = 'Veuillez sélectionner une ville';
      }
      if (!deliveryAddress.neighborhood.trim()) {
        errors.neighborhood = 'Le quartier de livraison est obligatoire';
      }
      if (!deliveryAddress.addressDetails.trim()) {
        errors.addressDetails = 'Veuillez préciser la rue ou un point de repère';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteOrderWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create order(s) directly via StoreContext (handles multi-shop splitting)
      const newOrder = await createOrder({
        customer: deliveryAddress,
        deliveryMethod: selectedDeliveryMethod,
        paymentMethod: selectedPaymentMethod,
        shopId: primaryShopId,
        shopName: vendorName,
        isPickupInShop: isPickup,
      });

      if (isMultiShop && shopGroups.length > 1) {
        // Multi-shop flow: Show the multi-dispatch screen inside the modal
        const createdOrders = lastCompletedOrders && lastCompletedOrders.length > 0
          ? lastCompletedOrders
          : [newOrder];

        setDispatchedOrders(createdOrders);
        showToast(
          'Commandes préparées pour chaque boutique !',
          'success',
          'Envoyez les messages WhatsApp à chaque vendeur.'
        );
      } else {
        // Single shop flow: Open WhatsApp directly with the seller
        const waUrl = getOrderWhatsAppUrl({
          order: newOrder,
          vendorPhone,
          shopName: vendorName,
        });

        try {
          window.open(waUrl, '_blank');
        } catch (err) {
          console.warn('Could not auto-open WhatsApp link:', err);
        }

        showToast(
          'Commande transmise avec succès !',
          'success',
          `Discutez directement avec ${vendorName} sur WhatsApp.`
        );

        // Close checkout and open receipt
        setIsCheckoutOpen(false);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      console.error('Error creating direct WhatsApp order:', err);
      showToast('Erreur lors de la commande', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSingleShopWhatsApp = (order: Order) => {
    const sShop = shops.find((s) => s.id === order.shopId);
    const phone = order.shopPhone || sShop?.phone || '97470831';
    const sName = order.shopName || sShop?.name || 'Boutique';

    const waUrl = getOrderWhatsAppUrl({
      order,
      vendorPhone: phone,
      shopName: sName,
    });

    window.open(waUrl, '_blank');
    setOpenedWhatsAppShops((prev) => ({ ...prev, [order.id]: true }));
  };

  const handleFinishAndShowReceipts = () => {
    setDispatchedOrders(null);
    setIsCheckoutOpen(false);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting) {
            setDispatchedOrders(null);
            setIsCheckoutOpen(false);
          }
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92dvh] flex flex-col">
        {/* Mobile handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden z-20" />

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/30">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {dispatchedOrders ? 'Transmission des Commandes' : 'Finaliser la Commande'}
              </h2>
              <p className="text-xs text-emerald-200">
                {isMultiShop
                  ? `Commande groupée auprès de ${shopGroups.length} boutiques`
                  : 'Accord direct client-vendeur sur WhatsApp'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setDispatchedOrders(null);
              setIsCheckoutOpen(false);
            }}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: If dispatched orders are ready, show the per-boutique WhatsApp dispatch screen */}
        {dispatchedOrders ? (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 scrollbar-none">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <span className="font-extrabold text-sm block text-emerald-900">
                  🎉 Vos commandes ont été enregistrées avec succès !
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  Puisque vos articles proviennent de <strong>{dispatchedOrders.length} boutiques différentes</strong>, veuillez cliquer sur chaque bouton ci-dessous pour transmettre la liste exacte des articles au vendeur concerné sur WhatsApp :
                </p>
              </div>
            </div>

            {/* List of orders per shop */}
            <div className="space-y-3">
              {dispatchedOrders.map((ord, idx) => {
                const sShop = shops.find((s) => s.id === ord.shopId);
                const sName = ord.shopName || sShop?.name || `Boutique ${idx + 1}`;
                const sPhone = ord.shopPhone || sShop?.phone || '97470831';
                const isSent = openedWhatsAppShops[ord.id];

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border-2 border-emerald-200 bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <StoreIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{sName}</h4>
                          <span className="text-xs text-slate-500 font-mono">
                            WhatsApp : +227 {sPhone}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        {ord.total.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    {/* Mini item list */}
                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs text-slate-700">
                      {ord.items.map((it) => (
                        <div key={it.product.id} className="flex justify-between items-center">
                          <span className="truncate max-w-[200px] font-medium">
                            • {it.product.name} (x{it.quantity})
                          </span>
                          <span className="font-bold text-slate-900">
                            {(it.product.price * it.quantity).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp Action Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSingleShopWhatsApp(ord)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                        isSent
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>Message envoyé à {sName} (Ouvrir à nouveau)</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Envoyer la commande à {sName} sur WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Done & View Receipts */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishAndShowReceipts}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Voir mes reçus de commande détaillés</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ) : (
          /* Content Form */
          <form
            onSubmit={handleCompleteOrderWhatsApp}
            className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain flex-1 scrollbar-none"
          >
            {/* Vendor info / Multi-shop info banner */}
            {isMultiShop ? (
              <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                  <StoreIcon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1.5 text-xs text-amber-950 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-amber-950 block">
                      Commande multi-boutiques ({shopGroups.length} vendeurs)
                    </span>
                    <span className="bg-amber-200 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      Envoi séparé
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Votre panier contient des articles de <strong>{shopGroups.map((s) => s.shopName).join(' et ')}</strong>. Le système va générer un bon de commande distinct pour chaque boutique afin que chaque vendeur reçoive uniquement ses articles !
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1 text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 block">
                      Vendeur : {vendorName}
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      WhatsApp: +227 {vendorPhone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Votre commande sera transmise directement au WhatsApp du vendeur. Vous convenez du mode de paiement et de la livraison en direct sans intermédiaire !
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Mode de réception */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                  1
                </span>
                <span>Mode de récupération de votre colis :</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DELIVERY_METHODS.map((method) => {
                  const isSelected = selectedDeliveryMethod.id === method.id;
                  const isDelivery = method.id === 'delivery_home';

                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedDeliveryMethod(method)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isDelivery ? (
                            <Truck className="w-5 h-5" />
                          ) : (
                            <StoreIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate block">
                            {method.name}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {method.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500">
                          {method.delay}
                        </span>
                        <span
                          className={`font-black text-xs sm:text-sm ${
                            method.price === 0 ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {method.price === 0
                            ? 'GRATUIT (0 F)'
                            : `${method.price.toLocaleString('fr-FR')} FCFA`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Coordonnées du client */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Vos coordonnées {isPickup ? 'pour le retrait' : 'de livraison'} :</span>
                </label>

                {currentUser ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Connecté
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    Se Connecter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nom & Prénom *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={deliveryAddress.fullName}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, fullName: e.target.value })
                      }
                      placeholder="Ex: Ibrahim Oumarou"
                      className={`w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-emerald-500 ${
                        formErrors.fullName ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Numéro WhatsApp / Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={deliveryAddress.phone}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })
                      }
                      placeholder="Ex: 90 12 34 56"
                      className={`w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-emerald-500 ${
                        formErrors.phone ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Address fields if delivery at home */}
              {!isPickup ? (
                <div className="space-y-3.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Région du Niger *
                      </label>
                      <select
                        value={deliveryAddress.region || 'Agadez'}
                        onChange={(e) => {
                          const newReg = e.target.value;
                          const regObj = NIGER_REGIONS.find((r) => r.name === newReg);
                          setDeliveryAddress({
                            ...deliveryAddress,
                            region: newReg,
                            city: regObj?.cities[0] || newReg,
                            neighborhood: regObj?.mainQuarters[0] || deliveryAddress.neighborhood,
                          });
                        }}
                        className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-900"
                      >
                        {NIGER_REGIONS.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name} {r.isUserHome ? '📍' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ville / Localité *
                      </label>
                      {(() => {
                        const activeReg =
                          NIGER_REGIONS.find((r) => r.name === (deliveryAddress.region || 'Agadez')) ||
                          NIGER_REGIONS[0];
                        return (
                          <select
                            value={deliveryAddress.city}
                            onChange={(e) =>
                              setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                            }
                            className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                          >
                            {activeReg.cities.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="Autre localité">Autre localité...</option>
                          </select>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Quartier de livraison *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.neighborhood}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            neighborhood: e.target.value,
                          })
                        }
                        placeholder="Ex: Sabon Gari, Paysannat..."
                        className={`w-full p-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-emerald-500 ${
                          formErrors.neighborhood ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.neighborhood && (
                        <p className="text-xs text-rose-600 mt-1">
                          {formErrors.neighborhood}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Adresse ou Point de repère *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={deliveryAddress.addressDetails}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              addressDetails: e.target.value,
                            })
                          }
                          placeholder="Ex: Près de la grande mosquée..."
                          className={`w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-emerald-500 ${
                            formErrors.addressDetails ? 'border-rose-400' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {formErrors.addressDetails && (
                        <p className="text-xs text-rose-600 mt-1">
                          {formErrors.addressDetails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center gap-3">
                  <StoreIcon className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Retrait gratuit en boutique :</strong> Vous pourrez récupérer votre colis dès confirmation sur WhatsApp par le(s) vendeur(s).
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Moyen de règlement préféré */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                  3
                </span>
                <span>Mode de règlement proposé aux vendeurs :</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'my_nita_direct', label: 'My Nita', desc: 'Transfert Nita officiel', icon: '📲', badge: 'Recommandé' },
                  { id: 'amana_ta', label: 'Amana Ta', desc: 'Paiement express Amana', icon: '💳', badge: 'Populaire' },
                  { id: 'airtel_money_direct', label: 'Airtel Money', desc: 'Paiement mobile', icon: '📱' },
                  { id: 'al_izza_direct', label: 'Al Izza', desc: 'Transfert d’argent', icon: '🏛️' },
                  { id: 'cash_at_delivery', label: 'Espèces', desc: 'Au retrait / livraison', icon: '💵' },
                  { id: 'whatsapp_direct', label: 'Sur WhatsApp', desc: 'À convenir avec le vendeur', icon: '💬' },
                ].map((pm) => {
                  const isSelected = selectedPaymentMethod === pm.id;
                  return (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setSelectedPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pm.badge && (
                        <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                          {pm.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-base">{pm.icon}</span>
                        <span className="font-black text-xs text-slate-900">{pm.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{pm.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Récapitulatif des articles et informations spécifiques */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                    4
                  </span>
                  <span>Détails des articles commandés :</span>
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {itemsInOrder.length} article(s)
                </span>
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {itemsInOrder.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate block">
                            {item.product.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Quantité : <strong>x{item.quantity}</strong> • {item.product.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-xs text-emerald-700 whitespace-nowrap">
                        {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    {/* Custom Category Answers */}
                    {item.customAnswers && Object.keys(item.customAnswers).length > 0 && (
                      <div className="mt-1 pt-1.5 border-t border-slate-200/80 grid grid-cols-1 gap-1 text-[11px]">
                        {Object.entries(item.customAnswers).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200/60">
                            <span className="font-semibold text-slate-600">📝 {k} :</span>
                            <span className="font-mono font-bold text-amber-700">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recap */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                <span>Articles à régler ({itemsInOrder.length}) :</span>
                <span className="font-bold text-slate-900">
                  {subtotalToPay.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                <span>Frais de livraison :</span>
                <span className="font-bold text-slate-900">
                  {deliveryPrice === 0 ? '0 FCFA (Gratuit)' : `${deliveryPrice.toLocaleString('fr-FR')} FCFA`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-emerald-700 font-bold">
                  <span>Remise appliquée :</span>
                  <span>-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
                <span className="text-sm font-black text-slate-900">Total global :</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Génération des commandes...'
                  : isMultiShop
                  ? `Transmettre aux ${shopGroups.length} boutiques sur WhatsApp`
                  : 'Envoyer ma Commande sur WhatsApp'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
