import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ActiveTab } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Heart,
  ShoppingBag,
  Building2,
  MessageSquareMore,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, unreadChatCount, vendorUnreadChatCount, favoritesCount, isDarkMode } = useStore();
  const [prevCount, setPrevCount] = useState(cartCount);
  const [isBouncing, setIsBouncing] = useState(false);

  // Trigger bounce effect on icon whenever cart count increases
  useEffect(() => {
    if (cartCount > prevCount) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string; isCart?: boolean }[] = [
    {
      id: 'shop',
      label: 'Bee_store',
      icon: <Store className="w-5 h-5" />,
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: <Heart className="w-5 h-5" />,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'chat',
      label: 'Discussion',
      icon: <MessageSquareMore className="w-5 h-5" />,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'cart',
      label: 'Panier',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: cartCount > 0 ? cartCount : undefined,
      isCart: true,
    },
    {
      id: 'vendor',
      label: 'Ma Boutique',
      icon: <Building2 className="w-5 h-5" />,
      badge: vendorUnreadChatCount > 0 ? vendorUnreadChatCount : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-black',
    },
  ];

  return (
    <nav
      className="border-t shrink-0 z-30 select-none pb-safe transition-colors duration-200 bg-[#070D1E] border-[#18284B] text-slate-400"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={item.isCart ? 'mobile-bottom-nav-cart-btn' : undefined}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center h-full relative transition-all active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={item.isCart && isBouncing ? { scale: [1, 1.35, 0.85, 1.15, 1], rotate: [0, -8, 8, -4, 0] } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  {item.icon}
                </motion.div>

                {/* Animated Badge if present */}
                <AnimatePresence mode="wait">
                  {item.badge !== undefined && (
                    <motion.span
                      key={`${item.id}-${item.badge}`}
                      initial={{ scale: 0.2, opacity: 0, y: 4 }}
                      animate={{ scale: [0.3, 1.25, 0.95, 1.05, 1], opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: 'easeOut',
                      }}
                      className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-black text-white ${
                        item.badgeColor || 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40'
                      } rounded-full ring-2 ring-[#070D1E]`}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <span
                className={`text-[11px] mt-1 tracking-tight ${
                  isActive ? 'font-black text-amber-400' : 'font-semibold text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <motion.span
                  layoutId="activeTabIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="w-6 h-1 bg-amber-400 rounded-full absolute bottom-1 shadow-xs shadow-amber-400/50"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
