import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['node_modules', '**/node_modules/**', 'dist', '**/dist/**', '.swc', '**/.swc/**'],
  formatters: true,
  typescript: true,
  react: true,
})
