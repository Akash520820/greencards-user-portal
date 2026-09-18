import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // Covers .jsx too — this used to be ts/tsx only, which meant ESLint was
    // silently skipping almost the entire app (nearly everything here is
    // .jsx), including undefined-variable bugs like a missing useNavigate().
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    rules: {
      // Context files here intentionally co-locate a Provider component with
      // its useX() hook (a standard, common React pattern) — that only costs
      // a Fast Refresh full-reload in dev, it's not a correctness issue, so
      // don't fail lint over it.
      'react-refresh/only-export-components': 'warn',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
])
