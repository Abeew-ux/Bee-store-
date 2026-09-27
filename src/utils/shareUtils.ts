import { Product, Shop, Order } from '../types';
import { formatToWhatsAppNumber } from '../data/countryCodes';

function getBaseAppUrl(): string {
  try {
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}${window.location.pathname}`;
    }
  } catch {}
  return 'https://bee-store.ne/';
}

export function getProductShareUrl(productId: string): string {
  const base = getBaseAppUrl();
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}product=${encodeURIComponent(productId)}`;
}

export function getShopShareUrl(shopId: string): string {
  const base = getBaseAppUrl();
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}shop=${encodeURIComponent(shopId)}`;
}

export function getShopReferralUrl(referralCode: string): string {
  const base = getBaseAppUrl();
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}ref=${encodeURIComponent(referralCode)}`;
}

export function getAdminReferralAlertWhatsAppUrl({
  adminPhone = '97470831',
  sponsorName,
  sponsorPhone,
  sponsorShopName,
  sponsorCode,
  newShopName,
  newOwnerName,
  newShopPhone,
  city,
  region,
  transactionRef,
}: {
  adminPhone?: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorShopName?: string;
  sponsorCode: string;
  newShopName: string;
  newOwnerName: string;
  newShopPhone: string;
  city: string;
  region: string;
  transactionRef?: string;
}): string {
  const cleanAdmin = formatToWhatsAppNumber(adminPhone, '+227');
  const message =
    `🐝 *ALERTE NOUVEAU PARRAINAGE GOLDEN BEE STORE* 🎁\n\n` +
    `Bonjour Abdourahmen, une nouvelle boutique vient d'être créée via un lien de parrainage !\n\n` +
    `👤 *PARRAIN (A partagé le lien) :*\n` +
    `• Nom : *${sponsorName}*\n` +
    `• Téléphone : *${sponsorPhone}*\n` +
    `${sponsorShopName ? `• Boutique : *${sponsorShopName}*\n` : ''}` +
    `• Code utilisé : *${sponsorCode}*\n\n` +
    `🏪 *FILLEUL (A créé la boutique) :*\n` +
    `• Boutique : *${newShopName}*\n` +
    `• Gérant : *${newOwnerName}*\n` +
    `• Téléphone : *${newShopPhone}*\n` +
    `• Localisation : *${city}* (${region})\n` +
    `• Frais d'ouverture : *1 500 FCFA* envoyés au 97470831\n` +
    `• Réf paiement : *${transactionRef || 'En attente'}*\n\n` +
    `💰 *Gains Parrain :* +500 FCFA crédités dans sa cagnotte\n\n` +
    `Lien Admin : Connectez-vous à l'espace Admin pour valider la boutique !`;

  return `https://wa.me/${cleanAdmin}?text=${encodeURIComponent(message)}`;
}

export function getClaimReferralEarningsWhatsAppUrl({
  adminPhone = '97470831',
  sponsorName,
  sponsorPhone,
  sponsorCode,
  referralsCount = 0,
  totalEarnings = 0,
}: {
  adminPhone?: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorCode: string;
  referralsCount?: number;
  totalEarnings: number;
}): string {
  const cleanAdmin = formatToWhatsAppNumber(adminPhone, '+227');
  const message =
    `🐝 *RÉCLAMATION DES GAINS DE PARRAINAGE - BEE STORE* 💰\n\n` +
    `Bonjour Admin Bee Store ! Je souhaite réclamer et retirer mes gains de parrainage.\n\n` +
    `👤 *Informations du Parrain :*\n` +
    `• Nom complet : *${sponsorName || 'Parrain Bee Store'}*\n` +
    `• Mon Numéro : *${sponsorPhone}*\n` +
    `• Mon Code Parrain : *${sponsorCode}*\n` +
    `• Nombre de filleuls parrainés : *${referralsCount}*\n\n` +
    `💵 *Montant total des gains à réclamer :* *${totalEarnings.toLocaleString('fr-FR')} FCFA*\n\n` +
    `📲 Merci de m'effectuer le versement via My Nita / Transfert au numéro : *${sponsorPhone}*.\n\n` +
    `Je reste à votre disposition. Merci !`;

  return `https://wa.me/${cleanAdmin}?text=${encodeURIComponent(message)}`;
}

