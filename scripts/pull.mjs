#!/usr/bin/env node
// npm run pull : 도름스에서 우리 기수의 견본 데이터를 받아 sample/data.json 에 둔다.
// 공개 칸은 실제 값, 스터디원 · 본인 · 리더 칸은 같은 모양의 가짜다(회원 글이 내 컴퓨터로 오지 않게).
import { mkdirSync, writeFileSync } from "node:fs";
import { site, ticket } from "./env.mjs";

const res = await fetch(`${site()}/api/study/kit/data`, { headers: { Authorization: `Bearer ${ticket()}` } });
const body = await res.text();
if (!res.ok) {
  let msg = body;
  try { msg = JSON.parse(body).error ?? body; } catch {}
  console.error(`견본을 받지 못했어요(${res.status}): ${msg}`);
  process.exit(1);
}
const data = JSON.parse(body);
mkdirSync("sample", { recursive: true });
writeFileSync("sample/data.json", JSON.stringify(data, null, 2) + "\n");
console.log(`sample/data.json 을 만들었어요. 「${data.study?.program ?? ""} ${data.study?.title ?? ""}」 견본(판 ${data.version}). npm run dev 로 띄워 보세요.`);
