/**
 * 사이트 한 곳의 고정값 — 시드 소금, 클래스 접두사, 쪽마다 칸 순서, 구조화 데이터 문구.
 */
export const SALT = 'luxetherapy-halving-line';
export const P = 'lx';

/** 쪽 종류마다 칸이 놓이는 순서. 이름은 pages/*.mjs 의 parts 키다. */
export const LAYOUT = {
  spot: ['open', 'facts', 'spotidx', 'kin', 'courses', 'hail', 'faq', 'steps', 'notice', 'guidx', 'theme', 'topics'],
  gu: ['open', 'facts', 'idx', 'rural', 'kin', 'courses', 'hail', 'faq', 'steps', 'notice', 'guidx', 'theme', 'posts', 'topics'],
  sido: ['open', 'facts', 'guidx', 'pick', 'hail', 'courses', 'cslinks', 'steps', 'faq', 'theme', 'posts', 'topics'],
  course: ['open', 'facts', 'compare', 'hail', 'faq', 'steps', 'notice', 'theme', 'posts', 'topics'],
  sidoCourse: ['open', 'facts', 'courses', 'hail', 'guidx', 'names', 'faq', 'steps', 'theme', 'posts', 'topics'],
};

export const SC = {
  orgDesc: (cfg) => `${cfg.coverage.main.join('·')}은 동 단위로, ${cfg.coverage.sub.join('·')}은 시군구 단위로 접수하며 지역마다 땅을 반반으로 가르는 두 직선의 교차점을 함께 적어 둔 출장마사지·홈타이 안내`,
  serviceType: '출장마사지 홈타이 방문 접수',
  catalog: '코스 운임표',
  offerName: (c) => `${c.ko} ${c.min}분`,
  offered: (c) => `${c.ko} 출장마사지`,
  supply: ['누울 수 있는 방 한 칸', '덮을 수건'],
  tool: ['전화'],
  regNoLabel: '사업자등록번호',
  areaLabel: '넓이',
  speakable: ['h1', '.lx-lead p', '.lx-qa h3', '.lx-qa p'],
  siteName: (cfg) => `${cfg.brand.ko} 출장마사지`,
};

export const RSS_DESC = (cfg) => `${cfg.brand.ko}가 동마다 땅을 반분하는 두 직선을 그어 적은 수첩과 방문 관리 이용 글`;
export const GENERATOR = 'luxetherapy-ssg';
export const MANIFEST_DESC = (counts) => `동 ${counts.spot}곳과 시군구 ${counts.gu}곳의 넓이 반분선과 교차점 치우침을 적은 출장마사지 홈타이 안내`;
export const LLMS = ({ cfg, siteUrl, regions, courses, counts, data, mainR, subR, won, fm }) => `# ${cfg.brand.ko} (${cfg.brand.en})

> 점포 없이 전화만 받고 알려 주신 주소로 관리사가 찾아가는 출장마사지·홈타이 안내입니다. 지역 화면마다 땅을 넓이로 반분하는 두 직선과 그 교차점이 경계 상자 중앙에서 벗어난 정도를 적었습니다. 서울·인천·경기·부산은 시도, 시군구, 동 순으로 내려가고 나머지 시도는 시군구에서 끝납니다. 어느 지역이든 번호와 금액은 하나입니다.

## 사실 요약
- 동 화면이 있는 시도: ${mainR.map((r) => `${r.name}(시군구 ${r.gu.length}·동 ${r.spotCount})`).join(', ')}
- 시군구 화면까지 있는 시도: ${subR.map((r) => `${r.name}(${r.gu.length})`).join(', ')}
- 화면은 시군구 ${counts.gu}개와 동 ${counts.spot}개이며, 읍 ${counts.eup}곳과 면 ${counts.myeon}곳은 화면 없이 이름만 목록에 있습니다.
- 접수 번호는 ${cfg.tel}이고 화면에서는 '${cfg.telLabel}' 버튼으로만 보입니다.
- 전화 응대 ${cfg.hours}, 현관 앞 도착 ${cfg.arrive}.
- 대금은 ${cfg.pay}이며 예약금, 보증금, 교통비, 심야 할증, 취소 수수료가 없습니다.
- 코스: ${courses.map((c) => `${c.ko} ${c.min}분 ${won(c.price)}원(압 ${c.pressure}, 오일 ${c.oil ? '사용' : '미사용'})`).join(' / ')}
- **재는 값은 넓이 반분선입니다.** 동 땅을 동서로 뻗은 직선으로 가를 때 북쪽과 남쪽의 넓이가 같아지는 자리(남북 반분선), 남북으로 뻗은 직선으로 가를 때 동쪽과 서쪽의 넓이가 같아지는 자리(동서 반분선)를 이분법으로 찾았습니다.
- 함께 적는 값: 각 선이 땅 안에서 이어지는 길이와 토막 수, 두 선의 교차점이 경계 상자 중앙에서 북남·동서로 벗어난 %, 두 선 중 긴 쪽과 그 비.
- 분류는 일곱 가지입니다: 정중앙형(치우침 2.5% 미만), 살짝 어긋난형, 꽤 어긋난형, 많이 어긋난형, 가장자리형(14% 이상), 동서로 긴형, 남북으로 긴형(두 선의 길이비 1.8배 이상).
- 동 화면 ${counts.spot}개의 치우침은 ${(counts.aq.min / 10).toFixed(1)}%에서 ${(counts.aq.max / 10).toFixed(1)}%까지이고 가운데값은 ${(counts.aq.mid / 10).toFixed(1)}%입니다. 가장 크게 치우친 동은 ${counts.hiName}, 가장 작게 치우친 동은 ${counts.loName}입니다.
- 경계 자료가 단순화되어 있어 실제 지형과 다를 수 있고, 도로 사정이나 이동 시간과는 관계없는 값입니다.
- 만 19세 미만은 받지 않습니다.
- 하지 않는 일: 성적 서비스, 의료 행위, 후기와 별점 게시, 인물 사진.

## 주요 문서
- [승차 안내](${siteUrl}/guide/): 준비 사항, 전화 응대 시간, 접수를 받지 못하는 경우
- [운임표](${siteUrl}/price/): 코스별 금액과 붙지 않는 항목
- [승차권 종류](${siteUrl}/course/): ${courses.length}가지를 시간, 압, 오일 여부로 한 표에 정리
- [노선도](${siteUrl}/area/): 시군구 ${counts.gu}개와 동 ${counts.spot}개
- [소개](${siteUrl}/company/): 하는 일, 하지 않는 일, 반분선을 찾는 방법
${regions.map((r) => `- [${r.name}](${siteUrl}/${r.slug}/): ${r.main ? `시군구 ${r.gu.length}개 · 동 ${r.spotCount}개` : `시군구 ${r.gu.length}개`}`).join('\n')}

## 자료 출처
행정동 이름·경계·중심점·넓이: ${data.source} (${data.version})
넓이 반분선: 경계 다각형의 넓이가 반으로 갈리는 위도와 경도를 60회 이분법으로 좁혀 구하고, 그 직선이 땅 안에 놓인 길이를 10m 단위로 적었습니다.
화면을 낸 기준: ${data.coverageFrom}

## 전체 주소 목록
${siteUrl}/sitemap.xml
`;
