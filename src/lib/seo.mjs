/**
 * 타이틀·디스크립션 정본. 토막 구분은 ' | '.
 *   럭스테라피 `{동} 출장마사지 홈타이 | {구} {코스어} | {행동어} 럭스테라피`
 * 설명문은 100자 안쪽. 가운데는 그 자리에서만 나오는 계산값(두 반분선의 길이·교차점의 치우침·긴 쪽 비)으로 채운다.
 */
import { hash, km2 } from './util.mjs';
import { fl, pc, clsName, shiftWord, longName, dir8 } from '../content/metric.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '럭스테라피';
const KEY = '출장마사지 홈타이';
const COURSE_WORD = ['스웨디시', '아로마', '딥티슈', '타이', '경락', '건식', '림프', '지압', '스포츠'];
const ACT = ['번호 하나로 접수', '관리가 끝난 뒤 정산', '새벽에도 승차 접수', '주소와 호수만으로 접수', '출발 문자로 도착 안내'];
const money = (n) => n.toLocaleString('ko-KR');

export const title = {
  home: (c) => `${BRAND} ${KEY} | 동마다 땅을 반으로 가른 두 직선을 그어 둔 지역 안내 | ${c ? `동 ${c.spot}곳` : '동 단위'} 후불`,
  areaHub: (c) => `${KEY} 방문 노선도 | 동 ${c.spot}곳 시군구 ${c.gu}곳 | ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} | ${sd.main ? `동 ${sd.spotCount}곳 평균 치우침 ${pc(sd.avgA / 10)}` : `시군구 ${sd.gu.length}곳 평균 치우침 ${pc(sd.avgA / 10)}`} | ${at(hash(sd.name, 'sdt'), ACT)} ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}곳` : g.main ? `읍면 ${g.ruralCount}곳` : `행정동 ${g.dongCount}곳`;
    return `${g.name} ${KEY} | ${sd.name} ${unit} 치우침 ${pc(g.x.off)} | ${at(h, ACT, 0)} ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} | ${g.name} ${at(h, COURSE_WORD, 0)} | ${at(h, ACT, 1)} ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} | ${c.min}분 ${money(c.price)}원 | 압 ${c.pressure} ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} | ${sd.name} 방문 | ${at(hash(sd.name, c.slug), ACT)} ${BRAND}`,
  page: (t) => `${t} | ${BRAND} ${KEY}`,
  post: (p) => `${p.title} | ${BRAND} 반분선 수첩`,
};

function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `교차점이 상자 중앙에서 ${pc(s.x.off)} 벗어난 동`,
    () => `남북 반분선 ${fl(s.x.nl)}, 동서 반분선 ${fl(s.x.el)}`,
    () => `${clsName(s.cls)}, 치우침 ${pc(s.x.off)}`,
    () => `${g.name}에서 ${s.gRank}번째로 크게 치우친 동`,
    () => `땅 ${km2(s.area)}, 긴 쪽 비 ${s.x.rt}배`,
    () => `땅의 무게가 상자 ${dir8(s.x) === '중앙' ? '정중앙' : `중앙에서 ${dir8(s.x)}`}에 놓인 동`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = ['후불 정산', '선입금 없음', '거리 할증 없음', '심야 요금 동일', '정산은 관리 후 한 번'];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () => '출장마사지 홈타이 안내. 서울·인천·경기·부산은 동까지, 고른 시·군은 시군구까지 열었고 쪽마다 반분선 두 줄이 만나는 점을 적었습니다.',
  areaHub: (c) => `출장마사지 홈타이가 닿는 동 ${c.spot}곳과 시군구 ${c.gu}곳의 노선도입니다. 곳마다 반분선과 교차점의 치우침을 함께 실었습니다.`,
  sido: (sd) => (sd.main
    ? `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}곳을 다뤘고 동의 평균 치우침은 ${pc(sd.avgA / 10)}입니다.`
    : `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳까지 화면이 있고 동 이름은 그 안에 실었습니다. 후불, 심야 접수.`),
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}곳을 열었고 땅 전체의 치우침은 ${pc(g.x.off)}`,
        `교차점이 가장 크게 벗어난 동은 ${g.hi}, 가장 작게 벗어난 동은 ${g.lo}`,
        `반분선 길이는 남북 ${fl(g.x.nl)}, 동서 ${fl(g.x.el)}, ${clsName(g.cls)}으로 분류`,
        `땅 폭 대비 긴 쪽 비가 가장 큰 동은 ${g.bHi}(${(g.bHiV / 10).toFixed(1)}배)`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}곳이 전부 읍·면이라 이 한 장에서 받음`,
          `읍 ${g.eupCount}곳과 면 ${g.myeonCount}곳은 이름만 수록`,
          `땅 ${km2(g.area)}, 치우침 ${pc(g.x.off)}, ${clsName(g.cls)}`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}곳을 포함하며 분류는 ${clsName(g.cls)}`,
          `치우침 ${pc(g.x.off)}, 땅 넓이 ${km2(g.area)}`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}곳까지 방문` : `동 ${g.dongNames.length}곳 모두 한 번호로 접수`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) => `${c.ko} 출장 방문. ${c.focus} 중심, 압은 ${c.pressure}. ${c.min}분에 ${money(c.price)}원, 지역이 달라도 금액은 같습니다.`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY}. ${sd.name} 전역에서 ${c.min}분 ${money(c.price)}원, 압 ${c.pressure}, 후불 정산.`,
  post: (p) => p.summary,
};

export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
