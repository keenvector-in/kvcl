// WCAG AA (4.5:1) for the text tokens on the surfaces they sit on, read straight from theme.css for
// both brands and both modes, so a palette edit that breaks contrast fails here.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, 'theme.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  const body = css.slice(start, css.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--kv-([\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

type RGBA = [number, number, number, number];
function parse(v: string): RGBA {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m![1].slice(i, i + 2), 16)).concat(1) as RGBA;
  m = v.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
  if (m) return [+m[1], +m[2], +m[3], +m[4]];
  m = v.match(/^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/);
  if (m) {
    const [h, s, l] = [+m[1], +m[2] / 100, +m[3] / 100];
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
    };
    return [f(0), f(8), f(4), 1];
  }
  throw new Error(`unparsed colour ${v}`);
}
// oklab, for the color-mix() tokens (CSS Color 4 matrices).
const lin = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
const unlin = (v: number) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)));
function toOklab([r8, g8, b8]: RGBA) {
  const [r, g, b] = [lin(r8), lin(g8), lin(b8)];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * q, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * q];
}
function fromOklab([L, a, b]: number[]): RGBA {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const q = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    unlin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q),
    unlin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q),
    unlin(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * q),
    1,
  ];
}
const mix = (a: RGBA, pct: number, b: RGBA) => {
  const [x, y] = [toOklab(a), toOklab(b)];
  return fromOklab(x.map((v, i) => v * pct + y[i] * (1 - pct)));
};

const over = ([r, g, b, a]: RGBA, base: RGBA): RGBA => [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a), 1];
const lum = (c: RGBA) =>
  c.slice(0, 3).reduce((sum, v, i) => {
    const x = v / 255;
    return sum + [0.2126, 0.7152, 0.0722][i] * (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  }, 0);
const ratio = (a: RGBA, b: RGBA) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Fallbacks inside var(--kv-x, fallback): the dark defaults for tokens no mode block restates.
const defaults: Record<string, string> = {};
for (const m of css.matchAll(/var\(--kv-([\w-]+), ((?:[^()]|\([^()]*\))+)\)/g)) defaults[m[1]] ??= m[2].trim();
// `--color-<tone>-fg: color-mix(in oklab, var(--kv-<tone>, …) N%, var(--kv-fg …))`
const fgMix: Record<string, number> = {};
for (const m of css.matchAll(/--color-(\w+)-fg: (?:var\(--kv-\w+-fg, )?color-mix\(in oklab, var\(--kv-(\w+),[^)]*\)\)? (\d+)%, var\(--kv-fg/g)) fgMix[m[1]] = +m[3] / 100;

const kvLight = block('[data-kv-mode="light"]');
const kvDark = block('[data-kv-mode="dark"]');
const kpBase = block('[data-kv-brand="keenplaza"],\n[data-kv-brand="keenplaza"] [data-kv-mode="dark"]');
const kpLight = block('[data-kv-brand="keenplaza"][data-kv-mode="light"],\n[data-kv-brand="keenplaza"] [data-kv-mode="light"]');

// Cascade as the browser resolves it on <html data-kv-brand data-kv-mode>.
const palettes = {
  'KeenVector light': { ...defaults, ...kvDark, ...kvLight },
  'KeenVector dark': { ...defaults, ...kvDark },
  'KeenPlaza light': { ...defaults, ...kvDark, ...kvLight, ...kpBase, ...kpLight },
  'KeenPlaza dark': { ...defaults, ...kvDark, ...kpBase },
};

describe('theme contrast (WCAG AA 4.5:1)', () => {
  it('found every tone-fg mix in theme.css', () => {
    expect(Object.keys(fgMix).sort()).toEqual(['accent', 'brand', 'info', 'success', 'warning']);
  });
  for (const [name, p] of Object.entries(palettes)) {
    const page = parse(p.page);
    const bg = (token: string) => over(parse(p[token]), page);
    // DataTable's header row: fg at 2% over the surface.
    const thead = over([...parse(p.fg).slice(0, 3), 0.02] as RGBA, bg('surface'));
    const surfaces: Record<string, RGBA> = { page, surface: bg('surface'), 'surface-2': bg('surface-2'), sunken: bg('sunken'), thead };

    for (const text of ['fg-muted', 'fg-subtle']) {
      for (const [sname, s] of Object.entries(surfaces)) {
        it(`${name}: text-${text} on ${sname}`, () => {
          expect(ratio(parse(p[text]), s)).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
    it(`${name}: text-danger on bg-danger-soft`, () => {
      expect(ratio(parse(p.danger), bg('danger-soft'))).toBeGreaterThanOrEqual(4.5);
    });
    it(`${name}: text-danger on page`, () => {
      expect(ratio(parse(p.danger), page)).toBeGreaterThanOrEqual(4.5);
    });

    // Badge tones: text-<tone>-fg on the tone's tint, over page and surface.
    const fg = parse(p.fg);
    for (const [sname, s] of Object.entries({ page, surface: surfaces.surface })) {
      for (const tone of ['brand', 'accent']) {
        it(`${name}: Badge ${tone} (text-${tone}-fg on ${tone}-500/15 over ${sname})`, () => {
          const c = parse(p[tone]);
          expect(ratio(mix(c, fgMix[tone], fg), over([...c.slice(0, 3), 0.15] as RGBA, s))).toBeGreaterThanOrEqual(4.5);
        });
      }
      for (const tone of ['success', 'warning', 'info']) {
        it(`${name}: Badge ${tone} (text-${tone}-fg on ${tone}-soft over ${sname})`, () => {
          const soft = over(parse(p[`${tone}-soft`]), s);
          expect(ratio(mix(parse(p[tone]), fgMix[tone], fg), soft)).toBeGreaterThanOrEqual(4.5);
        });
      }
      it(`${name}: Badge neutral (text-fg-muted on fg/5 over ${sname})`, () => {
        expect(ratio(parse(p['fg-muted']), over([...fg.slice(0, 3), 0.05] as RGBA, s))).toBeGreaterThanOrEqual(4.5);
      });
      it(`${name}: ErrorState (text-danger and text-fg-muted on danger-soft over ${sname})`, () => {
        const tint = over(parse(p['danger-soft']), s);
        expect(ratio(parse(p.danger), tint)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(parse(p['fg-muted']), tint)).toBeGreaterThanOrEqual(4.5);
      });
    }
    it(`${name}: white on bg-danger-fill (Button danger)`, () => {
      expect(ratio([255, 255, 255, 1], parse(p['danger-fill']))).toBeGreaterThanOrEqual(4.5);
    });
  }
});
