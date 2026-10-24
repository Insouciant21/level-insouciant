import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
export default tseslint.config(
 { ignores: ['node_modules/**', '.astro/**', 'dist/**', '.worktrees/**'] },
 ...tseslint.configs.recommended,
 ...astro.configs.recommended,
)
