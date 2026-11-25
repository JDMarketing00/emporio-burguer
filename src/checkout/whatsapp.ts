import { describeCombo, describeSelections, unitPrice, type CartLine } from '../cart/cartUtils';
import { productById } from '../data/menu';
import { store, type OrderType } from '../data/store';
import { formatBRL, parseMoney } from '../lib/format';

export interface CheckoutData {
  name: string;
  phone: string;
  orderType: OrderType;
  street: string;
  number: string;
  district: string;
  complement: string;
  payment: string;
  /** Valor para troco quando o pagamento é em dinheiro (texto livre, ex. "100"). */
  change: string;
  notes: string;
}

export const emptyCheckout: CheckoutData = {
  name: '',
  phone: '',
  orderType: 'delivery',
  street: '',
  number: '',
  district: '',
  complement: '',
  payment: '',
  change: '',
  notes: '',
};

const typeLabel = (t: OrderType) => store.orderTypes.find((o) => o.id === t)?.label ?? t;

/** Texto do pedido enviado para o WhatsApp da loja. */
export function buildOrderMessage(lines: CartLine[], data: CheckoutData, subtotal: number): string {
  const out: string[] = [];
  out.push(`*PEDIDO · ${store.name.toUpperCase()}*`);
  out.push('');
  out.push(`*Cliente:* ${data.name.trim()}`);
  out.push(`*Telefone:* ${data.phone.trim()}`);
  out.push(`*Tipo:* ${typeLabel(data.orderType)}`);
  if (data.orderType === 'delivery') {
    out.push(`*Endereço:* ${data.street.trim()}, ${data.number.trim()} - ${data.district.trim()}`);
    if (data.complement.trim()) out.push(`*Complemento/referência:* ${data.complement.trim()}`);
  }
  out.push('');
  out.push('*ITENS*');
  for (const line of lines) {
    const product = productById.get(line.productId);
    if (!product) continue;
    const total = unitPrice(product, line.selections) * line.qty;
    out.push(`${line.qty}x ${product.name} — ${formatBRL(total)}`);
    for (const c of describeCombo(product)) out.push(`   • Inclui ${c}`);
    for (const s of describeSelections(product, line.selections)) out.push(`   • ${s}`);
    if (line.notes) out.push(`   • Obs.: ${line.notes}`);
  }
  out.push('');
  out.push(`*Subtotal:* ${formatBRL(subtotal)}`);
  if (data.orderType === 'delivery') {
    out.push(
      `*Taxa de entrega:* a confirmar pela loja (${formatBRL(store.delivery.feeMin)} a ${formatBRL(store.delivery.feeMax)})`,
    );
  }
  let payment = `*Pagamento:* ${data.payment}`;
  if (data.payment === 'Dinheiro' && parseMoney(data.change) > 0) payment += ` — troco para ${formatBRL(parseMoney(data.change))}`;
  out.push(payment);
  if (data.notes.trim()) out.push(`*Observações:* ${data.notes.trim()}`);
  out.push('');
  out.push('Pedido montado pelo site.');
  return out.join('\n');
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Link para conversar com a loja sem pedido montado. */
export const whatsappContactUrl = `https://wa.me/${store.whatsapp}`;
