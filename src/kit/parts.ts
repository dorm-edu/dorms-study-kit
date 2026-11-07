/**
 * 키트 부품. 그대로 써도 되고, 고쳐 쓰거나 직접 그려도 된다. 부품마다 '받은 칸이 없을 때' 화면을 갖고 있다.
 * 쓰기(신청 · 숙제 · 대체 과제 · 피드백 · 입장)는 action(...) 단추로만 한다. 누르면 도름스 창이 뜬다.
 */
import type { StudyData } from "./types";
import { action } from "./dorms";
import { avatar, day, empty, h, icon, longText, personLink, time } from "./ui";

const STATUS_LABEL: Record<string, string> = { pending: "검토 중", approved: "인정됨", rejected: "다시 내기" };
const locked = (text: string) => h("div", { class: "kit-locked" }, icon("lock"), h("p", null, text));

/** 머리: 스터디 이름 · 상태 · 리더와 멘토 · 신청 단추. */
export function header(d: StudyData): HTMLElement {
  const s = d.study;
  const canApply = s.status === "recruiting";
  return h("header", { class: "kit-head" },
    h("p", { class: "kit-kicker" }, `${s.kind === "study" ? "공부 모임" : "스터디"} · ${s.statusLabel}`),
    h("h1", null, `${s.program} ${s.title}`.trim()),
    s.summary ? h("p", { class: "kit-lede" }, s.summary) : null,
    h("div", { class: "kit-people" },
      s.leader ? h("span", { class: "kit-role" }, h("b", null, "리더"), personLink(s.leader)) : null,
      s.mentors.length ? h("span", { class: "kit-role" }, h("b", null, "멘토"), ...s.mentors.map((m) => personLink(m))) : null,
    ),
    h("div", { class: "kit-stats" },
      stat("주", s.weeks), stat("스터디원", s.counts.members), stat("완주", s.counts.completed), s.makesApps ? stat("올린 앱", s.counts.apps) : null,
    ),
    canApply ? h("button", { type: "button", class: "kit-btn kit-btn--primary", onclick: () => action({ name: "apply" }) }, "신청하기") : null,
  );
}
const stat = (label: string, n: number) => h("span", { class: "kit-stat" }, h("b", null, n.toLocaleString("ko-KR")), h("span", null, label));

/** 리더가 쓴 안내 글. */
export function guide(d: StudyData): HTMLElement {
  return h("section", { class: "kit-card" }, h("h2", null, "안내"),
    d.guide.text ? longText(d.guide.text, 400) : empty("아직 안내 글이 없어요."),
    d.guide.images.length ? h("div", { class: "kit-images" }, ...d.guide.images.map((src) => h("img", { src, alt: "", loading: "lazy" }))) : null,
  );
}

/** 커리큘럼과 회차(연수 일정에서 올린 강의). 다가오는 회차에는 입장 단추. */
export function curriculum(d: StudyData): HTMLElement {
  const rounds = d.curriculum.rounds;
  return h("section", { class: "kit-card" },
    h("h2", null, icon("calendar"), d.curriculum.title ?? `${d.study.weeks}주 커리큘럼`),
    rounds.length ? h("ol", { class: "kit-rounds" }, ...rounds.map((r) => h("li", { class: "kit-round", "data-state": r.state },
      h("span", { class: "kit-round-no" }, `${r.round}회`),
      h("div", { class: "kit-round-body" },
        h("a", { href: r.href }, r.title),
        h("span", { class: "kit-meta" }, `${time(r.startsAt)} · ${r.week}주차`, r.host ? ` · ${r.host.name}` : ""),
      ),
      r.state === "upcoming" ? h("button", { type: "button", class: "kit-btn", onclick: () => action({ name: "session.enter", sessionId: r.id }) }, icon("play", 14), "입장") : h("span", { class: "kit-done" }, "지난 회차"),
    ))) : empty("아직 이어진 회차가 없어요."),
  );
}

