import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BeePushingCart } from '../BeePushingCart';
import { POPULAR_CITIES } from '../../data/initialProducts';
import { CountryCodeSelector } from '../CountryCodeSelector';
import { COUNTRY_CODES } from '../../data/countryCodes';
import {
  Phone,
  Lock,
  User,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    registerUser,
    isDarkMode,
  } = useStore();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+227');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Agadez');
  const [customCity, setCustomCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  // If user is already logged in and modal is not explicitly open, don't show
  if (currentUser && !isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const identifier = phone.trim();
    if (!identifier) {
      setErrorMessage('Veuillez entrer votre numéro de téléphone ou e-mail.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Veuillez entrer votre mot de passe ou code secret.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!fullName.trim()) {
      setErrorMessage('Veuillez renseigner votre nom complet.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      setErrorMessage('Le mot de passe doit comporter au moins 4 caractères ou chiffres.');
      return;
    }

    const finalCity =
      city === 'Autre Ville / Hors Niger' ? (customCity.trim() || currentCountry.country) : city;

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        fullName,
        phone: cleanPhone,
        countryCode,
        city: finalCity,
        neighborhood,
        password,
      });
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`relative w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden z-10 flex flex-col my-auto ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-5 sm:p-6 text-center border-b border-slate-800">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 inline-block shadow-inner">
              <BeePushingCart size="md" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-black text-white">Golden Bee Store</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                  Accès Requis
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {authModalMode === 'login'
                  ? 'Connectez-vous avec votre numéro et mot de passe'
                  : 'Créez votre compte pour accéder à la marketplace'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className={`grid grid-cols-2 p-1.5 border-b ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authModalMode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Se Connecter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authModalMode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Créer un Compte</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75dvh] overflow-y-auto scrollbar-none">
          {/* Error Message banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authModalMode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    Numéro de Téléphone
                  </label>
                  <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {currentCountry.country}
                  </span>
                </div>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    selectedCode={countryCode}
                    onChange={(code) => setCountryCode(code)}
                    isDarkMode={isDarkMode}
                  />
                  <input
                    type="tel"
                    placeholder={`Ex: ${currentCountry.placeholder}`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                    className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Mot de Passe / Code Secret
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <span>Se Connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500">Pas encore de compte ? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  Créer un compte maintenant
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="Ex: Moussa Abdou"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    Numéro de Téléphone (WhatsApp / Appel)
                  </label>
                  <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {currentCountry.country}
                  </span>
                </div>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    selectedCode={countryCode}
                    onChange={(code) => setCountryCode(code)}
                    isDarkMode={isDarkMode}
                  />
                  <input
                    type="tel"
                    placeholder={`Ex: ${currentCountry.placeholder}`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    Ville / Pays
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Autre Ville / Hors Niger">Autre Ville / Hors Niger</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">
                    {city === 'Autre Ville / Hors Niger' ? 'Préciser Ville & Pays' : 'Quartier (Optionnel)'}
                  </label>
                  {city === 'Autre Ville / Hors Niger' ? (
                    <input
                      type="text"
                      placeholder={`Ex: Cotonou, Abidjan, Paris...`}
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      required
                      className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Ex: Sabon Gari"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Créer un Mot de Passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Au moins 4 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Création du compte...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Créer Mon Compte</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500">Vous avez déjà un compte ? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}

          {/* Trust badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sécurisé • 100% Niger • My Nita & Amana</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
