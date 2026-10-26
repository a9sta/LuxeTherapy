/**
 * 럭스테라피가 내놓는 값 — 넓이 반분선.
 *   남북 반분선  동서로 뻗어 땅을 북쪽 절반과 남쪽 절반으로 가르는 직선(위도 하나)
 *   동서 반분선  남북으로 뻗어 땅을 동쪽 절반과 서쪽 절반으로 가르는 직선(경도 하나)
 *   교차점       두 직선이 만나는 곳
 *   상자 중앙    땅의 가장 동서·남북 끝을 맞춘 직사각형(경계 상자)의 한가운데
 *   a  교차점이 상자 중앙에서 벗어난 크기(%) × 10, 정수          b  긴 쪽 / 짧은 쪽 × 10, 정수
 *   x  { nl 남북 반분선 길이(m) np 조각 수 · el 동서 반분선 길이 ep 조각 수 · ns 북(+)남(-) % · ew 동(+)서(-) % ·
 *        off 합성 크기 % · long 'n'|'e' · rt 긴 쪽 비 · bw bh 경계 상자 · px py 그림 좌표 · sh 윤곽 · dMax dAvg 소속 동 값 }
 * 순위와 막대 대신 쓰는 선분 길이는 치우침이 큰 쪽이 길다.
 */
import { esc, km2, won, hash } from '../lib/util.mjs';
import { stat } from '../lib/skin.mjs';
import { P } from '../site.mjs';

/** 길이 표기 */
export function fl(a) {
  return a >= 1000 ? `${(Math.round(a / 100) / 10).toFixed(1)}km` : `${Math.round(a).toLocaleString('ko-KR')}m`;
}
export const fm = fl;
/** 퍼센트 표기 — 값이 이미 % 단위 */
export const pc = (v) => `${(Math.round(v * 10) / 10).toFixed(1)}%`;
/** a(×10 정수) → 퍼센트 문자열 */
export const fa = (a) => pc(a / 10);
const rt1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

export const LINE_NAME = { n: '남북 반분선', e: '동서 반분선' };
export const longName = (x) => LINE_NAME[x.long];
export const shortName = (x) => LINE_NAME[x.long === 'n' ? 'e' : 'n'];
export const longLen = (x) => (x.long === 'n' ? x.nl : x.el);
export const shortLen = (x) => (x.long === 'n' ? x.el : x.nl);

/** 북남·동서로 벗어난 크기를 말로 */
export function nsWord(v) {
  if (Math.abs(v) < 0.05) return '남북으로는 어긋남이 없고';
  return `${v > 0 ? '북쪽' : '남쪽'}으로 ${pc(Math.abs(v))}`;
}
export function ewWord(v) {
  if (Math.abs(v) < 0.05) return '동서로는 어긋남이 없습니다';
  return `${v > 0 ? '동쪽' : '서쪽'}으로 ${pc(Math.abs(v))}`;
}
export const shiftWord = (x) => {
  const n = Math.abs(x.ns) < 0.05, e = Math.abs(x.ew) < 0.05;
  if (n && e) return '상자 중앙과 어긋남 없이 겹친 자리';
  if (n) return `상자 중앙에서 ${x.ew > 0 ? '동쪽' : '서쪽'}으로만 ${pc(Math.abs(x.ew))} 벗어난 자리`;
  if (e) return `상자 중앙에서 ${x.ns > 0 ? '북쪽' : '남쪽'}으로만 ${pc(Math.abs(x.ns))} 벗어난 자리`;
  return `상자 중앙에서 ${x.ns > 0 ? '북쪽' : '남쪽'}으로 ${pc(Math.abs(x.ns))}, ${x.ew > 0 ? '동쪽' : '서쪽'}으로 ${pc(Math.abs(x.ew))} 벗어난 자리`;
};
/** 여덟 방향 중 하나로 */
export function dir8(x) {
  const ns = Math.abs(x.ns) < 0.05 ? 0 : x.ns > 0 ? 1 : -1, ew = Math.abs(x.ew) < 0.05 ? 0 : x.ew > 0 ? 1 : -1;
  if (Math.abs(x.ns) > 2.4 * Math.abs(x.ew)) return ns > 0 ? '북쪽' : '남쪽';
  if (Math.abs(x.ew) > 2.4 * Math.abs(x.ns)) return ew > 0 ? '동쪽' : '서쪽';
  if (!ns && !ew) return '중앙';
  return `${ns > 0 ? '북' : '남'}${ew > 0 ? '동' : '서'}쪽`;
}
export function dirSent(x) {
  const d = dir8(x);
  return d === '중앙' ? '땅의 무게는 상자 정중앙에 모여 있습니다' : `땅의 무게는 상자 중앙에서 ${d}으로 기울어 있습니다`;
}
export function pieceWord(n, e) {
  if (n <= 1.05 && e <= 1.05) return '두 선 모두 한 줄로 이어집니다';
  if (n > 1.05 && e > 1.05) return '두 선 모두 땅 안에서 끊깁니다';
  return n > 1.05 ? '남북 반분선은 끊기고 동서 반분선은 이어집니다' : '동서 반분선은 끊기고 남북 반분선은 이어집니다';
}
export function lenCmp(x) {
  if (x.rt < 1.05) return '두 반분선의 길이는 사실상 같습니다';
  return `${longName(x)}이 ${shortName(x)}보다 ${rt1(x.rt)}배 깁니다`;
}

