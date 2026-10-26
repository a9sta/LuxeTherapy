/**
 * 럭스테라피가 재는 값 — 넓이 반분선.
 *   동 땅을 동서로 뻗은 선으로 가르되 위쪽(북)과 아래쪽(남)의 넓이가 정확히 같아지는 자리를 이분법으로 찾는다 → 남북 반분선.
 *   남북으로 뻗은 선으로 가르되 동쪽과 서쪽의 넓이가 같아지는 자리를 같은 방식으로 찾는다 → 동서 반분선.
 *   a  교차점(두 반분선이 만나는 점)이 땅 경계 상자 중앙에서 벗어난 크기(%, 상자 가로세로 대비) × 10, 정수
 *   b  두 반분선 중 긴 쪽이 짧은 쪽의 몇 배인지 × 10, 정수
 *   v  [a, b, 동서 반분선 길이(m)]
 *   x  { nl 남북 반분선이 땅 안에서 지나는 길이(m, 조각이 여럿이면 합), np 조각 수, el 동서 반분선 길이, ep 조각 수,
 *        ns 교차점이 상자 중앙에서 북(+)·남(-)으로 벗어난 %, ew 동(+)·서(-)으로 벗어난 %, off 두 값의 합성 크기 %,
 *        long 긴 쪽('n' 남북 반분선 | 'e' 동서 반분선), rt 긴 쪽 / 짧은 쪽, bw·bh 경계 상자의 동서·남북 길이(m),
 *        px·py 그림용 교차점 좌표,
 *        sh 그림용 윤곽 { w, h, r:[[x,y,x,y,…]…] } — 가장 긴 변을 1000 으로 맞춘 좌표, y 는 남쪽에서 잰다. }
 * 시군구는 소속 땅 전체를 한 덩이로 재고(동이 있으면 동 값의 최대·평균을 덧붙인다), 시도는 다루는 단위들의 평균을 쓴다.
 */
import { run, signedArea } from './geo-common.mjs';

const CLASSES = ['centre', 'near', 'drift', 'far', 'edge', 'wide', 'tall'];
const r1 = (n) => Math.round(n * 10) / 10;
const r10 = (n) => Math.round(n / 10) * 10;

/** 고리들을 (u,v) 평면에서 반시계(바깥)·시계(구멍)로 맞춘 간선 목록 */
function edgesOf(rings, swap) {
  const E = [];
  for (const r of rings) {
    let pts = swap ? r.pts.map((p) => [p[1], p[0]]) : r.pts;
    const sa = signedArea(pts);
    const wantPos = r.outer;
    if ((sa > 0) !== wantPos) pts = pts.slice().reverse();
    for (let i = 0, n = pts.length; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      if (a[1] === b[1]) continue;
      E.push(a[1] < b[1] ? [a[0], a[1], b[0], b[1], 1] : [b[0], b[1], a[0], a[1], -1]);
    }
  }
  return E;
}

/** 간선 목록으로 v 가 y 이하인 쪽 넓이 */
function areaBelow(E, y) {
  let A = 0;
  for (const [x0, y0, x1, y1, s] of E) {
    if (y <= y0) continue;
    const t = Math.min(y, y1);
    const xt = x0 + ((t - y0) * (x1 - x0)) / (y1 - y0);
    A += s * ((x0 + xt) / 2) * (t - y0);
  }
  return A;
}

/** v = y 인 직선이 땅 안에서 지나는 구간들(u 오름차순) */
function spansAt(E, y) {
  const xs = [];
  for (const [x0, y0, x1, y1] of E) {
    if (y0 <= y && y < y1) xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
  }
  xs.sort((p, q) => p - q);
  const sp = [];
  for (let i = 0; i + 1 < xs.length; i += 2) {
    if (sp.length && xs[i] - sp[sp.length - 1][1] < 5) sp[sp.length - 1][1] = xs[i + 1];
    else sp.push([xs[i], xs[i + 1]]);
  }
  return sp;
}

