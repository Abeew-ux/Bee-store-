import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { compressImageFile, formatBytes } from '../utils/imageCompressor';
import {
  X,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

const SAMPLE_PAYMENT_PROOFS = [
  {
    name: 'Capture My Nita (97470831)',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Reçu Mobile Money (97470831)',
    url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80',
  },
];

export const MyNitaPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cart,
    cartSubtotal,
    discountAmount,
    selectedDeliveryMethod,
    deliveryAddress,
    createOrder,
    setIsReceiptModalOpen,
    showToast,
  } = useStore();

  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [senderPhone, setSenderPhone] = useState(deliveryAddress.phone || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isPaymentModalOpen) return null;

  const totalAmount = Math.max(0, cartSubtotal + selectedDeliveryMethod.price - discountAmount);
  const adminAccount = '97470831';
  const isPickup = selectedDeliveryMethod.id === 'pickup_shop';

  const handleCopy = (text: string, type: 'number' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'number') {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
      showToast('Numéro copié !', 'info', 'Compte Administrateur 97470831 copié dans le presse-papier');
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2500);
      showToast('Montant copié !', 'info');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('L\'image est trop volumineuse (max 15 Mo).');
        return;
      }
      try {
        const compressed = await compressImageFile(file, { maxWidth: 900, quality: 0.72 });
        setProofImage(compressed.dataUrl);
        setErrorMessage('');
        showToast(
          'Capture optimisée !',
          'success',
          `Taille réduite de ${formatBytes(compressed.originalSize)} à ${formatBytes(compressed.compressedSize)} (-${compressed.ratio}%)`
        );
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofImage(reader.result as string);
          setErrorMessage('');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!proofImage) {
      setErrorMessage('Veuillez joindre la capture d\'écran de votre transfert pour valider la commande.');
      return;
    }

    if (!senderPhone.trim()) {
      setErrorMessage('Veuillez renseigner votre numéro de téléphone émetteur.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find primary shop from cart if possible
      const primaryShopId = cart[0]?.product.shopId || 'shop-tech-zone';
      const primaryShopName = cart[0]?.product.shopName || 'Boutique Partenaire';

      await createOrder({
        customer: deliveryAddress,
        deliveryMethod: selectedDeliveryMethod,
        paymentMethod: 'my_nita',
        paymentProofImage: proofImage,
        nitaPhone: senderPhone,
        transactionRef: transactionRef.trim() || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        shopId: primaryShopId,
        shopName: primaryShopName,
        isPickupInShop: isPickup,
      });

      showToast(
        'Capture de paiement envoyée !',
        'success',
        'Votre transfert a été transmis au compte Administrateur (97470831).'
      );

      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
    } catch (error) {
      console.error('Error submitting order payment proof:', error);
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement de votre commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsPaymentModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[94dvh] flex flex-col">
        {/* Mobile handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden z-20" />

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                Paiement Sécurisé (My Nita & Amana Ta)
              </h2>
              <p className="text-[10px] text-amber-200">
                Compte Central Administrateur : <strong className="text-white font-mono">97470831</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form
          onSubmit={handleSubmitProof}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 scrollbar-none"
        >
          {/* Payment Verification Explanation */}
          <div className="p-3 bg-amber-50 border border-amber-300/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Règlement Direct & Sécurisé Golden Bee Store</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Effectuez votre transfert vers le compte récepteur officiel <strong>{adminAccount}</strong> puis envoyez la capture du reçu. La boutique sera immédiatement notifiée pour préparer et livrer votre commande.
            </p>
          </div>

          {/* Account Transfer Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Coordonnées de Transfert :
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Account Number */}
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Numéro de compte Admi
                  </span>
                  <span className="text-base font-black text-amber-400 font-mono tracking-wider">
                    {adminAccount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(adminAccount, 'number')}
                  className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                  title="Copier le numéro"
                >
                  {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Amount */}
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Montant exact à envoyer
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    {totalAmount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(totalAmount.toString(), 'amount')}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-white hover:text-slate-950 transition-colors"
                  title="Copier le montant"
                >
                  {copiedAmount ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-300 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>
                Modes acceptés : My Nita, TMoney, Flooz, Airtel Money, Moov Money, Wave ou Virement.
              </span>
            </div>
          </div>

          {/* Screenshot upload zone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              Capture d'écran du reçu de transfert * (Obligatoire)
            </label>

            {proofImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500 bg-slate-900 p-2 group">
                <img
                  src={proofImage}
                  alt="Capture de paiement"
                  className="w-full h-40 object-contain rounded-xl bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => setProofImage('')}
                  className="absolute top-4 right-4 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md"
                  title="Supprimer la capture"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-2 text-center text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Capture prête à être validée
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/30">
                <Upload className="w-8 h-8 text-amber-500 mb-1.5" />
                <span className="text-xs font-bold text-slate-800">
                  Cliquez ou déposez votre capture de transfert ici
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Formats acceptés : PNG, JPG, JPEG (Max 8 Mo)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Quick Demo Presets */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Exemples de reçu rapides (Démo & Test) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PAYMENT_PROOFS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProofImage(sample.url);
                      setErrorMessage('');
                    }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3 text-amber-600" />
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sender Phone & Transaction Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Numéro émetteur du transfert *
              </label>
              <div className="relative">
                <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Ex: 90 12 34 56"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Réf. de la transaction (Optionnel)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Ex: TX-984210"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Transmission sécurisée...</span>
            ) : (
              <>
                <span>Confirmer & Envoyer la Capture</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Lock className="w-3 h-3 text-amber-600" />
            Paiement Vérifié Golden Bee Store
          </span>
          <span className="font-mono text-slate-400">Admi: 97470831</span>
        </div>
      </div>
    </div>
  );
};
