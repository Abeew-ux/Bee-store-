import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, Shop } from '../../types';
import {
  LayoutDashboard,
  Boxes,
  Package,
  Truck,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Globe,
  Store,
  Eye,
  EyeOff,
  X,
  XCircle,
  Clock,
  Sparkles,
  Maximize2,
  FileCheck,
  Camera,
  ArrowRight,
  Lock,
  Unlock,
  Bell,
  Volume2,
  Copy,
  Search,
  MessageCircle,
  Zap,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Check,
  CheckCheck,
  ShieldAlert,
  Send,
  Settings,
  Gift,
  CreditCard,
  Save,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { AdminAnnouncementsTab } from '../admin/AdminAnnouncementsTab';
import { AdminMessagesTab } from '../admin/AdminMessagesTab';

interface MobileAdminViewProps {
  onAddNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const MobileAdminView: React.FC<MobileAdminViewProps> = ({
  onAddNewProduct,
  onEditProduct,
}) => {
  const {
    products,
    orders,
    shops,
    updateStock,
    deleteProduct,
    deleteShop,
    updateOrderStatus,
    approveShop,
    rejectShop,
    adminValidateCustomerPayment,
    adminReleaseFundsToVendor,
    batchValidatePayments,
    batchReleaseFunds,
    batchApproveShops,
    batchRestockProducts,
    adminNotifications,
    markAdminNotificationAsRead,
    clearAdminNotifications,
    platformSettings,
    updatePlatformSettings,
    payReferralBonus,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    isDarkMode,
    showToast,
    announcements,
    conversations,
    messages,
    unreadChatCount,
    vendorUnreadChatCount,
  } = useStore();

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Dashboard States
  const [subTab, setSubTab] = useState<
    'shops' | 'messages' | 'referrals' | 'stock' | 'products' | 'metrics' | 'settings' | 'orders' | 'escrow' | 'announcements'
  >('shops');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  
  // Local Settings Form state
  const [settingsFeeInput, setSettingsFeeInput] = useState(platformSettings?.monthlyShopFee || 1500);
  const [settingsBonusInput, setSettingsBonusInput] = useState(platformSettings?.referralBonus || 500);
  const [settingsAccountInput, setSettingsAccountInput] = useState(platformSettings?.adminPaymentAccount || '97470831');
  const [settingsMethods, setSettingsMethods] = useState(
    platformSettings?.acceptedPaymentMethods || {
      myNita: true,
      amanaTa: true,
      airtelMoney: true,
      alIzza: true,
      cashDelivery: true,
    }
  );
  const [selectedProofToZoom, setSelectedProofToZoom] = useState<{
    title: string;
    subtitle: string;
    url: string;
    action?: () => void;
    actionLabel?: string;
  } | null>(null);

  // Quick Inline Stock State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [inlineStockValue, setInlineStockValue] = useState<number>(0);

  // Stats calculation
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'annulee')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingShops = shops.filter((s) => s.status === 'en_attente');
  const approvedShops = shops.filter((s) => s.status === 'approuvee');
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);

  // Escrow orders needing admin attention
  const ordersPendingPaymentValidation = orders.filter(
    (o) => o.orderStatus === 'en_attente_validation_admi' || o.orderStatus === 'en_attente'
  );

  const ordersPendingFundsRelease = orders.filter(
    (o) => o.orderStatus === 'remis_client_attente_liberation'
  );

  const ordersInEscrow = orders.filter(
    (o) => o.orderStatus === 'fonds_bloques_sequestre' || o.orderStatus === 'en_preparation'
  );

  const totalAdminUrgentActions =
    ordersPendingPaymentValidation.length +
    ordersPendingFundsRelease.length +
    pendingShops.length;

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const success = loginAdmin(emailInput, passwordInput);
      setIsLoggingIn(false);
      if (!success) {
        setLoginError('Identifiants administrateur incorrects. Veuillez vérifier vos accès.');
      }
    }, 200);
  };

  // Filtered Products for Easy Stock & Article Management
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.shopName && p.shopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (stockFilter === 'out') return p.stock === 0;
      if (stockFilter === 'low') return p.stock > 0 && p.stock <= p.lowStockThreshold;
      return true;
    });
  }, [products, searchQuery, stockFilter]);

  // WhatsApp Message Generator Helpers (Makes contacting clients & vendors instant)
  const getWhatsAppClientUrl = (order: Order) => {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${order.customer.fullName}, votre commande Bee_store n°${order.orderNumber} d'un montant de ${order.total.toLocaleString(
        'fr-FR'
      )} FCFA a bien été validée par l'administrateur. Votre commande est confirmée et votre colis est en préparation.`
    );
    return `https://wa.me/${cleanPhone.length <= 8 ? '227' + cleanPhone : cleanPhone}?text=${message}`;
  };

  const getWhatsAppVendorUrl = (order: Order, vendorPhone: string) => {
    const cleanPhone = vendorPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour gérant de la boutique ${order.shopName || 'partenaire'}, votre preuve de remise pour la commande ${
        order.orderNumber
      } a été vérifiée avec succès. Vos gains de ${order.total.toLocaleString(
        'fr-FR'
      )} FCFA ont été transférés vers votre compte.`
    );
    return `https://wa.me/${cleanPhone.length <= 8 ? '227' + cleanPhone : cleanPhone}?text=${message}`;
  };

  // ==========================================
  // 🔒 1. VIEW: LOCKED ADMIN LOGIN GATEWAY
  // ==========================================
  if (!isAdminAuthenticated) {
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col items-center justify-center min-h-full">
        <div
          className={`w-full max-w-sm rounded-3xl p-5 border shadow-xl space-y-4 transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#0A1428] border-[#1C325F] text-slate-100 shadow-amber-950/20'
              : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200'
          }`}
        >
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Espace Administrateur Sécurisé
              </h2>
              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Accès Exclusif Administrateur (97470831)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 dark:text-slate-300 max-w-[280px] mx-auto leading-relaxed">
              Connectez-vous avec vos identifiants pour piloter les transactions et les boutiques.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
            {/* Identifier Input (Email or Phone) */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                Email ou Numéro Administrateur
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="abdou9747w@gmail.com ou 97470831"
                  className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    isDarkMode
                      ? 'bg-[#060C1B] border-[#1C325F] text-slate-100 placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                Mot de passe Administrateur
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full text-xs font-semibold px-3 py-2.5 pr-9 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    isDarkMode
                      ? 'bg-[#060C1B] border-[#1C325F] text-slate-100 placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {loginError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Ouvrir l'Espace Administrateur</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🚀 2. VIEW: AUTHENTICATED ADMIN WORKSPACE
  // ==========================================
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 scrollbar-none pb-5">
      {/* Top Admin Identity & Quick Logout Bar */}
      <div
        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 shadow-sm ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black truncate">Compte Central (97470831)</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Connecté : <strong className="text-amber-400 font-mono">Administrateur Officiel</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onAddNewProduct}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publier</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20"
            title="Verrouiller l'espace"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ⚡ 1-CLICK AUTOMATION BAR ("Rendre les actions difficiles faciles") */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-2.5 rounded-2xl shadow-md space-y-2">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            Actions Rapides Admin
          </span>
          <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.2 rounded-full font-mono">
            {pendingShops.length} boutique(s) en attente
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {/* Quick Action 1: Approve All Shops */}
          <button
            type="button"
            disabled={pendingShops.length === 0}
            onClick={() => batchApproveShops(pendingShops.map((s) => s.id))}
            className="p-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-left disabled:opacity-40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[9px] text-emerald-300 font-bold">
              <span>Boutiques</span>
              <Store className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black line-clamp-1 mt-0.5">
              Valider Toutes ({pendingShops.length})
            </span>
          </button>

          {/* Quick Action 2: Batch Restock */}
          <button
            type="button"
            onClick={() => batchRestockProducts(20)}
            className="p-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[9px] text-amber-300 font-bold">
              <span>Stocks Bas</span>
              <Boxes className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black line-clamp-1 mt-0.5">
              Réassort (+20)
            </span>
          </button>

          {/* Quick Action 3: New Product */}
          <button
            type="button"
            onClick={onAddNewProduct}
            className="p-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[9px] text-amber-300 font-bold">
              <span>Nouveau Produit</span>
              <Plus className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black line-clamp-1 mt-0.5">
              Ajouter au Catalogue
            </span>
          </button>
        </div>
      </div>

      {/* 🚀 PRIORITY ACTION HUB: Instant 1-tap resolution of pending administrative tasks */}
      {(() => {
        const unreadConvs = conversations.filter(
          (c) => (c.unreadCountBuyer || 0) > 0 || (c.unreadCountVendor || 0) > 0
        ).length;
        const unreadReferrals = adminNotifications.filter(
          (n) => !n.read && n.type === 'referral_shop_created'
        ).length;
        const pendingEscrow =
          ordersPendingPaymentValidation.length + ordersPendingFundsRelease.length;
        const totalPendingTasks =
          pendingShops.length + unreadConvs + unreadReferrals + pendingEscrow;

        if (totalPendingTasks === 0) return null;

        return (
          <div
            className={`p-3 rounded-2xl border shadow-sm space-y-2 transition-all ${
              isDarkMode
                ? 'bg-slate-900/90 border-amber-500/30'
                : 'bg-amber-50/90 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
                <span className="uppercase tracking-wider">
                  Tâches Prioritaires ({totalPendingTasks})
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                1 Clic pour traiter
              </span>
            </div>

            {/* Quick 1-tap task pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {pendingShops.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShopStatusFilter('pending');
                    setSubTab('shops');
                  }}
                  className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black text-left flex items-center justify-between shadow-xs active:scale-95 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wide block opacity-80">
                      Boutiques
                    </span>
                    <span className="text-xs truncate block">
                      {pendingShops.length} en attente
                    </span>
                  </div>
                  <Store className="w-4 h-4 shrink-0" />
                </button>
              )}

              {pendingEscrow > 0 && (
                <button
                  type="button"
                  onClick={() => setSubTab('escrow')}
                  className="p-2 rounded-xl bg-orange-500 text-white font-black text-left flex items-center justify-between shadow-xs active:scale-95 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wide block opacity-80">
                      Commandes
                    </span>
                    <span className="text-xs truncate block">
                      {pendingEscrow} à valider
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                </button>
              )}

              {unreadConvs > 0 && (
                <button
                  type="button"
                  onClick={() => setSubTab('messages')}
                  className="p-2 rounded-xl bg-blue-600 text-white font-black text-left flex items-center justify-between shadow-xs active:scale-95 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wide block opacity-80">
                      Support
                    </span>
                    <span className="text-xs truncate block">
                      {unreadConvs} message(s)
                    </span>
                  </div>
                  <MessageSquare className="w-4 h-4 shrink-0" />
                </button>
              )}

              {unreadReferrals > 0 && (
                <button
                  type="button"
                  onClick={() => setSubTab('referrals')}
                  className="p-2 rounded-xl bg-emerald-600 text-white font-black text-left flex items-center justify-between shadow-xs active:scale-95 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wide block opacity-80">
                      Parrainages
                    </span>
                    <span className="text-xs truncate block">
                      {unreadReferrals} nouveau(x)
                    </span>
                  </div>
                  <Gift className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Segmented Sub Tabs: Horizontal comfortable scroll bar with icons and clear badges */}
      <div
        className={`p-1.5 rounded-2xl border overflow-x-auto scrollbar-none flex items-center gap-1.5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        {[
          {
            id: 'shops',
            label: 'Boutiques',
            icon: Store,
            badge: pendingShops.length,
            badgeColor: 'bg-amber-500 text-slate-950',
          },
          {
            id: 'escrow',
            label: 'Commandes',
            icon: ShieldCheck,
            badge: ordersPendingPaymentValidation.length + ordersPendingFundsRelease.length,
            badgeColor: 'bg-orange-500 text-white',
          },
          {
            id: 'messages',
            label: 'Discussions',
            icon: MessageSquare,
            badge: conversations.filter((c) => (c.unreadCountBuyer || 0) > 0 || (c.unreadCountVendor || 0) > 0).length,
            badgeColor: 'bg-blue-500 text-white',
          },
          {
            id: 'referrals',
            label: 'Parrainages',
            icon: Gift,
            badge: adminNotifications.filter((n) => !n.read && n.type === 'referral_shop_created').length,
            badgeColor: 'bg-emerald-500 text-white',
          },
          {
            id: 'products',
            label: 'Articles',
            icon: Boxes,
          },
          {
            id: 'stock',
            label: 'Stocks',
            icon: Package,
            badge: outOfStockProducts.length + lowStockProducts.length,
            badgeColor: 'bg-rose-500 text-white',
          },
          {
            id: 'announcements',
            label: 'Annonces',
            icon: Megaphone,
            badge: announcements.filter((a) => a.isActive).length > 0 ? '•' : 0,
            badgeColor: 'bg-amber-400 text-slate-950',
          },
          {
            id: 'metrics',
            label: 'Finances',
            icon: TrendingUp,
          },
          {
            id: 'settings',
            label: 'Réglages',
            icon: Settings,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive
                  ? isDarkMode
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? (isDarkMode ? 'text-slate-950' : 'text-amber-600') : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {Boolean(tab.badge) && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight shrink-0 ${
                    tab.badgeColor || 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. COMMANDES TAB (VALIDATIONS CLIENTS & VIREMENTS VENDEURS) */}
      {/* ======================================================== */}
      {subTab === 'escrow' && (
        <div className="space-y-3">
          {/* Header explanation notice */}
          <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-2xl p-3.5 space-y-1.5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                Compte Central Administrateur
              </span>
              <span className="font-mono bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[11px]">
                97470831
              </span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              Supervisez les paiements clients (My Nita, Amana Ta, Airtel Money, Al Izza, Espèces), vérifiez les captures de transferts et confirmez le déblocage des gains aux vendeurs.
            </p>
          </div>

          {/* SECTION A: PENDING CUSTOMER PAYMENTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                1. Paiements Clients à Valider ({ordersPendingPaymentValidation.length})
              </span>

              {ordersPendingPaymentValidation.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    batchValidatePayments(ordersPendingPaymentValidation.map((o) => o.id))
                  }
                  className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Tout valider ({ordersPendingPaymentValidation.length})</span>
                </button>
              )}
            </div>

            {ordersPendingPaymentValidation.length === 0 ? (
              <div
                className={`rounded-2xl border p-4 text-center text-xs text-slate-400 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                Aucun paiement client en attente de validation.
              </div>
            ) : (
              <div className="space-y-2">
                {ordersPendingPaymentValidation.map((order) => (
                  <div
                    key={order.id}
                    className={`rounded-2xl border-2 p-3 space-y-2.5 shadow-sm ${
                      isDarkMode
                        ? 'bg-slate-900 border-amber-500/40 text-slate-100'
                        : 'bg-white border-amber-300 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs">
                            {order.orderNumber}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-bold rounded">
                            {order.deliveryMethod.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Client : <strong>{order.customer.fullName}</strong> ({order.customer.phone})
                        </p>
                        <p className="text-[10px] text-amber-400 font-bold">
                          Boutique : {order.shopName || 'Boutique Partenaire'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-xs sm:text-sm block text-amber-400">
                          {order.total.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Réf: {order.paymentReference}
                        </span>
                      </div>
                    </div>

                    {/* Direct Contact Buttons (Client) */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <a
                        href={getWhatsAppClientUrl(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp Client</span>
                      </a>

                      <a
                        href={`tel:${order.customer.phone}`}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Appeler</span>
                      </a>
                    </div>

                    {/* Screenshot thumbnail */}
                    {order.paymentProofImage && (
                      <div
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={order.paymentProofImage}
                            alt="Reçu"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold block truncate">
                              Capture du transfert reçu
                            </span>
                            <span className="text-[9px] text-amber-400 font-mono">
                              Vers le compte 97470831
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProofToZoom({
                              title: `Capture Paiement Client - ${order.orderNumber}`,
                              subtitle: `Montant : ${order.total.toLocaleString('fr-FR')} FCFA vers 97470831`,
                              url: order.paymentProofImage!,
                              action: () => adminValidateCustomerPayment(order.id),
                              actionLabel: 'Valider le Paiement Client',
                            })
                          }
                          className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir Capture</span>
                        </button>
                      </div>
                    )}

                    {/* 1-Click Action Button */}
                    <button
                      type="button"
                      onClick={() => adminValidateCustomerPayment(order.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valider la Réception du Paiement</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION B: PENDING VENDOR DELIVERY PROOFS (FUNDS RELEASE) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                2. Preuves de Remise Reçues & Déblocage des Gains ({ordersPendingFundsRelease.length})
              </span>

              {ordersPendingFundsRelease.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    batchReleaseFunds(ordersPendingFundsRelease.map((o) => o.id))
                  }
                  className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Tout libérer ({ordersPendingFundsRelease.length})</span>
                </button>
              )}
            </div>

            {ordersPendingFundsRelease.length === 0 ? (
              <div
                className={`rounded-2xl border p-4 text-center text-xs text-slate-400 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                Aucune preuve de remise en attente de libération.
              </div>
            ) : (
              <div className="space-y-2.5">
                {ordersPendingFundsRelease.map((order) => {
                  const matchingShop = shops.find(
                    (s) => s.id === order.shopId || s.name === order.shopName
                  );
                  const vendorPhone = matchingShop?.phone || '97470831';
                  const vendorOwner = matchingShop?.ownerName || order.shopName || 'Propriétaire Boutique';

                  return (
                    <div
                      key={order.id}
                      className={`rounded-2xl border-2 p-3.5 space-y-3 shadow-md relative ${
                        isDarkMode
                          ? 'bg-slate-900 border-blue-500/50 text-slate-100'
                          : 'bg-white border-blue-400 text-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs">
                              {order.orderNumber}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded-full animate-pulse">
                              🔔 Colis Remis au Client
                            </span>
                          </div>
                          <p className="text-xs font-bold mt-1">
                            Boutique : <span className="text-amber-400">{order.shopName || 'Vendeur Partenaire'}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Gérant : <strong>{vendorOwner}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Client : {order.customer.fullName} ({order.customer.phone} - {order.customer.city})
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-blue-400 text-sm sm:text-base block">
                            {order.total.toLocaleString('fr-FR')} FCFA
                          </span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 block mt-0.5">
                            À envoyer au vendeur
                          </span>
                        </div>
                      </div>

                      {/* Vendor Contact & Payment Number Strip */}
                      <div
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-amber-50/70 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-[11px] truncate">
                            N° Vendeur : <strong className="font-mono text-amber-400">{vendorPhone}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(vendorPhone);
                              showToast('Numéro copié !', 'success', vendorPhone);
                            }}
                            className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            title="Copier le numéro"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copier</span>
                          </button>

                          <a
                            href={getWhatsAppVendorUrl(order, vendorPhone)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${vendorPhone}`}
                            className="p-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Appeler</span>
                          </a>
                        </div>
                      </div>

                      {/* Delivery Photo thumbnail */}
                      {order.vendorDeliveryProofImage && (
                        <div
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            isDarkMode ? 'bg-slate-950 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={order.vendorDeliveryProofImage}
                              alt="Preuve de remise"
                              className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-blue-500/40"
                            />
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold text-blue-300 block truncate">
                                Preuve photo de remise reçue
                              </span>
                              <span className="text-[9px] text-slate-400 italic line-clamp-1">
                                "{order.vendorHandoverNote || 'Colis remis au client avec succès'}"
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProofToZoom({
                                title: `Photo de Remise - Commande ${order.orderNumber}`,
                                subtitle: `Boutique : ${order.shopName} • Montant à envoyer : ${order.total.toLocaleString('fr-FR')} FCFA (${vendorPhone})`,
                                url: order.vendorDeliveryProofImage!,
                                action: () => adminReleaseFundsToVendor(order.id),
                                actionLabel: `Confirmer le Transfert de ${order.total.toLocaleString('fr-FR')} FCFA au Vendeur`,
                              })
                            }
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Examiner Photo</span>
                          </button>
                        </div>
                      )}

                      {/* 1-Click Release Button */}
                      <button
                        type="button"
                        onClick={() => adminReleaseFundsToVendor(order.id)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Confirmer le Transfert d'Argent & Libérer ({order.total.toLocaleString('fr-FR')} FCFA)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION C: ORDERS CURRENTLY BEING PREPARED */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-0.5">
              Commandes Validées & En Préparation ({ordersInEscrow.length})
            </span>

            {ordersInEscrow.length > 0 && (
              <div className="space-y-1.5">
                {ordersInEscrow.map((order) => (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-2.5 flex items-center justify-between text-xs ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {order.shopName} • Client: {order.customer.fullName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400">
                        {order.total.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-[9px] text-slate-400 block">En attente remise vendeur</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SHOPS TAB (ABONNEMENTS 1 000 FCFA AU 97470831)        */}
      {/* ======================================================== */}
      {subTab === 'shops' && (
        <div className="space-y-3">
          {/* Instructions banner */}
          <div
            className={`rounded-2xl p-3 text-xs space-y-1 border ${
              isDarkMode
                ? 'bg-slate-900 border-amber-500/20 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                Gestion & Abonnements Boutiques (1 500 F/mois)
              </span>
              <span className="font-mono bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                Compte : 97470831
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Contrôlez les demandes, activez ou supprimez les boutiques en 1 clic.
            </p>
          </div>

          {/* Admin Shop Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={shopSearchQuery}
                onChange={(e) => setShopSearchQuery(e.target.value)}
                placeholder="Rechercher une boutique par nom, gérant, ville, téléphone..."
                className={`w-full text-xs pl-8 pr-8 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              {shopSearchQuery && (
                <button
                  type="button"
                  onClick={() => setShopSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Shop Status Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setShopStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  shopStatusFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Toutes ({shops.length})
              </button>
              <button
                type="button"
                onClick={() => setShopStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  shopStatusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                En Attente ({pendingShops.length})
              </button>
              <button
                type="button"
                onClick={() => setShopStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  shopStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Actives ({approvedShops.length})
              </button>
              <button
                type="button"
                onClick={() => setShopStatusFilter('rejected')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  shopStatusFilter === 'rejected'
                    ? 'bg-rose-600 text-white font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Refusées ({shops.filter((s) => s.status === 'refusee').length})
              </button>
            </div>
          </div>

          {/* Filtered Shops Rendering */}
          {(() => {
            const filteredAdminShops = shops.filter((s) => {
              if (shopStatusFilter === 'pending' && s.status !== 'en_attente') return false;
              if (shopStatusFilter === 'active' && s.status !== 'approuvee') return false;
              if (shopStatusFilter === 'rejected' && s.status !== 'refusee') return false;

              const q = shopSearchQuery.trim().toLowerCase();
              if (!q) return true;
              return (
                s.name.toLowerCase().includes(q) ||
                s.ownerName.toLowerCase().includes(q) ||
                s.phone.includes(q) ||
                s.city.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
              );
            });

            if (filteredAdminShops.length === 0) {
              return (
                <div
                  className={`rounded-2xl border p-6 text-center text-xs text-slate-400 space-y-2 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <Store className="w-8 h-8 text-slate-500 mx-auto" />
                  <p>Aucune boutique trouvée avec ces critères.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredAdminShops.map((shop) => {
                  const shopProductsCount = products.filter((p) => p.shopId === shop.id || p.shopName === shop.name).length;
                  const isPending = shop.status === 'en_attente';
                  const isApproved = shop.status === 'approuvee';
                  const isRejected = shop.status === 'refusee';

                  return (
                    <div
                      key={shop.id}
                      className={`rounded-2xl border p-3.5 space-y-3 shadow-xs relative transition-all ${
                        isPending
                          ? 'border-2 border-amber-500/50 bg-slate-900'
                          : isDarkMode
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Top Bar: Status Badge and Delete Shop Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <img
                            src={shop.logoUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black truncate">
                                {shop.name}
                              </h4>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  isPending
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    : isApproved
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                }`}
                              >
                                {isPending ? 'En Attente' : isApproved ? 'Active (30J)' : 'Refusée'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 font-medium">
                              Gérant : <strong>{shop.ownerName}</strong> • {shop.city}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {shop.phone}
                              <span className="text-amber-400 ml-1">• {shopProductsCount} article(s)</span>
                            </p>
                          </div>
                        </div>

                        {/* Direct Delete Shop Button */}
                        <button
                          type="button"
                          onClick={() => {
                            deleteShop(shop.id);
                            showToast('Boutique supprimée', 'info', `La boutique "${shop.name}" a été retirée.`);
                          }}
                          className="p-1.5 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all active:scale-95 shrink-0"
                          title="Supprimer définitivement cette boutique"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Payment Screenshot (if pending or available) */}
                      {shop.paymentProofImage && (
                        <div
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={shop.paymentProofImage}
                              alt="Capture de paiement"
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                            />
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block truncate">
                                Reçu 1 500 FCFA (97470831)
                              </span>
                              <span className="text-[9px] text-slate-400">
                                Transfert Mobile Money
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProofToZoom({
                                title: `Reçu d'Abonnement - ${shop.name}`,
                                subtitle: `1 500 FCFA vers 97470831 par ${shop.ownerName} (${shop.phone})`,
                                url: shop.paymentProofImage!,
                                action: isPending ? () => approveShop(shop.id) : undefined,
                                actionLabel: isPending ? 'Valider et Ouvrir la Boutique' : undefined,
                              })
                            }
                            className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir le Reçu</span>
                          </button>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="space-y-2 pt-1 border-t border-slate-800/40">
                        {isPending && (
                          <>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => approveShop(shop.id)}
                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Valider Paiement & Activer Boutique (30J)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => rejectShop(shop.id, 'Paiement non reçu sur le compte 97470831.')}
                                className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 transition-colors"
                              >
                                Refuser
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                              <span className="text-[10px] text-slate-400">
                                Contact créateur : <strong className="text-amber-400">{shop.ownerName}</strong>
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const wa = encodeURIComponent(
                                      `Bonjour ${shop.ownerName}, je suis Abdourahmen (Administrateur Golden Bee Store). J'ai bien reçu votre demande d'ouverture pour la boutique "${shop.name}".`
                                    );
                                    window.open(`https://wa.me/227${shop.phone.replace(/[^0-9]/g, '')}?text=${wa}`, '_blank');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>

                                <a
                                  href={`tel:${shop.phone.replace(/[^0-9]/g, '')}`}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10.5px] font-bold rounded-lg flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Appeler</span>
                                </a>
                              </div>
                            </div>
                          </>
                        )}

                        {isApproved && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Visible aux clients & acheteurs
                            </span>

                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${shop.phone}`}
                                className="px-2 py-1 bg-slate-800 text-slate-200 hover:text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Appeler</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteShop(shop.id);
                                  showToast('Boutique supprimée', 'info', `La boutique "${shop.name}" a été supprimée.`);
                                }}
                                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold rounded-lg flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isRejected && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-rose-400 font-semibold">
                              Boutique refusée / inactive
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => approveShop(shop.id)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg"
                              >
                                Réactiver
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteShop(shop.id);
                                  showToast('Boutique supprimée', 'info', `La boutique "${shop.name}" a été supprimée.`);
                                }}
                                className="px-2 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-lg"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2.5 PARRAINAGES & AFFILIATIONS TAB                       */}
      {/* ======================================================== */}
      {subTab === 'referrals' && (
        <div className="space-y-4">
          {/* Header Overview Card */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white rounded-2xl p-4 space-y-2 border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-300">
                    CENTRE DE CONTRÔLE DES PARRAINAGES
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    Traçabilité en direct : Qui a partagé le lien & qui a créé la boutique
                  </p>
                </div>
              </div>

              {adminNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAdminNotifications}
                  className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition-all"
                >
                  Effacer l'historique
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Boutiques Parrainées</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                  {adminNotifications.filter((n) => n.type === 'referral_shop_created').length}
                </span>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Primes Distribuées</span>
                <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                  {(
                    shops.reduce((sum, s) => sum + (s.referralEarnings || 0), 0)
                  ).toLocaleString('fr-FR')}{' '}
                  <span className="text-[9px]">F</span>
                </span>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Parrains Actifs</span>
                <span className="text-sm sm:text-base font-black text-white font-mono">
                  {shops.filter((s) => (s.referralsCount || 0) > 0).length}
                </span>
              </div>
            </div>
          </div>

          {/* REAL-TIME REFERRAL NOTIFICATIONS FEED */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Alertes Parrainages & Créations Récentes
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {adminNotifications.length} notification(s)
              </span>
            </div>

            {adminNotifications.length === 0 ? (
              <div
                className={`p-6 text-center rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Gift className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                <p className="text-xs font-bold">Aucune alerte de parrainage pour le moment</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Dès qu'un utilisateur ou un vendeur partage son lien de parrainage et qu'une boutique est créée avec, vous recevrez l'alerte immédiate ici avec le nom du parrain et du nouveau créateur.
                </p>
              </div>
            ) : (
              adminNotifications.map((notif) => {
                const isReferral = notif.type === 'referral_shop_created';
                const cleanSponsorPhone = notif.sponsorPhone ? notif.sponsorPhone.replace(/[^0-9]/g, '') : '';
                const cleanNewShopPhone = notif.newShopPhone ? notif.newShopPhone.replace(/[^0-9]/g, '') : '';

                const handleContactSponsorWhatsApp = () => {
                  if (!cleanSponsorPhone) return;
                  const message = encodeURIComponent(
                    `Bonjour ${notif.sponsorName || 'Parrain'},\n\nFélicitations ! Votre parrainage sur Bee_store Niger a été validé avec succès 🎉.\n\nUne nouvelle boutique "${notif.newShopName}" vient d'être créée grâce à votre lien / code de parrainage (${notif.sponsorReferralCode || ''}).\n\nVotre prime de 500 FCFA a été créditée sur votre compte Bee_store.\n\nMerci de votre fidélité !`
                  );
                  window.open(
                    `https://wa.me/${cleanSponsorPhone.length <= 8 ? '227' + cleanSponsorPhone : cleanSponsorPhone}?text=${message}`,
                    '_blank'
                  );
                };

                const handleContactNewShopWhatsApp = () => {
                  if (!cleanNewShopPhone) return;
                  const message = encodeURIComponent(
                    `Bonjour ${notif.newOwnerName || 'Gérant'},\n\nBienvenue sur Bee_store Niger 🐝 ! Nous avons bien reçu votre demande d'ouverture pour la boutique "${notif.newShopName}" via le parrainage de ${notif.sponsorName || 'votre parrain'}.\n\nVotre compte est en cours d'activation par l'administrateur (Abdourahmen - 97470831). À très bientôt !`
                  );
                  window.open(
                    `https://wa.me/${cleanNewShopPhone.length <= 8 ? '227' + cleanNewShopPhone : cleanNewShopPhone}?text=${message}`,
                    '_blank'
                  );
                };

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !notif.read
                        ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            isReferral ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {isReferral ? <Gift className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full animate-pulse">
                                NOUVEAU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {notif.bonusAmount && (
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/30">
                            +{notif.bonusAmount} FCFA
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown of Parrain & Filleul */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-[11px]">
                      {/* Sponsor info */}
                      {notif.sponsorName && (
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase">
                            <span>👤 Parrain (A partagé le lien)</span>
                            {notif.sponsorReferralCode && (
                              <span className="font-mono bg-emerald-500/20 px-1 py-0.2 rounded text-emerald-300">
                                {notif.sponsorReferralCode}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-200">{notif.sponsorName}</p>
                          <p className="text-slate-400 text-[10px]">
                            Tél : <strong>{notif.sponsorPhone || 'Non renseigné'}</strong>
                            {notif.sponsorShopName && ` • Boutique : ${notif.sponsorShopName}`}
                          </p>
                          {notif.sponsorPhone && (
                            <button
                              type="button"
                              onClick={handleContactSponsorWhatsApp}
                              className="mt-1 w-full py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-400" />
                              <span>WhatsApp Parrain (+500 F)</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* New Shop info */}
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase">
                          <span>🏪 Nouvelle Boutique Créée</span>
                          <span className="text-[9px] text-slate-400">1 500 F payé</span>
                        </div>
                        <p className="font-bold text-slate-200">
                          {notif.newShopName}{' '}
                          <span className="text-[10px] font-normal text-slate-400">
                            ({notif.newOwnerName})
                          </span>
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          Tél : <strong>{notif.newShopPhone || 'Non renseigné'}</strong> • {notif.newShopCity || 'Niger'}
                        </p>
                        {notif.newShopPhone && (
                          <button
                            type="button"
                            onClick={handleContactNewShopWhatsApp}
                            className="mt-1 w-full py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all"
                          >
                            <MessageCircle className="w-3 h-3 text-amber-400" />
                            <span>WhatsApp Nouvelle Boutique</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mark as read button */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-400">
                        {notif.read ? '✓ Traité' : '● En attente de traitement'}
                      </span>
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => markAdminNotificationAsRead(notif.id)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition-all"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SPONSOR SHOPS LEADERBOARD & REWARD VALIDATION */}
          <div
            className={`p-4 rounded-2xl border space-y-3 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Classement des Parrains & Paiement des Primes
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Boutiques et membres actifs ayant généré des affiliations (500 F / parrainage)
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {shops.filter((s) => (s.referralsCount || 0) > 0).length} parrain(s)
              </span>
            </div>

            {/* List of Sponsor Shops */}
            <div className="space-y-2">
              {shops.filter((s) => (s.referralsCount || 0) > 0).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Gift className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                  Aucune prime de parrainage cumulée pour le moment.
                </div>
              ) : (
                shops
                  .filter((s) => (s.referralsCount || 0) > 0)
                  .sort((a, b) => (b.referralsCount || 0) - (a.referralsCount || 0))
                  .map((sponsor) => {
                    const count = sponsor.referralsCount || 1;
                    const bonusTotal = sponsor.referralEarnings || count * (platformSettings?.referralBonus || 500);

                    const handleSendConfirmationWhatsApp = () => {
                      const cleanPhone = sponsor.phone.replace(/[^0-9]/g, '');
                      const message = encodeURIComponent(
                        `Bonjour ${sponsor.ownerName} (${sponsor.name}), votre prime de parrainage Bee_store d'un montant de ${bonusTotal.toLocaleString(
                          'fr-FR'
                        )} FCFA (${count} boutique(s) parrainée(s)) a été validée et envoyée via My Nita / Amana Ta ! Félicitations.`
                      );
                      window.open(
                        `https://wa.me/${cleanPhone.length <= 8 ? '227' + cleanPhone : cleanPhone}?text=${message}`,
                        '_blank'
                      );
                    };

                    return (
                      <div
                        key={sponsor.id}
                        className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {sponsor.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-500 rounded font-bold">
                              Code : {sponsor.referralCode || `BEE-${sponsor.phone.slice(-4)}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Gérant : <strong>{sponsor.ownerName}</strong> ({sponsor.phone}) • {sponsor.city}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {count} filleul(s) • Total Prime : {bonusTotal.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => payReferralBonus(sponsor.id, bonusTotal)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all"
                            title="Valider le transfert de prime"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Valider Prime</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSendConfirmationWhatsApp}
                            className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-colors"
                            title="Notifier sur WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. STOCK INLINE FAST CONTROL TAB                          */}
      {/* ======================================================== */}
      {subTab === 'stock' && (
        <div className="space-y-3">
          {/* Quick Filters and Bulk Restock */}
          <div className="flex flex-col gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer par nom de produit ou boutique..."
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    stockFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Tous ({products.length})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    stockFilter === 'low'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Faibles ({lowStockProducts.length})
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    stockFilter === 'out'
                      ? 'bg-rose-500 text-white font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Ruptures ({outOfStockProducts.length})
                </button>
              </div>

              <button
                onClick={() => batchRestockProducts(20)}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg"
              >
                +20 aux alertes
              </button>
            </div>
          </div>

          {/* Product Stock List */}
          <div className="space-y-2">
            {filteredProducts.map((p) => {
              const isOut = p.stock === 0;
              const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-2.5 flex items-center justify-between gap-2 shadow-xs transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={p.image}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate max-w-[130px]">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[9px]">
                        {p.shopName && (
                          <span className="text-amber-400 font-bold truncate max-w-[80px]">
                            🏪 {p.shopName}
                          </span>
                        )}
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded-full ${
                            isOut
                              ? 'bg-rose-500/20 text-rose-400'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isOut ? 'Rupture (0)' : isLow ? `Bas (${p.stock})` : `${p.stock} dispo`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Inline Adjustment Controls & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateStock(p.id, p.stock - 1)}
                      disabled={p.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-30"
                      title="Diminuer de 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    {editingStockId === p.id ? (
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={inlineStockValue}
                        onChange={(e) => setInlineStockValue(Number(e.target.value))}
                        onBlur={() => {
                          updateStock(p.id, inlineStockValue);
                          setEditingStockId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateStock(p.id, inlineStockValue);
                            setEditingStockId(null);
                          }
                        }}
                        className="w-10 text-center text-xs font-mono font-black py-1 bg-slate-950 text-amber-400 border border-amber-500 rounded"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingStockId(p.id);
                          setInlineStockValue(p.stock);
                        }}
                        className="w-7 text-center text-xs font-mono font-black cursor-pointer hover:text-amber-400"
                        title="Cliquer pour taper directement"
                      >
                        {p.stock}
                      </span>
                    )}

                    <button
                      onClick={() => updateStock(p.id, p.stock + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                      title="Ajouter 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => updateStock(p.id, p.stock + 10)}
                      className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black"
                      title="Ajouter 10"
                    >
                      +10
                    </button>

                    <button
                      onClick={() => {
                        deleteProduct(p.id);
                        showToast('Article supprimé', 'info', `L'article "${p.name}" a été retiré.`);
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg ml-0.5"
                      title="Supprimer cet article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PRODUCTS CRUD TAB                                     */}
      {/* ======================================================== */}
      {subTab === 'products' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-slate-400">
              {products.length} articles au catalogue Bee_store :
            </span>

            <button
              onClick={onAddNewProduct}
              className="text-[10px] text-amber-400 font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" />
              <span>Nouveau Produit</span>
            </button>
          </div>

          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-2.5 flex items-center justify-between gap-2 shadow-xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.image}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate max-w-[150px]">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-mono font-bold text-amber-400">
                        {p.price.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-slate-500">
                        • {p.shopName ? `🏪 ${p.shopName}` : 'Bee_store'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditProduct(p)}
                    className="p-1.5 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteProduct(p.id);
                      showToast('Article supprimé', 'info', `L'article "${p.name}" a été retiré.`);
                    }}
                    className="p-1.5 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FINANCES & METRICS TAB                                */}
      {/* ======================================================== */}
      {subTab === 'metrics' && (
        <div className="space-y-3">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-4 space-y-2 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Chiffre d'Affaires Global (97470831)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-black">
                Compte Principal
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {totalRevenue.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-bold text-amber-400">FCFA</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Total cumulé sur {orders.length} commande(s) et {approvedShops.length} boutique(s) active(s)
            </p>
          </div>

          {/* 4 Financial Grid Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => setSubTab('escrow')}
              className={`p-3 rounded-2xl border shadow-xs space-y-1 cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  : 'bg-white border-slate-200 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Commandes Actives</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-base font-black font-mono text-amber-400">
                {ordersInEscrow.reduce((sum, o) => sum + o.total, 0).toLocaleString('fr-FR')}{' '}
                <span className="text-[10px]">F</span>
              </div>
              <span className="text-[9px] text-slate-400 block">{ordersInEscrow.length} commande(s) en cours</span>
            </div>

            <div
              onClick={() => setSubTab('shops')}
              className={`p-3 rounded-2xl border shadow-xs space-y-1 cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  : 'bg-white border-slate-200 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gains Abonnements</span>
                <Store className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-base font-black font-mono text-emerald-400">
                {(approvedShops.length * (platformSettings?.monthlyShopFee || 1500)).toLocaleString('fr-FR')}{' '}
                <span className="text-[10px]">F</span>
              </div>
              <span className="text-[9px] text-slate-400 block">
                {approvedShops.length} boutique(s) x {(platformSettings?.monthlyShopFee || 1500).toLocaleString('fr-FR')} F/mois
              </span>
            </div>
          </div>

          {/* 📊 Visual Analytics & Performance Breakdown */}
          <div
            className={`p-4 rounded-2xl border space-y-3.5 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Répartition des Ventes par Moyen de Paiement
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Temps réel</span>
            </div>

            {/* Payment Method Bars */}
            <div className="space-y-2.5">
              {[
                {
                  method: 'my_nita',
                  label: 'My Nita (97470831)',
                  color: 'bg-amber-500',
                  textColor: 'text-amber-500',
                },
                {
                  method: 'amana_ta',
                  label: 'Amana Ta Transfert',
                  color: 'bg-emerald-500',
                  textColor: 'text-emerald-500',
                },
                {
                  method: 'airtel_money',
                  label: 'Airtel Money Niger',
                  color: 'bg-rose-500',
                  textColor: 'text-rose-500',
                },
                {
                  method: 'al_izza',
                  label: 'Al Izza Transfert',
                  color: 'bg-sky-500',
                  textColor: 'text-sky-500',
                },
                {
                  method: 'cash_on_delivery',
                  label: 'Espèces à la livraison',
                  color: 'bg-purple-500',
                  textColor: 'text-purple-500',
                },
              ].map((item) => {
                const methodOrders = orders.filter((o) => o.paymentMethod === item.method);
                const methodTotal = methodOrders.reduce((sum, o) => sum + o.total, 0);
                const pct = totalRevenue > 0 ? Math.round((methodTotal / totalRevenue) * 100) : 0;

                return (
                  <div key={item.method} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.label} ({methodOrders.length})
                      </span>
                      <span className={`font-mono font-bold ${item.textColor}`}>
                        {methodTotal.toLocaleString('fr-FR')} F ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(pct, methodOrders.length > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🏪 Top Boutique Performance Table */}
          <div
            className={`p-4 rounded-2xl border space-y-3 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-500" />
                Performance des Boutiques Partenaires
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {approvedShops.length} active(s)
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {approvedShops.slice(0, 5).map((shop, idx) => {
                const shopOrdersCount = orders.filter(
                  (o) => o.shopId === shop.id || o.shopName?.toLowerCase() === shop.name.toLowerCase()
                ).length;
                const shopProdsCount = products.filter(
                  (p) => p.shopId === shop.id || p.shopName?.toLowerCase() === shop.name.toLowerCase()
                ).length;

                return (
                  <div key={shop.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 font-black text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {shop.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {shop.city} • {shopProdsCount} article(s)
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-500 font-mono block">
                        {shopOrdersCount} commande(s)
                      </span>
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        Abonnement Actif
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. PLATFORM SETTINGS & REFERRAL ADMIN TAB                */}
      {/* ======================================================== */}
      {subTab === 'settings' && (
        <div className="space-y-4">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-900 text-white rounded-2xl p-4 space-y-2 border border-amber-500/30 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4" />
                Paramétrage Général de la Plateforme
              </span>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                Mode Administrateur
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Configurez le tarif d'abonnement des boutiques (1 500 F/mois), la prime de parrainage (500 F/boutique) et les modes de règlement My Nita & Amana Ta.
            </p>
          </div>

          {/* Form Card */}
          <div
            className={`p-4 rounded-2xl border space-y-4 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-500" />
              1. Tarifs & Comptes Officiels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Monthly Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Abonnement mensuel par Boutique (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settingsFeeInput}
                    onChange={(e) => setSettingsFeeInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">FCFA</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Actuellement configuré à 1 500 FCFA / mois.</p>
              </div>

              {/* Referral Bonus */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prime de Parrainage par Boutique (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settingsBonusInput}
                    onChange={(e) => setSettingsBonusInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">FCFA</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Gain versé au parrain (500 FCFA par boutique invitée).</p>
              </div>

              {/* Central Admin Account */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Numéro de Compte Central Récepteur (My Nita / Amana Ta)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settingsAccountInput}
                    onChange={(e) => setSettingsAccountInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-black text-amber-500 tracking-wider outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Compte affiché aux vendeurs et clients pour les paiements officiels (97470831).
                </p>
              </div>
            </div>

            {/* Payment Methods Toggles */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Modes de règlement activés sur l'application :
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'myNita', label: '📲 My Nita (Officiel)', desc: 'Paiement compte 97470831' },
                  { key: 'amanaTa', label: '💳 Amana Ta (Express)', desc: 'Transfert d’argent rapide' },
                  { key: 'airtelMoney', label: '📱 Airtel Money Niger', desc: 'Mobile Money' },
                  { key: 'alIzza', label: '🏛️ Al Izza Transfert', desc: 'Guichet & Agence' },
                  { key: 'cashDelivery', label: '💵 Paiement à la livraison', desc: 'Espèces direct vendeur' },
                ].map((item) => {
                  const isChecked = (settingsMethods as any)[item.key] ?? true;
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setSettingsMethods({
                          ...settingsMethods,
                          [item.key]: !isChecked,
                        })
                      }
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-4 h-4 accent-amber-500 pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  await updatePlatformSettings({
                    monthlyShopFee: settingsFeeInput,
                    referralBonus: settingsBonusInput,
                    adminPaymentAccount: settingsAccountInput,
                    acceptedPaymentMethods: settingsMethods,
                  });
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Nouveaux Paramètres</span>
              </button>
            </div>
          </div>

          {/* Referral Payouts Management Card */}
          <div
            className={`p-4 rounded-2xl border space-y-3.5 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Gestion des Primes de Parrainage
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Boutiques ayant parrainé d'autres commerçants (500 F / filleul)
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {shops.filter((s) => (s.referralsCount || 0) > 0).length} parrain(s)
              </span>
            </div>

            {/* List of Sponsor Shops */}
            <div className="space-y-2">
              {shops.filter((s) => (s.referralsCount || 0) > 0).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Gift className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                  Aucune prime de parrainage en attente pour le moment.
                </div>
              ) : (
                shops
                  .filter((s) => (s.referralsCount || 0) > 0)
                  .map((sponsor) => {
                    const count = sponsor.referralsCount || 1;
                    const bonusTotal = sponsor.referralEarnings || count * (platformSettings?.referralBonus || 500);

                    const handleSendConfirmationWhatsApp = () => {
                      const cleanPhone = sponsor.phone.replace(/[^0-9]/g, '');
                      const message = encodeURIComponent(
                        `Bonjour ${sponsor.ownerName} (${sponsor.name}), votre prime de parrainage Bee_store d'un montant de ${bonusTotal.toLocaleString(
                          'fr-FR'
                        )} FCFA (${count} boutique(s) parrainée(s)) a été validée et envoyée via My Nita / Amana Ta ! Félicitations.`
                      );
                      window.open(
                        `https://wa.me/${cleanPhone.length <= 8 ? '227' + cleanPhone : cleanPhone}?text=${message}`,
                        '_blank'
                      );
                    };

                    return (
                      <div
                        key={sponsor.id}
                        className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {sponsor.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-500 rounded">
                              Code : {sponsor.referralCode || `BEE-${sponsor.phone.slice(-4)}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Gérant : <strong>{sponsor.ownerName}</strong> ({sponsor.phone}) • {sponsor.city}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {count} filleul(s) • Total Prime : {bonusTotal.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => payReferralBonus(sponsor.id, bonusTotal)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all"
                            title="Valider le transfert de prime"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Valider Prime</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSendConfirmationWhatsApp}
                            className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-colors"
                            title="Notifier sur WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7.5 DISCUSSIONS & MESSAGES PV TAB                       */}
      {/* ======================================================== */}
      {subTab === 'messages' && <AdminMessagesTab />}

      {/* ======================================================== */}
      {/* 8. PETITES ANNONCES TAB                                  */}
      {/* ======================================================== */}
      {subTab === 'announcements' && <AdminAnnouncementsTab />}

      {/* PROOF ZOOM MODAL */}
      {selectedProofToZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-white">
              <div>
                <h4 className="text-xs sm:text-sm font-bold">{selectedProofToZoom.title}</h4>
                <p className="text-[10px] text-amber-300">{selectedProofToZoom.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedProofToZoom(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[60vh] flex items-center justify-center p-1">
              <img
                src={selectedProofToZoom.url}
                alt="Zoom Preuve"
                className="w-full h-auto max-h-[55vh] object-contain rounded-xl"
              />
            </div>

            {selectedProofToZoom.action && (
              <button
                type="button"
                onClick={() => {
                  selectedProofToZoom.action?.();
                  setSelectedProofToZoom(null);
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                {selectedProofToZoom.actionLabel || 'Valider'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
