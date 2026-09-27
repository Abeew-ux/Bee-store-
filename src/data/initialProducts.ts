import { Product, DeliveryMethod } from '../types';

export const DEMO_PRODUCT_IDS = new Set<string>([
  'prod-chaussures-sneaker-urbaine',
  'prod-chaussures-premium-cuir-noir',
  'prod-sneakers-sport-casual-blanc',
  'prod-montre-classique-or-cuir',
  'prod-sac-main-cuir-femme',
  'prod-bazin-riche-getzner',
  'prod-iphone-15-pro',
  'prod-samsung-s24-ultra',
  'prod-airpods-pro-2',
  'prod-coque-silicone-premium',
  'prod-coque-transparente-anti-choc',
  'prod-verre-trempe-protection-ecran',
  'prod-pack-2-verres-trempes',
  'prod-power-bank-10000mah',
  'prod-power-bank-20000mah-digital',
  'prod-chargeur-rapide-20w-usbc',
  'prod-cable-tresse-ultra-rapide-60w',
  'prod-compte-free-fire-max-vip',
  'prod-compte-pubg-mobile-glacier',
  'prod-recharge-diamants-free-fire-1060',
  'prod-recharge-uc-pubg-660',
  'prod-points-cod-mobile-800cp',
  'prod-abonnement-netflix-premium-uhd',
]);

// Empty initial products array - no hardcoded demo products
export const INITIAL_PRODUCTS: Product[] = [];

export const CATEGORIES = [
  'Tous',
  'Compte de jeu',
  'Recharge jetons',
  'Abonnements & Services',
  'Chargeurs',
  'Câbles',
  'Écouteurs',
  'Coques',
  "Protections d'écran",
  'Power banks',
  'Chaussures',
  'Montres & Bijoux',
  'Maroquinerie & Sacs',
  'Mode & Habillement',
  'High-Tech & Audio',
];

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'delivery_home',
    name: 'Livraison Express Locale',
    description: 'Livraison par coursier express à domicile ou bureau (Agadez, Niamey & toutes régions).',
    delay: '24h - 48h',
    price: 1000,
    icon: 'Truck',
  },
  {
    id: 'pickup_shop',
    name: 'Retrait sur place (En Boutique)',
    description: 'Récupération directe et sans frais de votre colis en boutique auprès du commerçant.',
    delay: 'Dès que le colis est préparé (0 FCFA)',
    price: 0,
    icon: 'Store',
  },
];

export const NITA_RELAY_POINTS = [
  'Agence My Nita - Agadez Centre (Grand Marché)',
  'Agence My Nita - Agadez Sabon Gari',
  'Agence My Nita - Niamey Plateau',
  'Agence My Nita - Niamey Grand Marché',
  'Agence My Nita - Maradi Dan Issa',
  'Agence My Nita - Zinder Birni',
  'Agence My Nita - Tahoua Centre',
];

export const POPULAR_CITIES = [
  'Agadez (Centre & Sabon Gari)',
  'Niamey',
  'Maradi',
  'Zinder',
  'Tahoua',
  'Dosso',
  'Tillabéri',
  'Diffa',
  'Arlit',
  'Tchirozérine',
  'Gaya',
  'Birni N’Konni',
];
