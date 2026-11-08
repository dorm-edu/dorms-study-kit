# 도름스 스터디 꾸미기 키트

도름스(dorms.school) 스터디 리더가 **기수 화면 전체**를 내 마음대로 꾸미는 시작 키트예요.
소개, 커리큘럼과 회차, 함께하는 선생님, 숙제, 대체 과제, 피드백 방, 돌아보기까지 한 페이지 안에서 원하는 모습으로 만들 수 있어요.

## 가장 쉬운 길

도름스 스터디 기수 화면 → **꾸미기** 탭 → **페이지 전체 꾸미기** 에서 프롬프트를 복사해 클로드 코드나 코덱스에 붙여 넣으세요.
AI 가 이 키트를 받아 도름스에 연결하고, 견본 데이터로 만든 뒤 검토 요청까지 해요. 도름스 운영자가 미리 보고 승인하면 기수 화면이 그 디자인으로 바뀌어요.

## 직접 해 볼 때

```bash
git clone --branch v0.2.0 https://github.com/dorm-edu/dorms-study-kit my-study
cd my-study
npm install
npm run dev          # 견본 데이터로 띄워요. 아래 '보는 사람' 단추로 손님 · 스터디원 · 리더 화면을 바꿔 봐요.
```

우리 기수의 견본을 받으려면 도름스 MCP 의 `get_study_kit_ticket` 으로 출입증을 받아 넘겨요(30분 동안 써요).

```bash
DORMS_STUDY_TICKET=<출입증> npm run pull     # sample/data.json 이 생겨요
npm run check && npm run build               # dist/index.html 한 파일이 생겨요
DORMS_STUDY_TICKET=<출입증> npm run submit -- --note "운영자에게 남길 말"
```

AI 없이 만들었다면 도름스 꾸미기 탭의 **HTML 올리기** 로 `dist/index.html` 을 올려도 돼요.

## 데이터는 이렇게 들어와요

도름스에 올리면 화면이 열리기 전에 `window.DORMS_DATA` 에 데이터가 들어가요. 모양은 `src/kit/types.ts` 에 있어요.

| 칸 | 누가 받나 | 무엇이 있나 |
|---|---|---|
| 공개 값 | 누구나 | 스터디 소개 · 리더와 멘토 · 안내 글 · 커리큘럼과 회차 · 완주한 선생님 · 공개를 고른 후기 · 함께 해낸 숙제 |
| `member` | 이 기수 스터디원 · 리더 · 멘토 | 함께하는 선생님과 진도 · 숙제와 대체 과제 목록 · 인정된 숙제 글 · 피드백 방 |
| `self` | 로그인한 사람 | 내 신청 상태 · 출석 · 숙제와 대체 과제 상태 |
| `leader` | 리더 | 확정 전 신청자 · 신청 설문 답 |
| `boards` | 공개 칸은 누구나, 나머지 칸은 스터디원 · 리더 · 멘토 | 리더가 도름스 '보드' 탭에서 만든 칸(시작하기 · 프롬프트 모음 · 자료실 같은 것)과 카드 |

받지 못한 칸은 `null` 이에요. 손님에게 보일 화면도 꼭 만들어 주세요.
`npm run pull` 로 받는 견본은 공개 값만 실제이고, 나머지 칸은 같은 모양의 가짜예요. 선생님들이 쓴 글은 도름스 안에서만 들어가요.

## 신청 · 숙제 내기 · 피드백 쓰기

꾸민 화면이 직접 저장하지 않아요. `action(...)` 단추를 누르면 도름스 창이 떠서 거기서 내요. 창을 닫으면 화면이 최신 데이터로 다시 그려져요.

```ts
import { action } from "./kit/dorms";
action({ name: "homework.submit", homeworkId: hw.id });
```

부를 수 있는 것: `apply`(신청) · `homework.submit` · `makeup.submit` · `room.write`(주차 기록) · `room.feedback` · `session.enter`(연수 입장) · `board.write`(보드 칸에 카드 쓰기, `boardId`) · `board.edit`(카드 고치기, `cardId`).

## 보드: 글을 HTML 에 박지 말고 도름스에 두기

리더 · 멘토 · 스터디원이 글을 올리고 고치는 칸은 HTML 에 글을 적어 두지 말고 `data.boards` 로 그려요.
칸은 리더가 도름스 기수 화면의 '보드' 탭에서 만들고, 칸마다 누가 쓸지(리더 · 멘토만 / 스터디원도)를 골라요.
화면은 칸의 `canWrite` 가 참이면 '카드 쓰기'(`board.write`) 단추를, 카드의 `canEdit` 가 참이면 '고치기'(`board.edit`) 단추를 달면 돼요. 예시는 `src/kit/parts.ts` 의 `boards()`.

## 지킬 것

- 결과는 `dist/index.html` 한 파일, 1.5MB 이하.
- 망 요청(fetch 류 · 소켓) · 새 창 열기 · 주소 바꾸기 · 바깥 스크립트는 쓰지 않아요. 도름스 안에서는 막혀요. `npm run check` 가 걸러요.
- 회원이 쓴 글은 `textContent`(키트의 `h()`)로 넣어요. `innerHTML` 은 쓰지 않아요.
- 링크는 데이터의 `href`(도름스 주소)로 걸어요. 도름스 안에서 그 화면으로 넘어가요.
- 이모지 대신 SVG 아이콘, 순백 대신 아이보리, 긴 줄표 대신 쉼표.

## 라이선스

MIT
