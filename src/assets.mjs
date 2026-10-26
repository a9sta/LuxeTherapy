import fs from 'node:fs';
import path from 'node:path';

/* 오프화이트 바탕에 짙은 먹색 잉크, 선명한 라즈베리 한 색. 시도마다 노선 색을 따로 둔다(배지·세로선에만 쓴다). */
export const THEME = {
  bg: '#F6F5F0', paper: '#FFFFFF', ink: '#14171F', dim: '#4C5262',
  accent: '#D10557', accentDk: '#A30443', accentSoft: '#FCE7F0',
  rule: '#D7D4CA', ruleDk: '#9A9CA6', onAcc: '#FFFFFF', paper2: '#FBFAF6',
};

/** 노선 색(시도 순서대로 1~15호선). 흰 글자 대비 4.5:1 이상. */
export const LINES = ['#0A5DA8', '#0B7A4B', '#A85400', '#7B3FB3', '#00798C', '#B3261E', '#5C6B00', '#A3126B', '#2E4DA0', '#117A65', '#8A4B00', '#5B3FA0', '#0F6B8F', '#8E2C3C', '#4B5E2A'];

const CSS = (t) => `:root{
  --bg:${t.bg};--paper:${t.paper};--paper2:${t.paper2};--ink:${t.ink};--dim:${t.dim};--ac:${t.accent};--acDk:${t.accentDk};--acSoft:${t.accentSoft};
  --rule:${t.rule};--ruleDk:${t.ruleDk};--onAcc:${t.onAcc};--lc:${t.accent};
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,"Courier New",monospace;
}
${LINES.map((c, i) => `.lx-l${i + 1}{--lc:${c}}`).join('\n')}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;color-scheme:light;background:var(--bg)}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.78;font-size:15.5px;padding:0 0 96px}
img,svg{max-width:100%}
a{color:var(--acDk);text-decoration:underline;text-decoration-color:rgba(163,4,67,.4);text-underline-offset:3px}
a:hover{text-decoration-color:currentColor}
:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
strong{font-weight:800}
.lx-hop{position:absolute;left:-9999px}
.lx-hop:focus{position:fixed;left:12px;top:12px;z-index:70;background:#fff;color:var(--ink);padding:10px 16px;border:2px solid var(--ink)}
.lx-board{max-width:1000px;margin:0 auto;background:var(--paper);border-left:1px solid var(--rule);border-right:1px solid var(--rule)}
main{display:block;min-width:0;counter-reset:st;padding-bottom:6px}

/* ── 승강장 표지판 ─────────────────────────────── */
.lx-top{background:var(--ink);color:#fff}
.lx-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 28px;padding:14px 18px}
.lx-brand{display:flex;flex-wrap:wrap;align-items:center;gap:0 12px;color:#fff;text-decoration:none}
.lx-brand:hover{text-decoration:none}
.lx-mk{width:40px;height:40px;flex:none}
.lx-brand b{font-size:25px;font-weight:800;letter-spacing:-.04em;line-height:1.2}
.lx-brand small{flex-basis:100%;margin-left:52px;margin-top:-4px;font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:#F4A9C8;text-transform:uppercase}
.lx-meta{margin:0;display:flex;gap:6px 22px;flex-wrap:wrap}
.lx-meta>div{border-left:3px solid var(--ac);padding-left:9px}
.lx-meta dt{margin:0;font-size:11.5px;font-weight:700;color:#C9CEDA}
.lx-meta dd{margin:0;font-size:13.5px;font-weight:800;line-height:1.45;word-break:keep-all}
.lx-sign{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 16px;padding:6px 18px 10px;background:var(--paper);color:var(--ink);border-bottom:4px solid var(--ink)}
.lx-nav ol{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:0 4px}
.lx-nav li{position:relative;padding:20px 22px 4px 0}
.lx-nav li::before{content:"";position:absolute;left:0;top:3px;width:14px;height:14px;border-radius:50%;border:4px solid var(--ink);background:#fff;z-index:1}
.lx-nav li::after{content:"";position:absolute;left:12px;right:2px;top:8px;height:4px;background:var(--ac)}
.lx-nav li:last-child::after{display:none}
.lx-nav a{display:block;padding:0 0 0 2px;font-size:14px;font-weight:800;color:var(--ink);text-decoration:none}
.lx-nav a:hover{text-decoration:underline}
.lx-nav a[aria-current]{color:var(--acDk);box-shadow:inset 0 -3px 0 var(--ac)}

/* ── 예약 문의 버튼 ────────────────────────────── */
.callbox{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ac);color:var(--onAcc);line-height:1.15;text-decoration:none;border-radius:999px;box-shadow:0 0 0 3px #fff,0 0 0 5px var(--ink)}
.callbox:hover{text-decoration:none;background:var(--acDk)}
.callbox-k{font-size:11px;letter-spacing:.12em;font-weight:700}
.callbox-v{font-weight:800;letter-spacing:.02em}
.callbox-s{padding:5px 20px;margin:2px 5px 2px 3px}.callbox-s .callbox-v{font-size:15px}
.callbox-m{padding:9px 26px;margin:5px 0}.callbox-m .callbox-v{font-size:19px}
.callbox-l{padding:9px 30px}.callbox-l .callbox-v{font-size:21px}

/* ── 지나온 정거장 ─────────────────────────────── */
.lx-way{padding:10px 18px 8px;background:var(--paper2);border-bottom:1px solid var(--rule)}
.lx-way ol{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:2px 0;font-size:12.5px;color:var(--dim)}
.lx-way li{display:flex;align-items:center;position:relative}
.lx-way li::before{content:"";width:9px;height:9px;border:2px solid var(--ink);border-radius:50%;background:#fff;margin-right:6px}
.lx-way li+li{margin-left:26px}
.lx-way li+li::after{content:"";position:absolute;left:-22px;top:50%;width:18px;height:4px;margin-top:-2px;background:var(--lc)}
.lx-way li:last-child::before{background:var(--lc);border-color:var(--lc)}
.lx-way a{color:var(--dim)}
.lx-way [aria-current]{font-weight:800;color:var(--ink)}

.lx-h1{font-size:clamp(22px,5.4vw,31px);line-height:1.32;margin:0;padding:20px 18px 16px 56px;font-weight:800;letter-spacing:-.04em;word-break:keep-all;position:relative}
.lx-h1::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
.lx-h1::after{content:"";position:absolute;left:13px;top:26px;width:24px;height:24px;border-radius:50%;background:var(--ink);border:6px solid #fff;box-shadow:0 0 0 4px var(--lc)}
.lx-h1s{display:inline-block;margin-top:8px;padding:2px 12px;border:2px solid var(--ink);border-radius:999px;font-size:13.5px;font-weight:700;color:var(--ink);letter-spacing:0;line-height:1.6;background:#fff}

/* ── 역 번호가 붙은 칸 ─────────────────────────── */
.lx-sec{position:relative;padding:16px 18px 20px 56px}
.lx-sec::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
.lx-sec::after{content:"";position:absolute;left:14px;top:19px;width:22px;height:22px;border-radius:50%;background:#fff;border:5px solid var(--lc);z-index:1}
.lx-kick{margin:0 0 8px}
.lx-kick h2{margin:0;display:flex;align-items:baseline;gap:9px;font-size:17px;line-height:1.5;font-weight:800;letter-spacing:-.03em;word-break:keep-all}
.lx-kick h2::before{counter-increment:st;content:counter(st,decimal-leading-zero);flex:none;font-family:var(--mono);font-size:12px;font-weight:700;background:var(--ink);color:#fff;padding:1px 7px;border-radius:5px;transform:translateY(-2px)}
.lx-col{min-width:0}
.lx-sub{margin:0 0 10px;color:var(--dim);font-size:13.5px;line-height:1.68}
@media (max-width:560px){
  .lx-sec{padding:14px 14px 18px 46px}.lx-sec::before{left:17px}.lx-sec::after{left:9px}
  .lx-h1{padding-left:46px}.lx-h1::before{left:17px}.lx-h1::after{left:8px}
  .lx-bar{padding:12px 14px}.lx-sign{padding:4px 14px 10px}
}

/* ── 요지 칸 ──────────────────────────────────── */
.lx-lead{margin:0;position:relative;padding:14px 18px 8px 56px;font-size:15.5px}
.lx-lead::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
.lx-lead>p{margin:0 0 .7em}
.lx-sec .lx-lead{padding:0;font-size:15px}
.lx-sec .lx-lead::before{display:none}
@media (max-width:560px){.lx-lead{padding-left:46px}.lx-lead::before{left:17px}}
.lx-note{margin:12px 0 0;padding:7px 12px;border-left:4px solid var(--ac);background:var(--acSoft);font-size:13.5px;line-height:1.7}
.lx-x{margin:10px 0 0;color:var(--dim);font-size:13.5px}

/* ── 노선 번호 배지 ────────────────────────────── */
.lx-bd{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 5px;border-radius:999px;background:var(--lc);color:#fff;font-family:var(--mono);font-size:12px;font-weight:800;line-height:1}

/* ── 항목표 ───────────────────────────────────── */
.lx-tab{margin:12px 0 0;border-top:2px solid var(--ink)}
.lx-tab>div{display:grid;grid-template-columns:minmax(120px,190px) minmax(0,1fr);border-bottom:1px solid var(--rule)}
.lx-tab dt{margin:0;padding:7px 10px;background:var(--paper2);font-size:12.5px;font-weight:700;color:var(--dim);word-break:keep-all;border-right:1px solid var(--rule)}
.lx-tab dd{margin:0;padding:7px 12px;font-weight:800;font-size:15px;line-height:1.5;min-width:0}
.lx-tab small{display:block;font-weight:400;color:var(--dim);font-size:12.5px;line-height:1.55}
@media (max-width:520px){.lx-tab>div{grid-template-columns:1fr}.lx-tab dt{border-right:0}}

/* ── 반분선 그림 ──────────────────────────────── */
.lx-pl{margin:0;display:grid;gap:8px;justify-items:center}
.lx-pl-svg{width:100%;max-width:360px;height:auto;display:block}
.lx-pl-bx{fill:none;stroke:var(--ruleDk);stroke-width:1.2;stroke-dasharray:4 3}
.lx-pl-land{fill:var(--acSoft);stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round}
.lx-pl-hl{stroke:var(--ac);stroke-width:2.6;fill:none}
.lx-pl-vl{stroke:var(--ink);stroke-width:2.6;fill:none}
.lx-pl-ct{fill:#fff;stroke:var(--ink);stroke-width:1.4}
.lx-pl-ar{stroke:var(--ink);stroke-width:1.5;fill:none}
.lx-pl-ah{fill:var(--ink)}
.lx-pl-dot{fill:var(--ac);stroke:#fff;stroke-width:1.8}
.lx-pl-t{font-family:var(--mono);font-size:8.5px;fill:var(--dim);font-weight:700}
.lx-pl figcaption p{margin:0;color:var(--dim);font-size:13px;line-height:1.68;text-align:left}
.lx-pl-mini{display:block}
.lx-pl-mini .lx-pl-svg{max-width:112px;margin:0 0 2px}
.lx-pl-big .lx-pl-svg{max-width:440px}

/* ── 접수란 ───────────────────────────────────── */
.lx-hail{display:grid;gap:10px;margin:0;padding:18px 18px 20px 56px;position:relative;text-align:left}
.lx-hail::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
.lx-hail::after{content:"";position:absolute;left:12px;top:22px;width:26px;height:26px;border-radius:50%;background:var(--ac);border:6px solid #fff;box-shadow:0 0 0 4px var(--ink);z-index:1}
.lx-hail p{margin:0;font-weight:800;font-size:15.5px;line-height:1.6}
.lx-hail small{display:block;margin-top:4px;color:var(--dim);font-size:12.5px;line-height:1.6}
.lx-hail-t{padding:12px 14px;border:2px solid var(--ink);border-radius:12px;background:var(--acSoft)}
.lx-hail-c{justify-self:start}
@media (max-width:560px){.lx-hail{padding-left:46px}.lx-hail::before{left:17px}.lx-hail::after{left:7px}}

/* ── 코스 줄 ──────────────────────────────────── */
.lx-crs{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.lx-crs li{padding:7px 4px;border-bottom:1px solid var(--rule)}
.lx-crs a{display:flex;align-items:baseline;gap:8px;color:var(--ink);text-decoration:none}
.lx-crs a::before{content:"";width:10px;height:10px;border-radius:50%;border:3px solid var(--ac);flex:none;transform:translateY(1px)}
.lx-crs a:hover b{text-decoration:underline}
.lx-crs b{font-size:15.5px;font-weight:800}
.lx-crs i{flex:1;border-bottom:3px dotted var(--ruleDk);transform:translateY(-4px);min-width:10px}
.lx-crs span{font-size:12px;color:var(--dim)}
.lx-crs em{font-style:normal;font-weight:800;min-width:76px;text-align:right;font-size:14px}
.lx-crs small{display:block;padding:3px 0 0 20px;color:var(--dim);font-size:12.5px;line-height:1.6}

/* ── 접수 단계 ────────────────────────────────── */
.lx-steps{list-style:none;margin:0;padding:0}
.lx-steps li{position:relative;padding:0 0 12px 30px}
.lx-steps li::before{content:"";position:absolute;left:5px;top:12px;bottom:-2px;width:3px;background:var(--ruleDk)}
.lx-steps li:last-child::before{display:none}
.lx-steps li::after{content:"";position:absolute;left:0;top:5px;width:13px;height:13px;border-radius:50%;border:3px solid var(--ink);background:#fff}
.lx-steps b{display:block;font-size:14.5px;color:var(--ink)}
.lx-steps p{margin:1px 0 0;font-size:13.5px;color:var(--dim);line-height:1.68}

/* ── 질문과 답 ────────────────────────────────── */
.lx-qa{counter-reset:q;border-top:2px solid var(--ink)}
.lx-qr{counter-increment:q;padding:9px 4px 10px;border-bottom:1px solid var(--rule)}
.lx-qr h3{margin:0 0 3px;font-size:15px;font-weight:800;line-height:1.55}
.lx-qr h3::before{content:"Q" counter(q) " ";color:var(--acDk);font-family:var(--mono);font-size:13px}
.lx-qr p{margin:0;padding-left:20px;font-size:14.5px}

/* ── 주의 ─────────────────────────────────────── */
.lx-caution{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.lx-caution li{padding:7px 8px 7px 28px;font-size:14px;position:relative;line-height:1.7;border-bottom:1px solid var(--rule)}
.lx-caution li::before{content:"!";position:absolute;left:6px;top:9px;width:16px;height:16px;border-radius:50%;background:var(--ac);color:#fff;font-size:11px;font-weight:800;text-align:center;line-height:16px}

/* ── 링크 묶음 ────────────────────────────────── */
.lx-inl{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px}
.lx-inl a{display:block;padding:2px 0;font-size:13.5px;color:var(--ink);text-decoration:none}
.lx-inl a::before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%;border:2px solid var(--ink);background:#fff}
.lx-inl a:hover{text-decoration:underline}
.lx-tb{width:100%;border-collapse:collapse}
.lx-tb th,.lx-tb td{padding:6px 0;vertical-align:top;text-align:left;display:block}
.lx-tb th{font-size:12px;font-weight:800;color:var(--acDk);padding-bottom:2px}
.lx-tb tr{display:block;border-bottom:1px solid var(--rule);padding:2px 0 4px}
.lx-names{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:3px 12px;font-size:13.5px}
.lx-names li::before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%;border:2px solid var(--ruleDk);background:#fff}

/* ── 정거장 선(지역 목록) ─────────────────────── */
.lx-map{list-style:none;margin:6px 0 0;padding:0;column-width:270px;column-gap:30px}
.lx-sta{position:relative;break-inside:avoid;padding:0 0 calc(5px + var(--w) * .27px) 36px}
.lx-sta::before{content:"";position:absolute;left:9px;top:14px;width:6px;height:100%;background:var(--lc)}
.lx-sta:last-child::before{display:none}
.lx-sta a{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;min-height:28px;color:var(--ink);text-decoration:none}
.lx-sta a:hover span{text-decoration:underline}
.lx-stn{position:absolute;left:3px;top:5px;width:18px;height:18px;border-radius:50%;border:5px solid var(--lc);background:#fff;z-index:1}
.lx-sta span{font-size:14.5px;font-weight:800}
.lx-sta b{font-family:var(--mono);font-size:11.5px;font-weight:700;border:2px solid var(--ink);border-radius:999px;padding:0 8px;background:#fff;white-space:nowrap;line-height:1.55}
.lx-xt{font-size:10.5px;font-weight:800;text-decoration:none;color:#fff;background:var(--ink);border-radius:4px;padding:0 5px;line-height:1.5}
.lx-xf .lx-stn{border-color:var(--ink);box-shadow:0 0 0 3px #fff,0 0 0 5px var(--ink)}
.lx-cur .lx-stn{background:var(--lc);border-color:var(--ink)}
.lx-cur span{color:var(--acDk);box-shadow:inset 0 -3px 0 var(--ac)}

/* ── 환승 안내 ────────────────────────────────── */
.lx-xfer{list-style:none;margin:0;padding:0;display:grid;gap:6px 14px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.lx-xfer a{display:flex;align-items:center;gap:8px;padding:6px 10px;border:2px solid var(--ink);border-radius:999px;color:var(--ink);text-decoration:none;background:#fff}
.lx-xfer a:hover{background:var(--acSoft)}
.lx-ring{flex:none;width:14px;height:14px;border-radius:50%;border:3px solid var(--ink);background:#fff;box-shadow:0 0 0 2px #fff,0 0 0 4px var(--ink);margin:0 3px 0 2px}
.lx-xfer span{font-size:14px;font-weight:800}
.lx-xfer b{margin-left:auto;font-family:var(--mono);font-size:11.5px;font-weight:700;color:var(--dim);white-space:nowrap}

/* ── 반분선 수첩 목록 ──────────────────────────── */
.lx-posts{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.lx-posts a{display:block;padding:8px 6px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--rule)}
.lx-posts a:hover{background:var(--acSoft)}
.lx-posts time{display:block;font-size:11.5px;color:var(--dim);font-family:var(--mono)}
.lx-posts b{display:block;font-size:15px;line-height:1.5}
.lx-posts span{display:block;color:var(--dim);font-size:13px;line-height:1.6}

/* ── 모양이 닮은 곳 ───────────────────────────── */
.lx-ths{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.lx-th{border:2px solid var(--ink);border-radius:10px;overflow:hidden}
.lx-th h3{margin:0;padding:5px 10px;font-size:13px;font-weight:800;color:#fff;background:var(--ink)}
.lx-th ol{list-style:none;margin:0;padding:6px 10px 8px;display:grid;gap:2px}
.lx-th li{display:flex;justify-content:space-between;gap:8px;font-size:14px}
.lx-th li::before{content:"";width:9px;height:9px;border-radius:50%;border:3px solid var(--ac);margin:6px 6px 0 0;flex:none}
.lx-th li a{margin-right:auto}
.lx-th b{font-size:11.5px;color:var(--dim);font-weight:700;white-space:nowrap;font-family:var(--mono)}

/* ── 문서·금액 ────────────────────────────────── */
.lx-ck{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.lx-ck li{padding:6px 6px 6px 30px;position:relative;font-size:14.5px;border-bottom:1px solid var(--rule)}
.lx-ck li::before{content:"✓";position:absolute;left:6px;top:6px;font-weight:800;color:var(--ac)}
.lx-no li::before{content:"×";color:var(--acDk);font-size:17px;top:3px}
.lx-lad{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.lx-lad a{display:grid;grid-template-columns:80px minmax(0,1fr) 88px;gap:10px;align-items:center;color:var(--ink);padding:5px 6px;font-size:14px;text-decoration:none;border-bottom:1px solid var(--rule)}
.lx-lad a:hover{background:var(--acSoft)}
.lx-lad s{display:block;height:6px;border-radius:3px;width:calc(var(--w) * 1%);text-decoration:none;background:var(--ac)}
.lx-lad b{text-align:right;font-weight:800;font-size:13.5px;font-family:var(--mono)}
.lx-cases{list-style:none;margin:0;padding:0;display:grid;gap:0 16px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.lx-cases a{display:block;padding:7px 6px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--rule)}
.lx-cases a:hover{background:var(--acSoft)}
.lx-cases b{display:block}.lx-cases span{color:var(--dim);font-size:13px}
.lx-cmp{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.lx-cmp li{padding:5px 6px;border-bottom:1px solid var(--rule)}
.lx-cmp li>a,.lx-cmp li>div{display:grid;grid-template-columns:64px minmax(0,1fr) 84px;gap:8px;align-items:center;color:var(--ink);text-decoration:none}
.lx-cmp li>a:hover{background:var(--acSoft)}
.lx-cmp li.me{background:var(--acSoft)}
.lx-cmp-n{font-weight:800;font-size:14px}
.lx-cmp-t{display:flex;align-items:center;gap:6px}
.lx-cmp-t s{display:block;height:6px;border-radius:3px;width:calc(var(--w) * 1%);text-decoration:none;background:var(--ink)}
.lx-cmp-t em{font-style:normal;font-size:11.5px;color:var(--dim)}
.lx-cmp-p{text-align:right;font-weight:800;font-size:13px;font-family:var(--mono)}
.lx-cmp small{display:block;color:var(--dim);font-size:12px}
.lx-doc section{padding:8px 0;border-bottom:1px solid var(--rule)}
.lx-doc h2{font-size:14.5px;margin:0 0 2px;color:var(--acDk)}
.lx-doc p{margin:0;font-size:14px}
.lx-piece{padding:18px 18px 8px 56px;margin:0;position:relative}
.lx-piece::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
.lx-piece h2{font-size:17px;margin:1.3em 0 .4em;padding-bottom:3px;border-bottom:3px solid var(--ac)}
.lx-piece p,.lx-piece ul{margin:0 0 .9em}
.lx-piece ul{padding-left:1.2em}
.lx-dated{color:var(--dim);font-size:12.5px;margin:0;padding:10px 18px 0 56px;font-family:var(--mono);position:relative}
.lx-dated::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
@media (max-width:560px){.lx-piece,.lx-dated{padding-left:46px}.lx-piece::before,.lx-dated::before{left:17px}}

/* ── 종합 안내판 첫 칸 ─────────────────────────── */
.lx-door{padding:18px 18px 16px 56px;position:relative}
.lx-door::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:6px;background:var(--lc)}
.lx-door-sl{margin:2px 0 8px;font-size:19px;font-weight:800;line-height:1.5;letter-spacing:-.03em;word-break:keep-all}
.lx-door-p{margin:0 0 14px;color:var(--dim);font-size:14.5px}
.lx-door-cta{margin:0 0 14px}
.lx-door-f{margin:0 0 14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border:2px solid var(--ink);border-radius:10px;overflow:hidden}
.lx-door-f>div{padding:7px 10px;border-right:1px solid var(--rule)}
.lx-door-f>div:last-child{border-right:0}
.lx-door-f dt{margin:0;font-size:12px;color:var(--dim);font-weight:700}
.lx-door-f dd{margin:0;font-weight:800;font-size:14px}
.lx-door-cap{margin:0 0 4px;font-size:12.5px;font-weight:700;color:var(--acDk)}
@media (max-width:560px){.lx-door{padding-left:46px}.lx-door::before{left:17px}}
.lx-lines{display:grid;gap:8px}
.lx-ln{border:2px solid var(--ink);border-radius:12px;background:#fff;overflow:hidden}
.lx-ln summary{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;padding:9px 12px;cursor:pointer;list-style:none;background:var(--paper2)}
.lx-ln summary::-webkit-details-marker{display:none}
.lx-ln summary strong{font-size:16px}
.lx-ln summary span{font-size:12.5px;color:var(--dim)}
.lx-ln summary em{margin-left:auto;font-style:normal;font-size:12px;color:var(--acDk);font-family:var(--mono);font-weight:700}
.lx-ln summary::after{content:"+";font-weight:800;font-size:18px;line-height:1;color:var(--ink)}
.lx-ln[open] summary::after{content:"−"}
.lx-ln[open] summary{border-bottom:2px solid var(--ink)}
.lx-ln .lx-x{padding:0 12px;margin:8px 0 0}
.lx-ln .lx-map{padding:0 12px 10px}
.lx-sp{width:100%;border-collapse:collapse}
.lx-sp th,.lx-sp td{padding:8px 0;vertical-align:top;text-align:left;display:block}
.lx-sp tr{display:block;margin:0;padding:4px 6px;border-bottom:1px solid var(--rule)}
.lx-sp th b{font-size:15px;font-weight:800;margin-right:8px}
.lx-sp th em{font-style:normal;font-size:12px;color:var(--acDk);font-weight:700}
.lx-sp th .lx-pl{display:block;float:left;margin:0 10px 0 0}
.lx-sp small{display:block;color:var(--dim);font-size:12.5px;margin-bottom:3px;line-height:1.6}
.lx-sp ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 14px}
.lx-sp ol li{font-size:13.5px}
.lx-sp ol b{margin-left:5px;font-size:11.5px;color:var(--dim);font-family:var(--mono)}
.lx-sp tr::after{content:"";display:block;clear:both}

/* ── 접이식 칸 ────────────────────────────────── */
.lx-fold>summary{cursor:pointer;display:inline-block;font-size:12.5px;font-weight:800;color:var(--ink);padding:3px 12px;list-style:none;border:2px solid var(--ink);border-radius:999px;background:#fff}
.lx-fold>summary::-webkit-details-marker{display:none}
.lx-fold>summary::before{content:"+ "}
.lx-fold[open]>summary::before{content:"− "}
.lx-fold[open]>summary{margin-bottom:8px}

/* ── 종점 안내판(발) ──────────────────────────── */
.lx-foot{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));background:var(--ink);color:#E8EAF0;border-top:6px solid var(--ac)}
@media (max-width:820px){.lx-foot{grid-template-columns:1fr}}
.lx-fc{padding:16px 18px 10px;border-right:1px solid #2F3442}
.lx-fc:nth-child(3){border-right:0}
@media (max-width:820px){.lx-fc{border-right:0;border-bottom:1px solid #2F3442}}
.lx-fc h2{font-size:12.5px;margin:12px 0 6px;color:#F4A9C8;font-weight:800;padding-bottom:3px;border-bottom:1px solid #2F3442}
.lx-fc h2:first-of-type{margin-top:0}
.lx-fc p{margin:0 0 9px;font-size:13.5px}
.lx-fc a{color:#fff}
.lx-chips{display:flex;flex-wrap:wrap;gap:5px 12px}
.lx-chips a{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:#fff;text-decoration:none}
.lx-chips a:hover{text-decoration:underline}
.lx-chips .lx-bd{min-width:19px;height:19px;font-size:11px;box-shadow:0 0 0 2px #fff}
.lx-fl{list-style:none;margin:0 0 9px;padding:0;font-size:13px}
.lx-fl li{display:grid;padding:3px 0}
.lx-fl time,.lx-fs{font-size:12px;color:#C9CEDA}
.lx-foot-end{grid-column:1/-1;padding:10px 18px 12px;font-size:12px;background:#0C0E13;color:#C9CEDA}
.lx-foot-end p{margin:0 0 6px}
.lx-pale{opacity:.9}
.lx-ai{padding-top:8px;border-top:1px dotted #4A5064;line-height:1.8}
.lx-cr,.lx-biz{font-size:12px}

/* ── 아래에 붙는 접수 띠 ──────────────────────── */
.lx-dock{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;align-items:center;justify-content:center;gap:14px;padding:8px 14px calc(8px + env(safe-area-inset-bottom));background:var(--paper);border-top:4px solid var(--ac);box-shadow:0 -3px 10px rgba(20,23,31,.22);transition:transform .2s}
.lx-dock.hide{transform:translateY(130%)}
.lx-dock-s{font-size:12.5px;font-weight:700;color:var(--ink)}
@media (max-width:480px){.lx-brand b{font-size:22px}.lx-dock{gap:8px}.lx-dock-s{font-size:11.5px}}
`;

