import { useState, useEffect, useCallback } from 'react';
import { Product, Shop } from '../types';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Navigator {
    standalone?: boolean;
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
      downlink?: number;
      rtt?: number;
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    };
  }
}

const OFFLINE_PRODUCTS_KEY = 'bee_store_offline_products_v1';
const OFFLINE_SHOPS_KEY = 'bee_store_offline_shops_v1';
const OFFLINE_SYNC_TIME_KEY = 'bee_store_offline_sync_time_v1';
const PWA_BANNER_DISMISSED_KEY = 'bee_store_pwa_banner_dismissed_until';

export interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  connectionQuality: 'optimal' | 'low_bandwidth' | 'offline';
  effectiveType: string;
  cachedProductsCount: number;
  cachedShopsCount: number;
  lastCachedDate: string | null;
  installPWA: () => Promise<boolean>;
  saveCatalogOffline: (products: Product[], shops: Shop[]) => void;
  loadOfflineCatalog: () => { products: Product[]; shops: Shop[] };
  clearOfflineCache: () => void;
  isBannerDismissed: boolean;
  dismissInstallBanner: (days?: number) => void;
}

export function usePWA(): PWAState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [cachedProductsCount, setCachedProductsCount] = useState<number>(0);
  const [cachedShopsCount, setCachedShopsCount] = useState<number>(0);
  const [lastCachedDate, setLastCachedDate] = useState<string | null>(null);

  // Initialize checks & service worker
  useEffect(() => {
    // 1. Check iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Check if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // 3. Check if banner was recently dismissed
    try {
      const dismissedUntil = localStorage.getItem(PWA_BANNER_DISMISSED_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsBannerDismissed(true);
      }
    } catch {}

    // 4. Check offline cache status
    try {
      const cachedProds = localStorage.getItem(OFFLINE_PRODUCTS_KEY);
      const cachedShops = localStorage.getItem(OFFLINE_SHOPS_KEY);
      const lastSync = localStorage.getItem(OFFLINE_SYNC_TIME_KEY);

      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        setCachedProductsCount(Array.isArray(parsed) ? parsed.length : 0);
      }
      if (cachedShops) {
        const parsed = JSON.parse(cachedShops);
        setCachedShopsCount(Array.isArray(parsed) ? parsed.length : 0);
      }
      if (lastSync) {
        setLastCachedDate(new Date(Number(lastSync)).toLocaleString('fr-FR'));
      }
    } catch {}

    // 5. Network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 6. Network quality detection (Navigator Connection API)
    const updateNetworkStatus = () => {
      if (navigator.connection) {
        setEffectiveType(navigator.connection.effectiveType || '4g');
      }
    };
    updateNetworkStatus();

    if (navigator.connection && navigator.connection.addEventListener) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }

    // 7. PWA beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 8. Track appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 9. Register Service Worker in production/supporting environments
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Check for updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Bee Store PWA] Nouvelle version prête.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[Bee Store PWA] Service Worker registration info:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (navigator.connection && navigator.connection.removeEventListener) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  // Compute Connection Quality
  const connectionQuality: 'optimal' | 'low_bandwidth' | 'offline' = !isOnline
    ? 'offline'
    : effectiveType === '2g' || effectiveType === 'slow-2g'
    ? 'low_bandwidth'
    : 'optimal';

  // Trigger PWA Installation
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Bee Store PWA] Erreur lors de l\'installation:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Save Catalog to Offline Local Storage
  const saveCatalogOffline = useCallback((products: Product[], shops: Shop[]) => {
    try {
      if (products && products.length > 0) {
        localStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify(products));
        setCachedProductsCount(products.length);
      }
      if (shops && shops.length > 0) {
        localStorage.setItem(OFFLINE_SHOPS_KEY, JSON.stringify(shops));
        setCachedShopsCount(shops.length);
      }
      const now = Date.now();
      localStorage.setItem(OFFLINE_SYNC_TIME_KEY, now.toString());
      setLastCachedDate(new Date(now).toLocaleString('fr-FR'));
    } catch (err) {
      console.warn('[Bee Store Offline] Erreur sauvegarde cache:', err);
    }
  }, []);

  // Load Offline Catalog
  const loadOfflineCatalog = useCallback(() => {
    try {
      const cachedProds = localStorage.getItem(OFFLINE_PRODUCTS_KEY);
      const cachedShops = localStorage.getItem(OFFLINE_SHOPS_KEY);

      return {
        products: cachedProds ? JSON.parse(cachedProds) : [],
        shops: cachedShops ? JSON.parse(cachedShops) : [],
      };
    } catch {
      return { products: [], shops: [] };
    }
  }, []);

  // Clear Cache
  const clearOfflineCache = useCallback(() => {
    try {
      localStorage.removeItem(OFFLINE_PRODUCTS_KEY);
      localStorage.removeItem(OFFLINE_SHOPS_KEY);
      localStorage.removeItem(OFFLINE_SYNC_TIME_KEY);
      setCachedProductsCount(0);
      setCachedShopsCount(0);
      setLastCachedDate(null);
    } catch {}
  }, []);

  // Dismiss Install Banner temporarily
  const dismissInstallBanner = useCallback((days: number = 3) => {
    setIsBannerDismissed(true);
    try {
      const expire = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(PWA_BANNER_DISMISSED_KEY, expire.toString());
    } catch {}
  }, []);

  return {
    isOnline,
    isInstallable: !!deferredPrompt || isIOS,
    isInstalled,
    isIOS,
    connectionQuality,
    effectiveType,
    cachedProductsCount,
    cachedShopsCount,
    lastCachedDate,
    installPWA,
    saveCatalogOffline,
    loadOfflineCatalog,
    clearOfflineCache,
    isBannerDismissed,
    dismissInstallBanner,
  };
}
