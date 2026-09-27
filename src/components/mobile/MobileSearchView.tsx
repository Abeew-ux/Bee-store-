import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/initialProducts';
import { Product, Shop } from '../../types';
import { BeePushingCart } from '../BeePushingCart';
import { getVendorWhatsAppUrl } from '../../utils/shareUtils';
import {
  Search,
  X,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  Star,
  Sparkles,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Package,
  CheckCircle2,
} from 'lucide-react';

const TRENDING_TAGS = ['iPhone', 'MacBook', 'Sony', 'Robe', 'Parfum', 'Nike', 'Samsung', 'Agadez Artisanal', 'Tech Zone'];
const REGION_FILTERS = ['Toutes les régions', 'Agadez', 'Niamey', 'Maradi', 'Zinder', 'Tahoua', 'Dosso', 'Tillabéri', 'Diffa'];

export const MobileSearchView: React.FC = () => {
  const {
    products,
    shops,
    setSelectedProduct,
    addToCart,
    cart,
    setActiveTab,
    isDarkMode,
  } = useStore();

  // Search Mode: 'products' | 'shops'
  const [searchMode, setSearchMode] = useState<'products' | 'shops'>('products');
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tous les produits');
  const [selectedRegion, setSelectedRegion] = useState('Toutes les régions');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');

  // Filtered Approved Shops (visible to clients)
  const approvedShops = shops.filter((s) => s.status === 'approuvee');

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat === 'Tous les produits' || p.category === selectedCat;
    const matchShop =
      selectedShopId === 'all' ||
      p.shopId === selectedShopId ||
      p.shopName?.toLowerCase() === selectedShopId.toLowerCase();

    const q = query.trim().toLowerCase();
    const matchQuery =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.shopName && p.shopName.toLowerCase().includes(q));

    return matchCat && matchShop && matchQuery;
  });

  // Filtered Shops for Client Search
  const filteredShops = approvedShops.filter((s) => {
    const matchRegion =
      selectedRegion === 'Toutes les régions' ||
      (s.region && s.region.toLowerCase() === selectedRegion.toLowerCase()) ||
      s.city.toLowerCase().includes(selectedRegion.toLowerCase());
      
    const q = query.trim().toLowerCase();
    const matchQuery =
      q === '' ||
      s.name.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.region && s.region.toLowerCase().includes(q)) ||
      s.city.toLowerCase().includes(q) ||
      (s.neighborhood && s.neighborhood.toLowerCase().includes(q)) ||
      s.description.toLowerCase().includes(q) ||
      s.phone.includes(q);

    return matchRegion && matchQuery;
  });

  // Check if current search matches a specific shop
  const matchingShop = query.trim() !== ''
    ? approvedShops.find(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.ownerName.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  return (
    <div
      className={`flex-1 overflow-y-auto overscroll-contain p-3 space-y-3.5 scrollbar-none pb-6 transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* Search Mode Toggle (Articles vs Boutiques) */}
      <div
        className={`p-1 rounded-2xl flex items-center border shadow-xs ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setSearchMode('products');
            setSelectedShopId('all');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            searchMode === 'products'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Articles ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchMode('shops')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            searchMode === 'shops'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Boutiques ({approvedShops.length})</span>
        </button>
      </div>

      {/* Main Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchMode === 'shops'
              ? 'Rechercher une boutique par nom, ville, gérant...'
              : 'Rechercher smartphone, robe, parfum, boutique...'
          }
          className={`w-full pl-9.5 pr-9 py-2.5 rounded-2xl text-xs font-medium outline-none shadow-2xs transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border border-slate-800 text-white focus:border-amber-500'
              : 'bg-white border border-slate-200/90 text-slate-900 focus:border-amber-500 shadow-xs'
          }`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODE 1: BOUTIQUES SEARCH                                 */}
      {/* ======================================================== */}
      {searchMode === 'shops' ? (
        <div className="space-y-3">
          {/* Region Filter Pills */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                Filtrer par Région au Niger
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {REGION_FILTERS.map((reg) => {
                const isSelected = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                        : isDarkMode
                        ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {reg} {reg === 'Agadez' ? '📍' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div
            className={`flex items-center justify-between text-[11px] px-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>
              <strong>{filteredShops.length}</strong> boutique{filteredShops.length > 1 ? 's' : ''} trouvée{filteredShops.length > 1 ? 's' : ''}
              {query ? ` pour "${query}"` : ''}
              {selectedRegion !== 'Toutes les régions' ? ` en région ${selectedRegion}` : ''}
            </span>
            {(query || selectedRegion !== 'Toutes les régions') && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedRegion('Toutes les régions');
                }}
                className="text-amber-500 font-bold hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Boutiques List */}
          <div className="space-y-3">
            {filteredShops.length === 0 ? (
              <div
                className={`rounded-2xl p-6 text-center border space-y-2.5 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-center">
                  <BeePushingCart size="md" />
                </div>
                <h4 className="text-xs font-bold">Aucune boutique ne correspond à cette recherche.</h4>
                <p className="text-[11px] text-slate-400">
                  Essayez avec un autre nom de boutique ou sélectionnez une autre région.
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedRegion('Toutes les régions');
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
                >
                  Voir toutes les boutiques
                </button>
              </div>
            ) : (
              filteredShops.map((shop) => {
                const shopProducts = products.filter((p) => p.shopId === shop.id || p.shopName === shop.name);
                const whatsappUrl = `https://wa.me/${shop.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${shop.ownerName}, j'ai vu votre boutique "${shop.name}" (${shop.region || shop.city}) sur Bee_store.`
                )}`;

                return (
                  <div
                    key={shop.id}
                    className={`rounded-[22px] border p-3.5 space-y-3 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-900/95 border-slate-800 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.6)] hover:border-amber-500/50'
                        : 'bg-white border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:border-amber-400'
                    }`}
                  >
                    {/* Header: Logo, Name, Badges */}
                    <div className="flex items-start gap-3">
                      <img
                        src={shop.logoUrl}
                        alt={shop.name}
                        className="w-13 h-13 rounded-2xl object-cover border border-amber-500/30 bg-slate-900 shrink-0 shadow-xs"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            className={`font-black text-sm leading-tight truncate ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {shop.name}
                          </h3>
                          <span className="inline-flex items-center gap-0.5 bg-amber-500/15 text-amber-400 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-500/30">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Certifiée
                          </span>
                          {shop.region && (
                            <span className="inline-flex items-center gap-0.5 bg-slate-800 text-slate-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-slate-700">
                              📍 {shop.region}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Gérant(e) : <strong>{shop.ownerName}</strong> • {shop.category}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            {shop.city} {shop.neighborhood ? `(${shop.neighborhood})` : ''}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-amber-400">
                            {shopProducts.length} article{shopProducts.length > 1 ? 's' : ''} en vente
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shop Bio / Description */}
                    {shop.description && (
                      <p
                        className={`text-xs leading-relaxed line-clamp-2 px-1 ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {shop.description}
                      </p>
                    )}

                    {/* Action Bar: Contact & Explore Boutique */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40">
                      {/* Contacts buttons */}
                      <div className="flex items-center gap-1.5">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${shop.phone}`}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 border active:scale-95 transition-all ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 text-slate-200'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Phone className="w-3 h-3" />
                          <span>Appeler</span>
                        </a>
                      </div>

                      {/* Explore Shop Products Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedShopId(shop.id);
                          setSearchMode('products');
                          setQuery('');
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Voir Articles ({shopProducts.length})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MODE 2: ARTICLES SEARCH                                  */
        /* ======================================================== */
        <div className="space-y-3">
          {/* Active Boutique filter Banner if a shop is selected */}
          {selectedShopId !== 'all' && (
            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs font-semibold ${
                isDarkMode
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">
                  Filtré par boutique :{' '}
                  <strong className="text-amber-400">
                    {shops.find((s) => s.id === selectedShopId)?.name || selectedShopId}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShopId('all')}
                className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black shrink-0"
              >
                Retirer filtre
              </button>
            </div>
          )}

          {/* If search query matched a boutique, show quick jump card */}
          {matchingShop && (
            <div
              onClick={() => {
                setSelectedShopId(matchingShop.id);
                setQuery('');
              }}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                isDarkMode
                  ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/50 hover:border-amber-400'
                  : 'bg-gradient-to-r from-amber-100 to-white border-amber-300 hover:border-amber-500'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={matchingShop.logoUrl}
                  alt=""
                  className="w-8 h-8 rounded-xl object-cover border border-amber-500/40 shrink-0"
                />
                <div className="min-w-0">
                  <h5 className="text-xs font-black truncate">
                    Boutique trouvée : {matchingShop.name}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {matchingShop.ownerName} • {matchingShop.city}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0">
                <span>Voir le catalogue</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          )}

          {/* Quick Boutiques Pills Strip */}
          <div className="space-y-1">
            <div
              className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider px-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3 text-amber-500" />
                Boutiques Partenaires
              </span>
              <button
                type="button"
                onClick={() => setSearchMode('shops')}
                className="text-amber-500 font-bold hover:underline lowercase text-[10px]"
              >
                recherche avancée &rarr;
              </button>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedShopId('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedShopId === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : isDarkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-300'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                Toutes les boutiques
              </button>

              {approvedShops.map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedShopId === shop.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isDarkMode
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img src={shop.logoUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span>{shop.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Search Tags */}
          <div className="space-y-1">
            <div
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-amber-500" />
              <span>Tendances de recherche</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : isDarkMode
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : isDarkMode
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Results Header */}
          <div
            className={`flex items-center justify-between text-[11px] px-1 pt-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>
              <strong>{filteredProducts.length}</strong> résultat{filteredProducts.length > 1 ? 's' : ''}
              {query ? ` pour "${query}"` : ''}
            </span>
            {(query || selectedCat !== 'Tous les produits' || selectedShopId !== 'all') && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedCat('Tous les produits');
                  setSelectedShopId('all');
                }}
                className="text-amber-500 font-bold hover:underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Products Results List */}
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div
                className={`rounded-2xl p-8 text-center border space-y-2.5 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-center">
                  <BeePushingCart size="md" />
                </div>
                <p className="text-xs font-semibold">Aucun article ne correspond à vos filtres de recherche.</p>
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedCat('Tous les produits');
                    setSelectedShopId('all');
                  }}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
                const isOut = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`rounded-[22px] border p-2.5 flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-900/95 border-slate-800/90 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.6)] hover:border-amber-500/50 hover:shadow-[0_10px_28px_-6px_rgba(245,158,11,0.15)]'
                        : 'bg-white border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:border-amber-400/80 hover:shadow-[0_10px_24px_-6px_rgba(245,158,11,0.12)]'
                    }`}
                  >
                    <div className="relative w-18 h-18 rounded-[16px] overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {product.badge && (
                        <span className="absolute top-1 left-1 text-[7px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div
                        className={`flex items-center justify-between text-[10px] ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <span className="truncate uppercase tracking-wider text-[9px] font-semibold text-amber-400">
                          {product.shopName ? `🏪 ${product.shopName}` : product.category}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400 font-semibold">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {product.rating}
                          </span>
                        </div>
                      </div>

                      <h4
                        className={`font-semibold text-xs leading-snug truncate tracking-tight ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {product.name}
                      </h4>

                      {/* Price & Action Row (WhatsApp 1-Click + Add to Cart) */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <div className="text-xs font-extrabold font-sans tracking-tight text-amber-500">
                          {product.price.toLocaleString('fr-FR')}{' '}
                          <span className="text-[8.5px] font-bold uppercase">
                            FCFA
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {(() => {
                            const vendorShop = shops.find((s) => s.id === product.shopId);
                            const vendorPhone = vendorShop?.phone || '97470831';
                            const vendorCountryCode = vendorShop?.countryCode || '+227';
                            const vendorShopName = vendorShop?.name || product.shopName || 'Boutique Partenaire';
                            const whatsappUrl = getVendorWhatsAppUrl({
                              phone: vendorPhone,
                              countryCode: vendorCountryCode,
                              product,
                              shopName: vendorShopName,
                            });

                            return (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9.5px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                                title="Commander directement sur WhatsApp"
                              >
                                <MessageCircle className="w-2.5 h-2.5 fill-white text-emerald-600" />
                                <span>Acheter</span>
                              </a>
                            );
                          })()}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                            }}
                            disabled={isOut}
                            className={`px-2 py-1 rounded-lg text-[9.5px] font-bold flex items-center gap-0.5 active:scale-92 transition-all ${
                              isOut
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : inCart > 0
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs shadow-amber-500/20'
                            }`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{inCart > 0 ? `(${inCart})` : 'Panier'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