/** 넓이를 반으로 가르는 v 값과 그 직선의 길이·조각 수 */
function bisect(rings, swap) {
  const E = edgesOf(rings, swap);
  let lo = Infinity, hi = -Infinity;
  for (const e of E) { if (e[1] < lo) lo = e[1]; if (e[3] > hi) hi = e[3]; }
  const total = areaBelow(E, hi + 1);
  let a = lo, b = hi;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (areaBelow(E, m) < total / 2) a = m; else b = m;
  }
  const y = (a + b) / 2;
  let sp = spansAt(E, y);
  if (!sp.length) sp = spansAt(E, y + 0.01);
  const len = sp.reduce((s, q) => s + (q[1] - q[0]), 0);
  return { y, len, pieces: Math.max(1, sp.length) };
}

function boxOf(rings) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const r of rings) {
    if (r.minX < minX) minX = r.minX; if (r.maxX > maxX) maxX = r.maxX;
    if (r.minY < minY) minY = r.minY; if (r.maxY > maxY) maxY = r.maxY;
  }
  return { minX, maxX, minY, maxY };
}

function dp(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [i, j] = st.pop();
    let md = 0, mk = -1;
    const [ax, ay] = pts[i], [bx, by] = pts[j];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
    for (let k = i + 1; k < j; k++) {
      const d = Math.abs(dy * (pts[k][0] - ax) - dx * (pts[k][1] - ay)) / L;
      if (d > md) { md = d; mk = k; }
    }
    if (md > tol && mk > 0) { keep[mk] = 1; st.push([i, mk], [mk, j]); }
  }
  return pts.filter((_, i) => keep[i]);
}

function outline(rings, box, tolPct, minAreaPct, cap) {
  const w = box.maxX - box.minX, h = box.maxY - box.minY, m = Math.max(w, h) || 1;
  const sc = 1000 / m;
  const total = rings.filter((r) => r.outer).reduce((s, r) => s + r.area, 0) || 1;
  const outer = rings.filter((r) => r.outer && r.area / total >= minAreaPct).sort((p, q) => q.area - p.area).slice(0, cap);
  const out = outer.map((r) => {
    let far = 1, fd = -1;
    for (let i = 1; i < r.pts.length; i++) {
      const d = Math.hypot(r.pts[i][0] - r.pts[0][0], r.pts[i][1] - r.pts[0][1]);
      if (d > fd) { fd = d; far = i; }
    }
    const A = dp(r.pts.slice(0, far + 1), m * tolPct);
    const B = dp(r.pts.slice(far).concat([r.pts[0]]), m * tolPct);
    const s = A.concat(B.slice(1, -1));
    const flat = [];
    for (const p of s) flat.push(Math.round((p[0] - box.minX) * sc), Math.round((p[1] - box.minY) * sc));
    return flat;
  }).filter((f) => f.length >= 6);
  return { w: Math.round(w * sc), h: Math.round(h * sc), r: out, sc };
}

function pack(rings, tier) {
  const box = boxOf(rings);
  const bw = box.maxX - box.minX, bh = box.maxY - box.minY;
  const ns = bisect(rings, false);   // 남북 반분선 — y 값(위도 쪽)
  const ew = bisect(rings, true);    // 동서 반분선 — x 값(경도 쪽)
  const dN = ((ns.y - (box.minY + bh / 2)) / (bh || 1)) * 100;
  const dE = ((ew.y - (box.minX + bw / 2)) / (bw || 1)) * 100;
  const off = Math.hypot(dN, dE);
  const lg = ns.len >= ew.len ? 'n' : 'e';
  const rt = Math.max(ns.len, ew.len) / Math.max(1, Math.min(ns.len, ew.len));
  const sh = outline(rings, box, tier === 'spot' ? 0.008 : 0.016, tier === 'spot' ? 0.002 : 0.015, tier === 'spot' ? 8 : 24);
  const px = Math.round((ew.y - box.minX) * sh.sc), py = Math.round((ns.y - box.minY) * sh.sc);
  const { sc, ...shape } = sh;
  return {
    v: [Math.round(off * 10), Math.round(rt * 10), r10(ew.len)],
    a: Math.round(off * 10), b: Math.round(rt * 10),
    x: {
      nl: r10(ns.len), np: ns.pieces, el: r10(ew.len), ep: ew.pieces,
      ns: r1(dN), ew: r1(dE), off: r1(off), long: lg, rt: r1(rt),
      bw: r10(bw), bh: r10(bh), px, py,
      sh: shape,
    },
  };
}