export function getReferralWhatsAppUrl({
  referralCode,
  shopName,
}: {
  referralCode: string;
  shopName?: string;
}): string {
  const shareUrl = getShopReferralUrl(referralCode);
  const text = `🐝 *Invitation Exclusive Bee Store*\n\nBonjour ! Je vous invite à ouvrir votre propre boutique en ligne sur *Bee Store* (seulement 1 500 FCFA/mois) et vendre vos articles directement sur WhatsApp !\n\n🎁 Utilisez mon code de parrainage : *${referralCode}*\n👉 Lien direct : ${shareUrl}\n\nRejoignez les commerçants et commencez à vendre dès aujourd'hui !`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getOrderWhatsAppUrl({
  order,
  vendorPhone,
  vendorCountryCode = '+227',
  shopName,
}: {
  order: Order;
  vendorPhone: string;
  vendorCountryCode?: string;
  shopName?: string;
}): string {
  const cleanPhone = formatToWhatsAppNumber(vendorPhone, vendorCountryCode);
  const itemsText = order.items
    .map(
      (it, idx) => {
        const itemUrl = getProductShareUrl(it.product.id);
        const options = [
          it.selectedSize ? `Taille / Pointure : ${it.selectedSize}` : '',
          it.selectedColor ? `Couleur : ${it.selectedColor}` : '',
        ]
          .filter(Boolean)
          .join(' | ');

        // Specific category answers formatting
        let customAnswersText = '';
        if (it.customAnswers && Object.keys(it.customAnswers).length > 0) {
          const formattedAnswers = Object.entries(it.customAnswers)
            .map(([k, v]) => `   • 📝 *${k}* : ${v}`)
            .join('\n');
          customAnswersText = `\n${formattedAnswers}`;
        }

        return `${idx + 1}. 🛍️ *${it.product.name}*\n   • Catégorie : *${it.product.category}*\n   • Quantité : *${it.quantity}*\n   • Prix : *${(it.product.price * it.quantity).toLocaleString('fr-FR')} FCFA*${options ? `\n   • Variantes : ${options}` : ''}${customAnswersText}\n   🔗 *Lien produit :* ${itemUrl}`;
      }
    )
    .join('\n\n');

  const deliveryType =
    order.deliveryMethod.id === 'pickup_shop'
      ? '🏬 *Retrait au comptoir en Boutique* (0 FCFA)'
      : `🚚 *Livraison à domicile* (${order.deliveryCost.toLocaleString('fr-FR')} FCFA)`;

  const locationText =
    order.deliveryMethod.id === 'pickup_shop'
      ? `Retrait sur place en boutique`
      : `${order.customer.region ? `Région : ${order.customer.region}\n` : ''}Ville : ${order.customer.city}\nQuartier : ${order.customer.neighborhood}\nAdresse / Repère : ${order.customer.addressDetails || 'À convenir'}`;

  const paymentLabels: Record<string, string> = {
    my_nita: '📲 My Nita (Paiement officiel)',
    my_nita_direct: '📲 My Nita',
    amana_ta: '💳 Amana Ta (Transfert express)',
    airtel_money: '📱 Airtel Money',
    airtel_money_direct: '📱 Airtel Money',
    al_izza: '🏛️ Al Izza Transfert',
    al_izza_direct: '🏛️ Al Izza Transfert',
    cash_delivery: '💵 Espèces (Paiement à la livraison / retrait)',
    cash_at_delivery: '💵 Espèces à la livraison',
    whatsapp_direct: '💬 À convenir sur WhatsApp',
  };

  const paymentText = paymentLabels[order.paymentMethod] || '📲 My Nita / Amana Ta / Espèces';

  const message = `🐝 *NOUVELLE COMMANDE BEE STORE* 📦\n\nBonjour *${shopName || 'Boutique'}*, je souhaite finaliser ma commande sur Bee Store :\n\n*N° Commande :* ${order.orderNumber}\n*Client :* ${order.customer.fullName}\n*Téléphone WhatsApp :* ${order.customer.phone}\n\n📋 *Article(s) commandé(s) :*\n${itemsText}\n\n*Mode de réception :* ${deliveryType}\n📍 *Localisation :*\n${locationText}\n\n💳 *Mode de règlement souhaité :* ${paymentText}\n💰 *Total à régler :* *${order.total.toLocaleString('fr-FR')} FCFA*\n\nJe suis disponible pour convenir des détails avec vous. Merci !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getVendorWhatsAppUrl({
  phone,
  countryCode = '+227',
  product,
  shopName,
  orderNumber,
  totalAmount,
  customText,
}: {
  phone: string;
  countryCode?: string;
  product?: Product;
  shopName?: string;
  orderNumber?: string;
  totalAmount?: number;
  customText?: string;
}): string {
  const cleanPhone = formatToWhatsAppNumber(phone, countryCode);

  let message = '';
  if (customText) {
    message = customText;
  } else if (orderNumber) {
    message = `📦 *Nouvelle commande Golden Bee Store*\nBonjour, j'ai passé la commande N° *${orderNumber}* (${totalAmount ? `${totalAmount.toLocaleString('fr-FR')} FCFA` : ''}) sur votre boutique *${shopName || 'Golden Bee Store'}*. Pouvez-vous confirmer la préparation ?`;
  } else if (product) {
    message = `🐝 *Golden Bee Store*\nBonjour, je vous contacte à propos de votre article : *${product.name}* (Prix: ${product.price.toLocaleString('fr-FR')} FCFA).\nEst-il disponible en stock ?\nLien: ${getProductShareUrl(product.id)}`;
  } else if (shopName) {
    message = `🐝 *Golden Bee Store*\nBonjour, j'ai vu votre boutique *${shopName}* sur Golden Bee Store et je souhaite avoir plus de renseignements.`;
  } else {
    message = `🐝 *Golden Bee Store*\nBonjour, je vous contacte depuis la plateforme Golden Bee Store.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

