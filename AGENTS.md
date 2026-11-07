# AI 에게 (Claude Code · Codex 공통)

이 레포는 도름스 스터디 리더가 기수 화면 전체를 꾸미는 키트다. README.md 를 먼저 끝까지 읽어라.

## 반드시 지킬 것

1. 결과물은 `npm run build` 가 만드는 `dist/index.html` 한 파일(1.5MB 이하). 바깥 스크립트 · CDN 라이브러리를 넣지 않는다.
2. 망 요청(fetch 류 · 소켓 · beacon), 새 창 열기, 주소 바꾸기, meta refresh 를 쓰지 않는다. 목록은 `scripts/rules.mjs`.
3. 데이터의 글(닉네임 · 후기 · 숙제 글 · 피드백 · 설문 답)은 textContent 로만 넣는다. 키트의 `h()` 를 쓰면 된다. innerHTML · insertAdjacentHTML · eval 금지.
4. 쓰기(신청 · 숙제 · 대체 과제 · 피드백 · 입장)는 `action(...)` 으로만 한다.
5. `member` · `self` · `leader` 칸은 null 일 수 있다. 손님 화면을 늘 함께 만든다.
6. 숫자 · 이름 · 글은 데이터 값 그대로. 없는 내용을 지어내지 않는다. 비면 "아직 ~가 없어요".
7. 360px 휴대폰부터 1200px 까지 반응형. 내용 길이만큼 자란다(100vh 금지).
8. 이모지 대신 SVG(`icon()`), 순백 대신 아이보리, 한국어, 긴 줄표 금지.

## 출입증

`get_study_kit_ticket` 으로 받은 출입증은 `DORMS_STUDY_TICKET` 환경 변수로만 넘긴다. 화면 출력 · 파일 · 커밋 · 대화 요약에 남기지 않는다.

## 끝내기 전에

`npm run dev` 의 '보는 사람' 단추로 손님 · 스터디원 · 리더 화면을 모두 보고, `npm run check && npm run build` 가 통과한 뒤 `npm run submit` 한다.
