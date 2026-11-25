import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../lib/format';

export interface CarouselItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  /** cylinder = anel completo; arc = meio anel; flat = fileira. */
  preset?: 'cylinder' | 'arc' | 'flat';
  intro?: 'rise' | 'fade' | 'none';
  cardWidth?: number;
  aspectRatio?: number;
  /** Graus por segundo no autoplay "drift". */
  speed?: number;
  captions?: boolean;
  gap?: number;
  /** Inclinação do anel (graus). */
  tilt?: number;
  /** 1 = cilindro completo, 0 = reto. */
  curve?: number;
  perspective?: number;
  autoplay?: 'drift' | 'step' | false;
  /** Segundos entre passos (step) e para voltar a girar depois de uma interação. */
  interval?: number;
  direction?: 'left' | 'right';
  /** Inércia ao soltar depois de arrastar (0–1). */
  momentum?: number;
  snap?: boolean;
  pauseOnHover?: boolean;
  focusOnClick?: boolean;
  draggable?: boolean;
  /** Deslocamento da foto dentro do cartão conforme ele gira (0–1). */
  parallax?: number;
  /** Alarga um pouco os cartões das laterais (0–1). */
  stretch?: number;
  fadeColor?: string;
  /** Escurece os cartões do fundo (0–1). */
  depthFade?: number;
  /** Sombra no lado de dentro do cilindro (0–1). */
  innerShade?: number;
  cornerRadius?: number;
  /** Chamado ao tocar no cartão que já está na frente. */
  onSelect?: (item: CarouselItem, index: number) => void;
  /** Texto do convite no cartão da frente. */
  ctaLabel?: string;
  className?: string;
}

