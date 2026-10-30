// A quiet rock grotto behind the curtain: ordinary terrain, water, door transitions and
// a normal reward-site chest. No house, wooden floors, stairs, trees or ambient forest props.
import { N, LH, DIRS, EDGE_CORNERS, OPP, WATER } from '../core/constants.js';
import { idx, hash32 } from '../core/util.js';
import { indexBlockers } from '../core/blockers.js';
import { propMetadata } from '../core/propcatalog.js';
import { createContext } from './context.js';

export function generateWaterfallRoom(spec, outside, entry) {
  const ctx = createContext(spec.seed), floors = [], rocks = [];
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
    const wall = x === 0 || z === 0 || x === N - 1 || z === N - 1;
    const source = x >= 9 && x <= 12 && z >= 1 && z <= 2;
    const channel = source && x === 10;
    const pool = x >= 9 && x <= 12 && z >= 3 && z <= 5;
    const top = wall ? 10 : channel ? 7 : source ? 10 : pool ? 0 : 4;
    const f = ctx.mk(idx(x, z), top, 0, 0);
    Object.assign(f, { cs: Array(4).fill(top * LH), split: 0, id: floors.length,
      fluid: channel || pool ? WATER : 0, surf: channel ? 9 : pool ? 3 : 0,
      waterfallRock: wall || source && !channel });
    // Walk/swim out onto the open floor by a gentle two-cell shore.
    if (pool && z >= 4) {
      const low = z - 4;
      f.cs = [low, low, low + 1, low + 1]; f.top = z === 4 ? 1 : 3;
    }
    ctx.cols[f.c].push(f); floors.push(f);
  }
  for (const f of floors) f.link = DIRS.map(([dx, dz], d) => {
    const x = f.x + dx, z = f.z + dz;
    if (x < 0 || z < 0 || x >= N || z >= N) return null;
    const g = ctx.cols[idx(x, z)][0], [a, b] = EDGE_CORNERS[d], [ga, gb] = EDGE_CORNERS[OPP[d]];
    return f.cs[a] === g.cs[ga] && f.cs[b] === g.cs[gb] ? g : null;
  });
  // Normal cave cutaways open the camera-facing walls, leaving the back and sides visible.
  for (const t of [1.8, 4.9, 8, 11.1, 14.2]) for (const edge of [0.6, N - 0.6]) {
    const height = 4.8 + (Math.round(t) % 3) * 0.15;
    rocks.push({ x: t, z: edge, width: 4.8, depth: 1.5, height, leanX: 0.1, leanZ: 0 });
    rocks.push({ x: edge, z: t, width: 1.5, depth: 4.8, height, leanX: 0, leanZ: 0.1 });
  }
  rocks.push({ x: 9.1, z: 2.1, width: 1.6, depth: 2.4, height: 3.5, leanX: -0.15, leanZ: 0.1 },
    { x: 11.9, z: 2.1, width: 1.8, depth: 2.4, height: 3.3, leanX: 0.2, leanZ: 0 });
  const door = { id: 'out', building: entry.building, to: outside.key,
    x: 10.5, y: 1, z: 3.1, nx: 0, nz: 1, w: 1.2, swim: true };
  const anchor = { x: 8.5, y: 2, z: 8.5, yaw: 0 }, access = { x: 8.5, y: 2, z: 9.5 };
  const floor = floors[idx(8, 8)], approach = floors[idx(8, 9)];
  const site = { id: `${outside.key}:waterfall:${spec.seed}`, seed: hash32(spec.seed ^ 0x51e7),
    prestige: 'uncommon', biome: 'peaks', setting: 'alcove', form: 'alcove', encounter: null,
    spawn: 'treasure', layer: 0, cells: [floor.c], anchor, floor: floor.id, accessFloor: approach.id,
    entryFloor: approach.id, exitFloor: approach.id, approach: access };
  const chest = propMetadata.get('treasure_chest'), s = 0.8;
  const walls = [
    { shape: 'box', x0: 0, z0: 0, x1: 1.35, z1: N, bottom: 0, top: 7.3 },
    { shape: 'box', x0: N - 1.35, z0: 0, x1: N, z1: N, bottom: 0, top: 7.3 },
    { shape: 'box', x0: 0, z0: 0, x1: N, z1: 1.35, bottom: 0, top: 7.3 },
    { shape: 'box', x0: 0, z0: N - 1.35, x1: N, z1: N, bottom: 0, top: 7.3 },
  ];
  const blockers = indexBlockers([...walls,
    { x: anchor.x, z: anchor.z, r: chest.radius * s, bottom: 2, top: 2 + chest.maxY * s }]);
  const placement = { name: 'treasure_chest', ...anchor, s, site: site.id };
  ctx.stats.fluids.push('small grotto waterfall and pool');
  Object.assign(ctx.stats, { layers: 1, mode: 'waterfall grotto', sites: 1 });
  return { seed: spec.seed, key: spec.key, depth: outside.depth, attempts: 1, K: 1, B: [0],
    cols: ctx.cols, floors, pieces: Array.from({ length: N * N }, () => []), runs: [], moves: [], ladders: [],
    falls: [{ c: idx(10, 3), d: 2, top: 9, bot: 3, type: WATER, layer: 0, width: 1.2 }],
    fences: new Map(), fenceList: [], stats: ctx.stats, portals: [], exit: null,
    gateKeys: [null, null, null, null], trialFaces: [null, null, null, null], trial: null, clues: [],
    safe: Uint8Array.from(floors, f => f.waterfallRock ? 0 : 1), kind: 'meadow', archetype: 'plain', biome: 'peaks',
    cave: true, walled: true, enemyFree: true, populationScale: 0, horde: null,
    staticBlockers: blockers, blockers, occluders: walls, rewardSites: [site], siteReservations: [],
    sitePlacements: [placement], authoredProps: [placement], waterfallRocks: rocks,
    siteFailures: [], spots: [], routes: [], doors: [door], waterfallRoom: true,
    roomOutside: { outside: outside.key, building: entry.building },
    rockRoom: { room: { x0: 1.35, z0: 1.35, x1: N - 1.35, z1: N - 1.35 }, wall: 1.35, door: { y: 2 } } };
}
