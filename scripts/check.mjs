#!/usr/bin/env node
// npm run check      : src 의 코드를 검사한다(만들기 전에).
// npm run build 끝에 : dist/index.html 을 검사한다(올리기 전에).
// 하나라도 걸리면 실패로 끝난다. 도름스도 올릴 때 같은 검사를 한 번 더 한다.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BANNED, EMOJI, MAX_BYTES } from "./rules.mjs";

const problems = [];
const srcMode = process.argv.includes("--src");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else if (/\.(ts|js|mjs|css|html)$/.test(name)) out.push(p);
  }
  return out;
}

function scanSource(file, text) {
  // 개발용 진입 줄(<script type="module" src="/src/main.ts">)은 빌드가 한 파일로 녹여 넣으니 검사에서 뺀다.
  if (file === "index.html") text = text.replace(/<script type="module" src="\/src\/[^"]+"><\/script>/g, "");
  for (const b of BANNED) if (b.re.test(text)) problems.push(`${file}: 도름스 안에서 쓸 수 없는 코드(${b.name})`);
  if (/\.innerHTML\s*=|insertAdjacentHTML|outerHTML\s*=|document\.write/.test(text)) problems.push(`${file}: innerHTML 류는 쓰지 않아요. 글은 textContent(또는 키트의 h())로 넣어요.`);
  if (/\beval\s*\(|new\s+Function\s*\(/.test(text)) problems.push(`${file}: eval · new Function 은 쓰지 않아요.`);
  if (EMOJI.test(text)) problems.push(`${file}: 이모지 대신 SVG 아이콘(키트의 icon())을 써요.`);
  if (/(?:background|background-color)\s*:\s*(?:#fff\b|#ffffff\b|white\b)/i.test(text)) problems.push(`${file}: 배경에 순백(#fff) 대신 아이보리(#FBF8F1) 같은 색을 써요.`);
  if (/—/.test(text)) problems.push(`${file}: 긴 줄표(—) 대신 쉼표 · 마침표 · 가운뎃점을 써요.`);
}

if (srcMode) {
  for (const f of [...walk("src"), "index.html"]) scanSource(f, readFileSync(f, "utf8"));
} else {
  const out = "dist/index.html";
  if (!existsSync(out)) { console.error("dist/index.html 이 없어요. npm run build 를 먼저 해 주세요."); process.exit(1); }
  const html = readFileSync(out, "utf8");
  const bytes = Buffer.byteLength(html, "utf8");
  if (bytes > MAX_BYTES) problems.push(`dist/index.html 이 ${(bytes / 1e6).toFixed(2)}MB 예요. 1.5MB 이하로 줄여 주세요(큰 사진은 데이터의 사진 주소를 써요).`);
  for (const b of BANNED) if (b.re.test(html)) problems.push(`dist/index.html: 도름스 안에서 쓸 수 없는 코드(${b.name})`);
  if (/<link[^>]+rel\s*=\s*["']?(?:stylesheet|modulepreload|preload)[^>]*href\s*=\s*["']?https?:/i.test(html)) problems.push("dist/index.html: 바깥 CSS · 파일을 불러와요. 스터디원 데이터가 실린 화면에서는 막혀요.");
  if (/sample\/data(?:\.sample)?\.json|"견본선생님/.test(html)) problems.push("dist/index.html: 견본 데이터가 결과에 섞였어요. 견본은 개발 중에만 읽어야 해요.");
  // 만든 파일을 다시 열어 보는 김에 src 도 함께 본다.
  for (const f of [...walk("src"), "index.html"]) scanSource(f, readFileSync(f, "utf8"));
}

if (problems.length) {
  console.error(`검사에서 ${problems.length}가지가 걸렸어요.`);
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log(srcMode ? "검사 통과(src)." : "검사 통과(dist/index.html). npm run submit 으로 검토를 요청할 수 있어요.");