const api = {
  CLASSES,
  META: {
    source: '경계 자료는 admdongkor 행정동 경계(CC BY 4.0)를 쓰고, 국가공간정보포털 원본을 이 저장소에서 다듬어 사용합니다.',
    axis: '넓이 반분선 — 동 땅을 반반으로 가르는 두 직선이 어디서 만나고, 그 점이 경계 상자 중앙에서 얼마나 벗어나는가',
    method: '행정동 경계를 시도별 평면에 올린 뒤 동서로 뻗은 직선을 위아래로 밀어 북쪽과 남쪽의 넓이가 같아지는 자리를 이분법으로 찾고, 남북으로 뻗은 직선을 좌우로 밀어 동쪽과 서쪽의 넓이가 같아지는 자리도 찾습니다. 각 직선이 땅 안에서 이어지는 길이를 더하고, 두 직선의 교차점이 경계 상자 중앙에서 북남과 동서로 상자 크기의 몇 %만큼 벗어났는지 적습니다. 시군구는 소속 읍·면·동을 한 덩이로 놓고 같은 방식으로 재며, 시도는 다루는 단위들의 평균을 씁니다.',
    coverageFrom: '동마다 쪽을 내는 곳은 서울·인천·경기·부산이고, 대전·대구·울산과 광주 광산구, 고른 시·군은 시군구 쪽 하나로 받습니다. 읍·면은 쪽 없이 시군구 목록에 이름만 올립니다.',
    params: { bisect: 'area-half', iterations: 60, merge: '5m' },
  },
  measureSpot(rec) { return pack(rec.rings, 'spot'); },
  measureGu({ rings, list }) {
    const m = pack(rings, 'gu');
    const ds = list.filter((d) => d.ok && d.x);
    if (ds.length) {
      m.x.dMax = Math.max(...ds.map((d) => d.x.off));
      m.x.dAvg = r1(ds.reduce((s, d) => s + d.x.off, 0) / ds.length);
    }
    return m;
  },
  measureSido({ gus, spots, isMain }) {
    const units = isMain ? spots : gus;
    const n = units.length;
    const avg = (f) => units.reduce((s, u) => s + f(u), 0) / n;
    const off = avg((u) => u.x.off), rt = avg((u) => u.x.rt);
    const nl = avg((u) => u.x.nl), el = avg((u) => u.x.el);
    return {
      v: [Math.round(off * 10), Math.round(rt * 10), r10(el)],
      a: Math.round(off * 10), b: Math.round(rt * 10),
      x: {
        nl: r10(nl), el: r10(el), ns: r1(avg((u) => u.x.ns)), ew: r1(avg((u) => u.x.ew)), off: r1(off),
        long: nl >= el ? 'n' : 'e', rt: r1(rt), np: r1(avg((u) => u.x.np)), ep: r1(avg((u) => u.x.ep)),
        nlMax: Math.max(...units.map((u) => u.x.nl)), elMax: Math.max(...units.map((u) => u.x.el)),
      },
    };
  },
  classify(m) {
    const { off, rt, long } = m.x;
    if (rt >= 1.8 && long === 'n') return 'wide';
    if (rt >= 1.8 && long === 'e') return 'tall';
    if (off < 2.5) return 'centre';
    if (off < 5) return 'near';
    if (off < 9) return 'drift';
    if (off < 14) return 'far';
    return 'edge';
  },
  kinDist: (g, o) => Math.abs(g.x.off - o.x.off) * 1.2 + Math.abs(Math.log(g.x.rt / o.x.rt)) * 9 + (g.x.long === o.x.long ? 0 : 1.5) + Math.abs(Math.log(g.area / o.area)) * 1.2,
  extraCounts(spots) {
    const hi = spots.slice().sort((x, y) => y.a - x.a)[0];
    const lo = spots.slice().sort((x, y) => x.a - y.a)[0];
    const lg = spots.slice().sort((x, y) => Math.max(y.x.nl, y.x.el) - Math.max(x.x.nl, x.x.el))[0];
    return { offHi: hi.name, offHiV: hi.x.off, offLo: lo.name, offLoV: lo.x.off, longest: lg.name, longestV: Math.max(lg.x.nl, lg.x.el) };
  },
};

run(api);
