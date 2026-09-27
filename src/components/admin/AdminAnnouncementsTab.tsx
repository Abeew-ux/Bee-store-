import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Announcement, AnnouncementCategory, ActiveTab, OrderStatus } from '../../types';
import {
  Megaphone,
  Sparkles,
  Zap,
  Tag,
  Truck,
  Info,
  AlertTriangle,
  Plus,
  Trash2,
  Bell,
  Volume2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send,
  Eye,
  Radio,
} from 'lucide-react';

export const AdminAnnouncementsTab: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementActive,
    testOrderNotification,
    addLocalNotification,
    isDarkMode,
    showToast,
  } = useStore();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('info');
  const [badgeText, setBadgeText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLinkTab, setCtaLinkTab] = useState<ActiveTab>('shop');
  const [broadcastPush, setBroadcastPush] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = announcements.filter((a) => a.isActive).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Champs obligatoires manquants', 'error', 'Veuillez saisir un titre et un contenu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        isActive: true,
        badgeText: badgeText.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        ctaLinkTab: ctaText.trim() ? ctaLinkTab : undefined,
        authorName: 'Direction Golden Bee',
        broadcastPush,
      });

      // Reset form
      setTitle('');
      setContent('');
      setBadgeText('');
      setCtaText('');
      setCategory('info');
      showToast(
        'Annonce publiée avec succès !',
        'success',
        broadcastPush ? 'Alerte sonore et notification diffusées aux utilisateurs.' : 'Visible en bannière.'
      );
    } catch (error) {
      console.error(error);
      showToast('Erreur de publication', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateOrderStatus = async (status: OrderStatus, orderNum: string, message: string) => {
    await addLocalNotification({
      type: 'order_status',
      title: `Colis ${orderNum} : Mise à jour`,
      message,
      orderNumber: orderNum,
      orderStatus: status,
      linkTab: 'tracking',
      read: false,
    });
    showToast('Simulation envoyée', 'info', message);
  };

  const getCategoryMeta = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'flash':
        return {
          label: 'Flash Info',
          icon: <Zap className="w-3.5 h-3.5" />,
          color: 'bg-rose-500 text-white',
          border: 'border-rose-500/30 bg-rose-500/10',
        };
      case 'promo':
        return {
          label: 'Promotion',
          icon: <Tag className="w-3.5 h-3.5" />,
          color: 'bg-emerald-500 text-slate-950',
          border: 'border-emerald-500/30 bg-emerald-500/10',
        };
      case 'livraison':
        return {
          label: 'Livraison & Expédition',
          icon: <Truck className="w-3.5 h-3.5" />,
          color: 'bg-amber-500 text-slate-950',
          border: 'border-amber-500/30 bg-amber-500/10',
        };
      case 'maintenance':
        return {
          label: 'Information Système',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          color: 'bg-purple-500 text-white',
          border: 'border-purple-500/30 bg-purple-500/10',
        };
      default:
        return {
          label: 'Communiqué Général',
          icon: <Info className="w-3.5 h-3.5" />,
          color: 'bg-blue-600 text-white',
          border: 'border-blue-500/30 bg-blue-500/10',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                Diffusion de Petites Annonces & Alertes
              </h3>
              <p className="text-[11px] text-slate-300">
                {activeCount} annonce(s) active(s) affichée(s) en temps réel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => testOrderNotification()}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            title="Tester le carillon audio et la notification"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tester Sonnerie</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Communiquez directement avec toute la communauté Golden Bee Store (acheteurs, vendeurs de Niamey et des régions). Les annonces s'affichent en haut de la page et peuvent émettre un carillon sonore instantané.
        </p>
      </div>

      {/* 2. FORMULAIRE DE CRÉATION D'ANNONCE */}
      <div
        className={`p-4 rounded-2xl border space-y-3.5 ${
          isDarkMode
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-500" />
            Créer une Nouvelle Petite Annonce
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
            Diffusion Immédiate
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Titre */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Titre de l'Annonce *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Grand arrivage de montres & sacs chez Boutique Fati"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          {/* Catégorie & Badge personnalisé */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Catégorie de l'Annonce
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="info">📢 Information / Communiqué</option>
                <option value="flash">⚡ Flash Info Urgent</option>
                <option value="promo">🎁 Promotion Spéciale</option>
                <option value="livraison">🚚 Expédition & Suivi Colis</option>
                <option value="maintenance">⚙️ Maintenance Système</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Texte du Badge (Court)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ex: ARRIVAGE NIAMEY, -20% AUJOURD'HUI"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase font-mono"
              />
            </div>
          </div>

          {/* Contenu */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Contenu Détaillé du Message *
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Expliquez en détails votre annonce à la communauté (promotions, nouveaux services, consignes de sécurité, etc.)."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              required
            />
          </div>

          {/* Bouton d'action optionnel (CTA) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              Bouton d'Action & Redirection (Optionnel)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Texte du bouton (ex: Découvrir)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={ctaLinkTab}
                  onChange={(e) => setCtaLinkTab(e.target.value as ActiveTab)}
                  disabled={!ctaText.trim()}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
                >
                  <option value="shop">Vers la Boutique / Produits</option>
                  <option value="tracking">Vers le Suivi Colis</option>
                  <option value="vendor">Vers l'Espace Vendeur</option>
                  <option value="chat">Vers les Discussions Vendeurs</option>
                  <option value="cart">Vers le Panier</option>
                </select>
              </div>
            </div>
          </div>

          {/* Option Push notification directe */}
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer">
            <input
              type="checkbox"
              checked={broadcastPush}
              onChange={(e) => setBroadcastPush(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Diffuser une alerte sonore et vibration immédiate
              </span>
              <span className="text-[10px] text-slate-500 block">
                Fait sonner le carillon et ajoute la notification dans le centre d'alertes des utilisateurs
              </span>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Publication en cours...' : 'Publier la Petite Annonce'}</span>
          </button>
        </form>
      </div>

      {/* 3. LISTE DES ANNONCES EXISTANTES */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-amber-500" />
            Annonces Publiées ({announcements.length})
          </span>
          <span className="text-[10px] text-slate-400">
            {activeCount} en ligne
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Aucune petite annonce pour le moment. Remplissez le formulaire ci-dessus pour en publier une.
          </div>
        ) : (
          <div className="space-y-2.5">
            {announcements.map((item) => {
              const meta = getCategoryMeta(item.category);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.isActive
                      ? isDarkMode
                        ? 'bg-slate-950/80 border-slate-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 shadow-xs'
                      : 'opacity-60 border-dashed border-slate-300 dark:border-slate-800 bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${meta.color}`}
                      >
                        {meta.icon}
                        <span>{item.badgeText || meta.label}</span>
                      </span>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          item.isActive
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {item.isActive ? '● En Ligne' : '○ Masquée'}
                      </span>
                    </div>

                    {/* Actions: Toggle Active & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleAnnouncementActive(item.id)}
                        className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          item.isActive
                            ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        }`}
                      >
                        {item.isActive ? 'Masquer' : 'Activer'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Supprimer définitivement cette annonce ?')) {
                            deleteAnnouncement(item.id);
                            showToast('Annonce supprimée', 'info');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {item.ctaText && (
                      <span className="font-bold text-amber-500 flex items-center gap-1">
                        Bouton : "{item.ctaText}" &rarr; {item.ctaLinkTab}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. CONSOLE DE SIMULATION DE SUIVI DE COMMANDE POUR TEST ADMIN */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            Simulateur d'Alertes Suivi en Temps Réel
          </span>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Carillon & Vibration
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Testez le son et les alertes haptiques pour chaque étape clé d'une commande client :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              handleSimulateOrderStatus(
                'fonds_bloques_sequestre',
                'CMD-TEST',
                'Votre paiement My Nita a été vérifié par la centrale. La boutique prépare votre colis.'
              )
            }
            className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>Paiement Validé</span>
            <span className="text-[9.5px] opacity-75 font-normal">Sons & Alerte</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleSimulateOrderStatus(
                'en_livraison',
                'CMD-TEST',
                'Votre colis est en cours d’acheminement vers votre quartier à Niamey.'
              )
            }
            className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95"
          >
            <Truck className="w-4 h-4 text-blue-500" />
            <span>En Livraison</span>
            <span className="text-[9.5px] opacity-75 font-normal">Sons & Alerte</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleSimulateOrderStatus(
                'livree',
                'CMD-TEST',
                'Votre commande a été livrée avec succès ! Merci de votre confiance.'
              )
            }
            className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Colis Livré</span>
            <span className="text-[9.5px] opacity-75 font-normal">Sons & Alerte</span>
          </button>
        </div>
      </div>
    </div>
  );
};
