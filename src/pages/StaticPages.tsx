import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Mail, Phone, MapPin, Send, HelpCircle, ArrowLeft, Shield, Clock } from 'lucide-react';

interface StaticPageProps {
  navigate: (path: string) => void;
}

// 1. ABOUT PAGE
export const AboutPage: React.FC<StaticPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
          NOTRE HISTOIRE &amp; PHILOSOPHIE
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#F5F1EB]">
          Maison Metanoïa Parfums
        </h1>
        <p className="text-xs text-[#A7A3A0] italic">
          « Une signature olfactive qui vous ressemble. »
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-[#A7A3A0] text-sm leading-relaxed space-y-6">
        <p>
          Fondée sur la rencontre entre les terroirs d'Orient et la haute parfumerie française, la <strong>Maison Metanoïa Parfums</strong> est née d'une ambition claire : réinventer l'art du sillage en créant des extraits de parfum puissants, profonds et intimement liés à la personnalité de celui ou celle qui les porte.
        </p>

        <div className="p-8 bg-[#121216] border border-[#262632] rounded-sm my-8 text-center space-y-2">
          <h2 className="text-xl font-serif text-[#D8B08C]">L'Origine du Nom</h2>
          <p className="text-xs text-[#F5F1EB] max-w-lg mx-auto">
            <em>Metanoia</em> (μετάνοια) exprime la métamorphose de l'esprit, l'éveil d'une nouvelle conscience. Nos créations accompagnent ces instants charnières où l'on choisit de s'affirmer.
          </p>
        </div>

        <h3 className="text-xl font-serif text-[#F5F1EB]">L'Excellence des Matières Premières</h3>
        <p>
          Chaque formule est élaborée à partir d'huiles nobles sélectionnées aux quatre coins du monde : bois de santal précieux, oud sauvage d'Assam vieilli en fûts, roses centifolia cueillies à l'aube, absolu de vanille torréfiée et résines mystiques de Somalie.
        </p>

        <h3 className="text-xl font-serif text-[#F5F1EB]">L'Écrin et le Flacon</h3>
        <p>
          Nos flacons en cristal fumé, coiffés de métal lourd champagne et or cuivré, incarnent une élégance architecturale intemporelle. Chaque bouteille est assemblée et scellée à la main.
        </p>
      </div>

      <div className="pt-8 text-center">
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-3.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
        >
          Découvrir la Collection
        </button>
      </div>
    </div>
  );
};

