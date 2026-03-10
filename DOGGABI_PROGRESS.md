# 먹방도깨비 작업 정리 (처음 ~ 현재)

작성일: 2026-03-10 (Asia/Seoul)

## 1) 작업 목표
- 로밍도깨비 제안서 기반으로 "보여줄 수 있는" 시연용 프로토타입을 빠르게 구축
- 핵심 시나리오 3개 + 관리자 대시보드 + 운영 로그 확인 가능 상태까지 구성

## 2) 실제 작업 환경
- 로컬 프로젝트: `sopumshop`
- 실구현 서버: `root@192.168.64.11`
- 배포 앱 경로: `/root/mukbang-dokkaebi-demo`
- 서비스 포트: `8080`

## 3) 구현한 기능
### A. 사용자 시나리오
- 입국 즉시 추천 (`/api/arrival`)
- 실시간 500m 레이더 (`/api/radar`)
- 목적지 연계 추천 (`/api/destination`)

### B. 관리자 대시보드
- 트래픽/유입 지표
- 감성 분석 요약
- 가짜 리뷰 후보
- ROI 지표 (`/api/dashboard`)

### C. 위치기반 크롤링 시연 (추가)
- 엔드포인트: `/api/crawl/location`
- 입력: `lat`, `lng`, `radius`, `city(optional)`
- 출력: 단계별 처리(`steps`) + Top 추천 결과
- 처리 단계:
  1. 위치 수신 및 cell 키 생성
  2. 도시 추정
  3. 소스별 raw 수집
  4. 반경 필터링
  5. 중복 제거
  6. 감성/적합도 점수화 후 TopN 반환

## 4) 운영/배포 작업
- `python3` 설치 (서버 런타임 준비)
- `systemd` 서비스 등록: `mukbang-dokkaebi-demo.service`
- 부팅 시 자동실행 활성화
- 방화벽 `8080/tcp` 오픈
- 요청 로그 즉시 반영을 위해 flush 처리 적용

## 5) 검증한 내용
- `systemctl is-active mukbang-dokkaebi-demo.service` -> `active`
- `curl http://127.0.0.1:8080/health` 정상 응답
- 시나리오 API 4종 + 크롤링 API 응답 확인
- `journalctl -u mukbang-dokkaebi-demo.service`에서 요청 로그/크롤링 단계 로그 확인

## 6) 서버 기준 변경 파일
- `/root/mukbang-dokkaebi-demo/server.py`
- `/root/mukbang-dokkaebi-demo/static/index.html`
- `/root/mukbang-dokkaebi-demo/static/styles.css`
- `/root/mukbang-dokkaebi-demo/static/app.js`
- `/root/mukbang-dokkaebi-demo/README.md`
- `/etc/systemd/system/mukbang-dokkaebi-demo.service`

## 7) 데모 호출 예시
```bash
# 1번 시나리오(입국 추천)
curl -s 'http://192.168.64.11:8080/api/arrival?airport=ICN'

# 위치기반 크롤링 시연
curl -s 'http://192.168.64.11:8080/api/crawl/location?lat=34.6687&lng=135.5019&radius=2500&city=osaka'

# 로그 추적
journalctl -u mukbang-dokkaebi-demo.service -f
```

## 8) 참고
- 이번 내용은 서버에 직접 구현/배포된 결과를 정리한 문서임
- 실제 외부 API 키 기반 크롤링(Google Places 등)은 아직 목업 단계이며, 다음 단계에서 실연동 가능
