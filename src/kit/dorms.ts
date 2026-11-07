/**
 * 도름스와 이어 주는 작은 다리. 꾸민 화면은 이 파일의 함수로만 도름스와 이야기한다.
 *
 *  - loadData(): 도름스 안에서는 도름스가 넣어 준 window.DORMS_DATA, 내 컴퓨터(npm run dev)에서는 sample/ 의 견본.
 *  - action(a): 신청 · 숙제 내기 · 대체 과제 내기 · 피드백 쓰기 · 연수 입장. 누르면 도름스 창이 떠서 거기서 한다.
 *    꾸민 화면이 직접 저장하는 길은 없다(도름스가 막는다). 사람이 단추를 누른 직후에만 동작한다.
 *  - 링크는 그냥 <a href="/u/..."> 로 건다. 도름스 안에서는 누르면 그 도름스 화면으로 넘어간다.
 *
 * 쓰지 말 것: 망 요청(fetch 류 · 소켓) · 새 창 열기 · 주소 바꾸기. 도름스 안에서 막히고 npm run check 가 거른다(목록은 scripts/rules.mjs).
 */
import type { Action, StudyData, Tier } from "./types";

declare global {
  interface Window {
    DORMS_DATA?: StudyData;
    DORMS?: { data: StudyData; open: (href: string) => void; action: (name: string, args?: Record<string, unknown>) => void };
  }
}

export const inDorms = (): boolean => typeof window !== "undefined" && !!window.DORMS;

/** 개발 중 '보는 사람' 바꾸기(손님 · 스터디원 · 리더). 도름스 안에서는 쓰이지 않는다(서버가 정한다). */
export type DevViewer = "guest" | "member" | "leader";

export function asViewer(full: StudyData, who: DevViewer): StudyData {
  const tiers: Tier[] = who === "guest" ? ["public"] : who === "member" ? ["public", "member", "self"] : ["public", "member", "self", "leader"];
  return {
    ...full,
    viewer: { tiers, signedIn: who !== "guest", me: who === "guest" ? null : full.viewer.me },
    member: tiers.includes("member") ? full.member : null,
    self: tiers.includes("self") ? full.self : null,
    leader: tiers.includes("leader") ? full.leader : null,
  };
}

export async function loadData(devViewer: DevViewer = "member"): Promise<StudyData> {
  if (window.DORMS_DATA) return window.DORMS_DATA;
  if (import.meta.env.DEV) {
    const files = import.meta.glob<StudyData>("../../sample/*.json", { import: "default" });
    const pick = files["../../sample/data.json"] ?? files["../../sample/data.sample.json"];
    if (pick) return asViewer(await pick(), devViewer);
  }
  throw new Error("도름스 데이터가 없어요.");
}

export function action(a: Action): void {
  const { name, ...args } = a;
  if (window.DORMS) { window.DORMS.action(name, args); return; }
  devNotice(`도름스 안에서는 여기서 '${ACTION_LABEL[a.name]}' 창이 떠요.`);
}

export const ACTION_LABEL: Record<Action["name"], string> = {
  apply: "스터디 신청", "homework.submit": "숙제 내기", "makeup.submit": "대체 과제 내기", "room.write": "주차 기록 쓰기", "room.feedback": "피드백 쓰기", "session.enter": "연수 입장",
};

/** 내 컴퓨터에서만: 도름스 주소(/u/..)를 누르면 도름스 사이트를 새 창으로 연다. 도름스 안에서는 도름스가 처리한다. */
export function devLinks(site: string): void {
  if (inDorms() || !import.meta.env.DEV) return;
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.("a[href^='/']");
    if (!a) return;
    e.preventDefault();
    devNotice(`도름스 안에서는 ${site}${a.getAttribute("href")} 로 넘어가요.`);
  });
}

function devNotice(text: string): void {
  if (!import.meta.env.DEV) return;
  let el = document.getElementById("kit-dev-notice");
  if (!el) {
    el = document.createElement("div");
    el.id = "kit-dev-notice";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.dataset.show = "1";
  window.setTimeout(() => { if (el) el.dataset.show = ""; }, 2600);
}