const JS = `(function(){
  var d=document.querySelector('.lx-dock'),f=document.querySelector('.lx-foot');
  if(!d||!f||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){d.classList.toggle('hide',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(f);
})();`;

/* 마크 — 노선선 위에 놓인 두 정거장, 위쪽 큰 원이 환승역 */
const MK = '<rect x="2" y="2" width="36" height="36" rx="10" fill="#FFFFFF"/><path d="M12 31V16Q12 10 18 10H28" fill="none" stroke="#D10557" stroke-width="5" stroke-linecap="round"/><circle cx="12" cy="31" r="4.2" fill="#FFFFFF" stroke="#14171F" stroke-width="2.6"/><circle cx="29" cy="10" r="5.4" fill="#FFFFFF" stroke="#14171F" stroke-width="3"/><circle cx="29" cy="10" r="1.8" fill="#14171F"/>';
export const MARK = () => `<svg class="lx-mk" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${MK}</svg>`;
const FAVICON = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#14171F"/>${MK}</svg>`;
const LOGO = (cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 48"><rect width="330" height="48" fill="#14171F"/><g transform="translate(4 4)">${MK}</g><text x="52" y="31" font-family="sans-serif" font-size="23" font-weight="800" fill="#FFFFFF">${cfg.brand.ko}</text><text x="170" y="31" font-family="ui-monospace,monospace" font-size="12" fill="#F4A9C8" letter-spacing="3">${cfg.brand.en.toUpperCase()}</text></svg>`;
const OG = (cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#F6F5F0"/>
<rect x="0" y="0" width="1200" height="120" fill="#14171F"/>
<text x="60" y="80" font-family="sans-serif" font-size="46" font-weight="800" fill="#FFFFFF">${cfg.brand.ko}</text>
<text x="1140" y="78" text-anchor="end" font-family="monospace" font-size="24" fill="#F4A9C8" letter-spacing="4">${cfg.brand.en.toUpperCase()}</text>
<rect x="140" y="180" width="14" height="300" fill="#D10557"/>
<circle cx="147" cy="200" r="30" fill="#fff" stroke="#14171F" stroke-width="14"/>
<circle cx="147" cy="340" r="30" fill="#fff" stroke="#14171F" stroke-width="14"/>
<circle cx="147" cy="470" r="30" fill="#14171F" stroke="#fff" stroke-width="8"/>
<rect x="240" y="170" width="820" height="260" fill="#fff" stroke="#14171F" stroke-width="5" stroke-dasharray="14 10"/>
<path d="M290 360L330 230L470 200L600 260L760 210L900 300L830 395L640 410L460 395Z" fill="#FCE7F0" stroke="#14171F" stroke-width="5" stroke-linejoin="round"/>
<path d="M240 322H1060" stroke="#D10557" stroke-width="10"/>
<path d="M640 170V430" stroke="#14171F" stroke-width="10"/>
<circle cx="640" cy="322" r="18" fill="#D10557" stroke="#fff" stroke-width="6"/>
<text x="600" y="500" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="800" fill="#14171F">출장마사지 홈타이</text>
<text x="600" y="545" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#4C5262">${cfg.hours} · ${cfg.pay}</text>
<rect x="400" y="560" width="400" height="50" rx="25" fill="#D10557"/>
<text x="600" y="593" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="700" fill="#fff">${cfg.telLabel} ${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'lx.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'lx.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON());
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(cfg));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(cfg));
}
