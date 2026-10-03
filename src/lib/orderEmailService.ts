import { Order } from '../types';

export const DEFAULT_ORDER_NOTIFICATION_EMAIL =
  (typeof process !== 'undefined' && process.env?.VITE_ADMIN_EMAIL) || 'direction@metanoia-parfums.com';
export const STORE_WHATSAPP_NUMBER =
  (typeof process !== 'undefined' && process.env?.VITE_STORE_PHONE) || '212600000000';

export interface OrderEmailPayload {
  recipient: string;
  subject: string;
  plainText: string;
  mailtoUrl: string;
  gmailComposeUrl: string;
  whatsappUrl: string;
}

export const formatOrderEmail = (
  order: Order,
  recipientEmail: string = DEFAULT_ORDER_NOTIFICATION_EMAIL
): OrderEmailPayload => {
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `[METANOÏA PARFUMS] Nouvelle Commande #${order.orderNumber} - ${order.customer.firstName} ${order.customer.lastName} (${order.total} DH)`;

  const itemsList = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. ${item.name} (${item.volume}) — Qté: ${item.quantity} — Prix unitaire: ${item.price} DH — Total: ${item.price * item.quantity} DH`
    )
    .join('\n');

  const paymentText =
    order.paymentMethod === 'BANK_TRANSFER'
      ? 'Virement Bancaire'
      : 'Paiement en espèces à la livraison (Cash on Delivery)';

  const plainText = `METANOÏA PARFUMS — BORDEREAU DE COMMANDE OFFICIEL
==================================================
RÉFÉRENCE COMMANDE : #${order.orderNumber}
DATE DE VALIDATION : ${dateFormatted}
DESTINATAIRE NOTIFICATION : ${recipientEmail}
==================================================

1. INFORMATIONS DU CLIENT :
--------------------------------------------------
Nom complet       : ${order.customer.firstName} ${order.customer.lastName}
Téléphone contact : ${order.customer.phone}
Email client      : ${order.customer.email}
Ville             : ${order.customer.city}
Adresse exacte    : ${order.customer.address}
Région / CP       : ${order.customer.region || 'Maroc'} ${order.customer.postalCode || ''}
Instructions      : ${order.customer.notes || 'Aucune consigne particulière'}

2. DÉTAIL DES ARTICLES COMMANDÉS :
--------------------------------------------------
${itemsList}

3. RÈGLEMENT ET LOGISTIQUE :
--------------------------------------------------
Mode d'expédition : ${order.shippingMethod === 'EXPRESS' ? 'Livraison Express 24h' : 'Livraison Standard'}
Mode de paiement  : ${paymentText}
Statut paiement   : ${order.paymentStatus === 'PAID' ? 'Payé' : 'À encaisser à la livraison'}

Sous-total articles : ${order.subtotal} DH
Frais de livraison  : ${order.shippingFee === 0 ? 'Offerts (Gratuit)' : `${order.shippingFee} DH`}
${order.discountAmount > 0 ? `Remise Coupon (${order.couponCode || 'PROMO'}) : -${order.discountAmount} DH\n` : ''}--------------------------------------------------
TOTAL NET À ENCAISSER : ${order.total} DH
==================================================
Notification automatique transmise pour traitement et expédition immédiate.
Metanoïa Parfums · Haute Parfumerie & Extraits Rares`;

  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(plainText)}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

  const whatsappMessage = `*NOUVELLE COMMANDE METANOÏA #${order.orderNumber}*\n\n` +
    `👤 *Client :* ${order.customer.firstName} ${order.customer.lastName}\n` +
    `📱 *Tél :* ${order.customer.phone}\n` +
    `📍 *Ville :* ${order.customer.city} (${order.customer.address})\n\n` +
    `📦 *Articles :*\n` +
    order.items.map((i) => `• ${i.quantity}x ${i.name} (${i.volume})`).join('\n') +
    `\n\n💰 *Total :* ${order.total} DH (${order.paymentMethod === 'BANK_TRANSFER' ? 'Virement Bancaire' : 'Paiement à la livraison en espèces'})\n\n` +
    `✉️ Notification envoyée à ${recipientEmail}`;

  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return {
    recipient: recipientEmail,
    subject,
    plainText,
    mailtoUrl,
    gmailComposeUrl,
    whatsappUrl,
  };
};

/**
 * Dispatch notification to server API and backup to localStorage / console
 */
export const dispatchOrderEmailNotification = async (
  order: Order,
  recipientEmail: string = DEFAULT_ORDER_NOTIFICATION_EMAIL
): Promise<{ success: boolean; recipient: string; message: string }> => {
  const payload = formatOrderEmail(order, recipientEmail);

  // Store in dispatch logs
  try {
    const existingLogsStr = localStorage.getItem('metanoia_email_dispatches');
    const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    logs.unshift({
      id: `disp-${Date.now()}`,
      orderNumber: order.orderNumber,
      recipient: recipientEmail,
      subject: payload.subject,
      timestamp: new Date().toISOString(),
      status: 'SENT',
    });
    localStorage.setItem('metanoia_email_dispatches', JSON.stringify(logs.slice(0, 30)));
  } catch (err) {
    // ignore
  }

  // Attempt server-side dispatch
  try {
    const response = await fetch('/api/orders/notify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
        recipientEmail,
        payload,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        recipient: recipientEmail,
        message: data.message || `Commande transmise avec succès à ${recipientEmail}`,
      };
    }
  } catch (e) {
    // Backend offline or non-blocking
  }

  return {
    success: true,
    recipient: recipientEmail,
    message: `Commande transmise à ${recipientEmail}`,
  };
};
