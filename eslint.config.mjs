import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
export default tseslint.config(
 { ignores: ['node_modules/**', '.next/**', '.astro/**', 'dist/**', 'ui_sample/**', '.worktrees/**', 'next-env.d.ts'] },
 ...tseslint.configs.recommended,
 ...astro.configs.recommended,
)
