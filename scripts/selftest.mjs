#!/usr/bin/env node
// CI 자가 시험: 검사 규칙이 걸러야 할 것을 거르고, 예시 화면은 통과하는지.
import { BANNED } from "./rules.mjs";
const bad = ["fetch('/x')", "new XMLHttpRequest()", "new WebSocket('wss://a')", "navigator.sendBeacon('/x')", "window.open('x')", "window.location.href = 'x'", "location.assign('x')", "top.location", "<script src=\"https://cdn/x.js\"></script>", "<meta http-equiv=\"refresh\" content=\"0\">"];
const ok = ["const location = 'room';", "if (location.hash === '#/a') {}", "el.textContent = 'x';", "DORMS.action('apply')"];
let fail = 0;
for (const s of bad) if (!BANNED.some((b) => b.re.test(s))) { console.error(`안 걸림: ${s}`); fail++; }
for (const s of ok) if (BANNED.some((b) => b.re.test(s))) { console.error(`잘못 걸림: ${s}`); fail++; }
if (fail) process.exit(1);
console.log("selftest 통과");
