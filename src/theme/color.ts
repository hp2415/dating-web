/** 企微蓝 WeCom primary */
export const PRIMARY = "#267EF0";

export function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(normalized, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixHex(from: string, to: string, ratio: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const mix = a.map((channel, i) => Math.round(channel * (1 - ratio) + b[i] * ratio));
  return `#${mix.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function palette(primary: string, step: 200 | 500 | 600): string {
  if (step === 200) return mixHex(primary, "#ffffff", 0.55);
  if (step === 600) return mixHex(primary, "#000000", 0.22);
  return primary;
}