/** 스터디원 명단과 진도(스터디원에게만). */
export function roster(d: StudyData): HTMLElement {
  if (!d.member) return h("section", { class: "kit-card" }, h("h2", null, icon("users"), "함께하는 선생님"), locked("이 기수 스터디원에게만 보여요."));
  const weeks = Array.from({ length: d.study.weeks }, (_, i) => i + 1);
  return h("section", { class: "kit-card" },
    h("h2", null, icon("users"), "함께하는 선생님", h("span", { class: "kit-count" }, String(d.member.roster.length))),
    d.member.roster.length ? h("ul", { class: "kit-roster" }, ...d.member.roster.map((r) => h("li", null,
      personLink(r.person),
      h("span", { class: "kit-weeks", "aria-label": `기록한 주차 ${r.weeksPosted.join(", ") || "없음"}` }, ...weeks.map((w) => h("i", { "data-on": r.weeksPosted.includes(w) ? "1" : "0" }))),
      h("span", { class: "kit-meta" }, `출석 ${r.attend}번${r.makeup ? `(대체 ${r.makeup})` : ""}`, r.homework.total ? ` · 숙제 ${r.homework.done}/${r.homework.total}` : "", r.status === "completed" ? " · 완주" : ""),
    ))) : empty("아직 스터디원이 없어요."),
  );
}

/** 숙제 목록. 스터디원은 내 상태와 '숙제 내기' 단추를 본다. */
export function homework(d: StudyData): HTMLElement {
  const title = d.tabs.homework;
  if (!d.member) return h("section", { class: "kit-card" }, h("h2", null, icon("pencil"), title), locked("숙제는 이 기수 스터디원에게 보여요."));
  const mine = new Map((d.self?.homework ?? []).map((x) => [x.homeworkId, x.status]));
  const canSubmit = d.self?.status === "member";
  return h("section", { class: "kit-card" },
    h("h2", null, icon("pencil"), title),
    d.member.homeworks.length ? h("ul", { class: "kit-tasks" }, ...d.member.homeworks.map((hw) => {
      const st = mine.get(hw.id);
      return h("li", null,
        h("div", { class: "kit-task-head" }, h("b", null, hw.title), hw.required ? h("span", { class: "kit-chip" }, "완주에 필요") : null, st ? h("span", { class: "kit-chip", "data-status": st }, STATUS_LABEL[st]) : null),
        hw.guide ? longText(hw.guide) : null,
        h("span", { class: "kit-meta" }, hw.dueAt ? `${day(hw.dueAt)}까지` : "기한 없음", hw.kind === "app" ? " · 앱으로 내기" : ""),
        canSubmit ? h("button", { type: "button", class: "kit-btn", onclick: () => action({ name: "homework.submit", homeworkId: hw.id }) }, st ? "다시 보기 · 고치기" : "숙제 내기") : null,
      );
    })) : empty("아직 숙제가 없어요."),
  );
}

/** 대체 과제(라이브 회차를 놓쳤을 때). */
export function makeup(d: StudyData): HTMLElement {
  const title = d.tabs.makeup;
  if (!d.member) return h("section", { class: "kit-card" }, h("h2", null, title), locked("대체 과제는 이 기수 스터디원에게 보여요."));
  const mine = new Map((d.self?.makeup ?? []).map((x) => [x.taskId, x.status]));
  const canSubmit = d.self?.status === "member";
  return h("section", { class: "kit-card" },
    h("h2", null, title),
    d.member.makeups.length ? h("ul", { class: "kit-tasks" }, ...d.member.makeups.map((m) => {
      const st = mine.get(m.taskId);
      return h("li", null,
        h("div", { class: "kit-task-head" }, h("b", null, `${m.sessionTitle} 대체 과제`), st ? h("span", { class: "kit-chip", "data-status": st }, STATUS_LABEL[st]) : null),
        m.guide ? longText(m.guide) : null,
        h("span", { class: "kit-meta" }, m.dueAt ? `${day(m.dueAt)}까지` : "기한 없음"),
        canSubmit ? h("button", { type: "button", class: "kit-btn", onclick: () => action({ name: "makeup.submit", taskId: m.taskId }) }, st ? "다시 보기 · 고치기" : "대체 과제 내기") : null,
      );
    })) : empty("아직 대체 과제가 없어요."),
  );
}

