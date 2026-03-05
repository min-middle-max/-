# 08 - Dashboard Dual Window Template

## 포함 파일
- `1_App.jsx`: 메인 스토어와 대시보드를 분리한 React 컴포넌트
- `2_App.css`: 대시보드/스토어 UI 스타일

## 핵심 기능
- 메인 홈에는 스토어 화면만 표시
- 상단 `대시보드` 버튼 클릭 시 새 창(`?dashboard=1`)으로 대시보드 오픈
- 대시보드에서 수정한 설정/상품이 스토어 창에 실시간 반영 (`localStorage` + `storage` event)
- 서버 공유 저장 사용 시 `/api/state`로 PC/모바일 데이터 동기화
- 우측 상단 로그인/회원가입 미니 패널
- 상품 추가/수정/삭제 지원
- 결제 버튼 클릭 시 `/api/payments/checkout`로 주문 저장 및 주문번호 표시
: `payment-config.json`이 `toss`면 Toss 결제창, 아니면 Mock 결제
- 상단 메뉴 클릭 동작: `신상품(NEW만)`, `베스트(판매량 순)`, `이벤트(예시 콘텐츠)`, `공지사항(우측 패널 공지 본문)`
- `Template Preview`(눈썹 텍스트) 대시보드에서 수정 가능

## 적용 방법
1. `1_App.jsx` 내용을 `src/App.jsx`에 반영
2. `2_App.css` 내용을 `src/App.css`에 반영
3. `npm run build` 또는 `npm run dev` 실행
