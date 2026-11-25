import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
}

interface UIContextValue {
  /** Produto aberto no modal de detalhes (null = fechado). */
  productId: string | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;
  toast: ToastMessage | null;
  notify: (text: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [productId, setProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const notify = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), text });
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo(
    () => ({
      productId,
      openProduct: (id: string) => setProductId(id),
      closeProduct: () => setProductId(null),
      toast,
      notify,
    }),
    [productId, toast, notify],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI precisa estar dentro de <UIProvider>');
  return ctx;
}
