// Low-poly rock faces in the normal stone batch: shared by the freestanding entrance and
// the grotto walls. Physics uses the map's floors/blockers, not a separate scene or engine.
import { C } from './palette.js';
const GREY = C('#777e83');
const ROUGH = [0, 0.21, -0.13, 0.09, -0.07, 0.17, -0.11, 0.05];
export function buildWaterfallRocks(m, layers) {
  for (const r of m.waterfallRocks ?? []) {
    const b = layers[r.layer ?? m.K - 1].stone, base = r.y ?? 2;
    const ring = (k, scale) => Array.from({ length: 8 }, (_, i) => {
      const a = i / 8 * Math.PI * 2;
      return [r.x + (r.leanX ?? 0) * k + Math.cos(a) * r.width / 2 * scale,
        base + r.height * k + ROUGH[i] * k,
        r.z + (r.leanZ ?? 0) * k + Math.sin(a) * r.depth / 2 * scale];
    });
    const rings = [ring(0, 1), ring(0.55, 0.88), ring(1, 0.64)];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 8; i++) {
      const n = (i + 1) % 8, a = (i + 0.5) / 8 * Math.PI * 2;
      b.quad(rings[j][i], rings[j + 1][i], rings[j + 1][n], rings[j][n],
        [Math.cos(a), 0, Math.sin(a)], GREY.clone().multiplyScalar(0.9 + ((i * 3 + j) % 5) * 0.035));
    }
    const top = [r.x + (r.leanX ?? 0), base + r.height, r.z + (r.leanZ ?? 0)];
    for (let i = 0; i < 8; i++) {
      b.tri(top, rings[2][i], rings[2][(i + 1) % 8], GREY, [0, 1, 0]);
      b.tri([r.x, base, r.z], rings[0][(i + 1) % 8], rings[0][i], GREY, [0, -1, 0]);
    }
  }
}
