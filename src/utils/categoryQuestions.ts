export interface CategoryQuestion {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select';
  options?: string[];
  required?: boolean;
  hint?: string;
}

export function getCategoryQuestions(category: string): CategoryQuestion[] {
  const cat = (category || '').toLowerCase().trim();

  if (cat.includes('compte') && (cat.includes('jeu') || cat.includes('gaming'))) {
    return [
      {
        id: 'account_platform',
        label: 'Plateforme de liaison du compte *',
        type: 'select',
        options: ['Google / Gmail', 'Facebook', 'Activision', 'Apple ID', 'Twitter / X', 'Autre liaison'],
        required: true,
        hint: 'Type de connexion lié au compte de jeu',
      },
      {
        id: 'game_nickname',
        label: 'Pseudo / Nom souhaité (IGN)',
        placeholder: 'Ex: ShadowPro227, Bee_Sniper...',
        type: 'text',
        required: false,
        hint: 'Nom ou pseudo de joueur souhaité',
      },
      {
        id: 'whatsapp_delivery',
        label: 'Numéro WhatsApp pour envoi des accès *',
        placeholder: 'Ex: +227 90 12 34 56',
        type: 'text',
        required: true,
        hint: 'Les identifiants sécurisés seront transmis sur ce numéro',
      },
    ];
  }

  if (cat.includes('recharge') || cat.includes('jeton') || cat.includes('diamant') || cat.includes('uc')) {
    return [
      {
        id: 'game_player_id',
        label: 'ID Joueur / UID du Jeu *',
        placeholder: 'Ex: 2849104829 (Free Fire / PUBG / COD)',
        type: 'text',
        required: true,
        hint: 'Votre identifiant unique dans le jeu pour recevoir les jetons instantanément',
      },
      {
        id: 'game_nickname',
        label: 'Pseudo exact en jeu (IGN)',
        placeholder: 'Ex: KING_NIGER_99',
        type: 'text',
        required: false,
        hint: 'Permet de vérifier le profil avant chargement des diamants/UC',
      },
      {
        id: 'game_server',
        label: 'Serveur / Région du Jeu',
        type: 'select',
        options: ['Afrique / Moyen-Orient (MENA)', 'Europe', 'Global / Asie', 'Amérique du Nord'],
        required: true,
      },
    ];
  }

  if (cat.includes('abonnement') || cat.includes('digital') || cat.includes('carte')) {
    return [
      {
        id: 'sub_account_info',
        label: 'Numéro de décodeur / Email compte *',
        placeholder: 'Ex: Numéro carte Canal+ ou Email',
        type: 'text',
        required: true,
        hint: 'Identifiant du service à recharger',
      },
      {
        id: 'sub_duration',
        label: 'Formule / Durée souhaitée',
        type: 'select',
        options: ['1 Mois', '3 Mois', '6 Mois', '12 Mois'],
        required: true,
      },
    ];
  }

  if (cat.includes('téléphone') || cat.includes('tablette') || cat.includes('smartphone') || cat.includes('iphone')) {
    return [
      {
        id: 'storage_capacity',
        label: 'Capacité de stockage souhaitée',
        type: 'select',
        options: ['128 Go', '256 Go', '512 Go', '1 To'],
        required: false,
      },
      {
        id: 'item_color',
        label: 'Couleur préférée',
        placeholder: 'Ex: Noir Titane, Bleu Nuit, Blanc...',
        type: 'text',
        required: false,
      },
    ];
  }

  if (cat.includes('chaussure') || cat.includes('sneaker') || cat.includes('basket') || cat.includes('soulier')) {
    return [
      {
        id: 'shoe_size',
        label: 'Pointure exacte *',
        type: 'select',
        options: ['38', '39', '40', '41', '42', '43', '44', '45', '46'],
        required: true,
      },
      {
        id: 'item_color',
        label: 'Couleur souhaitée',
        placeholder: 'Ex: Noir / Blanc, Marron...',
        type: 'text',
        required: false,
      },
    ];
  }

  if (cat.includes('mode') || cat.includes('habillement') || cat.includes('vêtement') || cat.includes('bazin')) {
    return [
      {
        id: 'clothing_size',
        label: 'Taille du vêtement *',
        type: 'select',
        options: ['S (Taille 36-38)', 'M (Taille 40-42)', 'L (Taille 44-46)', 'XL (Taille 48-50)', 'XXL', 'Sur Mesure'],
        required: true,
      },
      {
        id: 'item_color',
        label: 'Couleur / Teinte',
        placeholder: 'Ex: Bleu Nuit, Blanc Éclatant...',
        type: 'text',
        required: false,
      },
    ];
  }

  if (cat.includes('chargeur') || cat.includes('câble') || cat.includes('accessoire')) {
    return [
      {
        id: 'connector_type',
        label: 'Type de connecteur / Embout *',
        type: 'select',
        options: ['Type-C (USB-C)', 'Lightning (iPhone)', 'Micro-USB standard', 'Double USB-C Power Delivery'],
        required: true,
      },
      {
        id: 'item_color',
        label: 'Couleur',
        placeholder: 'Ex: Noir, Blanc...',
        type: 'text',
        required: false,
      },
    ];
  }

  // Generic fallback
  return [];
}
