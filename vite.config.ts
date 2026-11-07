import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// 결과는 dist/index.html 한 파일(CSS · JS 를 모두 안에 담는다). 도름스가 이 파일 하나를 받아 격리된 칸에 싣는다.
export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: { target: "es2020", assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false, reportCompressedSize: false },
  server: { port: 5178 },
});
