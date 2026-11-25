import { useEffect, useRef, useState, type RefObject } from 'react';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Faz os filhos com [data-reveal] aparecerem ao rolar.
 * Só esconde o que está abaixo da dobra no carregamento — o que já está visível nunca some.
 */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []): RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion() || !('IntersectionObserver' in window)) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const fold = window.innerHeight * 0.92;
    const pending = items.filter((el) => el.getBoundingClientRect().top > fold);
    pending.forEach((el) => el.classList.add('is-pending'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.classList.add('is-in');
            el.classList.remove('is-pending');
            io.unobserve(el);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );
    pending.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      pending.forEach((el) => el.classList.remove('is-pending'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** true depois que a página rolou além de `offset` px. */
export function useScrolled(offset = 12): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

/** Trava a rolagem do fundo enquanto um modal/gaveta está aberto. */
export function useLockBody(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [locked]);
}

/** Fecha com Esc e mantém o foco do teclado dentro do painel. */
export function useDialog(open: boolean, onClose: () => void, panel: RefObject<HTMLElement>): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    const first = focusables()[0];
    (first ?? node)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === 'Tab') {
        const list = focusables();
        if (!list.length) return;
        const a = list[0];
        const b = list[list.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, panel]);
}

/** Recalcula a cada minuto (para o status Aberto/Fechado). */
export function useMinuteTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return tick;
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}
