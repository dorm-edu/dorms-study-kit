/**
 * 도름스가 window.DORMS_DATA 로 넣어 주는 데이터의 모양(판 4). 도름스 src/lib/studySiteData.ts 와 같은 모양이다.
 *
 * 보는 사람마다 서버가 자기 몫만 넣는다. 받은 단계 밖의 칸은 null 이다.
 *   member  확정 · 완주 스터디원 · 멘토 · 리더 · 운영자
 *   self    로그인한 사람(내 상태)
 *   leader  리더 · 운영자(신청자 · 설문 답)
 * 손님에게는 member · self · leader 가 모두 null 이다. 그때 보일 화면도 꼭 만든다.
 */
export type Tier = "public" | "member" | "self" | "leader";
export type Person = { name: string; avatar: string | null; href: string };
export type AppRef = { name: string; tagline: string | null; image: string | null; href: string };
export type Status = "applied" | "member" | "completed" | "left";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type StudyData = {
  version: number;
  site: string;
  viewer: { tiers: Tier[]; signedIn: boolean; me: Person | null };
  tabs: { story: string; retro: string; room: string; homework: string; makeup: string };
  study: {
    program: string; title: string; summary: string | null; status: string; statusLabel: string;
    weeks: number; startsOn: string | null; endsOn: string | null; href: string;
    leader: Person | null; mentors: Person[];
    counts: { members: number; completed: number; apps: number; feedbacks: number };
    story: { applied: number | null; started: number; completed: number; rate: number | null } | null;
    makesApps: boolean;
    kind: "vibe" | "study";
  };
  guide: { text: string; images: string[] };
  curriculum: { title: string | null; rounds: { id: string; round: number; title: string; startsAt: string; week: number; state: "upcoming" | "past"; host: Person | null; href: string }[] };
  sessions: { title: string; startsAt: string; week: number; host: Person | null; attended: number | null; href: string }[];
  completers: {
    person: Person; level: string | null; goal: string | null; app: AppRef | null;
    review: string | null; reviewAt: string | null; completedAt: string | null;
    weeksPosted: number[]; feedbackGiven: number; feedbackReceived: number; storyHref: string;
  }[];
  works: { kind: "homework" | "makeup"; title: string; items: { person: Person; text: string; images: string[]; app: AppRef | null }[] }[];
  member: null | {
    roster: { person: Person; status: "member" | "completed"; weeksPosted: number[]; attend: number; makeup: number; homework: { done: number; total: number }; completedAt: string | null }[];
    homeworks: { id: string; title: string; kind: "write" | "app"; dueAt: string | null; required: boolean; guide: string }[];
    makeups: { taskId: string; sessionId: string; sessionTitle: string; startsAt: string; dueAt: string | null; guide: string }[];
    works: { kind: "homework" | "makeup"; refId: string; title: string; person: Person; text: string; images: string[]; app: AppRef | null }[];
    room: { id: string; week: number; person: Person; note: string; link: string | null; updatedAt: string; feedbacks: { person: Person; text: string; createdAt: string }[] }[];
  };
  self: null | {
    person: Person; status: Status | null; attend: number | null; weeksPosted: number[];
    homework: { homeworkId: string; status: ReviewStatus }[];
    makeup: { taskId: string; status: ReviewStatus }[];
  };
  leader: null | {
    applicants: { person: Person; appliedAt: string }[];
    survey: { columns: { id: string; title: string }[]; rows: { person: Person; answers: Record<string, string | string[]> }[] } | null;
  };
};

/** 도름스 도구(누르면 도름스 창이 뜬다). 꾸민 화면은 이름과 번호만 보낸다. */
export type Action =
  | { name: "apply" }
  | { name: "homework.submit"; homeworkId: string }
  | { name: "makeup.submit"; taskId: string }
  | { name: "room.write"; week: number }
  | { name: "room.feedback"; postId: string }
  | { name: "session.enter"; sessionId: string };
