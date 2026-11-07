#!/usr/bin/env node
// npm run submit -- --note "운영자에게 남길 말"
// dist/index.html 을 도름스에 올려 검토를 요청한다. 운영자가 미리 보고 승인하면 기수 화면 전체가 이 디자인으로 바뀐다.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { site, ticket } from "./env.mjs";

const t = ticket();
const base = site();
if (!existsSync("dist/index.html")) { console.error("dist/index.html 이 없어요. npm run build 를 먼저 해 주세요."); process.exit(1); }
try { execFileSync(process.execPath, ["scripts/check.mjs"], { stdio: "inherit" }); } catch { process.exit(1); }
const i = process.argv.indexOf("--note");
const note = i > 0 ? String(process.argv[i + 1] ?? "").slice(0, 500) : "";
const kitVersion = `v${JSON.parse(readFileSync("package.json", "utf8")).version}`;
const html = readFileSync("dist/index.html", "utf8");
const res = await fetch(`${base}/api/study/kit/upload`, {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ html, note, kitVersion }),
});
const body = await res.json().catch(() => ({}));
if (!res.ok || !body.ok) { console.error(`올리지 못했어요(${res.status}): ${body.error ?? "알 수 없는 오류"}`); process.exit(1); }
console.log(`검토를 요청했어요. 운영자가 미리 보고 승인하면 기수 화면 전체가 이 디자인으로 바뀌어요.\n검토 화면: ${body.review}`);
