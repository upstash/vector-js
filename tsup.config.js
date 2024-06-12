import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/platforms/nodejs.ts", "./src/platforms/cloudflare.ts"],
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  dts: true,
  minify: true,
});
