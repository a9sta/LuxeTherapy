import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { MARK, THEME } from '../assets.mjs';

export const ASSET_V = '1';
const P = 'lx';

/**
 * 공통 뼈대 — 지하철 노선도 한 장. 맨 위는 운행·정산·정거장 수가 적힌 승강장 표지판, 그 아래 노선 안내(역 점이 이어진 메뉴),
 * 본문은 왼쪽 세로 노선선 위에 역 번호가 붙은 칸이 이어지고 맨 아래는 종점 안내판이다. 전화번호는 callBox() 로만 찍는다.
 * 라벨은 '예약 문의' 하나다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body: body0, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '', pageType = '', about = '', mainList = '', line = 0,
  } = opts;
  // 본문 안의 자기 자신 링크는 글자만 남긴다(자기링크는 순환일 뿐이다)
  const body = path === '/' ? body0 : String(body0).replace(new RegExp(`<a href="${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">(.*?)</a>`, 'g'), '$1');
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null, pageType, about, mainList }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="${THEME.accent}">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/lx.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}"${line ? ` class="${P}-l${line}"` : ''}>
<a class="${P}-hop" href="#main">본문으로 건너뛰기</a>
<div class="${P}-board">
${header(ctx, path)}
${crumbs.length > 1 ? wayHtml(crumbs) : ''}
<main id="main">
<h1 class="${P}-h1">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
</div>
${dock(cfg)}
<script src="/assets/lx.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/** 예약 문의 버튼. size: s(머리) · m(본문) · l(떠 있는 띠) */
export function callBox(cfg, { size = 'm' } = {}) {
  return `<a class="callbox callbox-${size}" href="tel:${cfg.telRaw}"><span class="callbox-k">${esc(cfg.telLabel)}</span><span class="callbox-v">${esc(cfg.tel)}</span></a>`;
}

function header(ctx, path) {
  const { cfg, counts } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '노선도'], ['/course/', '승차권 종류'], ['/price/', '운임표'], ['/guide/', '승차 안내'], ['/magazine/', '반분선 수첩']];
  return `<header class="${P}-top">
  <div class="${P}-bar">
    <a class="${P}-brand" href="/" aria-label="${esc(cfg.brand.ko)} 종합 안내판">${MARK()}<b>${esc(cfg.brand.ko)}</b><small>${esc(cfg.brand.en)}</small></a>
    <dl class="${P}-meta">
      <div><dt>운행</dt><dd>${esc(cfg.hours)}</dd></div>
      <div><dt>정산</dt><dd>${esc(cfg.pay)}</dd></div>
      <div><dt>정거장</dt><dd>${counts.gu + counts.spot}곳</dd></div>
    </dl>
  </div>
  <div class="${P}-sign">
    <nav class="${P}-nav" aria-label="노선 안내"><ol>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ol></nav>
    ${callBox(cfg, { size: 's' })}
  </div>
</header>`;
}

function wayHtml(crumbs) {
  return `<nav class="${P}-way" aria-label="지나온 정거장"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, updated } = ctx;
  const b = cfg.business || {};
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 담당자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const byKo = (a, c) => (a.name < c.name ? -1 : 1);
  const main = regions.filter((r) => r.main).sort(byKo);
  const sub = regions.filter((r) => !r.main).sort(byKo);
  const ln = (r) => regions.indexOf(r) + 1;

  return `<footer class="${P}-foot">
  <section class="${P}-fc" aria-label="${esc(cfg.brand.ko)} 종점 안내">
    <h2>종점 안내판</h2>
    <p>점포는 없고 전화를 받으면 알려 준 주소로 관리사가 찾아갑니다. 정거장은 시군구 ${counts.gu}곳과 동 ${counts.spot}곳이며 접수 번호는 하나입니다.</p>
    ${callBox(cfg, { size: 'm' })}
    <p class="${P}-fs">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
  </section>
  <nav class="${P}-fc" aria-label="노선 바로가기">
    <h2>동 정거장까지 있는 노선</h2>
    <p class="${P}-chips">${main.map((r) => `<a href="/${r.slug}/"><b class="${P}-bd ${P}-l${ln(r)}">${ln(r)}</b>${esc(r.name)}</a>`).join('')}</p>
    <h2>시군구에서 끝나는 노선</h2>
    <p class="${P}-chips">${sub.map((r) => `<a href="/${r.slug}/"><b class="${P}-bd ${P}-l${ln(r)}">${ln(r)}</b>${esc(r.name)}</a>`).join('')}</p>
    <p class="${P}-fs"><a href="/area/">노선도 전체</a> · 읍·면 ${counts.rural}곳은 이름만 수록</p>
  </nav>
  <div class="${P}-fc">
    <h2>안내 문서</h2>
    <p class="${P}-chips"><a href="/guide/">승차 안내</a><a href="/price/">운임표</a><a href="/course/">승차권 종류</a><a href="/company/">럭스테라피 소개</a><a href="/terms/">이용 약관</a><a href="/privacy/">개인정보 처리방침</a></p>
    <h2>최근 반분선 수첩</h2>
    <ul class="${P}-fl">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
    <h2>기계 판독용</h2>
    <p class="${P}-chips"><a href="/rss.xml">RSS</a><a href="/sitemap.xml">사이트맵</a><a href="/llms.txt">AI용 안내</a></p>
    <p class="${P}-fs">최종 수정 <time datetime="@@LM@@">@@LM@@</time></p>
  </div>
  <div class="${P}-foot-end">
    ${biz ? `<p class="${P}-biz">${biz}</p>` : `<p class="${P}-biz ${P}-pale">운영자 표기는 확정되는 대로 이 줄에 적겠습니다.</p>`}
    <p class="${P}-ai">쪽마다 적힌 반분선 길이와 교차점의 치우침은 공개된 행정동 경계 좌표를 프로그램이 계산한 값입니다. 문장은 <strong>AI 도구로 초안을 잡은 뒤</strong> 사람이 손봐서 올렸습니다. 후기와 체험담, 별점은 받지도 싣지도 않고 인물 사진도 쓰지 않습니다.</p>
    <p class="${P}-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 의료 행위도 성적인 서비스도 하지 않습니다.</p>
  </div>
</footer>`;
}

/** 화면 아래쪽에 붙는 접수 띠 — 푸터 위에서는 스크립트가 숨긴다 */
function dock(cfg) {
  return `<div class="${P}-dock">
  <span class="${P}-dock-s">현관 도착 ${esc(cfg.arrive.replace(/^접수 후 /, ''))} 기준</span>
  ${callBox(cfg, { size: 'l' })}
</div>`;
}

/** 역 번호가 붙은 칸 한 개 — 왼쪽 노선선 위에 역 원과 번호, 제목 옆에 본문. fold 를 주면 긴 목록은 접어 둔다. */
export function frame(id, h2, inner, sub, fold = '') {
  const body = fold ? `<details class="${P}-fold"><summary>${esc(fold)}</summary>${inner}</details>` : inner;
  return `<section class="${P}-sec" id="${id}" aria-labelledby="${id}-h">
  <header class="${P}-kick"><h2 id="${id}-h">${esc(h2)}</h2></header>
  <div class="${P}-col">${sub ? `<p class="${P}-sub">${esc(sub)}</p>` : ''}${body}</div>
</section>`;
}
