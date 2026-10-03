import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Order, PaymentMethod, ShippingAddress } from '../types';
import { ShieldCheck, Truck, Banknote, Landmark, ArrowLeft, ArrowRight, Check, MessageCircle, CheckCircle2, Printer } from 'lucide-react';
import { PerfumeBottleGraphic } from '../components/ui/PerfumeBottleGraphic';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    couponDiscount,
    shippingRates,
    calculateShippingFee,
    createOrder,
    currentUser,
    settings,
  } = useStore();

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.addresses?.[0]?.address || '',
    city: currentUser?.addresses?.[0]?.city || 'Casablanca',
    region: currentUser?.addresses?.[0]?.region || 'Casablanca-Settat',
    postalCode: currentUser?.addresses?.[0]?.postalCode || '20000',
    notes: '',
  });

  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (confirmedOrder) {
    const rawPhone = (settings.whatsapp || settings.phone || '212600000000').replace(/[^0-9]/g, '');
    const whatsappOrderMessage = encodeURIComponent(
      `Bonjour METANOÏA,\nJe viens de valider ma commande #${confirmedOrder.orderNumber} d'un montant de ${confirmedOrder.total} ${settings.currency}.\nNom: ${confirmedOrder.customer.firstName} ${confirmedOrder.customer.lastName}\nVille: ${confirmedOrder.customer.city}\nTéléphone / WhatsApp: ${confirmedOrder.customer.phone}`
    );
    const whatsappUrl = `https://wa.me/${rawPhone}?text=${whatsappOrderMessage}`;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#121216] border border-[#2B2B38] p-8 sm:p-10 rounded-sm space-y-6 shadow-2xl">
          {/* Header Status */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C] block">
              COMMANDE CONFIRMÉE AVEC SUCCÈS
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB]">
              Merci pour votre commande, {confirmedOrder.customer.firstName} !
            </h1>
            <p className="text-xs text-[#A7A3A0]">
              Référence officielle : <strong className="font-mono text-[#D8B08C] text-sm">#{confirmedOrder.orderNumber}</strong>
            </p>
          </div>

          {/* WhatsApp Direct Dispatch Card (Exclusive WhatsApp Communication) */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-600/50 rounded-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-sm bg-emerald-900/60 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-semibold text-emerald-300 block">
                Validation &amp; Suivi instantané via WhatsApp
              </span>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                Votre commande a été transmise à notre atelier de Marrakech. Cliquez sur le bouton WhatsApp ci-dessous pour confirmer directement vos coordonnées et recevoir le suivi de votre colis en direct avec notre équipe.
              </p>
            </div>
          </div>

          {/* Delivery Reassurance Card */}
          <div className="p-4 bg-[#171720] border border-[#272736] rounded-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-sm bg-[#22222E] border border-[#333346] text-[#D8B08C] flex items-center justify-center shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#F5F1EB] block">
                Préparation et acheminement au Maroc
              </span>
              <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                Notre livreur prendra contact avec vous par téléphone au <strong className="text-[#F5F1EB] font-mono">{confirmedOrder.customer.phone}</strong> avant son passage à votre adresse.
              </p>
            </div>
          </div>

          {/* Detailed Order Slip */}
          <div className="bg-[#15151C] border border-[#242432] p-6 rounded-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#22222E]">
              <span className="font-serif text-sm font-semibold text-[#F5F1EB]">
                Récapitulatif de votre commande
              </span>
              <span className="text-[11px] text-[#A7A3A0]">
                {new Date(confirmedOrder.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Articles List */}
            <div className="divide-y divide-[#1F1F2A] py-1">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#D8B08C] font-mono text-[11px]">×{item.quantity}</span>
                    <div>
                      <span className="text-[#F5F1EB] font-medium block">{item.name}</span>
                      <span className="text-[10px] text-[#A7A3A0]">{item.volume}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[#F5F1EB] font-semibold">
                    {item.price * item.quantity} {settings.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Coordinated Info */}
            <div className="pt-3 border-t border-[#22222E] grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#A7A3A0]">
              <div>
                <span className="text-[10px] uppercase tracking-wider block text-[#777]">Destinataire</span>
                <span className="text-[#F5F1EB] font-medium">{confirmedOrder.customer.firstName} {confirmedOrder.customer.lastName}</span>
                <span className="block font-mono text-[11px] text-[#A7A3A0] mt-0.5">{confirmedOrder.customer.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider block text-[#777]">Adresse de livraison</span>
                <span className="text-[#F5F1EB] font-medium block">{confirmedOrder.customer.city}</span>
                <span className="text-[11px] text-[#A7A3A0]">{confirmedOrder.customer.address}</span>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="pt-3 border-t border-[#22222E] space-y-1.5 text-right">
              <div className="flex justify-between text-[#A7A3A0]">
                <span>Sous-total articles :</span>
                <span className="font-mono text-[#F5F1EB]">{confirmedOrder.subtotal} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-[#A7A3A0]">
                <span>Frais d'expédition ({confirmedOrder.shippingMethod === 'EXPRESS' ? 'Express 24h' : 'Standard'}) :</span>
                <span className="font-mono text-[#D8B08C]">
                  {confirmedOrder.shippingFee === 0 ? 'Offerts' : `${confirmedOrder.shippingFee} ${settings.currency}`}
                </span>
              </div>
              {confirmedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Remise coupon :</span>
                  <span className="font-mono">-{confirmedOrder.discountAmount} {settings.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#F5F1EB] pt-2 border-t border-[#2A2A38]">
                <span>Total net à régler :</span>
                <span className="font-mono text-base text-[#D8B08C]">
                  {confirmedOrder.total} {settings.currency}
                </span>
              </div>
              <p className="text-[10px] text-[#A7A3A0] pt-1 text-left">
                Mode de règlement : <strong className="text-[#F5F1EB]">{confirmedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Virement Bancaire' : 'Paiement en espèces à la livraison'}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-950/60 hover:bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-xs font-semibold rounded-sm transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Assistance &amp; Suivi WhatsApp ({settings.whatsapp || settings.phone || '+212 6 00 00 00 00'})</span>
            </a>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-4 bg-[#181822] hover:bg-[#20202E] border border-[#2D2D3E] text-[#D8B08C] text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer le reçu</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="flex-1 py-2.5 px-6 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm hover:brightness-110 transition-all text-center cursor-pointer"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-serif text-[#F5F1EB]">Votre panier est vide</h2>
        <p className="text-xs text-[#A7A3A0] mt-2 mb-6">
          Ajoutez des fragrances à votre panier avant de procéder au règlement.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-semibold text-xs uppercase tracking-widest rounded-sm"
        >
          Découvrir la boutique
        </button>
      </div>
    );
  }

  const shippingFee = calculateShippingFee(formData.city, shippingMethod, cartSubtotal);
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - couponDiscount);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const finalCustomer: ShippingAddress = {
        ...formData,
        email: formData.email && formData.email.includes('@') ? formData.email : `${cleanPhone || 'client'}@whatsapp.client`,
      };

      const result = createOrder({
        customer: finalCustomer,
        shippingMethod,
        paymentMethod,
      });

      setIsProcessing(false);

      if (result.success && result.order) {
        setConfirmedOrder(result.order);
      } else if (result.success && result.orderId) {
        navigate(`/account/orders?success=${result.orderNumber}`);
      } else {
        setErrorMsg(result.message || 'Une erreur est survenue lors de la commande.');
      }
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#22222A]">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-xs text-[#A7A3A0] hover:text-[#F5F1EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continuer mes achats</span>
        </button>
        <span className="text-xs font-mono uppercase tracking-widest text-[#D8B08C]">
          COMMANDE SÉCURISÉE
        </span>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form: Customer Info, Shipping Address, Delivery & Payment */}
        <div className="lg:col-span-7 space-y-10">
          {/* Étape 1 : Informations Client */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h2 className="text-lg font-serif text-[#F5F1EB]">Informations Personnelles</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] flex items-center gap-1.5 font-medium">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Numéro WhatsApp &amp; Téléphone (pour confirmation et livraison) *</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-sm">
                    Suivi WhatsApp uniquement
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="06 XX XX XX XX ou +212 6 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => {
                    const phoneVal = e.target.value;
                    const clean = phoneVal.replace(/[^0-9]/g, '');
                    setFormData({
                      ...formData,
                      phone: phoneVal,
                      email: clean ? `${clean}@whatsapp.client` : 'client@metanoia-parfum.com',
                    });
                  }}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2.5 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-[#A7A3A0] mt-1.5 flex items-center gap-1">
                  <span className="text-emerald-400">●</span>
                  <span>Vos informations de suivi et la confirmation de votre commande se feront exclusivement par WhatsApp et appel du livreur.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Étape 2 : Adresse de Livraison */}
          <div className="space-y-4 pt-6 border-t border-[#1C1C24]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h2 className="text-lg font-serif text-[#F5F1EB]">Adresse de Livraison au Maroc</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Adresse (Rue, Numéro, Résidence, Appartement) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : 14 Rue de la Liberté, Apt 3B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Ville *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                >
                  {shippingRates.map((r) => (
                    <option key={r.id} value={r.city}>
                      {r.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Code Postal
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Instructions de livraison (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Appeler à l’arrivée, code interphone 2410"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
            </div>
          </div>

          {/* Étape 3 : Mode de Livraison */}
          <div className="space-y-4 pt-6 border-t border-[#1C1C24]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h2 className="text-lg font-serif text-[#F5F1EB]">Mode de Livraison</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setShippingMethod('STANDARD')}
                className={`p-4 border rounded-sm cursor-pointer flex flex-col justify-between transition-all ${
                  shippingMethod === 'STANDARD'
                    ? 'border-[#D8B08C] bg-[#171720]'
                    : 'border-[#242430] bg-[#121216] hover:border-[#333342]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D8B08C]" />
                    <span className="text-xs font-semibold text-[#F5F1EB]">
                      Livraison Standard
                    </span>
                  </div>
                  {shippingMethod === 'STANDARD' && (
                    <Check className="w-4 h-4 text-[#D8B08C]" />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-[#A7A3A0]">Délai estimé : 24h à 48h</span>
                  <span className="font-mono text-[#D8B08C] font-semibold">
                    {cartSubtotal >= settings.freeShippingThreshold ? 'Offerte' : `${shippingFee} DH`}
                  </span>
                </div>
              </label>

              <label
                onClick={() => setShippingMethod('EXPRESS')}
                className={`p-4 border rounded-sm cursor-pointer flex flex-col justify-between transition-all ${
                  shippingMethod === 'EXPRESS'
                    ? 'border-[#D8B08C] bg-[#171720]'
                    : 'border-[#242430] bg-[#121216] hover:border-[#333342]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C98F78]" />
                    <span className="text-xs font-semibold text-[#F5F1EB]">
                      Livraison Express VIP
                    </span>
                  </div>
                  {shippingMethod === 'EXPRESS' && (
                    <Check className="w-4 h-4 text-[#C98F78]" />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-[#A7A3A0]">Prioritaire le lendemain</span>
                  <span className="font-mono text-[#C98F78] font-semibold">
                    {cartSubtotal >= settings.freeShippingThreshold ? '25 DH' : '55 DH'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Étape 4 : Mode de Règlement */}
          <div className="space-y-4 pt-6 border-t border-[#1C1C24]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <h2 className="text-lg font-serif text-[#F5F1EB]">Mode de Règlement</h2>
              </div>
              <span className="text-[10px] font-mono text-[#A7A3A0]">
                100% Sécurisé sans frais cachés
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Cash on Delivery (Standard & Preferred in Morocco) */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 border rounded-sm cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#D8B08C] bg-[#171722] shadow-md shadow-[#D8B08C]/5'
                    : 'border-[#242430] bg-[#121216] hover:border-[#383848]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#20202C] border border-[#3A3A4C] text-[#D8B08C] flex items-center justify-center shrink-0">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#F5F1EB]">
                        Paiement à la Livraison
                      </span>
                    </div>
                    {paymentMethod === 'COD' && (
                      <Check className="w-4 h-4 text-[#D8B08C]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#A7A3A0] mt-3 leading-relaxed">
                    Réglez en espèces directement auprès du livreur à la réception et vérification de votre colis au Maroc.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#22222E] flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono">0 DH de frais de paiement</span>
                  <span className="text-[#D8B08C]">Recommandé</span>
                </div>
              </label>

              {/* Option 2: Bank Transfer (CIH / Attijariwafa) */}
              <label
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-4 border rounded-sm cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-[#D8B08C] bg-[#171722] shadow-md shadow-[#D8B08C]/5'
                    : 'border-[#242430] bg-[#121216] hover:border-[#383848]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#20202C] border border-[#3A3A4C] text-[#D8B08C] flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#F5F1EB]">
                        Virement Bancaire
                      </span>
                    </div>
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <Check className="w-4 h-4 text-[#D8B08C]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#A7A3A0] mt-3 leading-relaxed">
                    Virement instantané (CIH, Attijariwafa, Bank of Africa). Reçu et RIB officiels transmis pour validation.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#22222E] flex items-center justify-between text-[10px]">
                  <span className="text-[#A7A3A0]">Traitement prioritaire</span>
                  <span className="text-[#D8B08C] font-mono">Banques marocaines</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-[#121216] border border-[#262632] p-6 rounded-sm shadow-2xl space-y-6">
            <h3 className="text-sm font-sans uppercase tracking-[0.2em] font-semibold text-[#F5F1EB] pb-3 border-b border-[#22222A]">
              Récapitulatif de Commande
            </h3>

            {/* Articles list */}
            <div className="divide-y divide-[#1D1D24] max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.volume}`}
                  className="py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-12 bg-[#0A0A0D] border border-[#252530] rounded-sm flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {item.product.images && item.product.images[0] && !item.product.images[0].startsWith('/perfume-') ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-auto object-contain"
                      />
                    ) : (
                      <PerfumeBottleGraphic
                        name={item.product.name}
                        category={item.product.gender}
                        volume={item.volume}
                        accentColor={item.product.accentColor}
                        size="sm"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-serif font-medium text-[#F5F1EB] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-[#A7A3A0]">
                      {item.volume} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#D8B08C] tabular-nums">
                    {item.price * item.quantity} {settings.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-[#1F1F27] text-xs text-[#A7A3A0]">
              <div className="flex justify-between">
                <span>Sous-total articles</span>
                <span className="font-mono text-[#F5F1EB] tabular-nums">
                  {cartSubtotal} {settings.currency}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Code avantage ({appliedCoupon.code})</span>
                  <span className="font-mono tabular-nums">
                    -{couponDiscount} {settings.currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frais de livraison ({formData.city})</span>
                <span className="font-mono text-[#D8B08C] tabular-nums">
                  {shippingFee === 0 ? 'Offerte' : `${shippingFee} ${settings.currency}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold text-[#F5F1EB] pt-3 border-t border-[#262632]">
                <span>Total à régler</span>
                <span className="font-mono text-[#D8B08C] text-lg tabular-nums">
                  {totalAmount} {settings.currency}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-sm text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] font-bold text-xs uppercase tracking-[0.25em] rounded-sm transition-all shadow-xl shadow-[#D8B08C]/15 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <span>CONFIRMER LA COMMANDE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#A7A3A0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B08C]" />
              <span>Garantie authenticité &amp; confidentialité de vos données</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
