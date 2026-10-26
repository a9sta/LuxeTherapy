import { layout, frame } from '../lib/html.mjs';
import { esc, hash, won, josa, shuffle, guLabel } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import * as B from '../lib/blocks.mjs';
import * as SK from '../lib/skin.mjs';
import * as T from '../content/copy.mjs';
import * as M from '../content/metric.mjs';
import { baseCtx } from './region.mjs';
import { LAYOUT } from '../site.mjs';

const { at, hail, courseRoll, postStrip, stepCards, stepSet, faqBlock, noticeBlock,
  guIndex, topicLinks, themeCards, spotPool, guPool } = B;
const { SEC } = T;
const compose = (kind, parts) => LAYOUT[kind].map((k) => parts[k] || '').filter(Boolean).join('\n');

const OIL = {
  true: [
    '기름을 쓰는 코스는 마친 뒤에 몸을 닦고 옷을 다시 입는 시간이 몇 분 더 들어서, 뒤에 약속이 있다면 그만큼 얹어 시각을 잡습니다.',
    '피부에 기름이 남아 마무리가 조금 길어지는 반면 몸은 더 부드럽게 풀립니다. 희망 시각에는 그 차이를 얹어 둡니다.',
  ],
  false: [
    '기름을 바르지 않으므로 마치는 대로 옷만 갖춰 입으면 외출할 수 있고, 침구가 더러워질 일도 없습니다.',
    '마른 손으로 하는 코스여서 씻을 일이 없고, 바로 뒤에 일정이 이어지는 날에도 부담이 적습니다.',
  ],
};
const PRESS = [
  '표에 적힌 압은 출발선일 뿐이어서, 손이 닿은 지 몇 분이 지나면 서로 맞는 세기가 따로 자리 잡습니다.',
  '압이 세게 느껴지는 순간 말하면 곧바로 낮추는데, 참고 버티는 쪽보다 말하는 쪽이 더 빨리 맞습니다.',
  '같은 압도 몸 상태에 따라 체감이 달라지므로 접수 때 오늘 무거운 곳을 알리면 세기를 맞추기 쉽습니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '은/는')} ${c.for}에게 맞는 코스이고, 사정이 다른 사람에게는 다른 코스가 맞습니다.`,
  (c) => `${c.ko} 문의는 ${c.for}에게서 자주 들어오지만, 사정이 다르면 통화 중에 코스를 바꿔도 됩니다.`,
  (c) => `${c.ko}의 구성은 ${c.for}${josa(c.for, '을/를')} 염두에 두고 짰습니다. 받다가 다른 코스가 끌려도 계산은 처음 고른 코스로 하므로 부담이 없습니다.`,
];

function cmpRows(courses, cur) {
  const mins = courses.map((x) => x.min);
  const lo = Math.min(...mins), hi = Math.max(...mins);
  return [cur, ...courses.filter((x) => x.slug !== cur.slug)].map((x, i) => ({
    ko: x.ko, slug: x.slug, min: x.min, price: won(x.price), me: i === 0,
    w: hi === lo ? 100 : 22 + Math.round(((x.min - lo) / (hi - lo)) * 78),
    sub: `손 세기는 ${x.pressure}, 기름은 ${x.oil ? '바름' : '바르지 않음'}`,
  }));
}

