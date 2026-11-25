const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 23.9 → "R$ 23,90" */
export function formatBRL(value: number): string {
  // Intl usa espaço não separável; trocamos por espaço normal para o WhatsApp.
  return brl.format(value).replace(/ /g, ' ');
}

/** Junta classes ignorando valores falsos. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Caminho de imagem relativo ao index.html (funciona em qualquer pasta de hospedagem). */
export function img(path: string): string {
  return `${import.meta.env.BASE_URL}images/${path}`;
}

export function productImage(name: string): string {
  return img(`products/${name}.webp`);
}

/** Só dígitos. */
export function digits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Máscara de telefone brasileiro: (86) 98897-7712 */
export function maskPhone(value: string): string {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Converte "R$ 50,00" / "50" / "50,5" em número. */
export function parseMoney(value: string): number {
  const clean = value.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
}
