import { useEffect, useRef } from 'react';
import { useCart } from '../cart/CartContext';
import { heroProductId, productById } from '../data/menu';
import { store } from '../data/store';
import { formatBRL, img } from '../lib/format';
import { scrollToId, useMinuteTick } from '../lib/hooks';
import { getOpenStatus } from '../lib/hours';
import { useUI } from '../lib/ui';
import { ClockIcon, DeliveryIcon, PlusIcon } from './Icons';

export function Hero() {
  const hero = productById.get(heroProductId)!;
  const { openProduct, notify } = useUI();
  const { count, open } = useCart();
  const stage = useRef<HTMLDivElement>(null);
  useMinuteTick();
  const status = getOpenStatus();

  // Profundidade discreta: a foto acompanha o ponteiro (somente mouse, sem movimento reduzido).
  useEffect(() => {
    const el = stage.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.setProperty('--px', x.toFixed(3));
        el.style.setProperty('--py', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const startOrder = () => {
    if (count > 0) {
      open();
    } else {
      scrollToId('cardapio');
      notify('Escolha seus itens e finalize pela sacola.');
    }
  };

  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero__inner wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">
            {store.tagline} · {store.address.district}, {store.city}
          </p>
          <h1 className="hero__title" id="hero-title">
            <span>Pão de batata.</span>
            <span>Blend na chapa.</span>
            <span className="hero__title-accent">Cheddar caseiro.</span>
          </h1>
          <p className="hero__lead">
            Hambúrgueres artesanais, batatas e combos para dividir. Monte seu pedido aqui e finalize pelo
            WhatsApp da loja.
          </p>
          <div className="hero__cta">
            <a className="btn btn--primary btn--lg" href="#cardapio">
              Ver cardápio
            </a>
            <button type="button" className="btn btn--ghost btn--lg" onClick={startOrder}>
              Fazer pedido
            </button>
          </div>
          <ul className="hero__facts" aria-label="Informações de entrega">
            <li className={status.open ? 'is-open' : 'is-closed'}>
              <i className="dot" aria-hidden="true" />
              {status.label}
            </li>
            <li>
              <DeliveryIcon />
              Entrega R$ {store.delivery.feeMin}–{store.delivery.feeMax}
            </li>
            <li>
              <ClockIcon />
              {store.delivery.timeMin}–{store.delivery.timeMax} min
            </li>
          </ul>
        </div>

        <div className="hero__stage" ref={stage}>
          <div className="hero__glow" aria-hidden="true" />
          <img
            className="hero__img"
            src={img('brand/hero-smash-cheddar.webp')}
            alt={`${hero.name}: ${hero.description}`}
            width={790}
            height={512}
            fetchPriority="high"
            decoding="async"
          />
          <button type="button" className="hero__tag" onClick={() => openProduct(hero.id)}>
            <span className="hero__tag-name">{hero.name}</span>
            <span className="hero__tag-price">{formatBRL(hero.price)}</span>
            <span className="hero__tag-add" aria-hidden="true">
              <PlusIcon />
            </span>
            <span className="sr-only">Ver detalhes e adicionar</span>
          </button>
        </div>
      </div>
    </section>
  );
}
