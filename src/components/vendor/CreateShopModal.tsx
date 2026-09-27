import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { compressImageFile, formatBytes } from '../../utils/imageCompressor';
import { NIGER_REGIONS, REGION_NAMES } from '../../data/nigerLocations';
import { CountryCodeSelector } from '../CountryCodeSelector';
import { COUNTRY_CODES } from '../../data/countryCodes';
import {
  X,
  Store,
  Upload,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  FileImage,
  Sparkles,
  Info,
  Lock,
  MapPin,
  Compass,
  Globe,
  Gift,
  MessageCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SHOP_MONTHLY_FEE, REFERRAL_BONUS_PER_SHOP } from '../../types';

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

const DEFAULT_SAMPLE_RECEIPTS = [
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
];

export const CreateShopModal: React.FC = () => {
  const {
    isCreateShopModalOpen,
    setIsCreateShopModalOpen,
    initialReferralCode,
    requestShopCreation,
    showToast,
  } = useStore();

  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [countryCode, setCountryCode] = useState('+227');
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Synchronize initial referral code whenever modal opens
  React.useEffect(() => {
    if (isCreateShopModalOpen && initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [isCreateShopModalOpen, initialReferralCode]);
  
  // Location State (Default: Agadez)
  const [region, setRegion] = useState('Agadez');
  const selectedRegionData = NIGER_REGIONS.find((r) => r.name === region) || NIGER_REGIONS[0];
  const [city, setCity] = useState(selectedRegionData.cities[0] || 'Agadez Ville (Centre)');
  const [neighborhood, setNeighborhood] = useState('Sabon Gari');
  
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [paymentProofImage, setPaymentProofImage] = useState(DEFAULT_SAMPLE_RECEIPTS[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(!!initialReferralCode);

  // Handle region change to update city options
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

  if (!isCreateShopModalOpen) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('97470831');
    setCopiedAccount(true);
    showToast('Numéro copié !', 'info', 'Compte 97470831 copié dans le presse-papier.');
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Fichier trop lourd', 'error', 'Veuillez choisir une image de moins de 15 Mo.');
        return;
      }
      try {
        const compressed = await compressImageFile(file, { maxWidth: 900, quality: 0.72 });
        setPaymentProofImage(compressed.dataUrl);
        showToast(
          'Capture optimisée !',
          'success',
          `Preuve compressée : ${formatBytes(compressed.compressedSize)} (-${compressed.ratio}%)`
        );
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofImage(reader.result as string);
          showToast('Capture chargée !', 'success', 'Preuve de paiement prête.');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, { maxWidth: 400, quality: 0.8 });
        setLogoUrl(compressed.dataUrl);
        showToast('Logo optimisé !', 'success', `Taille : ${formatBytes(compressed.compressedSize)}`);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !phone.trim() || !pinCode.trim()) {
      showToast('Champs incomplets', 'error', 'Veuillez remplir toutes les informations requises.');
      return;
    }
    if (!region.trim()) {
      showToast('Région requise', 'error', 'Veuillez sélectionner la région de votre boutique.');
      return;
    }
    if (pinCode.length < 4) {
      showToast('Code PIN invalide', 'error', 'Le code PIN doit comporter au moins 4 chiffres.');
      return;
    }
    setStep('payment');
  };

  const handleSubmitShopRequest = async () => {
    if (!paymentProofImage) {
      showToast('Capture requise', 'error', `Veuillez joindre la capture de votre paiement de ${SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const shopPayload: any = {
        name: shopName.trim(),
        ownerName: ownerName.trim(),
        countryCode: countryCode || '+227',
        phone: phone.trim(),
        pinCode: pinCode.trim(),
        category,
        region,
        city,
        description: description.trim() || `Boutique officielle ${shopName} - Région ${region}`,
        logoUrl:
          logoUrl ||
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
        paymentProofImage,
        transactionRef: transactionRef.trim() || `NIT-${Date.now().toString().slice(-6)}`,
      };

      if (neighborhood.trim()) {
        shopPayload.neighborhood = neighborhood.trim();
      }
      if (referralCode.trim()) {
        shopPayload.referredBy = referralCode.trim().toUpperCase();
      }

      await requestShopCreation(shopPayload);

      setStep('success');
    } catch (err) {
      console.error(err);
      showToast('Erreur', 'error', 'Impossible de soumettre la demande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCreateShopModalOpen(false);
    setTimeout(() => {
      setStep('info');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-5 shrink-0 border-b border-amber-900/30">
          <div className="w-12 h-1 bg-white/30 rounded-full mx-auto -mt-1 mb-2.5 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                🏪
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                    Ouvrir ma Boutique <span className="text-amber-400">Golden Bee</span>
                  </h3>
                </div>
                <p className="text-xs text-amber-200">
                  Abonnement : <strong className="text-white font-bold">{SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA / mois</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Step Progress Indicator */}
        {step !== 'success' && (
          <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
            <div className={`flex items-center gap-2 font-bold ${step === 'info' ? 'text-amber-400' : 'text-emerald-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step === 'info' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
              }`}>
                {step === 'info' ? '1' : '✓'}
              </span>
              <span>1. Informations Boutique</span>
            </div>

            <div className="h-[2px] w-12 bg-slate-800 rounded-full mx-2 overflow-hidden">
              <div className={`h-full bg-amber-500 transition-all ${step === 'payment' ? 'w-full' : 'w-1/2'}`} />
            </div>

            <div className={`flex items-center gap-2 font-bold ${step === 'payment' ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step === 'payment' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                2
              </span>
              <span>2. Paiement & Activation</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 scrollbar-none space-y-4">
          {/* STEP 1: Shop Information */}
          {step === 'info' && (
            <form onSubmit={handleProceedToPayment} className="space-y-3.5">
              {/* Quick helper banner */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="leading-snug">
                  Créez votre boutique en <strong>1 minute</strong>. Vous pourrez ajouter vos articles immédiatement après activation.
                </p>
              </div>

              {/* CARD 1: Shop Identity & Location */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>Votre Boutique</span>
                </div>

                {/* Shop Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nom de la Boutique *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sahel Mode Express, Tech Niamey..."
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-semibold text-slate-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Catégorie Principale *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none cursor-pointer font-medium text-slate-800"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location: Region, City & Neighborhood (Niger) */}
                <div className="pt-1 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Emplacement (Niger) *</span>
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      8 Régions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Région *
                      </label>
                      <select
                        value={region}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-bold text-slate-900"
                      >
                        {NIGER_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.name}>
                            {reg.name} {reg.isUserHome ? '📍 (Prioritaire)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ville / Commune *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-medium text-slate-800"
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Quartier ou Rue *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sabon Gari, Grand Marché, Misrata..."
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: Manager & Access Credentials */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Responsable & Sécurité</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nom du Propriétaire / Gérant *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ibrahim Moussa"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Numéro WhatsApp *</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Indicatif
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <CountryCodeSelector
                        selectedCode={countryCode}
                        onChange={(code) => setCountryCode(code)}
                      />
                      <input
                        type="tel"
                        required
                        placeholder={`Ex: ${(COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]).placeholder}`}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* PIN Code with quick show/hide toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Code PIN Secret (4 chiffres minimum) *</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                    >
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPin ? 'Masquer' : 'Afficher'}</span>
                    </button>
                  </label>
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    required
                    placeholder="Ex: 1234"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono tracking-widest font-black text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ce code vous permettra de vous connecter à votre espace boutique sur Bee Store.
                  </p>
                </div>
              </div>

              {/* CARD 3: Optional Settings (Referral Code, Logo & Description) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Options facultatives (Parrainage, Logo, Description)</span>
                    {referralCode && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  {showAdvancedOptions ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showAdvancedOptions && (
                  <div className="p-3.5 space-y-3 border-t border-slate-200 bg-white">
                    {/* Referral Code input */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-600" />
                          <span>Code Parrainage (Optionnel)</span>
                        </label>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          +{REFERRAL_BONUS_PER_SHOP} F au parrain
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Ex: BEE-9747..."
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:border-amber-500 outline-none uppercase font-mono font-bold tracking-wider text-amber-950"
                      />
                      {referralCode && (
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Code appliqué : <strong>{referralCode}</strong> (prime de 500 F à l'activation).</span>
                        </p>
                      )}
                    </div>

                    {/* Logo & Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Logo / Photo d'Enseigne
                        </label>
                        <div className="flex items-center gap-2.5">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm shrink-0">
                              🏪
                            </div>
                          )}
                          <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choisir image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Description courte
                        </label>
                        <input
                          type="text"
                          placeholder={`Ex: Vente certifiée à ${city}`}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit to Next Step */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continuer vers le Paiement ({SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA)</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Instructions & Screenshot Proof Upload */}
          {step === 'payment' && (
            <div className="space-y-3.5">
              {/* Official Payment Destination Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> Frais d'Abonnement
                  </span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    1 Mois d'accès
                  </span>
                </div>

                <div className="text-center py-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-0.5">
                  <span className="text-[11px] text-slate-300">Montant exact à transférer :</span>
                  <div className="text-3xl font-black text-amber-400 font-mono">
                    {SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} <span className="text-sm text-white">FCFA</span>
                  </div>
                </div>

                {/* Account Number with 1-click Copy */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-medium">
                    Numéro de compte Golden Bee Store :
                  </span>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-amber-500/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        NITA
                      </div>
                      <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
                        97470831
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        copiedAccount
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      }`}
                    >
                      {copiedAccount ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier le 97470831</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Transfert accepté par <strong>My Nita</strong>, <strong>Amana Ta</strong>, <strong>Al Izza</strong> ou <strong>Airtel Money</strong> vers le <strong>97470831</strong>.
                  </p>
                </div>
              </div>

              {/* Upload Screenshot Proof Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Capture d'écran du Reçu de Paiement *
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Requis pour validation
                  </span>
                </div>

                {/* Upload Box */}
                <div className="border-2 border-dashed border-amber-400/80 bg-white rounded-xl p-3 text-center space-y-2.5">
                  {paymentProofImage ? (
                    <div className="space-y-2">
                      <div className="relative inline-block max-w-full">
                        <img
                          src={paymentProofImage}
                          alt="Capture Reçu"
                          className="max-h-36 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain bg-white"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Reçu prêt
                        </span>
                      </div>
                      <div>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Changer la photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-3 space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                        <FileImage className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Cliquez pour ajouter la capture d'écran
                        </span>
                        <span className="text-[10px] text-slate-400">
                          JPG, PNG (Max 5 Mo)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Quick 1-tap example receipts for frictionless test */}
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Reçu d'exemple :</span>
                  {DEFAULT_SAMPLE_RECEIPTS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPaymentProofImage(url);
                        showToast('Reçu d\'exemple sélectionné', 'info');
                      }}
                      className="text-[11px] text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg font-bold transition-colors"
                    >
                      Exemple #{idx + 1}
                    </button>
                  ))}
                </div>

                {/* Optional Transaction Ref */}
                <div className="pt-1 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Référence SMS / Transaction (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: NIT-88920194..."
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  ← Modifier
                </button>

                <button
                  type="button"
                  onClick={handleSubmitShopRequest}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider & Envoyer ma Demande</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'success' && (
            <div className="text-center py-5 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  Demande Transmise avec Succès !
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Votre demande pour la boutique <strong>{shopName}</strong> avec la capture de <strong>{SHOP_MONTHLY_FEE.toLocaleString('fr-FR')} FCFA</strong> a été reçue par l'administrateur.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Boutique :</span>
                  <span className="font-bold text-slate-900">{shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gérant :</span>
                  <span className="font-semibold text-slate-800">{ownerName} ({countryCode} {phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Localisation :</span>
                  <span className="font-semibold text-slate-800">
                    {city}, {region} ({neighborhood})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paiement :</span>
                  <span className="font-mono font-bold text-amber-700">1 500 FCFA (au 97470831)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut :</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    En attente de validation
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const waMsg = encodeURIComponent(
                      `Bonjour Abdourahmen, je viens de soumettre ma demande de création de boutique sur Golden Bee Store.\n🏪 Boutique : ${shopName}\n👤 Gérant : ${ownerName} (${countryCode} ${phone})\n📍 Ville : ${city} (${region})\n💰 Frais : ${SHOP_MONTHLY_FEE} FCFA payés sur le 97470831.\nMerci de valider et d'activer ma boutique !`
                    );
                    window.open(`https://wa.me/22797470831?text=${waMsg}`, '_blank');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Aviser Abdourahmen sur WhatsApp (97470831)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