export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');
  const fc = baseCtx(cfg, courses, '머무는 곳');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5);
  const bySido = regions.map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deepAll = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const x of g.spots) deepAll.push({ label: `${g.name} ${x.name}`, href: `/${r.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${c.ko} 시도별 승차권`, items: bySido, anchor: T.COURSE_ANCHOR },
    { label: '다른 코스 승차권', items: courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: T.COURSE_ANCHOR },
    { label: '시군구 화면', items: guList, pick: 18, anchor: T.ANCHOR },
    { label: '동 화면', items: deepAll, pick: 16, anchor: T.ANCHOR },
    { label: T.TL.docs, items: T.DOC_LINKS },
  ], seed, at(h, SEC.topicHead, 8), at(h, SEC.topicSub, 3));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true }), noun: T.noun.spot, seedKey: seed,
    heading: at(h, SEC.themeHead, 4), sub: at(h, SEC.themeSub, 5), cards: 3, per: 4,
  });

  const parts = {
    open: SK.lead([`${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}`, `${esc(c.lines[1])} ${esc(c.lines[2])}`, `${esc(at(h, OIL[String(c.oil)], 4))} ${esc(at(h, PRESS, 1))}`]),
    facts: frame('fact', `${c.ko} 승차권`, SK.stat([
      ['소요 시간', `${c.min}분`],
      ['운임', `${won(c.price)}원<small>부르는 지역과 상관없이 하나의 값입니다</small>`],
      ['압', esc(c.pressure)],
      ['손놀림', esc(c.tempo)],
      ['손이 길게 머무는 곳', esc(c.focus)],
      ['오일', c.oil ? '사용' : '미사용'],
      ['방에 둘 것', c.oil ? '눕는 자리 한 곳과 수건 두 장' : '누울 곳 한 군데와 수건 한 장'],
      ['접수 조건', `전화 ${esc(cfg.hours)}<small>정산 ${esc(cfg.pay)} · 현관 ${esc(cfg.arrive)}</small>`],
    ]), at(h, SEC.factSub, 7)),
    compare: frame('cmp', '아홉 코스 시간 견주기', SK.cmp(cmpRows(courses, c)),
      '선의 길이가 소요 시간이고 맨 오른쪽 숫자가 금액입니다. 시간이 긴 코스와 압이 센 코스는 같지 않아서 두 가지를 따로 읽습니다.'),
    hail: hail(cfg, c.ko, seed), faq: faqHtml, steps: stepCards(seed), notice: noticeBlock(seed), theme: theme.html, posts: postStrip(seed), topics,
  };

  return {
    path,
    html: layout(ctx, {
      path, title: title.course(c), desc: clampDesc(desc.course(c)),
      h1: SK.h1(esc(c.ko), `방문 ${c.min}분, ${won(c.price)}원`),
      body: compose('course', parts), pageKind: 'course',
      crumbs: [{ name: T.crumb.home, url: `${siteUrl}/` }, { name: T.crumb.course, url: `${siteUrl}/course/` }, { name: c.ko, url }],
      jsonld: [
        S.service({ siteUrl, url, cfg, name: `${c.ko} 출장 방문 관리`, desc: clampDesc(desc.course(c)), areaServed: { '@type': 'Country', name: '대한민국' }, courses: [c] }),
        S.itemList(`${url}#sidolist`, `${c.ko}${josa(c.ko, '을/를')} 받을 수 있는 시도`, regions.map((r) => ({ name: `${r.name} ${c.ko}`, url: `${siteUrl}/${r.slug}/course/${c.slug}/` }))),
        S.itemList(`${url}#themes`, `${c.ko} 접수 전에 모양을 견줄 동`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko} 접수에서 도착까지 이어지는 다섯 단계`, steps, cfg),
      ],
    }),
  };
}

export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');
  const fc = baseCtx(cfg, courses, sd.name);
  const sc = M.sidoCtx(ctx, sd);
  /* 시군구까지만 있는 시도와 시군구가 하나뿐인 시도는 코스 쪽끼리 본문이 55% 넘게 겹친다 — 색인에서 뺀다(링크는 그대로). */
  const thin = !sd.main || sd.gu.length < 2;

  const openLines = [
    `${sd.name}의 ${c.ko} ${c.min}분 코스는 ${won(c.price)}원이고, 이 값은 다른 시도에서도 달라지지 않습니다.`,
    `${sd.name}에서는 시군구가 어디든 ${c.ko} ${c.min}분이 ${won(c.price)}원으로 하나입니다. 지역마다 값이 갈리는 곳과는 다릅니다.`,
    `${sd.name}에서 부른다고 ${c.ko}의 짜임이 바뀌지는 않으며, 다른 지역과 같은 ${c.min}분짜리가 같은 값에 나갑니다.`,
  ];
  const secondMain = [
    `${sd.name}에는 화면을 만든 동이 ${sd.spotCount}곳이고 교차점의 치우침은 평균 ${sc.avgOff}입니다.`,
    `${sd.name}의 동 가운데 교차점이 가장 크게 벗어난 곳은 ${sc.farName}(${sc.farV}), 가장 작게 벗어난 곳은 ${sc.nearName}(${sc.nearV})입니다.`,
    `${sd.name}의 평균 교차점은 ${sc.shift}에 놓입니다. 동별 값은 각 동 화면이 더 정확합니다.`,
  ];
  const secondSub = [
    `${sd.name}${josa(sd.name, '은/는')} 시군구 ${sd.gu.length}곳에서 화면이 끝나고, 동 이름은 그 화면 목록 속에 담았습니다.`,
    `${sd.name}에서 다룬 시군구 ${sd.gu.length}곳의 평균 치우침은 ${sc.avgOff}이고 행정동은 모두 ${sd.dongCount}곳입니다.`,
    `${sd.name}의 화면은 시군구 단계에서 끝나므로 읍·면·동 이름은 통화에서 말하면 됩니다.`,
  ];
  const second = at(h, sd.main ? secondMain : secondSub, 6);

  const guHere = sd.gu.map((g) => ({ label: guLabel(sd.name, g.name), href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const { html: faqHtml, qa } = faqBlock(seed, fc, 4);
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name}에서 받을 수 있는 다른 코스`, items: courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` })), anchor: T.COURSE_ANCHOR },
    { label: `${c.ko} 다른 시도 항목`, items: regions.filter((r) => r.slug !== sd.slug).map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` })), anchor: T.COURSE_ANCHOR },
    { label: T.TL.courseOnly, items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: T.COURSE_ANCHOR },
    { label: `${sd.name} 노선의 시군구 정거장`, items: guHere, pick: 16, anchor: T.ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동별 화면`, items: deepHere, pick: 14, anchor: T.ANCHOR }] : []),
    { label: T.TL.docs, items: T.DOC_LINKS },
  ], seed, at(h, SEC.topicHead, 8), at(h, SEC.topicSub, 3));
  const theme = themeCards({
    pool: sd.main ? spotPool([sd]) : guPool(regions.filter((r) => r.slug !== sd.slug), { sidoLabel: true }),
    noun: sd.main ? T.noun.spot : T.noun.gu, seedKey: seed,
    heading: at(h, SEC.themeHead, 4), sub: at(h, SEC.themeSub, 5), cards: 4, per: 4,
  });

  const subNames = [];
  if (!sd.main) for (const g of sd.gu) {
    for (const d of (g.dongNames || [])) subNames.push(`${g.name} ${d}`);
    for (const m of (g.rural || [])) subNames.push(`${g.name} ${m.name}`);
  }
  const ci = courses.findIndex((x) => x.slug === c.slug);
  const allShuf = shuffle(subNames, hash(sd.name, 'sn'));
  const per = Math.max(10, Math.ceil(allShuf.length / courses.length));
  const nameShow = subNames.length ? allShuf.slice(ci * per, ci * per + per) : [];
  const namesBlock = nameShow.length
    ? frame('sidodong', `${sd.name}에 속한 행정동 이름 ${nameShow.length}개`,
      `${SK.names(nameShow)}${SK.note(`${esc(sd.name)} 행정동 ${subNames.length}곳 가운데 이 화면에 올린 이름은 일부이고, 남은 이름은 <a href="/${sd.slug}/">${esc(sd.name)} 화면</a> 아래 시군구별 목록에 있습니다.`)}`,
      '어떤 이름을 말해도 접수되며 전화로 한 번만 알리면 됩니다.', `이름 ${nameShow.length}개 열어 보기`)
    : '';

  const parts = {
    open: SK.lead([esc(at(h, openLines, 0)), esc(second), esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])]),
    facts: frame('fact', `${sd.name} 노선의 ${c.ko} 승차권`, M.sidoDevice(sd) + SK.stat([
      ['대상 지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['화면 깊이', sd.main ? `시군구 정거장 ${sd.gu.length}곳 아래 동 정거장 ${sd.spotCount}곳` : `시군구 ${sd.gu.length}곳까지`],
      ['소요 시간', `${c.min}분`],
      ['운임', `${won(c.price)}원<small>${esc(sd.name)}의 모든 시군구에 같은 값을 매깁니다</small>`],
      ['압과 손놀림', `${esc(c.pressure)}<small>${esc(c.tempo)}</small>`],
      ['손이 길게 머무는 곳', esc(c.focus)],
      ['오일', c.oil ? '사용' : '미사용'],
      [sd.main ? '동 평균 치우침' : '시군구 평균 치우침', `${sc.avgOff}<small>평균 교차점은 ${esc(sc.shift)}에 놓입니다</small>`],
    ]), at(h, SEC.factSub, 7)),
    courses: courseRoll(courses, seed, sd.name, { full: false }),
    hail: hail(cfg, `${sd.name} ${c.ko}`, seed),
    guidx: guIndex(sd, seed, null, { pick: 14 }),
    names: namesBlock, faq: faqHtml, steps: stepCards(seed), theme: theme.html, posts: postStrip(seed), topics,
  };

  return {
    path, noindex: thin,
    html: layout(ctx, {
      path, title: title.sidoCourse(sd, c), desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: SK.h1(`${esc(sd.name)} ${esc(c.ko)}`, `${sd.name} 전역 ${c.min}분, ${won(c.price)}원`),
      body: compose('sidoCourse', parts), pageKind: 'sidocourse', noindex: thin, line: regions.indexOf(sd) + 1,
      about: `${siteUrl}/${sd.slug}/#place`,
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: T.crumb.home, url: `${siteUrl}/` }, { name: T.crumb.area, url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` }, { name: c.ko, url },
      ],
      jsonld: [
        S.place(`${siteUrl}/${sd.slug}/#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({ siteUrl, url, cfg, name: `${sd.name}에서 받는 ${c.ko} 방문 관리`, desc: clampDesc(desc.sidoCourse(sd, c)), areaServed: { '@type': 'AdministrativeArea', name: sd.full }, courses: [c] }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.itemList(`${url}#themes`, `${sd.name}에서 반분선 모양이 닮은 곳`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${c.ko} 접수에 이어지는 다섯 단계`, steps, cfg),
      ],
    }),
  };
}
