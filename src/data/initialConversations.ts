import { Conversation, ChatMessage } from '../types';

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const isMessageExpired = (createdAt: string): boolean => {
  try {
    const time = new Date(createdAt).getTime();
    return Date.now() - time > SEVEN_DAYS_MS;
  } catch {
    return false;
  }
};

export const getExpirationDate = (createdAt: string): string => {
  try {
    const time = new Date(createdAt).getTime();
    return new Date(time + SEVEN_DAYS_MS).toISOString();
  } catch {
    return new Date(Date.now() + SEVEN_DAYS_MS).toISOString();
  }
};

export const getRemainingDays = (createdAt: string): number => {
  try {
    const createdTime = new Date(createdAt).getTime();
    const elapsed = Date.now() - createdTime;
    const remainingMs = SEVEN_DAYS_MS - elapsed;
    if (remainingMs <= 0) return 0;
    return Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  } catch {
    return 7;
  }
};

const now = Date.now();
const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now - 48 * 60 * 60 * 1000).toISOString();

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-air-high-tech',
    shopId: 'shop-bee-agadez',
    shopName: 'Aïr High-Tech & Mode Agadez',
    shopLogo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    shopPhone: '97470831',
    shopCity: 'Agadez',
    isVerifiedShop: true,
    buyerId: 'user-default',
    buyerName: 'Client Acheteur',
    buyerPhone: '97470831',
    lastMessageText: 'Oui le Samsung Galaxy A55 5G est disponible en stock avec garantie 12 mois !',
    lastMessageTime: twoHoursAgo,
    unreadCountBuyer: 1,
    unreadCountVendor: 0,
    productId: 'prod-001',
    productName: 'Samsung Galaxy A55 5G (128 Go / 8 Go RAM)',
    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    productPrice: 220000,
    createdAt: twoDaysAgo,
    updatedAt: twoHoursAgo,
  },
  {
    id: 'conv-sahel-fashion',
    shopId: 'shop-sahel-fashion',
    shopName: 'Sahel Elegance & Mode',
    shopLogo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
    shopPhone: '90123456',
    shopCity: 'Agadez',
    isVerifiedShop: true,
    buyerId: 'user-default',
    buyerName: 'Client Acheteur',
    buyerPhone: '97470831',
    lastMessageText: 'Nous pouvons livrer à votre domicile à Agadez dans l\'après-midi.',
    lastMessageTime: oneDayAgo,
    unreadCountBuyer: 0,
    unreadCountVendor: 0,
    productId: 'prod-003',
    productName: 'Bazin Riche Brodé VIP Agadez (Modèle Homme/Femme)',
    productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    productPrice: 38000,
    createdAt: twoDaysAgo,
    updatedAt: oneDayAgo,
  },
  {
    id: 'conv-golden-bee-officielle',
    shopId: 'shop-bee-officielle',
    shopName: 'Golden Bee Officielle',
    shopLogo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    shopPhone: '97470831',
    shopCity: 'Niamey',
    isVerifiedShop: true,
    buyerId: 'user-default',
    buyerName: 'Client Acheteur',
    buyerPhone: '97470831',
    lastMessageText: 'Bienvenue sur Golden Bee Store ! N\'hésitez pas si vous avez une question sur les expéditions.',
    lastMessageTime: twoDaysAgo,
    unreadCountBuyer: 0,
    unreadCountVendor: 0,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-air-high-tech',
    senderId: 'user-default',
    senderName: 'Client Acheteur',
    senderRole: 'buyer',
    text: 'Bonjour ! Est-ce que le Samsung Galaxy A55 5G est disponible en stock à Agadez ?',
    createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: getExpirationDate(new Date(now - 3 * 60 * 60 * 1000).toISOString()),
    read: true,
    productId: 'prod-001',
    productName: 'Samsung Galaxy A55 5G (128 Go / 8 Go RAM)',
    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    productPrice: 220000,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-air-high-tech',
    senderId: 'shop-bee-agadez',
    senderName: 'Aïr High-Tech & Mode Agadez',
    senderRole: 'vendor',
    text: 'Oui le Samsung Galaxy A55 5G est disponible en stock avec garantie 12 mois ! Vous pouvez commander directement avec paiement protégé My Nita.',
    createdAt: twoHoursAgo,
    expiresAt: getExpirationDate(twoHoursAgo),
    read: false,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-sahel-fashion',
    senderId: 'user-default',
    senderName: 'Client Acheteur',
    senderRole: 'buyer',
    text: 'Bonjour, avez-vous la taille XL pour le Bazin Riche Brodé VIP ?',
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    expiresAt: getExpirationDate(new Date(now - 26 * 60 * 60 * 1000).toISOString()),
    read: true,
    productId: 'prod-003',
    productName: 'Bazin Riche Brodé VIP Agadez (Modèle Homme/Femme)',
    productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    productPrice: 38000,
  },
  {
    id: 'msg-4',
    conversationId: 'conv-sahel-fashion',
    senderId: 'shop-sahel-fashion',
    senderName: 'Sahel Elegance & Mode',
    senderRole: 'vendor',
    text: 'Nous pouvons livrer à votre domicile à Agadez dans l\'après-midi.',
    createdAt: oneDayAgo,
    expiresAt: getExpirationDate(oneDayAgo),
    read: true,
  },
  {
    id: 'msg-5',
    conversationId: 'conv-golden-bee-officielle',
    senderId: 'shop-bee-officielle',
    senderName: 'Golden Bee Officielle',
    senderRole: 'vendor',
    text: 'Bienvenue sur Golden Bee Store ! N\'hésitez pas si vous avez une question sur les expéditions.',
    createdAt: twoDaysAgo,
    expiresAt: getExpirationDate(twoDaysAgo),
    read: true,
  },
];
