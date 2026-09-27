import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { compressImageFile, formatBytes } from '../../utils/imageCompressor';
import { Shop } from '../../types';
import { NIGER_REGIONS } from '../../data/nigerLocations';
import { CountryCodeSelector } from '../CountryCodeSelector';
import {
  X,
  Store,
  Upload,
  Phone,
  CheckCircle2,
  Lock,
  MapPin,
  Sparkles,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

interface EditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
}

const CATEGORIES = [
  'Mode & Habillement',
  'Téléphones & High-Tech',
  'Beauté, Parfums & Soins',
  'Chaussures & Maroquinerie',
  'Maison & Électroménager',
  'Alimentation & Produits Locaux',
  'Bijoux & Accessoires',
  'Autre',
];

export const EditShopModal: React.FC<EditShopModalProps> = ({ isOpen, onClose, shop }) => {
  const { updateShopProfile, showToast, isDarkMode } = useStore();

  const [name, setName] = useState(shop.name);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [countryCode, setCountryCode] = useState(shop.countryCode || '+227');
  const [phone, setPhone] = useState(shop.phone);
  const [pinCode, setPinCode] = useState(shop.pinCode || '');
  const [category, setCategory] = useState(shop.category || CATEGORIES[0]);
  const [region, setRegion] = useState(shop.region || 'Agadez');
  const [city, setCity] = useState(shop.city || 'Agadez Ville (Centre)');
  const [neighborhood, setNeighborhood] = useState(shop.neighborhood || '');
  const [description, setDescription] = useState(shop.description || '');
  const [logoUrl, setLogoUrl] = useState(shop.logoUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(shop.name);
      setOwnerName(shop.ownerName);
      setCountryCode(shop.countryCode || '+227');
      setPhone(shop.phone);
      setPinCode(shop.pinCode || '');
      setCategory(shop.category || CATEGORIES[0]);
      setRegion(shop.region || 'Agadez');
      setCity(shop.city || 'Agadez Ville (Centre)');
      setNeighborhood(shop.neighborhood || '');
      setDescription(shop.description || '');
      setLogoUrl(shop.logoUrl || '');
    }
  }, [isOpen, shop]);

  const selectedRegionData = NIGER_REGIONS.find((r) => r.name === region) || NIGER_REGIONS[0];

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const regData = NIGER_REGIONS.find((r) => r.name === newRegion);
    if (regData && regData.cities.length > 0) {
      setCity(regData.cities[0]);
      if (regData.mainQuarters.length > 0) {
        setNeighborhood(regData.mainQuarters[0]);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Fichier trop lourd', 'error', 'Veuillez choisir une image de moins de 15 Mo.');
        return;
      }
      try {
        const compressed = await compressImageFile(file, { maxWidth: 400, quality: 0.8 });
        setLogoUrl(compressed.dataUrl);
        showToast('Logo compressé !', 'success', `Taille : ${formatBytes(compressed.compressedSize)}`);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoUrl(reader.result as string);
          showToast('Logo chargé !', 'success');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !phone.trim()) {
      showToast('Champs incomplets', 'error', 'Veuillez renseigner le nom, le gérant et le numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateShopProfile(shop.id, {
        name: name.trim(),
        ownerName: ownerName.trim(),
        countryCode,
        phone: phone.trim(),
        pinCode: pinCode.trim() || shop.pinCode,
        category,
        region,
        city,
        neighborhood: neighborhood.trim(),
        description: description.trim(),
        logoUrl: logoUrl.trim() || shop.logoUrl,
      });

      showToast('Boutique mise à jour !', 'success', 'Vos modifications ont été enregistrées en direct.');
      onClose();
    } catch (err) {
      console.error('Error updating shop:', err);
      showToast('Erreur', 'error', 'Impossible de mettre à jour la boutique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div
        className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border overflow-hidden z-10 max-h-[92dvh] flex flex-col ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-5 shrink-0 border-b border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
              🏪
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                Modifier ma Boutique
              </h3>
              <p className="text-xs text-amber-300 truncate max-w-[200px]">{shop.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 scrollbar-none space-y-4">
          {/* Logo & Visual */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 bg-white dark:bg-slate-900 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-dashed border-amber-500 flex items-center justify-center text-amber-500 text-2xl shrink-0">
                🏪
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Logo ou Photo de Profil
              </span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Changer l'image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Shop Name & Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom de la Boutique *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 outline-none font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom du Gérant / Propriétaire *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Contact Phone & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone WhatsApp (Niger) *
              </label>
              <div className="flex gap-1.5">
                <div className="w-[105px] shrink-0">
                  <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 outline-none font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Code PIN Secret (4 chiffres)
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Code PIN à 4 chiffres"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 outline-none font-mono tracking-widest font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catégorie Principale
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 outline-none font-medium text-slate-900 dark:text-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Localisation au Niger</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Région *
                </label>
                <select
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 outline-none font-bold text-slate-900 dark:text-white"
                >
                  {NIGER_REGIONS.map((reg) => (
                    <option key={reg.id} value={reg.name}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ville / Commune *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 outline-none font-medium text-slate-900 dark:text-white"
                >
                  {selectedRegionData.cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Autre commune / localité">Autre commune...</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quartier / Emplacement précis *
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Sabon Gari, Grand Marché, etc."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description de l'activité
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentez votre boutique, vos spécialités et vos conditions de livraison..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 outline-none resize-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
