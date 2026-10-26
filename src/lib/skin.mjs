/**
 * 화면 마크업. 클래스는 전부 lx- 노선도 접두사. 문장은 넣지 않는다(문장은 content/ 쪽).
 * 지역 목록은 세로 노선선 위의 정거장(원)으로 그리고, 값은 정거장 사이 선분의 길이로 보인다.
 */
import { esc, won } from './util.mjs';
export { esc };

const P = 'lx';

export const lead = (paras) => `<div class="${P}-lead">\n${paras.map((p) => `  <p>${p}</p>`).join('\n')}\n</div>`;
export const note = (html) => `<p class="${P}-note">${html}</p>`;
export const h1 = (main, sub) => `${main}<span class="${P}-h1s">${esc(sub)}</span>`;

/** 노선 번호 배지 — 시도마다 한 줄 */
export const badge = (n, name = '') => `<b class="${P}-bd ${P}-l${n}"${name ? ` title="${esc(name)}"` : ''}>${n}</b>`;

export const stat = (rows) => `<dl class="${P}-tab">\n${rows.map((r) => `<div><dt>${esc(r[0])}</dt><dd>${r[1]}</dd></div>`).join('\n')}\n</dl>`;

export const hail = ({ place, line, tail, call }) => `<aside class="${P}-hail" aria-label="${esc(place)} 예약 문의">
  <div class="${P}-hail-t"><p>${esc(line)}</p><small>${esc(tail)}</small></div>
  <div class="${P}-hail-c">${call}</div>
</aside>`;

export const stubs = (rows, tail) => `<ul class="${P}-crs">\n${rows.map((r) => `<li><a href="${r.href}"><b>${esc(r.ko)}</b><i></i><span>${r.min}분</span><em>${r.price}원</em></a>${r.line ? `<small>${esc(r.line)}</small>` : ''}</li>`).join('\n')}\n</ul>\n<p class="${P}-note">${tail}</p>`;

export const steps = (list) => `<ol class="${P}-steps">\n${list.map((s) => `<li><b>${esc(s.t)}</b><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`;

export const qa = (list) => `<div class="${P}-qa">\n${list.map((x) => `<div class="${P}-qr"><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`;

export const caution = (items) => `<ul class="${P}-caution">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`;

export const inl = (items) => `<ul class="${P}-inl">${items.map((p) => `<li><a href="${p.href}">${esc(p.text)}</a></li>`).join('')}</ul>`;

export const rows = (groups) => `<table class="${P}-tb"><tbody>${groups.map((g) => `<tr><th scope="row">${esc(g.label)}</th><td>${inl(g.items)}</td></tr>`).join('\n')}</tbody></table>`;

export const posts = (list) => `<ul class="${P}-posts">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><time datetime="${p.date}">${p.date}</time><b>${esc(p.title)}</b><span>${esc(p.summary)}</span></a></li>`).join('\n')}</ul>`;

export const themes = (groups) => `<div class="${P}-ths">${groups.map((g) => `<section class="${P}-th"><h3>${esc(g.title)}</h3><ol>${g.items.map((x) => `<li><a href="${x.href}">${esc(x.label)}</a><b>${esc(x.m)}</b></li>`).join('')}</ol></section>`).join('\n')}</div>`;

/** 정거장 한 칸 — w(0~100)가 클수록 다음 정거장까지 선분이 길다 */
export const sta = (x) => `<li class="${P}-sta${x.cur ? ` ${P}-cur` : ''}${x.xf ? ` ${P}-xf` : ''}" style="--w:${x.w == null ? 12 : x.w}"><a href="${x.href}"${x.cur ? ' aria-current="page"' : ''}><i class="${P}-stn" aria-hidden="true"></i><span>${esc(x.name)}</span><b>${esc(x.val)}</b>${x.xf ? `<u class="${P}-xt">환승</u>` : ''}</a></li>`;
export const map = (items) => `<ol class="${P}-map">\n${items.map(sta).join('\n')}\n</ol>`;
export const idx = map;

/** 환승 안내 — 선로로 이어지지 않는 이웃 정거장 목록 */
export const tags = (items, line = false) => (line
  ? map(items)
  : `<ul class="${P}-xfer">\n${items.map((x) => `<li><a href="${x.href}"${x.cur ? ' aria-current="page"' : ''}><i class="${P}-ring" aria-hidden="true"></i><span>${esc(x.name)}</span><b>${esc(x.val)}</b></a></li>`).join('\n')}\n</ul>`);

export const names = (list) => `<ul class="${P}-names">\n${list.map((n) => `<li>${esc(n)}</li>`).join('\n')}\n</ul>`;

export const ck = (items, neg = false) => `<ul class="${P}-ck${neg ? ` ${P}-no` : ''}">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`;
export const ladder = (rows, top) => `<ul class="${P}-lad">${rows.map((c) => `<li><a href="/course/${c.slug}/"><span>${esc(c.ko)}</span><s style="--w:${Math.round((c.price / top) * 100)}"></s><b>${won(c.price)}원</b></a></li>`).join('\n')}</ul>`;
export const cases = (courses) => `<ul class="${P}-cases">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><span>${esc(c.for)}</span></a></li>`).join('')}</ul>`;
export const cmp = (rows) => `<ul class="${P}-cmp">\n${rows.map((r) => {
  const inner = `<span class="${P}-cmp-n">${esc(r.ko)}</span><span class="${P}-cmp-t"><s style="--w:${r.w}"></s><em>${r.min}분</em></span><span class="${P}-cmp-p">${r.price}원</span>`;
  return `<li${r.me ? ' class="me"' : ''}>${r.me ? `<div>${inner}</div>` : `<a href="/course/${r.slug}/">${inner}</a>`}<small>${esc(r.sub)}</small></li>`;
}).join('\n')}\n</ul>`;
export const docs = (sections) => `<div class="${P}-doc">${sections.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`;
export const piece = (html) => `<article class="${P}-piece">${html}</article>`;
export const dated = (date, label) => `<p class="${P}-dated"><time datetime="${date}">${date}</time> · ${esc(label)}</p>`;
export const x = (html) => `<p class="${P}-x">${html}</p>`;
