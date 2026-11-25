/**
 * Informações do estabelecimento.
 * Fonte: cardápio MenuDino (emporioburguerteresina.menudino.com), conferido em 25/11/2026.
 * Para alterar telefone, horários, taxas ou formas de pagamento, edite somente este arquivo.
 */

export type OrderType = 'delivery' | 'retirada' | 'local';

export interface OpeningHours {
  /** 0 = domingo ... 6 = sábado */
  day: number;
  open: string; // 'HH:MM'
  close: string; // 'HH:MM'
}

export const store = {
  name: 'Empório Burguer',
  tagline: 'Hamburgueria artesanal',
  city: 'Teresina',
  legalName: 'EMPORIO BURGUER',
  cnpj: '52.352.517/0001-43',

  address: {
    street: 'Avenida Monsenhor Chaves, 55 - Lote 28 B',
    district: 'Promorar',
    city: 'Teresina',
    state: 'PI',
    zip: '64027-109',
  },

  /** Telefone exibido na MenuDino. */
  phoneDisplay: '(86) 98897-7712',
  /**
   * Número usado para enviar o pedido pelo WhatsApp (DDI + DDD + número, só dígitos).
   * É o telefone listado na MenuDino. Confirme com a loja que ele recebe WhatsApp.
   */
  whatsapp: '5586988977712',

  /** Fuso horário de Teresina (sem horário de verão). */
  timeZone: 'America/Fortaleza',

  hours: [
    { day: 0, open: '17:00', close: '23:45' },
    { day: 1, open: '19:00', close: '23:45' },
    { day: 2, open: '18:00', close: '23:45' },
    { day: 3, open: '18:30', close: '23:45' },
    { day: 4, open: '19:00', close: '23:45' },
    { day: 5, open: '18:00', close: '23:45' },
    { day: 6, open: '17:02', close: '23:59' },
  ] as OpeningHours[],

  delivery: {
    /** A taxa varia conforme a distância; a MenuDino mostra a faixa R$ 4–18. */
    feeMin: 4,
    feeMax: 18,
    timeMin: 80,
    timeMax: 110,
    /** Pedido mínimo exibido na MenuDino. */
    minimumOrder: 15,
  },

  orderTypes: [
    { id: 'delivery', label: 'Entrega' },
    { id: 'retirada', label: 'Retirada na loja' },
    { id: 'local', label: 'Consumo no local' },
  ] as { id: OrderType; label: string }[],

  /** Formas de pagamento aceitas na entrega (MenuDino). */
  payments: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'],

  menudinoUrl: 'https://emporioburguerteresina.menudino.com/',
  siteUrl: '',
};

export const fullAddress = `${store.address.street} - ${store.address.district}, ${store.address.city} - ${store.address.state}, ${store.address.zip}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
