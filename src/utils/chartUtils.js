/**
 * Minimal SVG chart primitives for the Nordic Precision views.
 * Pure geometry helpers — no dependencies, deterministic output.
 */

/**
 * Data domain with 10% headroom, clamped to an optional fixed range (gauges).
 */
export function computeDomain(values = [], clampMin = null, clampMax = null) {
  const nums = values.filter((v) => typeof v === 'number' && !isNaN(v));
  let min;
  let max;
  if (nums.length === 0) {
    min = 0;
    max = 100;
  } else {
    min = Math.min(...nums);
    max = Math.max(...nums);
    if (min === max) {
      min -= 5;
      max += 5;
    }
    const span = max - min;
    min -= span * 0.15;
    max += span * 0.15;
  }
  if (clampMin !== null) min = clampMin;
  if (clampMax !== null) max = clampMax;
  return [min, max];
}

/**
 * Maps value list to SVG pixel coordinates inside a width×height box.
 */
export function pointCoords(values = [], width = 300, height = 72, domain = null) {
  const [dmin, dmax] = domain || computeDomain(values);
  const range = dmax - dmin || 1;
  const n = values.length;
  return values.map((v, i) => ({
    x: n === 1 ? width / 2 : (i / (n - 1)) * width,
    y: height - ((v - dmin) / range) * height,
    value: v,
  }));
}

/** Polyline path from coordinates. */
export function toPath(coords = []) {
  return coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ');
}

/** Filled area path (line + baseline close). */
export function toAreaPath(coords = [], height = 72) {
  if (coords.length === 0) return '';
  const first = coords[0];
  const last = coords[coords.length - 1];
  return `${toPath(coords)} L${last.x.toFixed(2)} ${height} L${first.x.toFixed(2)} ${height} Z`;
}

/** Y coordinate for a single value within a domain. */
export function yForValue(value, height, domain) {
  const [dmin, dmax] = domain;
  const range = dmax - dmin || 1;
  return height - ((value - dmin) / range) * height;
}
