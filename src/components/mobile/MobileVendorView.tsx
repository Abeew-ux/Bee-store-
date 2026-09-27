import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { compressImageFile, formatBytes } from '../../utils/imageCompressor';
import { Product, Order, OrderStatus, SHOP_MONTHLY_FEE, REFERRAL_BONUS_PER_SHOP } from '../../types';
import { getShopShareUrl, getProductShareUrl, copyToClipboard } from '../../utils/shareUtils';
import { CountryCodeSelector } from '../CountryCodeSelector';
import { COUNTRY_CODES } from '../../data/countryCodes';
import { VendorChatAndPVTab } from '../vendor/VendorChatAndPVTab';
import { EditShopModal } from '../vendor/EditShopModal';
import {
  Store,
  Plus,
  Lock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  Package,
  Boxes,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Minus,
  Upload,
  Camera,
  Eye,
  X,
  FileCheck,
  Check,
  Share2,
  MessageCircle,
  MessageSquare,
  Bell,
  ExternalLink,
  Globe,
  Gift,
  Coins,
  Users,
  Copy,
  Ticket,
  Percent,
  Download,
  Flame,
  Layers,
  Crown,
  Settings,
} from 'lucide-react';

interface MobileVendorViewProps {
  onAddNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

const SAMPLE_DELIVERY_PROOFS = [
  {
    name: 'Colis remis en main propre',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bordereau de livraison signé',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
  },
];

export const MobileVendorView: React.FC<MobileVendorViewProps> = ({
  onAddNewProduct,
  onEditProduct,
}) => {
  const {
    currentVendorShop,
    setCurrentVendorShop,
    currentUser,
    isAdminAuthenticated,
    setIsCreateShopModalOpen,
    setIsReferralModalOpen,
    loginVendorShop,
    products,
    orders,
    shops,
    updateStock,
    deleteProduct,
    updateOrderStatus,
    vendorSubmitDeliveryProof,
    vendorNotifications,
    markVendorNotificationAsRead,
    clearVendorNotifications,
    sponsorNotifications,
    markSponsorNotificationAsRead,
    clearSponsorNotifications,
    vendorUnreadChatCount,
    showToast,
    openFlyerModal,
    coupons,
    createCoupon,
    toggleCouponActive,
    deleteCoupon,
  } = useStore();

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginCountryCode, setLoginCountryCode] = useState('+227');
  const [loginPin, setLoginPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [copiedShopLink, setCopiedShopLink] = useState(false);
  const [copiedProdId, setCopiedProdId] = useState<string | null>(null);
  const [copiedRefCode, setCopiedRefCode] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Sub tab for logged in vendor
  const [vendorTab, setVendorTab] = useState<'orders' | 'chat' | 'notifs' | 'products' | 'coupons' | 'stock' | 'referrals' | 'subscription'>('orders');

  // Coupon creator form state
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(0);
  const [newCouponLimit, setNewCouponLimit] = useState<number>(100);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  // Modal for delivery proof upload
  const [selectedOrderForProof, setSelectedOrderForProof] = useState<Order | null>(null);
  const [deliveryProofImage, setDeliveryProofImage] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Filter products for this shop
  const shopProducts = products.filter(
    (p) =>
      p.shopId === currentVendorShop?.id ||
      p.shopName?.toLowerCase() === currentVendorShop?.name.toLowerCase()
  );

  // Filter orders for this shop
  const shopOrders = orders.filter(
    (o) =>
      o.shopId === currentVendorShop?.id ||
      o.shopName?.toLowerCase() === currentVendorShop?.name.toLowerCase() ||
      o.items.some(
        (it) =>
          it.product.shopId === currentVendorShop?.id ||
          it.product.shopName?.toLowerCase() === currentVendorShop?.name.toLowerCase()
      )
  );

  // Filter notifications for this shop
  const shopNotifications = vendorNotifications.filter(
    (n) => n.shopId === currentVendorShop?.id
  );
  const unreadNotificationsCount = shopNotifications.filter((n) => !n.read).length;

  // Filter sponsor notifications for this shop
  const currentShopReferralCode = (currentVendorShop?.referralCode || '').toUpperCase();
  const currentShopPhone = (currentVendorShop?.phone || '').replace(/\s+/g, '');
  const mySponsorNotifications = sponsorNotifications.filter(
    (n) =>
      (currentShopReferralCode && n.sponsorReferralCode && n.sponsorReferralCode.toUpperCase() === currentShopReferralCode) ||
      (currentShopPhone && n.sponsorPhone && n.sponsorPhone.replace(/\s+/g, '').includes(currentShopPhone)) ||
      (n.sponsorId && n.sponsorId === currentVendorShop?.id)
  );
  const unreadSponsorNotificationsCount = mySponsorNotifications.filter((n) => !n.read).length;

  const handleShareShop = async () => {
    if (!currentVendorShop) return;
    const url = getShopShareUrl(currentVendorShop.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentVendorShop.name} sur Bee_store`,
          text: `Découvrez la boutique officielle ${currentVendorShop.name} sur Bee_store Niger !`,
          url,
        });
        showToast('Lien de la boutique partagé !', 'success');
        return;
      } catch {
        // user cancelled or fallback
      }
    }

    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedShopLink(true);
      showToast('Lien de votre boutique copié !', 'success', 'Collez et partagez le lien avec vos clients sur WhatsApp et réseaux sociaux.');
      setTimeout(() => setCopiedShopLink(false), 3000);
    }
  };

  const handleShareProductItem = async (product: Product) => {
    const url = getProductShareUrl(product.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - ${currentVendorShop?.name || 'Bee_store'}`,
          text: `Achetez "${product.name}" (${product.price.toLocaleString('fr-FR')} FCFA) sur Bee_store !`,
          url,
        });
        showToast('Article partagé !', 'success');
        return;
      } catch {
        // fallback
      }
    }

    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedProdId(product.id);
      showToast('Lien de l’article copié !', 'success');
      setTimeout(() => setCopiedProdId(null), 3000);
    }
  };

  const pendingEscrowOrders = shopOrders.filter(
    (o) => o.orderStatus === 'fonds_bloques_sequestre' || o.orderStatus === 'en_preparation'
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginPin.trim()) {
      showToast('Informations incomplètes', 'error', 'Veuillez saisir votre numéro et code PIN.');
      return;
    }
    setIsLoggingIn(true);
    loginVendorShop(loginPhone.trim(), loginPin.trim());
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setCurrentVendorShop(null);
    localStorage.removeItem('bee_store_current_vendor_id');
    showToast('Déconnexion réussie', 'info', 'Vous êtes déconnecté de votre espace boutique.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Fichier trop volumineux', 'error', 'Taille maximum : 15 Mo');
        return;
      }
      try {
        const compressed = await compressImageFile(file, { maxWidth: 900, quality: 0.72 });
        setDeliveryProofImage(compressed.dataUrl);
        showToast(
          'Photo optimisée !',
          'success',
          `Preuve compressée à ${formatBytes(compressed.compressedSize)} (-${compressed.ratio}%)`
        );
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDeliveryProofImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmitDeliveryProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForProof) return;

    if (!deliveryProofImage) {
      showToast('Preuve manquante', 'error', 'Veuillez téléverser la photo ou capture de remise.');
      return;
    }

    setIsSubmittingProof(true);
    try {
      await vendorSubmitDeliveryProof(
        selectedOrderForProof.id,
        deliveryProofImage,
        deliveryNote || 'Produit remis au client avec succès'
      );
      showToast(
        'Preuve de livraison envoyée !',
        'success',
        "L'administrateur va vérifier la preuve et débloquer vos fonds."
      );
      setSelectedOrderForProof(null);
      setDeliveryProofImage('');
      setDeliveryNote('');
    } catch (err) {
      showToast('Erreur', 'error', "Une erreur est survenue lors de l'envoi de la preuve.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // 1. IF NOT LOGGED IN TO ANY SHOP
  if (!currentVendorShop) {
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 scrollbar-none pb-6">
        {/* Connected client status badge if logged in as client */}
        {currentUser && currentUser.role !== 'vendor' && !isAdminAuthenticated && (
          <div className="p-3 bg-blue-50/90 dark:bg-slate-800/90 border border-blue-200 dark:border-blue-700/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-300">Compte Client Acheteur ({currentUser.phone})</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300 rounded-full shrink-0">
              Mode Acheteur
            </span>
          </div>
        )}

        {/* Hero banner to open a shop */}
        <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-lg border border-amber-500/30 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/10 rounded-full blur-xl" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl mx-auto shadow-md">
            🏪
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 uppercase tracking-wider">
              Espace Vendeurs Partenaires
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Vendez vos articles sur <span className="text-amber-400">Bee_store</span>
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed max-w-xs mx-auto">
              Ouvrez votre boutique en ligne, échangez directement avec vos clients sur <strong>WhatsApp</strong> et développez vos ventes partout au Niger.
            </p>
          </div>

          {/* Pricing Highlight */}
          <div className="py-2.5 px-3.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Abonnement Mensuel :</span>
            <span className="text-sm font-black font-mono text-amber-400">{SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA / mois</span>
          </div>

          {/* Referral Callout */}
          <div className="py-2 px-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-emerald-400" />
              Programme Parrainage :
            </span>
            <span className="font-black text-white">+{REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} F / boutique</span>
          </div>

          <button
            onClick={() => setIsCreateShopModalOpen(true)}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Ouvrir ma Boutique Maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Login to existing shop */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                Accéder à ma Boutique existante
              </h4>
              <p className="text-[10px] text-slate-400">Connectez-vous avec votre numéro et code PIN</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Numéro de Téléphone du Gérant
              </label>
              <div className="flex gap-1.5">
                <div className="w-[115px] shrink-0">
                  <CountryCodeSelector
                    value={loginCountryCode}
                    onChange={setLoginCountryCode}
                  />
                </div>
                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder={`Ex: ${(COUNTRY_CODES.find((c) => c.code === loginCountryCode) || COUNTRY_CODES[0]).placeholder}`}
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Code PIN Secret
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Se Connecter à ma Boutique</span>
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl text-xs text-amber-900 space-y-1.5">
          <span className="font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Fonctionnement Direct Bee_store :
          </span>
          <ol className="list-decimal list-inside text-xs space-y-1 text-amber-800">
            <li>Abonnement mensuel de <strong>{SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA</strong> au compte <strong>97470831</strong> pour ouvrir la boutique.</li>
            <li>Le client clique pour commander et vous contacte <strong>directement sur WhatsApp</strong>.</li>
            <li>Vous convenez des modalités de livraison (domicile ou retrait en boutique) et du paiement.</li>
            <li>Partagez votre code parrain et gagnez <strong>{REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} FCFA</strong> par vendeur parrainé !</li>
          </ol>
        </div>
      </div>
    );
  }

  // 2. IF SHOP IS PENDING APPROVAL
  if (currentVendorShop.status === 'en_attente') {
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 scrollbar-none pb-6 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-300 dark:border-amber-500/40 p-5 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              En attente d'ouverture
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {currentVendorShop.name}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
              Votre demande et votre capture de paiement de <strong>1 000 FCFA</strong> vers le <strong>97470831</strong> ont été transmises à l'administrateur.
            </p>
          </div>

          {/* PV Decision Official Card */}
          <div className="p-3.5 bg-amber-50 dark:bg-slate-950 rounded-2xl border border-amber-200 dark:border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>PV Administratif Central en Cours d'Étude</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
              Dès validation de votre paiement au 97470831, votre PV officiel d'approbation et vos accès boutique s'activeront instantanément.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Gérant :</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentVendorShop.ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Téléphone :</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{currentVendorShop.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Compte Récepteur :</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400">97470831</span>
            </div>

            {currentVendorShop.paymentProofImage && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Votre capture envoyée :</span>
                <img
                  src={currentVendorShop.paymentProofImage}
                  alt="Capture de paiement"
                  className="w-full max-h-36 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Changer de compte</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. IF SHOP IS REJECTED
  if (currentVendorShop.status === 'refusee') {
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 scrollbar-none pb-6 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-300 dark:border-rose-500/40 p-5 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] bg-rose-100 text-rose-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Demande non validée
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {currentVendorShop.name}
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed max-w-xs mx-auto">
              {currentVendorShop.adminNote || "La capture n'a pas pu être vérifiée avec le compte 97470831."}
            </p>
          </div>

          {/* PV Rejection notice block */}
          <div className="p-3.5 bg-rose-50 dark:bg-slate-950 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 dark:text-rose-300">
              <Crown className="w-4 h-4 text-rose-500" />
              <span>PV OFFICIEL DE DÉCISION ADMINISTRATIVE</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
              Motif : {currentVendorShop.adminNote || 'Paiement non confirmé. Veuillez renvoyer une capture claire montrant la transaction de 1 000 FCFA vers 97470831.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setIsCreateShopModalOpen(true)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
            >
              Renvoyer une preuve de paiement valide
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. IF SHOP IS APPROVED (ACTIVE VENDOR DASHBOARD)
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 scrollbar-none pb-4">
      {/* Shop Profile Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-3.5 shadow-md flex flex-col gap-3 border border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentVendorShop.logoUrl}
              alt={currentVendorShop.name}
              className="w-11 h-11 rounded-xl object-cover border border-white/20 bg-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-[150px]">
                  {currentVendorShop.name}
                </h3>
                <span className="flex items-center gap-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Active</span>
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-mono">
                Gérant : {currentVendorShop.ownerName} • {currentVendorShop.countryCode || '+227'} {currentVendorShop.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditShopModalOpen(true)}
              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold"
              title="Modifier ma boutique"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modifier</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl transition-colors"
              title="Se déconnecter de la boutique"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Shop Share & Flyer Generator Actions */}
        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openFlyerModal(shopProducts[0] || null, currentVendorShop)}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Générateur de Flyer WhatsApp (1-Clic)</span>
          </button>

          <button
            type="button"
            onClick={handleShareShop}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
              copiedShopLink
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {copiedShopLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lien Copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Partager ma Boutique</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 p-1 bg-slate-200/90 dark:bg-slate-900 rounded-2xl text-center">
        <button
          onClick={() => setVendorTab('orders')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all relative ${
            vendorTab === 'orders' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Commandes ({shopOrders.length})
        </button>

        <button
          onClick={() => setVendorTab('chat')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all relative flex items-center justify-center gap-1 ${
            vendorTab === 'chat'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/40 hover:bg-amber-200/70'
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          <span>Messages & PV</span>
          {vendorUnreadChatCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[8px] font-black animate-bounce">
              +{vendorUnreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setVendorTab('referrals')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all relative flex items-center justify-center gap-1 ${
            vendorTab === 'referrals' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/40'
          }`}
        >
          <Gift className="w-3 h-3" />
          <span>Parrainage</span>
          {unreadSponsorNotificationsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[8px] font-black animate-bounce">
              +{unreadSponsorNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setVendorTab('notifs')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all relative flex items-center justify-center gap-1 ${
            vendorTab === 'notifs' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3 h-3 text-amber-600" />
          <span>Alertes</span>
          {unreadNotificationsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[8px] font-black">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setVendorTab('products')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            vendorTab === 'products' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Articles ({shopProducts.length})
        </button>

        <button
          onClick={() => setVendorTab('coupons')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
            vendorTab === 'coupons' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40'
          }`}
        >
          <Ticket className="w-3 h-3" />
          <span>Codes Promo</span>
        </button>

        <button
          onClick={() => setVendorTab('stock')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            vendorTab === 'stock' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Stocks
        </button>

        <button
          onClick={() => setVendorTab('subscription')}
          className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
            vendorTab === 'subscription' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Abonnement
        </button>
      </div>

      {/* 0. VENDOR REAL-TIME CHAT & OFFICIAL PV DECISIONS TAB */}
      {vendorTab === 'chat' && <VendorChatAndPVTab />}

      {/* 1. ORDERS & DIRECT WHATSAPP MANAGEMENT TAB */}
      {vendorTab === 'orders' && (
        <div className="space-y-3">
          {/* Vendor Financial & Pipeline Overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chiffre d'Affaires</span>
              <p className="text-sm sm:text-base font-mono font-black text-amber-600 truncate">
                {shopOrders
                  .filter((o) => o.orderStatus !== 'annulee')
                  .reduce((sum, o) => sum + o.total, 0)
                  .toLocaleString('fr-FR')}{' '}
                <span className="text-[10px]">F</span>
              </p>
              <span className="text-[9px] text-slate-400 block">{shopOrders.length} vente(s)</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">En Cours</span>
              <p className="text-sm sm:text-base font-mono font-black text-slate-900 truncate">
                {shopOrders.filter((o) => o.orderStatus === 'en_livraison' || o.orderStatus === 'en_preparation' || o.orderStatus === 'nouvelle_commande_whatsapp').length}
              </p>
              <span className="text-[9px] text-amber-600 font-semibold block">À traiter / livrer</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Livrées</span>
              <p className="text-sm sm:text-base font-mono font-black text-emerald-600 truncate">
                {shopOrders.filter((o) => o.orderStatus === 'livree').length}
              </p>
              <span className="text-[9px] text-emerald-600 font-semibold block">Finalisées</span>
            </div>
          </div>

          {/* Direct WhatsApp Info */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300/80 rounded-2xl space-y-1.5 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Commandes en Direct via WhatsApp</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Les clients vous contactent directement sur WhatsApp pour convenir de la livraison et du paiement. Vous pouvez actualiser l'état de chaque commande ci-dessous.
            </p>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-800">
              Commandes reçues ({shopOrders.length}) :
            </span>
          </div>

          {shopOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucune commande pour le moment</p>
              <p className="text-xs text-slate-400">
                Vos commandes apparaîtront ici dès que des clients achèteront vos articles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shopOrders.map((order) => {
                const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                  nouvelle_commande_whatsapp: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900', label: 'Nouvelle (WhatsApp)' },
                  en_attente: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900', label: 'En attente' },
                  en_preparation: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900', label: 'En préparation' },
                  en_livraison: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-900', label: 'En cours de livraison' },
                  livree: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900', label: 'Livrée avec succès' },
                  annulee: { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-900', label: 'Annulée' },
                };

                const currentStatusInfo = statusColors[order.orderStatus] || {
                  bg: 'bg-slate-100 border-slate-300',
                  text: 'text-slate-800',
                  label: order.orderStatus,
                };

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {order.deliveryMethod.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          Client : <strong>{order.customer.fullName}</strong> ({order.customer.phone})
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.customer.city} {order.customer.neighborhood ? `• ${order.customer.neighborhood}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-slate-900 text-sm sm:text-base block">
                          {order.total.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-mono font-bold">
                            {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp Customer Contact & Call button */}
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${order.customer.fullName}, je suis le vendeur de ${currentVendorShop.name} sur Bee_store concernant votre commande ${order.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4 fill-white text-emerald-600 shrink-0" />
                        <span>Discuter sur WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-colors"
                        title="Appeler le client"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Status Management */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Statut actuel :</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentStatusInfo.bg} ${currentStatusInfo.text}`}>
                          {currentStatusInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'en_preparation')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-colors ${
                            order.orderStatus === 'en_preparation'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          En préparation
                        </button>
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'en_livraison')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-colors ${
                            order.orderStatus === 'en_livraison'
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          En livraison
                        </button>
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'livree')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-colors ${
                            order.orderStatus === 'livree'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Livrée ✓
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. REFERRAL TAB (500 FCFA PARRAINAGE) */}
      {vendorTab === 'referrals' && (
        <div className="space-y-4">
          {/* Referral Hero */}
          <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-500/30 text-center relative overflow-hidden space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl mx-auto shadow-md">
              <Gift className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Gagnez de l'argent avec Bee_store
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                +{REFERRAL_BONUS_PER_SHOP.toLocaleString('fr-FR')} FCFA par boutique créée
              </h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed max-w-xs mx-auto">
                Partagez votre code parrain avec d'autres commerçants et entrepreneurs. Dès qu'ils créent leur boutique, vous recevez 500 FCFA !
              </p>
            </div>

            {/* Referral Code Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-2">
              <span className="text-xs text-emerald-200 font-medium block">Votre Code Parrain :</span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider bg-slate-950/60 px-4 py-1.5 rounded-xl border border-white/10">
                  {currentVendorShop.referralCode || currentVendorShop.id.slice(0, 8).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const code = currentVendorShop.referralCode || currentVendorShop.id.slice(0, 8).toUpperCase();
                    const ok = await copyToClipboard(code);
                    if (ok) {
                      setCopiedRefCode(true);
                      showToast('Code parrain copié !', 'success');
                      setTimeout(() => setCopiedRefCode(false), 2500);
                    }
                  }}
                  className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
                  title="Copier le code"
                >
                  {copiedRefCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Share CTA */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🌟 Ouvre ta boutique en ligne sur Bee_store Niger pour seulement ${SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA/mois ! Utilise mon code de parrainage *${
                    currentVendorShop.referralCode || currentVendorShop.id.slice(0, 8).toUpperCase()
                  }* lors de ton inscription : ${window.location.origin}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Inviter sur WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-1">
              <span className="text-xs text-slate-500 font-medium">Boutiques Parrainées</span>
              <div className="font-mono text-2xl font-black text-slate-900">
                {currentVendorShop.referralsCount || 0}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">Commerçants actifs</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-1">
              <span className="text-xs text-slate-500 font-medium">Gains Parrainage</span>
              <div className="font-mono text-2xl font-black text-emerald-600">
                {((currentVendorShop.referralsCount || 0) * REFERRAL_BONUS_PER_SHOP).toLocaleString('fr-FR')} F
              </div>
              <span className="text-[11px] text-slate-400">Total cumulé</span>
            </div>
          </div>

          {/* Real-time Sponsor Notifications List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                Alertes & Notifications de Parrainage
              </span>
              {mySponsorNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearSponsorNotifications(currentVendorShop.referralCode || currentVendorShop.phone)}
                  className="text-[10px] text-slate-500 hover:text-rose-600 font-semibold"
                >
                  Effacer
                </button>
              )}
            </div>

            {mySponsorNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">
                Aucune alerte de parrainage pour le moment. Dès qu'un commerçant s'inscrit avec votre code, vous recevrez une notification instantanée ici.
              </p>
            ) : (
              <div className="space-y-2.5">
                {mySponsorNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markSponsorNotificationAsRead(notif.id)}
                    className={`p-3 rounded-2xl border transition-all space-y-2 ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 opacity-90'
                        : 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                          <Gift className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">
                            Nouveau Filleul : {notif.newShopName}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR')} à{' '}
                            {new Date(notif.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <span className="font-mono font-black text-xs text-emerald-600">
                        +{notif.bonusEarned || 500} FCFA
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-snug">{notif.message}</p>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-600">
                        Gérant : <strong>{notif.newOwnerName}</strong> ({notif.newShopPhone})
                      </div>

                      <a
                        href={`https://wa.me/${notif.newShopPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Félicitations ${notif.newOwnerName} pour l'ouverture de votre boutique "${notif.newShopName}" sur Bee_store Niger ! Bienvenue dans le réseau.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 fill-white text-emerald-600 shrink-0" />
                        <span>Féliciter sur WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referred Shops List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Vos Vendeurs Filleuls
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {shops.filter((s) => s.referredBy === (currentVendorShop.referralCode || currentVendorShop.id)).length} boutique(s)
              </span>
            </div>

            {shops.filter((s) => s.referredBy === (currentVendorShop.referralCode || currentVendorShop.id)).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Vous n'avez pas encore de filleuls. Partagez votre code WhatsApp pour commencer à cumuler vos 500 FCFA !
              </p>
            ) : (
              <div className="space-y-2">
                {shops
                  .filter((s) => s.referredBy === (currentVendorShop.referralCode || currentVendorShop.id))
                  .map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img src={s.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover bg-white border border-slate-200" />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                          <span className="text-[10px] text-slate-500">{s.ownerName}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 font-mono">+500 FCFA</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. NOTIFICATIONS / ALERTS TAB */}
      {vendorTab === 'notifs' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Notifications d'achats reçus ({shopNotifications.length})
            </span>
            {shopNotifications.length > 0 && (
              <button
                type="button"
                onClick={() => clearVendorNotifications(currentVendorShop.id)}
                className="text-[10px] text-slate-500 hover:text-rose-600 font-semibold"
              >
                Tout effacer
              </button>
            )}
          </div>

          {shopNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">Aucune nouvelle alerte</p>
              <p className="text-[10px] text-slate-400">
                Vous recevrez instantanément une notification ici avec tous les détails dès qu'un client achète dans votre boutique.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shopNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markVendorNotificationAsRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 shadow-2xs ${
                    notif.read
                      ? 'bg-white border-slate-200 opacity-80'
                      : 'bg-amber-50/70 border-amber-300/80 ring-1 ring-amber-400/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          {notif.customerName ? `Commande reçue de ${notif.customerName}` : 'Notification Boutique'}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(notif.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono font-black text-xs text-amber-600">
                      {notif.totalAmount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-snug">{notif.message}</p>

                  {/* Customer info & direct WhatsApp contact */}
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-600">
                      Client : <strong>{notif.customerName}</strong> ({notif.customerPhone})
                    </div>

                    <a
                      href={`https://wa.me/${notif.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour ${notif.customerName}, nous avons bien reçu votre commande sur ${currentVendorShop.name} (Bee_store).`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3 fill-white text-emerald-600 shrink-0" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PRODUCTS TAB */}
      {vendorTab === 'products' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-slate-700">
              Articles publiés sur Bee_store :
            </span>

            <button
              onClick={onAddNewProduct}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un Article</span>
            </button>
          </div>

          {shopProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                Vous n'avez pas encore d'articles publiés
              </p>
              <p className="text-[10px] text-slate-400">
                Cliquez sur "Ajouter un Article" pour mettre en vente votre premier produit sur Bee_store.
              </p>
              <button
                onClick={onAddNewProduct}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publier mon 1er article</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {shopProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-emerald-700">
                          {p.price.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[9px] text-slate-400">• {p.stock} en stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openFlyerModal(p, currentVendorShop)}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors"
                      title="Générer Flyer Statut WhatsApp"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Flyer</span>
                    </button>
                    <button
                      onClick={() => handleShareProductItem(p)}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                        copiedProdId === p.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Partager le lien du produit"
                    >
                      {copiedProdId === p.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </button>
                    <button
                      onClick={() => onEditProduct(p)}
                      className="p-1.5 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. CODES PROMO & COUPONS TAB */}
      {vendorTab === 'coupons' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-500" />
                Codes Promo & Réductions Clients
              </span>
              <p className="text-[10px] text-slate-500">
                Offrez des réductions personnalisées pour booster vos ventes et fidéliser vos clients.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingCoupon((prev) => !prev)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Code</span>
            </button>
          </div>

          {/* Coupon Creation Form */}
          {isCreatingCoupon && (
            <div className="bg-white rounded-2xl border border-amber-300 p-4 shadow-sm space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Créer un Code Promo pour {currentVendorShop.name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500">Modèles Rapides :</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCouponCode(`PROMO10-${currentVendorShop.name.slice(0, 3).toUpperCase()}`);
                      setNewCouponType('percentage');
                      setNewCouponValue(10);
                      setNewCouponMinOrder(10000);
                    }}
                    className="text-[10px] px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg font-bold hover:bg-amber-100"
                  >
                    🔥 -10% dès 10 000 F
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCouponCode(`REMISE2000`);
                      setNewCouponType('fixed');
                      setNewCouponValue(2000);
                      setNewCouponMinOrder(25000);
                    }}
                    className="text-[10px] px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg font-bold hover:bg-emerald-100"
                  >
                    ⚡ -2 000 FCFA dès 25 000 F
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCouponCode(`AGADEZ5000`);
                      setNewCouponType('fixed');
                      setNewCouponValue(5000);
                      setNewCouponMinOrder(50000);
                    }}
                    className="text-[10px] px-2 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg font-bold hover:bg-purple-100"
                  >
                    🎁 -5 000 FCFA dès 50 000 F
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Code Promo (Ex: TABASKI, PROMO10)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="EX: AGADEZ10"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Type de Réduction
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewCouponType('percentage')}
                      className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                        newCouponType === 'percentage'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Pourcentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCouponType('fixed')}
                      className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                        newCouponType === 'fixed'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Montant Fixe (FCFA)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Valeur de la Remise ({newCouponType === 'percentage' ? '%' : 'FCFA'})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Panier Minimum Requis (FCFA)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    placeholder="0 = Pas de minimum"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!newCouponCode.trim() || isSubmittingCoupon}
                  onClick={async () => {
                    setIsSubmittingCoupon(true);
                    await createCoupon({
                      code: newCouponCode.trim().toUpperCase(),
                      shopId: currentVendorShop.id,
                      shopName: currentVendorShop.name,
                      discountType: newCouponType,
                      discountValue: newCouponValue,
                      minOrderAmount: newCouponMinOrder > 0 ? newCouponMinOrder : undefined,
                      usageLimit: newCouponLimit,
                      isActive: true,
                    });
                    setIsSubmittingCoupon(false);
                    setIsCreatingCoupon(false);
                    setNewCouponCode('');
                  }}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enregistrer le Code Promo</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Coupons */}
          <div className="space-y-2">
            {coupons.filter(
              (c) =>
                !c.shopId ||
                c.shopId === 'ALL' ||
                c.shopId === currentVendorShop.id ||
                c.shopName?.toLowerCase() === currentVendorShop.name.toLowerCase()
            ).length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center space-y-2">
                <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Aucun code promo actif</p>
                <p className="text-[10px] text-slate-400">
                  Créez votre premier code de réduction pour inciter vos clients à passer commande.
                </p>
              </div>
            ) : (
              coupons
                .filter(
                  (c) =>
                    !c.shopId ||
                    c.shopId === 'ALL' ||
                    c.shopId === currentVendorShop.id ||
                    c.shopName?.toLowerCase() === currentVendorShop.name.toLowerCase()
                )
                .map((coupon) => (
                  <div
                    key={coupon.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      coupon.isActive
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-slate-100/80 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                          {coupon.code}
                        </span>
                        <span className="text-xs font-black text-emerald-600">
                          -{coupon.discountValue}
                          {coupon.discountType === 'percentage' ? '%' : ' FCFA'}
                        </span>
                        {coupon.shopId === 'ALL' && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                            Global
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        {coupon.minOrderAmount ? (
                          <span>Min: {coupon.minOrderAmount.toLocaleString('fr-FR')} FCFA</span>
                        ) : (
                          <span>Sans minimum</span>
                        )}
                        <span>• Utilisé {coupon.usedCount} fois</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(coupon.code);
                          setCopiedCouponCode(coupon.id);
                          showToast('Code promo copié !', 'success');
                          setTimeout(() => setCopiedCouponCode(null), 2000);
                        }}
                        className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        title="Copier le code"
                      >
                        {copiedCouponCode === coupon.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCouponActive(coupon.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {coupon.isActive ? 'Actif' : 'En pause'}
                      </button>

                      {coupon.shopId !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 5. STOCK TAB */}
      {vendorTab === 'stock' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-slate-700">
              Ajustement instantané des stocks :
            </span>
            <span className="text-[10px] text-slate-400">
              Mise à jour en temps réel sur la boutique
            </span>
          </div>

          <div className="space-y-2">
            {shopProducts.map((p) => {
              const isLow = p.stock > 0 && p.stock <= (p.lowStockThreshold || 3);
              const isOut = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Épuisé' : isLow ? 'Stock Critique' : 'En Stock'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-700">
                          {p.stock} unités
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateStock(p.id, Math.max(0, p.stock - 5))}
                      disabled={p.stock <= 0}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold disabled:opacity-30"
                      title="-5 unités"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                      disabled={p.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 font-bold text-xs"
                    >
                      -1
                    </button>
                    <span className="w-7 text-center text-xs font-mono font-black text-slate-900">
                      {p.stock}
                    </span>
                    <button
                      onClick={() => updateStock(p.id, p.stock + 1)}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-2xs"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateStock(p.id, p.stock + 5)}
                      className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold"
                      title="+5 unités"
                    >
                      +5
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SUBSCRIPTION DETAILS TAB */}
      {vendorTab === 'subscription' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">Abonnement Mensuel Bee_store</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Actif (1 000 F/mois)
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Compte Récepteur :</span>
              <span className="font-mono font-bold text-amber-700">97470831</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date d'activation :</span>
              <span className="text-slate-800">
                {currentVendorShop.approvedAt
                  ? new Date(currentVendorShop.approvedAt).toLocaleDateString('fr-FR')
                  : 'Actif'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Validité jusqu'au :</span>
              <span className="font-bold text-emerald-700">
                {currentVendorShop.expiresAt
                  ? new Date(currentVendorShop.expiresAt).toLocaleDateString('fr-FR')
                  : '30 jours'}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900">
            Pour renouveler à la fin du mois, envoyez 1 000 FCFA vers le <strong>97470831</strong> et téléversez votre nouvelle capture.
          </div>
        </div>
      )}

      {/* VENDOR DELIVERY PROOF MODAL */}
      {selectedOrderForProof && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setSelectedOrderForProof(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden max-h-[92dvh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white">
                    Preuve de Remise au Client
                  </h3>
                  <p className="text-[10px] text-amber-300 font-mono">
                    Commande {selectedOrderForProof.orderNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForProof(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitDeliveryProof}
              className="p-4 space-y-4 overflow-y-auto overscroll-contain flex-1 scrollbar-none"
            >
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Règle de Sécurité Bee_store
                </span>
                <p className="text-[11px] leading-relaxed">
                  Prenez en photo le client avec son colis, le bon de livraison signé, ou la remise en boutique. L'administrateur débloquera votre paiement dès réception.
                </p>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Photo de la remise ou bordereau signé *
                </label>

                {deliveryProofImage ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500 bg-slate-950 p-2">
                    <img
                      src={deliveryProofImage}
                      alt="Preuve"
                      className="w-full h-44 object-contain rounded-xl bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setDeliveryProofImage('')}
                      className="absolute top-4 right-4 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/20">
                    <Camera className="w-8 h-8 text-amber-500 mb-1.5" />
                    <span className="text-xs font-bold text-slate-800">
                      Prendre une photo ou sélectionner l'image
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      PNG, JPG, JPEG (Max 8 Mo)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Exemples rapides de preuve (Démo) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_DELIVERY_PROOFS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDeliveryProofImage(s.url)}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3 text-amber-600" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Détails / Note de remise (Optionnel)
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Ex: Remis en main propre au client à la boutique"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingProof}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingProof ? (
                  <span>Envoi de la preuve...</span>
                ) : (
                  <>
                    <span>Transmettre la Preuve à l'Administrateur</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Shop Modal */}
      {currentVendorShop && isEditShopModalOpen && (
        <EditShopModal
          isOpen={isEditShopModalOpen}
          onClose={() => setIsEditShopModalOpen(false)}
          shop={currentVendorShop}
        />
      )}
    </div>
  );
};
