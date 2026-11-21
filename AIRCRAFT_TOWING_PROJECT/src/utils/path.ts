// Polyline route helper with rounded corners, used by the airport map animation.
export type Pt = {x: number; y: number};
export type Route = {pts: Pt[]; cum: number[]; length: number; d: string};

export function buildRoute(points: Pt[], radius = 60, step = 2): Route {
  // build a smoothed list of points: straight segments + quadratic arcs at corners
  const dense: Pt[] = [];
  const push = (p: Pt) => dense.push({x: p.x, y: p.y});
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const startTrim = i === 0 ? 0 : Math.min(radius, segLen / 2);
    const endTrim = i === points.length - 2 ? 0 : Math.min(radius, segLen / 2);
    const ux = (b.x - a.x) / segLen;
    const uy = (b.y - a.y) / segLen;
    const s0 = {x: a.x + ux * startTrim, y: a.y + uy * startTrim};
    const s1 = {x: b.x - ux * endTrim, y: b.y - uy * endTrim};
    const n = Math.max(1, Math.ceil(Math.hypot(s1.x - s0.x, s1.y - s0.y) / step));
    for (let k = 0; k <= n; k++) push({x: s0.x + ((s1.x - s0.x) * k) / n, y: s0.y + ((s1.y - s0.y) * k) / n});
    if (i < points.length - 2) {
      // corner arc around b
      const c = points[i + 2];
      const len2 = Math.hypot(c.x - b.x, c.y - b.y);
      const t2 = Math.min(radius, len2 / 2);
      const e = {x: b.x + ((c.x - b.x) / len2) * t2, y: b.y + ((c.y - b.y) / len2) * t2};
      for (let k = 1; k < 24; k++) {
        const t = k / 24;
        push({
          x: (1 - t) * (1 - t) * s1.x + 2 * (1 - t) * t * b.x + t * t * e.x,
          y: (1 - t) * (1 - t) * s1.y + 2 * (1 - t) * t * b.y + t * t * e.y,
        });
      }
    }
  }
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i].x - dense[i - 1].x, dense[i].y - dense[i - 1].y));
  const d = dense.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return {pts: dense, cum, length: cum[cum.length - 1], d};
}

/** position + heading (degrees, 0 = pointing up/north) at fraction t of the route */
export function pointAt(r: Route, t: number): {x: number; y: number; angle: number} {
  const target = Math.max(0, Math.min(1, t)) * r.length;
  let i = 1;
  while (i < r.cum.length - 1 && r.cum[i] < target) i++;
  const a = r.pts[i - 1];
  const b = r.pts[i];
  const seg = r.cum[i] - r.cum[i - 1] || 1;
  const u = (target - r.cum[i - 1]) / seg;
  // heading from a smoothed look-ahead window
  const j0 = Math.max(0, i - 4);
  const j1 = Math.min(r.pts.length - 1, i + 4);
  const dx = r.pts[j1].x - r.pts[j0].x;
  const dy = r.pts[j1].y - r.pts[j0].y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, angle};
}
