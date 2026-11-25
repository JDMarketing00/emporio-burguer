import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { productById } from '../data/menu';
import { readJSON, writeJSON } from '../lib/storage';
import { cleanSelections, lineKey, round, unitPrice, type CartLine, type Selections } from './cartUtils';

const STORAGE_KEY = 'emporio-burguer:sacola:v1';
const MAX_QTY = 99;

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string, qty: number, selections: Selections, notes: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Recupera a sacola salva, descartando produtos que não existem mais no cardápio. */
function loadLines(): CartLine[] {
  const saved = readJSON<CartLine[]>(STORAGE_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter(
    (l) => l && typeof l.productId === 'string' && productById.has(l.productId) && l.qty > 0,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadLines);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => writeJSON(STORAGE_KEY, lines), [lines]);

  const add = useCallback((productId: string, qty: number, selections: Selections, notes: string) => {
    const sel = cleanSelections(selections);
    const note = notes.trim();
    const key = lineKey(productId, sel, note);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      }
      return [...prev, { key, productId, qty, selections: sel, notes: note }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    let count = 0;
    let subtotal = 0;
    for (const l of lines) {
      const product = productById.get(l.productId);
      if (!product) continue;
      count += l.qty;
      subtotal += unitPrice(product, l.selections) * l.qty;
    }
    return { lines, count, subtotal: round(subtotal), isOpen, open, close, add, setQty, remove, clear };
  }, [lines, isOpen, open, close, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}
