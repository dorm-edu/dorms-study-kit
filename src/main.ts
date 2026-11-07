/**
 * 예시 화면. 이 파일을 마음껏 고쳐서 우리 스터디만의 화면을 만든다.
 * 칸은 해시 경로(#/intro 같은 것)로 오간다. 칸 이름은 d.tabs(리더가 도름스에서 바꾼 이름)를 쓴다.
 */
import "./style.css";
import { asViewer, devLinks, inDorms, loadData, type DevViewer } from "./kit/dorms";
import type { StudyData } from "./kit/types";
import { curriculum, guide, header, homework, leaderPanel, makeup, retro, room, roster } from "./kit/parts";
import { h } from "./kit/ui";

type Route = { key: string; label: string; render: (d: StudyData) => (HTMLElement | null)[]; show: (d: StudyData) => boolean };

const routes: Route[] = [
  { key: "intro", label: "", render: (d) => [guide(d), curriculum(d), leaderPanel(d)], show: () => true },
  { key: "members", label: "함께하는 선생님", render: (d) => [roster(d)], show: () => true },
  { key: "homework", label: "", render: (d) => [homework(d)], show: (d) => !!d.member },
  { key: "makeup", label: "", render: (d) => [makeup(d)], show: (d) => !!d.member && d.member.makeups.length > 0 },
  { key: "room", label: "", render: (d) => [room(d)], show: (d) => !!d.member },
  { key: "retro", label: "", render: (d) => [retro(d)], show: () => true },
];
const labelOf = (r: Route, d: StudyData) => r.label || ({ intro: d.tabs.story, homework: d.tabs.homework, makeup: d.tabs.makeup, room: d.tabs.room, retro: d.tabs.retro } as Record<string, string>)[r.key] || r.key;

let full: StudyData | null = null;
let data: StudyData;

function render(): void {
  const app = document.getElementById("app")!;
  const visible = routes.filter((r) => r.show(data));
  const want = location.hash.replace(/^#\//, "");
  const current = visible.find((r) => r.key === want) ?? visible[0];
  const parts: (HTMLElement | null)[] = [
    header(data),
    h("nav", { class: "kit-nav", "aria-label": "스터디 칸" }, ...visible.map((r) => h("a", { href: `#/${r.key}`, "aria-current": r === current ? "page" : null }, labelOf(r, data)))),
    h("main", { class: "kit-main" }, ...current.render(data).filter((x): x is HTMLElement => !!x)),
    !inDorms() && import.meta.env.DEV && full ? devBar() : null,
  ];
  app.replaceChildren(...parts.filter((x): x is HTMLElement => !!x));
}

/** 내 컴퓨터에서만 보이는 '보는 사람' 바꾸기. 도름스 안에서는 서버가 정한다. */
function devBar(): HTMLElement {
  const pick = (who: DevViewer) => { data = asViewer(full!, who); render(); };
  return h("div", { class: "kit-devbar", role: "group", "aria-label": "보는 사람(개발 중에만)" },
    h("span", null, "보는 사람"),
    h("button", { type: "button", onclick: () => pick("guest") }, "손님"),
    h("button", { type: "button", onclick: () => pick("member") }, "스터디원"),
    h("button", { type: "button", onclick: () => pick("leader") }, "리더"),
  );
}

loadData("leader").then((d) => {
  if (!inDorms()) full = d;
  data = inDorms() ? d : asViewer(d, "member");
  devLinks(d.site);
  addEventListener("hashchange", render);
  render();
}).catch(() => {
  document.getElementById("app")!.replaceChildren(h("p", { class: "kit-empty" }, "데이터를 불러오지 못했어요."));
});
