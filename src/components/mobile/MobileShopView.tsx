import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/initialProducts';
import { BeePushingCart } from '../BeePushingCart';
import { AnnouncementBanner } from './AnnouncementBanner';
import { ProductGridSkeleton, ShopChipSkeleton } from './ProductCardSkeleton';
import { getVendorWhatsAppUrl } from '../../utils/shareUtils';
import { FlyToCartOverlay, FlyingProjectile } from './FlyToCartOverlay';
import { ShopFilterBar, SortOption, PriceRangeOption } from './ShopFilterBar';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ShieldCheck,
  ArrowRight,
  Eye,
  Plus,
  Store,
  Search,
  MessageCircle,
  X,
  Gift,
  Zap,
  Award,
  Flame,
  Heart,
  PhoneCall,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const MobileShopView: React.FC = () => {
  const {
    products,
    shops,
    currentVendorShop,
    isLoadingProducts,
    isLoadingShops,
    setSelectedProduct,
    addToCart,
    cart,
    setActiveTab,
    setIsCreateShopModalOpen,
    setIsReferralModalOpen,
    isDarkMode,
    toggleFavorite,
    isFavorite,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'promo' | 'stock' | 'top'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState<PriceRangeOption>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [bouncingProductId, setBouncingProductId] = useState<string | null>(null);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [flyingProjectiles, setFlyingProjectiles] = useState<FlyingProjectile[]>([]);

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setBouncingProductId(product.id);
    setTimeout(() => {
      setBouncingProductId((prev) => (prev === product.id ? null : prev));
    }, 800);

    // Launch fly-to-cart projectile towards header cart
    try {
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      const headerCart = document.getElementById('mobile-header-cart-btn');
      const bottomCart = document.getElementById('mobile-bottom-nav-cart-btn');
      const targetEl = headerCart || bottomCart;

      let targetX = window.innerWidth - 36;
      let targetY = 32;

      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        targetX = targetRect.left + targetRect.width / 2;
        targetY = targetRect.top + targetRect.height / 2;
      }

      const projectileId = `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setFlyingProjectiles((prev) => [
        ...prev,
        {
          id: projectileId,
          startX,
          startY,
          targetX,
          targetY,
          imageUrl: product.image,
          productName: product.name,
        },
      ]);
    } catch (err) {
      console.warn('Fly-to-cart error:', err);
    }
  };

  const handleProjectileComplete = (projectileId: string) => {
    setFlyingProjectiles((prev) => prev.filter((p) => p.id !== projectileId));

    // Dynamic cart bounce & brightness pulse
    const cartEl =
      document.getElementById('mobile-header-cart-btn') ||
      document.getElementById('mobile-bottom-nav-cart-btn');
    if (cartEl && typeof cartEl.animate === 'function') {
      cartEl.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.4) rotate(-10deg)', filter: 'brightness(1.35)' },
          { transform: 'scale(0.85) rotate(6deg)' },
          { transform: 'scale(1.15) rotate(-3deg)' },
          { transform: 'scale(1)', filter: 'brightness(1)' },
        ],
        {
          duration: 480,
          easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }
      );
    }
  };

  const promoCards = [
    {
      title: 'Fournisseurs Vérifiés Bee Store',
      subtitle: 'Ouvrez votre boutique officielle et développez vos ventes',
      badge: 'Bee Store Verified',
      bg: 'from-amber-950 via-slate-900 to-amber-900',
      icon: <Store className="w-3.5 h-3.5 text-amber-400" />,
      actionText: 'Créer boutique',
      isVendorAction: true,
    },
    {
      title: 'Programme Parrainage Bee Store',
      subtitle: 'Invitez des commerçants et gagnez 500 FCFA cash par boutique',
      badge: 'Gains Directs',
      bg: 'from-emerald-950 via-slate-900 to-teal-950',
      icon: <Gift className="w-3.5 h-3.5 text-emerald-400" />,
      actionText: 'Parrainer',
      isReferralAction: true,
    },
    {
      title: 'Trade Assurance • Protection 100%',
      subtitle: 'Paiement direct sécurisé (97470831) & commande WhatsApp',
      badge: 'Garantie',
      bg: 'from-slate-950 via-amber-950 to-slate-900',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
      actionText: 'Voir catalogue',
      isVendorAction: false,
    },
  ];

  // Dynamic list of categories with prominent Gaming and Abonnements & Services
  const availableCategories = useMemo(() => {
    const base = ['Tous', 'Gaming', 'Abonnements & Services'];
    const gamingSub = ['Compte de jeu', 'Recharge jetons'];
    const known = CATEGORIES.filter(
      (c) =>
        c !== 'Tous' &&
        c !== 'Compte de jeu' &&
        c !== 'Recharge jetons' &&
        c !== 'Abonnements & Services'
    );
    const dynamicProductCats = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).filter((c) => !base.includes(c) && !gamingSub.includes(c) && !known.includes(c));

    return Array.from(new Set([...base, ...gamingSub, ...known, ...dynamicProductCats]));
  }, [products]);

  const isGamingCategory = (cat: string, name = '') => {
    const c = (cat || '').toLowerCase();
    const n = (name || '').toLowerCase();
    return (
      c.includes('gaming') ||
      c.includes('jeu') ||
      c.includes('game') ||
      c.includes('jeton') ||
      c.includes('diamant') ||
      c.includes('pubg') ||
      c.includes('free fire') ||
      c.includes('cod') ||
      c.includes('playstation') ||
      c.includes('xbox') ||
      c.includes('steam') ||
      n.includes('gaming') ||
      n.includes('pubg') ||
      n.includes('free fire') ||
      n.includes('cod mobile') ||
      n.includes('diamant') ||
      n.includes('compte de jeu')
    );
  };

  const isAbonnementCategory = (cat: string, name = '') => {
    const c = (cat || '').toLowerCase();
    const n = (name || '').toLowerCase();
    return (
      c.includes('abonnement') ||
      c.includes('service') ||
      c.includes('streaming') ||
      c.includes('netflix') ||
      c.includes('iptv') ||
      c.includes('canva') ||
      c.includes('spotify') ||
      c.includes('prime') ||
      c.includes('disney') ||
      n.includes('abonnement') ||
      n.includes('netflix') ||
      n.includes('iptv') ||
      n.includes('canva') ||
      n.includes('spotify') ||
      n.includes('disney') ||
      n.includes('prime video')
    );
  };

  // Filter products instantly by search, category, shop, quick filter, and price range
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.shopName && product.shopName.toLowerCase().includes(q));

      let matchCat = true;
      const catLower = selectedCategory.toLowerCase();
      if (catLower === 'tous' || catLower === 'tous les produits') {
        matchCat = true;
      } else if (catLower === 'gaming' || catLower === '🎮 gaming') {
        matchCat = isGamingCategory(product.category, product.name);
      } else if (
        catLower === 'abonnements' ||
        catLower === 'abonnements & services' ||
        catLower === '📺 abonnements'
      ) {
        matchCat = isAbonnementCategory(product.category, product.name);
      } else if (selectedCategory === 'Tendances') {
        matchCat = true;
      } else {
        matchCat = product.category.toLowerCase() === catLower;
      }

      const matchShop =
        selectedShopFilter === 'all' ||
        product.shopId === selectedShopFilter ||
        product.shopName?.toLowerCase() === selectedShopFilter.toLowerCase();

      let matchQuick = true;
      if (quickFilter === 'promo') {
        matchQuick = !!product.badge && (product.badge === 'Promo' || product.originalPrice !== undefined);
      } else if (quickFilter === 'stock') {
        matchQuick = product.stock > 0;
      } else if (quickFilter === 'top') {
        matchQuick = product.badge === 'Top Vente' || product.rating >= 4.8;
      }

      let matchPrice = true;
      if (priceRange === 'under_2000') {
        matchPrice = product.price < 2000;
      } else if (priceRange === '2000_5000') {
        matchPrice = product.price >= 2000 && product.price <= 5000;
      } else if (priceRange === '5000_15000') {
        matchPrice = product.price >= 5000 && product.price <= 15000;
      } else if (priceRange === 'above_15000') {
        matchPrice = product.price > 15000;
      } else if (priceRange === 'custom') {
        const min = minPrice !== '' ? Number(minPrice) : 0;
        const max = maxPrice !== '' ? Number(maxPrice) : Infinity;
        matchPrice = product.price >= min && product.price <= max;
      }

      return matchSearch && matchCat && matchShop && matchQuick && matchPrice;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedShopFilter,
    quickFilter,
    priceRange,
    minPrice,
    maxPrice,
  ]);

  // Sort products dynamically (price ascending, descending, rating, newest, default)
  const sortedFilteredProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const handleResetAllFilters = () => {
    setSelectedCategory('Tous');
    setSortBy('default');
    setPriceRange('all');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSelectedShopFilter('all');
    setQuickFilter('all');
  };

  // Direct WhatsApp contact with Store Support
  const handleSupportWhatsApp = () => {
    const message = encodeURIComponent(
      'Bonjour Golden Bee Store, je souhaite avoir des renseignements sur les produits et commandes.'
    );
    window.open(`https://wa.me/22797470831?text=${message}`, '_blank');
  };

  return (
    <div
      className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-3.5 space-y-3.5 scrollbar-none pb-24 transition-colors duration-200 bg-[#060C1B] text-slate-100"
    >
      {/* 📢 Admin Small Announcements Banner */}
      <AnnouncementBanner />

      {/* Sleek Search Input Bar matching screenshot */}
      <div className="relative">
        <div className="flex items-center w-full rounded-full bg-[#0D1832] border border-[#1E335E] px-4 py-2.5 shadow-inner">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-transparent text-xs font-medium text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 mr-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Filter & Category Bar: Gaming, Abonnements, Price Sorting & Range */}
      <ShopFilterBar
        categories={availableCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setQuickFilter('all');
        }}
        sortBy={sortBy}
        onSelectSort={(sort) => setSortBy(sort)}
        priceRange={priceRange}
        onSelectPriceRange={(range) => setPriceRange(range)}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
        }}
        totalCount={sortedFilteredProducts.length}
        onResetAll={handleResetAllFilters}
        isDarkMode={isDarkMode}
      />

      {/* Quick Filter Matrix & Stats (Top Ventes / Super Deals / Vendeurs) */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        <button
          onClick={() => {
            setQuickFilter(quickFilter === 'top' ? 'all' : 'top');
          }}
          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
            quickFilter === 'top'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
              : 'bg-[#0D182E] border-[#1A2C50] text-slate-300 hover:bg-[#122144]'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold leading-none">Top Ventes</span>
        </button>

        <button
          onClick={() => {
            setQuickFilter(quickFilter === 'promo' ? 'all' : 'promo');
          }}
          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
            quickFilter === 'promo'
              ? 'bg-red-600 text-white border-red-500 font-bold shadow-xs'
              : 'bg-[#0D182E] border-[#1A2C50] text-slate-300 hover:bg-[#122144]'
          }`}
        >
          <Zap className="w-4 h-4 text-red-400" />
          <span className="text-[10px] font-bold leading-none">Super Deals</span>
        </button>

        <button
          onClick={() => setIsCreateShopModalOpen(true)}
          className="p-2 rounded-xl border border-[#1A2C50] bg-[#0D182E] text-slate-300 hover:bg-[#122144] flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold leading-none">Vendeurs</span>
        </button>

        <button
          onClick={() => setIsReferralModalOpen(true)}
          className="p-2 rounded-xl border border-[#1A2C50] bg-[#0D182E] text-slate-300 hover:bg-[#122144] flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold leading-none">Gagner</span>
        </button>
      </div>

      {/* Golden Bee Verified Banner matching image 1787873102355.jpg */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-amber-500/40">
        <div
          className={`bg-gradient-to-r ${promoCards[currentPromoIndex].bg} text-white p-3.5 flex items-center justify-between transition-all`}
        >
          <div className="space-y-1 max-w-[70%]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 text-[8.5px] font-black tracking-wider uppercase text-amber-300">
              {promoCards[currentPromoIndex].icon}
              <span>{promoCards[currentPromoIndex].badge}</span>
            </div>
            <h3 className="text-xs sm:text-sm font-black leading-tight text-white">
              {promoCards[currentPromoIndex].title}
            </h3>
            <p className="text-[9.5px] text-slate-300 line-clamp-1">
              {promoCards[currentPromoIndex].subtitle}
            </p>
          </div>

          <button
            onClick={() => {
              if (promoCards[currentPromoIndex].isVendorAction) {
                setIsCreateShopModalOpen(true);
              } else if ((promoCards[currentPromoIndex] as any).isReferralAction) {
                setIsReferralModalOpen(true);
              } else {
                setCurrentPromoIndex((prev) => (prev + 1) % promoCards.length);
              }
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all shrink-0"
          >
            <span>{promoCards[currentPromoIndex].actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-1 right-2 flex gap-1">
          {promoCards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPromoIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentPromoIndex ? 'bg-amber-400 w-3' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Verified Suppliers Strip */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-0.5">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            <Award className="w-3 h-3 text-amber-500" />
            Fournisseurs Vérifiés
          </span>
          <button
            onClick={() => setActiveTab('search')}
            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
          >
            <span>Tous &rarr;</span>
          </button>
        </div>

        {isLoadingShops ? (
          <ShopChipSkeleton count={3} isDarkMode={isDarkMode} />
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedShopFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedShopFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous les Fournisseurs
            </button>

            {shops
              .filter((s) => s.status === 'approuvee')
              .map((shop) => {
                const isSelected = selectedShopFilter === shop.id || selectedShopFilter === shop.name;
                return (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setSelectedShopFilter(isSelected ? 'all' : shop.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : isDarkMode
                        ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img src={shop.logoUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    <span>{shop.name}</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* Active Boutique filter Banner */}
        {selectedShopFilter !== 'all' && (() => {
          const activeShop = shops.find((s) => s.id === selectedShopFilter || s.name === selectedShopFilter);
          if (!activeShop) return null;
          const shopWhatsAppUrl = getVendorWhatsAppUrl({
            phone: activeShop.phone,
            countryCode: activeShop.countryCode || '+227',
            shopName: activeShop.name,
          });

          return (
            <div className={`mt-1.5 p-2.5 rounded-xl border space-y-2 ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                : 'bg-white border-amber-200 text-slate-900 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={activeShop.logoUrl} alt={activeShop.name} className="w-8 h-8 rounded-xl object-cover border border-amber-500/30 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black truncate">{activeShop.name}</h3>
                      <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                        Vérifié
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{activeShop.city} • {activeShop.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedShopFilter('all')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  title="Fermer le filtre fournisseur"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2">
                <a
                  href={shopWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1 transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-slate-950 text-amber-500 shrink-0" />
                  <span>Discuter ({activeShop.countryCode || '+227'})</span>
                </a>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5 pt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-xs font-black uppercase tracking-wider truncate ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {selectedCategory === 'Tous les produits' || selectedCategory === 'Tous'
              ? 'TOUS LES PRODUITS'
              : selectedCategory.toUpperCase()}
          </span>
          {sortBy !== 'default' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              {sortBy === 'price_asc'
                ? 'Prix ↗'
                : sortBy === 'price_desc'
                ? 'Prix ↘'
                : sortBy === 'rating'
                ? '★ Avis'
                : 'Nouveautés'}
            </span>
          )}
        </div>
        {isLoadingProducts ? (
          <div className="flex items-center gap-1.5 text-[10.5px] text-amber-400 font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Chargement...</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium shrink-0">
            {sortedFilteredProducts.length} article(s)
          </span>
        )}
      </div>

      {/* 2-Column Product Grid with Skeletons During Initial Firestore Sync */}
      <div>
        {isLoadingProducts ? (
          <ProductGridSkeleton count={6} isDarkMode={isDarkMode} />
        ) : sortedFilteredProducts.length === 0 ? (
          products.length === 0 ? (
            <div
              className={`rounded-3xl p-6 sm:p-8 text-center border space-y-4 shadow-sm ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-center">
                <BeePushingCart size="lg" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-sm sm:text-base font-black text-amber-500">
                  Le catalogue est prêt !
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Les produits d'exemple ont été retirés. Les boutiques certifiées peuvent désormais ajouter et gérer leurs véritables articles.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 max-w-xs mx-auto">
                {currentVendorShop && currentVendorShop.status === 'approuvee' ? (
                  <button
                    onClick={() => setActiveTab('vendor')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Publier mon 1er article</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsCreateShopModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Store className="w-4 h-4" />
                      <span>Ouvrir ma boutique (1 500 FCFA)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('vendor')}
                      className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                    >
                      Espace Vendeur
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`rounded-2xl p-8 text-center border space-y-2.5 ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex justify-center">
                <BeePushingCart size="md" />
              </div>
              <p className="text-xs font-semibold">Aucun article ne correspond à vos filtres de recherche ou de prix.</p>
              <button
                onClick={handleResetAllFilters}
                className="px-3.5 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 gap-3 sm:gap-3.5"
          >
            {sortedFilteredProducts.map((product) => {
              const isOut = product.stock <= 0;
              const inCartCount =
                cart.find((item) => item.product.id === product.id)?.quantity || 0;
              const isFav = isFavorite(product.id);

              const vendorShop = shops.find((s) => s.id === product.shopId);
              const vendorPhone = vendorShop?.phone || '97470831';
              const vendorCountryCode = vendorShop?.countryCode || '+227';
              const vendorShopName = vendorShop?.name || product.shopName || 'Bee Store Boutique';

              const directWhatsAppUrl = getVendorWhatsAppUrl({
                phone: vendorPhone,
                countryCode: vendorCountryCode,
                product,
                shopName: vendorShopName,
              });

              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-[#0D182E] border border-[#1A2C50] overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/10 group relative"
                >
                  {/* Thumbnail area */}
                  <div
                    className="relative aspect-square bg-gradient-to-b from-[#111F3D] to-[#0A1326] flex items-center justify-center p-2.5 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-contain mix-blend-normal group-hover:scale-105 transition-transform duration-500 ease-out ${
                        isOut ? 'grayscale opacity-50' : ''
                      }`}
                      loading="lazy"
                    />

                    {/* Top Right: Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0D182E]/80 border border-[#1A2C50] text-slate-400 hover:text-red-400 shadow-md backdrop-blur-xs active:scale-90 transition-transform"
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isFav
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      />
                    </button>

                    {isOut && (
                      <span className="absolute bottom-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded bg-slate-950/90 text-rose-300 border border-rose-500/30 shadow-xs">
                        Épuisé
                      </span>
                    )}
                  </div>

                  {/* Body Info matching screenshot */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      {/* Uppercase Gold Category Label */}
                      <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase line-clamp-1">
                        {product.category || 'ACCESSOIRES'}
                      </span>

                      {/* Title */}
                      <h4
                        onClick={() => setSelectedProduct(product)}
                        className="text-xs font-bold text-white line-clamp-2 leading-snug cursor-pointer hover:text-amber-300 transition-colors"
                      >
                        {product.name}
                      </h4>

                      {/* 5 Gold Stars Rating matching screenshot */}
                      <div className="flex items-center gap-0.5 text-amber-400 pt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>

                    {/* Bottom Price & Round Yellow Shopping Bag Action Button */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#18284B]">
                      {/* Price on left in bold gold */}
                      <div className="text-sm font-extrabold text-amber-400 tracking-tight leading-none">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </div>

                      {/* Round Yellow Shopping Bag Action Button */}
                      <div className="relative shrink-0">
                        <motion.button
                          onClick={(e) => handleQuickAddToCart(product, e)}
                          disabled={isOut || inCartCount >= product.stock}
                          whileTap={{ scale: 0.88 }}
                          animate={
                            bouncingProductId === product.id
                              ? { scale: [1, 1.25, 0.95, 1.1, 1], rotate: [0, -6, 6, 0] }
                              : { scale: 1, rotate: 0 }
                          }
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${
                            isOut
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20'
                          }`}
                          title="Ajouter au panier"
                        >
                          {inCartCount > 0 ? (
                            <span className="text-[10px] font-black text-slate-950">
                              {inCartCount}
                            </span>
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {bouncingProductId === product.id && (
                            <motion.span
                              initial={{ opacity: 0, y: 0, scale: 0.5 }}
                              animate={{ opacity: 1, y: -22, scale: 1.1 }}
                              exit={{ opacity: 0, y: -30, scale: 0.8 }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-md z-20"
                            >
                              +1
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Floating Golden Action Button at bottom right corner (Image 1787873102355.jpg) */}
      <div className="fixed bottom-18 right-3 z-30 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isFloatingMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-amber-400 rounded-2xl p-2 shadow-2xl space-y-1 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[200px]"
            >
              <button
                onClick={handleSupportWhatsApp}
                className="w-full p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                <span>Support WhatsApp (+227)</span>
              </button>

              <button
                onClick={() => {
                  setIsFloatingMenuOpen(false);
                  setIsCreateShopModalOpen(true);
                }}
                className="w-full p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 text-amber-600 dark:text-amber-400 transition-colors"
              >
                <Store className="w-4 h-4 text-amber-500" />
                <span>Devenir Vendeur Officiel</span>
              </button>

              <button
                onClick={() => {
                  setIsFloatingMenuOpen(false);
                  setActiveTab('cart');
                }}
                className="w-full p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <BeePushingCart size="sm" />
                <span>Mon Panier Rapide</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          className="w-13 h-13 rounded-full bg-[#f5b816] text-slate-950 shadow-xl border-2 border-amber-300 flex items-center justify-center p-2.5 active:scale-95 transition-transform"
          title="Actions Rapides Golden Bee"
        >
          <BeePushingCart size="sm" />
        </motion.button>
      </div>

      {/* Fly-to-Cart Projectile Overlay */}
      <FlyToCartOverlay
        projectiles={flyingProjectiles}
        onComplete={handleProjectileComplete}
      />
    </div>
  );
};
