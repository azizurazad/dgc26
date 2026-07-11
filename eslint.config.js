import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react: reactPlugin
    },
    rules: {
      "react/jsx-key": "error"
    }
  }
];