const norm = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function CircularCarousel({
  items,
  preset = 'cylinder',
  intro = 'rise',
  cardWidth = 240,
  aspectRatio = 1,
  speed = 12,
  captions = true,
  gap = 24,
  tilt = 0,
  curve,
  perspective = 2000,
  autoplay = 'drift',
  interval = 3,
  direction = 'left',
  momentum = 0.6,
  snap = true,
  pauseOnHover = true,
  focusOnClick = true,
  draggable = true,
  parallax = 0.3,
  stretch = 0,
  fadeColor = '#111111',
  depthFade = 0.5,
  innerShade = 0.5,
  cornerRadius = 16,
  onSelect,
  ctaLabel = 'Ver no cardápio',
  className,
}: CircularCarouselProps) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLButtonElement[]>([]);
  const [width, setWidth] = useState(0);

  const bend = curve ?? (preset === 'cylinder' ? 1 : preset === 'arc' ? 0.5 : 0.08);

  // Geometria: no celular o cartão encolhe; o anel repete os itens até ficar cheio.
  const geo = useMemo(() => {
    const w = width || 1200;
    const cw = Math.round(Math.min(cardWidth, w * (w < 640 ? 0.5 : 0.56)));
    const ch = Math.round(cw / aspectRatio);
    const pitch = cw + gap;
    const minRadius = Math.max(w * 0.42, cw * 1.6);
    const needed = Math.ceil((2 * Math.PI * minRadius) / pitch);
    const repeats = Math.max(1, Math.ceil(needed / items.length));
    const count = items.length * repeats;
    const ringRadius = (count * pitch) / (2 * Math.PI);
    const radius = ringRadius / Math.max(0.05, bend);
    const step = (360 / count) * Math.max(0.05, bend);
    return { cw, ch, count, radius, step, degPerPx: 180 / (Math.PI * radius) };
  }, [width, cardWidth, aspectRatio, gap, items.length, bend]);

  const motion = useRef({
    angle: 0,
    velocity: 0, // graus por ms
    dragging: false,
    moved: false,
    startX: 0,
    startAngle: 0,
    lastX: 0,
    lastT: 0,
    hover: false,
    resumeAt: 0,
    tween: null as null | { from: number; to: number; start: number; dur: number },
    introStart: -1,
    nextStep: 0,
    visible: false,
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frontIndex = () => {
    const m = motion.current;
    let best = 0;
    let bestAbs = 999;
    for (let i = 0; i < geo.count; i++) {
      const a = Math.abs(norm(i * geo.step + m.angle));
      if (a < bestAbs) {
        bestAbs = a;
        best = i;
      }
    }
    return best;
  };

  const tweenTo = (target: number, dur = 750) => {
    const m = motion.current;
    m.velocity = 0;
    m.tween = { from: m.angle, to: target, start: performance.now(), dur: reducedMotion() ? 1 : dur };
    m.resumeAt = performance.now() + dur + interval * 1000;
  };

  const bringToFront = (i: number) => {
    const m = motion.current;
    const a = norm(i * geo.step + m.angle);
    tweenTo(m.angle - a);
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const m = motion.current;
    const still = reducedMotion();
    const dirSign = direction === 'left' ? -1 : 1;
    let raf = 0;
    let prev = performance.now();
    if (!m.nextStep) m.nextStep = prev + interval * 1000;

    const render = (now: number) => {
      const dt = Math.min(64, now - prev);
      prev = now;

      // 1) movimento
      if (m.tween) {
        const p = Math.min(1, (now - m.tween.start) / m.tween.dur);
        m.angle = m.tween.from + (m.tween.to - m.tween.from) * easeInOut(p);
        if (p >= 1) m.tween = null;
      } else if (!m.dragging && Math.abs(m.velocity) > 0.0005) {
        m.angle += m.velocity * dt;
        m.velocity *= Math.pow(0.94, dt / 16);
        if (Math.abs(m.velocity) <= 0.0005) {
          m.velocity = 0;
          if (snap) tweenTo(Math.round(m.angle / geo.step) * geo.step, 450);
        }
      } else if (!m.dragging && autoplay && !still && !(pauseOnHover && m.hover) && now > m.resumeAt) {
        if (autoplay === 'drift') {
          m.angle += dirSign * speed * (dt / 1000);
        } else if (now > m.nextStep) {
          m.nextStep = now + interval * 1000;
          tweenTo(Math.round(m.angle / geo.step) * geo.step + dirSign * geo.step, 700);
          m.resumeAt = 0;
        }
      }

      // 2) desenho
      const introOn = intro !== 'none' && !still && m.introStart >= 0;
      const introPending = intro !== 'none' && !still && m.introStart < 0;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const a = norm(i * geo.step + m.angle);
        const rad = (a * Math.PI) / 180;
        const cos = Math.cos(rad);
        const depth = (1 - cos) / 2; // 0 frente, 1 fundo
        const sx = 1 + stretch * 0.35 * (1 - Math.abs(cos)) * (cos > 0 ? 1 : 0);

        let lift = 0;
        let alpha = introPending ? 0 : 1;
        if (introOn) {
          const order = Math.abs(a) / 180; // os da frente sobem primeiro
          const p = Math.max(0, Math.min(1, (now - m.introStart - order * 500) / 800));
          const e = easeOut(p);
          lift = intro === 'rise' ? (1 - e) * 160 : 0;
          alpha = e;
        }
        card.style.transform = `translate(-50%, -50%) rotateY(${a.toFixed(2)}deg) translateZ(${geo.radius.toFixed(1)}px) translateY(${lift.toFixed(1)}px) scaleX(${sx.toFixed(3)})`;
        card.style.opacity = alpha.toFixed(3);
        const shade = Math.min(0.92, depthFade * depth + innerShade * Math.max(0, -cos) * 0.7);
        card.style.setProperty('--shade', shade.toFixed(3));
        card.style.setProperty('--front', Math.pow(Math.max(0, cos), 10).toFixed(3));
        card.style.setProperty('--px', `${(-Math.sin(rad) * parallax * 16).toFixed(2)}%`);
        card.style.pointerEvents = cos > 0.2 ? 'auto' : 'none';
      });
    };

    const loop = (now: number) => {
      render(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        m.visible = entry.isIntersecting;
        if (m.visible) {
          if (m.introStart < 0) m.introStart = performance.now() + 120;
          start();
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    render(performance.now());
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, autoplay, speed, direction, interval, snap, pauseOnHover, intro, parallax, stretch, depthFade, innerShade]);

  // ── arrastar ──
  const onPointerDown = (e: React.PointerEvent) => {
    if (!draggable || e.button !== 0) return;
    const m = motion.current;
    m.dragging = true;
    m.moved = false;
    m.tween = null;
    m.velocity = 0;
    m.startX = m.lastX = e.clientX;
    m.startAngle = m.angle;
    m.lastT = performance.now();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const m = motion.current;
    if (!m.dragging) return;
    const dx = e.clientX - m.startX;
    if (!m.moved && Math.abs(dx) > 6) {
      m.moved = true;
      stage.current?.setPointerCapture(e.pointerId);
    }
    if (!m.moved) return;
    const now = performance.now();
    const ddx = e.clientX - m.lastX;
    const dtt = Math.max(1, now - m.lastT);
    m.velocity = m.velocity * 0.6 + ((ddx * geo.degPerPx) / dtt) * 0.4;
    m.lastX = e.clientX;
    m.lastT = now;
    m.angle = m.startAngle + dx * geo.degPerPx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const m = motion.current;
    if (!m.dragging) return;
    m.dragging = false;
    if (stage.current?.hasPointerCapture(e.pointerId)) stage.current.releasePointerCapture(e.pointerId);
    if (m.moved) {
      if (performance.now() - m.lastT > 80) m.velocity = 0;
      m.velocity *= momentum * 1.6;
      m.resumeAt = performance.now() + interval * 1000 + 800;
      if (Math.abs(m.velocity) <= 0.0005 && snap) tweenTo(Math.round(m.angle / geo.step) * geo.step, 450);
    }
  };

  const onCardClick = (i: number, keyboard: boolean) => {
    const m = motion.current;
    if (m.moved) {
      m.moved = false;
      return;
    }
    const real = i % items.length;
    if (keyboard || frontIndex() === i || !focusOnClick) {
      onSelect?.(items[real], real);
    } else {
      bringToFront(i);
    }
  };

  // Setas giram o anel; Tab passa pelas categorias (cada uma vem para a frente).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const m = motion.current;
    const dir = e.key === 'ArrowLeft' ? 1 : -1;
    tweenTo(Math.round(m.angle / geo.step) * geo.step + dir * geo.step, 500);
  };

  const fade = fadeColor;
  cards.current.length = geo.count;

  return (
    <div
      ref={stage}
      className={cx('cc', draggable && 'cc--drag', className)}
      style={
        {
          perspective: `${perspective}px`,
          '--fade': fade,
          '--radius': `${cornerRadius}px`,
        } as React.CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') motion.current.hover = true;
      }}
      onPointerLeave={() => {
        motion.current.hover = false;
      }}
      onKeyDown={onKeyDown}
      role="region"
      tabIndex={0}
      aria-roledescription="carrossel"
      aria-label="Categorias do cardápio"
    >
      <div className="cc__ring" style={{ transform: `rotateX(${tilt}deg)` }}>
        {Array.from({ length: geo.count }, (_, i) => {
          const item = items[i % items.length];
          const copy = i >= items.length;
          return (
            <button
              key={i}
              type="button"
              className="cc__card"
              ref={(node) => {
                if (node) cards.current[i] = node;
              }}
              style={{ width: geo.cw, height: geo.ch }}
              onClick={(e) => onCardClick(i, e.detail === 0)}
              onFocus={(e) => {
                if (!copy && e.currentTarget.matches(':focus-visible') && frontIndex() !== i) bringToFront(i);
              }}
              tabIndex={copy ? -1 : 0}
              aria-hidden={copy || undefined}
              aria-label={[item.title, item.subtitle].filter(Boolean).join(': ')}
            >
              <span className="cc__media">
                <img src={item.src} alt={copy ? '' : item.alt} loading="lazy" decoding="async" draggable={false} />
              </span>
              {captions && (item.title || item.subtitle) && (
                <span className="cc__cap">
                  {item.title && <strong>{item.title}</strong>}
                  {item.subtitle && <span>{item.subtitle}</span>}
                  {onSelect && <em className="cc__cta">{ctaLabel} →</em>}
                </span>
              )}
              <span className="cc__shade" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
