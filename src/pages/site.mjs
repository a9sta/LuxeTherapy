import { layout, frame, callBox } from '../lib/html.mjs';
import { esc, hash, won, josa, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import * as B from '../lib/blocks.mjs';
import * as SK from '../lib/skin.mjs';
import * as T from '../content/copy.mjs';
import * as M from '../content/metric.mjs';
import { baseCtx } from './region.mjs';
import { POSTS, METHOD_SLUG } from '../content/posts.mjs';
import { P } from '../site.mjs';

const { at, hail, courseRoll, stepCards, stepSet, faqBlock, noticeBlock, postStrip, topicLinks, docTopics,
  siteLinks, longtail, themeCards, spotPool, notes } = B;
const { SEC } = T;
const dt = (ctx, key) => docTopics(ctx, key, at(hash(key, 'dt'), SEC.topicHead, 8), at(hash(key, 'dt'), SEC.topicSub, 3));
const dupGuNames = (regions) => { const c = new Map(); for (const r of regions) for (const g of r.gu) c.set(g.name, (c.get(g.name) || 0) + 1); return new Set([...c].filter(([, n]) => n > 1).map(([k]) => k)); };
/** 한 노선(시도)의 시군구 정거장 — 동명 시군구는 시도 이름을 붙이고 환승 표시를 단다 */
const guLine = (r, dupGu) => {
  const mx = Math.max(...r.gu.map((g) => g.a), 1);
  return SK.map(r.gu.map((g) => ({
    href: `/${r.slug}/${g.slug}/`, name: dupGu.has(g.name) ? `${r.name} ${g.name}` : g.name, val: M.chip(g),
    w: Math.max(3, Math.round((g.a / mx) * 100)), xf: dupGu.has(g.name),
  })));
};
const crumbs2 = (siteUrl, name, path) => [{ name: T.crumb.home, url: `${siteUrl}/` }, { name, url: `${siteUrl}${path}` }];
const allSpots = (regions) => {
  const out = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) out.push({ r, g, s });
  return out;
};
const byDeep = (a, b) => b.s.a - a.s.a || a.s.name.localeCompare(b.s.name, 'ko');

