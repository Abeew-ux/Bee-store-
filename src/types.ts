export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in FCFA (XOF/XAF)
  originalPrice?: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: 'Nouveau' | 'Promo' | 'Top Vente' | 'Coup de Cœur';
  features?: string[];
  sizes?: string[]; // Ex: ['S', 'M', 'L', 'XL'] ou ['38', '39', '40', '41', '42']
  colors?: string[]; // Ex: ['Noir', 'Blanc', 'Bleu', 'Rouge']
  createdAt: string;
  shopId?: string;
  shopName?: string;
  shopPhone?: string;
  isVerifiedShop?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customAnswers?: Record<string, string>;
}

export interface Coupon {
  id: string;
  code: string; // Ex: 'PROMO10', 'TABASKI2026', 'AGADEZ500'
  shopId?: string; // If undefined or 'ALL', valid for all or specific shop
  shopName?: string;
  discountType: 'percentage' | 'fixed'; // '%' or 'FCFA'
  discountValue: number; // e.g. 10 for 10% or 1000 for 1000 FCFA
  minOrderAmount?: number; // Minimum purchase amount in FCFA
  maxDiscount?: number; // Cap for percentage discount
  usageLimit?: number; // Maximum times it can be used
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export type DeliveryMethodId =
  | 'delivery_home' // Livraison à domicile (1 000 FCFA)
  | 'pickup_shop'   // Retrait sur place en boutique (0 FCFA - Au choix)
  | 'standard'
  | 'express'
  | 'relay';

export interface DeliveryMethod {
  id: DeliveryMethodId;
  name: string;
  description: string;
  delay: string;
  price: number;
  icon: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  shopId?: string;
  authorName: string;
  city: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verifiedBuyer?: boolean;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  region?: string;
  city: string;
  neighborhood: string;
  addressDetails: string;
  notes?: string;
  relayPointName?: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  phone: string;
  countryCode?: string;
  city: string;
  neighborhood?: string;
  password?: string;
  role: 'customer' | 'vendor' | 'admin';
  referralCode?: string;
  referredBy?: string;
  cagnotteFCFA?: number;
  createdAt: string;
}

export type PaymentMethod =
  | 'my_nita'
  | 'amana_ta'
  | 'airtel_money'
  | 'al_izza'
  | 'cash_delivery'
  | 'whatsapp_direct'
  | 'my_nita_direct'
  | 'airtel_money_direct'
  | 'al_izza_direct'
  | 'cash_at_delivery';

export interface PlatformSettings {
  monthlyShopFee: number; // 1500 FCFA
  referralBonus: number; // 500 FCFA
  adminPaymentAccount: string; // "97470831"
  acceptedPaymentMethods: {
    myNita: boolean;
    amanaTa: boolean;
    airtelMoney: boolean;
    alIzza: boolean;
    cashDelivery: boolean;
  };
  maintenanceMode?: boolean;
}

export type OrderStatus =
  | 'nouvelle_commande_whatsapp' // Commande directe WhatsApp transmise au vendeur
  | 'en_preparation'             // Le vendeur prépare le colis
  | 'en_livraison'               // Colis remis au livreur ou prêt pour retrait
  | 'livree'                     // Commande livrée avec succès
  | 'annulee'                    // Commande annulée
  | 'en_attente'
  | 'payee_nita'
  | 'fonds_bloques_sequestre'
  | 'en_attente_validation_admi'
  | 'remis_client_attente_liberation'
  | 'fonds_liberes_vendeur';

export interface Order {
  id: string;
  orderNumber: string;
  customer: DeliveryAddress;
  items: CartItem[];
  subtotal: number;
  deliveryMethod: DeliveryMethod;
  deliveryCost: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentStatus: 'reussi' | 'en_attente' | 'echoue';
  nitaPhoneNumber?: string;
  paymentProofImage?: string;
  vendorDeliveryProofImage?: string;
  vendorHandoverDate?: string;
  vendorHandoverNote?: string;
  adminFundsReleaseDate?: string;
  adminFundsReleaseNote?: string;
  shopId?: string;
  shopName?: string;
  shopPhone?: string;
  isPickupInShop?: boolean;
  adminEscrowValidated?: boolean;
  vendorDeliveryValidated?: boolean;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
  }[];
}

