export interface CountryCode {
  country: string;
  code: string;
  flag: string;
  placeholder: string;
  region?: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  // Afrique de l'Ouest (CEDEAO / UEMOA)
  { country: 'Niger', code: '+227', flag: '🇳🇪', placeholder: '97 47 08 31', region: "Afrique de l'Ouest" },
  { country: 'Bénin', code: '+229', flag: '🇧🇯', placeholder: '97 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Burkina Faso', code: '+226', flag: '🇧🇫', placeholder: '70 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮', placeholder: '07 00 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Mali', code: '+223', flag: '🇲🇱', placeholder: '70 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Nigeria', code: '+234', flag: '🇳🇬', placeholder: '803 000 0000', region: "Afrique de l'Ouest" },
  { country: 'Sénégal', code: '+221', flag: '🇸🇳', placeholder: '77 000 00 00', region: "Afrique de l'Ouest" },
  { country: 'Togo', code: '+228', flag: '🇹🇬', placeholder: '90 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Guinée', code: '+224', flag: '🇬🇳', placeholder: '620 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Ghana', code: '+233', flag: '🇬🇭', placeholder: '24 000 0000', region: "Afrique de l'Ouest" },
  { country: 'Mauritanie', code: '+222', flag: '🇲🇷', placeholder: '45 00 00 00', region: "Afrique de l'Ouest" },
  { country: 'Gambie', code: '+220', flag: '🇬🇲', placeholder: '700 0000', region: "Afrique de l'Ouest" },
  { country: 'Guinée-Bissau', code: '+245', flag: '🇬🇼', placeholder: '955 00 00', region: "Afrique de l'Ouest" },
  { country: 'Liberia', code: '+231', flag: '🇱🇷', placeholder: '77 000 000', region: "Afrique de l'Ouest" },
  { country: 'Sierra Leone', code: '+232', flag: '🇸🇱', placeholder: '76 000 000', region: "Afrique de l'Ouest" },
  { country: 'Cap-Vert', code: '+238', flag: '🇨🇻', placeholder: '991 00 00', region: "Afrique de l'Ouest" },

  // Afrique Centrale (CEMAC)
  { country: 'Cameroun', code: '+237', flag: '🇨🇲', placeholder: '6 00 00 00 00', region: 'Afrique Centrale' },
  { country: 'Tchad', code: '+235', flag: '🇹🇩', placeholder: '66 00 00 00', region: 'Afrique Centrale' },
  { country: 'Gabon', code: '+241', flag: '🇬🇦', placeholder: '07 00 00 00', region: 'Afrique Centrale' },
  { country: 'Congo', code: '+242', flag: '🇨🇬', placeholder: '06 000 0000', region: 'Afrique Centrale' },
  { country: 'RDC (Congo)', code: '+243', flag: '🇨🇩', placeholder: '81 000 0000', region: 'Afrique Centrale' },
  { country: 'Centrafrique', code: '+236', flag: '🇨🇫', placeholder: '70 00 00 00', region: 'Afrique Centrale' },
  { country: 'Guinée Équatoriale', code: '+240', flag: '🇬🇶', placeholder: '222 00 00 00', region: 'Afrique Centrale' },
  { country: 'Sao Tomé-et-Principe', code: '+239', flag: '🇸🇹', placeholder: '990 00 00', region: 'Afrique Centrale' },
  { country: 'Angola', code: '+244', flag: '🇦🇴', placeholder: '923 000 000', region: 'Afrique Centrale' },

  // Afrique du Nord (Maghreb / Machrek)
  { country: 'Algérie', code: '+213', flag: '🇩🇿', placeholder: '5 00 00 00 00', region: 'Afrique du Nord' },
  { country: 'Maroc', code: '+212', flag: '🇲🇦', placeholder: '6 00 00 00 00', region: 'Afrique du Nord' },
  { country: 'Tunisie', code: '+216', flag: '🇹🇳', placeholder: '20 000 000', region: 'Afrique du Nord' },
  { country: 'Égypte', code: '+20', flag: '🇪🇬', placeholder: '100 000 0000', region: 'Afrique du Nord' },
  { country: 'Libye', code: '+218', flag: '🇱🇾', placeholder: '91 000 0000', region: 'Afrique du Nord' },
  { country: 'Soudan', code: '+249', flag: '🇸🇩', placeholder: '91 000 0000', region: 'Afrique du Nord' },

