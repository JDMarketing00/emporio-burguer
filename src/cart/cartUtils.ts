import { addonGroups } from '../data/addons';
import { productById } from '../data/menu';
import type { AddonGroup, Product } from '../data/types';
import { formatBRL } from '../lib/format';

/** Escolhas de adicionais: { grupo: { opção: quantidade } } */
export type Selections = Record<string, Record<string, number>>;

export interface CartLine {
  key: string;
  productId: string;
  qty: number;
  selections: Selections;
  notes: string;
}

export function groupsOf(product: Product): AddonGroup[] {
  return (product.addonGroups ?? []).map((id) => addonGroups[id]).filter(Boolean);
}

export function addonsTotal(product: Product, selections: Selections): number {
  let total = 0;
  for (const group of groupsOf(product)) {
    const chosen = selections[group.id] ?? {};
    for (const option of group.options) {
      total += (chosen[option.id] ?? 0) * option.price;
    }
  }
  return total;
}

export function unitPrice(product: Product, selections: Selections): number {
  return round(product.price + addonsTotal(product, selections));
}

export function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Remove quantidades zeradas e grupos vazios (para comparar linhas iguais). */
export function cleanSelections(selections: Selections): Selections {
  const out: Selections = {};
  for (const [groupId, opts] of Object.entries(selections)) {
    const kept = Object.entries(opts).filter(([, q]) => q > 0);
    if (kept.length) out[groupId] = Object.fromEntries(kept.sort(([a], [b]) => a.localeCompare(b)));
  }
  return out;
}

export function lineKey(productId: string, selections: Selections, notes: string): string {
  const sel = cleanSelections(selections);
  const ordered = Object.keys(sel)
    .sort()
    .map((g) => `${g}:${Object.entries(sel[g]).map(([o, q]) => `${o}*${q}`).join(',')}`)
    .join('|');
  return `${productId}#${ordered}#${notes.trim().toLowerCase()}`;
}

/** Mensagens de erro por grupo (vazio = tudo certo). */
export function validate(product: Product, selections: Selections): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const group of groupsOf(product)) {
    const chosen = Object.values(selections[group.id] ?? {}).filter((q) => q > 0).length;
    if (group.required && chosen < group.min) {
      errors[group.id] = group.min === 1 ? 'Escolha 1 opção para continuar.' : `Escolha pelo menos ${group.min} opções.`;
    }
  }
  return errors;
}

/** Linhas legíveis com o que foi escolhido, na ordem dos grupos. */
export function describeSelections(product: Product, selections: Selections): string[] {
  const lines: string[] = [];
  for (const group of groupsOf(product)) {
    const chosen = selections[group.id] ?? {};
    for (const option of group.options) {
      const qty = chosen[option.id] ?? 0;
      if (!qty) continue;
      const prefix = qty > 1 ? `${qty}x ` : '';
      if (group.id === 'molhos' || option.price === 0) {
        lines.push(`${prefix}${option.name}`);
      } else {
        lines.push(`+ ${prefix}${option.name} (${formatBRL(option.price * qty)})`);
      }
    }
  }
  return lines;
}

/** Descreve o conteúdo de um combo: "2x SMOKE BURGUER" */
export function describeCombo(product: Product): string[] {
  return (product.combo ?? []).map((part) => {
    const item = productById.get(part.productId);
    return `${part.qty}x ${item?.name ?? part.productId}`;
  });
}