export type ShopStatus = 'en_attente' | 'approuvee' | 'refusee' | 'suspendue';

export interface VendorNotification {
  id: string;
  shopId: string;
  shopName?: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  firstItemName?: string;
  firstItemImage?: string;
  conversationId?: string;
  itemsCount?: number;
  totalAmount?: number;
  message: string;
  read: boolean;
  type?: 'order' | 'referral_bonus' | 'referral_shop_created' | 'system';
  createdAt: string;
}

export interface SponsorNotification {
  id: string;
  sponsorId?: string;
  sponsorPhone: string;
  sponsorReferralCode: string;
  newShopId: string;
  newShopName: string;
  newOwnerName: string;
  newShopPhone?: string;
  newShopCity?: string;
  newShopRegion?: string;
  bonusEarned: number; // 500 FCFA
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'referral_shop_created' | 'new_shop' | 'new_order' | 'system';
  title: string;
  message: string;
  sponsorName?: string;
  sponsorPhone?: string;
  sponsorShopName?: string;
  sponsorReferralCode?: string;
  newShopId?: string;
  newShopName?: string;
  newOwnerName?: string;
  newShopPhone?: string;
  newShopCity?: string;
  newShopRegion?: string;
  bonusAmount?: number;
  transactionRef?: string;
  read: boolean;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  countryCode?: string; // Ex: '+227'
  phone: string; // WhatsApp / Appel
  pinCode: string; // 4-digit code to access vendor dashboard
  category: string;
  description: string;
  region: string; // Ex: 'Agadez', 'Niamey', 'Maradi', 'Zinder', 'Tahoua', 'Dosso', 'Tillabéri', 'Diffa'
  city: string;
  neighborhood?: string;
  logoUrl: string;
  status: ShopStatus;
  subscriptionFee: number; // 1500 FCFA / mois
  paymentAccountTarget: string; // "97470831"
  paymentProofImage: string; // Screenshot base64 or URL
  transactionRef?: string;
  adminNote?: string;
  // Referral (Parrainage 500 FCFA par boutique invitée)
  referralCode?: string; // e.g. "BEE-9747"
  referredBy?: string; // Referral code of the sponsor
  referralsCount?: number; // Total shops referred
  referralEarnings?: number; // Total FCFA earned (500 FCFA per boutique)
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string; // 30 days after activation
}

export const SHOP_MONTHLY_FEE = 1500; // 1 500 FCFA / mois
export const REFERRAL_BONUS_PER_SHOP = 500; // 500 FCFA par parrainage

export interface PlatformSettings {
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
}

export type ActiveTab = 'shop' | 'search' | 'cart' | 'tracking' | 'vendor' | 'chat' | 'admin' | 'favorites';
export type AdminSubTab = 'dashboard' | 'shops_requests' | 'products' | 'orders' | 'inventory' | 'referrals' | 'announcements';

export type NotificationType =
  | 'order_status'
  | 'order_created'
  | 'announcement'
  | 'security'
  | 'promo'
  | 'referral';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderNumber?: string;
  orderStatus?: OrderStatus;
  announcementId?: string;
  linkTab?: ActiveTab;
  read: boolean;
  createdAt: string; // ISO String
}

export type AnnouncementCategory = 'flash' | 'promo' | 'livraison' | 'info' | 'maintenance';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  isActive: boolean;
  badgeText?: string;
  ctaText?: string;
  ctaLinkTab?: ActiveTab;
  authorName?: string;
  createdAt: string; // ISO String
  expiresAt?: string;
  broadcastPush?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'vendor' | 'system';
  text: string;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (7 days after creation)
  read: boolean;
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  attachmentUrl?: string;
  isAdminDecision?: boolean;
  decisionType?: 'approuvee' | 'refusee' | 'note' | 'rappel';
  adminNote?: string;
}

export interface Conversation {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo?: string;
  shopPhone?: string;
  shopCity?: string;
  isVerifiedShop?: boolean;
  isAdminOfficial?: boolean; // Official admin channel with shop
  lastDecisionStatus?: ShopStatus;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCountBuyer: number;
  unreadCountVendor: number;
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}
