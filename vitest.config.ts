/// <reference types="vitest" />
import { defineConfig } from "vite";

// export default defineConfig({
//   test: {
//     typecheck: {
//       include: ["**/*.test-d.ts"],
//       exclude: ["examples/**"],
//       only: true,
//     },
//   },
// });
export default defineConfig({
  test: {
    typecheck: {
      include: ['src/**/*.ts', 'src/**/*.tsx', 'test/**/*.ts', 'test/**/*.tsx'],
      exclude: ['examples/**', '**/node_modules/**'],
      ignoreSourceErrors: true,
    },
  },
});