import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/platforms/nodejs.ts", "./src/platforms/cloudflare.ts"],
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
});