// 2. CONTACT & CONCIERGERIE PAGE
export const ContactPage: React.FC<StaticPageProps> = () => {
  const { settings, showToast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Votre message a été transmis à notre conciergerie olfactive.', 'success');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
          À VOTRE ÉCOUTE
        </span>
        <h1 className="text-4xl font-serif text-[#F5F1EB]">
          Conciergerie &amp; Service Client
        </h1>
        <p className="text-xs text-[#A7A3A0]">
          Nos conseillers vous répondent du lundi au samedi, de 9h à 19h.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4 text-xs">
            <h3 className="font-serif text-base text-[#F5F1EB]">Coordonnées Directes</h3>
            <div className="flex items-start gap-3 text-[#A7A3A0]">
              <MapPin className="w-4 h-4 text-[#D8B08C] shrink-0 mt-0.5" />
              <span>{settings.address}, {settings.city}, Maroc</span>
            </div>
            <div className="flex items-center gap-3 text-[#A7A3A0]">
              <Phone className="w-4 h-4 text-[#D8B08C] shrink-0" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-[#A7A3A0]">
              <Mail className="w-4 h-4 text-[#D8B08C] shrink-0" />
              <span>{settings.email}</span>
            </div>
          </div>

          <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-3 text-xs">
            <h4 className="font-serif text-base text-[#F5F1EB]">WhatsApp Concierge</h4>
            <p className="text-[#A7A3A0]">
              Besoin d'un conseil personnalisé pour choisir votre fragrance ou offrir un cadeau ?
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-4 py-2 bg-[#1A261D] text-emerald-400 border border-emerald-800/40 rounded-sm font-mono text-xs"
            >
              Échanger sur WhatsApp
            </a>
          </div>
        </div>

        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="p-8 bg-[#121216] border border-[#22222A] rounded-sm space-y-4 text-xs">
            <h3 className="font-serif text-lg text-[#F5F1EB] mb-2">Envoyez-nous un Message</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">Sujet</label>
              <input
                type="text"
                required
                placeholder="Conseil olfactif, suivi de commande, partenariat..."
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm transition-all"
            >
              Envoyer la Demande
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// 3. FAQ PAGE
export const FAQPage: React.FC<StaticPageProps> = () => {
  const faqs = [
    {
      q: "Quelle est la concentration de vos parfums ?",
      a: "Toutes nos fragrances sont élaborées sous forme d'Extrait de Parfum, avec une concentration d'huiles précieuses oscillant entre 25 % et 30 %. Cela garantit une tenue supérieure à 12 heures sur la peau."
    },
    {
      q: "Quels sont les délais de livraison au Maroc ?",
      a: "À Casablanca, Rabat et Marrakech, vos commandes sont livrées sous 24h à 48h. Pour les autres villes du Royaume (Tanger, Agadir, Fès, Oujda...), le délai moyen est de 48h à 72h."
    },
    {
      q: "Quels sont les modes de paiement acceptés ?",
      a: "Le paiement à la livraison (Cash on Delivery) est le mode de règlement exclusif : vous réglez en espèces directement au transporteur lors de la remise de votre colis en main propre, sans aucun frais supplémentaire partout au Maroc."
    },
    {
      q: "Comment puis-je retourner un flacon si la fragrance ne me convient pas ?",
      a: "Vous disposez de 14 jours à compter de la réception pour retourner votre flacon non ouvert et toujours sous son blister d'origine scellé. Nous incluons un échantillon de 2 ml dans chaque colis afin que vous puissiez tester le jus avant d'ouvrir le flacon principal."
    },
    {
      q: "Proposez-vous un emballage cadeau ?",
      a: "Chaque commande Metanoïa Parfums est préparée comme un présent : flacon dans son écrin noir mat, ruban de satin et carte calligraphiée offerte."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
          AIDE &amp; RÉPONSES
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F1EB]">
          Foire Aux Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
            <h3 className="text-sm font-semibold text-[#D8B08C] font-serif">
              {faq.q}
            </h3>
            <p className="text-xs text-[#A7A3A0] leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. SHIPPING POLICY PAGE
export const ShippingPage: React.FC<StaticPageProps> = () => {
  const { shippingRates, settings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-xs text-[#A7A3A0]">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
          LOGISTIQUE DE PRÉCISION
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F1EB]">
          Livraison &amp; Expédition
        </h1>
        <p className="text-xs text-[#D8B08C]">
          Livraison offerte dès {settings.freeShippingThreshold} DH d’achat
        </p>
      </div>

      <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-3">
        <h3 className="font-serif text-base text-[#F5F1EB]">Nos Engagements de Livraison</h3>
        <p>
          Chaque flacon est emballé dans un calage protecteur thermique pour préserver l'intégrité des molécules olfactives contre les variations de température pendant le transit.
        </p>
      </div>

      <div>
        <h3 className="font-serif text-base text-[#F5F1EB] mb-4">Grille Tarifaire par Ville</h3>
        <div className="overflow-x-auto border border-[#22222A] rounded-sm">
          <table className="w-full text-left font-mono">
            <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
              <tr>
                <th className="p-3">Ville</th>
                <th className="p-3">Standard</th>
                <th className="p-3">Express VIP</th>
                <th className="p-3">Délai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D1D26] text-xs">
              {shippingRates.map((r) => (
                <tr key={r.id} className="hover:bg-[#15151C]">
                  <td className="p-3 text-[#F5F1EB] font-sans font-medium">{r.city}</td>
                  <td className="p-3">{r.standardFee} DH</td>
                  <td className="p-3 text-[#C98F78]">{r.expressFee} DH</td>
                  <td className="p-3 text-[#A7A3A0]">{r.estimatedDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 5. LEGAL & RETURNS
export const ReturnsPage: React.FC<StaticPageProps> = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6 text-xs text-[#A7A3A0] leading-relaxed">
    <h1 className="text-3xl font-serif text-[#F5F1EB] text-center mb-8">Politique de Retours</h1>
    <p>
      Conformément aux normes d'hygiène et de sécurité applicables aux cosmétiques et à la haute parfumerie, tout article retourné doit se trouver dans son emballage d'origine scellé avec son film plastique intact.
    </p>
    <p>
      Vous bénéficiez d'un délai de 14 jours calendaires à compter du jour de réception pour faire part de votre souhait de retour à notre service client.
    </p>
  </div>
);

export const TermsPage: React.FC<StaticPageProps> = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6 text-xs text-[#A7A3A0] leading-relaxed">
    <h1 className="text-3xl font-serif text-[#F5F1EB] text-center mb-8">Conditions Générales de Vente</h1>
    <p>
      Les présentes conditions générales régissent les ventes conclues sur la boutique en ligne de la marque METANOÏA PARFUMS. En validant votre commande, vous acceptez l'ensemble des termes stipulés.
    </p>
  </div>
);

export const PrivacyPage: React.FC<StaticPageProps> = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6 text-xs text-[#A7A3A0] leading-relaxed">
    <h1 className="text-3xl font-serif text-[#F5F1EB] text-center mb-8">Politique de Confidentialité</h1>
    <p>
      La Maison Metanoïa Parfums attache une importance capitale à la protection de votre vie privée. Vos informations personnelles sont traitées dans le strict respect de la législation marocaine et ne sont jamais cédées à des tiers.
    </p>
  </div>
);

// 6. 404 PAGE
export const NotFoundPage: React.FC<StaticPageProps> = ({ navigate }) => (
  <div className="max-w-md mx-auto py-28 px-4 text-center space-y-4">
    <span className="text-4xl font-serif text-[#D8B08C]">404</span>
    <h1 className="text-2xl font-serif text-[#F5F1EB]">
      Cette fragrance semble avoir disparu...
    </h1>
    <p className="text-xs text-[#A7A3A0] leading-relaxed">
      La page ou le flacon que vous recherchez n'existe plus ou a été déplacé dans nos ateliers de création.
    </p>
    <button
      onClick={() => navigate('/shop')}
      className="mt-6 px-8 py-3 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
    >
      RETOURNER À LA BOUTIQUE
    </button>
  </div>
);
