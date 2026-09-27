import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  X,
  ShieldCheck,
  Gift,
  Tag,
  Sparkles,
  Package,
  Trash2,
  Volume2,
  ExternalLink,
  Info,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AppNotification } from '../types';
import { getOrderStatusDetails } from '../utils/notificationUtils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    isDarkMode,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    localNotificationsEnabled,
    toggleLocalNotifications,
    testOrderNotification,
    setActiveTab,
    setIsReferralModalOpen,
  } = useStore();

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);

    if (notif.type === 'order_status' || notif.type === 'order_created' || notif.linkTab === 'tracking') {
      onClose();
      setActiveTab('tracking');
    } else if (notif.type === 'referral') {
      onClose();
      setIsReferralModalOpen(true);
    } else if (notif.linkTab) {
      onClose();
      setActiveTab(notif.linkTab as any);
    }
  };

  const getNotifIcon = (notif: AppNotification) => {
    switch (notif.type) {
      case 'order_status':
      case 'order_created':
        return <Truck className="w-4 h-4 text-amber-500" />;
      case 'announcement':
        return <Sparkles className="w-4 h-4 text-orange-500" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'referral':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatTimestamp = (isoDate?: string) => {
    if (!isoDate) return "À l'instant";
    try {
      const date = new Date(isoDate);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "À l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return "Récemment";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88dvh] ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800 bg-amber-500/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Centre de Notifications</h3>
                  <p className="text-[10px] text-slate-500">
                    {unreadNotificationsCount > 0
                      ? `${unreadNotificationsCount} nouvelle(s) alerte(s)`
                      : 'Vos alertes sont à jour'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-black text-amber-600 dark:text-amber-400 hover:underline px-2 py-1 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tout lire</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Live Alerts Bar */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Alertes directes :</span>
                <span className={localNotificationsEnabled ? 'text-emerald-500' : 'text-slate-400'}>
                  {localNotificationsEnabled ? 'Activées' : 'Désactivées'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => testOrderNotification()}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-colors"
                >
                  🔔 Tester le son
                </button>
                <button
                  type="button"
                  onClick={() => toggleLocalNotifications()}
                  className="text-[10px] font-bold text-slate-500 hover:underline"
                >
                  {localNotificationsEnabled ? 'Couper' : 'Activer'}
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-none">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                    <Bell className="w-6 h-6 opacity-40" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Aucune notification pour le moment
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Dès que vous passerez une commande ou qu'une annonce sera diffusée, vous recevrez une alerte en direct.
                  </p>
                  <button
                    type="button"
                    onClick={() => testOrderNotification()}
                    className="mt-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-xs"
                  >
                    Simuler une alerte de livraison
                  </button>
                </div>
              ) : (
                notifications.map((item) => {
                  const statusInfo = item.orderStatus ? getOrderStatusDetails(item.orderStatus) : null;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start group relative ${
                        !item.read
                          ? isDarkMode
                            ? 'bg-slate-800/80 border-amber-500/40 shadow-xs'
                            : 'bg-amber-50/70 border-amber-200 shadow-xs'
                          : isDarkMode
                          ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getNotifIcon(item)}
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span className="text-[9.5px] text-slate-400 shrink-0">
                            {formatTimestamp(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>

                        {/* Order status tag if available */}
                        {statusInfo && item.orderNumber && (
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.orderNumber}
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-auto flex items-center gap-0.5">
                              <span>Suivre</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Read indicator or Delete on hover */}
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs">
              {notifications.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-[10.5px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Vider l'historique
                </button>
              ) : (
                <span className="text-[10px] text-slate-500">Golden Bee Store Niger</span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-transform active:scale-95"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