/** 피드백 방: 주차마다 기록과 피드백. */
export function room(d: StudyData): HTMLElement {
  const title = d.tabs.room;
  if (!d.member) return h("section", { class: "kit-card" }, h("h2", null, icon("chat"), title), locked("피드백 방은 이 기수 스터디원에게 보여요."));
  const canWrite = d.self?.status === "member" || d.self?.status === "completed";
  const weeks = Array.from({ length: d.study.weeks }, (_, i) => i + 1);
  return h("section", { class: "kit-card" },
    h("h2", null, icon("chat"), title),
    ...weeks.map((w) => {
      const posts = d.member!.room.filter((p) => p.week === w);
      return h("div", { class: "kit-week" },
        h("div", { class: "kit-week-head" }, h("b", null, `${w}주차`), canWrite ? h("button", { type: "button", class: "kit-btn", onclick: () => action({ name: "room.write", week: w }) }, "기록 쓰기") : null),
        posts.length ? h("ul", { class: "kit-posts" }, ...posts.map((p) => h("li", null,
          personLink(p.person),
          p.note ? longText(p.note) : null,
          // 도름스 밖 주소는 도름스 안에서 눌러도 열리지 않으니 글자로 보여 준다.
          p.link ? h("span", { class: "kit-meta kit-url" }, p.link) : null,
          p.feedbacks.length ? h("ul", { class: "kit-feedbacks" }, ...p.feedbacks.map((f) => h("li", null, avatar(f.person, 20), h("b", null, f.person.name), h("span", null, f.text)))) : null,
          canWrite ? h("button", { type: "button", class: "kit-btn kit-btn--quiet", onclick: () => action({ name: "room.feedback", postId: p.id }) }, "피드백 남기기") : null,
        ))) : empty("아직 이 주차 기록이 없어요."),
      );
    }),
  );
}

/** 돌아보기(결과 공유): 완주한 선생님 · 앱 · 공개 후기 · 함께 해낸 숙제. 공개 값이라 손님도 본다. */
export function retro(d: StudyData): HTMLElement {
  const works = d.member ? d.member.works : d.works.flatMap((w) => w.items.map((it) => ({ title: w.title, ...it })));
  return h("section", { class: "kit-card" },
    h("h2", null, icon("star"), d.tabs.retro),
    d.study.story ? h("p", { class: "kit-lede" }, `${d.study.story.started}명이 출발해 ${d.study.story.completed}명이 완주했어요.`) : null,
    d.completers.length ? h("ul", { class: "kit-completers" }, ...d.completers.map((c) => h("li", null,
      personLink(c.person, 36),
      c.app ? h("a", { class: "kit-app", href: c.app.href }, c.app.image ? h("img", { src: c.app.image, alt: "", loading: "lazy" }) : null, h("b", null, c.app.name), c.app.tagline ? h("span", null, c.app.tagline) : null) : null,
      c.review ? longText(c.review) : null,
      h("a", { class: "kit-link", href: c.storyHref }, "이 선생님 이야기"),
    ))) : empty("아직 완주한 선생님이 없어요."),
    h("h3", null, "함께 해낸 숙제"),
    works.length ? h("ul", { class: "kit-works" }, ...works.map((w) => h("li", null,
      h("span", { class: "kit-meta" }, w.title), personLink(w.person), w.text ? longText(w.text) : null,
      w.images.length ? h("div", { class: "kit-images" }, ...w.images.map((src) => h("img", { src, alt: "", loading: "lazy" }))) : null,
      w.app ? h("a", { class: "kit-app", href: w.app.href }, h("b", null, w.app.name)) : null,
    ))) : empty("아직 함께 해낸 숙제가 없어요."),
  );
}

/** 리더에게만: 확정 전 신청자와 신청 설문 답. */
export function leaderPanel(d: StudyData): HTMLElement | null {
  if (!d.leader) return null;
  const sv = d.leader.survey;
  return h("section", { class: "kit-card kit-card--leader" },
    h("h2", null, "리더에게만 보여요"),
    h("h3", null, `확정 전 신청자 ${d.leader.applicants.length}명`),
    d.leader.applicants.length ? h("ul", { class: "kit-roster" }, ...d.leader.applicants.map((a) => h("li", null, personLink(a.person), h("span", { class: "kit-meta" }, `${day(a.appliedAt)} 신청`)))) : empty("기다리는 신청자가 없어요."),
    sv && sv.rows.length ? h("div", { class: "kit-survey" }, h("h3", null, "신청 설문 답"), ...sv.rows.map((r) => h("div", { class: "kit-survey-row" },
      personLink(r.person),
      ...sv.columns.map((c) => { const v = r.answers[c.id]; return v ? h("p", null, h("b", null, c.title), " ", Array.isArray(v) ? v.join(", ") : v) : null; }),
    ))) : null,
  );
}
