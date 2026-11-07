// 출입증 · 도름스 주소 읽기. 출입증은 화면에 찍지 않는다.
export function ticket() {
  const t = (process.env.DORMS_STUDY_TICKET ?? "").trim();
  if (!/^dsk1\.[A-Za-z0-9_-]{20,400}\.[A-Za-z0-9_-]{43}$/.test(t)) {
    console.error("출입증이 없어요. 내 AI 에게 도름스 MCP 의 get_study_kit_ticket 으로 받아 DORMS_STUDY_TICKET 으로 넘겨 달라고 해 주세요.");
    process.exit(1);
  }
  return t;
}
export function site() {
  const s = (process.env.DORMS_SITE ?? "https://dorms.school").replace(/\/+$/, "");
  const u = new URL(s);
  const local = u.protocol === "http:" && /^(127\.0\.0\.1|localhost)$/.test(u.hostname);
  if (u.protocol !== "https:" && !local) { console.error("DORMS_SITE 는 https 주소여야 해요."); process.exit(1); }
  if (!local && !/^(www\.)?dorms\.school$/.test(u.hostname)) { console.error("DORMS_SITE 는 도름스 주소(dorms.school)여야 해요. 출입증을 다른 곳에 보내지 않아요."); process.exit(1); }
  return u.origin;
}
