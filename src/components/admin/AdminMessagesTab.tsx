import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Conversation, ChatMessage, Product } from '../../types';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Trash2,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Send,
  ArrowLeft,
  Store,
  User,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminMessagesTab: React.FC = () => {
  const {
    conversations,
    messages,
    sendChatMessage,
    deleteConversation,
    markConversationAsRead,
    markVendorConversationAsRead,
    products,
    shops,
    isDarkMode,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'support' | 'vendor'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);
  const conversationMessages = messages.filter((m) => m.conversationId === selectedConvId);

  // Auto scroll to bottom of active conversation
  useEffect(() => {
    if (selectedConvId) {
      markConversationAsRead(selectedConvId);
      markVendorConversationAsRead(selectedConvId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvId, conversationMessages.length]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      conv.buyerName?.toLowerCase().includes(q) ||
      conv.buyerPhone?.toLowerCase().includes(q) ||
      conv.shopName?.toLowerCase().includes(q) ||
      conv.lastMessageText?.toLowerCase().includes(q) ||
      conv.productName?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (filterType === 'unread') {
      return (conv.unreadCountBuyer || 0) > 0 || (conv.unreadCountVendor || 0) > 0;
    }
    if (filterType === 'support') {
      return (
        conv.id.includes('support') ||
        conv.shopName.includes('Support') ||
        conv.shopName.includes('Abdourahmen')
      );
    }
    if (filterType === 'vendor') {
      return (
        !conv.id.includes('support') &&
        !conv.shopName.includes('Support')
      );
    }
    return true;
  });

  const unreadTotal = conversations.reduce(
    (acc, c) => acc + (c.unreadCountBuyer || 0) + (c.unreadCountVendor || 0),
    0
  );

  const handleSendAdminReply = async (customMessage?: string) => {
    const text = customMessage || replyText;
    if (!text.trim() || !selectedConvId) return;

    setIsSending(true);
    try {
      await sendChatMessage(selectedConvId, text, undefined, 'system');
      setReplyText('');
      showToast('Message administrateur transmis', 'success');
    } catch (err) {
      console.error('Error sending admin message:', err);
      showToast('Erreur lors de l\'envoi', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPreset = (presetText: string) => {
    handleSendAdminReply(presetText);
  };

  const openWhatsApp = (phone?: string, text?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      text ||
        `Bonjour, je suis Abdourahmen (Administrateur Golden Bee Store). Je vous contacte au sujet de votre activité / commande sur la plateforme.`
    );
    window.open(`https://wa.me/227${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick stats */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } shadow-xs space-y-3`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Espace Discussions & Support PV</span>
                {unreadTotal > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
                    {unreadTotal} non lu(s)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gérez toutes les demandes de clients, discussions vendeurs et questions support.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const wa = encodeURIComponent(
                  'Bonjour Abdourahmen, je souhaite vous contacter concernant Golden Bee Store.'
                );
                window.open(`https://wa.me/22797470831?text=${wa}`, '_blank');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Admin (97470831)</span>
            </button>
          </div>
        </div>

        {/* Search bar & Filter tabs */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, boutique ou message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                filterType === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Toutes ({conversations.length})
            </button>

            <button
              onClick={() => setFilterType('unread')}
              className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                filterType === 'unread'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Non lues ({conversations.filter((c) => (c.unreadCountBuyer || 0) > 0 || (c.unreadCountVendor || 0) > 0).length})
            </button>

            <button
              onClick={() => setFilterType('support')}
              className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                filterType === 'support'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Support Central
            </button>

            <button
              onClick={() => setFilterType('vendor')}
              className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                filterType === 'vendor'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Boutiques Vendeurs
            </button>
          </div>
        </div>
      </div>

      {/* Main split view: list + active chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Conversations List */}
        <div
          className={`${
            selectedConvId ? 'hidden lg:block lg:col-span-5' : 'col-span-1 lg:col-span-5'
          } space-y-2`}
        >
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const hasUnread = (conv.unreadCountBuyer || 0) > 0 || (conv.unreadCountVendor || 0) > 0;
              const isSupport =
                conv.id.includes('support') ||
                conv.shopName.includes('Support') ||
                conv.shopName.includes('Abdourahmen');

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                      : isDarkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        {isSupport ? (
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
                            👑
                          </div>
                        ) : (
                          <img
                            src={
                              conv.shopLogo ||
                              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={conv.shopName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                        )}
                        {hasUnread && (
                          <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 absolute -top-1 -right-1 animate-ping" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {conv.buyerName || 'Client Acheteur'}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {conv.lastMessageTime
                              ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="truncate font-semibold text-amber-700 dark:text-amber-400">
                            {conv.shopName}
                          </span>
                          {conv.buyerPhone && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px]">{conv.buyerPhone}</span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-1 font-medium">
                          {conv.lastMessageText || 'Discussion active'}
                        </p>

                        {conv.productName && (
                          <div className="flex items-center gap-1.5 mt-1.5 p-1 px-2 rounded-lg bg-amber-500/10 text-[10.5px] text-amber-900 dark:text-amber-300 font-medium">
                            <ShoppingBag className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">Article : {conv.productName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Rétention 7 jours</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openWhatsApp(conv.buyerPhone || conv.shopPhone)}
                        className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg flex items-center gap-1 transition-colors"
                        title="Ouvrir WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>

                      {conv.buyerPhone && (
                        <a
                          href={`tel:${conv.buyerPhone.replace(/[^0-9]/g, '')}`}
                          className="p-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg flex items-center gap-1"
                          title="Appeler"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        onClick={() => deleteConversation(conv.id)}
                        className="p-1 px-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Supprimer la discussion"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aucune discussion trouvée
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Les nouveaux messages des acheteurs, négociations et demandes d'assistance apparaîtront ici en direct.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Active Chat Window */}
        <div
          className={`${
            selectedConvId ? 'col-span-1 lg:col-span-7' : 'hidden lg:flex lg:col-span-7'
          } flex flex-col h-[620px] rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Stream Header */}
              <div
                className={`p-3.5 border-b shrink-0 flex items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {selectedConversation.buyerName || 'Client Acheteur'}
                      </h4>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded-full font-bold">
                        En direct
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {selectedConversation.shopName} {selectedConversation.buyerPhone ? `• ${selectedConversation.buyerPhone}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openWhatsApp(selectedConversation.buyerPhone || selectedConversation.shopPhone)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  {selectedConversation.buyerPhone && (
                    <a
                      href={`tel:${selectedConversation.buyerPhone.replace(/[^0-9]/g, '')}`}
                      className="p-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      deleteConversation(selectedConversation.id);
                      setSelectedConvId(null);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product banner if conversation is product-oriented */}
              {selectedConversation.productName && (
                <div
                  className={`p-2.5 px-3 border-b flex items-center justify-between gap-2 text-xs ${
                    isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        selectedConversation.productImage ||
                        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={selectedConversation.productName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                        Article ciblé
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white truncate">
                        {selectedConversation.productName}
                      </h5>
                    </div>
                  </div>
                  {selectedConversation.productPrice && (
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs shrink-0">
                      {selectedConversation.productPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-center my-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-900 text-[10.5px] font-bold text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                    Canal officiel Golden Bee Trade & Support Abdourahmen
                  </span>
                </div>

                {conversationMessages.map((msg) => {
                  const isSystem = msg.senderRole === 'system' || msg.isAdminDecision;
                  const isBuyer = msg.senderRole === 'buyer';

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="my-2 p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-black text-amber-800 dark:text-amber-300">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            {msg.senderName || '👑 Support Administrateur (Abdourahmen)'}
                          </span>
                          <span className="text-[10px] opacity-75 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBuyer ? 'items-start' : 'items-end'}`}
                    >
                      <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                        {isBuyer ? msg.senderName || 'Client' : msg.senderName || 'Vendeur'}
                      </span>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-2xs ${
                          isBuyer
                            ? isDarkMode
                              ? 'bg-slate-900 text-white rounded-tl-xs border border-slate-800'
                              : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-tr-xs shadow-xs'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] opacity-70">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <CheckCheck className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Presets Bar for Abdourahmen */}
              <div className="p-2 border-t border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 overflow-x-auto flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 pl-1">
                  Réponses Rapides :
                </span>
                <button
                  onClick={() => handleQuickPreset('✅ Paiement de 1 500 FCFA bien validé par Abdourahmen. Votre boutique est désormais active !')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
                >
                  🏪 Valider Boutique
                </button>
                <button
                  onClick={() => handleQuickPreset('📦 Votre commande a été vérifiée et est en cours d\'acheminement rapide.')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
                >
                  📦 Commande Expédiée
                </button>
                <button
                  onClick={() => handleQuickPreset('💰 Virement vendeur débloqué avec succès sur votre numéro My Nita / Amana.')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
                >
                  💰 Fonds Débloqués
                </button>
                <button
                  onClick={() => handleQuickPreset('Bonjour ! Je suis Abdourahmen, administrateur central. Comment puis-je vous assister ?')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
                >
                  👋 Salutation Admin
                </button>
              </div>

              {/* Message Input Form */}
              <div
                className={`p-3 border-t shrink-0 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAdminReply();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Écrire une réponse officielle en tant qu'administrateur (Abdourahmen)..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />

                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-xs active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs font-black hidden sm:inline">Envoyer</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-200">
                Sélectionnez une discussion
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Cliquez sur une conversation à gauche pour lire les messages échangés, répondre directement au client ou lui envoyer un message officiel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
