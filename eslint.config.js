import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "@typescript-eslint/no-explicit-any": "off",
  },
  linterOptions: {
    reportUnusedDisableDirectives: "off",
  },
});
