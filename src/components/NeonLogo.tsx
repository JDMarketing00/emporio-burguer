import { useEffect, useMemo, useRef } from 'react';
import { cx } from '../lib/format';
import { hexToRgb, mix, rgba, samplePalette, type RGB } from '../lib/color';

export interface NeonLogoProps {
  text: string;
  /** Paleta do tubo: do núcleo (mais claro) até a névoa externa (mais escuro). */
  colors: string[];
  /** Paleta própria por palavra (opcional). Ex.: [undefined, paletaBranca] deixa a 2ª palavra branca. */
  wordColors?: (string[] | undefined)[];
  /** Cor do vidro do tubo apagado. */
  baseColor?: string;
  /** Intensidade do brilho (0–1). */
  heat?: number;
  /** Tamanho do halo (multiplicador). */
  radius?: number;
  /** Quanto o brilho externo se espalha (0–1). */
  softness?: number;
  /** "Respiração" do halo (0–1). */
  swell?: number;
  /** Animação em repouso. */
  idle?: 'drift' | 'flicker' | 'pulse' | 'none';
  /** Velocidade das animações. */
  speed?: number;
  /** Clique reacende o letreiro. */
  igniteOnClick?: boolean;
  /** Escala do texto. */
  scale?: number;
  /** As letras perto do cursor esquentam. */
  interactive?: boolean;
  /** Liga piscando quando aparece na tela. */
  intro?: boolean;
  className?: string;
}

type Events = [number, boolean][];

/** Sequência de acendimento: cada letra pisca 1 a 3 vezes antes de firmar. */
function flickerPlan(count: number, duration: number): Events[] {
  return Array.from({ length: count }, () => {
    const events: Events = [];
    let t = Math.random() * duration * 0.65;
    const blinks = 1 + Math.floor(Math.random() * 3);
    for (let b = 0; b < blinks; b++) {
      events.push([t, true]);
      t += 30 + Math.random() * 70;
      events.push([t, false]);
      t += 40 + Math.random() * 110;
    }
    events.push([t, true]);
    return events;
  });
}

