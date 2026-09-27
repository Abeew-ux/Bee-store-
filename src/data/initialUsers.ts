import { AppUser } from '../types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-abdou-admin',
    fullName: 'Abdourahmen (Administrateur)',
    phone: '97470831',
    countryCode: '+227',
    city: 'Agadez',
    neighborhood: 'Centre / Grand Marché',
    password: 'Aa97470831',
    role: 'admin',
    cagnotteFCFA: 0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-sahel-fatima',
    fullName: 'Fatima Oumarou (Sahel Elegance)',
    phone: '90123456',
    countryCode: '+227',
    city: 'Agadez',
    neighborhood: 'Paysannat',
    password: '0000',
    role: 'vendor',
    cagnotteFCFA: 0,
    createdAt: '2026-02-14T08:30:00Z',
  },
];
