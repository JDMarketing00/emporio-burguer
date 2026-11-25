import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, products, productsIn } from '../data/menu';
import { cx, plural } from '../lib/format';
import { useReveal } from '../lib/hooks';
import { CloseIcon, SearchIcon } from './Icons';
import { ProductCard } from './ProductCard';

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

  // Destaca a categoria visível enquanto a pessoa rola.
  useEffect(() => {
    if (q) return;
    const sections = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [q]);

  // Mantém o botão da categoria ativa visível na faixa rolável.
  useEffect(() => {
    const chip = navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    const bar = navRef.current;
    if (!chip || !bar) return;
    const left = chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2;
    bar.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  const goTo = (id: string) => {
    setQuery('');
    setActive(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

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

      <div className="catnav">
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
