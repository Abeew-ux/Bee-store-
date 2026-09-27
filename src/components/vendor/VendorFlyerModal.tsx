import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Shop } from '../../types';
import { getProductShareUrl } from '../../utils/shareUtils';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Share2,
  Sparkles,
  Smartphone,
  Square,
  Palette,
  Tag,
  Phone,
  Store,
  Check,
  Flame,
  MessageCircle,
  Copy,
  Layers,
  Eye,
  Sliders,
} from 'lucide-react';

type FlyerFormat = 'story' | 'square'; // 9:16 or 1:1
type FlyerTheme = 'gold' | 'neon' | 'emerald' | 'terracotta';

const THEMES: Record<
  FlyerTheme,
  {
    name: string;
    bgGradient: string;
    cardBg: string;
    accentColor: string;
    textColor: string;
    priceColor: string;
    badgeBg: string;
    badgeText: string;
    canvasBg: string[];
    canvasAccent: string;
    canvasCard: string;
    canvasText: string;
  }
> = {
  gold: {
    name: 'Bee Or & Noir Royal',
    bgGradient: 'from-slate-950 via-slate-900 to-amber-950/40',
    cardBg: 'bg-slate-900/90 border-amber-500/30',
    accentColor: 'text-amber-400',
    textColor: 'text-white',
    priceColor: 'text-amber-400',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    badgeText: 'text-slate-950 font-black',
    canvasBg: ['#030712', '#0f172a', '#451a03'],
    canvasAccent: '#f59e0b',
    canvasCard: '#1e293b',
    canvasText: '#ffffff',
  },
  neon: {
    name: 'Promo Flash Rouge',
    bgGradient: 'from-red-950 via-slate-950 to-orange-950',
    cardBg: 'bg-slate-900/90 border-red-500/30',
    accentColor: 'text-red-400',
    textColor: 'text-white',
    priceColor: 'text-orange-400',
    badgeBg: 'bg-gradient-to-r from-red-600 to-orange-500',
    badgeText: 'text-white font-black',
    canvasBg: ['#450a0a', '#030712', '#431407'],
    canvasAccent: '#ef4444',
    canvasCard: '#18181b',
    canvasText: '#ffffff',
  },
  emerald: {
    name: 'Émeraude & Sahel Chic',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    cardBg: 'bg-slate-900/90 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    textColor: 'text-white',
    priceColor: 'text-emerald-400',
    badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    badgeText: 'text-slate-950 font-black',
    canvasBg: ['#022c22', '#0f172a', '#042f2e'],
    canvasAccent: '#10b981',
    canvasCard: '#1e293b',
    canvasText: '#ffffff',
  },
  terracotta: {
    name: 'Agadez Ambre & Sable',
    bgGradient: 'from-amber-950 via-slate-950 to-stone-900',
    cardBg: 'bg-stone-900/90 border-amber-600/30',
    accentColor: 'text-amber-500',
    textColor: 'text-white',
    priceColor: 'text-amber-400',
    badgeBg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
    badgeText: 'text-stone-950 font-black',
    canvasBg: ['#451a03', '#1c1917', '#292524'],
    canvasAccent: '#f59e0b',
    canvasCard: '#292524',
    canvasText: '#ffffff',
  },
};

const BADGE_PRESETS = [
  '🔥 NOUVEL ARRIVAGE',
  '⚡ VENTE FLASH 24H',
  '✨ COUP DE CŒUR AGADEZ',
  '🚚 LIVRAISON PARTOUT AU NIGER',
  '🎁 OFFRE SPÉCIALE BEE_STORE',
  '⭐ TOP QUALITÉ GARANTIE',
];

