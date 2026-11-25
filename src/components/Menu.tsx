import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { categories, products, productsIn } from '../data/menu';
import { cx, plural } from '../lib/format';
import { CATEGORY_EVENT, useReveal } from '../lib/hooks';
import { CloseIcon, SearchIcon } from './Icons';
import { ProductCard } from './ProductCard';

/** Distância (px) abaixo da faixa de categorias em que uma seção passa a ser a ativa. */
const ACTIVATION_OFFSET = 96;

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function Menu() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>(categories[0].id);
  const navRef = useRef<HTMLDivElement>(null);
  const q = normalize(query.trim());

  const results = useMemo(
    () => (q ? products.filter((p) => normalize(`${p.name} ${p.description ?? ''}`).includes(q)) : []),
    [q],
  );

  const revealRef = useReveal<HTMLDivElement>([q]);
  const catnavRef = useRef<HTMLDivElement>(null);
  /**
   * Enquanto a página rola até a categoria clicada, o destaque fica preso nela (sem "piscar" nas do meio).
   * `top` é a posição de destino; a trava só solta ao chegar lá, se a rolagem parar, ou se a pessoa rolar.
   */
  const lock = useRef<{ id: string; top: number } | null>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const pending = useRef<string | null>(null);

  /** Categoria ativa = a última seção cujo topo já passou da linha logo abaixo da faixa de categorias. */
  const computeActive = useCallback(() => {
    const nav = catnavRef.current;
    if (!nav) return;
    const line = nav.getBoundingClientRect().bottom + ACTIVATION_OFFSET;
    let current = categories[0].id;
    for (const c of categories) {
      const el = document.getElementById(c.id);
      if (el && el.getBoundingClientRect().top <= line) current = c.id;
    }
    setActive(current);
  }, []);

  const releaseLock = useCallback(() => {
    window.clearTimeout(settleTimer.current);
    if (lock.current === null) return;
    lock.current = null;
    computeActive();
  }, [computeActive]);

  // Atualiza o destaque ao rolar (a rolagem da página e a das categorias usam o mesmo cálculo).
  useEffect(() => {
    if (q) return;
    let raf = 0;
    const atTarget = () => lock.current !== null && Math.abs(window.scrollY - lock.current.top) <= 2;
    const onScroll = () => {
      if (lock.current !== null) {
        // rolagem automática em andamento: solta ao chegar no destino; se travar no meio, solta depois de 400 ms
        window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(releaseLock, atTarget() ? 60 : 400);
        return;
      }
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          computeActive();
        });
      }
    };
    // O clique dá foco ao botão e o navegador pode disparar um "fim de rolagem" antes de a rolagem começar:
    // por isso o fim de rolagem só solta a trava se a página já estiver no destino.
    const onScrollEnd = () => {
      if (lock.current === null || atTarget()) releaseLock();
    };
    // Se a pessoa assume a rolagem no meio do caminho, o destaque volta a seguir a tela.
    const takeOver = () => releaseLock();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('scrollend', onScrollEnd);
    window.addEventListener('wheel', takeOver, { passive: true });
    window.addEventListener('touchstart', takeOver, { passive: true });
    window.addEventListener('keydown', takeOver);
    computeActive();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchstart', takeOver);
      window.removeEventListener('keydown', takeOver);
    };
  }, [q, computeActive, releaseLock]);

  // Mantém o botão da categoria ativa visível na faixa rolável (celular).
  useEffect(() => {
    const bar = navRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!bar || !chip) return;
    const br = bar.getBoundingClientRect();
    const cr = chip.getBoundingClientRect();
    if (cr.left >= br.left + 8 && cr.right <= br.right - 28) return; // já está à vista
    const left = bar.scrollLeft + (cr.left - br.left) - (br.width - cr.width) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);

  /** Rola até a seção, deixando o título logo abaixo da faixa de categorias. */
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    const nav = catnavRef.current;
    const header = document.querySelector<HTMLElement>('.header');
    if (!el || !nav) return;
    const stuckBottom = (header?.getBoundingClientRect().bottom ?? 0) + nav.getBoundingClientRect().height;
    const maxTop = document.documentElement.scrollHeight - window.innerHeight;
    const top = Math.round(Math.min(maxTop, Math.max(0, el.getBoundingClientRect().top + window.scrollY - stuckBottom + 20)));
    setActive(id);
    window.clearTimeout(settleTimer.current);
    if (Math.abs(window.scrollY - top) <= 2) {
      lock.current = null; // já está na seção
      return;
    }
    lock.current = { id, top };
    // trava de segurança: se a rolagem nem começar, solta o destaque mesmo assim
    settleTimer.current = window.setTimeout(releaseLock, 600);
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [releaseLock]);

  const goTo = useCallback(
    (id: string) => {
      if (q) {
        // saindo da busca: espera as seções voltarem para a tela antes de rolar
        pending.current = id;
        setActive(id);
        setQuery('');
        return;
      }
      scrollToSection(id);
    },
    [q, scrollToSection],
  );

  useEffect(() => {
    if (!q && pending.current) {
      const id = pending.current;
      pending.current = null;
      requestAnimationFrame(() => scrollToSection(id));
    }
  }, [q, scrollToSection]);

  // Outros pontos do site (menu do topo, vitrine) pedem uma categoria por este evento.
  useEffect(() => {
    const onRequest = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (categories.some((c) => c.id === id)) goTo(id);
    };
    window.addEventListener(CATEGORY_EVENT, onRequest);
    return () => window.removeEventListener(CATEGORY_EVENT, onRequest);
  }, [goTo]);

  return (
    <section className="menu" id="cardapio" aria-labelledby="menu-title">
      <div className="wrap menu__head">
        <div>
          <p className="eyebrow">Cardápio completo</p>
          <h2 className="section-title" id="menu-title">
            Escolha o seu
          </h2>
        </div>
        <label className="search">
          <SearchIcon />
          <span className="sr-only">Buscar no cardápio</span>
          <input
            id="busca-cardapio"
            type="search"
            placeholder="Buscar: bacon, cheddar, batata…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button type="button" className="search__clear" onClick={() => setQuery('')} aria-label="Limpar busca">
              <CloseIcon />
            </button>
          )}
        </label>
      </div>

      <div className="catnav" ref={catnavRef}>
        <div className="catnav__inner wrap" ref={navRef} role="navigation" aria-label="Categorias do cardápio">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              data-cat={c.id}
              className={cx('chip', !q && active === c.id && 'chip--active')}
              aria-current={!q && active === c.id ? 'true' : undefined}
              onClick={() => goTo(c.id)}
            >
              {c.name}
              <span className="chip__count">{productsIn(c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="wrap menu__body" ref={revealRef}>
        {q ? (
          <div className="menu__section" aria-live="polite">
            <div className="menu__section-head">
              <h3 className="menu__cat">Resultado da busca</h3>
              <p className="menu__intro">
                {results.length
                  ? `${plural(results.length, 'item encontrado', 'itens encontrados')} para “${query.trim()}”.`
                  : `Nada encontrado para “${query.trim()}”. Tente outro ingrediente.`}
              </p>
            </div>
            <div className="grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          categories.map((c) => {
            const items = productsIn(c.id);
            return (
              <div className="menu__section" id={c.id} key={c.id} aria-labelledby={`${c.id}-title`}>
                <div className="menu__section-head">
                  <h3 className="menu__cat" id={`${c.id}-title`}>
                    {c.name}
                  </h3>
                  {c.intro && <p className="menu__intro">{c.intro}</p>}
                  <span className="menu__count">{plural(items.length, 'opção', 'opções')}</span>
                </div>
                <div
                  className={cx('grid', c.id === 'bebidas' && 'grid--drinks', c.id === 'mais-pedidos' && 'grid--featured')}
                >
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
