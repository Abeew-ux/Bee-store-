import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Conversation, ChatMessage, Product } from '../../types';
import { getRemainingDays } from '../../data/initialConversations';
import {
  MessageSquare,
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
  AlertTriangle,
  FileText,
  Crown,
  ChevronRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRelativeTime } from '../mobile/MobileChatView';

export const VendorChatAndPVTab: React.FC = () => {
  const {
    currentVendorShop,
    conversations,
    messages,
    sendChatMessage,
    markVendorConversationAsRead,
    deleteConversation,
    products,
    isDarkMode,
    showToast,
  } = useStore();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'admin_pv' | 'buyers'>('all');
  const [now, setNow] = useState(() => Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-refresh relative timestamps every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!currentVendorShop) return null;

  // Filter all conversations belonging to this specific shop
  const shopConversations = conversations.filter(
    (c) => c.shopId === currentVendorShop.id
  );

  // Selected conversation
  const activeConversation = shopConversations.find((c) => c.id === selectedConvId);

  // Messages for active conversation
  const conversationMessages = messages.filter(
    (m) => m.conversationId === selectedConvId
  );

  // Auto scroll to bottom & mark as read for vendor
  useEffect(() => {
    if (selectedConvId) {
      markVendorConversationAsRead(selectedConvId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvId, conversationMessages.length]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !selectedConvId) return;

    setIsSending(true);
    await sendChatMessage(selectedConvId, textToSend.trim(), undefined, 'vendor');
    setInputText('');
    setIsSending(false);
  };

  const handleQuickVendorReply = (template: string) => {
    handleSendMessage(template);
  };

  const handleCallBuyer = (phone?: string) => {
    if (!phone) {
      showToast('Numéro non renseigné', 'info', 'Le client discute via messagerie directe.');
      return;
    }
    window.open(`tel:${phone.replace(/[^0-9+]/g, '')}`, '_self');
  };

  const handleWhatsAppBuyer = (phone?: string, buyerName?: string) => {
    if (!phone) {
      showToast('Numéro WhatsApp non renseigné', 'info', 'Le client discute via messagerie directe.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('227') ? cleanPhone : `227${cleanPhone}`;
    const msg = encodeURIComponent(
      `Bonjour ${buyerName || 'Cher client'}, je suis le gérant de la boutique "${currentVendorShop.name}" sur Bee Store suite à votre message.`
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
  };

  // Filter conversations based on search and tab
  const filteredList = shopConversations.filter((c) => {
    const matchesSearch =
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.productName && c.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'admin_pv') {
      return c.isAdminOfficial || c.buyerId === 'admin-central';
    }
    if (activeFilter === 'buyers') {
      return !c.isAdminOfficial && c.buyerId !== 'admin-central';
    }
    return true;
  });

  const adminPvCount = shopConversations.filter((c) => c.isAdminOfficial || c.buyerId === 'admin-central').length;
  const buyersCount = shopConversations.filter((c) => !c.isAdminOfficial && c.buyerId !== 'admin-central').length;
  const totalUnreadVendor = shopConversations.reduce((sum, c) => sum + (c.unreadCountVendor || 0), 0);

  return (
    <div className="space-y-3">
      {/* Real-time sync status pill */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
            <span>Messagerie & PV Décisions</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">
              Temps Réel Cloud
            </span>
          </span>
        </div>

        {totalUnreadVendor > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-pulse">
            {totalUnreadVendor} non lu(s)
          </span>
        )}
      </div>

      {/* Main Container */}
      {!activeConversation ? (
        /* List of conversations & PVs */
        <div className="space-y-2.5">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-900 rounded-xl overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tous ({shopConversations.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('admin_pv')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeFilter === 'admin_pv'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-800 dark:text-amber-400 hover:text-amber-900'
              }`}
            >
              <Crown className="w-3 h-3" />
              <span>PV Décisions ({adminPvCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('buyers')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeFilter === 'buyers'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 dark:text-emerald-400 hover:text-emerald-900'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Clients ({buyersCount})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos messages et PV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Conversation & PV list */}
          {filteredList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto font-black text-xl">
                💬
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white">
                Aucun message pour le moment
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Vos décisions d'ouverture/fermeture administratives et les messages directs des clients apparaîtront ici instantanément.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((conv) => {
                const isAdmin = conv.isAdminOfficial || conv.buyerId === 'admin-central';
                const hasUnread = (conv.unreadCountVendor || 0) > 0;
                const remainingDays = getRemainingDays(conv.updatedAt || conv.createdAt);

                return (
                  <motion.div
                    key={conv.id}
                    layout
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      markVendorConversationAsRead(conv.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex items-center gap-3 active:scale-[0.99] ${
                      isAdmin
                        ? isDarkMode
                          ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
                          : 'bg-amber-50/90 border-amber-300 hover:bg-amber-100/80 shadow-2xs'
                        : hasUnread
                        ? isDarkMode
                          ? 'bg-slate-900 border-emerald-500/40'
                          : 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                        : isDarkMode
                        ? 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Icon / Avatar */}
                    <div className="relative shrink-0">
                      {isAdmin ? (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                          <Crown className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-xs">
                          {conv.buyerName ? conv.buyerName.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}

                      {isAdmin ? (
                        <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-0.5 shadow-2xs">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-2xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Middle Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4
                            className={`text-xs font-black truncate ${
                              isAdmin
                                ? 'text-amber-900 dark:text-amber-300 font-black'
                                : hasUnread
                                ? 'text-emerald-700 dark:text-emerald-400 font-black'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {isAdmin ? '👑 Décision Centrale Administration' : conv.buyerName}
                          </h4>
                          {isAdmin && (
                            <span className="text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 shrink-0">
                              PV Officiel
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 opacity-60 text-amber-500" />
                          <span>{formatRelativeTime(conv.lastMessageTime, now)}</span>
                        </span>
                      </div>

                      {/* Product target tag */}
                      {conv.productName && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-bold truncate mb-0.5">
                          <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">Article : {conv.productName}</span>
                        </div>
                      )}

                      {/* Last Message Snippet */}
                      <p
                        className={`text-xs truncate ${
                          hasUnread
                            ? 'font-bold text-slate-900 dark:text-slate-100'
                            : 'text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        {conv.lastMessageText}
                      </p>

                      {/* Micro info */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-amber-500" />
                          <span>Effacement dans {remainingDays}j</span>
                        </span>

                        {conv.buyerPhone && (
                          <span className="text-[9.5px] text-slate-600 dark:text-slate-400 font-mono">
                            📞 {conv.buyerPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side unread badge or arrow */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {hasUnread ? (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                          {conv.unreadCountVendor}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Active Chat / PV Stream View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Header */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedConvId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Retour à la liste"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {activeConversation.isAdminOfficial
                      ? '👑 Administration Centrale Bee Store'
                      : activeConversation.buyerName}
                  </h4>
                  {activeConversation.isAdminOfficial ? (
                    <span className="text-[9.5px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase">
                      PV Officiel
                    </span>
                  ) : (
                    <span className="text-[9.5px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded">
                      Client
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold truncate">
                  {activeConversation.buyerPhone ? `📞 ${activeConversation.buyerPhone}` : 'Messagerie directe boutique'}
                </p>
              </div>
            </div>

            {/* Top action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!activeConversation.isAdminOfficial && activeConversation.buyerPhone && (
                <>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppBuyer(activeConversation.buyerPhone, activeConversation.buyerName)}
                    className="p-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    title="Discuter sur WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span className="text-xs hidden sm:inline">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCallBuyer(activeConversation.buyerPhone)}
                    className="p-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    title="Appeler le client"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  deleteConversation(activeConversation.id);
                  setSelectedConvId(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Supprimer la conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Targeted Product snippet if attached */}
          {activeConversation.productName && (
            <div className="p-3 mx-3 mt-2.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/35 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {activeConversation.productImage && (
                  <img
                    src={activeConversation.productImage}
                    alt={activeConversation.productName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
                    Article ciblé par le client
                  </span>
                  <p className="text-xs sm:text-sm font-black text-slate-950 dark:text-white truncate">
                    {activeConversation.productName}
                  </p>
                  {activeConversation.productPrice && (
                    <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 font-mono">
                      {activeConversation.productPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 scrollbar-none">
            {/* Auto purge badge */}
            <div className="text-center my-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/90 dark:bg-slate-800 px-3.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Discussion synchronisée en direct • Conservation 7 jours</span>
              </span>
            </div>

            {conversationMessages.map((msg) => {
              const isMe = msg.senderRole === 'vendor';
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
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {new Date(msg.createdAt).toLocaleString('fr-FR')}
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
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[88%] sm:max-w-[85%]">
                    {!isMe && (
                      <div className="w-7 h-7 rounded-xl bg-slate-700 text-amber-400 flex items-center justify-center font-black text-xs shrink-0 mb-1 border border-amber-400/30">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl shadow-sm space-y-1.5 ${
                        isMe
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-br-xs'
                          : isDarkMode
                          ? 'bg-[#0E1A38] text-slate-100 border-2 border-[#1E335C] rounded-bl-xs'
                          : 'bg-white text-slate-950 border-2 border-slate-300 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs font-black opacity-90">
                        <span className={isMe ? 'text-slate-950' : 'text-amber-600 dark:text-amber-400'}>
                          {isMe ? 'Vous (Boutique)' : msg.senderName}
                        </span>
                        <span
                          className="text-[10px] font-bold flex items-center gap-1 opacity-90"
                          title={new Date(msg.createdAt).toLocaleString('fr-FR')}
                        >
                          <Clock className="w-2.5 h-2.5 opacity-70" />
                          <span>{formatRelativeTime(msg.createdAt, now)}</span>
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed whitespace-pre-wrap font-semibold ${
                        isMe ? 'text-slate-950' : 'text-slate-900 dark:text-slate-200'
                      }`}>
                        {msg.text}
                      </p>

                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold opacity-80 pt-0.5">
                        <span>Expire : {remainingDays}j</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick vendor responses */}
          <div className="p-2.5 border-t border-slate-200 dark:border-[#1C325F] bg-slate-100 dark:bg-[#081022] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 shrink-0 pl-1">
              ⚡ Réponses rapides :
            </span>

            <button
              type="button"
              onClick={() => handleQuickVendorReply('Bonjour ! Oui, le produit est immédiatement disponible en stock dans notre magasin.')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 shrink-0 transition-colors shadow-xs"
            >
              📦 Disponible en stock
            </button>

            <button
              type="button"
              onClick={() => handleQuickVendorReply('Votre commande peut être livrée dès aujourd\'hui à domicile avec paiement sécurisé.')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 shrink-0 transition-colors shadow-xs"
            >
              🚚 Expédition aujourd'hui
            </button>

            <button
              type="button"
              onClick={() => handleQuickVendorReply('Nous acceptons le paiement 100% sécurisé via My Nita ou Amana Ta au compte 97470831.')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-white dark:bg-[#0E1A38] border-slate-300 dark:border-[#1E335C] text-slate-900 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 shrink-0 transition-colors shadow-xs"
            >
              🛡️ Paiement My Nita 97470831
            </button>
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-slate-200 dark:border-[#1C325F] bg-white dark:bg-[#081022] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={
                  activeConversation.isAdminOfficial
                    ? 'Répondre à l\'administration centrale...'
                    : 'Répondre au client en direct (synchronisé temps réel)...'
                }
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