  // Afrique de l'Est
  { country: 'Éthiopie', code: '+251', flag: '🇪🇹', placeholder: '91 000 0000', region: "Afrique de l'Est" },
  { country: 'Kenya', code: '+254', flag: '🇰🇪', placeholder: '712 345 678', region: "Afrique de l'Est" },
  { country: 'Tanzanie', code: '+255', flag: '🇹🇿', placeholder: '712 345 678', region: "Afrique de l'Est" },
  { country: 'Ouganda', code: '+256', flag: '🇺🇬', placeholder: '712 345 678', region: "Afrique de l'Est" },
  { country: 'Rwanda', code: '+250', flag: '🇷🇼', placeholder: '788 000 000', region: "Afrique de l'Est" },
  { country: 'Burundi', code: '+257', flag: '🇧🇮', placeholder: '79 000 000', region: "Afrique de l'Est" },
  { country: 'Soudan du Sud', code: '+211', flag: '🇸🇸', placeholder: '912 000 000', region: "Afrique de l'Est" },
  { country: 'Djibouti', code: '+253', flag: '🇩🇯', placeholder: '77 00 00 00', region: "Afrique de l'Est" },
  { country: 'Somalie', code: '+252', flag: '🇸🇴', placeholder: '61 000 0000', region: "Afrique de l'Est" },
  { country: 'Érythrée', code: '+291', flag: '🇪🇷', placeholder: '7 000 000', region: "Afrique de l'Est" },
  { country: 'Madagascar', code: '+261', flag: '🇲🇬', placeholder: '32 00 000 00', region: "Afrique de l'Est" },
  { country: 'Maurice', code: '+230', flag: '🇲🇺', placeholder: '5250 0000', region: "Afrique de l'Est" },
  { country: 'Comores', code: '+269', flag: '🇰🇲', placeholder: '320 00 00', region: "Afrique de l'Est" },
  { country: 'Seychelles', code: '+248', flag: '🇸🇨', placeholder: '2 500 000', region: "Afrique de l'Est" },

  // Afrique Australe
  { country: 'Afrique du Sud', code: '+27', flag: '🇿🇦', placeholder: '71 000 0000', region: 'Afrique Australe' },
  { country: 'Zambie', code: '+260', flag: '🇿🇲', placeholder: '97 000 0000', region: 'Afrique Australe' },
  { country: 'Zimbabwe', code: '+263', flag: '🇿🇼', placeholder: '77 000 0000', region: 'Afrique Australe' },
  { country: 'Mozambique', code: '+258', flag: '🇲🇿', placeholder: '84 000 0000', region: 'Afrique Australe' },
  { country: 'Namibie', code: '+264', flag: '🇳🇦', placeholder: '81 000 0000', region: 'Afrique Australe' },
  { country: 'Botswana', code: '+267', flag: '🇧🇼', placeholder: '71 000 000', region: 'Afrique Australe' },
  { country: 'Malawi', code: '+265', flag: '🇲🇼', placeholder: '99 000 0000', region: 'Afrique Australe' },
  { country: 'Lesotho', code: '+266', flag: '🇱🇸', placeholder: '5800 0000', region: 'Afrique Australe' },
  { country: 'Eswatini', code: '+268', flag: '🇸🇿', placeholder: '7600 0000', region: 'Afrique Australe' },

  // Diaspora & Partenaires Internationaux
  { country: 'France', code: '+33', flag: '🇫🇷', placeholder: '6 00 00 00 00', region: 'International' },
  { country: 'Belgique', code: '+32', flag: '🇧🇪', placeholder: '470 00 00 00', region: 'International' },
  { country: 'Suisse', code: '+41', flag: '🇨🇭', placeholder: '79 000 00 00', region: 'International' },
  { country: 'Canada', code: '+1', flag: '🇨🇦', placeholder: '555 0100', region: 'International' },
  { country: 'États-Unis', code: '+1', flag: '🇺🇸', placeholder: '555 0100', region: 'International' },
  { country: 'Arabie Saoudite', code: '+966', flag: '🇸🇦', placeholder: '50 000 0000', region: 'International' },
  { country: 'Émirats Arabes Unis', code: '+971', flag: '🇦🇪', placeholder: '50 000 0000', region: 'International' },
  { country: 'Chine', code: '+86', flag: '🇨🇳', placeholder: '138 0000 0000', region: 'International' },
  { country: 'Turquie', code: '+90', flag: '🇹🇷', placeholder: '500 000 0000', region: 'International' },
  { country: 'Royaume-Uni', code: '+44', flag: '🇬🇧', placeholder: '7911 123456', region: 'International' },
  { country: 'Allemagne', code: '+49', flag: '🇩🇪', placeholder: '151 2345678', region: 'International' },
  { country: 'Italie', code: '+39', flag: '🇮🇹', placeholder: '320 1234567', region: 'International' },
  { country: 'Espagne', code: '+34', flag: '🇪🇸', placeholder: '612 345 678', region: 'International' },
];

/**
 * Format a phone number to standard international WhatsApp clean number
 * Default to +227 if no country code is detected.
 */
export function formatToWhatsAppNumber(phone: string, defaultCode = '+227'): string {
  if (!phone) return '22797470831';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned.replace('+', '');
  }
  if (cleaned.startsWith('00')) {
    return cleaned.slice(2);
  }
  // If already starts with 227 and length >= 10
  if (cleaned.startsWith('227') && cleaned.length >= 11) {
    return cleaned;
  }
  // If standard 8-digit Niger number
  if (cleaned.length === 8) {
    const prefix = defaultCode.replace('+', '');
    return `${prefix}${cleaned}`;
  }
  return cleaned;
}
