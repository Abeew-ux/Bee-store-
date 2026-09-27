import { OrderStatus } from '../types';

/**
 * Check if the browser supports Native Notifications
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Get current browser notification permission
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Play a gentle, high-quality audio chime using Web Audio API
 * No external mp3 dependency, works seamlessly on both mobile & desktop
 */
export const playNotificationChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First tone: E5 (659.25 Hz) - bright and clear
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone: B5 (987.77 Hz) - harmonic uplifting chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Audio context may be restricted by browser policy if no prior gesture
    console.debug('Audio chime skipped due to browser policy', e);
  }
};

/**
 * Vibrate device if supported (haptic feedback on mobile)
 */
export const vibrateDevice = (pattern: number[] = [80, 40, 80]) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Safely ignore
  }
};

/**
 * Dispatch a local browser notification
 */
export const dispatchBrowserNotification = (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
  }
) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body || 'Golden Bee Store • Suivi en direct',
      icon: options?.icon || '/favicon.ico',
      tag: options?.tag,
      data: options?.data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (e) {
    console.warn('Native notification dispatch error:', e);
    return false;
  }
};

/**
 * Human readable order status labels in French
 */
export const getOrderStatusDetails = (status: OrderStatus) => {
  switch (status) {
    case 'en_attente':
      return {
        label: 'En attente de paiement',
        description: 'Commande enregistrée, en attente de versement My Nita (97470831).',
        step: 1,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      };
    case 'en_attente_validation_admi':
      return {
        label: 'Vérification du paiement',
        description: 'Votre reçu My Nita / Amana Ta est en cours de contrôle par l\'administrateur.',
        step: 1.5,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      };
    case 'payee_nita':
    case 'fonds_bloques_sequestre':
      return {
        label: 'Paiement Confirmé (Trade Assurance)',
        description: 'Fonds sécurisés en séquestre. Le vendeur a été notifié pour préparer votre commande.',
        step: 2,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      };
    case 'en_preparation':
      return {
        label: 'En cours de préparation',
        description: 'Le vendeur rassemble et emballe vos articles avec soin.',
        step: 3,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
      };
    case 'en_livraison':
    case 'remis_client_attente_liberation':
      return {
        label: 'En cours de livraison',
        description: 'Le coursier est en route vers votre adresse ou le colis est prêt au point de retrait.',
        step: 4,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      };
    case 'livree':
    case 'fonds_liberes_vendeur':
      return {
        label: 'Commande Livrée avec Succès',
        description: 'Colis remis en main propre. Merci pour votre confiance envers Golden Bee Store !',
        step: 5,
        color: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/40',
      };
    case 'nouvelle_commande_whatsapp':
      return {
        label: 'Commande WhatsApp Directe',
        description: 'Commande transmise directement au vendeur.',
        step: 1,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      };
    case 'annulee':
      return {
        label: 'Commande Annulée',
        description: 'Cette commande a été annulée.',
        step: 0,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
      };
    default:
      return {
        label: status,
        description: 'Mise à jour du statut en temps réel.',
        step: 1,
        color: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
      };
  }
};