export const CLS_ORDER = ['centre', 'near', 'drift', 'far', 'edge', 'wide', 'tall'];
export const CLS_NAME = {
  centre: '정중앙형', near: '살짝 어긋난형', drift: '꽤 어긋난형', far: '많이 어긋난형', edge: '가장자리형', wide: '동서로 긴형', tall: '남북으로 긴형',
};
export const clsName = (k) => CLS_NAME[k] || '꽤 어긋난형';
export const CLS_TALK = {
  centre: '교차점이 상자 중앙에서 2.5% 미만으로만 벗어나, 땅의 무게와 상자의 한가운데가 거의 한 점에서 만나는 유형입니다',
  near: '교차점이 상자 중앙에서 2.5% 이상 5% 미만 벗어나, 한복판 근처이지만 정확히 겹치지는 않는 유형입니다',
  drift: '교차점이 상자 중앙에서 5% 이상 9% 미만 벗어나, 땅의 무게가 한쪽 구석 방향으로 기운 유형입니다',
  far: '교차점이 상자 중앙에서 9% 이상 14% 미만 벗어나, 상자만 보고 짐작한 가운데와 실제 가운데가 뚜렷하게 갈리는 유형입니다',
  edge: '교차점이 상자 중앙에서 14% 이상 벗어나, 무게가 상자 가장자리 쪽에 몰려 가운데가 텅 비어 보이는 유형입니다',
  wide: '두 반분선 가운데 남북 반분선이 1.8배 이상 길어, 땅이 동서로 길게 누운 유형입니다',
  tall: '두 반분선 가운데 동서 반분선이 1.8배 이상 길어, 땅이 남북으로 길게 선 유형입니다',
};
export const clsTalk = (k) => CLS_TALK[k] || CLS_TALK.drift;
export const CLS_SHORT = {
  centre: '상자 중앙과 교차점이 겹침', near: '중앙 근처에서 만남', drift: '한쪽 구석으로 기움', far: '중앙과 뚜렷이 떨어짐', edge: '가장자리에서 만남', wide: '남북 반분선이 훨씬 김', tall: '동서 반분선이 훨씬 김',
};
export const CLS_HEAD = {
  centre: '교차점이 상자 중앙에 겹치는', near: '교차점이 중앙 근처에서 만나는', drift: '교차점이 한쪽으로 기운', far: '교차점이 중앙에서 많이 떨어진',
  edge: '교차점이 가장자리에 놓인', wide: '동서로 길게 누운', tall: '남북으로 길게 선',
};
export function pieceNote(x) {
  return pieceWord(x.np, x.ep);
}
export function cmpAvg(v, o) {
  const d = v / Math.max(0.1, o);
  if (d > 0.93 && d < 1.07) return '평균과 맞먹는 크기';
  return d > 1 ? '평균을 웃도는 크기' : '평균에 못 미치는 크기';
}

