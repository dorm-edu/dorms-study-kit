// 도름스가 올리기 전에 거르는 코드 목록(도름스 src/lib/studyDesign.ts 의 STUDY_DESIGN_BANNED 와 같다).
// 도름스 안에서 막히거나(망 요청) 화면을 내리게 하는(저절로 이동) 코드다.
export const MAX_BYTES = 1_500_000;
export const BANNED = [
  { name: "fetch", re: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", re: /\bXMLHttpRequest\b/ },
  { name: "WebSocket", re: /\bWebSocket\s*\(/ },
  { name: "EventSource", re: /\bEventSource\s*\(/ },
  { name: "sendBeacon", re: /\bsendBeacon\s*\(/ },
  { name: "window.open", re: /\bwindow\.open\s*\(/ },
  { name: "location 바꾸기", re: /\b(?:window|document|top|parent|self)\.location\s*(?:\.href\s*)?=(?!=)|\blocation\.href\s*=(?!=)|\blocation\.(?:assign|replace)\s*\(/ },
  { name: "top · parent 문서", re: /\b(?:top|parent)\.(?:document|location)\b/ },
  { name: "외부 스크립트", re: /<script[^>]+\bsrc\s*=/i },
  { name: "meta refresh", re: /<meta[^>]+http-equiv\s*=\s*["']?refresh/i },
];
export const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;