export const VendorFlyerModal: React.FC = () => {
  const {
    isFlyerModalOpen,
    closeFlyerModal,
    flyerProduct,
    flyerShop,
    products,
    currentVendorShop,
    shops,
    showToast,
    coupons,
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [format, setFormat] = useState<FlyerFormat>('story');
  const [theme, setTheme] = useState<FlyerTheme>('gold');
  const [customBadge, setCustomBadge] = useState<string>('🔥 NOUVEL ARRIVAGE');
  const [customHeadline, setCustomHeadline] = useState<string>('DISPONIBLE MAINTENANT');
  const [customSubtitle, setCustomSubtitle] = useState<string>('Stock limité à Agadez • Commande rapide');
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showDiscount, setShowDiscount] = useState<boolean>(true);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active shop resolution
  const activeShop: Shop | undefined =
    flyerShop ||
    currentVendorShop ||
    (selectedProduct?.shopId ? shops.find((s) => s.id === selectedProduct.shopId) : undefined) ||
    shops[0];

  // Available products for the vendor
  const vendorProducts = products.filter(
    (p) => !activeShop || p.shopId === activeShop.id || p.shopName === activeShop.name
  );

  // Synchronize initial product when modal opens
  useEffect(() => {
    if (isFlyerModalOpen) {
      if (flyerProduct) {
        setSelectedProduct(flyerProduct);
      } else if (vendorProducts.length > 0) {
        setSelectedProduct(vendorProducts[0]);
      } else if (products.length > 0) {
        setSelectedProduct(products[0]);
      }
    }
  }, [isFlyerModalOpen, flyerProduct]);

  // Generate QR Code data URL when product changes
  useEffect(() => {
    if (!selectedProduct) return;
    const shareUrl = getProductShareUrl(selectedProduct.id);
    QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR Code generation error:', err));
  }, [selectedProduct]);

  if (!isFlyerModalOpen) return null;

  const product = selectedProduct || products[0];
  const activeTheme = THEMES[theme];
  const shopPhone = activeShop?.phone || product?.shopPhone || '97470831';
  const shopName = activeShop?.name || product?.shopName || 'Boutique Golden Bee Store';
  const shopCity = activeShop?.city || 'Agadez, Niger';

  // Calculate discount percentage if original price exists
  const hasPromo = product?.originalPrice && product.originalPrice > product.price;
  const promoPercent = hasPromo
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Generate share caption for WhatsApp
  const generateCaption = () => {
    if (!product) return '';
    const shareUrl = getProductShareUrl(product.id);
    return `✨ *${customBadge}* ✨\n\n🛍️ *${product.name}*\n💰 Prix : *${product.price.toLocaleString('fr-FR')} FCFA*${
      hasPromo ? ` _(au lieu de ${product.originalPrice?.toLocaleString('fr-FR')} FCFA)_` : ''
    }\n\n📍 *${shopName}* (${shopCity})\n📱 WhatsApp / Commande : *+227 ${shopPhone}*\n${
      selectedCouponCode ? `🎁 Code Promo : *${selectedCouponCode}*\n` : ''
    }\n🛒 *Commandez en 1 clic sur Golden Bee Store :*\n${shareUrl}`;
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(generateCaption());
      setCopiedCaption(true);
      showToast('Texte promotionnel copié ! 📋', 'success', 'Prêt à être collé dans votre statut WhatsApp.');
      setTimeout(() => setCopiedCaption(false), 3000);
    } catch {
      showToast('Impossible de copier le texte', 'error');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateCaption());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // High-Resolution Canvas Rendering Engine
  const generateAndDownloadImage = async () => {
    if (!product) return;
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Set dimensions
      const width = 1080;
      const height = format === 'story' ? 1920 : 1080;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, activeTheme.canvasBg[0]);
      bgGrad.addColorStop(0.5, activeTheme.canvasBg[1]);
      bgGrad.addColorStop(1, activeTheme.canvasBg[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient gold circle glow
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.4,
        50,
        width / 2,
        height * 0.4,
        width * 0.7
      );
      glowGrad.addColorStop(0, `${activeTheme.canvasAccent}22`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Top Header Bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🐝 BEE_STORE NIGER', 60, format === 'story' ? 120 : 90);

      ctx.textAlign = 'right';
      ctx.font = '26px sans-serif';
      ctx.fillStyle = activeTheme.canvasAccent;
      ctx.fillText(shopCity.toUpperCase(), width - 60, format === 'story' ? 120 : 90);

      // 3. Draw Badge
      const badgeY = format === 'story' ? 180 : 130;
      ctx.save();
      ctx.shadowColor = activeTheme.canvasAccent;
      ctx.shadowBlur = 20;
      ctx.fillStyle = activeTheme.canvasAccent;
      ctx.beginPath();
      ctx.roundRect(60, badgeY, 440, 56, 12);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#030712';
      ctx.font = 'black 26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(customBadge, 84, badgeY + 38);

      // 4. Headline
      const headY = format === 'story' ? 290 : 230;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(customHeadline, 60, headY);

      // 5. Draw Product Image Card
      const imgY = format === 'story' ? 340 : 270;
      const imgSize = format === 'story' ? 840 : 540;
      const imgX = (width - imgSize) / 2;

      // Card frame
      ctx.fillStyle = activeTheme.canvasCard;
      ctx.strokeStyle = `${activeTheme.canvasAccent}66`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 36);
      ctx.fill();
      ctx.stroke();

      // Load and draw product image safely without tainting canvas
      const drawProductImage = async () => {
        return new Promise<void>((resolve) => {
          if (!product.image) {
            drawFallbackPlaceholder();
            return resolve();
          }

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(imgX + 10, imgY + 10, imgSize - 20, imgSize - 20, 28);
              ctx.clip();
              ctx.drawImage(img, imgX + 10, imgY + 10, imgSize - 20, imgSize - 20);
              ctx.restore();
              resolve();
            } catch {
              drawFallbackPlaceholder();
              resolve();
            }
          };
          img.onerror = () => {
            drawFallbackPlaceholder();
            resolve();
          };
          img.src = product.image;
        });
      };

      const drawFallbackPlaceholder = () => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX + 10, imgY + 10, imgSize - 20, imgSize - 20);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐝 ' + (product.name || 'Golden Bee Store'), width / 2, imgY + imgSize / 2 - 20);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Article Certifié & Garanti', width / 2, imgY + imgSize / 2 + 30);
      };

      await drawProductImage();

      // Promo discount tag on image if available
      if (hasPromo && showDiscount) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(imgX + 24, imgY + 24, 180, 56, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`-${promoPercent}%`, imgX + 114, imgY + 62);
      }

      // 6. Product Name & Price Section
      const infoY = format === 'story' ? imgY + imgSize + 60 : imgY + imgSize + 50;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'left';

      // Truncate product name if too long
      const displayName =
        product.name.length > 38 ? `${product.name.substring(0, 36)}...` : product.name;
      ctx.fillText(displayName, 60, infoY);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px sans-serif';
      ctx.fillText(customSubtitle, 60, infoY + 44);

      // Price Tag
      if (showPrice) {
        const priceY = infoY + 120;
        ctx.fillStyle = activeTheme.canvasAccent;
        ctx.font = 'bold 54px sans-serif';
        ctx.fillText(`${product.price.toLocaleString('fr-FR')} FCFA`, 60, priceY);

        if (hasPromo) {
          ctx.fillStyle = '#64748b';
          ctx.font = '32px sans-serif';
          const priceWidth = ctx.measureText(`${product.price.toLocaleString('fr-FR')} FCFA`).width;
          const oldPriceText = `${product.originalPrice?.toLocaleString('fr-FR')} FCFA`;
          ctx.fillText(oldPriceText, 80 + priceWidth, priceY - 4);

          // Strike-through line
          const oldWidth = ctx.measureText(oldPriceText).width;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(80 + priceWidth - 4, priceY - 14);
          ctx.lineTo(80 + priceWidth + oldWidth + 4, priceY - 14);
          ctx.stroke();
        }
      }

      // 7. Footer: Shop Info & WhatsApp & QR Code
      const footerY = format === 'story' ? height - 260 : height - 190;

      // Footer divider line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, footerY - 30);
      ctx.lineTo(width - 60, footerY - 30);
      ctx.stroke();

      // Shop Name & Contact Box
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🏪 ${shopName}`, 60, footerY + 20);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(`📱 WhatsApp : +227 ${shopPhone}`, 60, footerY + 70);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px sans-serif';
      ctx.fillText('Paiements sécurisés My Nita & Amana Ta', 60, footerY + 115);

      if (selectedCouponCode) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`🎁 Code Promo : ${selectedCouponCode}`, 60, footerY + 155);
      }

      // Draw QR Code on the bottom right
      if (showQrCode && qrDataUrl) {
        const qrSize = format === 'story' ? 190 : 150;
        const qrX = width - qrSize - 60;
        const qrY = footerY - 10;

        // White background for QR code
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
        ctx.fill();

        await new Promise<void>((resolve) => {
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          qrImg.onerror = () => resolve();
          qrImg.src = qrDataUrl;
        });

        ctx.fillStyle = '#030712';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCANNER POUR COMMANDER', qrX + qrSize / 2, qrY + qrSize + 8);
      }

      // Robust Download Execution
      const fileName = `Flyer_${(product.name || 'Produit').replace(/[^a-zA-Z0-9]/g, '_')}_${format}.png`;

      const triggerDownload = (url: string) => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      try {
        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (blob) {
              const objectUrl = URL.createObjectURL(blob);
              triggerDownload(objectUrl);
              setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
              showToast('Flyer HD téléchargé ! 🎨', 'success', 'Votre visuel haute définition est prêt.');
            } else {
              const dataUrl = canvas.toDataURL('image/png', 1.0);
              triggerDownload(dataUrl);
              showToast('Flyer HD téléchargé ! 🎨', 'success', 'Votre visuel haute définition est prêt.');
            }
          }, 'image/png', 1.0);
        } else {
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          triggerDownload(dataUrl);
          showToast('Flyer HD téléchargé ! 🎨', 'success', 'Votre visuel haute définition est prêt.');
        }
      } catch (exportErr) {
        console.warn('Direct canvas export had warning, trying safe data URL:', exportErr);
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl);
        showToast('Flyer HD téléchargé ! 🎨', 'success', 'Votre visuel haute définition est prêt.');
      }
    } catch (err) {
      console.error('Error rendering flyer image:', err);
      showToast('Erreur de génération', 'error', 'Impossible de générer le flyer. Réessayez.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div
      id="vendor-flyer-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Générateur de Flyers & Stories Vendeur
                <span className="text-[11px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  1-Clic
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Créez en quelques secondes des visuels percutants pour vos Statuts WhatsApp & Instagram
              </p>
            </div>
          </div>

          <button
            onClick={closeFlyerModal}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Preview, Right Controls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Visual Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Aperçu en Direct
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-mono">
                {format === 'story' ? 'Format Story 9:16' : 'Format Post 1:1'}
              </span>
            </div>

            {/* Flyer Simulation Frame */}
            <div
              className={`w-full max-w-[320px] rounded-2xl p-4 flex flex-col justify-between border shadow-2xl relative overflow-hidden transition-all duration-300 bg-gradient-to-b ${
                activeTheme.bgGradient
              } ${activeTheme.cardBg} ${
                format === 'story' ? 'aspect-[9/16] min-h-[500px]' : 'aspect-square'
              }`}
            >
              {/* Subtle light effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top flyer brand */}
              <div className="flex items-center justify-between shrink-0 relative z-10">
                <span className="text-[11px] font-black tracking-wider text-amber-400 flex items-center gap-1">
                  🐝 BEE_STORE
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{shopCity}</span>
              </div>

              {/* Badge & Headline */}
              <div className="my-2 space-y-1 relative z-10 shrink-0">
                <div
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] ${activeTheme.badgeBg} ${activeTheme.badgeText} shadow-md`}
                >
                  {customBadge}
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight leading-tight line-clamp-1">
                  {customHeadline}
                </h4>
              </div>

              {/* Product Image Box */}
              <div className="relative my-auto flex items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-inner">
                {hasPromo && showDiscount && (
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg">
                    -{promoPercent}%
                  </div>
                )}
                <img
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-36 object-contain rounded-lg drop-shadow-md"
                />
              </div>

              {/* Product Details & Price */}
              <div className="my-2 space-y-1 relative z-10 shrink-0">
                <p className="text-xs font-bold text-white line-clamp-1">{product?.name}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{customSubtitle}</p>

                {showPrice && (
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className={`text-sm font-black ${activeTheme.priceColor}`}>
                      {product?.price.toLocaleString('fr-FR')} FCFA
                    </span>
                    {hasPromo && (
                      <span className="text-[10px] text-slate-500 line-through">
                        {product.originalPrice?.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Flyer Footer: Shop & QR Code */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between shrink-0 relative z-10">
                <div className="space-y-0.5 max-w-[190px]">
                  <p className="text-[10px] font-bold text-white flex items-center gap-1 truncate">
                    <Store className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    {shopName}
                  </p>
                  <p className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 shrink-0" />
                    +227 {shopPhone}
                  </p>
                  {selectedCouponCode && (
                    <p className="text-[9px] font-mono text-amber-400">
                      Code : <span className="font-bold">{selectedCouponCode}</span>
                    </p>
                  )}
                </div>

                {showQrCode && qrDataUrl && (
                  <div className="p-1 bg-white rounded-md shadow shrink-0">
                    <img src={qrDataUrl} alt="QR Code" className="w-9 h-9" />
                  </div>
                )}
              </div>
            </div>

            {/* Live Share and Quick Actions */}
            <div className="w-full max-w-[320px] grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4" />
                Statut WhatsApp
              </button>

              <button
                onClick={handleCopyCaption}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Texte Promo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Choose Product */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Produit à Mettre en Valeur
              </label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const match = products.find((p) => p.id === e.target.value);
                  if (match) setSelectedProduct(match);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {vendorProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.price.toLocaleString('fr-FR')} FCFA ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Format & Theme Selection */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-4">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Format & Design Graphique
              </label>

              {/* Format selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('story')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    format === 'story'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Format Story (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('square')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    format === 'square'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  Format Post Carré (1:1)
                </button>
              </div>

              {/* Theme palette pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-amber-400" />
                  Palette Graphique
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(THEMES) as FlyerTheme[]).map((tKey) => {
                    const th = THEMES[tKey];
                    const isSelected = theme === tKey;
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setTheme(tKey)}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-slate-950 ring-1 ring-amber-500'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-full h-3 rounded-md"
                          style={{
                            background: `linear-gradient(to right, ${th.canvasBg[0]}, ${th.canvasAccent})`,
                          }}
                        />
                        <span className="text-[10px] font-bold text-white truncate">{th.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Text & Badges Customizer */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Accroches & Textes Publicitaires
              </label>

              {/* Badges Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">Badge Accroche :</span>
                <div className="flex flex-wrap gap-1.5">
                  {BADGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomBadge(preset)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-colors ${
                        customBadge === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Titre Principal :</span>
                  <input
                    type="text"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Ex: DISPONIBLE MAINTENANT"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Sous-titre / Appel à l'action :</span>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Stock limité • Livraison 24h"
                  />
                </div>
              </div>

              {/* Attach Coupon if available */}
              {coupons.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Associer un Code Promo au Flyer :
                  </span>
                  <select
                    value={selectedCouponCode}
                    onChange={(e) => setSelectedCouponCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Aucun code promo</option>
                    {coupons
                      .filter((c) => c.isActive)
                      .map((c) => (
                        <option key={c.id} value={c.code}>
                          Code {c.code} ({c.discountValue}
                          {c.discountType === 'percentage' ? '%' : ' FCFA'} de remise)
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* 4. Display Toggles */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showQrCode}
                  onChange={(e) => setShowQrCode(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                Inclure QR Code de commande
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                Afficher le Prix
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showDiscount}
                  onChange={(e) => setShowDiscount(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                Afficher badge % Réduction
              </label>
            </div>

            {/* Big Action Download Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={generateAndDownloadImage}
                disabled={isGeneratingImage}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Génération Haute Résolution en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Télécharger le Flyer HD (Image PNG 1080px)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
