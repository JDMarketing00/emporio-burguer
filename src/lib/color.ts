/** Utilitários de cor usados pelos efeitos (neon e carrossel). */

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function rgba(c: RGB, alpha = 1): string {
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
}

/** Amostra uma paleta (do claro ao escuro) numa posição 0..1, interpolando. */
export function samplePalette(palette: RGB[], x: number): RGB {
  if (palette.length === 1) return palette[0];
  const p = Math.max(0, Math.min(1, x)) * (palette.length - 1);
  const i = Math.floor(p);
  const j = Math.min(palette.length - 1, i + 1);
  return mix(palette[i], palette[j], p - i);
}