const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive, tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: `${won(Math.min(...courses.map((c) => c.price)))}원`,
});

export function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  const x = s.x;
  const avgOff = g.spots.reduce((t, u) => t + u.x.off, 0) / g.spots.length;
  return {
    ...baseCtx(cfg, courses, `${g.name} ${s.name}`),
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    nl: fl(x.nl), el: fl(x.el), np: x.np, ep: x.ep, bw: fl(x.bw), bh: fl(x.bh),
    off: pc(x.off), offN: x.off, shift: shiftWord(x), dir: dir8(x), ns: x.ns, ew: x.ew,
    rtS: rt1(x.rt), rtN: x.rt, longN: longName(x), shortN: shortName(x), longL: fl(longLen(x)), shortL: fl(shortLen(x)),
    lenCmp: lenCmp(x), pieceW: pieceNote(x),
    clsN: clsName(s.cls), clsT: clsTalk(s.cls), clsK: s.cls,
    rank: s.rank, gRank: s.gRank, bRank: s.bRank, allSpots: counts.spot, guN: g.spotCount,
    far: g.hi, farV: fa(g.hiV), near: g.lo, nearV: fa(g.loV),
    bHi: g.bHi, bHiV: rt1(g.bHiV / 10), bLo: g.bLo, bLoV: rt1(g.bLoV / 10),
    avg: pc(avgOff), cmpAvg: cmpAvg(x.off, avgOff), bigger: s.gRank - 1, smaller: g.spotCount - s.gRank, dirSent: dirSent(x),
    clsSame: (g.clsCount[s.cls] || 1) - 1, clsRest: g.spotCount - (g.clsCount[s.cls] || 1),
    guOff: pc(g.x.off), guLong: longName(g.x), guRt: rt1(g.x.rt),
  };
}

export function guCtx(ctx, sd, g, mode) {
  const { cfg, courses } = ctx;
  const x = g.x;
  return {
    ...baseCtx(cfg, courses, `${sd.name} ${g.name}`),
    sido: sd.name, name: g.name, gu: g.name, mode, mainSite: g.main,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area), nl: fl(x.nl), el: fl(x.el), np: x.np, ep: x.ep, bw: fl(x.bw), bh: fl(x.bh),
    off: pc(x.off), shift: shiftWord(x), dir: dir8(x), dirSent: dirSent(x),
    rtS: rt1(x.rt), longN: longName(x), shortN: shortName(x), lenCmp: lenCmp(x), pieceW: pieceNote(x),
    clsN: clsName(g.cls), clsT: clsTalk(g.cls),
    far: g.hi || '', farV: g.hiV ? fa(g.hiV) : '', near: g.lo || '', nearV: g.loV ? fa(g.loV) : '',
    dMax: x.dMax != null ? pc(x.dMax) : '', dAvg: x.dAvg != null ? pc(x.dAvg) : '',
    kinCount: g.kinCount,
  };
}

export function sidoCtx(ctx, sd) {
  const { cfg, courses } = ctx;
  const x = sd.x;
  return {
    ...baseCtx(cfg, courses, sd.name),
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    off: pc(sd.avgA / 10), avgOff: pc(sd.avgA / 10), shift: shiftWord(x), dir: dir8(x), dirSent: dirSent(x),
    nl: fl(x.nl), el: fl(x.el), nlMax: fl(x.nlMax), elMax: fl(x.elMax), rtS: rt1(x.rt), longN: longName(x), shortN: shortName(x),
    farName: sd.hiName, farV: fa(sd.hiV), nearName: sd.loName, nearV: fa(sd.loV),
    clsN: clsName(sd.cls), single: sd.gu.length === 1,
  };
}

