/**
 * 화면 조각을 만드는 작은 도구. 글자는 늘 텍스트 노드로 넣는다(innerHTML 을 쓰지 않는다).
 * 회원이 쓴 닉네임 · 글 · 후기가 코드로 실행되지 않게 하는 가장 중요한 규칙이다.
 */
type Child = Node | string | number | null | undefined | false | Child[];
type Props = Record<string, string | number | boolean | null | undefined | ((e: Event) => void)>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (typeof v === "function") { el.addEventListener(k.replace(/^on/, "").toLowerCase(), v as EventListener); continue; }
    if (k === "class") el.className = String(v);
    else if (k === "href") el.setAttribute("href", safeHref(String(v)));
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, children);
  return el;
}

function append(el: Element, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
}

/** 링크는 도름스 안 주소(/...)와 http(s) 만. 그 밖(javascript: 등)은 막는다. */
export function safeHref(v: string): string {
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#")) return v;
  try { const u = new URL(v); return u.protocol === "https:" || u.protocol === "http:" ? u.href : "#"; } catch { return "#"; }
}

/** 프로필 사진(없으면 닉네임 첫 글자). */
export function avatar(p: { name: string; avatar: string | null }, size = 32): HTMLElement {
  const name = p.name.replace(/^@/, "");
  if (p.avatar) return h("img", { class: "kit-avatar", src: p.avatar, alt: "", width: size, height: size, loading: "lazy" });
  return h("span", { class: "kit-avatar kit-avatar--letter", style: `width:${size}px;height:${size}px`, "aria-hidden": "true" }, Array.from(name)[0] ?? "선");
}

/** 사람 한 명: 사진 + 닉네임, 누르면 그 선생님 프로필. */
export function personLink(p: { name: string; avatar: string | null; href: string }, size = 28): HTMLElement {
  return h("a", { class: "kit-person", href: p.href }, avatar(p, size), h("span", null, p.name));
}

const ICON_PATHS = {
  calendar: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M15 4.1a3 3 0 0 1 0 5.8",
  pencil: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  chat: "M4 5h16v11H9l-5 4V5z",
  star: "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  play: "M8 5v14l11-7L8 5z",
} as const;
export type IconName = keyof typeof ICON_PATHS;

/** SVG 아이콘(이모지 대신). 색은 글자색을 따른다. */
export function icon(name: IconName, size = 18): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", ICON_PATHS[name]);
  svg.appendChild(path);
  return svg;
}

/** 날짜 · 시각(한국 시간). */
export function day(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00+09:00` : iso);
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(d);
}
export function time(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** 긴 글은 앞 문장만 보이고 '전체 보기'로 펼친다(말줄임표로 자르지 않는다). */
export function longText(text: string, keep = 140): HTMLElement {
  const box = h("div", { class: "kit-text" });
  if (text.length <= keep) { box.appendChild(h("p", null, text)); return box; }
  const cut = Math.max(text.lastIndexOf(". ", keep), text.lastIndexOf("요. ", keep), text.lastIndexOf("다. ", keep));
  const head = text.slice(0, cut > 40 ? cut + 2 : keep).trim();
  const p = h("p", null, head);
  const more = h("button", { type: "button", class: "kit-more" }, "전체 보기");
  more.addEventListener("click", () => { p.textContent = text; more.remove(); });
  box.append(p, more);
  return box;
}

export const empty = (text: string) => h("p", { class: "kit-empty" }, text);
