import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  plugins: ['@tarojs/plugin-mock'],
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: process.env.TARO_APP_API,
          changeOrigin: true,
          pathRewrite: { '^/api': '' },
        },
      },
    },
  },
} satisfies UserConfigExport
