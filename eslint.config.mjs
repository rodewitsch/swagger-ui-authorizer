import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"], languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        'SwaggerUIAuthorizerModule': true,
        'SwaggerUIAuthorizationStore': true,
      }, sourceType: "script"
    }
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];