/* ── 반분선 그림 ──────────────────────────────────────────────────
   점선 상자는 땅의 가장 동서·남북 끝을 맞춘 직사각형, 속이 채워진 도형이 땅이다.
   가로로 긋는 굵은 선이 남북 반분선, 세로로 긋는 선이 동서 반분선이며 두 선이 만나는 동그라미가 교차점이다.
   상자 중앙의 작은 네모에서 교차점까지 이어지는 화살표가 치우침이다. */
export function plan(u, { mini = false, label = '' } = {}) {
  const x = u.x;
  const sh = x.sh || { w: 1000, h: 700, r: [] };
  const W = mini ? 112 : 280, H = mini ? 70 : 168;
  const pad = mini ? 8 : 20;
  const sc = Math.min((W - pad * 2) / sh.w, (H - pad * 2 - (mini ? 0 : 12)) / sh.h);
  const ox = (W - sh.w * sc) / 2, oy = pad + (mini ? 0 : 2) + ((H - pad * 2 - (mini ? 0 : 12)) - sh.h * sc) / 2;
  const X = (v) => (ox + v * sc).toFixed(1);
  const Y = (v) => (oy + (sh.h - v) * sc).toFixed(1);
  const px = x.px != null ? x.px : sh.w / 2 + (x.ew || 0) * sh.w / 100;
  const py = x.py != null ? x.py : sh.h / 2 + (x.ns || 0) * sh.h / 100;
  const shape = sh.r.map((r) => { let d = ''; for (let i = 0; i < r.length; i += 2) d += `${i ? 'L' : 'M'}${X(r[i])} ${Y(r[i + 1])}`; return `${d}Z`; }).join('');
  const cx = sh.w / 2, cy = sh.h / 2;
  const dist = Math.hypot((px - cx) * sc, (py - cy) * sc);
  const arrow = dist > (mini ? 3 : 5)
    ? `<path d="M${X(cx)} ${Y(cy)}L${X(px)} ${Y(py)}" class="${P}-pl-ar"${mini ? '' : ` marker-end="url(#${P}-ah)"`}/>` : '';
  const r = mini ? 3 : 4.6;
  const txt = mini ? '' : `<text x="${ox.toFixed(1)}" y="${(H - 3).toFixed(1)}" class="${P}-pl-t">가로선 남북 반분선 · 세로선 동서 반분선</text><text x="${(W - 4).toFixed(1)}" y="${(oy - 4).toFixed(1)}" class="${P}-pl-t" text-anchor="end">북</text>`;
  const defs = mini ? '' : `<defs><marker id="${P}-ah" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8Z" class="${P}-pl-ah"/></marker></defs>`;
  const svg = `<svg class="${P}-pl-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label || `교차점은 ${shiftWord(x)}에 놓임`)}">${defs}`
    + `<rect x="${ox.toFixed(1)}" y="${oy.toFixed(1)}" width="${(sh.w * sc).toFixed(1)}" height="${(sh.h * sc).toFixed(1)}" class="${P}-pl-bx"/>`
    + (shape ? `<path d="${shape}" class="${P}-pl-land"/>` : '')
    + `<path d="M${ox.toFixed(1)} ${Y(py)}H${(ox + sh.w * sc).toFixed(1)}" class="${P}-pl-hl"/>`
    + `<path d="M${X(px)} ${oy.toFixed(1)}V${(oy + sh.h * sc).toFixed(1)}" class="${P}-pl-vl"/>`
    + `<rect x="${(+X(cx) - 2.6).toFixed(1)}" y="${(+Y(cy) - 2.6).toFixed(1)}" width="5.2" height="5.2" class="${P}-pl-ct"/>`
    + arrow
    + `<circle cx="${X(px)}" cy="${Y(py)}" r="${r}" class="${P}-pl-dot"/>${txt}</svg>`;
  return mini ? `<span class="${P}-pl ${P}-pl-mini">${svg}</span>` : svg;
}
export function device(u, cap) {
  return `<figure class="${P}-pl">${plan(u)}<figcaption>${cap}</figcaption></figure>`;
}

