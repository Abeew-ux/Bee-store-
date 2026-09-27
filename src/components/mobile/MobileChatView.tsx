import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getRemainingDays } from '../../data/initialConversations';
import {
  MessageSquare,
  Search,
  ShieldCheck,
  Building2,
  Clock,
  Trash2,
  ArrowLeft,
  Send,
  Sparkles,
  ShoppingBag,
  Phone,
  MessageCircle,
  CheckCheck,
  Check,
  AlertCircle,
  ExternalLink,
  Flame,
  ChevronRight,
  Filter,
  Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Relative time formatting helper with French localization
export function formatRelativeTime(dateInput: string | number | Date | undefined, nowMs: number = Date.now()): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const time = date.getTime();
  if (isNaN(time)) return '';

  const diffMs = nowMs - time;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 15) {
    return "À l'instant";
  }
  if (diffSec < 60) {
    return `il y a ${diffSec} s`;
  }
  if (diffMin < 60) {
    return `il y a ${diffMin} min`;
  }
  if (diffHour < 24) {
    const formattedHour = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `il y a ${diffHour} h (${formattedHour})`;
  }
  if (diffDay === 1) {
    const formattedHour = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Hier à ${formattedHour}`;
  }
  if (diffDay < 7) {
    return `il y a ${diffDay} j`;
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export const MobileChatView: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    startSupportConversation,
    sendChatMessage,
    markConversationAsRead,
    deleteConversation,
    cleanupExpiredChatMessages,
    setSelectedProduct,
    products,
    shops,
    startSingleItemCheckout,
    isDarkMode,
    showToast,
    currentUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'verified'>('all');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live ticker to automatically refresh relative timestamps without page reload
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 15000); // 15s refresh cycle ensures accurate 'À l'instant' and 'il y a X min'
    return () => clearInterval(interval);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId
  );

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (activeConversationId) {
      markConversationAsRead(activeConversationId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversationId, conversationMessages.length]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !activeConversationId) return;

    setIsSending(true);
    await sendChatMessage(activeConversationId, textToSend);
    setInputText('');
    setIsSending(false);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleDirectWhatsApp = () => {
    if (!activeConversation) return;
    const phone = activeConversation.shopPhone || '97470831';
    const message = encodeURIComponent(
      `Bonjour ${activeConversation.shopName}, je vous contacte depuis la discussion Golden Bee Store concernant votre boutique.`
    );
    window.open(`https://wa.me/227${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const handleOpenProduct = (productId?: string) => {
    if (!productId) return;
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleBuyAttachedProduct = (productId?: string) => {
    if (!productId) return;
    const product = products.find((p) => p.id === productId);
    if (product) {
      startSingleItemCheckout(product);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.productName && c.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'unread') {
      return (c.unreadCountBuyer || 0) > 0;
    }
    if (activeFilter === 'verified') {
      return c.isVerifiedShop !== false;
    }
    return true;
  });

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden select-none">
      {/* 1. If NO conversation is actively selected on mobile -> Show Conversations List */}
      {!activeConversation ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Golden Bee Chat Top Header */}
          <div
            className={`p-3 border-b shrink-0 transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2
                      className={`text-sm font-black tracking-tight ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Discussions Fournisseurs
                    </h2>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-orange-500 text-slate-950">
                      Golden Bee Trade
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Messagerie instantanée & Négociation directe
                  </p>
                </div>
              </div>

              {/* Purge button for storage saving */}
              <button
                type="button"
                onClick={() => {
                  cleanupExpiredChatMessages();
                  showToast('Stockage optimisé', 'info', 'Discussions et messages expirés nettoyés.');
                }}
                className={`text-[10.5px] font-bold px-2 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-orange-400 hover:bg-slate-700'
                    : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                }`}
                title="Purger les messages expirés (+ de 7 jours)"
              >
                <Clock className="w-3 h-3 text-orange-500" />
                <span>Auto-purge 7j</span>
              </button>
            </div>

            {/* Storage Optimization Notice Banner & Support Shortcut */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2 flex items-center gap-2 text-xs">
                <span className="text-sm shrink-0">⚡</span>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
                  <strong className="font-black">Économie d'espace :</strong> Vos discussions avec les vendeurs sont auto-purgées tous les 7 jours.
                </p>
              </div>

              <button
                type="button"
                onClick={() => startSupportConversation('Bonjour Abdourahmen, j\'ai une question au sujet de Golden Bee Store.')}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0 active:scale-95"
              >
                <span>👑 Assistance Abdourahmen (Support)</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative mt-2.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une boutique ou un message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activeFilter === 'all'
                    ? 'bg-orange-500 text-slate-950 shadow-xs'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Toutes ({conversations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activeFilter === 'unread'
                    ? 'bg-orange-500 text-slate-950 shadow-xs'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Non lues
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('verified')}
                className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeFilter === 'verified'
                    ? 'bg-orange-500 text-slate-950 shadow-xs'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-orange-500" />
                <span>Fournisseurs Vérifiés</span>
              </button>
            </div>
          </div>

          {/* Conversations List Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1.5 scrollbar-none">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const remainingDays = getRemainingDays(conv.updatedAt || conv.createdAt);
                const hasUnread = (conv.unreadCountBuyer || 0) > 0;

                return (
                  <motion.div
                    key={conv.id}
                    layout
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      markConversationAsRead(conv.id);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex items-center gap-3 active:scale-[0.99] ${
                      hasUnread
                        ? isDarkMode
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-xs'
                          : 'bg-amber-50/80 border-amber-300 shadow-xs'
                        : isDarkMode
                        ? 'bg-[#0A1428] hover:bg-[#0F1E3D] border-[#1C325F]'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Shop Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          conv.shopLogo ||
                          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={conv.shopName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs"
                      />
                      {conv.isVerifiedShop && (
                        <div
                          className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow-xs"
                          title="Fournisseur Vérifié Golden Bee"
                        >
                          <ShieldCheck className="w-3 h-3 text-slate-950 fill-amber-500" />
                        </div>
                      )}
                    </div>

                    {/* Middle Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs font-black truncate ${
                            hasUnread
                              ? 'text-amber-500 dark:text-amber-400'
                              : isDarkMode
                              ? 'text-slate-100'
                              : 'text-slate-900'
                          }`}
                        >
                          {conv.shopName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 opacity-60 text-amber-500" />
                          <span>{formatRelativeTime(conv.lastMessageTime, now)}</span>
                        </span>
                      </div>

                      {/* Product Preview Tag if discussion relates to a specific item */}
                      {conv.productName && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold truncate mb-0.5">
                          <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{conv.productName}</span>
                        </div>
                      )}

                      {/* Last Message Snippet */}
                      <p
                        className={`text-xs truncate ${
                          hasUnread
                            ? 'font-bold text-slate-900 dark:text-slate-200'
                            : 'text-slate-600 dark:text-slate-300 font-medium'
                        }`}
                      >
                        {conv.lastMessageText}
                      </p>

                      {/* Bottom Micro Badges */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9.5px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-amber-500" />
                          <span>Effacement dans {remainingDays}j</span>
                        </span>

                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {conv.shopCity || 'Niger'}
                        </span>
                      </div>
                    </div>

                    {/* Right side Unread Badge or Arrow */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {hasUnread ? (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                          {conv.unreadCountBuyer}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Aucune discussion active
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                  Consultez les fiches produits et cliquez sur "Discuter" pour démarrer une négociation directe avec un vendeur.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. Active Chat Stream Screen with Golden Bee Trade Design */
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
          {/* Chat Stream Header */}
          <div
            className={`p-2.5 px-3 border-b shrink-0 flex items-center justify-between gap-2 transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setActiveConversationId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Retour aux discussions"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={
                    activeConversation.shopLogo ||
                    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={activeConversation.shopName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3
                    className={`text-xs font-black truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {activeConversation.shopName}
                  </h3>
                  <ShieldCheck className="w-3 h-3 text-orange-500 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="text-emerald-500 font-bold">En ligne</span>
                  <span>•</span>
                  <span>{activeConversation.shopCity || 'Agadez'}</span>
                  <span>•</span>
                  <span className="text-orange-500 font-semibold">Réponse &lt; 1h</span>
                </div>
              </div>
            </div>

            {/* Header Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Direct WhatsApp Call */}
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="p-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                title="Discuter sur WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span className="text-[10.5px] hidden sm:inline">WhatsApp</span>
              </button>

              {/* Delete Conversation */}
              <button
                type="button"
                onClick={() => deleteConversation(activeConversation.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Supprimer la discussion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7-Day Auto-Purge Reminder Banner */}
          <div className="bg-orange-500/10 dark:bg-orange-950/30 border-b border-orange-500/20 px-3 py-1.5 flex items-center justify-between text-[10.5px]">
            <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300 font-medium truncate">
              <Clock className="w-3 h-3 text-orange-500 shrink-0" />
              <span>Discussion éphémère : messages effacés sous 7 jours pour économiser l'espace.</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-500 text-slate-950 shrink-0">
              Auto-purge 7j
            </span>
          </div>

          {/* Product Attachment Card if negotiation is about a specific item */}
          {activeConversation.productName && (
            <div
              className={`p-2.5 mx-2.5 mt-2 rounded-2xl border shadow-xs flex items-center justify-between gap-2.5 shrink-0 transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div
                onClick={() => handleOpenProduct(activeConversation.productId)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
              >
                <img
                  src={
                    activeConversation.productImage ||
                    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={activeConversation.productName}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase bg-orange-500 text-slate-950 px-1 py-0.2 rounded">
                      Article ciblé
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Trade Assurance 100%
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {activeConversation.productName}
                  </h4>
                  {activeConversation.productPrice && (
                    <span className="text-xs font-black text-orange-500 font-mono">
                      {activeConversation.productPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleBuyAttachedProduct(activeConversation.productId)}
                  className="py-1.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Acheter</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Stream Scroll Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 scrollbar-none">
            {/* Security & Trade Assurance Notice */}
            <div className="text-center my-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200/90 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Paiements My Nita & Amana Ta 100% sécurisés par Bee Store</span>
              </div>
            </div>

            {conversationMessages.map((msg) => {
              const isBuyer = msg.senderRole === 'buyer';
              const isSystemAdmin = msg.senderRole === 'system' || msg.isAdminDecision;
              const remainingDays = getRemainingDays(msg.createdAt);

              if (isSystemAdmin) {
                return (
                  <div key={msg.id} className="my-2.5 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-xs sm:text-sm space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black tracking-wide">
                        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>PV OFFICIEL DE DÉCISION ADMINISTRATIVE</span>
                      </div>
                      <span
                        className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        title={new Date(msg.createdAt).toLocaleString('fr-FR')}
                      >
                        <Clock className="w-2.5 h-2.5 text-amber-500" />
                        <span>{formatRelativeTime(msg.createdAt, now)}</span>
                      </span>
                    </div>

                    <p className="text-slate-950 dark:text-white leading-relaxed font-semibold whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {msg.adminNote && (
                      <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/35 text-xs text-amber-950 dark:text-amber-200 font-bold">
                        <strong>Note administrative :</strong> {msg.adminNote}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 pt-1">
                      <span>Timbre Numérique : BEE-STORE-PV-OFFICIEL</span>
                      <span>Expire sous {remainingDays}j</span>
                    </div>
                  </div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[88%] sm:max-w-[85%]">
                    {!isBuyer && (
                      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0 mb-1">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl shadow-sm relative space-y-1.5 ${
                        isBuyer
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-br-xs'
                          : isDarkMode
                          ? 'bg-[#0E1A38] text-slate-100 border-2 border-[#1E335C] rounded-bl-xs'
                          : 'bg-white text-slate-950 border-2 border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Sender Tag */}
                      <div className="flex items-center justify-between gap-3 text-xs font-black opacity-90">
                        <span className={isBuyer ? 'text-slate-950' : 'text-amber-600 dark:text-amber-400'}>
                          {isBuyer ? 'Vous (Acheteur)' : msg.senderName}
                        </span>
                        {!isBuyer && (
                          <span className="text-[9.5px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                            Vendeur
                          </span>
                        )}
                      </div>

                      {/* Product Preview box if message included one */}
                      {msg.productName && (
                        <div
                          onClick={() => handleOpenProduct(msg.productId)}
                          className={`p-2.5 rounded-xl border-2 flex items-center gap-2.5 cursor-pointer ${
                            isBuyer
                              ? 'bg-slate-950/10 border-slate-950/20 text-slate-950'
                              : isDarkMode
                              ? 'bg-[#070D1E] border-[#1C325F] text-slate-200'
                              : 'bg-slate-100 border-slate-300 text-slate-900'
                          }`}
                        >
                          {msg.productImage && (
                            <img
                              src={msg.productImage}
                              alt={msg.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-amber-500/30 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-xs truncate text-slate-950 dark:text-slate-100">{msg.productName}</p>
                            {msg.productPrice && (
                              <p className="font-black text-xs font-mono text-amber-800 dark:text-amber-400">
                                {msg.productPrice.toLocaleString('fr-FR')} FCFA
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap font-semibold ${
                        isBuyer ? 'text-slate-950' : 'text-slate-900 dark:text-slate-200'
                      }`}>
                        {msg.text}
                      </p>

                      {/* Footer Info: Time + Expiry countdown */}
                      <div
                        className={`flex items-center justify-end gap-2 text-[10px] font-bold pt-1 ${
                          isBuyer ? 'text-slate-900/90' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className="flex items-center gap-1"
                          title={new Date(msg.createdAt).toLocaleString('fr-FR')}
                        >
                          <Clock className="w-2.5 h-2.5 opacity-70" />
                          <span>{formatRelativeTime(msg.createdAt, now)}</span>
                        </span>
                        <span>•</span>
                        <span title="Délai avant effacement automatique">
                          Expire: {remainingDays}j
                        </span>
                        {isBuyer && (
                          <span>
                            {msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-950 inline stroke-[2.5]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 inline stroke-[2.5]" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div
            className={`p-2.5 border-t shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none transition-colors ${
              isDarkMode ? 'bg-[#081022] border-[#1C325F]' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <span className="text-xs font-black text-amber-500 shrink-0 flex items-center gap-1 pl-1">
              <Sparkles className="w-3.5 h-3.5" /> Questions rapides :
            </span>

            <button
              type="button"
              onClick={() => handleQuickQuestion('Est-ce disponible en stock immédiatement ?')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 shrink-0 transition-colors shadow-xs"
            >
              📦 Disponible en stock ?
            </button>

            <button
              type="button"
              onClick={() => handleQuickQuestion('Quel est le délai de livraison à domicile ?')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 shrink-0 transition-colors shadow-xs"
            >
              🚚 Délai de livraison ?
            </button>

            <button
              type="button"
              onClick={() => handleQuickQuestion('Possibilité de remise commerciale pour achat groupé ?')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 shrink-0 transition-colors shadow-xs"
            >
              💰 Prix de gros ?
            </button>

            <button
              type="button"
              onClick={() => handleQuickQuestion('Comment payer avec My Nita / Amana Ta ?')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 shrink-0 transition-colors shadow-xs"
            >
              🛡️ Paiement sécurisé My Nita ?
            </button>
          </div>

          {/* Bottom Chat Input Form */}
          <div
            className={`p-3 border-t shrink-0 transition-colors ${
              isDarkMode ? 'bg-[#081022] border-[#1C325F]' : 'bg-white border-slate-300'
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Écrire un message au vendeur (effacement auto 7j)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`flex-1 text-sm font-semibold px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  isDarkMode
                    ? 'bg-[#060C1B] border-[#1C325F] text-slate-100 placeholder-slate-400'
                    : 'bg-slate-100 border-slate-300 text-slate-950 placeholder-slate-500'
                }`}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`p-3 rounded-xl font-black flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                  inputText.trim() && !isSending
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                title="Envoyer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
