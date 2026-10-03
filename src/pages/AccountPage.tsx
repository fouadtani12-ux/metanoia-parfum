import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/products/ProductCard';
import {
  Package,
  Heart,
  User,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Mail,
  MessageCircle,
  Lock,
  Smartphone,
  KeyRound,
  Download,
  AlertTriangle,
  FileText,
  Printer,
  History as HistoryIcon,
  Laptop,
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: 'orders' | 'wishlist' | 'profile' | 'security';
  successOrderNumber?: string | null;
  navigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'orders',
  successOrderNumber,
  navigate,
}) => {
  const {
    currentUser,
    orders,
    products,
    wishlist,
    logout,
    cancelOrder,
    updateProfile,
    changePassword,
    toggleTwoFactor,
    terminateOtherSessions,
    exportUserData,
    settings,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'security'>(initialTab);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    successOrderNumber || null
  );

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.addresses?.[0]?.address || '',
    city: currentUser?.addresses?.[0]?.city || 'Casablanca',
  });

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="p-8 bg-[#121216] border border-[#2B2B38] rounded-sm space-y-4">
          <ShieldAlert className="w-10 h-10 text-[#D8B08C] mx-auto" />
          <h2 className="text-xl font-serif text-[#F5F1EB]">Connexion requise</h2>
          <p className="text-xs text-[#A7A3A0]">
            Veuillez vous connecter pour accéder à votre espace client et suivre vos commandes.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
          >
            Se Connecter
          </button>
        </div>
      </div>
    );
  }

  // Filter orders for current user
  const userOrders = orders.filter(
    (o) =>
      o.userId === currentUser.id ||
      o.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  const activeOrder = selectedOrderNumber
    ? orders.find((o) => o.orderNumber === selectedOrderNumber)
    : userOrders[0];

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone,
      addresses: [
        {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: currentUser.email,
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
          region: 'Maroc',
          postalCode: '20000',
        },
      ],
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ success: false, message: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ success: false, message: 'Le mot de passe doit comporter au moins 8 caractères.' });
      return;
    }

    const res = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPasswordStatus(res);
    if (res.success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Banner if redirected from checkout */}
      {successOrderNumber && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-emerald-300">
                  Commande #{successOrderNumber} confirmée avec succès !
                </h3>
                <p className="text-[11px] text-emerald-400/80">
                  Votre commande est enregistrée et prise en charge par notre atelier pour préparation et livraison.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrderNumber(successOrderNumber)}
              className="text-xs font-mono text-[#D8B08C] hover:underline self-start sm:self-auto shrink-0"
            >
              Voir le détail complet
            </button>
          </div>

          {activeOrder && activeOrder.orderNumber === successOrderNumber && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-800/40">
              {(() => {
                const rawPhone = (settings.whatsapp || settings.phone || '212600000000').replace(/[^0-9]/g, '');
                const msg = encodeURIComponent(
                  `Bonjour METANOÏA, je souhaite suivre ma commande #${activeOrder.orderNumber} d'un montant de ${activeOrder.total} ${settings.currency}.`
                );
                return (
                  <a
                    href={`https://wa.me/${rawPhone}?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-[11px] rounded-sm hover:bg-emerald-900/60 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Contacter le support WhatsApp</span>
                  </a>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#22222A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
              ESPACE PRIVILÈGE SÉCURISÉ
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-sm">
              <ShieldCheck className="w-3 h-3" />
              <span>Compte Protégé</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif text-[#F5F1EB] mt-1">
            Bonjour, {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="text-xs text-[#A7A3A0] mt-1">
            Gérez vos commandes, vos favoris, votre carnet d’adresses et vos paramètres de sécurité.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#201A15] border border-[#D8B08C]/60 text-xs text-[#D8B08C] hover:bg-[#2B231C] rounded-sm transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Accéder à l'Atelier Admin</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141418] border border-[#2B2B38] text-xs text-[#A7A3A0] hover:text-rose-400 hover:border-rose-900 rounded-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#22222A] overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'orders'
              ? 'border-[#D8B08C] text-[#D8B08C]'
              : 'border-transparent text-[#A7A3A0] hover:text-[#F5F1EB]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Commandes ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'wishlist'
              ? 'border-[#D8B08C] text-[#D8B08C]'
              : 'border-transparent text-[#A7A3A0] hover:text-[#F5F1EB]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Mes Favoris ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'border-[#D8B08C] text-[#D8B08C]'
              : 'border-transparent text-[#A7A3A0] hover:text-[#F5F1EB]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Coordonnées &amp; Adresses</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'security'
              ? 'border-[#D8B08C] text-[#D8B08C]'
              : 'border-transparent text-[#A7A3A0] hover:text-[#F5F1EB]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sécurité &amp; Confidentialité</span>
        </button>
      </div>

      {/* Tab 1: Orders with Visual Timeline & Delivery Security PIN */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Orders List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[#A7A3A0] font-semibold mb-2">
              Historique des Commandes
            </h3>

            {userOrders.length === 0 ? (
              <div className="p-8 bg-[#121216] border border-[#22222A] rounded-sm text-center space-y-3">
                <Package className="w-8 h-8 text-[#444] mx-auto" />
                <p className="text-xs text-[#A7A3A0]">Vous n'avez pas encore passé de commande.</p>
                <button
                  onClick={() => navigate('/shop')}
                  className="px-4 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
                >
                  Découvrir les Parfums
                </button>
              </div>
            ) : (
              userOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderNumber(ord.orderNumber)}
                    className={`p-4 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#181822] border-[#D8B08C]'
                        : 'bg-[#121216] border-[#22222A] hover:border-[#333342]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#F5F1EB]">#{ord.orderNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {ord.status === 'PENDING'
                          ? 'En attente'
                          : ord.status === 'CONFIRMED'
                          ? 'Confirmée'
                          : ord.status === 'PROCESSING'
                          ? 'En préparation'
                          : ord.status === 'SHIPPED'
                          ? 'Expédiée'
                          : ord.status === 'DELIVERED'
                          ? 'Livrée'
                          : ord.status === 'CANCELLED'
                          ? 'Annulée'
                          : ord.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-[#A7A3A0] space-y-1">
                      <div className="flex justify-between">
                        <span>Date :</span>
                        <span>{new Date(ord.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Articles :</span>
                        <span>{ord.items.reduce((s, i) => s + i.quantity, 0)} flacon(s)</span>
                      </div>
                      <div className="flex justify-between font-semibold text-[#D8B08C]">
                        <span>Total :</span>
                        <span className="font-mono">{ord.total} DH (Espèces)</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#22222A] flex items-center justify-between text-[11px] text-[#A7A3A0]">
                      <span className="font-mono text-[10px] text-emerald-400">
                        PIN Remise : {ord.deliverySecurityPin || '4821'}
                      </span>
                      <div className="flex items-center gap-1 text-[#D8B08C]">
                        <span>Détails &amp; Suivi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Order Details & Timeline */}
          <div className="lg:col-span-7">
            {activeOrder ? (
              <div className="p-6 bg-[#121216] border border-[#262632] rounded-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#22222A]">
                  <div>
                    <span className="text-[11px] font-mono text-[#D8B08C] uppercase tracking-wider">
                      Détails de la commande
                    </span>
                    <h4 className="text-xl font-mono font-bold text-[#F5F1EB]">
                      #{activeOrder.orderNumber}
                    </h4>
                    <span className="text-xs text-[#A7A3A0]">
                      Passée le {new Date(activeOrder.createdAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(activeOrder.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-[#1B1B26] border border-[#333346] hover:border-[#D8B08C] text-[#F5F1EB] text-[11px] rounded-sm flex items-center gap-1.5 transition-colors"
                      title="Imprimer le bon certifié"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D8B08C]" />
                      <span>Imprimer Reçu</span>
                    </button>

                    {activeOrder.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          if (confirm('Voulez-vous vraiment annuler cette commande ?')) {
                            cancelOrder(activeOrder.id, 'Annulation demandée par le client');
                          }
                        }}
                        className="px-3 py-1.5 border border-rose-900 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 rounded-sm text-[11px] transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {/* Secure Handover PIN Box */}
                <div className="p-4 bg-gradient-to-r from-[#171722] to-[#1D1B17] border border-[#D8B08C]/40 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#D8B08C] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Code Confidentiel de Remise au Livreur</span>
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">
                      Remise Sécurisée
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-2xl font-mono font-bold tracking-[0.3em] text-[#D8B08C]">
                        {activeOrder.deliverySecurityPin || '4821'}
                      </span>
                      <p className="text-[11px] text-[#A7A3A0] mt-1">
                        Communiquez ce code confidentiel au transporteur lors de la remise en main propre pour attester de la bonne réception de votre flacon.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-[#A7A3A0] mb-4">
                    Suivi de Livraison en Direct
                  </h5>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#22222E]">
                    {activeOrder.timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                            event.isCompleted
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'bg-[#181820] border-[#333342] text-transparent'
                          }`}
                        >
                          {event.isCompleted && <CheckCircle2 className="w-3 h-3 text-black" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                event.isCompleted ? 'text-[#F5F1EB]' : 'text-[#666]'
                              }`}
                            >
                              {event.label}
                            </span>
                            {event.timestamp && (
                              <span className="text-[10px] font-mono text-[#A7A3A0]">
                                {new Date(event.timestamp).toLocaleDateString('fr-FR')} -{' '}
                                {new Date(event.timestamp).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          {event.note && (
                            <p className="text-[11px] text-[#A7A3A0] mt-0.5">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items in order */}
                <div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-[#A7A3A0] mb-3">
                    Articles Commandés
                  </h5>
                  <div className="divide-y divide-[#22222A]">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-sm border border-[#2B2B38]"
                          />
                          <div>
                            <span className="font-semibold text-[#F5F1EB] block">{item.name}</span>
                            <span className="text-[11px] text-[#A7A3A0]">
                              Contenance : {item.volume} · Qté : {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[#D8B08C] font-semibold">
                          {item.price * item.quantity} DH
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#22222A] text-xs">
                  <div>
                    <h5 className="font-semibold text-[#F5F1EB] mb-2 uppercase tracking-wider text-[11px]">
                      Récapitulatif Financier
                    </h5>
                    <div className="space-y-1 text-[#A7A3A0]">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span className="font-mono">{activeOrder.subtotal} DH</span>
                      </div>
                      {activeOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Remise privilège</span>
                          <span className="font-mono">-{activeOrder.discountAmount} DH</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Frais de livraison</span>
                        <span className="font-mono">
                          {activeOrder.shippingFee === 0 ? 'Offerts' : `${activeOrder.shippingFee} DH`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-[#D8B08C] text-sm pt-1">
                        <span>Total à régler au livreur</span>
                        <span className="font-mono">{activeOrder.total} DH</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-[#F5F1EB] mb-2 uppercase tracking-wider text-[11px]">
                      Adresse de Réception
                    </h5>
                    <p className="text-[#A7A3A0] leading-relaxed">
                      {activeOrder.customer.firstName} {activeOrder.customer.lastName} <br />
                      {activeOrder.customer.address} <br />
                      {activeOrder.customer.city}, Maroc <br />
                      Tél : {activeOrder.customer.phone}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[#1C1C24]">
                      <span className="text-[#A7A3A0] block">
                        Mode de paiement :{' '}
                        <strong className="text-[#F5F1EB]">
                          Paiement en espèces à la livraison (Cash on Delivery)
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#121216] border border-[#22222A] rounded-sm text-center text-[#A7A3A0]">
                Sélectionnez une commande pour afficher sa chronologie de livraison.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h3 className="text-xs uppercase tracking-wider text-[#A7A3A0] font-semibold">
            Mes Flacons Coups de Cœur ({wishlistProducts.length})
          </h3>

          {wishlistProducts.length === 0 ? (
            <div className="p-12 bg-[#121216] border border-[#22222A] rounded-sm text-center">
              <Heart className="w-8 h-8 text-[#444] mx-auto mb-2" />
              <p className="text-xs text-[#A7A3A0]">Vous n'avez pas encore de parfum en favori.</p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-4 px-4 py-2 bg-[#191920] border border-[#D8B08C]/40 text-[#D8B08C] text-xs font-mono rounded-sm"
              >
                Explorer le catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={navigate} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl p-6 bg-[#121216] border border-[#262632] rounded-sm">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-[#F5F1EB] mb-4">
            Modifier mes Coordonnées de Livraison
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#A7A3A0] block mb-1">Prénom</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A7A3A0] block mb-1">Nom</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#A7A3A0] block mb-1">Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-[#141418] border border-[#22222A] px-3 py-2 text-xs text-[#666] rounded-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#A7A3A0] block mb-1">Téléphone Principal (Maroc)</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#A7A3A0] block mb-1">Adresse Habituelle (Quartier / Résidence)</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#A7A3A0] block mb-1">Ville</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>

            <button
              type="submit"
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Security & Privacy (Enhanced) */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Change Password Form */}
            <div className="p-6 bg-[#121216] border border-[#262632] rounded-sm space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D8B08C]" />
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                  Modifier Votre Mot de Passe
                </h4>
              </div>
              <p className="text-xs text-[#A7A3A0]">
                Choisissez un mot de passe robuste comportant au minimum 8 caractères.
              </p>

              {passwordStatus && (
                <div
                  className={`p-3 rounded-sm text-xs flex items-start gap-2 ${
                    passwordStatus.success
                      ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-800 text-rose-300'
                  }`}
                >
                  {passwordStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    placeholder="8 caractères min."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    placeholder="Confirmer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
                >
                  Mettre à jour le mot de passe
                </button>
              </form>
            </div>

            {/* Two-Factor Authentication & Security Controls */}
            <div className="space-y-6">
              <div className="p-6 bg-[#121216] border border-[#262632] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                      Double Authentification (2FA)
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
                      currentUser.isTwoFactorEnabled
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-[#22222A] text-[#A7A3A0]'
                    }`}
                  >
                    {currentUser.isTwoFactorEnabled ? 'Active' : 'Désactivée'}
                  </span>
                </div>

                <p className="text-xs text-[#A7A3A0]">
                  Sécurisez vos accès en demandant un code à usage unique (WhatsApp ou SMS) lors de chaque nouvelle connexion.
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#22222A]">
                  <span className="text-xs text-[#F5F1EB]">
                    Canal favori :{' '}
                    <strong className="text-[#D8B08C]">
                      {currentUser.twoFactorMethod || 'WhatsApp'} ({currentUser.phone})
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTwoFactor(!currentUser.isTwoFactorEnabled, 'WHATSAPP')}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                      currentUser.isTwoFactorEnabled
                        ? 'bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900'
                        : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                    }`}
                  >
                    {currentUser.isTwoFactorEnabled ? 'Désactiver' : 'Activer sur WhatsApp'}
                  </button>
                </div>
              </div>

              {/* Data Portability (CNDP / RGPD) */}
              <div className="p-6 bg-[#121216] border border-[#262632] rounded-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#D8B08C]" />
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                    Export de Données &amp; Confidentialité
                  </h4>
                </div>
                <p className="text-xs text-[#A7A3A0]">
                  Conformément à la loi marocaine CNDP 09-08 et au RGPD, vous disposez d'un droit total d'accès et d'exportation de vos données personnelles et historiques de commandes.
                </p>
                <button
                  type="button"
                  onClick={exportUserData}
                  className="px-4 py-2 bg-[#1A1A24] border border-[#333346] hover:border-[#D8B08C] text-[#F5F1EB] text-xs rounded-sm inline-flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#D8B08C]" />
                  <span>Télécharger Mes Données (JSON Certifié)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions List */}
          <div className="p-6 bg-[#121216] border border-[#262632] rounded-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                  Appareils &amp; Sessions Connectées
                </h4>
                <p className="text-xs text-[#A7A3A0] mt-0.5">
                  Surveillez les terminaux autorisés à consulter votre espace privilège.
                </p>
              </div>
              <button
                type="button"
                onClick={terminateOtherSessions}
                className="px-3 py-1.5 border border-rose-900 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 rounded-sm text-xs transition-colors self-start sm:self-auto"
              >
                Déconnecter les autres appareils
              </button>
            </div>

            <div className="divide-y divide-[#22222A]">
              {(currentUser.sessions && currentUser.sessions.length > 0
                ? currentUser.sessions
                : [
                    {
                      id: 'sess-current',
                      device: 'Appareil Actuel · Session Sécurisée',
                      ip: '196.12.180.45 (Maroc)',
                      city: 'Casablanca',
                      lastActive: 'À l’instant',
                      isCurrent: true,
                    },
                  ]
              ).map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-[#D8B08C]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F5F1EB]">{s.device}</span>
                        {s.isCurrent && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                            Cet appareil
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#A7A3A0]">
                        Localisation : {s.city} ({s.ip})
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#A7A3A0]">{s.lastActive}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Logs (Audit Trail for User) */}
          <div className="p-6 bg-[#121216] border border-[#262632] rounded-sm space-y-4">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-[#D8B08C]" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                Journal d'Activité &amp; Événements de Sécurité
              </h4>
            </div>

            <div className="overflow-x-auto border border-[#22222A] rounded-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171720] text-[#A7A3A0] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Événement</th>
                    <th className="p-3">Date &amp; Heure</th>
                    <th className="p-3">Adresse IP</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22222A]">
                  {(currentUser.securityLogs && currentUser.securityLogs.length > 0
                    ? currentUser.securityLogs
                    : [
                        {
                          id: 'log-1',
                          action: 'Connexion autorisée à l’Espace Privilège',
                          timestamp: currentUser.lastLogin || new Date().toISOString(),
                          ip: '105.158.42.12',
                          status: 'SUCCESS' as const,
                        },
                      ]
                  ).map((log) => (
                    <tr key={log.id} className="hover:bg-[#15151D]">
                      <td className="p-3 text-[#F5F1EB] font-medium">{log.action}</td>
                      <td className="p-3 font-mono text-[#A7A3A0]">
                        {new Date(log.timestamp).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-mono text-[#A7A3A0]">{log.ip}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : log.status === 'WARNING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
