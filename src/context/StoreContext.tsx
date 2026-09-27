import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Product,
  CartItem,
  Order,
  DeliveryMethod,
  DeliveryAddress,
  PaymentMethod,
  OrderStatus,
  ActiveTab,
  AdminSubTab,
  Shop,
  ShopStatus,
  ProductReview,
  VendorNotification,
  AdminNotification,
  SponsorNotification,
  PlatformSettings,
  Coupon,
  AppUser,
  ChatMessage,
  Conversation,
  AppNotification,
  Announcement,
  AnnouncementCategory,
  NotificationType,
} from '../types';
import { INITIAL_PRODUCTS, DELIVERY_METHODS, DEMO_PRODUCT_IDS } from '../data/initialProducts';
import { INITIAL_ORDERS } from '../data/initialOrders';
import { INITIAL_SHOPS } from '../data/initialShops';
import { INITIAL_REVIEWS } from '../data/initialReviews';
import { INITIAL_COUPONS } from '../data/initialCoupons';
import { INITIAL_USERS } from '../data/initialUsers';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  isMessageExpired,
  getExpirationDate,
  SEVEN_DAYS_MS,
} from '../data/initialConversations';
import { playNotificationSound } from '../utils/audio';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationChime,
  vibrateDevice,
  dispatchBrowserNotification,
  getOrderStatusDetails,
} from '../utils/notificationUtils';

interface ToastInfo {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  subMessage?: string;
}

interface StoreContextType {
  // Navigation & Tab state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  adminSubTab: AdminSubTab;
  setAdminSubTab: (subTab: AdminSubTab) => void;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;

  // Customer Reviews & Ratings
  reviews: ProductReview[];
  addReview: (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => Promise<void>;

  // Shops & Multi-vendor Subscription (1000 FCFA / month to 97470831)
  shops: Shop[];
  isLoadingShops: boolean;
  selectedShopFilter: string | null;
  setSelectedShopFilter: (shopId: string | null) => void;
  currentVendorShop: Shop | null;
  setCurrentVendorShop: (shop: Shop | null) => void;
  isCreateShopModalOpen: boolean;
  setIsCreateShopModalOpen: (open: boolean) => void;
  initialReferralCode: string;
  setInitialReferralCode: (code: string) => void;
  openCreateShopWithReferral: (code?: string) => void;
  isReferralModalOpen: boolean;
  setIsReferralModalOpen: (open: boolean) => void;
  requestShopCreation: (
    shopData: Omit<Shop, 'id' | 'createdAt' | 'status' | 'subscriptionFee' | 'paymentAccountTarget'>
  ) => Promise<Shop>;
  approveShop: (shopId: string, adminNote?: string) => Promise<void>;
  rejectShop: (shopId: string, reason: string) => Promise<void>;
  updateShopProfile: (shopId: string, updates: Partial<Shop>) => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
  renewShopSubscription: (shopId: string, newProofImage: string, transactionRef?: string) => Promise<void>;
  loginVendorShop: (phone: string, pinCode: string) => Shop | null;
  adminSendShopPVMessage: (shopId: string, text: string, decisionType?: 'approuvee' | 'refusee' | 'note' | 'rappel') => Promise<void>;
  sendOfficialAdminPV: (shopId: string, decisionType: 'approuvee' | 'refusee' | 'note' | 'rappel', messageText: string, adminNote?: string) => Promise<void>;

  // Vendor Notifications (Real-time orders alert for shop owners)
  vendorNotifications: VendorNotification[];
  markVendorNotificationAsRead: (notifId: string) => Promise<void>;
  clearVendorNotifications: (shopId: string) => Promise<void>;

  // Admin Notifications (Real-time referral alerts, new shops & escrow requests)
  adminNotifications: AdminNotification[];
  markAdminNotificationAsRead: (notifId: string) => Promise<void>;
  clearAdminNotifications: () => Promise<void>;

  // Sponsor Notifications (Real-time referral alerts sent to sponsors)
  sponsorNotifications: SponsorNotification[];
  markSponsorNotificationAsRead: (notifId: string) => Promise<void>;
  clearSponsorNotifications: (referralCodeOrPhone?: string) => Promise<void>;

  // Cart & Individual Item Selection / Checkout
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string,
    customAnswers?: Record<string, string>
  ) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedCartItemIds: string[];
  toggleCartItemSelection: (productId: string) => void;
  selectAllCartItems: (select: boolean) => void;
  selectOnlyCartItem: (productId: string) => void;
  checkoutTargetItems: CartItem[] | null;
  setCheckoutTargetItems: (items: CartItem[] | null) => void;
  startSingleItemCheckout: (
    itemOrProduct: CartItem | Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string,
    customAnswers?: Record<string, string>
  ) => void;
  startShopCheckout: (shopId: string) => void;
  effectiveCheckoutItems: CartItem[];
  selectedCartSubtotal: number;
  selectedCartCount: number;

  // Promo & Coupons (Vendor & Store)
  promoCode: string;
  discountAmount: number;
  appliedPromo: string | null;
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => Promise<void>;
  toggleCouponActive: (couponId: string) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;

  // Vendor Marketing & Flyer / Story Generator
  isFlyerModalOpen: boolean;
  setIsFlyerModalOpen: (open: boolean) => void;
  flyerProduct: Product | null;
  flyerShop: Shop | null;
  openFlyerModal: (product?: Product | null, shop?: Shop | null) => void;
  closeFlyerModal: () => void;

  // Checkout & Delivery & Payment Flow
  selectedDeliveryMethod: DeliveryMethod;
  setSelectedDeliveryMethod: (method: DeliveryMethod) => void;
  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<DeliveryAddress>>;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  pendingOrder: Order | null;
  setPendingOrder: (order: Order | null) => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  lastCompletedOrders: Order[];
  setLastCompletedOrders: (orders: Order[]) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;

