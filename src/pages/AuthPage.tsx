import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ArrowRight, ShieldCheck, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface AuthPageProps {
  mode?: 'login' | 'register';
  navigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login', navigate }) => {
  const { login, register, showToast } = useStore();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute simple password strength for registration
  const passwordStrength = React.useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLogin) {
      if (!email.trim()) {
        showToast('Veuillez renseigner votre email', 'error');
        return;
      }
      if (!password) {
        showToast('Veuillez renseigner votre mot de passe', 'error');
        return;
      }

      const res = login(email, password);
      if (res.success) {
        if (email.toLowerCase().includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      } else {
        setErrorMessage(res.message || 'Identifiants invalides');
      }
    } else {
      if (!firstName || !lastName || !email || !phone) {
        showToast('Veuillez remplir toutes les informations requises', 'error');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
        return;
      }
      register({ firstName, lastName, email, phone, password });
      navigate('/account');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-[#121216] border border-[#2B2B38] p-8 rounded-sm shadow-2xl space-y-6">
        <div className="text-center">
          <BrandLogo size="md" withTagline />
          <h2 className="text-xl font-serif text-[#F5F1EB] mt-3">
            {isLogin ? 'Connexion Espace Privilège' : 'Créer Votre Compte'}
          </h2>
          <p className="text-xs text-[#A7A3A0] mt-1">
            {isLogin
              ? 'Accédez à votre historique de commande et votre carnet d’adresses'
              : 'Rejoignez le cercle d’initiés Metanoïa Parfums'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-sm text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sophia"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alami"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
              Adresse Email
            </label>
            <input
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                Téléphone (Maroc)
              </label>
              <input
                type="tel"
                required
                placeholder="06 XX XX XX XX ou +212 6 XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0]">
                Mot de passe
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(true)}
                  className="text-[11px] text-[#D8B08C] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 pr-9 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A7A3A0] hover:text-[#F5F1EB]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password strength indicator for register */}
            {!isLogin && password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  <div
                    className={`flex-1 rounded-full transition-colors ${
                      passwordStrength >= 1 ? 'bg-rose-500' : 'bg-[#22222A]'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full transition-colors ${
                      passwordStrength >= 2 ? 'bg-amber-500' : 'bg-[#22222A]'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full transition-colors ${
                      passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-[#22222A]'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full transition-colors ${
                      passwordStrength >= 4 ? 'bg-emerald-400' : 'bg-[#22222A]'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-[#A7A3A0] block">
                  {passwordStrength < 2
                    ? 'Mot de passe faible (8+ caractères, majuscule, chiffre recommandés)'
                    : passwordStrength < 4
                    ? 'Mot de passe sécurisé'
                    : 'Mot de passe hautement sécurisé'}
                </span>
              </div>
            )}
          </div>

          {forgotPasswordNotice && (
            <div className="p-3 bg-[#181822] border border-[#D8B08C]/30 rounded-sm text-[11px] text-[#D8B08C]">
              Pour réinitialiser votre mot de passe, un code de validation à usage unique sera envoyé par SMS / WhatsApp à votre numéro enregistré.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg shadow-[#D8B08C]/10 flex items-center justify-center gap-2 mt-4"
          >
            <span>{isLogin ? 'Se Connecter en Toute Sécurité' : 'Créer Mon Compte'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#22222A] text-center text-xs text-[#A7A3A0]">
          {isLogin ? (
            <p>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMessage(null);
                }}
                className="text-[#D8B08C] font-semibold hover:underline"
              >
                Inscrivez-vous
              </button>
            </p>
          ) : (
            <p>
              Vous possédez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrorMessage(null);
                }}
                className="text-[#D8B08C] font-semibold hover:underline"
              >
                Connectez-vous
              </button>
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-[#A7A3A0]/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Données protégées selon la loi CNDP 09-08 (Royaume du Maroc)</span>
        </div>
      </div>
    </div>
  );
};
