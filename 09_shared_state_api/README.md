# 09 - Shared State API (PC/Mobile Sync)

`localStorage`는 기기별로 분리되므로 PC에서 추가한 상품이 모바일에 자동 공유되지 않습니다.
이 폴더는 서버 저장소(`/api/state`)를 추가해 여러 기기에서 동일 데이터를 보게 하고, 결제 버튼과 연결되는 주문 API를 제공합니다.

## 파일
- `server.js`: Express API (`GET/PUT /api/state`, `POST /api/payments/checkout`, `GET /api/orders`)
- `store.json`: 초기 데이터
- `sopumshop-api.service`: systemd 서비스
- `nginx_api_location.conf`: nginx reverse proxy location 블록

## VM 적용 요약
1. `/srv/sopumshop/backend` 생성
2. `npm install express`
3. `server.js`, `data/store.json` 배치
4. `sopumshop-api.service` 등록/시작
5. nginx에 `/api/` 프록시 추가 후 reload
6. 프런트엔드에서 `/api/state` 읽기/쓰기
7. 프런트엔드 결제 버튼에서 `/api/payments/checkout` 호출