/* ── 종합 안내판(홈) ─────────────────────────────────────────── */
export function homePage(ctx) {
  const dupGu = dupGuNames(ctx.regions);
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const spots = allSpots(regions);
  const far = spots.filter((x) => x.r.slug === 'seoul' && x.s.cls === 'far').sort(byDeep);
  const demo = far[Math.floor(far.length / 2)] || spots.slice().sort(byDeep)[Math.floor(spots.length / 5)];

  const hero = `<div class="${P}-door">
  <p class="${P}-door-sl">${esc(cfg.brand.slogan)}</p>
  <p class="${P}-door-p">점포는 없고 전화를 받으면 알려 준 주소로 관리사를 보냅니다. 서울·인천·경기·부산은 동마다, 대전·대구·울산과 일부 시·군은 시군구마다 화면을 두었는데, 동 정거장이 있는 노선과 시군구에서 끝나는 노선의 차이는 화면의 깊이뿐이고 접수 방식은 같습니다.</p>
  <p class="${P}-door-cta">${callBox(cfg, { size: 'l' })}</p>
  <dl class="${P}-door-f">
    <div><dt>전화 응대</dt><dd>${esc(cfg.hours)}</dd></div>
    <div><dt>정산</dt><dd>${esc(cfg.pay)}</dd></div>
    <div><dt>도착 기준</dt><dd>${esc(cfg.arrive)}</dd></div>
    <div><dt>정거장 수</dt><dd>시군구 ${counts.gu}곳과 동 ${counts.spot}곳</dd></div>
  </dl>
  <figure class="${P}-pl ${P}-pl-big"><p class="${P}-door-cap">견본 정거장 · ${esc(demo.g.name)} ${esc(demo.s.name)}</p>${M.plan(demo.s)}<figcaption><p>도형이 땅이고 점선 상자가 땅의 가장 바깥 끝을 맞춘 직사각형입니다. 가로선은 북쪽 절반과 남쪽 절반의 넓이를 맞추는 자리, 세로선은 동쪽 절반과 서쪽 절반의 넓이를 맞추는 자리이며, 상자 한가운데의 작은 네모에서 두 선이 만나는 동그라미까지 이어진 화살표가 치우침입니다.</p></figcaption></figure>
</div>`;

  const shapes = M.CLS_ORDER.map((k, i) => {
    const hit = spots.filter((x) => x.s.cls === k).sort(byDeep);
    const rep = hit[Math.floor(hit.length / 2)];
    const show = hit.slice(0, 4);
    return `<tr><th scope="row">${rep ? M.plan(rep.s, { mini: true, label: `${M.clsName(k)} 견본` }) : ''}<b>${esc(M.clsName(k))}</b><em>${counts.clsCount[i]}곳</em></th><td><small>${esc(M.clsTalk(k))}</small><ol>${show.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a><b>${M.pc(x.s.x.off)}</b></li>`).join('')}</ol></td></tr>`;
  }).join('\n');
  const shapeBlock = frame('shapes', '치우침 분류 일곱 가지와 견본', `<table class="${P}-sp"><tbody>${shapes}</tbody></table>${SK.note('왼쪽 그림은 분류 안에서 가운데쯤 놓인 동이고 오른쪽 숫자는 그 분류에서 치우침이 가장 큰 네 곳의 값입니다. 분류가 다르다고 좋고 나쁜 것이 갈리지는 않습니다.')}`,
    '일곱 분류는 긴 쪽 비와 치우침 두 숫자로 나눴습니다.');

  const whyBlock = frame('why', '교차점을 기준으로 삼은 이유', SK.lead([
    '이름과 넓이만 적힌 동 지도에서는 땅의 생김새가 잘 떠오르지 않습니다. 넓이를 반으로 가르는 선을 그으면 겉모양으로 짐작한 가운데와 땅이 실제로 쌓인 가운데가 갈리고, 그 어긋남이 땅 모양을 숫자 하나로 말해 줍니다.',
    `치우침이 가장 큰 동은 ${esc(counts.hiName)}(${M.fa(counts.aq.max)}), 가장 작은 동은 ${esc(counts.loName)}(${M.fa(counts.aq.min)})이고 가운데값은 ${M.fa(counts.aq.mid)}입니다.`,
    `행정동 경계 ${counts.featAll}개에 같은 이분법을 돌렸고 다시 돌려도 값은 같습니다. 계산 순서는 <a href="/magazine/${METHOD_SLUG}/">이 수첩</a>에 적었습니다.`,
  ]), null);

  const picker = frame('regions', '노선별로 지역 고르기', `<div class="${P}-lines">${regions.map((r, i) => `<details class="${P}-ln ${P}-l${i + 1}"><summary>${SK.badge(i + 1, `${r.name} 노선`)}<strong>${esc(r.name)}</strong><span>${r.main ? `동 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}</span><em>평균 치우침 ${M.fa(r.avgA)}</em></summary><p class="${P}-x"><a href="/${r.slug}/">${esc(r.name)} 전체 화면으로</a></p>${guLine(r, dupGu)}</details>`).join('\n')}</div>${SK.note('노선을 펼치면 소속 시군구 정거장이 세로선 위에 늘어서고, 정거장 사이 선분이 길수록 그 시군구 땅 전체의 치우침이 큽니다. 같은 이름의 시군구는 시도 이름을 붙이고 환승 표시를 달았습니다. <a href="/area/">노선도 전체</a>도 따로 있습니다.')}`,
    '어느 노선에서 출발하든 값은 같고 접수 방식도 같습니다.');

  const postBlock = frame('note', '전화 전에 읽는 반분선 수첩', `${notes(latestPosts)}${SK.note('<a href="/magazine/">반분선 수첩 전체 목록</a>')}`,
    '체험담은 한 편도 싣지 않았고 통화 직전에 쓸모 있는 글만 모았습니다.');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6);
  const deep = spots.map((x) => ({ label: `${x.g.name} ${x.s.name}`, href: `/${x.r.slug}/${x.g.slug}/${x.s.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스별로 보기', items: courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` })), anchor: T.COURSE_ANCHOR },
    { label: '시도별 코스', items: sidoCourse, pick: 14, anchor: T.COURSE_ANCHOR },
    { label: '동 화면 바로 열기', items: deep, pick: 18, anchor: T.ANCHOR },
    { label: '시군구 화면', items: guList, pick: 16, anchor: T.ANCHOR },
    { label: T.TL.docs, items: T.DOC_LINKS },
  ], seed, at(h, SEC.topicHead, 8), at(h, SEC.topicSub, 3));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true }), noun: T.noun.spot, seedKey: seed,
    heading: at(h, SEC.themeHead, 4), sub: at(h, SEC.themeSub, 5), cards: 6, per: 3,
  });

  const body = [
    hero, picker, whyBlock, courseRoll(courses, seed, '방문지', { full: true }), shapeBlock, stepCards(seed),
    hail(cfg, '지금 계신 곳', seed), faqHtml, postBlock, theme.html, noticeBlock(seed), topics,
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/', title: title.home({ spot: counts.spot }), desc: clampDesc(desc.home()),
      h1: SK.h1(`${esc(cfg.brand.ko)} 출장마사지 홈타이`, `동 ${counts.spot}곳과 시군구 ${counts.gu}곳의 반분선 교차점을 적어 두었습니다`),
      body, pageKind: 'home', crumbs: [{ name: T.crumb.home, url: `${siteUrl}/` }],
      jsonld: [
        S.service({ siteUrl, url: siteUrl + '/', cfg, name: `${cfg.brand.ko} 출장마사지 홈타이 방문`, desc: clampDesc(desc.home()), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.itemList(`${siteUrl}/#sidolist`, '방문 노선(시도)', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.itemList(`${siteUrl}/#themes`, '반분선 모양이 닮은 동 모음', theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 방문을 부탁하는 다섯 단계', steps, cfg),
      ],
    }),
  };
}

/* ── 노선도 ───────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const dupGu = dupGuNames(ctx.regions);
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';
  const open = SK.lead([
    `노선은 시도마다 한 줄이고, 시군구 ${counts.gu}곳이 정거장으로 늘어서며 그 밑으로 동 정거장 ${counts.spot}개가 갈라집니다. 읍 ${counts.eup}곳과 면 ${counts.myeon}곳은 정거장 없이 이름만 올렸어도 접수는 같습니다.`,
    '서울·인천·경기·부산은 시군구 정거장 아래로 동 정거장이 한 층 더 이어지는 데 비해 대전·대구·울산 같은 나머지 노선은 시군구에서 끝나고, 동 이름은 시군구 화면 안의 이름표에만 있습니다. 이용이 몰리는 지역일수록 정거장을 더 잘게 나눈 구성입니다.',
  ]);
  const blocks = regions.map((r, i) => frame(`sd-${r.slug}`, `${r.name} 노선 ${r.main ? `동 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}`,
    `<p class="${P}-x">${SK.badge(i + 1, `${r.name} 노선`)} <a href="/${r.slug}/">${esc(r.name)} 전체 화면으로</a></p>${guLine(r, dupGu)}`,
    r.main
      ? `${r.name} 노선은 시군구 정거장을 고른 뒤 동 이름으로 내려가는 두 단 구조이며, 이름 옆 숫자는 그 시군구 땅 전체의 치우침입니다.`
      : `${r.name}${josa(r.name, '은/는')} 내려갈 수 있는 끝이 시군구 정거장입니다. 행정동 ${r.dongCount}곳은 정거장이 아니라 각 시군구 화면의 이름표로 적었습니다.`,
    `${r.name} 시군구 정거장 ${r.gu.length}곳 펼치기`)).join('\n');
  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4);
  const body = [open, blocks, hail(cfg, '계신 곳', seed), faqHtml, stepCards(seed), postStrip(seed)].join('\n');
  const t = title.areaHub(counts), d = clampDesc(desc.areaHub(counts));
  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/', title: t, desc: d,
      h1: SK.h1('노선도', `시군구 ${counts.gu}곳을 시도 노선별로 묶어 적었습니다`),
      body, pageKind: 'areahub', crumbs: crumbs2(siteUrl, T.crumb.area, '/area/'),
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: t, desc: d, listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '방문 노선(시도)', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 노선도`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' } }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '계신 곳에서 방문을 부탁하는 다섯 단계', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 승차권 종류(코스 항목표) ─────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const byPrice = courses.slice().sort((a, b) => a.price - b.price);
  const byLen = courses.slice().sort((a, b) => a.min - b.min);
  const shortest = byLen[0], longest = byLen[byLen.length - 1];
  const open = SK.lead([
    '코스는 아홉 가지이며 고르는 기준은 시간, 압, 오일 사용 여부 세 가지이고 나머지 취향은 통화에서 맞춥니다.',
    `시간 순으로 세우면 맨 앞이 ${shortest.min}분 ${esc(shortest.ko)}, 맨 뒤가 ${longest.min}분 ${esc(longest.ko)}입니다. 긴 코스라고 이완이 더 깊어지거나 비싼 코스라고 몸에 더 맞는 것은 아니어서 그날의 몸 상태가 기준입니다.`,
  ]);
  const stubs = courseRoll(byLen, seed, '방문지', { full: true });
  const pickBy = frame('bycase', '몸 상태별 고르기', SK.cases(courses), '골랐다가 마음이 바뀌어도 되며 계산은 마지막으로 정한 코스를 따릅니다.');
  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4);
  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const body = [open, stubs, pickBy, faqHtml, hail(cfg, '코스 문의', seed), longtail(pool, seed, 24, '시도별 코스', null), postStrip(seed)].join('\n');
  const t = title.page(`코스 ${courses.length}종 출장마사지 홈타이`);
  const d = clampDesc(`코스 ${courses.length}종의 시간·압·오일 여부를 한 표에 모았습니다. ${won(byPrice[0].price)}원부터 시작하며 부르는 지역이 달라도 금액은 같습니다.`);
  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/', title: t, desc: d,
      h1: SK.h1('승차권 종류', '짧은 코스에서 긴 코스까지 아홉 항목을 늘어놓았습니다'),
      body, pageKind: 'coursehub', crumbs: crumbs2(siteUrl, T.crumb.course, '/course/'),
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: t, desc: d, listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/course/`, cfg, name: `${cfg.brand.ko} 승차권 종류`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 운임표 ───────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const top = sorted[sorted.length - 1].price;
  const open = SK.lead([
    '코스마다 값은 하나씩만 정해져 있고, 표에 없는 이름의 요금을 요구하는 연락은 저희가 보낸 것이 아닙니다.',
    '외진 골목과 차로 한 시간 들어가는 마을 사이에도 같은 코스에는 같은 값이 붙습니다. 오가는 수고는 저희 몫이어서 계산에 넣지 않습니다.',
  ]);
  const ladder = frame('tbl', '운임이 낮은 코스부터', `${SK.ladder(sorted, top)}${SK.note('맨 오른쪽 숫자가 코스 금액이고, 시간과 압에 대한 풀이는 각 코스 화면에서 이어집니다.')}`,
    '시간이 늘어난다고 값을 덧붙이는 방식은 쓰지 않으며, 정한 코스는 약속한 분량을 끝까지 채운 뒤에 끝냅니다.');
  const noExtra = frame('nox', '운임에 붙지 않는 항목', SK.ck([
    '멀리 간다는 이유로 얹는 교통비', '자정이 지났다는 이유로 얹는 시간대 할증', '명절과 공휴일에 얹는 가산', '예약금이나 보증금 같은 선입금', '약속을 옮기거나 거둘 때 떼는 수수료', '차를 세우는 데 드는 주차 요금',
  ], true), '선입금을 달라는 문자나 전화는 저희가 보낸 것이 아닙니다.');
  const pay = frame('how', '계산하는 방법', SK.stat([
    ['시점', '관리가 끝난 그 자리'], ['수단', '현금과 카드 모두 가능'], ['영수증', '요청할 때 바로 발급'],
    ['시간을 늘릴 때', '접수 때 말해 두면 늘린 시간분만 더함'], ['둘이 함께 받을 때', '각자의 코스 값을 따로 합산하며 동반 할인은 없음'],
  ]), null);
  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4);
  const d = clampDesc(`코스별 시간과 운임을 한 장에 적었습니다. ${won(sorted[0].price)}원부터이고 교통비·심야 할증·예약금 없이 관리 뒤 현금이나 카드로 냅니다.`);
  const body = [open, ladder, noExtra, pay, faqHtml, hail(cfg, '운임 문의', seed), postStrip(seed), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');
  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/', title: title.page(`운임표 ${won(sorted[0].price)}원부터`), desc: d,
      h1: SK.h1('운임표', `${won(sorted[0].price)}원에서 ${won(top)}원 사이가 전부입니다`),
      body, pageKind: 'price', crumbs: crumbs2(siteUrl, T.crumb.price, '/price/'),
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스 운임표`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 승차 안내 ───────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';
  const open = SK.lead(['처음 전화하는 사람이 막히기 쉬운 대목만 골라 항목으로 만들었습니다. 접수는 전화 한 번으로 끝나므로 끝까지 읽지 않아도 접수에는 지장이 없습니다.']);
  const what = frame('need', '방에 마련해 둘 것', `${SK.ck([
    '누울 곳 하나: 침대와 방바닥 어느 쪽이든 같습니다', '수건 두 장: 기름을 쓰는 코스는 두 장, 쓰지 않는 코스는 한 장입니다', '문이 닫히는 방: 식구가 같이 있는지는 따지지 않습니다',
  ])}${SK.note('매트와 오일과 향초는 관리사의 짐에 들어 있어서 따로 살 물건은 없습니다.')}`, null);
  const timing = frame('when', '전화는 언제 걸어도 되는지', SK.stat([
    ['응대 시간', `${esc(cfg.hours)}<small>자정이 지나도 울리는 번호는 낮과 같습니다</small>`],
    ['도착 기준', `${esc(cfg.arrive)}<small>안쪽 골목의 집은 큰길가보다 조금 더 걸립니다</small>`],
    ['시각을 옮길 때', '출발 전이면 횟수에 상관없이 무료로 바꿉니다'],
    ['접수를 거둘 때', '관리사가 이미 현관 앞에 와 있다면 그 사실만 알립니다'],
    ['전화가 몰리는 때', '금요일 한밤과 일요일 해 질 녘'],
    ['비교적 한산한 때', '평일 낮에는 통화가 끝나는 즉시 길에 오르는 경우가 많습니다'],
  ]), null);
  const refuse = frame('no', '접수가 어려운 경우', SK.ck([
    '음란한 말이 오가면 통화를 끊고 접수를 거절합니다', '몸에 열이 오르거나 상처가 부어 있으면 날짜를 바꾸라고 안내합니다', '호수를 빼고 알려 준 주소에는 찾아갈 수 없습니다',
    '관리사의 개인 연락처를 묻는 요청은 들어주지 않습니다', '병원이 먼저인 통증이면 진료를 앞세우라고 안내합니다', '만 19세에 못 미치면 사정을 따지지 않고 접수하지 않습니다',
  ], true), '통화가 접수로 이어지지 않은 경우에는 어떤 비용도 청구하지 않습니다.');
  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '방문지'), 6);
  const d = clampDesc('준비물, 응대 시간, 접수를 받지 못하는 경우, 계산 방법을 처음 거는 사람의 눈높이에서 순서대로 적었습니다.');
  const body = [open, what, timing, stepCards(seed), refuse, faqHtml, hail(cfg, '첫 이용', seed), noticeBlock(seed), postStrip(seed), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');
  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/', title: title.page('처음 이용하는 사람을 위한 승차 안내'), desc: d,
      h1: SK.h1('승차 안내', '통화를 마치면 접수가 끝납니다'),
      body, pageKind: 'guide', crumbs: crumbs2(siteUrl, T.crumb.guide, '/guide/'),
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 이용할 때 거치는 다섯 단계', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 승차 안내`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' } }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';
  const classLine = M.CLS_ORDER.map((k, i) => `${M.clsName(k)} ${counts.clsCount[i]}곳`).join(' · ');
  const open = SK.lead([
    `${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 점포 없이 방문으로만 일합니다. 여러 업소를 줄 세워 고르게 하는 목록과 달리 전화를 받는 사람과 찾아가는 사람이 한 팀으로 움직입니다.`,
    '이름의 럭스는 넉넉하고 고급스럽다는 뜻이며, 서두르지 않고 충분한 시간을 쓰겠다는 약속을 담았습니다. 화면마다 적힌 반분선은 계산해서 얻은 숫자만 싣겠다는 원칙을 눈에 보이게 만든 장치이기도 합니다.',
  ]);
  const line = frame('line', '하는 일과 하지 않는 일', SK.ck([
    '하는 일: 손과 팔로 굳은 근육을 푸는 방문 관리, 이 한 가지', '하지 않는 일: 성적인 서비스이며 이름을 바꿔 요청해도 결과는 같습니다', '하지 않는 일: 병명을 단정하거나 낫게 해 주겠다고 약속하는 일이며, 진단과 치료는 병원의 몫입니다',
    '접수하지 않는 연령: 만 19세 미만', '싣지 않는 것: 후기와 별점이며 진짜인지 가릴 길이 없어서입니다', '싣지 않는 것: 사람 사진이며 실제로 오는 사람과 달라질 수 있어서입니다', '받지 않는 돈: 관리사가 도착하기 전에 먼저 내라고 하는 모든 돈',
  ]), null);
  const how = frame('data', '넓이 반분선을 찾은 순서', `${SK.lead([
    `공개된 행정동 경계 ${counts.featAll}개를 시도별 평면 좌표로 옮기고 각 경계의 넓이를 구했습니다. 동서로 뻗은 직선을 아래에서 위로 밀어 올리며 직선 아래쪽 넓이를 재다가 전체의 절반이 되는 자리를 찾았는데, 한 번에 맞히지 못해 구간을 반씩 줄여 가는 이분법을 60번 되풀이했습니다.`,
    '남북으로 뻗은 직선도 같은 방식으로 좌우로 밀어 동쪽과 서쪽의 넓이가 같아지는 자리를 찾았습니다. 두 직선이 땅 안에서 지나는 길이는 경계와 만나는 점을 짝지어 더한 뒤 10m 단위로 적었고, 선이 땅을 드나들면 토막 수도 함께 셌습니다.',
    '교차점이 경계 상자 중앙에서 북남과 동서로 상자 크기의 몇 %만큼 벗어났는지 재어 합친 값을 치우침으로, 두 선 가운데 긴 쪽을 짧은 쪽으로 나눈 값을 긴 쪽 비로 적었습니다. 시군구는 읍·면·동 땅을 한 덩이로 놓고 같은 방식으로 쟀습니다.',
    `분류는 일곱 가지이고 ${esc(classLine)}입니다. 치우침이 가장 큰 동은 ${esc(counts.hiName)}(${M.fa(counts.aq.max)}), 가장 작은 동은 ${esc(counts.loName)}(${M.fa(counts.aq.min)})입니다.`,
    '이 수치는 지도 위 모양에서만 나왔으니 도로 사정이나 이동 시간과는 거리가 멀고, 경계 자료가 단순화되어 있어 실제 선과 조금 어긋날 수 있습니다.',
  ])}${SK.stat([
    ['자료 판본', esc(data.version)],
    ['계산 방식', '경계 다각형의 넓이가 반으로 갈리는 위도와 경도를 이분법 60회로 좁혀 구함'],
    ['남긴 값', '두 반분선의 길이와 토막 수, 교차점의 치우침, 긴 쪽 비'],
    ['표기 단위', '길이 10m, 치우침 0.1%'],
    ['화면 구조', `노선 ${counts.sido}개 → 시군구 정거장 ${counts.gu}개 → 동 정거장 ${counts.spot}개`],
    ['정거장 없이 이름만 올린 곳', `읍 ${counts.eup}곳과 면 ${counts.myeon}곳<small>소속 시군구 화면의 이름표로 확인합니다</small>`],
    ['가장 크게 치우친 동', esc(counts.hiName)],
    ['가장 작게 치우친 동', esc(counts.loName)],
  ])}`, null);
  const d = clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 화면의 반분선과 교차점을 어떤 자료와 순서로 얻었는지 밝혔습니다.`);
  const body = [open, line, how, hail(cfg, '문의', seed), postStrip(seed), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');
  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/', title: title.page(`${cfg.brand.ko} 소개`), desc: d,
      h1: SK.h1(`${esc(cfg.brand.ko)} 소개`, '지키는 선과 반분선을 찾은 순서'),
      body, pageKind: 'company', crumbs: crumbs2(siteUrl, T.crumb.company, '/company/'),
      jsonld: [S.aboutPage({ url: `${siteUrl}/company/`, siteUrl, title: title.page(`${cfg.brand.ko} 소개`), desc: d })],
    }),
  };
}

/* ── 이용 약관 ───────────────────────────────────────────────── */
const TERMS = (b) => [
  ['제1조 (목적)', `이 약관은 ${b}(이하 "회사")가 이용자가 정한 장소로 관리사를 보내 관리를 제공할 때 지킬 조건과 절차를 정하고, 회사와 이용자 양쪽의 책임이 어디까지인지 밝히려고 마련했습니다.`],
  ['제2조 (접수가 성립하는 때)', '접수는 전화 통화 하나로만 성립합니다. 화면의 번호로 연결되어 코스와 주소와 방문 시각이 서로 맞아야 하며, 글과 메일과 채팅으로 온 요청은 접수로 치지 않습니다.'],
  ['제3조 (관리의 범위)', '관리사는 이용자가 알린 장소에서 손으로 굳은 근육을 풀어 주는 일만 합니다. 병을 가려내거나 고치는 의료 행위와 성적인 행위는 어떤 경우에도 맡지 않습니다.'],
  ['제4조 (이용 연령)', '만 19세가 되어야 이용할 수 있습니다. 보호자가 함께 있어도 만 19세 미만이면 접수하지 않습니다.'],
  ['제5조 (화면의 숫자)', '화면에 적힌 반분선 길이, 교차점의 치우침, 긴 쪽 비와 분류 이름은 공개된 행정동 경계 좌표를 계산해 얻은 값입니다. 이동 시간이나 도로 사정을 보증하는 수치가 아니고 땅의 모양을 가늠하는 참고 자료로만 제공합니다.'],
  ['제6조 (금액과 계산 방법)', '금액은 운임표에 적힌 값이며 지역에 따라 달라지지 않습니다. 계산은 관리를 마친 자리에서 현금이나 카드로 하고, 예약금과 보증금 같은 선입금은 이름이 무엇이든 받지 않습니다.'],
  ['제7조 (시각 변경과 접수 철회)', '관리사가 출발하기 전이라면 시각을 바꾸든 접수를 취소하든 위약금이 없습니다. 이미 문 앞에 도착한 뒤에는 그 사실을 즉시 알려야 합니다.'],
  ['제8조 (접수 거절과 중단)', '성적인 행위를 요구할 때, 관리사에게 욕설이나 폭력을 쓰거나 사적인 연락처를 계속 캐물을 때, 방문할 방의 호수를 끝까지 알리지 않을 때, 열이나 덜 아문 상처 탓에 관리를 받기에 무리가 있을 때에는 접수를 거절하거나 하던 관리를 중단합니다.'],
  ['제9조 (이용자가 준비할 사항)', '이용자는 누울 자리와 수건을 마련하고 관리에 영향을 줄 건강 상태를 통화 중에 밝혀야 합니다. 쉽게 멍드는 체질이라면 경락 코스를 확정하기 전에 말해야 합니다.'],
  ['제10조 (후기와 별점)', '이 사이트에는 후기를 적는 칸도 별점을 매기는 칸도 없습니다. 화면에 실린 글 가운데 특정 이용자의 체험을 옮긴 것은 한 줄도 없습니다.'],
  ['제11조 (도중에 멈출 때)', '이용자의 뜻이나 건강 문제로 관리가 중단되면 지나간 시간까지만 셉니다. 시작 후 10분 안에 멈추면 비용이 없고, 제8조 사유로 회사가 멈춘 경우에는 그때까지의 시간을 계산에 넣습니다.'],
  ['제12조 (손해배상)', '회사의 잘못으로 관리 도중 손해가 생기면 회사가 배상하는 데 비해, 이용자가 숨긴 건강 상태 때문에 생긴 손해와 천재지변이나 통신 장애에 따른 지연은 배상 대상이 아닙니다.'],
  ['제13조 (약관 변경)', '약관이 바뀔 때는 개정 내용을 화면에 먼저 올리고 올린 날부터 효력이 생깁니다. 올린 뒤 접수한 이용자에게는 개정 조항이 적용되고 그 전에 마친 접수에는 적용되지 않습니다.'],
];
export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const T_ = TERMS(cfg.brand.ko);
  const body = [
    SK.lead([`${esc(cfg.brand.ko)} 이용 약관 전문입니다. 아래 조항은 접수 전화가 이어지는 순간에 효력이 생깁니다.`]),
    frame('terms', '약관 전문', SK.docs(T_), null),
    hail(cfg, '약관 문의', 'terms'), dt(ctx, 'terms'), siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/', title: title.page('이용 약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리의 이용 약관 전문입니다. 접수, 관리 범위, 금액과 계산 방법, 시각 변경을 ${T_.length}개 조문에 담았습니다.`),
      h1: SK.h1('이용 약관', `조문 ${T_.length}개 전문`),
      body, pageKind: 'terms', crumbs: crumbs2(siteUrl, T.crumb.terms, '/terms/'),
    }),
  };
}

const PRIVACY = [
  ['1. 받아 적는 항목', '접수 통화에서 받아 적는 것은 방문 주소, 연락 번호, 고른 코스, 희망 시각 네 가지이고, 성함·생년월일·주민번호 같은 신상 항목은 묻지 않습니다.'],
  ['2. 쓰는 목적', '받아 적은 내용은 관리사를 배정하고 출발과 도착을 알리는 데에만 씁니다. 방문이 끝난 뒤 광고 문자를 보내거나 먼저 연락하는 일은 없습니다.'],
  ['3. 열람할 수 있는 사람', '접수로 알게 된 번호는 방문이 마무리될 때까지 접수 담당과 배정된 관리사 두 쪽만 볼 수 있습니다.'],
  ['4. 보관 기간', '문제 없이 끝난 방문 기록은 그날 안에 지우고, 다툼이 남은 건만 정리될 때까지 따로 둡니다.'],
  ['5. 제3자 제공', '정보를 다른 업체에 넘기거나 맡기지 않으며, 법령에 근거한 수사기관의 정식 요청이 있을 때만 예외로 둡니다.'],
  ['6. 방문 기록과 쿠키', '이 사이트는 요청이 올 때 글을 만들지 않고 미리 완성해 둔 파일만 내줍니다. 회원 가입, 댓글, 장바구니가 없고 광고용 추적 코드와 방문 통계 도구와 쿠키도 쓰지 않습니다.'],
  ['7. 이용자의 권리', '회사가 가진 본인 정보는 열람과 삭제를 요청할 수 있으며 화면의 번호로 전화하면 바로 처리합니다.'],
  ['8. 담당자', '운영자 정보가 확정되는 대로 이 항목과 화면 맨 끝 줄에 함께 적습니다. 그전의 문의는 화면의 번호로 합니다.'],
];
export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    SK.lead(['적어 두는 정보가 네 줄뿐이어서 방침도 짧습니다.']),
    frame('pp', '방침 전문', SK.docs(PRIVACY), null),
    hail(cfg, '개인정보 관련 문의', 'privacy'), dt(ctx, 'privacy'), siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/', title: title.page('개인정보 처리방침'),
      desc: clampDesc('접수 통화에서 받아 적는 항목과 쓰는 목적, 보관 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: SK.h1('개인정보 처리방침', '받아 적는 정보는 네 가지'),
      body, pageKind: 'privacy', crumbs: crumbs2(siteUrl, T.crumb.privacy, '/privacy/'),
    }),
  };
}

/* ── 반분선 수첩 목록·글 ──────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    SK.lead(['통화 중에 되묻는 일이 줄어드는 글만 한곳에 모았습니다. 소감과 별점은 붙이지 않았습니다.']),
    frame('list', `반분선 수첩 ${list.length}편`, notes(list), '새 글은 RSS로도 내보냅니다.'),
    hail(cfg, '접수', 'magazine'), dt(ctx, 'magazine'), siteLinks(ctx, 'magazine'),
  ].join('\n');
  const t = title.page('반분선 수첩 글 모음');
  const d = clampDesc(`전화하기 전에 정해 두면 편한 사항을 ${list.length}편으로 적었습니다. 후기와 체험담은 두지 않았습니다.`);
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/', title: t, desc: d,
      h1: SK.h1('반분선 수첩', `읽을 글 ${list.length}편`),
      body, pageKind: 'magazine', crumbs: crumbs2(siteUrl, T.crumb.magazine, '/magazine/'),
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: t, desc: d, listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '반분선 수첩', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');
  const at0 = POSTS.findIndex((x) => x.slug === p.slug);
  const others = POSTS.map((_, i) => POSTS[(at0 + 1 + i) % POSTS.length]).filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    SK.dated(p.date, `${cfg.brand.ko} 반분선 수첩`),
    SK.piece(html),
    hail(cfg, '접수', p.slug),
    frame('more', '이어서 읽을 수첩', notes(others), null),
    dt(ctx, p.slug), siteLinks(ctx, p.slug),
  ].join('\n');
  return {
    path,
    html: layout(ctx, {
      path, title: title.post(p), desc: clampDesc(desc.post(p)), h1: esc(p.title), body, pageKind: 'post',
      crumbs: [{ name: T.crumb.home, url: `${siteUrl}/` }, { name: T.crumb.magazine, url: `${siteUrl}/magazine/` }, { name: p.title, url }],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

export function notFound(ctx) {
  const { cfg, regions } = ctx;
  const sd = shuffle(regions, hash('404', 'sd'));
  const body = [
    SK.lead(['이 주소에는 정거장이 없습니다. 주소가 달라졌거나 처음부터 없던 화면입니다. 아래에서 다시 고르면 됩니다.']),
    frame('back', '처음 정거장으로 돌아가기', SK.inl([
      { href: '/', text: '종합 안내판' }, { href: '/area/', text: '노선도' }, { href: '/course/', text: '승차권 종류' }, { href: '/price/', text: '운임표' }, { href: '/guide/', text: '승차 안내' },
      ...sd.map((r) => ({ href: `/${r.slug}/`, text: r.name })),
    ]), null),
    hail(cfg, '즉시 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html', title: title.page('없는 주소'),
      desc: '이 주소로 만든 화면이 없습니다. 아래에서 다시 고르면 됩니다.',
      h1: '없는 주소', body, noindex: true, pageKind: '404',
    }),
  };
}
