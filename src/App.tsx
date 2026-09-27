import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { usePWA } from './hooks/usePWA';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileShopView } from './components/mobile/MobileShopView';
import { MobileSearchView } from './components/mobile/MobileSearchView';
import { MobileCartView } from './components/mobile/MobileCartView';
import { MobileTrackingView } from './components/mobile/MobileTrackingView';
import { MobileVendorView } from './components/mobile/MobileVendorView';
import { MobileChatView } from './components/mobile/MobileChatView';
import { MobileAdminView } from './components/mobile/MobileAdminView';
import { MobileFavoritesView } from './components/mobile/MobileFavoritesView';

import { ProductModal } from './components/ProductModal';
import { CheckoutModal } from './components/CheckoutModal';
import { MyNitaPaymentModal } from './components/MyNitaPaymentModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { ProductEditModal } from './components/admin/ProductEditModal';
import { CreateShopModal } from './components/vendor/CreateShopModal';
import { ReferralModal } from './components/ReferralModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingTutorialModal } from './components/onboarding/OnboardingTutorialModal';
import { ToastContainer } from './components/Toast';
import { OfflineIndicatorBanner } from './components/pwa/OfflineIndicatorBanner';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';

import { Product } from './types';
import { Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainMobileApp: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedProduct,
    setSelectedProduct,
    setTrackingOrderNumber,
    isReferralModalOpen,
    setIsReferralModalOpen,
    isUserProfileModalOpen,
    setIsUserProfileModalOpen,
    currentUser,
    openAuthModal,
    isDarkMode,
    isOnboardingOpen,
    closeOnboardingTutorial,
    products,
    shops,
    isAdminAuthenticated,
  } = useStore();

  const pwaState = usePWA();
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'mobile_frame' | 'expanded'>('mobile_frame');

  // Protect admin tab from unauthorized direct access
  useEffect(() => {
    if (activeTab === 'admin' && !isAdminAuthenticated) {
      setActiveTab('shop');
    }
  }, [activeTab, isAdminAuthenticated, setActiveTab]);

  // Auto-sync products & shops to offline storage cache
  useEffect(() => {
    if (products.length > 0 || shops.length > 0) {
      pwaState.saveCatalogOffline(products, shops);
    }
  }, [products, shops, pwaState.saveCatalogOffline]);

  // Welcome prompt: Prompt user to log in or create an account after onboarding
  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem('bee_store_welcomed_v1');
      const hasCompletedOnboarding = localStorage.getItem('bee_store_onboarding_completed');
      if (!currentUser && !hasSeen && hasCompletedOnboarding) {
        sessionStorage.setItem('bee_store_welcomed_v1', 'true');
        openAuthModal('login');
      }
    } catch {}
  }, [currentUser, isOnboardingOpen]);

  const handleAddNewProduct = () => {
    setProductToEdit(null);
    setIsEditProductOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsEditProductOpen(true);
  };

  const handleOpenTrackingFromReceipt = (orderNumber: string) => {
    setTrackingOrderNumber(orderNumber);
    setActiveTab('tracking');
  };

  return (
    <div
      className="h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center p-0 sm:p-2 lg:p-4 font-sans select-none transition-colors duration-300 bg-[#040814] text-slate-100"
    >
      {/* Top Device Bar Controls for Desktop */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-4 py-1 text-slate-400 text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bee Store • Boutique & Marketplace Officielle</span>
        </div>

        <button
          onClick={() => setViewMode((prev) => (prev === 'mobile_frame' ? 'expanded' : 'mobile_frame'))}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border bg-[#0D182E] text-slate-300 border-[#1B2F58] hover:text-white transition-colors"
        >
          {viewMode === 'mobile_frame' ? (
            <>
              <Monitor className="w-3 h-3" />
              <span>Plein Écran</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3" />
              <span>Format Téléphone</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mobile App Frame Container */}
      <div
        className={`w-full h-full flex flex-col overflow-hidden relative transition-all duration-300 shadow-2xl bg-[#060C1B] text-slate-100 border-[#18284B] shadow-amber-950/20 ${
          viewMode === 'mobile_frame'
            ? 'sm:max-w-[420px] sm:h-[880px] sm:max-h-[96dvh] sm:rounded-[40px] sm:border-[8px] sm:border-[#101C38]'
            : 'sm:max-w-2xl sm:h-[94dvh] sm:rounded-3xl sm:border sm:border-[#18284B]'
        }`}
      >
        {/* Dynamic Island / Speaker cutout on desktop phone frame */}
        {viewMode === 'mobile_frame' && (
          <div className="hidden sm:flex justify-center pt-2 pb-0.5 shrink-0 bg-[#070D1E]">
            <div className="w-28 h-4 bg-[#040814] rounded-full flex items-center justify-between px-2 text-[9px] text-slate-400 border border-[#18284B]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[8.5px] font-mono text-amber-300 font-bold tracking-wider">BEE STORE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Top App Bar Header */}
        <MobileHeader />

        {/* Offline / Connection Status Banner */}
        <OfflineIndicatorBanner
          isOnline={pwaState.isOnline}
          connectionQuality={pwaState.connectionQuality}
          cachedProductsCount={pwaState.cachedProductsCount}
          lastCachedDate={pwaState.lastCachedDate}
        />

        {/* Dynamic Mobile View Screen with Framer Motion Animated Transitions */}
        <main
          className="flex-1 flex flex-col overflow-hidden relative transition-colors duration-200 bg-[#060C1B]"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileShopView />
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileFavoritesView />
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileSearchView />
              </motion.div>
            )}

            {activeTab === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileCartView />
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileTrackingView />
              </motion.div>
            )}

            {activeTab === 'vendor' && (
              <motion.div
                key="vendor"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileVendorView
                  onAddNewProduct={handleAddNewProduct}
                  onEditProduct={handleEditProduct}
                />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileChatView />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
              >
                <MobileAdminView
                  onAddNewProduct={handleAddNewProduct}
                  onEditProduct={handleEditProduct}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Fixed Mobile Bottom Navigation Dock */}
        <MobileBottomNav />

        {/* Bottom Home Indicator Bar for Phone Frame */}
        <div
          className={`w-28 h-1 rounded-full mx-auto my-1.5 shrink-0 hidden sm:block ${
            isDarkMode ? 'bg-slate-800' : 'bg-slate-300'
          }`}
        />
      </div>

      {/* Global Modals & Sheets */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CheckoutModal />

      <MyNitaPaymentModal />

      <OrderReceiptModal
        onOpenTracking={handleOpenTrackingFromReceipt}
      />

      <ProductEditModal
        isOpen={isEditProductOpen}
        onClose={() => setIsEditProductOpen(false)}
        product={productToEdit}
      />

      <CreateShopModal />

      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
      />

      <AuthModal />

      {/* Onboarding Tutorial Overlay for First Visit & Help */}
      <OnboardingTutorialModal
        isOpen={isOnboardingOpen}
        onClose={closeOnboardingTutorial}
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner
        isInstalled={pwaState.isInstalled}
        isInstallable={pwaState.isInstallable}
        isIOS={pwaState.isIOS}
        isBannerDismissed={pwaState.isBannerDismissed}
        onInstall={pwaState.installPWA}
        onDismiss={() => pwaState.dismissInstallBanner(3)}
      />

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainMobileApp />
    </StoreProvider>
  );
}

export default App;
