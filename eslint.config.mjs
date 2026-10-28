import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import pluginSecurity from "eslint-plugin-security";

export default defineConfig([
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "out/**",
      "coverage/**",
      "public/sw.js",
      "scripts/**",
    ],
  },
  ...next,
  pluginSecurity.configs.recommended,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "error",
      "@next/next/no-img-element": "warn",
      "security/detect-object-injection": "off", // Often false positives with standard object property lookups in TS
    },
  },
]);
