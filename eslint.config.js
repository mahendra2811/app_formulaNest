const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");
module.exports = defineConfig([
  expo,
  {
    ignores: [
      "dist/**",
      "dist-android/**",
      "test-results/**",
      "playwright-report/**",
      "web-build/**",
      "node_modules/**",
      "coverage/**",
    ],
  },
]);
