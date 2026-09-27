import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getOrderWhatsAppUrl, getReferralWhatsAppUrl, getProductShareUrl } from '../utils/shareUtils';
import {
  X,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  Package,
  Calendar,
  Phone,
  MapPin,
  Share2,
  MessageCircle,
  Gift,
  Store as StoreIcon,
  ExternalLink,
} from 'lucide-react';

interface OrderReceiptModalProps {
  onOpenTracking: (orderNumber: string) => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ onOpenTracking }) => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    lastCompletedOrder,
    lastCompletedOrders,
    shops,
    showToast,
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  if (!isReceiptModalOpen) return null;

  const ordersList =
    lastCompletedOrders && lastCompletedOrders.length > 0
      ? lastCompletedOrders
      : lastCompletedOrder
      ? [lastCompletedOrder]
      : [];

  if (ordersList.length === 0) return null;

  const activeIndex = Math.min(selectedOrderIndex, ordersList.length - 1);
  const order = ordersList[activeIndex];

  const vendorShop = shops.find((s) => s.id === order.shopId);
  const vendorPhone = order.shopPhone || vendorShop?.phone || '97470831';
  const vendorName = order.shopName || vendorShop?.name || 'Boutique Bee_store';

  const handleCopyOrderNum = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    showToast('Numéro de commande copié !', 'info');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenVendorWhatsApp = (targetOrder = order) => {
    const sShop = shops.find((s) => s.id === targetOrder.shopId);
    const phone = targetOrder.shopPhone || sShop?.phone || '97470831';
    const name = targetOrder.shopName || sShop?.name || 'Boutique';

    const url = getOrderWhatsAppUrl({
      order: targetOrder,
      vendorPhone: phone,
      shopName: name,
    });
    window.open(url, '_blank');
  };

  const handleShareReferral = () => {
    const myReferralCode = vendorShop?.referralCode || 'BEE-PROMO';
    const waUrl = getReferralWhatsAppUrl({
      referralCode: myReferralCode,
      shopName: vendorName,
    });
    window.open(waUrl, '_blank');
  };

  const handleCopyReferral = () => {
    const myReferralCode = vendorShop?.referralCode || 'BEE-PROMO';
    navigator.clipboard.writeText(myReferralCode);
    setReferralCopied(true);
    showToast('Code parrainage copié ! (500 FCFA par boutique)', 'success');
    setTimeout(() => setReferralCopied(false), 3000);
  };

  const handleTrackDelivery = () => {
    setIsReceiptModalOpen(false);
    onOpenTracking(order.orderNumber);
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden print:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity print:hidden"
        onClick={() => setIsReceiptModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92dvh] flex flex-col print:shadow-none print:border-none print:rounded-none">
        {/* Top notification bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-4 sm:p-5 text-center space-y-1.5 print:bg-white print:text-black print:p-2 shrink-0">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mx-auto print:hidden">
            <CheckCircle2 className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-base sm:text-xl font-black">
            {ordersList.length > 1
              ? `${ordersList.length} Commandes Transmises avec Succès`
              : 'Commande Transmise sur WhatsApp'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 print:text-slate-600">
            {ordersList.length > 1
              ? `Vos ${ordersList.length} commandes ont été séparées pour chaque boutique respective.`
              : `Votre commande a été envoyée directement au vendeur ${vendorName}.`}
          </p>

          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Shop Tab Switcher (if > 1 order) */}
        {ordersList.length > 1 && (
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 overflow-x-auto print:hidden">
            {ordersList.map((ord, idx) => {
              const sShop = shops.find((s) => s.id === ord.shopId);
              const sName = ord.shopName || sShop?.name || `Boutique ${idx + 1}`;
              const isSelected = idx === activeIndex;

              return (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrderIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  <span>{sName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ord.total.toLocaleString('fr-FR')} F
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Receipt Body */}
        <div
          className="p-4 sm:p-6 space-y-5 text-slate-800 overflow-y-auto overscroll-contain flex-1 scrollbar-none"
          id="printable-receipt"
        >
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-lg text-slate-900">Golden Bee Store</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Accord direct WhatsApp
                </span>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  📍 Agadez & Tout Niger
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bordereau & Facture N° {order.orderNumber} • Boutique :{' '}
                <strong className="text-slate-800">{vendorName}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-500 sm:justify-end">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="font-mono text-slate-700 font-bold">
                WhatsApp Vendeur : +227 {vendorPhone}
              </div>
            </div>
          </div>

          {/* Quick Action Button for WhatsApp */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Échanger avec {vendorName}
                </h3>
                <p className="text-xs text-slate-600">
                  Validez les détails de remise et le mode de règlement directement.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenVendorWhatsApp(order)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-md transition-all shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ouvrir WhatsApp (+227 {vendorPhone})</span>
            </button>
          </div>

          {/* Referral Banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-black text-sm text-slate-900 block">
                  Programme Parrainage : Gagnez 500 FCFA !
                </span>
                <p className="text-xs text-slate-700">
                  Invitez un commerçant à ouvrir sa boutique sur Golden Bee Store (1 500 FCFA/mois) et recevez immédiatement <strong>500 FCFA</strong> de bonus.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleCopyReferral}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 hover:bg-amber-100 transition-colors"
              >
                {referralCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span>{referralCopied ? 'Copié !' : 'Copier Code'}</span>
              </button>
              <button
                onClick={handleShareReferral}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Inviter</span>
              </button>
            </div>
          </div>

          {/* Tracking Number Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Numéro de commande pour {vendorName} :
              </span>
              <div className="text-lg font-mono font-black text-slate-900 tracking-wider">
                {order.orderNumber}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyOrderNum}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-xs transition-colors print:hidden"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copied ? 'Copié !' : 'Copier N°'}</span>
              </button>
            </div>
          </div>

          {/* Client & Delivery details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Mode de réception ({order.deliveryMethod.name})
              </span>
              <p className="font-semibold text-slate-800">{order.customer.fullName}</p>
              <p className="text-slate-600">
                {order.customer.region ? `Région ${order.customer.region} • ` : ''}
                {order.customer.city}
                {order.customer.neighborhood ? `, ${order.customer.neighborhood}` : ''}
              </p>
              <p className="text-slate-500">{order.customer.addressDetails || 'Retrait en boutique'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                Coordonnées de contact
              </span>
              <p className="text-slate-600">
                Client : <strong className="text-slate-900">{order.customer.phone}</strong>
              </p>
              <p className="text-slate-600">
                Boutique : <strong className="text-slate-900">+227 {vendorPhone}</strong>
              </p>
              <p className="text-slate-600">
                Délai prévu : <strong className="text-slate-900">{order.deliveryMethod.delay}</strong>
              </p>
            </div>
          </div>

          {/* Itemized list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Articles commandés chez {vendorName}
              </h4>
              <span className="text-xs font-bold text-slate-500">
                {order.items.length} article(s)
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3">Article</th>
                    <th className="p-3 text-center">Qté</th>
                    <th className="p-3 text-right">Prix Unit.</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => {
                    const productUrl = getProductShareUrl(item.product.id);
                    return (
                      <tr key={item.product.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{item.product.name}</div>
                          {(item.selectedSize || item.selectedColor) && (
                            <div className="text-[11px] text-slate-400">
                              {[item.selectedSize ? `Taille: ${item.selectedSize}` : '', item.selectedColor ? `Couleur: ${item.selectedColor}` : ''].filter(Boolean).join(' • ')}
                            </div>
                          )}
                          <a
                            href={productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-bold hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Voir la fiche produit</span>
                          </a>
                        </td>
                        <td className="p-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-600">
                          {item.product.price.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial summary */}
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 pt-2">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-bold text-slate-900">
                  {order.subtotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison :</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryCost === 0
                    ? '0 FCFA (Gratuit)'
                    : `${order.deliveryCost.toLocaleString('fr-FR')} FCFA`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Remise appliquée :</span>
                  <span>-{order.discount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total de cette boutique :</span>
                <span className="text-emerald-700 font-mono">
                  {order.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Télécharger Facture</span>
            </button>

            <button
              onClick={handleTrackDelivery}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Suivre cette commande</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