  // Orders & Escrow Security System (97470831)
  orders: Order[];
  createOrder: (orderData: {
    customer: DeliveryAddress;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    nitaPhone?: string;
    paymentProofImage?: string;
    transactionRef?: string;
    shopId?: string;
    shopName?: string;
    isPickupInShop?: boolean;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, customNote?: string) => Promise<void>;
  adminValidateCustomerPayment: (orderId: string, customNote?: string) => Promise<void>;
  vendorSubmitDeliveryProof: (orderId: string, deliveryProofImage: string, note?: string) => Promise<void>;
  adminReleaseFundsToVendor: (orderId: string, customNote?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Tracking
  trackingOrderNumber: string;
  setTrackingOrderNumber: (num: string) => void;
  searchOrder: (orderNumber: string) => Order | undefined;

  // Dark Mode Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Modals & Selected Product
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isUserProfileModalOpen: boolean;
  setIsUserProfileModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  openOnboardingTutorial: () => void;
  closeOnboardingTutorial: () => void;

  // Platform Settings (Admin)
  platformSettings: {
    monthlyShopFee: number;
    referralBonus: number;
    adminPaymentAccount: string;
    acceptedPaymentMethods: {
      myNita: boolean;
      amanaTa: boolean;
      airtelMoney: boolean;
      alIzza: boolean;
      cashDelivery: boolean;
    };
  };
  updatePlatformSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
  payReferralBonus: (shopId: string, amount?: number) => Promise<void>;

  // Admin Auth / Mode
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  adminEmail: string;
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;

  // Easy Batch Admin Actions
  batchValidatePayments: (orderIds: string[]) => Promise<void>;
  batchReleaseFunds: (orderIds: string[]) => Promise<void>;
  batchApproveShops: (shopIds: string[]) => Promise<void>;
  batchRestockProducts: (increment?: number) => Promise<void>;

  // User Authentication & Session
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginUser: (phone: string, password?: string) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  registerUser: (data: {
    fullName: string;
    phone: string;
    countryCode?: string;
    city: string;
    neighborhood?: string;
    password?: string;
    referralCode?: string;
  }) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<AppUser>) => Promise<void>;
  usersList: AppUser[];

  // Golden Bee Trade / Chat System (7 Days Auto-Purge for storage economy)
  conversations: Conversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  unreadChatCount: number;
  vendorUnreadChatCount: number;
  startOrOpenConversation: (shopId: string, product?: Product) => Promise<string>;
  startSupportConversation: (initialMessage?: string, relatedOrderNumber?: string) => Promise<string>;
  sendChatMessage: (
    conversationId: string,
    text: string,
    attachedProduct?: Product,
    customSenderRole?: 'buyer' | 'vendor' | 'system',
    attachmentUrl?: string
  ) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  markVendorConversationAsRead: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  cleanupExpiredChatMessages: () => void;

  // Customer Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;

  // Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: ToastInfo['type'], subMessage?: string) => void;
  removeToast: (id: string) => void;

  // Local Notifications & Real-Time Order Tracking Alerts
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  addLocalNotification: (notif: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  localNotificationsEnabled: boolean;
  toggleLocalNotifications: (enabled?: boolean) => Promise<boolean>;
  testOrderNotification: (orderNumber?: string) => void;

  // Admin Petites Annonces (Broadcast Announcements)
  announcements: Announcement[];
  activeAnnouncements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  toggleAnnouncementActive: (id: string) => Promise<void>;

  // Database Storage Optimization & Purge
  purgeDatabaseStorage: (options?: {
    purgeReadNotifications?: boolean;
    purgeOldChatMessages?: boolean;
    purgeValidatedOrderProofs?: boolean;
  }) => Promise<{ notificationsDeleted: number; messagesDeleted: number; proofsCleaned: number }>;

  // Reset
  resetToDefaultData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PRODUCTS = 'bee_store_products_cache_v2';
const STORAGE_KEY_ORDERS = 'bee_store_orders_cache_v2';
const STORAGE_KEY_SHOPS = 'bee_store_shops_cache';
const STORAGE_KEY_REVIEWS = 'bee_store_reviews_cache_v1';
const STORAGE_KEY_NOTIFICATIONS = 'bee_store_vendor_notifications_v1';
const STORAGE_KEY_CART = 'bee_store_cart_v1';
const STORAGE_KEY_CURRENT_VENDOR = 'bee_store_current_vendor_id';
const STORAGE_KEY_DARK_MODE = 'bee_store_dark_mode';
const STORAGE_KEY_ADMIN_AUTH = 'bee_store_admin_authenticated_v1';
const STORAGE_KEY_USER_SESSION = 'bee_store_user_session_v3';
const STORAGE_KEY_USERS_LIST = 'bee_store_users_list_v3';
const STORAGE_KEY_CONVERSATIONS = 'bee_store_conversations_v2';
const STORAGE_KEY_MESSAGES = 'bee_store_messages_v2';
const STORAGE_KEY_FAVORITES = 'bee_store_favorites_v2';
const STORAGE_KEY_APP_NOTIFICATIONS = 'bee_store_app_notifications_v2';
const STORAGE_KEY_ANNOUNCEMENTS = 'bee_store_announcements_v2';
const STORAGE_KEY_LOCAL_NOTIFS_ENABLED = 'bee_store_local_notifs_enabled_v2';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🚀 Lancement Officiel Golden Bee Store !',
    content: 'Bienvenue sur la marketplace n°1 au Niger ! Créez votre boutique en 3 clics et profitez de la protection Trade Assurance 100%.',
    category: 'flash',
    isActive: true,
    badgeText: 'FLASH INFO',
    ctaText: 'Créer ma boutique',
    ctaLinkTab: 'vendor',
    authorName: 'Direction Golden Bee',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    broadcastPush: true,
  },
  {
    id: 'ann-2',
    title: '📦 Livraisons Express Niamey & Régions',
    content: 'Toutes les commandes passées avant 14h sont acheminées le jour même à Niamey et expédiées sous 24h pour Agadez, Maradi, Zinder et Tahoua.',
    category: 'livraison',
    isActive: true,
    badgeText: 'LIVRAISON',
    ctaText: 'Suivre mon colis',
    ctaLinkTab: 'tracking',
    authorName: 'Service Logistique',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    broadcastPush: false,
  },
  {
    id: 'ann-3',
    title: '🛡️ Sécurité Paiements My Nita & Amana Ta',
    content: 'Rappel important : le seul compte de séquestre officiel de la plateforme est le 97470831. Vos fonds sont protégés jusqu\'à la livraison.',
    category: 'info',
    isActive: true,
    badgeText: 'SÉCURITÉ',
    authorName: 'Sécurité Golden Bee',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    broadcastPush: false,
  },
];

export const INITIAL_APP_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    type: 'promo',
    title: 'Bienvenue sur Golden Bee Store !',
    message: 'Explorez nos articles de mode, chaussures, montres et maroquinerie avec garantie Trade Assurance 100%.',
    linkTab: 'shop',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-order-demo',
    type: 'order_status',
    title: '📦 Commande CMD-84920 : En cours de livraison',
    message: 'Le coursier Niamey Express est en route avec votre paire de Mocassins en cuir.',
    orderNumber: 'CMD-84920',
    orderStatus: 'en_livraison',
    linkTab: 'tracking',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-security',
    type: 'security',
    title: 'Protection Acheteur Active (Compte 97470831)',
    message: 'Vos paiements via My Nita & Amana Ta vers le 97470831 sont sécurisés jusqu’à la réception de votre colis.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

export const ADMIN_MASTER_EMAIL = 'abdou9747w@gmail.com';
export const ADMIN_MASTER_PASSWORD = 'Aa97470831';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shop');
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('dashboard');
  const [selectedShopFilter, setSelectedShopFilter] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_AUTH);
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingShops, setIsLoadingShops] = useState<boolean>(true);

  // Customer Reviews & Ratings state
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((r) => r && r.productId && !DEMO_PRODUCT_IDS.has(r.productId));
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Vendor Notifications state
  const [vendorNotifications, setVendorNotifications] = useState<VendorNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Admin Notifications state (Referrals, new shops, escrow alerts)
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    try {
      const saved = localStorage.getItem('bee_store_admin_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Sponsor Notifications state (Referral alerts sent to sponsors)
  const [sponsorNotifications, setSponsorNotifications] = useState<SponsorNotification[]>(() => {
    try {
      const saved = localStorage.getItem('bee_store_sponsor_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_DARK_MODE, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Products state (synchronized in real time with Cloud Firestore)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p: Product) => p && p.id && !DEMO_PRODUCT_IDS.has(p.id));
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Shops state (synchronized in real time with Cloud Firestore)
  const [shops, setShops] = useState<Shop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOPS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SHOPS;
  });

  // Currently logged in vendor shop
  const [currentVendorShop, setCurrentVendorShop] = useState<Shop | null>(null);
  const [isCreateShopModalOpen, setIsCreateShopModalOpen] = useState(false);
  const [initialReferralCode, setInitialReferralCode] = useState<string>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const code =
        searchParams.get('ref') ||
        searchParams.get('referral') ||
        searchParams.get('parrain') ||
        searchParams.get('join') ||
        searchParams.get('code');
      return code ? code.trim().toUpperCase() : '';
    } catch {
      return '';
    }
  });

  const openCreateShopWithReferral = (code?: string) => {
    if (code) {
      setInitialReferralCode(code.trim().toUpperCase());
    }
    setIsCreateShopModalOpen(true);
  };

  // Orders state (synchronized in real time with Cloud Firestore)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Cart state (local user session)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (it: CartItem) => it && it.product && it.product.id && !DEMO_PRODUCT_IDS.has(it.product.id)
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Individual item selection for cart (buy item by item or in batch)
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bee_store_cart_selection');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Temporary target items when ordering a specific item or shop directly
  const [checkoutTargetItems, setCheckoutTargetItems] = useState<CartItem[] | null>(null);

  // Auto-sync selected IDs when cart updates (strictly 1 item selected at a time)
  useEffect(() => {
    setSelectedCartItemIds((prev) => {
      const cartProductIds = cart.filter((it) => it && it.product && it.product.id).map((it) => it.product.id);
      if (cartProductIds.length === 0) return [];
      const valid = prev.filter((id) => cartProductIds.includes(id));
      if (valid.length === 1) {
        return valid;
      }
      return [cartProductIds[0]];
    });
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('bee_store_cart_selection', JSON.stringify(selectedCartItemIds));
    } catch {}
  }, [selectedCartItemIds]);

  const toggleCartItemSelection = (productId: string) => {
    // Single item exclusive selection: selecting this product unselects others
    setSelectedCartItemIds([productId]);
  };

  const selectAllCartItems = (_select: boolean) => {
    if (cart.length > 0) {
      setSelectedCartItemIds([cart[0].product.id]);
    }
  };

  const selectOnlyCartItem = (productId: string) => {
    setSelectedCartItemIds([productId]);
  };

  const startSingleItemCheckout = (
    itemOrProduct: CartItem | Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string,
    customAnswers?: Record<string, string>
  ) => {
    let target: CartItem;
    if ('product' in itemOrProduct) {
      target = itemOrProduct;
    } else {
      target = {
        product: itemOrProduct,
        quantity,
        selectedSize: selectedSize || itemOrProduct.sizes?.[0],
        selectedColor: selectedColor || itemOrProduct.colors?.[0],
        customAnswers,
      };
    }
    setCheckoutTargetItems([target]);
    setIsCheckoutOpen(true);
  };

  const startShopCheckout = (shopId: string) => {
    const shopItems = cart.filter((it) => (it.product.shopId || 'shop-bee-agadez') === shopId);
    if (shopItems.length === 0) return;
    setCheckoutTargetItems(shopItems);
    setIsCheckoutOpen(true);
  };

  // Effective items being purchased in the current checkout session
  const effectiveCheckoutItems = useMemo(() => {
    if (checkoutTargetItems && checkoutTargetItems.length > 0) {
      return checkoutTargetItems;
    }
    const selected = cart.filter((it) => selectedCartItemIds.includes(it.product.id));
    if (selected.length > 0) {
      return selected;
    }
    return cart;
  }, [checkoutTargetItems, cart, selectedCartItemIds]);

  const selectedCartSubtotal = useMemo(() => {
    return effectiveCheckoutItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  }, [effectiveCheckoutItems]);

  const selectedCartCount = useMemo(() => {
    return effectiveCheckoutItems.reduce((sum, it) => sum + it.quantity, 0);
  }, [effectiveCheckoutItems]);

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const openOnboardingTutorial = () => setIsOnboardingOpen(true);
  const closeOnboardingTutorial = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem('bee_store_onboarding_completed', 'true');
    } catch {}
  };

  // Platform Settings State (1 500 FCFA / mois, 500 FCFA parrainage, My Nita & Amana Ta, Compte 97470831)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('bee_store_platform_settings_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      monthlyShopFee: 1500,
      referralBonus: 500,
      adminPaymentAccount: '97470831',
      acceptedPaymentMethods: {
        myNita: true,
        amanaTa: true,
        airtelMoney: true,
        alIzza: true,
        cashDelivery: true,
      },
    };
  });

  // Users List (Loaded from storage or initial demo users)
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_USERS;
  });

  // Current User Session (Logged-in customer / vendor / admin)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone) return parsed;
      }
    } catch {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Synchronize deliveryAddress with logged in user if available
  useEffect(() => {
    if (currentUser) {
      setDeliveryAddress((prev) => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        phone: currentUser.phone || prev.phone,
        city: currentUser.city || prev.city,
        neighborhood: currentUser.neighborhood || prev.neighborhood,
      }));
    }
  }, [currentUser]);

  const loginUser = async (
    identifierInput: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    const rawIdentifier = (identifierInput || '').trim();
    const cleanPhone = rawIdentifier.replace(/\D/g, '');
    const cleanEmail = rawIdentifier.toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. MASTER ADMIN LOGIN CHECK
    const isMasterAdminEmail = cleanEmail === ADMIN_MASTER_EMAIL.toLowerCase();
    const isMasterAdminPhone = cleanPhone.endsWith('97470831') || cleanPhone === '97470831';

    if ((isMasterAdminEmail || isMasterAdminPhone) && cleanPassword === ADMIN_MASTER_PASSWORD) {
      let adminUser = usersList.find((u) => (u.phone || '').replace(/\D/g, '').endsWith('97470831'));
      if (!adminUser) {
        adminUser = {
          id: 'user-abdou-admin',
          fullName: 'Abdourahmen (Administrateur)',
          phone: '97470831',
          countryCode: '+227',
          city: 'Agadez',
          neighborhood: 'Centre / Grand Marché',
          password: ADMIN_MASTER_PASSWORD,
          role: 'admin',
          cagnotteFCFA: 0,
          createdAt: '2026-01-01T00:00:00Z',
        };
      }

      setCurrentUser(adminUser);
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(adminUser));
        localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      } catch {}

      // Link admin vendor shop if exists
      const matchingShop = shops.find((s) => (s.phone || '').replace(/\D/g, '').endsWith('97470831'));
      if (matchingShop) {
        setCurrentVendorShop(matchingShop);
      }

      showToast(
        'Bienvenue Administrateur ! 👑',
        'success',
        'Connexion établie avec votre compte original Administrateur.'
      );
      setIsAuthModalOpen(false);
      return { success: true, message: 'Connexion administrateur réussie', user: adminUser };
    }

    // 2. CHECK REGULAR REGISTERED USERS
    const foundUser = usersList.find((u) => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const phoneMatch = cleanPhone && (uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone) || uPhone === cleanPhone);
      const emailMatch = (u as any).email && (u as any).email.toLowerCase() === cleanEmail;
      return phoneMatch || emailMatch;
    });

    if (foundUser) {
      if (foundUser.password && cleanPassword && foundUser.password !== cleanPassword) {
        return {
          success: false,
          message: 'Mot de passe incorrect pour ce compte.',
        };
      }

      setCurrentUser(foundUser);
      setIsAdminAuthenticated(false);
      try {
        localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(foundUser));
        localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      } catch {}

      // Auto-link shop ONLY if this user is explicitly registered as a vendor
      if (foundUser.role === 'vendor') {
        const matchingShop = shops.find((s) => {
          const sPhone = (s.phone || '').replace(/\D/g, '');
          return cleanPhone && (sPhone.endsWith(cleanPhone) || cleanPhone.endsWith(sPhone));
        });
        if (matchingShop) {
          setCurrentVendorShop(matchingShop);
          try {
            localStorage.setItem(STORAGE_KEY_CURRENT_VENDOR, matchingShop.id);
          } catch {}
        } else {
          setCurrentVendorShop(null);
          try {
            localStorage.removeItem(STORAGE_KEY_CURRENT_VENDOR);
          } catch {}
        }
      } else {
        // Regular customer: strictly no shop attached
        setCurrentVendorShop(null);
        try {
          localStorage.removeItem(STORAGE_KEY_CURRENT_VENDOR);
        } catch {}
      }

      showToast(
        `Bienvenue ${foundUser.fullName} ! 👋`,
        'success',
        `Connecté avec succès (${foundUser.city || 'Niger'}).`
      );

      setIsAuthModalOpen(false);
      return { success: true, message: 'Connexion réussie', user: foundUser };
    }

    // 3. CHECK EXISTING SHOPS IN DIRECTORY (Strict PIN code required)
    const matchingShop = shops.find((s) => {
      const sPhone = (s.phone || '').replace(/\D/g, '');
      return cleanPhone && (sPhone.endsWith(cleanPhone) || cleanPhone.endsWith(sPhone));
    });

    if (matchingShop) {
      const pinMatches = cleanPassword && matchingShop.pinCode && String(matchingShop.pinCode).trim() === cleanPassword;
      if (pinMatches) {
        const vendorUser: AppUser = {
          id: `user-${matchingShop.id}`,
          fullName: matchingShop.ownerName || matchingShop.name,
          phone: matchingShop.phone,
          countryCode: '+227',
          city: matchingShop.city || 'Agadez',
          neighborhood: matchingShop.neighborhood,
          password: cleanPassword,
          role: 'vendor',
          cagnotteFCFA: matchingShop.referralEarnings || 0,
          createdAt: matchingShop.createdAt || new Date().toISOString(),
        };

        setUsersList((prev) => [...prev, vendorUser]);
        setCurrentUser(vendorUser);
        setCurrentVendorShop(matchingShop);
        setIsAdminAuthenticated(false);

        try {
          localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(vendorUser));
          localStorage.setItem(STORAGE_KEY_CURRENT_VENDOR, matchingShop.id);
          localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
        } catch {}

        showToast(
          `Bienvenue ${matchingShop.ownerName || matchingShop.name} ! 🏪`,
          'success',
          `Connecté à votre boutique ${matchingShop.name}.`
        );

        setIsAuthModalOpen(false);
        return { success: true, message: 'Connexion boutique réussie', user: vendorUser };
      } else {
        return {
          success: false,
          message: 'Code PIN ou mot de passe de la boutique incorrect.',
        };
      }
    }

    return {
      success: false,
      message: 'Aucun compte ou boutique trouvé avec ces coordonnées. Veuillez vérifier ou créer un compte.',
    };
  };

  const registerUser = async (data: {
    fullName: string;
    phone: string;
    countryCode?: string;
    city: string;
    neighborhood?: string;
    password?: string;
    referralCode?: string;
  }): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    const cleanPhone = data.phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      return { success: false, message: 'Veuillez saisir un numéro de téléphone valide.' };
    }

    // Protect official admin account against re-registration or takeover
    if (cleanPhone === '97470831' || cleanPhone === '22797470831') {
      return {
        success: false,
        message: 'Ce numéro correspond au compte administrateur officiel. Veuillez vous connecter directement avec vos identifiants.',
      };
    }

    const existingUser = usersList.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);
    if (existingUser) {
      return {
        success: false,
        message: 'Un compte existe déjà avec ce numéro. Veuillez vous connecter.',
      };
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      countryCode: data.countryCode || '+227',
      city: data.city.trim() || 'Agadez',
      neighborhood: data.neighborhood?.trim() || '',
      password: data.password?.trim() || '1234',
      role: 'customer',
      cagnotteFCFA: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newUser, ...usersList];
    setUsersList(updatedList);
    setCurrentUser(newUser);
    setCurrentVendorShop(null);

    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(updatedList));
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(newUser));
      localStorage.removeItem(STORAGE_KEY_CURRENT_VENDOR);
      // Sync with Firestore
      const userRef = doc(db, 'users', newUser.id);
      await setDoc(userRef, sanitizeForFirestore(newUser));
    } catch (err) {
      console.warn('User saved locally, Firestore fallback:', err);
    }

    showToast(
      `Compte créé avec succès ! 🎉`,
      'success',
      `Bienvenue sur Golden Bee Store ${newUser.fullName} (${newUser.city}) !`
    );

    setIsAuthModalOpen(false);
    return { success: true, message: 'Inscription réussie', user: newUser };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    setCurrentVendorShop(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER_SESSION);
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEY_CURRENT_VENDOR);
    } catch {}
    setIsAuthModalOpen(true);
    setAuthModalMode('login');
    showToast('Déconnexion effectuée', 'info', 'Vous avez été déconnecté.');
  };

  const updateUserProfile = async (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    const updatedList = usersList.map((u) => (u.id === currentUser.id ? updated : u));
    setUsersList(updatedList);

    try {
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(updatedList));
      const userRef = doc(db, 'users', updated.id);
      await updateDoc(userRef, sanitizeForFirestore(updates));
    } catch {}

    showToast('Profil mis à jour !', 'success');
  };

  const updatePlatformSettings = async (updates: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('bee_store_platform_settings_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast('Paramètres mis à jour !', 'success', 'Les nouveaux réglages sont appliqués immédiatement.');
  };

  const payReferralBonus = async (sponsorShopId: string, customAmount?: number) => {
    const amount = customAmount || platformSettings.referralBonus || 500;
    const sponsor = shops.find((s) => s.id === sponsorShopId);
    if (!sponsor) {
      showToast('Boutique introuvable', 'error');
      return;
    }

    showToast(
      'Prime de Parrainage Validée !',
      'success',
      `Versement de ${amount.toLocaleString('fr-FR')} FCFA validé pour ${sponsor.name} (${sponsor.phone}) via My Nita/Amana Ta.`
    );
  };

  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [lastCompletedOrders, setLastCompletedOrders] = useState<Order[]>([]);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');

  // Delivery & Checkout state
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod>(DELIVERY_METHODS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    region: 'Agadez',
    city: 'Agadez Ville (Centre)',
    neighborhood: 'Sabon Gari',
    addressDetails: '',
    notes: '',
    relayPointName: '',
  });

  // Promo code & Coupons
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Vendor Flyer / Story Generator Modal State
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [flyerProduct, setFlyerProduct] = useState<Product | null>(null);
  const [flyerShop, setFlyerShop] = useState<Shop | null>(null);

  const openFlyerModal = (product?: Product | null, shop?: Shop | null) => {
    setFlyerProduct(product || null);
    setFlyerShop(shop || (product?.shopId ? shops.find((s) => s.id === product.shopId) || currentVendorShop : currentVendorShop));
    setIsFlyerModalOpen(true);
  };

  const closeFlyerModal = () => {
    setIsFlyerModalOpen(false);
  };

  // Coupons State (Loaded from initial and synced with Firestore)
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('bee_store_coupons_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COUPONS;
  });

  // Toasts (Discreet, professional top notifications)
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: ToastInfo['type'] = 'success', subMessage?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-1), { id, type, message, subMessage }]);
    setTimeout(() => {
      removeToast(id);
    }, 2500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Local Notifications State (Real-time order tracking alerts)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APP_NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_APP_NOTIFICATIONS;
  });

  const [localNotificationsEnabled, setLocalNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCAL_NOTIFS_ENABLED);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Admin Announcements State (Petites Annonces)
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ANNOUNCEMENTS;
  });

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APP_NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Save announcements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {}
  }, [announcements]);

  // Unread count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Active announcements
  const activeAnnouncements = useMemo(() => {
    return announcements.filter((a) => a.isActive);
  }, [announcements]);

  // Sync announcements from Firestore if available
  useEffect(() => {
    try {
      const annRef = collection(db, 'announcements');
      const q = query(annRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Announcement[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setAnnouncements(list);
          }
        },
        (err) => {
          console.debug('Announcements Firestore listener notice:', err);
        }
      );
      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, []);

  const addLocalNotification = (notifData: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Audible chime & vibration if enabled
    if (localNotificationsEnabled) {
      playNotificationChime();
      vibrateDevice([100, 60, 100]);

      // Native browser notification if user allowed
      dispatchBrowserNotification(newNotif.title, {
        body: newNotif.message,
        tag: newNotif.orderNumber || newNotif.id,
      });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Toutes les alertes marquées comme lues', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications effacées', 'info');
  };

  const toggleLocalNotifications = async (forcedValue?: boolean): Promise<boolean> => {
    const target = forcedValue !== undefined ? forcedValue : !localNotificationsEnabled;
    if (target) {
      const granted = await requestNotificationPermission();
      setLocalNotificationsEnabled(true);
      try {
        localStorage.setItem(STORAGE_KEY_LOCAL_NOTIFS_ENABLED, 'true');
      } catch {}
      playNotificationChime();
      showToast(
        'Alertes en direct activées !',
        'success',
        granted
          ? 'Notifications de suivi actives sur votre appareil.'
          : 'Sons et alertes intégrées actives dans l\'application.'
      );
      return granted;
    } else {
      setLocalNotificationsEnabled(false);
      try {
        localStorage.setItem(STORAGE_KEY_LOCAL_NOTIFS_ENABLED, 'false');
      } catch {}
      showToast('Alertes de suivi désactivées', 'info');
      return false;
    }
  };

  const testOrderNotification = (orderNumber?: string) => {
    const targetNum = orderNumber || 'CMD-84920';
    addLocalNotification({
      type: 'order_status',
      title: `🔔 Alerte Suivi : ${targetNum}`,
      message: 'Le livreur Niamey Express a pris en charge votre colis. Arrivée estimée sous peu !',
      orderNumber: targetNum,
      orderStatus: 'en_livraison',
      linkTab: 'tracking',
      read: false,
    });
    showToast('Alerte de test déclenchée !', 'success', 'Vérifiez la cloche et le son en direct.');
  };

  const addAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    // If broadcastPush is requested, immediately fire a local notification to all users!
    if (newAnn.broadcastPush) {
      addLocalNotification({
        type: 'announcement',
        title: `📣 Annonce : ${newAnn.title}`,
        message: newAnn.content,
        announcementId: newAnn.id,
        linkTab: newAnn.ctaLinkTab || 'shop',
        read: false,
      });
    }

    try {
      await setDoc(doc(db, 'announcements', newAnn.id), sanitizeForFirestore(newAnn));
    } catch (e) {
      console.debug('Firestore announcement sync offline:', e);
    }

    showToast('Petite annonce publiée !', 'success', 'Diffusée sur la bannière et le centre d\'alertes.');
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    try {
      await updateDoc(doc(db, 'announcements', id), sanitizeForFirestore(updates));
    } catch (e) {
      console.debug('Firestore announcement update offline:', e);
    }

    showToast('Annonce mise à jour', 'info');
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) {
      console.debug('Firestore announcement delete offline:', e);
    }
    showToast('Annonce supprimée', 'info');
  };

  const toggleAnnouncementActive = async (id: string) => {
    const target = announcements.find((a) => a.id === id);
    if (!target) return;
    await updateAnnouncement(id, { isActive: !target.isActive });
  };

  // Automatic Deep Link & URL Navigation Resolution (?product=..., ?shop=..., ?ref=..., ?order=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const prodParam =
        searchParams.get('product') ||
        searchParams.get('productId') ||
        searchParams.get('p');
      const shopParam =
        searchParams.get('shop') ||
        searchParams.get('shopId') ||
        searchParams.get('boutique') ||
        searchParams.get('store');
      const refParam =
        searchParams.get('ref') ||
        searchParams.get('referral') ||
        searchParams.get('parrain') ||
        searchParams.get('join') ||
        searchParams.get('code');
      const orderParam = searchParams.get('order') || searchParams.get('track');

      // 1. Direct Product link - opens product modal
      if (prodParam && products.length > 0) {
        const cleanProdId = decodeURIComponent(prodParam).trim().toLowerCase();
        const targetProd = products.find(
          (p) =>
            p.id.toLowerCase() === cleanProdId ||
            p.name.toLowerCase() === cleanProdId ||
            p.name.toLowerCase().replace(/\s+/g, '-').includes(cleanProdId)
        );
        if (targetProd) {
          setSelectedProduct(targetProd);
          setActiveTab('shop');
        }
      }

      // 2. Direct Shop link - filters to that exact shop
      if (shopParam && shops.length > 0) {
        const cleanShop = decodeURIComponent(shopParam).trim().toLowerCase();
        const targetShop = shops.find(
          (s) =>
            s.id.toLowerCase() === cleanShop ||
            s.name.toLowerCase() === cleanShop ||
            s.name.toLowerCase().replace(/\s+/g, '-').includes(cleanShop)
        );
        if (targetShop) {
          setSelectedShopFilter(targetShop.id);
          setActiveTab('shop');
        }
      }

      // 3. Referral code link - opens shop creation modal with referral pre-filled
      if (refParam && refParam.trim()) {
        const cleanRef = decodeURIComponent(refParam).trim().toUpperCase();
        setInitialReferralCode(cleanRef);
        setIsCreateShopModalOpen(true);
      }

      // 4. Order tracking link
      if (orderParam && orderParam.trim()) {
        setTrackingOrderNumber(decodeURIComponent(orderParam).trim());
        setActiveTab('tracking');
      }
    } catch (err) {
      console.warn('Could not parse URL params:', err);
    }
  }, [products.length, shops.length]);

  // Initial Onboarding Check: Auto-open tutorial on first visit
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem('bee_store_onboarding_completed');
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // 1. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR PRODUCTS
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    // Safety timeout to ensure skeletons don't hang if offline or slow network
    const safetyTimeout = setTimeout(() => {
      setIsLoadingProducts(false);
    }, 3500);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        clearTimeout(safetyTimeout);
        if (snapshot.empty) {
          setProducts([]);
          try {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
          } catch {
            // ignore
          }
        } else {
          const loadedProducts: Product[] = [];
          const batch = writeBatch(db);
          let hasDemoToDelete = false;

          snapshot.forEach((docSnap) => {
            const prodData = docSnap.data() as Product;
            const pid = prodData?.id || docSnap.id;
            if (DEMO_PRODUCT_IDS.has(pid)) {
              // Purge legacy demo product doc from Firestore
              batch.delete(docSnap.ref);
              hasDemoToDelete = true;
            } else if (prodData && prodData.name) {
              loadedProducts.push({
                ...prodData,
                id: pid,
              });
            }
          });

          if (hasDemoToDelete) {
            batch.commit().catch((e) => console.warn('Purged demo products from Firestore:', e));
          }

          setProducts(loadedProducts);
          try {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(loadedProducts));
          } catch {
            // ignore
          }
        }
        setIsLoadingProducts(false);
      },
      (error) => {
        clearTimeout(safetyTimeout);
        console.warn('Firestore products listener fallback to local:', error);
        setProducts((prev) => prev.filter((p) => p && p.id && !DEMO_PRODUCT_IDS.has(p.id)));
        setIsLoadingProducts(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  // 2. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR SHOPS
  useEffect(() => {
    const shopsRef = collection(db, 'shops');

    const safetyTimeout = setTimeout(() => {
      setIsLoadingShops(false);
    }, 3500);

    const unsubscribe = onSnapshot(
      shopsRef,
      async (snapshot) => {
        clearTimeout(safetyTimeout);
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_SHOPS.forEach((sh) => {
              const docRef = doc(db, 'shops', sh.id);
              batch.set(docRef, sanitizeForFirestore(sh));
            });
            await batch.commit();
          } catch (err) {
            console.error('Error seeding initial shops to Firestore:', err);
          }
        } else {
          const loadedShops: Shop[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Shop;
            if (data && (data.name || data.id)) {
              loadedShops.push({
                ...data,
                id: data.id || docSnap.id,
              });
            }
          });
          // Sort newest first
          loadedShops.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setShops(loadedShops);
          try {
            localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(loadedShops));
          } catch {
            // ignore
          }

          // Maintain active session ONLY if user is verified vendor or admin
          const savedVendorId = localStorage.getItem(STORAGE_KEY_CURRENT_VENDOR);
          if (savedVendorId) {
            const match = loadedShops.find((s) => s.id === savedVendorId);
            const userSaved = localStorage.getItem(STORAGE_KEY_USER_SESSION);
            const parsedUser = userSaved ? JSON.parse(userSaved) : null;
            const isAdmin = localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';

            if (match && (isAdmin || (parsedUser && parsedUser.role === 'vendor'))) {
              setCurrentVendorShop(match);
            } else {
              localStorage.removeItem(STORAGE_KEY_CURRENT_VENDOR);
              setCurrentVendorShop(null);
            }
          } else {
            setCurrentVendorShop(null);
          }
        }
        setIsLoadingShops(false);
      },
      (error) => {
        clearTimeout(safetyTimeout);
        console.warn('Firestore shops listener fallback to local:', error);
        setIsLoadingShops(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  // 3. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR ORDERS
  useEffect(() => {
    const ordersRef = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      ordersRef,
      async (snapshot) => {
        if (snapshot.empty) {
          setOrders([]);
          try {
            localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
          } catch {
            // ignore
          }
        } else {
          const loadedOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            const ordData = docSnap.data() as Order;
            if (ordData.id && !ordData.id.startsWith('ord-100')) {
              loadedOrders.push({
                ...ordData,
                id: ordData.id || docSnap.id,
              });
            }
          });
          loadedOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setOrders(loadedOrders);
          try {
            localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(loadedOrders));
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        console.warn('Firestore orders listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 4. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR REVIEWS
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');

    const unsubscribe = onSnapshot(
      reviewsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedReviews: ProductReview[] = [];
          snapshot.forEach((docSnap) => {
            const revData = docSnap.data() as ProductReview;
            if (revData && revData.comment) {
              loadedReviews.push({
                ...revData,
                id: revData.id || docSnap.id,
              });
            }
          });
          loadedReviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setReviews(loadedReviews);
          try {
            localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(loadedReviews));
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        console.warn('Firestore reviews listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 5. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR VENDOR NOTIFICATIONS
  useEffect(() => {
    const notifsRef = collection(db, 'vendor_notifications');

    const unsubscribe = onSnapshot(
      notifsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: VendorNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as VendorNotification;
            if (data && (data.orderNumber || data.message || data.shopId || data.type)) {
              loaded.push({
                ...data,
                id: data.id || docSnap.id,
              });
            }
          });
          loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setVendorNotifications(loaded);
          try {
            localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(loaded));
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        console.warn('Firestore vendor_notifications listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 6. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR ADMIN NOTIFICATIONS
  useEffect(() => {
    const notifsRef = collection(db, 'admin_notifications');

    const unsubscribe = onSnapshot(
      notifsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AdminNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AdminNotification;
            if (data && (data.title || data.type || data.newShopName || data.message)) {
              loaded.push({
                ...data,
                id: data.id || docSnap.id,
              });
            }
          });
          loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setAdminNotifications(loaded);
          try {
            localStorage.setItem('bee_store_admin_notifications_v1', JSON.stringify(loaded));
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        console.warn('Firestore admin_notifications listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 7. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR SPONSOR NOTIFICATIONS
  useEffect(() => {
    const notifsRef = collection(db, 'sponsor_notifications');

    const unsubscribe = onSnapshot(
      notifsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: SponsorNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SponsorNotification;
            if (data && (data.sponsorReferralCode || data.newShopName || data.message)) {
              loaded.push({
                ...data,
                id: data.id || docSnap.id,
              });
            }
          });
          loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setSponsorNotifications(loaded);
          try {
            localStorage.setItem('bee_store_sponsor_notifications_v1', JSON.stringify(loaded));
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        console.warn('Firestore sponsor_notifications listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 8. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR TRADE CONVERSATIONS
  useEffect(() => {
    const convsRef = collection(db, 'conversations');

    const unsubscribe = onSnapshot(
      convsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Conversation[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Conversation;
            if (data && (data.shopId || data.buyerId)) {
              loaded.push({
                ...data,
                id: data.id || docSnap.id,
              });
            }
          });
          if (loaded.length > 0) {
            // Sort by latest message time
            loaded.sort((a, b) => new Date(b.lastMessageTime || b.updatedAt || 0).getTime() - new Date(a.lastMessageTime || a.updatedAt || 0).getTime());
            setConversations(loaded);
            try {
              localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(loaded));
            } catch {}
          }
        }
      },
      (error) => {
        console.warn('Firestore conversations listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 9. REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE FOR TRADE MESSAGES
  useEffect(() => {
    const msgsRef = collection(db, 'messages');

    const unsubscribe = onSnapshot(
      msgsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ChatMessage;
            if (data && data.conversationId && (data.text || data.attachmentUrl || data.productId)) {
              loaded.push({
                ...data,
                id: data.id || docSnap.id,
              });
            }
          });
          if (loaded.length > 0) {
            // Sort chronologically (oldest to newest)
            loaded.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
            // Filter out 7-day expired messages
            const valid = loaded.filter((m) => !isMessageExpired(m.createdAt));
            setMessages(valid);
            try {
              localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(valid));
            } catch {}
          }
        }
      },
      (error) => {
        console.warn('Firestore messages listener fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Cart local persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Cart calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Cart actions
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string,
    customAnswers?: Record<string, string>
  ) => {
    if (product.stock <= 0) {
      showToast('Produit épuisé', 'error', `${product.name} n'est plus en stock.`);
      return;
    }

    setCart((prev) => {
      // Find matching item by product id and identical size/color variants
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.selectedSize || '') === (selectedSize || '') &&
          (item.selectedColor || '') === (selectedColor || '')
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast('Stock maximal atteint', 'warning', `Seulement ${product.stock} unités disponibles.`);
          return prev.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: product.stock, customAnswers: customAnswers || item.customAnswers } : item
          );
        }
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: newQty, customAnswers: customAnswers || item.customAnswers } : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity: Math.min(quantity, product.stock),
          selectedSize,
          selectedColor,
          customAnswers,
        },
      ];
    });

    const variantDetails = [
      selectedSize ? `Taille: ${selectedSize}` : null,
      selectedColor ? `Couleur: ${selectedColor}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    showToast(
      'Ajouté au panier ! 🛒',
      'success',
      `${quantity}x ${product.name}${variantDetails ? ` (${variantDetails})` : ''} ajouté à votre panier.`
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Article retiré', 'info', 'Le produit a été retiré de votre panier.');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Promo code & Coupons application system
  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Veuillez entrer un code', 'warning', 'Saisissez votre code promo.');
      return { success: false, message: 'Veuillez saisir un code promo.' };
    }

    // 1. Search in dynamic coupons list
    const matchedCoupon = coupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive
    );

    if (matchedCoupon) {
      // Check expiration if specified
      if (matchedCoupon.expiresAt && new Date(matchedCoupon.expiresAt) < new Date()) {
        showToast('Code expiré', 'error', `Le code promo ${matchedCoupon.code} n'est plus valide.`);
        return { success: false, message: 'Ce code promo a expiré.' };
      }

      // Check shop restriction
      if (matchedCoupon.shopId && matchedCoupon.shopId !== 'ALL') {
        const hasMatchingShopProduct = cart.some(
          (it) =>
            it.product.shopId === matchedCoupon.shopId ||
            it.product.shopName?.toLowerCase() === matchedCoupon.shopName?.toLowerCase()
        );
        if (!hasMatchingShopProduct && cart.length > 0) {
          showToast(
            'Code non applicable',
            'warning',
            `Ce coupon est réservé aux articles de la boutique ${matchedCoupon.shopName || 'partenaire'}.`
          );
          return {
            success: false,
            message: `Valable uniquement pour ${matchedCoupon.shopName || 'cette boutique'}`,
          };
        }
      }

      // Check min order amount
      if (matchedCoupon.minOrderAmount && cartSubtotal < matchedCoupon.minOrderAmount) {
        showToast(
          'Montant minimum non atteint',
          'warning',
          `Ce code promo requiert un panier d'au moins ${matchedCoupon.minOrderAmount.toLocaleString('fr-FR')} FCFA.`
        );
        return {
          success: false,
          message: `Minimum ${matchedCoupon.minOrderAmount.toLocaleString('fr-FR')} FCFA requis`,
        };
      }

      let discount = 0;
      if (matchedCoupon.discountType === 'percentage') {
        discount = Math.round((cartSubtotal * matchedCoupon.discountValue) / 100);
        if (matchedCoupon.maxDiscount && discount > matchedCoupon.maxDiscount) {
          discount = matchedCoupon.maxDiscount;
        }
      } else {
        discount = matchedCoupon.discountValue;
      }

      discount = Math.min(discount, cartSubtotal);

      setDiscountAmount(discount);
      setAppliedCoupon(matchedCoupon);
      setAppliedPromo(`${matchedCoupon.code} (-${discount.toLocaleString('fr-FR')} FCFA)`);
      showToast(
        'Code promo appliqué ! 🎁',
        'success',
        `Une réduction de ${discount.toLocaleString('fr-FR')} FCFA a été déduite de votre commande.`
      );
      return {
        success: true,
        message: `-${discount.toLocaleString('fr-FR')} FCFA appliqués (${matchedCoupon.code})`,
      };
    }

    // 2. Fallbacks for standard codes
    if (cleanCode === 'BEE10' || cleanCode === 'NITA10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCoupon(null);
      setAppliedPromo('BEE10 (-10%)');
      showToast('Code promo appliqué !', 'success', 'Remise de 10% accordée sur votre commande Golden Bee Store.');
      return { success: true, message: 'Code promo BEE10 appliqué : -10%' };
    }
    if (cleanCode === 'LIVRAISON') {
      setDiscountAmount(selectedDeliveryMethod.price);
      setAppliedCoupon(null);
      setAppliedPromo('LIVRAISON (Frais de port offerts)');
      showToast('Frais de livraison offerts !', 'success', 'Votre livraison est désormais gratuite.');
      return { success: true, message: 'Frais de livraison offerts !' };
    }
    if (cleanCode === 'BIENVENUE5000' && cartSubtotal >= 50000) {
      setDiscountAmount(5000);
      setAppliedCoupon(null);
      setAppliedPromo('BIENVENUE5000 (-5 000 FCFA)');
      showToast('Code promo appliqué !', 'success', 'Remise de 5 000 FCFA appliquée.');
      return { success: true, message: 'Remise de 5 000 FCFA appliquée' };
    }

    showToast('Code invalide', 'error', 'Ce code promo n\'existe pas ou a expiré.');
    return { success: false, message: 'Code promo invalide.' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoCode('');
  };

  // Coupons CRUD for Vendors & Admin
  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
    const newId = `coupon-${Date.now()}`;
    const now = new Date().toISOString();
    const newCoupon: Coupon = {
      ...couponData,
      id: newId,
      code: couponData.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: now,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    try {
      localStorage.setItem('bee_store_coupons_v1', JSON.stringify([newCoupon, ...coupons]));
      await setDoc(doc(db, 'coupons', newId), sanitizeForFirestore(newCoupon));
      showToast(
        'Code promo créé ! 🎁',
        'success',
        `Le code "${newCoupon.code}" est désormais actif pour vos clients.`
      );
    } catch (err) {
      console.warn('Firestore coupon create fallback:', err);
      showToast('Code promo sauvegardé localement !', 'success');
    }
  };

  const toggleCouponActive = async (couponId: string) => {
    const target = coupons.find((c) => c.id === couponId);
    if (!target) return;
    const updatedStatus = !target.isActive;
    const updatedList = coupons.map((c) => (c.id === couponId ? { ...c, isActive: updatedStatus } : c));
    setCoupons(updatedList);
    try {
      localStorage.setItem('bee_store_coupons_v1', JSON.stringify(updatedList));
      await updateDoc(doc(db, 'coupons', couponId), sanitizeForFirestore({ isActive: updatedStatus }));
      showToast(
        updatedStatus ? 'Code promo activé' : 'Code promo désactivé',
        'info',
        `Le code ${target.code} est ${updatedStatus ? 'activé' : 'en pause'}.`
      );
    } catch (err) {
      console.warn('Firestore coupon toggle error:', err);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    const updatedList = coupons.filter((c) => c.id !== couponId);
    setCoupons(updatedList);
    if (appliedCoupon?.id === couponId) {
      removePromoCode();
    }
    try {
      localStorage.setItem('bee_store_coupons_v1', JSON.stringify(updatedList));
      await deleteDoc(doc(db, 'coupons', couponId));
      showToast('Code promo supprimé', 'info');
    } catch (err) {
      console.warn('Firestore coupon delete error:', err);
    }
  };

  // ----------------------------------------------------
  // SHOPS & VENDOR SUBSCRIPTIONS (1 500 FCFA / MOIS au 97470831)
  // ----------------------------------------------------

  // Client requests opening a shop
  const requestShopCreation = async (
    shopData: Omit<Shop, 'id' | 'createdAt' | 'status' | 'subscriptionFee' | 'paymentAccountTarget'>
  ): Promise<Shop> => {
    const shopId = `shop-${Date.now()}`;
    const now = new Date().toISOString();

    // Generate unique referral code for this shop (e.g. BEE-7083)
    const cleanPhone = shopData.phone.replace(/\s+/g, '').replace('+227', '');
    const referralCode = `BEE-${cleanPhone.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

    const newShop: Shop = {
      ...shopData,
      id: shopId,
      status: 'en_attente',
      subscriptionFee: 1500,
      paymentAccountTarget: '97470831',
      referralCode,
      referralsCount: 0,
      referralEarnings: 0,
      createdAt: now,
      adminNote: 'Paiement de 1 500 FCFA envoyé au compte 97470831. En attente de validation.',
    };

    // Find sponsor details (who shared the referral link)
    let sponsorId: string | undefined = undefined;
    let sponsorName = '';
    let sponsorPhone = '';
    let sponsorShopName = '';
    let sponsorCode = '';
    let isReferred = false;

    const rawRefCode = (shopData.referredBy || initialReferralCode || '').trim().toUpperCase();

    if (rawRefCode) {
      const sponsorShop = shops.find(
        (s) =>
          (s.referralCode && s.referralCode.toUpperCase() === rawRefCode) ||
          (s.phone && s.phone.replace(/\s+/g, '').includes(rawRefCode))
      );

      const sponsorUser = usersList.find(
        (u) =>
          (u.referralCode && u.referralCode.toUpperCase() === rawRefCode) ||
          (u.phone && u.phone.replace(/\s+/g, '').includes(rawRefCode))
      );

      if (sponsorShop) {
        isReferred = true;
        sponsorId = sponsorShop.id;
        sponsorName = sponsorShop.ownerName;
        sponsorPhone = sponsorShop.phone;
        sponsorShopName = sponsorShop.name;
        sponsorCode = sponsorShop.referralCode || rawRefCode;

        const updatedCount = (sponsorShop.referralsCount || 0) + 1;
        const updatedEarnings = (sponsorShop.referralEarnings || 0) + 500;

        setShops((prev) =>
          prev.map((s) =>
            s.id === sponsorShop.id
              ? { ...s, referralsCount: updatedCount, referralEarnings: updatedEarnings }
              : s
          )
        );

        try {
          await updateDoc(doc(db, 'shops', sponsorShop.id), sanitizeForFirestore({
            referralsCount: updatedCount,
            referralEarnings: updatedEarnings,
          }));
        } catch (err) {
          console.warn('Could not update sponsor shop in Firestore:', err);
        }

        // Notify sponsor shop owner
        const sponsorNotif: VendorNotification = {
          id: `notif-ref-${Date.now()}`,
          shopId: sponsorShop.id,
          shopName: sponsorShop.name,
          message: `🎉 Parrainage Réussi ! ${newShop.ownerName} a ouvert la boutique "${newShop.name}" avec votre code (${sponsorCode}). Vos gains augmentent de +500 FCFA !`,
          read: false,
          type: 'referral_bonus',
          totalAmount: 500,
          customerName: newShop.ownerName,
          customerPhone: newShop.phone,
          customerCity: newShop.city,
          createdAt: now,
        };

        try {
          await setDoc(doc(db, 'vendor_notifications', sponsorNotif.id), sanitizeForFirestore(sponsorNotif));
        } catch (err) {
          console.warn('Could not create vendor notification:', err);
        }
      } else if (sponsorUser) {
        isReferred = true;
        sponsorId = sponsorUser.id;
        sponsorName = sponsorUser.fullName;
        sponsorPhone = sponsorUser.phone;
        sponsorShopName = 'Compte Utilisateur';
        sponsorCode = sponsorUser.referralCode || rawRefCode;

        const updatedCagnotte = (sponsorUser.cagnotteFCFA || 0) + 500;
        setUsersList((prev) =>
          prev.map((u) => (u.id === sponsorUser.id ? { ...u, cagnotteFCFA: updatedCagnotte } : u))
        );
        try {
          await updateDoc(doc(db, 'users', sponsorUser.id), sanitizeForFirestore({
            cagnotteFCFA: updatedCagnotte,
          }));
        } catch (err) {
          console.warn('Could not update sponsor user in Firestore:', err);
        }
      }
    }

    // Create Admin Notification document (so Abdoulaye sees who shared and who created)
    const adminNotifId = `admin-notif-${Date.now()}`;
    const adminNotif: AdminNotification = {
      id: adminNotifId,
      type: isReferred ? 'referral_shop_created' : 'new_shop',
      title: isReferred
        ? `🎁 Nouveau Parrainage : ${sponsorName} ➔ ${newShop.name}`
        : `🏪 Nouvelle Boutique Créée : ${newShop.name}`,
      message: isReferred
        ? `Le parrain "${sponsorName}" (${sponsorPhone}${sponsorShopName ? `, boutique: ${sponsorShopName}` : ''}) a partagé son code ${sponsorCode}.\n${newShop.ownerName} (${newShop.phone}) vient de créer la boutique "${newShop.name}" (${newShop.city}).\nPrime parrainage : +500 FCFA crédités.`
        : `${newShop.ownerName} (${newShop.phone}) a demandé l'ouverture de la boutique "${newShop.name}" (${newShop.city}). Frais d'ouverture : 1 500 FCFA.`,
      sponsorName: sponsorName || undefined,
      sponsorPhone: sponsorPhone || undefined,
      sponsorShopName: sponsorShopName || undefined,
      sponsorReferralCode: sponsorCode || rawRefCode || undefined,
      newShopId: newShop.id,
      newShopName: newShop.name,
      newOwnerName: newShop.ownerName,
      newShopPhone: newShop.phone,
      newShopCity: newShop.city,
      newShopRegion: newShop.region,
      bonusAmount: isReferred ? 500 : undefined,
      transactionRef: newShop.transactionRef,
      read: false,
      createdAt: now,
    };

    setAdminNotifications((prev) => [adminNotif, ...prev]);

    // Create Sponsor Notification in Firestore (Direct notification for the sponsor)
    let sponsorNotifData: SponsorNotification | null = null;
    if (isReferred) {
      const sponsorNotifId = `sponsor-notif-${Date.now()}`;
      sponsorNotifData = {
        id: sponsorNotifId,
        sponsorId: sponsorId,
        sponsorPhone: sponsorPhone || '',
        sponsorReferralCode: sponsorCode || rawRefCode,
        newShopId: newShop.id,
        newShopName: newShop.name,
        newOwnerName: newShop.ownerName,
        newShopPhone: newShop.phone,
        newShopCity: newShop.city,
        newShopRegion: newShop.region,
        bonusEarned: 500,
        message: `🎉 Félicitations ! Votre filleul ${newShop.ownerName} vient de créer sa boutique "${newShop.name}" (${newShop.city}) avec votre code de parrainage (${sponsorCode}). Une prime de 500 FCFA a été ajoutée à vos gains !`,
        read: false,
        createdAt: now,
      };
      setSponsorNotifications((prev) => [sponsorNotifData!, ...prev]);
    }

    // Optimistic state
    setShops((prev) => [newShop, ...prev]);
    setCurrentVendorShop(newShop);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_VENDOR, newShop.id);
    } catch {
      // ignore
    }

    try {
      await setDoc(doc(db, 'shops', shopId), sanitizeForFirestore(newShop));
      await setDoc(doc(db, 'admin_notifications', adminNotifId), sanitizeForFirestore(adminNotif));
      if (sponsorNotifData) {
        await setDoc(doc(db, 'sponsor_notifications', sponsorNotifData.id), sanitizeForFirestore(sponsorNotifData));
      }
      playNotificationSound();
      showToast(
        'Demande de boutique envoyée !',
        'success',
        isReferred
          ? `Boutique enregistrée via parrainage de ${sponsorName} ! Notification envoyée au parrain (+500 FCFA) et à l'administrateur.`
          : 'Capture de 1 500 FCFA transmise à l\'administrateur pour ouverture.'
      );
    } catch (err) {
      console.error('Error saving shop request:', err);
      showToast('Demande enregistrée localement', 'info');
    }

    return newShop;
  };

  // Admin approves shop & activates 30-day subscription
  const approveShop = async (shopId: string, adminNote?: string) => {
    const now = new Date();
    const approvedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days

    const updates: Partial<Shop> = {
      status: 'approuvee',
      approvedAt,
      expiresAt,
      adminNote: adminNote || 'Abonnement validé par l\'administrateur. Boutique active.',
    };

    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updates } : s))
    );

    if (currentVendorShop && currentVendorShop.id === shopId) {
      setCurrentVendorShop((prev) => (prev ? { ...prev, ...updates } : null));
    }

    // Send official decision PV to shop vendor space
    const noteText = adminNote ? `\nNote administrative : ${adminNote}` : '';
    await sendOfficialAdminPV(
      shopId,
      'approuvee',
      `🎉 Félicitations ! Votre demande d'ouverture / renouvellement de boutique a été validée par l'Administration Centrale.\nVotre abonnement de 30 jours est actif jusqu'au ${new Date(expiresAt).toLocaleDateString('fr-FR')}.${noteText}`,
      adminNote
    );

    try {
      await updateDoc(doc(db, 'shops', shopId), sanitizeForFirestore(updates));
      showToast('Boutique Ouverte !', 'success', 'Décision envoyée en PV à la boutique et statut actif validé.');
    } catch (err) {
      console.error('Error approving shop on Firestore:', err);
    }
  };

  // Admin rejects shop request
  const rejectShop = async (shopId: string, reason: string) => {
    const updates: Partial<Shop> = {
      status: 'refusee',
      adminNote: reason || 'Capture non valide ou paiement non reçu sur le 97470831.',
    };

    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updates } : s))
    );

    // Send official decision PV to shop vendor space
    await sendOfficialAdminPV(
      shopId,
      'refusee',
      `⚠️ Décision administrative : Votre demande d'ouverture / renouvellement a été refusée.\nMotif : ${reason || 'Capture non valide ou montant non reçu'}.\nVeuillez effectuer votre paiement de 1 500 FCFA sur le compte My Nita ou Amana Ta au 97470831 et renouveler votre capture.`,
      reason
    );

    try {
      await updateDoc(doc(db, 'shops', shopId), sanitizeForFirestore(updates));
      showToast('Demande refusée', 'warning', 'Notification de refus envoyée en PV à la boutique.');
    } catch (err) {
      console.error('Error rejecting shop on Firestore:', err);
    }
  };

  // Vendor updates shop profile (name, phone, neighborhood, description, logo, pinCode, etc.)
  const updateShopProfile = async (shopId: string, updates: Partial<Shop>) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updates } : s))
    );

    if (currentVendorShop && currentVendorShop.id === shopId) {
      setCurrentVendorShop((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      await updateDoc(doc(db, 'shops', shopId), sanitizeForFirestore(updates));
      showToast('Boutique mise à jour !', 'success', 'Vos modifications ont été enregistrées avec succès.');
    } catch (err) {
      console.error('Error updating shop in Firestore:', err);
      showToast('Modifications enregistrées localement', 'info');
    }
  };

  // Admin deletes shop permanently
  const deleteShop = async (shopId: string) => {
    setShops((prev) => prev.filter((s) => s.id !== shopId));
    if (currentVendorShop && currentVendorShop.id === shopId) {
      setCurrentVendorShop(null);
      try {
        localStorage.removeItem(STORAGE_KEY_CURRENT_VENDOR);
      } catch {
        // ignore
      }
    }

    try {
      await deleteDoc(doc(db, 'shops', shopId));
      showToast('Boutique supprimée', 'info', 'La boutique a été définitivement retirée de Golden Bee Store.');
    } catch (err) {
      console.error('Error deleting shop from Firestore:', err);
    }
  };

  // Renew vendor subscription with new proof
  const renewShopSubscription = async (shopId: string, newProofImage: string, transactionRef?: string) => {
    const updates: Partial<Shop> = {
      status: 'en_attente',
      paymentProofImage: newProofImage,
      transactionRef: transactionRef || '',
      adminNote: 'Renouvellement d\'abonnement de 1 500 FCFA envoyé. En attente de validation.',
    };

    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updates } : s))
    );

    try {
      await updateDoc(doc(db, 'shops', shopId), sanitizeForFirestore(updates));
      showToast('Preuve de renouvellement envoyée !', 'success', 'En attente de confirmation par l\'administrateur.');
    } catch (err) {
      console.error('Error renewing shop:', err);
    }
  };

  // Vendor Login using Phone and PIN
  const loginVendorShop = (phone: string, pinCode: string): Shop | null => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanPin = (pinCode || '').trim();

    const found = shops.find((s) => {
      const sPhone = (s.phone || '').replace(/\D/g, '');
      const phoneMatches = cleanPhone && (sPhone.endsWith(cleanPhone) || cleanPhone.endsWith(sPhone) || sPhone === cleanPhone);
      const pinMatches = String(s.pinCode || '').trim() === cleanPin;
      return phoneMatches && pinMatches;
    });

    if (found) {
      let vendorUser = usersList.find((u) => (u.phone || '').replace(/\D/g, '') === cleanPhone);
      if (!vendorUser) {
        vendorUser = {
          id: `user-${found.id}`,
          fullName: found.ownerName || found.name,
          phone: found.phone,
          countryCode: '+227',
          city: found.city || 'Agadez',
          neighborhood: found.neighborhood,
          password: cleanPin,
          role: 'vendor',
          cagnotteFCFA: found.referralEarnings || 0,
          createdAt: found.createdAt || new Date().toISOString(),
        };
        setUsersList((prev) => [...prev, vendorUser!]);
      }

      setCurrentUser(vendorUser);
      setCurrentVendorShop(found);
      try {
        localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(vendorUser));
        localStorage.setItem(STORAGE_KEY_CURRENT_VENDOR, found.id);
        localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      } catch {
        // ignore
      }
      showToast(`Bienvenue, ${found.name} ! 🏪`, 'success', 'Connecté à votre espace boutique vendeur.');
      return found;
    }

    showToast('Identifiants boutique incorrects', 'error', 'Vérifiez le numéro de téléphone et le code PIN de la boutique.');
    return null;
  };

  // Cloud Firestore Products management
  const addProduct = async (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const prodId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id: prodId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setProducts((prev) => [newProduct, ...prev]);

    try {
      await setDoc(doc(db, 'products', prodId), sanitizeForFirestore(newProduct));
      showToast('Produit publié en direct !', 'success', `${newProduct.name} est maintenant visible par tous.`);
    } catch (error) {
      console.error('Error adding product to Firestore:', error);
      showToast('Produit sauvegardé localement', 'warning', 'Enregistrement cloud en attente de réseau.');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    try {
      await updateDoc(doc(db, 'products', id), sanitizeForFirestore(updates));
      showToast('Produit mis à jour', 'success', 'Modifications publiées pour tous les utilisateurs.');
    } catch (error) {
      console.error('Error updating product in Firestore:', error);
      showToast('Mis à jour localement', 'info');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Produit supprimé', 'info', 'L\'article a été retiré pour tous les utilisateurs.');
    } catch (error) {
      console.error('Error deleting product from Firestore:', error);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    const finalStock = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: finalStock } : p))
    );

    try {
      await updateDoc(doc(db, 'products', productId), sanitizeForFirestore({ stock: finalStock }));
      showToast('Stock synchronisé', 'info', `Nouveau stock public : ${finalStock} unités.`);
    } catch (error) {
      console.error('Error updating stock in Firestore:', error);
    }
  };

  // Add customer verified review & recalculate product rating
  const addReview = async (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const revId = `rev-${Date.now()}`;
    const newRev: ProductReview = {
      ...reviewData,
      id: revId,
      createdAt: new Date().toISOString(),
    };

    // Update reviews state
    setReviews((prev) => [newRev, ...prev]);

    // Recalculate target product rating
    const targetProduct = products.find((p) => p.id === reviewData.productId);
    if (targetProduct) {
      const existingProductReviews = reviews.filter((r) => r.productId === reviewData.productId);
      const totalRatings = existingProductReviews.reduce((sum, r) => sum + r.rating, 0) + reviewData.rating;
      const count = existingProductReviews.length + 1;
      const newAvgRating = Number((totalRatings / count).toFixed(1));

      // Update product rating
      updateProduct(targetProduct.id, {
        rating: newAvgRating,
        reviewsCount: count,
      });
    }

    try {
      await setDoc(doc(db, 'reviews', revId), sanitizeForFirestore(newRev));
      showToast('Avis certifié publié !', 'success', 'Merci pour votre retour client.');
    } catch (error) {
      console.error('Error saving review to Firestore:', error);
      showToast('Avis enregistré', 'info');
    }
  };

  // Create Order & Cloud Firestore Sync with Escrow & Proof
  const createOrder = async (orderData: {
    customer: DeliveryAddress;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    nitaPhone?: string;
    paymentProofImage?: string;
    transactionRef?: string;
    shopId?: string;
    shopName?: string;
    isPickupInShop?: boolean;
  }): Promise<Order> => {
    const isPickup = orderData.isPickupInShop ?? (orderData.deliveryMethod.id === 'pickup_shop');
    const now = new Date().toISOString();
    const paymentRef = orderData.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Group items to order by shopId (supports single item or selected items)
    const itemsToOrder = effectiveCheckoutItems.length > 0 ? effectiveCheckoutItems : cart;
    const shopMap = new Map<string, CartItem[]>();
    itemsToOrder.forEach((item) => {
      const sId = item.product.shopId || orderData.shopId || 'shop-bee-agadez';
      if (!shopMap.has(sId)) {
        shopMap.set(sId, []);
      }
      shopMap.get(sId)!.push(item);
    });

    const isMultiShop = shopMap.size > 1;
    const baseOrderRandom = Math.floor(1000 + Math.random() * 9000);
    const createdOrders: Order[] = [];
    const generatedNotifs: VendorNotification[] = [];

    const effectiveTotalSubtotal = itemsToOrder.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

    let shopIndex = 1;
    for (const [sId, items] of shopMap.entries()) {
      const matchingShop = shops.find((s) => s.id === sId);
      const sName = matchingShop?.name || items[0]?.product.shopName || 'Boutique Golden Bee Store';
      const sPhone = matchingShop?.phone || items[0]?.product.shopPhone || '97470831';

      const shopSubtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
      // Proportionate discount for this shop
      const shopDiscount = effectiveTotalSubtotal > 0 ? Math.round((shopSubtotal / effectiveTotalSubtotal) * discountAmount) : 0;
      const shopDelivery = isPickup ? 0 : (isMultiShop ? (shopIndex === 1 ? orderData.deliveryMethod.price : 0) : orderData.deliveryMethod.price);
      const shopTotal = Math.max(0, shopSubtotal + shopDelivery - shopDiscount);

      const orderNumber = isMultiShop
        ? `BEE-2026-${baseOrderRandom}-${shopIndex}`
        : `BEE-2026-${baseOrderRandom}`;
      const orderId = `ord-${Date.now()}-${shopIndex}`;

      const orderForShop: Order = {
        id: orderId,
        orderNumber,
        customer: orderData.customer,
        items: [...items],
        subtotal: shopSubtotal,
        deliveryMethod: orderData.deliveryMethod,
        deliveryCost: shopDelivery,
        discount: shopDiscount,
        total: shopTotal,
        paymentMethod: orderData.paymentMethod,
        paymentReference: paymentRef,
        paymentStatus: 'reussi',
        nitaPhoneNumber: orderData.nitaPhone || orderData.customer.phone,
        paymentProofImage: orderData.paymentProofImage,
        shopId: sId,
        shopName: sName,
        shopPhone: sPhone,
        isPickupInShop: isPickup,
        adminEscrowValidated: true,
        vendorDeliveryValidated: false,
        orderStatus: 'nouvelle_commande_whatsapp',
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            status: 'nouvelle_commande_whatsapp',
            title: `Commande transmise à ${sName} sur WhatsApp`,
            description: `Commande directe de ${shopTotal.toLocaleString('fr-FR')} FCFA (${items.length} article${items.length > 1 ? 's' : ''}) adressée à la boutique ${sName}. Mode: ${
              isPickup ? 'Retrait sur place en boutique (0 FCFA)' : 'Livraison à domicile (1 000 FCFA)'
            }.`,
            timestamp: now,
          },
        ],
      };

      createdOrders.push(orderForShop);

      const notifId = `notif-${Date.now()}-${sId.slice(-6)}`;
      const notifData: VendorNotification = {
        id: notifId,
        shopId: sId,
        shopName: sName,
        orderId,
        orderNumber,
        customerName: orderData.customer.fullName,
        customerPhone: orderData.customer.phone,
        customerCity: `${orderData.customer.city}${
          orderData.customer.neighborhood ? ` (${orderData.customer.neighborhood})` : ''
        }`,
        itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: shopTotal,
        message: `Nouvelle commande #${orderNumber} passée par ${orderData.customer.fullName} (${orderData.customer.phone}). Total: ${shopTotal.toLocaleString('fr-FR')} FCFA.`,
        read: false,
        createdAt: now,
      };

      generatedNotifs.push(notifData);
      shopIndex++;
    }

    // Deduct stock in real-time on Firestore and create vendor notifications
    try {
      const batch = writeBatch(db);

      // Save all orders in Firestore
      createdOrders.forEach((ord) => {
        batch.set(doc(db, 'orders', ord.id), sanitizeForFirestore(ord));
      });

      // Save vendor notifications
      generatedNotifs.forEach((notif) => {
        batch.set(doc(db, 'vendor_notifications', notif.id), sanitizeForFirestore(notif));
      });

      // Decrement product stocks for ordered items only
      itemsToOrder.forEach((cartItem) => {
        const currentProd = products.find((p) => p.id === cartItem.product.id);
        if (currentProd) {
          const newStock = Math.max(0, currentProd.stock - cartItem.quantity);
          batch.update(doc(db, 'products', cartItem.product.id), sanitizeForFirestore({ stock: newStock }));
        }
      });

      await batch.commit();

      if (generatedNotifs.length > 0) {
        setVendorNotifications((prev) => [...generatedNotifs, ...prev]);
        // Sound alert
        playNotificationSound('order_received');
      }
    } catch (error) {
      console.error('Error saving orders and notifications to Firestore:', error);
    }

    setOrders((prev) => [...createdOrders, ...prev]);
    setLastCompletedOrder(createdOrders[0] || null);
    setLastCompletedOrders(createdOrders);

    // Push local notification for buyer tracking in real-time
    createdOrders.forEach((newOrd) => {
      addLocalNotification({
        type: 'order_created',
        title: `🛍️ Commande Confirmée : ${newOrd.orderNumber}`,
        message: `Votre commande (${newOrd.total.toLocaleString('fr-FR')} FCFA) a été enregistrée. Suivez son avancement en direct !`,
        orderNumber: newOrd.orderNumber,
        orderStatus: newOrd.orderStatus,
        linkTab: 'tracking',
        read: false,
      });
    });

    // Remove ONLY ordered items from cart (leaving remaining items intact for next purchase)
    const orderedIds = new Set(itemsToOrder.map((it) => it.product.id));
    setCart((prev) => prev.filter((it) => !orderedIds.has(it.product.id)));
    setSelectedCartItemIds((prev) => prev.filter((id) => !orderedIds.has(id)));
    setCheckoutTargetItems(null);

    showToast(
      isMultiShop ? 'Commandes enregistrées !' : 'Commande enregistrée !',
      'success',
      isMultiShop
        ? `Vos commandes pour ${createdOrders.length} boutiques différentes ont été transmises.`
        : 'Le gérant de la boutique a reçu la notification instantanée.'
    );

    return createdOrders[0];
  };

  // Vendor notifications management
  const markVendorNotificationAsRead = async (notifId: string) => {
    setVendorNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'vendor_notifications', notifId), sanitizeForFirestore({ read: true }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const clearVendorNotifications = async (shopId: string) => {
    const toDelete = vendorNotifications.filter((n) => n.shopId === shopId);
    setVendorNotifications((prev) => prev.filter((n) => n.shopId !== shopId));

    try {
      const batch = writeBatch(db);
      toDelete.forEach((n) => {
        batch.delete(doc(db, 'vendor_notifications', n.id));
      });
      await batch.commit();
      showToast('Notifications effacées', 'info');
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  // Admin notifications management (Referrals, new shops, alerts)
  const markAdminNotificationAsRead = async (notifId: string) => {
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'admin_notifications', notifId), sanitizeForFirestore({ read: true }));
    } catch (err) {
      console.error('Error marking admin notification as read:', err);
    }
  };

  const clearAdminNotifications = async () => {
    const ids = adminNotifications.map((n) => n.id);
    setAdminNotifications([]);
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        batch.delete(doc(db, 'admin_notifications', id));
      });
      await batch.commit();
      showToast('Alertes admin effacées', 'info');
    } catch (err) {
      console.error('Error clearing admin notifications:', err);
    }
  };

  // Sponsor notifications management (Referrals, new shops by referees)
  const markSponsorNotificationAsRead = async (notifId: string) => {
    setSponsorNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'sponsor_notifications', notifId), sanitizeForFirestore({ read: true }));
    } catch (err) {
      console.error('Error marking sponsor notification as read:', err);
    }
  };

  const clearSponsorNotifications = async (referralCodeOrPhone?: string) => {
    const toDelete = referralCodeOrPhone
      ? sponsorNotifications.filter(
          (n) =>
            n.sponsorReferralCode === referralCodeOrPhone ||
            n.sponsorPhone === referralCodeOrPhone ||
            n.sponsorId === referralCodeOrPhone
        )
      : sponsorNotifications;

    setSponsorNotifications((prev) =>
      referralCodeOrPhone
        ? prev.filter(
            (n) =>
              n.sponsorReferralCode !== referralCodeOrPhone &&
              n.sponsorPhone !== referralCodeOrPhone &&
              n.sponsorId !== referralCodeOrPhone
          )
        : []
    );

    try {
      const batch = writeBatch(db);
      toDelete.forEach((n) => {
        batch.delete(doc(db, 'sponsor_notifications', n.id));
      });
      await batch.commit();
      showToast('Notifications de parrainage effacées', 'info');
    } catch (err) {
      console.error('Error clearing sponsor notifications:', err);
    }
  };

  // 1. Admin validates Customer payment screenshot
  const adminValidateCustomerPayment = async (orderId: string, customNote?: string) => {
    const now = new Date().toISOString();
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    const newTimeline = [
      ...existingOrder.timeline,
      {
        status: 'fonds_bloques_sequestre' as OrderStatus,
        title: 'Paiement Client Confirmé (Compte 97470831)',
        description:
          customNote ||
          `L'administrateur a validé la réception du paiement de ${existingOrder.total.toLocaleString(
            'fr-FR'
          )} FCFA sur le compte 97470831. La boutique est notifiée pour préparer et livrer la commande.`,
        timestamp: now,
      },
    ];

    const updates: Partial<Order> = {
      orderStatus: 'fonds_bloques_sequestre',
      adminEscrowValidated: true,
      updatedAt: now,
      timeline: newTimeline,
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updates));
      showToast(
        'Paiement Client Validé',
        'success',
        `Le paiement de la commande ${existingOrder.orderNumber} a été validé.`
      );

      // Trigger local tracking alert
      addLocalNotification({
        type: 'order_status',
        title: `✅ Paiement Validé : ${existingOrder.orderNumber}`,
        message: 'Votre reçu a été vérifié sur le compte 97470831. La boutique prépare vos articles.',
        orderNumber: existingOrder.orderNumber,
        orderStatus: 'fonds_bloques_sequestre',
        linkTab: 'tracking',
        read: false,
      });
    } catch (error) {
      console.error('Error validating customer payment:', error);
    }
  };

  // 2. Vendor uploads Proof of Delivery/Handover to Client
  const vendorSubmitDeliveryProof = async (
    orderId: string,
    deliveryProofImage: string,
    note?: string
  ) => {
    const now = new Date().toISOString();
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    // Trigger audible notification chime
    playNotificationSound('delivery_proof');

    const newTimeline = [
      ...existingOrder.timeline,
      {
        status: 'remis_client_attente_liberation' as OrderStatus,
        title: 'Produit remis au client & Preuve envoyée',
        description:
          note ||
          `La boutique ${existingOrder.shopName || 'partenaire'} a remis le produit au client et transmis la photo de preuve. En attente de confirmation finale par l'Administrateur.`,
        timestamp: now,
      },
    ];

    const updates: Partial<Order> = {
      orderStatus: 'remis_client_attente_liberation',
      vendorDeliveryProofImage: deliveryProofImage,
      vendorHandoverDate: now,
      vendorHandoverNote: note,
      vendorDeliveryValidated: true,
      updatedAt: now,
      timeline: newTimeline,
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updates));
      showToast(
        '🚨 Preuve de remise transmise !',
        'success',
        `L'administrateur a reçu la confirmation pour transférer les ${existingOrder.total.toLocaleString('fr-FR')} FCFA vers votre compte.`
      );
    } catch (error) {
      console.error('Error submitting vendor delivery proof:', error);
    }
  };

  // 3. Admin transfers funds to Vendor
  const adminReleaseFundsToVendor = async (orderId: string, customNote?: string) => {
    const now = new Date().toISOString();
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    const newTimeline = [
      ...existingOrder.timeline,
      {
        status: 'fonds_liberes_vendeur' as OrderStatus,
        title: 'Gains Transférés au Vendeur',
        description:
          customNote ||
          `L'administrateur a vérifié la preuve de livraison du vendeur. Les gains de ${existingOrder.total.toLocaleString(
            'fr-FR'
          )} FCFA ont été envoyés au propriétaire de la boutique. Transaction Golden Bee Store terminée avec succès !`,
        timestamp: now,
      },
    ];

    const updates: Partial<Order> = {
      orderStatus: 'fonds_liberes_vendeur',
      adminFundsReleaseDate: now,
      adminFundsReleaseNote: customNote || 'Gains transférés au vendeur suite à la validation de la preuve de remise.',
      updatedAt: now,
      timeline: newTimeline,
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updates));
      showToast(
        'Gains Transférés au Vendeur !',
        'success',
        `Paiement complété pour la commande ${existingOrder.orderNumber}.`
      );

      // Trigger local tracking notification
      addLocalNotification({
        type: 'order_status',
        title: `🎉 Commande Clôturée : ${existingOrder.orderNumber}`,
        message: 'Produit remis avec succès. Merci d\'avoir choisi Golden Bee Store !',
        orderNumber: existingOrder.orderNumber,
        orderStatus: 'fonds_liberes_vendeur',
        linkTab: 'tracking',
        read: false,
      });
    } catch (error) {
      console.error('Error releasing funds to vendor:', error);
    }
  };

  // Update order status (Admin & Cloud sync)
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, customNote?: string) => {
    const now = new Date().toISOString();

    const statusTitles: Record<OrderStatus, string> = {
      nouvelle_commande_whatsapp: 'Nouvelle commande WhatsApp (Direct client-vendeur)',
      en_attente_validation_admi: 'Attente vérification reçu client (97470831)',
      fonds_bloques_sequestre: 'Paiement Confirmé & En Préparation',
      en_preparation: 'Colis en cours de préparation par la boutique',
      remis_client_attente_liberation: 'Produit remis au client (Preuve photo envoyée)',
      fonds_liberes_vendeur: 'Gains Transférés au Vendeur (Terminée)',
      livree: 'Commande livrée avec succès',
      annulee: 'Commande annulée',
      en_attente: 'En attente de paiement',
      payee_nita: 'Paiement validé (97470831)',
      en_livraison: 'Colis en cours de livraison / Prêt pour retrait',
    };

    const statusDescriptions: Record<OrderStatus, string> = {
      nouvelle_commande_whatsapp: 'Commande directe transmise au vendeur sur WhatsApp.',
      en_attente_validation_admi: 'Capture du transfert client transmise vers le 97470831 en attente de validation.',
      fonds_bloques_sequestre: 'Le paiement est validé. La boutique prépare votre commande.',
      en_preparation: 'La boutique prépare les articles commandés.',
      remis_client_attente_liberation: 'Le vendeur a remis le colis au client avec photo de preuve.',
      fonds_liberes_vendeur: 'Gains envoyés au gérant de la boutique. Transaction réussie.',
      livree: 'Le colis a été remis au client. Merci d\'avoir choisi Golden Bee Store !',
      annulee: 'La commande a été annulée.',
      en_attente: 'En attente de règlement.',
      payee_nita: 'Le paiement a été confirmé.',
      en_livraison: 'Le coursier est en route vers votre adresse de livraison ou votre colis est prêt au comptoir.',
    };

    const existingOrder = orders.find((o) => o.id === orderId);
    const existingTimeline = existingOrder?.timeline || [];

    const newTimeline = [
      ...existingTimeline,
      {
        status: newStatus,
        title: statusTitles[newStatus] || newStatus,
        description: customNote || statusDescriptions[newStatus] || 'Mise à jour du statut',
        timestamp: now,
      },
    ];

    const updates = {
      orderStatus: newStatus,
      updatedAt: now,
      timeline: newTimeline,
    };

    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, ...updates } : order))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updates));
      showToast('Statut mis à jour en direct', 'success', `Nouveau statut: ${statusTitles[newStatus] || newStatus}`);

      // Dispatch local notification alert in real-time
      const targetNum = existingOrder?.orderNumber || 'CMD';
      addLocalNotification({
        type: 'order_status',
        title: `📦 Suivi : Commande ${targetNum}`,
        message: `${statusTitles[newStatus] || newStatus} — ${customNote || statusDescriptions[newStatus] || ''}`,
        orderNumber: targetNum,
        orderStatus: newStatus,
        linkTab: 'tracking',
        read: false,
      });
    } catch (error) {
      console.error('Error updating order on Firestore:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      showToast('Commande supprimée', 'info');
    } catch (error) {
      console.error('Error deleting order from Firestore:', error);
    }
  };

  // Admin Auth Methods
  const adminEmail = ADMIN_MASTER_EMAIL;

  const loginAdmin = (identifierInput: string, passwordInput: string): boolean => {
    const cleanIdentifier = identifierInput.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPassword = passwordInput.trim();

    const isAuthorizedEmail = cleanIdentifier === ADMIN_MASTER_EMAIL.toLowerCase();
    const isAuthorizedPhone =
      cleanIdentifier === '97470831' ||
      cleanIdentifier === '+22797470831' ||
      cleanIdentifier === '22797470831' ||
      cleanIdentifier === '0022797470831';

    if ((isAuthorizedEmail || isAuthorizedPhone) && cleanPassword === ADMIN_MASTER_PASSWORD) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      } catch {
        // ignore
      }
      showToast('Connexion Administrateur Réussie 🛡️', 'success', 'Bienvenue dans votre espace d\'administration sécurisé.');
      return true;
    } else {
      showToast('Accès Refusé ⛔', 'error', 'Identifiants administrateur incorrects. Seul le propriétaire est autorisé.');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    } catch {
      // ignore
    }
    showToast('Déconnexion effectuée', 'info', 'Espace administrateur reverrouillé.');
  };

  // 1-Click Batch Automation Functions (Rendre les actions difficiles faciles)
  const batchValidatePayments = async (orderIds: string[]) => {
    if (orderIds.length === 0) return;
    for (const id of orderIds) {
      await adminValidateCustomerPayment(id);
    }
    showToast('Validation par lot terminée', 'success', `${orderIds.length} paiement(s) client(s) validé(s).`);
  };

  const batchReleaseFunds = async (orderIds: string[]) => {
    if (orderIds.length === 0) return;
    for (const id of orderIds) {
      await adminReleaseFundsToVendor(id);
    }
    showToast('Libération par lot terminée', 'success', `Gains libérés pour ${orderIds.length} commande(s).`);
  };

  const batchApproveShops = async (shopIds: string[]) => {
    if (shopIds.length === 0) return;
    for (const id of shopIds) {
      await approveShop(id);
    }
    showToast('Boutiques activées par lot', 'success', `${shopIds.length} boutique(s) ouverte(s) pour 30 jours.`);
  };

  const batchRestockProducts = async (increment: number = 15) => {
    const lowStockProds = products.filter((p) => p.stock <= p.lowStockThreshold);
    if (lowStockProds.length === 0) {
      showToast('Stocks au complet', 'info', 'Aucun produit en rupture ou stock bas.');
      return;
    }

    try {
      const batch = writeBatch(db);
      lowStockProds.forEach((p) => {
        const newStock = p.stock + increment;
        batch.update(doc(db, 'products', p.id), { stock: newStock });
      });
      await batch.commit();

      setProducts((prev) =>
        prev.map((p) => {
          const match = lowStockProds.find((lp) => lp.id === p.id);
          return match ? { ...p, stock: p.stock + increment } : p;
        })
      );
      showToast('Réassort par lot réussi !', 'success', `+${increment} unités ajoutées à ${lowStockProds.length} produit(s).`);
    } catch (error) {
      console.error('Error batch restocking:', error);
    }
  };

  // Search order for client tracking
  const searchOrder = (orderNum: string): Order | undefined => {
    const clean = orderNum.trim().toUpperCase();
    return orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === clean ||
        o.id.toUpperCase() === clean ||
        o.paymentReference.toUpperCase() === clean
    );
  };

  // ==========================================
  // GOLDEN BEE TRADE / 7-DAY CHAT SYSTEM
  // ==========================================
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        // Filter out conversations older than 7 days without recent activity
        const valid = parsed.filter((c) => {
          const time = new Date(c.updatedAt || c.createdAt).getTime();
          return Date.now() - time <= SEVEN_DAYS_MS;
        });
        return valid.length > 0 ? valid : INITIAL_CONVERSATIONS;
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
    return INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        // Purge messages older than 7 days to strictly respect the 7-day storage optimization constraint
        const valid = parsed.filter((m) => !isMessageExpired(m.createdAt));
        return valid.length > 0 ? valid : INITIAL_MESSAGES;
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
    return INITIAL_MESSAGES;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Auto-purge routine: Cleanup expired messages older than 7 days
  const cleanupExpiredChatMessages = () => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => !isMessageExpired(m.createdAt));
      try {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });

    setConversations((prev) => {
      const filtered = prev.filter((c) => {
        const time = new Date(c.updatedAt || c.createdAt).getTime();
        return Date.now() - time <= SEVEN_DAYS_MS;
      });
      try {
        localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
  };

  // Run 7-day auto-purge on startup & interval
  useEffect(() => {
    cleanupExpiredChatMessages();
    const interval = setInterval(cleanupExpiredChatMessages, 30 * 60 * 1000); // Check every 30 mins
    return () => clearInterval(interval);
  }, []);

  // Save conversations and messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Compute total unread messages count for buyer badge
  const unreadChatCount = conversations.reduce((sum, c) => sum + (c.unreadCountBuyer || 0), 0);

  // Compute unread messages count for currently logged in vendor shop
  const vendorUnreadChatCount = currentVendorShop
    ? conversations.reduce(
        (sum, c) => (c.shopId === currentVendorShop.id ? sum + (c.unreadCountVendor || 0) : sum),
        0
      )
    : 0;

  // Send official administrative decision PV to a shop
  const sendOfficialAdminPV = async (
    shopId: string,
    decisionType: 'approuvee' | 'refusee' | 'note' | 'rappel',
    messageText: string,
    adminNote?: string
  ) => {
    const targetShop = shops.find((s) => s.id === shopId) || {
      id: shopId,
      name: 'Boutique Partenaire',
      logoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
      phone: '97470831',
      city: 'Agadez / Niamey',
    };

    const convId = `admin_official_shop_${shopId}`;
    const nowIso = new Date().toISOString();

    const existingConv = conversations.find(
      (c) => c.id === convId || (c.shopId === shopId && c.isAdminOfficial)
    );

    const updatedConv: Conversation = {
      id: existingConv ? existingConv.id : convId,
      shopId: targetShop.id,
      shopName: targetShop.name,
      shopLogo: targetShop.logoUrl,
      shopPhone: targetShop.phone,
      shopCity: targetShop.city,
      isVerifiedShop: true,
      isAdminOfficial: true,
      lastDecisionStatus: decisionType === 'approuvee' ? 'approuvee' : decisionType === 'refusee' ? 'refusee' : undefined,
      buyerId: 'admin-central',
      buyerName: '👑 Administration Centrale Golden Bee Store',
      buyerPhone: '97470831',
      lastMessageText: `[Décision ${decisionType.toUpperCase()}] ${messageText.slice(0, 70)}...`,
      lastMessageTime: nowIso,
      unreadCountBuyer: 0,
      unreadCountVendor: (existingConv?.unreadCountVendor || 0) + 1,
      createdAt: existingConv?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const newMsgId = `admin-msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: newMsgId,
      conversationId: updatedConv.id,
      senderId: 'admin-central',
      senderName: '👑 Administration Centrale Golden Bee Store',
      senderRole: 'system',
      text: messageText,
      isAdminDecision: true,
      decisionType,
      adminNote: adminNote || undefined,
      createdAt: nowIso,
      expiresAt: getExpirationDate(nowIso),
      read: false,
    };

    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedConv.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedConv;
        return copy;
      }
      return [updatedConv, ...prev];
    });

    setMessages((prev) => [...prev, newMsg]);

    // Send visual/auditory vendor notification
    const notifId = `vnotif-dec-${Date.now()}`;
    const vendorNotif: VendorNotification = {
      id: notifId,
      shopId,
      orderId: updatedConv.id,
      orderNumber: `PV-${decisionType.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Administration Centrale',
      customerCity: 'Siège Niamey & Agadez',
      totalAmount: 0,
      itemsCount: 1,
      firstItemName: `Décision administrative : ${decisionType.toUpperCase()}`,
      message: messageText,
      type: 'system',
      createdAt: nowIso,
      read: false,
    };

    setVendorNotifications((prev) => [vendorNotif, ...prev]);

    try {
      await setDoc(doc(db, 'conversations', updatedConv.id), sanitizeForFirestore(updatedConv));
      await setDoc(doc(db, 'messages', newMsg.id), sanitizeForFirestore(newMsg));
      await setDoc(doc(db, 'vendor_notifications', notifId), sanitizeForFirestore(vendorNotif));
    } catch (err) {
      console.warn('Error saving admin official PV to Firestore:', err);
    }
  };

  const adminSendShopPVMessage = async (
    shopId: string,
    text: string,
    decisionType: 'approuvee' | 'refusee' | 'note' | 'rappel' = 'note'
  ) => {
    await sendOfficialAdminPV(shopId, decisionType, text);
    showToast('Message PV transmis à la boutique', 'success', 'Le gérant recevra la notification dans son espace boutique.');
  };

  // Start or open existing conversation with a shop / for a specific product
  const startOrOpenConversation = async (shopId: string, product?: Product): Promise<string> => {
    const targetShop = shops.find((s) => s.id === shopId) || {
      id: shopId,
      name: product?.shopName || 'Fournisseur Agréé Golden Bee',
      logoUrl: product?.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
      phone: product?.shopPhone || '97470831',
      city: 'Agadez / Niamey',
    };

    const buyerId = currentUser ? currentUser.id : 'user-default';
    const buyerName = currentUser ? currentUser.fullName : (deliveryAddress.fullName || 'Client Acheteur');
    const buyerPhone = currentUser ? currentUser.phone : (deliveryAddress.phone || '97470831');

    // Find existing conversation with this shop
    let existingConv = conversations.find(
      (c) => c.shopId === shopId && (c.buyerId === buyerId || c.buyerPhone === buyerPhone) && !c.isAdminOfficial
    );

    const nowIso = new Date().toISOString();

    if (!existingConv) {
      // Create new conversation
      const newConvId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newConv: Conversation = {
        id: newConvId,
        shopId: targetShop.id,
        shopName: targetShop.name,
        shopLogo: targetShop.logoUrl,
        shopPhone: targetShop.phone,
        shopCity: targetShop.city,
        isVerifiedShop: true,
        buyerId,
        buyerName,
        buyerPhone,
        lastMessageText: product
          ? `Demande de devis / renseignement : ${product.name}`
          : 'Nouvelle discussion avec le vendeur',
        lastMessageTime: nowIso,
        unreadCountBuyer: 0,
        unreadCountVendor: 1,
        productId: product?.id,
        productName: product?.name,
        productImage: product?.image,
        productPrice: product?.price,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setConversations((prev) => [newConv, ...prev]);
      existingConv = newConv;

      try {
        await setDoc(doc(db, 'conversations', newConvId), sanitizeForFirestore(newConv));
      } catch {}

      // If product provided, add initial inquiry message
      if (product) {
        const initialMsgId = `msg-${Date.now()}-1`;
        const initialMsg: ChatMessage = {
          id: initialMsgId,
          conversationId: newConvId,
          senderId: buyerId,
          senderName: buyerName,
          senderRole: 'buyer',
          text: `Bonjour ! Je suis intéressé(e) par votre article : "${product.name}" (${product.price.toLocaleString('fr-FR')} FCFA). Est-ce disponible en stock ?`,
          createdAt: nowIso,
          expiresAt: getExpirationDate(nowIso),
          read: true,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          productPrice: product.price,
        };
        setMessages((prev) => [...prev, initialMsg]);
        try {
          await setDoc(doc(db, 'messages', initialMsgId), sanitizeForFirestore(initialMsg));
        } catch {}
      }
    } else if (product && existingConv.productId !== product.id) {
      // Update existing conversation with current product
      const updatedExisting: Conversation = {
        ...existingConv,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
        updatedAt: nowIso,
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === existingConv!.id ? updatedExisting : c))
      );

      // Add product inquiry message
      const inquiryMsgId = `msg-${Date.now()}`;
      const inquiryMsg: ChatMessage = {
        id: inquiryMsgId,
        conversationId: existingConv.id,
        senderId: buyerId,
        senderName: buyerName,
        senderRole: 'buyer',
        text: `Bonjour ! Je regarde également "${product.name}" (${product.price.toLocaleString('fr-FR')} FCFA). Pouvez-vous me donner des précisions ?`,
        createdAt: nowIso,
        expiresAt: getExpirationDate(nowIso),
        read: true,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
      };
      setMessages((prev) => [...prev, inquiryMsg]);

      try {
        await setDoc(doc(db, 'conversations', existingConv.id), sanitizeForFirestore(updatedExisting));
        await setDoc(doc(db, 'messages', inquiryMsgId), sanitizeForFirestore(inquiryMsg));
      } catch {}
    }

    setActiveConversationId(existingConv.id);
    setActiveTab('chat');
    return existingConv.id;
  };

  // Send a chat message with live Firestore synchronization
  const sendChatMessage = async (
    conversationId: string,
    text: string,
    attachedProduct?: Product,
    customSenderRole?: 'buyer' | 'vendor' | 'system',
    attachmentUrl?: string
  ) => {
    if (!text.trim() && !attachedProduct && !attachmentUrl) return;

    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const buyerId = currentUser ? currentUser.id : 'user-default';
    const buyerName = currentUser ? currentUser.fullName : (deliveryAddress.fullName || 'Client Acheteur');
    const isSenderVendor = customSenderRole === 'vendor' || (currentVendorShop && currentVendorShop.id === conv.shopId);
    const senderRole = customSenderRole || (isSenderVendor ? 'vendor' : 'buyer');

    const nowIso = new Date().toISOString();
    const newMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: newMsgId,
      conversationId,
      senderId: isSenderVendor ? conv.shopId : (customSenderRole === 'system' ? 'admin-central' : buyerId),
      senderName: isSenderVendor ? conv.shopName : (customSenderRole === 'system' ? '👑 Administration Centrale' : buyerName),
      senderRole,
      text: text.trim(),
      attachmentUrl,
      createdAt: nowIso,
      expiresAt: getExpirationDate(nowIso),
      read: true,
      productId: attachedProduct?.id,
      productName: attachedProduct?.name,
      productImage: attachedProduct?.image,
      productPrice: attachedProduct?.price,
    };

    setMessages((prev) => [...prev, newMsg]);

    const updatedConv: Conversation = {
      ...conv,
      lastMessageText: text.trim() || (attachedProduct ? `Article : ${attachedProduct.name}` : 'Pièce jointe envoyée'),
      lastMessageTime: nowIso,
      updatedAt: nowIso,
      unreadCountBuyer: isSenderVendor ? (conv.unreadCountBuyer || 0) + 1 : conv.unreadCountBuyer,
      unreadCountVendor: !isSenderVendor ? (conv.unreadCountVendor || 0) + 1 : conv.unreadCountVendor,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? updatedConv : c))
    );

    // Save to Firestore
    try {
      await setDoc(doc(db, 'conversations', conversationId), sanitizeForFirestore(updatedConv));
      await setDoc(doc(db, 'messages', newMsgId), sanitizeForFirestore(newMsg));
    } catch (err) {
      console.warn('Error saving chat message to Firestore:', err);
    }

    try {
      playNotificationSound();
    } catch {}
  };

  // Mark all buyer messages in a conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.conversationId === conversationId && m.senderRole !== 'buyer' ? { ...m, read: true } : m))
    );
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCountBuyer: 0 } : c))
    );
    try {
      await updateDoc(doc(db, 'conversations', conversationId), { unreadCountBuyer: 0 });
    } catch {}
  };

  // Mark all vendor messages in a conversation as read
  const markVendorConversationAsRead = async (conversationId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.conversationId === conversationId && m.senderRole !== 'vendor' ? { ...m, read: true } : m))
    );
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCountVendor: 0 } : c))
    );
    try {
      await updateDoc(doc(db, 'conversations', conversationId), { unreadCountVendor: 0 });
    } catch {}
  };

  // Delete conversation and its messages
  const deleteConversation = async (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    setMessages((prev) => prev.filter((m) => m.conversationId !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
    try {
      await deleteDoc(doc(db, 'conversations', conversationId));
    } catch {}
    showToast('Discussion supprimée', 'info', 'La conversation a été retirée.');
  };

  // Start or open a dedicated Central Administration Support conversation
  const startSupportConversation = async (
    initialMessage?: string,
    relatedOrderNumber?: string
  ): Promise<string> => {
    const userPhone = currentUser?.phone || deliveryAddress?.phone || '97470831';
    const userName = currentUser?.fullName || deliveryAddress?.fullName || 'Client / Vendeur';
    const supportConvId = `conv-support-${currentUser?.id || userPhone.replace(/[^0-9]/g, '') || 'guest'}`;
    const now = new Date().toISOString();
    const existing = conversations.find((c) => c.id === supportConvId);

    const supportConv: Conversation = {
      id: supportConvId,
      buyerId: currentUser?.id || `user-${userPhone}`,
      buyerName: userName,
      buyerPhone: userPhone,
      shopId: 'shop-bee-officielle',
      shopName: '👑 Support Central Abdourahmen (Golden Bee Store)',
      shopLogo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
      shopPhone: '97470831',
      shopCity: 'Agadez / Niamey',
      lastMessageText: initialMessage || 'Demande d\'assistance ou question ouverte avec Abdourahmen (Support Central).',
      lastMessageTime: now,
      unreadCountBuyer: 0,
      unreadCountVendor: 1,
      orderNumber: relatedOrderNumber,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== supportConvId);
      return [supportConv, ...filtered];
    });
    setActiveConversationId(supportConvId);
    setActiveTab('chat');

    try {
      await setDoc(doc(db, 'conversations', supportConvId), sanitizeForFirestore(supportConv));
      if (initialMessage) {
        const msgId = `msg-${Date.now()}`;
        const msgData: ChatMessage = {
          id: msgId,
          conversationId: supportConvId,
          senderId: currentUser?.id || `user-${userPhone}`,
          senderName: userName,
          senderRole: 'buyer',
          text: initialMessage,
          createdAt: now,
          expiresAt: getExpirationDate(now),
          read: false,
        };
        await setDoc(doc(db, 'messages', msgId), sanitizeForFirestore(msgData));
        setMessages((prev) => [...prev, msgData]);
      }
    } catch (err) {
      console.warn('Error starting support conversation in Firestore:', err);
    }

    showToast('Discussion ouverte avec le Support Central', 'success');
    return supportConvId;
  };

  // Database Storage Optimization & Purge Routine
  const purgeDatabaseStorage = async (options?: {
    purgeReadNotifications?: boolean;
    purgeOldChatMessages?: boolean;
    purgeValidatedOrderProofs?: boolean;
  }): Promise<{ notificationsDeleted: number; messagesDeleted: number; proofsCleaned: number }> => {
    const {
      purgeReadNotifications = true,
      purgeOldChatMessages = true,
      purgeValidatedOrderProofs = true,
    } = options || {};

    let notificationsDeleted = 0;
    let messagesDeleted = 0;
    let proofsCleaned = 0;

    try {
      const batch = writeBatch(db);
      let batchOps = 0;

      // 1. Clean read notifications (vendor, admin, sponsor)
      if (purgeReadNotifications) {
        const readAdminNotifs = adminNotifications.filter((n) => n.read);
        readAdminNotifs.forEach((n) => {
          batch.delete(doc(db, 'admin_notifications', n.id));
          batchOps++;
          notificationsDeleted++;
        });

        const readVendorNotifs = vendorNotifications.filter((n) => n.read);
        readVendorNotifs.forEach((n) => {
          batch.delete(doc(db, 'vendor_notifications', n.id));
          batchOps++;
          notificationsDeleted++;
        });

        const readSponsorNotifs = sponsorNotifications.filter((n) => n.read);
        readSponsorNotifs.forEach((n) => {
          batch.delete(doc(db, 'sponsor_notifications', n.id));
          batchOps++;
          notificationsDeleted++;
        });

        // Update local states
        setAdminNotifications((prev) => prev.filter((n) => !n.read));
        setVendorNotifications((prev) => prev.filter((n) => !n.read));
        setSponsorNotifications((prev) => prev.filter((n) => !n.read));
      }

      // 2. Clean old chat messages expired > 7 days or older than 14 days
      if (purgeOldChatMessages) {
        const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const oldMessages = messages.filter((m) => {
          const time = new Date(m.createdAt).getTime();
          return now - time > FOURTEEN_DAYS_MS || isMessageExpired(m.createdAt);
        });

        oldMessages.forEach((m) => {
          batch.delete(doc(db, 'messages', m.id));
          batchOps++;
          messagesDeleted++;
        });

        setMessages((prev) => prev.filter((m) => !oldMessages.some((om) => om.id === m.id)));
      }

      // 3. Clean heavy base64 image proofs from orders already delivered and closed
      if (purgeValidatedOrderProofs) {
        const deliveredOrdersWithProof = orders.filter(
          (o) =>
            (o.orderStatus === 'livree' || o.orderStatus === 'fonds_liberes_vendeur') &&
            (o.paymentProofImage?.startsWith('data:image') ||
              o.vendorDeliveryProofImage?.startsWith('data:image'))
        );

        deliveredOrdersWithProof.forEach((ord) => {
          const updates: any = {};
          if (ord.paymentProofImage?.startsWith('data:image')) {
            updates.paymentProofImage = '[Archivé - Preuve vérifiée & validée]';
          }
          if (ord.vendorDeliveryProofImage?.startsWith('data:image')) {
            updates.vendorDeliveryProofImage = '[Archivé - Preuve remise validée]';
          }
          batch.update(doc(db, 'orders', ord.id), updates);
          batchOps++;
          proofsCleaned++;
        });

        if (deliveredOrdersWithProof.length > 0) {
          setOrders((prev) =>
            prev.map((ord) => {
              const match = deliveredOrdersWithProof.find((d) => d.id === ord.id);
              if (!match) return ord;
              return {
                ...ord,
                paymentProofImage: ord.paymentProofImage?.startsWith('data:image')
                  ? '[Archivé - Preuve vérifiée & validée]'
                  : ord.paymentProofImage,
                vendorDeliveryProofImage: ord.vendorDeliveryProofImage?.startsWith('data:image')
                  ? '[Archivé - Preuve remise validée]'
                  : ord.vendorDeliveryProofImage,
              };
            })
          );
        }
      }

      if (batchOps > 0) {
        await batch.commit();
      }

      showToast(
        'Base de données allégée !',
        'success',
        `${notificationsDeleted} notifications purgées, ${messagesDeleted} messages expirés supprimés, ${proofsCleaned} reçus archivés.`
      );
    } catch (err) {
      console.error('Error during database purge:', err);
      showToast('Erreur de nettoyage', 'error', 'Certaines données n\'ont pas pu être purgées.');
    }

    return { notificationsDeleted, messagesDeleted, proofsCleaned };
  };

  // Reset demo data to Cloud Firestore
  const resetToDefaultData = async () => {
    try {
      // 1. Delete all existing products in Firestore
      const prodSnapshot = await getDocs(collection(db, 'products'));
      const batch = writeBatch(db);
      prodSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

      // 2. Delete & Re-seed orders
      const orderSnapshot = await getDocs(collection(db, 'orders'));
      orderSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));
      INITIAL_ORDERS.forEach((ord) => {
        batch.set(doc(db, 'orders', ord.id), sanitizeForFirestore(ord));
      });

      // 3. Delete & Re-seed shops
      const shopSnapshot = await getDocs(collection(db, 'shops'));
      shopSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));
      INITIAL_SHOPS.forEach((sh) => {
        batch.set(doc(db, 'shops', sh.id), sanitizeForFirestore(sh));
      });

      await batch.commit();

      setProducts([]);
      setOrders(INITIAL_ORDERS);
      setShops(INITIAL_SHOPS);
      setCart([]);
      localStorage.removeItem(STORAGE_KEY_CART);
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      showToast('Base de données synchronisée', 'info', 'Catalogue nettoyé et boutiques Golden Bee Store réinitialisées avec succès.');
    } catch (error) {
      console.error('Error resetting database:', error);
      setProducts([]);
      setOrders(INITIAL_ORDERS);
      setShops(INITIAL_SHOPS);
      setCart([]);
    }
  };

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => !DEMO_PRODUCT_IDS.has(id));
        }
      }
    } catch {}
    return [];
  });

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
      } catch {}
      if (!exists) {
        showToast('Ajouté aux favoris ❤️', 'success', 'Retrouvez vos articles coup de cœur à tout moment.');
      } else {
        showToast('Retiré des favoris', 'info', 'Article retiré de votre liste de souhaits.');
      }
      return updated;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);
  const favoritesCount = favorites.length;

  return (
    <StoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        adminSubTab,
        setAdminSubTab,
        products,
        isLoadingProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        reviews,
        addReview,
        shops,
        isLoadingShops,
        selectedShopFilter,
        setSelectedShopFilter,
        currentVendorShop,
        setCurrentVendorShop,
        isCreateShopModalOpen,
        setIsCreateShopModalOpen,
        initialReferralCode,
        setInitialReferralCode,
        openCreateShopWithReferral,
        isReferralModalOpen,
        setIsReferralModalOpen,
        isUserProfileModalOpen,
        setIsUserProfileModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        openOnboardingTutorial,
        closeOnboardingTutorial,
        platformSettings,
        updatePlatformSettings,
        payReferralBonus,
        requestShopCreation,
        approveShop,
        rejectShop,
        updateShopProfile,
        deleteShop,
        renewShopSubscription,
        loginVendorShop,
        vendorNotifications,
        markVendorNotificationAsRead,
        clearVendorNotifications,
        adminNotifications,
        markAdminNotificationAsRead,
        clearAdminNotifications,
        sponsorNotifications,
        markSponsorNotificationAsRead,
        clearSponsorNotifications,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        selectedCartItemIds,
        toggleCartItemSelection,
        selectAllCartItems,
        selectOnlyCartItem,
        checkoutTargetItems,
        setCheckoutTargetItems,
        startSingleItemCheckout,
        startShopCheckout,
        effectiveCheckoutItems,
        selectedCartSubtotal,
        selectedCartCount,
        promoCode,
        discountAmount,
        appliedPromo,
        appliedCoupon,
        coupons,
        applyPromoCode,
        removePromoCode,
        createCoupon,
        toggleCouponActive,
        deleteCoupon,
        isFlyerModalOpen,
        setIsFlyerModalOpen,
        flyerProduct,
        flyerShop,
        openFlyerModal,
        closeFlyerModal,
        selectedDeliveryMethod,
        setSelectedDeliveryMethod,
        deliveryAddress,
        setDeliveryAddress,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        pendingOrder,
        setPendingOrder,
        lastCompletedOrder,
        setLastCompletedOrder,
        lastCompletedOrders,
        setLastCompletedOrders,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        orders,
        createOrder,
        updateOrderStatus,
        adminValidateCustomerPayment,
        vendorSubmitDeliveryProof,
        adminReleaseFundsToVendor,
        deleteOrder,
        trackingOrderNumber,
        setTrackingOrderNumber,
        searchOrder,
        isDarkMode,
        toggleDarkMode,
        selectedProduct,
        setSelectedProduct,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        adminEmail,
        loginAdmin,
        logoutAdmin,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile,
        usersList,
        batchValidatePayments,
        batchReleaseFunds,
        batchApproveShops,
        batchRestockProducts,
        toasts,
        showToast,
        removeToast,
        notifications,
        unreadNotificationsCount,
        addLocalNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        localNotificationsEnabled,
        toggleLocalNotifications,
        testOrderNotification,
        announcements,
        activeAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleAnnouncementActive,
        adminSendShopPVMessage,
        sendOfficialAdminPV,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        unreadChatCount,
        vendorUnreadChatCount,
        startOrOpenConversation,
        startSupportConversation,
        sendChatMessage,
        markConversationAsRead,
        markVendorConversationAsRead,
        deleteConversation,
        cleanupExpiredChatMessages,
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount,
        purgeDatabaseStorage,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