/* ── 사실 표 ─────────────────────────────────────────────────── */
export function spotFacts(ctx, sd, g, s, c) {
  const x = s.x;
  const caps = [
    `${esc(s.name)} 땅을 반반으로 가른 두 직선입니다. 굵은 가로선이 북쪽과 남쪽의 넓이를 맞추는 자리이고, 세로선이 동쪽과 서쪽의 넓이를 맞추는 자리입니다.`,
    `점선 상자 한가운데의 작은 네모는 겉모양만 보고 짐작한 가운데이고, 동그라미는 넓이로 따진 가운데입니다. 두 점이 떨어질수록 화살표가 길어집니다.`,
    `상자 모양이 같아도 땅이 한쪽으로 부풀면 교차점이 그쪽으로 끌려갑니다. ${esc(s.name)}의 교차점은 ${esc(c.shift)}에 놓였습니다.`,
    `선이 땅 바깥으로 나간 부분은 길이에 넣지 않았고, 땅 안에서 이어진 구간만 더했습니다.`,
  ];
  const cap = `<p>${caps[parseInt(hash(s.name, 'cap').substr(0, 3), 16) % caps.length]}</p>`;
  return device(s, cap) + stat([
    ['소속', `<a href="/${sd.slug}/">${esc(sd.full)}</a> › <a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
    ['남북 반분선', `${c.nl}<small>${x.np <= 1 ? '땅 안에서 한 줄로 이어집니다' : `땅 안에서 ${x.np}토막으로 나뉩니다`}</small>`],
    ['동서 반분선', `${c.el}<small>${x.ep <= 1 ? '땅 안에서 한 줄로 이어집니다' : `땅 안에서 ${x.ep}토막으로 나뉩니다`}</small>`],
    ['긴 쪽', `${c.longN}<small>${esc(c.lenCmp)}</small>`],
    ['교차점의 자리', `${esc(c.shift)}<small>북쪽과 동쪽을 +로 놓은 값은 ${x.ns > 0 ? '+' : ''}${pc(x.ns)}, ${x.ew > 0 ? '+' : ''}${pc(x.ew)}입니다</small>`],
    ['치우침', `${c.off}<small>상자 크기 대비 두 방향을 합친 크기입니다</small>`],
    ['경계 상자', `동서 ${c.bw} × 남북 ${c.bh}<small>넓이 ${c.area}의 땅이 이 안에 들어 있습니다</small>`],
    ['분류', `${esc(c.clsN)}<small>${esc(CLS_SHORT[c.clsK] || '')}</small>`],
    ['치우침 순서', `${esc(g.name)} ${g.spotCount}곳 중 큰 쪽에서 ${c.gRank}번째<small>수록한 ${ctx.counts.spot}곳 중 ${c.rank}번째</small>`],
    ['긴 쪽 비 순서', `${ctx.counts.spot}곳 중 ${s.bRank}번째`],
  ]);
}

export function guFacts(ctx, sd, g, mode, c) {
  const x = g.x;
  const cap = `<p>${esc(g.name)}에 속한 읍·면·동 땅을 한 덩이로 놓고 그 전체를 반반으로 갈랐습니다. 소속 동 값을 평균 낸 것이 아니라 덩어리 하나에 직선 두 개를 그은 결과입니다.</p>`;
  const rows = [
    ['속한 시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 전체', `${g.dongCount}구역`],
    mode === 'spot' ? ['쪽을 둔 동', `${g.spotCount}구역`]
      : mode === 'rural' ? ['동 정거장', '없음<small>동이 없고 읍·면만 이어진 군이어서 이 한 장이 종점입니다</small>']
        : ['화면 깊이', '시군구에서 끝<small>동 이름은 이 화면 아래쪽 이름표에 있습니다</small>'],
    ['정거장이 없는 읍·면', g.ruralCount ? `${g.ruralCount}곳<small>${g.eupCount && g.myeonCount ? `읍 ${g.eupCount}곳과 면 ${g.myeonCount}곳` : g.eupCount ? `읍 ${g.eupCount}곳` : `면 ${g.myeonCount}곳`}은 이름만 적었고 접수는 그대로 받습니다</small>` : '없음'],
    ['남북 반분선', `${c.nl}<small>${x.np <= 1 ? '한 줄로 이어집니다' : `${x.np}토막으로 나뉩니다`}</small>`],
    ['동서 반분선', `${c.el}<small>${x.ep <= 1 ? '한 줄로 이어집니다' : `${x.ep}토막으로 나뉩니다`}</small>`],
    ['교차점의 자리', esc(c.shift)],
    ['치우침', `${c.off}<small>땅 전체를 한 덩이로 잰 값입니다</small>`],
    ['분류', `${esc(c.clsN)}<small>${esc(c.clsT)}</small>`],
    ['비슷하게 어긋난 시군구', g.kin.length > 1 ? `${esc(g.kin[0].gu)} · ${esc(g.kin[1].gu)}<small>그 밖에 ${g.kinCount - 2}곳이 더 이어집니다</small>` : g.kin.length ? esc(g.kin[0].gu) : '없음'],
    ['땅 넓이', c.area],
  ];
  if (mode === 'spot' && g.hi) {
    rows.splice(7, 0,
      ['가장 크게 치우친 동', `<a href="/${sd.slug}/${g.slug}/${g.hiSlug}/">${esc(g.hi)}</a><small>${fa(g.hiV)}</small>`],
      ['가장 작게 치우친 동', `<a href="/${sd.slug}/${g.slug}/${g.loSlug}/">${esc(g.lo)}</a><small>${fa(g.loV)}</small>`],
      ['동 값의 평균', `${c.dAvg}<small>동 하나하나의 치우침을 평균한 값입니다</small>`]);
  }
  return device(g, cap) + stat(rows);
}

export function sidoDevice(sd) {
  const cap = `<p>${esc(sd.name)}${sd.main ? '의 동' : '에서 다루는 시군구'}들이 지닌 치우침의 평균을 한 장에 그렸습니다. 선과 점은 평균 방향을 가리키며 특정 땅의 윤곽은 아닙니다.</p>`;
  return device({ x: { ns: sd.x.ns, ew: sd.x.ew, off: sd.x.off } }, cap);
}

export function sidoFacts(ctx, sd, c) {
  const link = (nm, slug) => (sd.main ? esc(nm) : `<a href="/${sd.slug}/${slug}/">${esc(nm)}</a>`);
  const x = sd.x;
  return sidoDevice(sd) + stat([
    ['행정 명칭', esc(sd.full)],
    ['화면이 닿는 깊이', sd.main ? '동까지' : '시군구까지'],
    ['시군구', `${sd.gu.length}곳`],
    ['행정동 전체', `${sd.dongCount}구역`],
    sd.main ? ['쪽을 둔 동', `${sd.spotCount}구역`] : ['동 이름', '시군구 화면 속 이름표로만 적었습니다'],
    ['정거장 없는 읍·면', sd.ruralCount ? `${sd.ruralCount}곳<small>이름표는 소속 시군구 화면에 있습니다</small>` : '없음'],
    [sd.main ? '동 평균 치우침' : '시군구 평균 치우침', `${c.avgOff}<small>평균 교차점은 ${esc(c.shift)}에 놓입니다</small>`],
    ['평균 반분선 길이', `남북 ${c.nl} · 동서 ${c.el}<small>${sd.main ? '동' : '시군구'} 하나가 지니는 평균입니다</small>`],
    [sd.main ? '가장 크게 치우친 동' : '가장 크게 치우친 시군구', `${link(sd.hiName, sd.hiSlug)}<small>${fa(sd.hiV)}</small>`],
    [sd.main ? '가장 작게 치우친 동' : '가장 작게 치우친 시군구', `${link(sd.loName, sd.loSlug)}<small>${fa(sd.loV)}</small>`],
  ]);
}

/* ── 고르기·묶기 ─────────────────────────────────────────────── */
export const chip = (u) => pc(u.x ? u.x.off : u.a / 10);
export const barRef = (g) => Math.max(...g.spots.map((s) => s.a), 1);
export const barW = (s, ref) => Math.max(3, Math.round((s.a / Math.max(1, ref)) * 100));
export const near = (s, o) => (o.cls === s.cls ? 0 : 1e12) + Math.abs(o.a - s.a);
export const themePrefer = (u) => [`c${u.cls}`];

export function themeDefs(noun) {
  const defs = CLS_ORDER.map((k) => ({
    k: `c${k}`, t: `${CLS_HEAD[k]} ${noun}`, f: (u) => u.cls === k,
    sort: (a, b) => a.a - b.a, m: (u) => pc(u.x.off),
  }));
  defs.push({ k: 'most', t: `교차점이 상자 중앙에서 가장 멀리 벗어난 ${noun}`, f: (u) => !!u.x, sort: (a, b) => b.a - a.a, m: (u) => pc(u.x.off) });
  defs.push({ k: 'least', t: `교차점이 상자 중앙에 가장 가까운 ${noun}`, f: (u) => !!u.x, sort: (a, b) => a.a - b.a, m: (u) => pc(u.x.off) });
  defs.push({ k: 'longest', t: `반분선이 유독 길게 이어지는 ${noun}`, f: (u) => !!u.x, sort: (a, b) => Math.max(b.x.nl, b.x.el) - Math.max(a.x.nl, a.x.el), m: (u) => fl(Math.max(u.x.nl, u.x.el)) });
  defs.push({ k: 'shortest', t: `반분선이 짧게 끝나는 ${noun}`, f: (u) => !!u.x, sort: (a, b) => Math.max(a.x.nl, a.x.el) - Math.max(b.x.nl, b.x.el), m: (u) => fl(Math.max(u.x.nl, u.x.el)) });
  defs.push({ k: 'north', t: `교차점이 북쪽으로 벗어난 ${noun}`, f: (u) => u.x.ns >= 3, sort: (a, b) => b.x.ns - a.x.ns, m: (u) => `북쪽 ${pc(u.x.ns)}` });
  defs.push({ k: 'south', t: `교차점이 남쪽으로 벗어난 ${noun}`, f: (u) => u.x.ns <= -3, sort: (a, b) => a.x.ns - b.x.ns, m: (u) => `남쪽 ${pc(-u.x.ns)}` });
  defs.push({ k: 'east', t: `교차점이 동쪽으로 벗어난 ${noun}`, f: (u) => u.x.ew >= 3, sort: (a, b) => b.x.ew - a.x.ew, m: (u) => `동쪽 ${pc(u.x.ew)}` });
  defs.push({ k: 'west', t: `교차점이 서쪽으로 벗어난 ${noun}`, f: (u) => u.x.ew <= -3, sort: (a, b) => a.x.ew - b.x.ew, m: (u) => `서쪽 ${pc(-u.x.ew)}` });
  defs.push({ k: 'broken', t: `반분선이 땅 안에서 끊기는 ${noun}`, f: (u) => u.x.np > 1 || u.x.ep > 1, sort: (a, b) => (b.x.np + b.x.ep) - (a.x.np + a.x.ep), m: (u) => `${u.x.np <= 1 ? '한 줄' : `${u.x.np}토막`} · ${u.x.ep <= 1 ? '한 줄' : `${u.x.ep}토막`}` });
  return defs;
}

export function pickUnits(sd) {
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => a.s.a - b.s.a || a.s.name.localeCompare(b.s.name, 'ko'));
    const top = all.slice(0, 18);
    const mx = Math.max(...top.map((x) => x.s.a), 1);
    return top.map((x) => ({ href: `/${sd.slug}/${x.g.slug}/${x.s.slug}/`, name: `${x.g.name} ${x.s.name}`, val: pc(x.s.x.off), w: Math.max(3, Math.round((x.s.a / mx) * 100)) }));
  }
  const top = sd.gu.slice().sort((a, b) => a.a - b.a || a.name.localeCompare(b.name, 'ko')).slice(0, 12);
  const mx = Math.max(...top.map((g) => g.a), 1);
  return top.map((g) => ({ href: `/${sd.slug}/${g.slug}/`, name: g.name, val: pc(g.x.off), w: Math.max(3, Math.round((g.a / mx) * 100)) }));
}
