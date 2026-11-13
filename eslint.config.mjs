import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {ignores:['**/node_modules/**','**/dist/**','**/lib/**','.local/**','.firebase/**']},
  {...js.configs.recommended,files:['**/*.{js,cjs,mjs}'],languageOptions:{globals:globals.node}},
  ...tseslint.configs.recommended.map(config=>({...config,files:['**/*.{ts,tsx}']})),
  {
    files:['**/*.{ts,tsx}'],
    languageOptions:{globals:{...globals.node,...globals.browser}},
    rules:{
      // TypeScript's strict check is authoritative for unresolved names.
      'no-undef':'off',
      // Existing boundary types are tracked in DEBT-010; do not hide new lint defects.
      '@typescript-eslint/no-explicit-any':'off',
      '@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]
    }
  },
  {files:['**/*.{js,cjs,mjs}'],rules:{'no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}}
];