function litAt(events: Events | undefined, elapsed: number): boolean {
  if (!events) return true;
  let on = false;
  for (const [t, state] of events) {
    if (elapsed >= t) on = state;
    else break;
  }
  return on;
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function NeonLogo({
  text,
  colors,
  wordColors,
  baseColor = '#f17723',
  heat = 0.5,
  radius = 1.5,
  softness = 0.25,
  swell = 0.1,
  idle = 'drift',
  speed = 1,
  igniteOnClick = false,
  scale = 1,
  interactive = false,
  intro = false,
  className,
}: NeonLogoProps) {
  const root = useRef<HTMLElement | null>(null);
  const spill = useRef<HTMLSpanElement>(null);
  const letters = useRef<HTMLSpanElement[]>([]);

  // Palavras → letras, cada letra com a paleta da sua palavra.
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const palettes = useMemo(() => {
    const main = colors.map(hexToRgb);
    return words.map((_, w) => (wordColors?.[w] ? wordColors[w]!.map(hexToRgb) : main));
  }, [colors, wordColors, words]);
  const letterPalette = useMemo(() => {
    const list: RGB[][] = [];
    words.forEach((word, w) => Array.from(word).forEach(() => list.push(palettes[w])));
    return list;
  }, [words, palettes]);

  // Estado da animação fica fora do React para não re-renderizar a cada quadro.
  const anim = useRef({
    plan: null as Events[] | null,
    planStart: 0,
    burstAt: -1e9,
    brightness: [] as number[],
    pointer: null as { x: number; y: number } | null,
    nextFlicker: 0,
    started: false,
  });

  const ignite = (duration: number, burst: boolean) => {
    const a = anim.current;
    a.plan = flickerPlan(letterPalette.length, duration);
    a.planStart = performance.now();
    if (burst) a.burstAt = a.planStart + duration * 0.9;
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const base = hexToRgb(baseColor);
    const a = anim.current;
    const n = letterPalette.length;
    a.brightness = Array(n).fill(intro ? 0 : 1);
    let raf = 0;
    let visible = false;
    let t0 = performance.now();
    let last = 0;
    const still = reducedMotion();

    const paint = (now: number) => {
      const t = ((now - t0) / 1000) * speed;
      const fs = parseFloat(getComputedStyle(el).fontSize) || 64;
      const swellK = 1 + swell * Math.sin(t * 1.6);
      const unit = fs * 0.016 * radius * (still ? 1 : swellK);
      const spread = 1 + softness * 2;
      const burstK = Math.max(0, 1 - (now - a.burstAt) / 700);

      // Leitura de posições antes das escritas (evita recalcular o layout várias vezes).
      let boosts: number[] | null = null;
      if (interactive && a.pointer) {
        boosts = letters.current.map((span) => {
          const r = span.getBoundingClientRect();
          const dx = a.pointer!.x - (r.left + r.width / 2);
          const dy = a.pointer!.y - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy) / (fs * 1.1);
          return Math.exp(-d * d) * 0.9;
        });
      }

      // Pisca ocasional (modo "flicker").
      if (!still && idle === 'flicker' && now > a.nextFlicker && !a.plan) {
        const i = Math.floor(Math.random() * n);
        const plan: Events[] = Array.from({ length: n }, (_, k) =>
          k === i ? [[0, false], [60, true], [110, false], [190, true]] : [[0, true]],
        );
        a.plan = plan;
        a.planStart = now;
        a.nextFlicker = now + (3500 + Math.random() * 5000) / speed;
      }

      let total = 0;
      letters.current.forEach((span, i) => {
        const pal = letterPalette[i];
        const on = a.plan ? litAt(a.plan[i], now - a.planStart) : true;
        let target = on ? 1 : 0;
        if (idle === 'pulse' && !still) target *= 0.82 + 0.18 * Math.sin(t * 2.2 + i * 0.25);
        target += burstK * 0.6;
        const cur = a.brightness[i] ?? 1;
        a.brightness[i] = on ? cur + (target - cur) * 0.45 : cur * 0.25;
        const b = a.brightness[i];
        total += Math.min(1, b);

        const boost = boosts ? boosts[i] : 0;
        const drift = idle === 'drift' && !still ? 0.1 * Math.sin(t * 0.9 + i * 0.42) : 0;
        const h = Math.min(1.6, heat * 2 * (0.25 + 0.75 * Math.min(1.4, b)) * (1 + boost));
        const lit = Math.min(1, b);

        const glass = rgba(base, 0.22);
        // Núcleo do tubo: tom claro da própria paleta (laranja continua laranja, branco continua branco).
        const hot = mix(samplePalette(pal, 0.3 + drift * 0.5), [255, 255, 255], 0.22);
        const core = mix(mix(base, [20, 10, 4], 0.55), hot, lit);
        span.style.color = rgba(core, 0.35 + 0.65 * lit);
        if (lit < 0.02) {
          // tubo apagado: só o vidro, com um reflexo fraco
          span.style.color = glass;
          span.style.textShadow = `0 0 1px ${rgba(base, 0.35)}`;
          return;
        }
        const layer = (size: number, pos: number, alpha: number) =>
          `0 0 ${(unit * size).toFixed(1)}px ${rgba(samplePalette(pal, pos + drift), alpha * lit)}`;
        span.style.textShadow = [
          layer(0.4, 0.3, 1),
          layer(1.3, 0.4, 0.95),
          layer(3.2, 0.5, 0.85 * h),
          layer(7 * spread, 0.6, 0.7 * h),
          layer(15 * spread, 0.72, 0.55 * h),
          layer(28 * spread, 0.84, 0.4 * h),
        ].join(',');
      });

      if (spill.current) {
        const avg = total / Math.max(1, n);
        spill.current.style.opacity = (avg * Math.min(1, heat * 1.6) * (still ? 1 : 0.85 + 0.15 * swellK)).toFixed(3);
      }

      // Plano de acendimento terminou: volta ao repouso.
      if (a.plan) {
        const end = Math.max(...a.plan.map((ev) => ev[ev.length - 1][0]));
        if (now - a.planStart > end + 50) a.plan = null;
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30 quadros por segundo bastam para o brilho
      last = now;
      paint(now);
    };

    const start = () => {
      if (still) {
        a.brightness.fill(1);
        paint(performance.now());
        return;
      }
      if (!a.started) {
        a.started = true;
        t0 = performance.now();
        if (intro) ignite(1400, false);
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    // Só anima enquanto o letreiro está na tela.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else cancelAnimationFrame(raf);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    paint(performance.now());

    const onResize = () => !visible && paint(performance.now());
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterPalette, baseColor, heat, radius, softness, swell, idle, speed, interactive, intro]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (interactive) anim.current.pointer = { x: e.clientX, y: e.clientY };
  };
  const onPointerLeave = () => {
    anim.current.pointer = null;
  };
  const onClick = () => {
    if (igniteOnClick && !reducedMotion()) ignite(650, true);
  };

  let index = 0;
  const content = (
    <>
      <span className="neon__spill" ref={spill} aria-hidden="true" style={{ background: spillGradient(colors) }} />
      <span className="neon__text" aria-hidden="true">
        {words.map((word, w) => (
          <span className="neon__word" key={`${word}-${w}`}>
            {Array.from(word).map((ch) => {
              const i = index++;
              return (
                <span
                  key={i}
                  className="neon__char"
                  ref={(node) => {
                    if (node) letters.current[i] = node;
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </>
  );

  const style = { '--neon-scale': scale } as React.CSSProperties;
  letters.current.length = letterPalette.length;

  if (igniteOnClick) {
    return (
      <button
        type="button"
        ref={(n) => {
          root.current = n;
        }}
        className={cx('neon', 'neon--button', className)}
        style={style}
        onClick={onClick}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-label={`${text} (letreiro neon, toque para acender)`}
      >
        {content}
      </button>
    );
  }
  return (
    <div
      ref={(n) => {
        root.current = n;
      }}
      className={cx('neon', className)}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      role="img"
      aria-label={text}
    >
      {content}
    </div>
  );
}

/** Luz que o letreiro joga na parede. */
function spillGradient(colors: string[]): string {
  const pal = colors.map(hexToRgb);
  const mid = samplePalette(pal, 0.55);
  const deep = samplePalette(pal, 0.8);
  return `radial-gradient(closest-side, ${rgba(mid, 0.34)}, ${rgba(deep, 0.16)} 55%, transparent 100%)`;
}
