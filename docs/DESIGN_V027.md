# DoCut v0.27 — 디자인·이펙트 고도화

개발 기준: v0.26 보존판 / 2026-11-06
범위: 기존 편집기 개선. 원본 보고서의 수치·본문·출처를 3자 템플릿으로 덮어쓰지 않는다.

## 1. 수정 배경과 설계 방향

DoCut은 단순히 배경색이 다른 슬라이드가 아니라, **시각적 위계가 다른 전문 보고서 구성**을 제공해야 한다. 이번 버전의 10종 신설 키트는 다음 디자인 언어를 바탕으로 독자 제작했다.

- 강한 결론 타이포그래피, 절제된 대비, 의사결정의 위계
- 금융·시장 보고서의 차트/메트릭 중심 구조, 전경과 시선 흐름
- 사내·공공기관 문서용 출처/기준일 표시 공간
- 콘텐츠를 손상하지 않는 빈 플레이스홀더 사용
- 16:9 1280 × 720을 기준으로 모든 블록의 좌표를 수치화해 편집 가능

설계 참고 사이트(디자인 언어만 참고, 원본 자산/템플릿을 복제하지 않음):

1. Pitch 템플릿 갤러리 — https://pitch.com/templates
2. Beautiful.ai 보고서/전략/인사이트 카테고리 — https://www.beautiful.ai/presentations
3. Canva 전문 프레젠테이션 — https://www.canva.com/presentations/templates/professional/
4. Slidesgo 기업·모던 분류 — https://slidesgo.com/professional

## 2. 20종 페이지 키트

기존 10종은 그대로 보존한다. 추가된 10종은 색상 차이만이 아니라 카드 개수·배치·서체 크기·간격·캡션 및 근거 영역이 다르다.

| 신규 ID | 에디터 표시 이름 | 구성 |
|:--|:--|:--|
| boardroom-noir | Boardroom Noir | 어두운 결론 우선형, 결정 근거 2개 |
| editorial-ledger | Editorial Ledger | 매거진형 제목과 분석 카드 |
| signal-intelligence | Signal Intelligence | 시장 지표 선그래프와 시사점 |
| capital-blueprint | Capital Blueprint | 재무 심사용 KPI 3종 |
| public-decision | Public Decision | 정책 문제·권고 2단 구성 |
| product-initiative | Product Initiative | 사업 제안·고객 가치와 검증 |
| human-impact | Human Impact | 직원·조직 중심 영향과 실행 |
| landscape-matrix | Landscape Matrix | 시장·경쟁 4분면 비교 |
| operating-rhythm | Operating Rhythm | 운영 현황·책임·후속 일정 |
| resolution-finale | Resolution Finale | 결정안의 강한 마무리 구조 |

기존 10종: Executive Brief, Problem Framing, Evidence Ledger, Option Comparison, Decision Memo, KPI Performance, Trend and Insight, Implementation Roadmap, Risk Register, Stakeholder Voices.

## 3. 실행 효과 및 89장 참고자료 구별

- 기존 레퍼런스 ZIP **89장은 JPEG 스크린샷의 사례 분류**이며, 실행 가능한 효과 89종을 의미하지 않는다. 현재 원본 JPEG 이미지 자체는 앱에 포함되지 않는다.
- 레퍼런스 인덱스는 디자인 탭 **`효과 레퍼런스 89장 보기`**에서 즉시 열고 검색할 수 있다.
- 실제 애니메이션 종류: **32종**. 프리셋(정의된 조합): **33종**.
- 새 효과 4종: `cursor-glow`, `cursor-tilt`, `ambient-aura`, `edge-light`.
- 새 복합 프리셋 4종: `cursor-spotlight`, `kinetic-card`, `cinematic-light`, `light-follow`.
- 하나의 요소가 **최대 세 효과**를 보유한다. 정적 광원 및 포인터 이펙트는 기존 재생 타임라인의 등장 모션과 분리해 작업한다.
- `prefers-reduced-motion` 설정을 준수해 엣지 라이트 반복 애니메이션과 커서 3D 기울임을 제한한다.

## 4. 편집기 기능

- `style.backgroundOpacity` (0.00–1.00)는 **배경 채움에만** 적용하고 텍스트/내용의 `style.opacity`와 분리한다. CSS 내보내기에서도 배경에만 rgba 변환을 사용한다.
- 마스터 로고는 원형(기본), 둥근 사각형, 사각형을 지원한다. 위치는 상단/하단 각 3위치 + 좌/우 중앙 = 8위치. 크기 28–180px, 여백 4–112px. 업로드 이미지는 데이터 URI로 보존한다.
- 마스터 글꼴 10종 제공. **선택 글꼴 전체 적용**은 각 페이지의 **잠금 해제된** 제목, 카드, 본문, 표 등에 적용하며 Undo를 지원한다.
- 사용자가 원하는 폰트 파일을 앱에 포함한 것은 아니다. OS/브라우저에 해당 글꼴이 없으면 대체 글꼴을 사용한다.
- PDF가 아닌 기본 출력은 HTML 및 PPTX이며, PPTX 로고는 PNG/JPG 권장이다. 브라우저의 마우스 인터랙션은 정적 PPTX에서 재현되지 않는다.
- 독립 HTML 내보내기에도 포인터 효과 및 원형 로고 스타일을 포함한다.

## 5. 검증

- `npm run check:syntax`: JavaScript 문법 검사 통과.
- `npm test`: **451개 통과**.
- `python tests/browser_v027.py`: Chromium의 요소 편집·모션·본문 보존·HTML 내보내기 검증.
- `python tests/browser_standalone_v027.py`: 번들된 HTML의 inline CSS/JS를 Chromium에서 검증. **실제 file:// 직접 이동은 테스트 환경의 보안 정책으로 차단**되었으므로 OS 파일 실행은 사용자 PC에서 추가 검증이 필요하다.
- 사이트 운영 서버 및 원격 GitHub에 대한 배포 상태는 이 문서에서 완료라고 주장하지 않는다.

## 6. 실행

```sh
python tools/build_standalone_editor_v027.py --output DoCut_Studio_v027_Offline.html
```

생성된 `.html` 파일 하나로 editor CSS/JS가 모두 포함되어 별도의 CDN 없이 사용 가능하다. 자동 저장은 브라우저 저장 정책의 영향을 받으므로 **상단의 `프로젝트` 버튼으로 JSON 백업**하는 것이 안전하다.
